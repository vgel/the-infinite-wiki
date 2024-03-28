import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as ai from "ai/react";
import { useRouter } from "next/navigation";
import { useRef } from "react";

import { Article, parseArticle } from "./parser";
import { slugify } from "./util";

export interface ApiKeyState {
  apiKey: string | null;
  setApiKey: (apiKey: string | null) => void;
}

export const useApiKeyStore = create<ApiKeyState>()(
  persist(
    (set) => ({
      apiKey: null,
      setApiKey: (apiKey) => set((state) => ({ ...state, apiKey })),
    }),
    {
      name: "api-key-storage",
      partialize: (state) => Object.fromEntries(Object.entries(state).filter(([key]) => key !== "setApiKey")),
      merge(persistedState, currentState) {
        const apiKey = currentState.apiKey ?? ((persistedState as any) ?? {})["apiKey"] ?? null;
        return {
          apiKey,
          setApiKey: currentState.setApiKey,
        };
      },
    }
  )
);

export interface PageState {
  pages: Record<string, Article>;
  addPage: (slug: string, article: Article) => void;
  clearPages: () => void;
}

export const usePageStore = create<PageState>()(
  persist(
    (set) => ({
      pages: {},
      addPage: (slug, article) =>
        set((state) => ({
          ...state,
          pages: {
            ...state.pages,
            [slug]: article,
          },
        })),
      clearPages: () =>
        set((state) => ({
          ...state,
          pages: {},
        })),
    }),
    {
      name: "page-storage",
      partialize: (state) =>
        Object.fromEntries(Object.entries(state).filter(([key]) => key !== "addPage" && key !== "clearPage")),
      merge: (persistedState, currentState) => ({
        addPage: currentState.addPage,
        clearPages: currentState.clearPages,
        pages: {
          ...(((persistedState as any) ?? {})["pages"] ?? {}),
          ...currentState.pages,
        },
      }),
    }
  )
);

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface ChatState {
  messages: Message[];
  addMessage: (message: Message) => void;
  clearMessages: () => void;
}

export interface UseChat {
  messages: Message[];
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  stop: () => void;
  isLoading: boolean;
  setSeed: (title: string, text: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      addMessage: (message) =>
        set((state) => {
          return { ...state, messages: [...state.messages, message] };
        }),
      clearMessages: () => set((state) => ({ ...state, messages: [] })),
    }),
    {
      name: "message-storage",
      partialize: (state) =>
        Object.fromEntries(Object.entries(state).filter(([key]) => key !== "addMessage" && key !== "clearMessages")),
    }
  )
);

export const usePage = (slug: string): { page: Article; isLoading: boolean } => {
  const { apiKey } = useApiKeyStore();
  const { pages, addPage } = usePageStore();
  const { messages, addMessage } = useChatStore();
  // hack because useChat doesn't update isLoading right away
  const inFlightRequest = useRef<string | null>(null);

  const chat = ai.useChat({
    headers: apiKey
      ? {
          Authorization: apiKey,
        }
      : undefined,
  });

  const userMessageId = `user-create-${slug}`;
  console.log("usePage", slug, ":", {
    hasOwnProp: pages.hasOwnProperty(slug),
    isLoading: chat.isLoading,
    error: chat.error,
    messages: chat.messages,
    userMessageId,
    apiKey,
    inFlightRequest: inFlightRequest.current,
  });
  if (pages.hasOwnProperty(slug)) {
    return { page: pages[slug], isLoading: false };
  } else if (chat.isLoading) {
    if (chat.messages.length === 0 || chat.messages[chat.messages.length - 1].role !== "assistant") {
      return { page: { title: "", paragraphs: [] }, isLoading: true };
    }
    const page = parseArticle(chat.messages[chat.messages.length - 1].content);
    return { page, isLoading: true };
  } else if (chat.error) {
    inFlightRequest.current = null;
    return makeErrorReturn(`${chat.error.name}: ${chat.error.message}`);
  } else if (chat.messages.length >= 2 && chat.messages[chat.messages.length - 2].id === userMessageId) {
    // we're not loading because we just finished generating
    // add the user & assistant messages to the history and save the page
    const userMessage = chat.messages[chat.messages.length - 2];
    const asstMessage = chat.messages[chat.messages.length - 1];
    const page = parseArticle(asstMessage.content);
    if (page.paragraphs.length > 0) {
      // assuming it's well-formed, that is
      addMessage({
        id: userMessage.id,
        role: "user",
        content: userMessage.content,
      });
      addMessage({
        id: asstMessage.id,
        role: "assistant",
        content: asstMessage.content,
      });
      addPage(slug, page);
      return { page, isLoading: false };
    } else {
      // TODO lol
      return makeErrorReturn(asstMessage.content);
    }
  } else {
    if (apiKey && inFlightRequest.current !== slug) {
      inFlightRequest.current = slug;
      console.log("making request for", slug);
      const userMessage: Message = {
        id: userMessageId,
        role: "user",
        content: `<click> page:${slug} </click>`,
      };
      chat.setMessages([...messages, userMessage]);
      chat.reload();
    }
    return { page: { title: "", paragraphs: [] }, isLoading: true };
  }
};

function makeErrorReturn(error: string): { page: Article; isLoading: boolean } {
  return {
    page: {
      title: "Error",
      paragraphs: [
        { parts: [{ type: "italic", display: "Please reload the page or try a different one." }] },
        { parts: [""] },
        { parts: [error] },
      ],
    },
    isLoading: false,
  };
}

export const useReset = (): (() => void) => {
  const { clearMessages } = useChatStore();
  const { clearPages } = usePageStore();
  return () => {
    clearMessages();
    clearPages();
  };
};

export const useSetSeed = (): ((text: string) => void) => {
  const { clearMessages, addMessage } = useChatStore();
  const { addPage } = usePageStore();
  const router = useRouter();

  return (text) => {
    const article = parseArticle(text);
    clearMessages();
    const slug = slugify(article.title);
    addMessage({
      id: `example-user-create-${slug}`,
      role: "user",
      content: `<click> page:${slug} </click>`,
    });
    addMessage({
      id: `example-asst-response`,
      role: "assistant",
      content: text,
    });
    addPage(slug, article);
    router.push(`/wiki/${slug}`);
  };
};
