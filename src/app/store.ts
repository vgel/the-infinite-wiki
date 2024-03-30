import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as ai from "ai/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
  removePage: (slug: string) => void;
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
      removePage: (slug) =>
        set((state) => ({
          ...state,
          pages: Object.fromEntries(Object.entries(state.pages).filter(([key]) => key !== slug)),
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
        removePage: currentState.removePage,
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
  addMessages: (messages: Message[]) => void;
  removeMessages: (ids: string[]) => void;
  clearMessages: () => void;
}

export interface UseChat {
  messages: Message[];
  addMessages: (messages: Message[]) => void;
  clearMessages: () => void;
  stop: () => void;
  isLoading: boolean;
  setSeed: (title: string, text: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      addMessages: (messages) =>
        set((state) => {
          return { ...state, messages: [...state.messages, ...messages] };
        }),
      removeMessages: (ids) =>
        set((state) => {
          return { ...state, messages: state.messages.filter((m) => !ids.includes(m.id)) };
        }),
      clearMessages: () => set((state) => ({ ...state, messages: [] })),
    }),
    {
      name: "message-storage",
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => key !== "addMessage" && key !== "clearMessages" && key !== "removeMessage"
          )
        ),
    }
  )
);

function userMessageId(slug: string): string {
  return `user-create-${slug}`;
}

export const usePage = (
  slug: string
): { page: Article; isLoading: boolean; regeneratePage: () => void; editPage: (editSummary: string) => void } => {
  const { apiKey } = useApiKeyStore();
  const { pages, addPage, removePage } = usePageStore();
  const { messages, addMessages, removeMessages } = useChatStore();
  const chat = ai.useChat({
    id: "wikichat",
  });

  const hasPageForSlug = pages.hasOwnProperty(slug);
  const userMessageIdForSlug = userMessageId(slug);

  const regeneratePage = () => {
    if (chat.isLoading) {
      chat.stop();
    }
    chat.setMessages([]);
    removePage(slug);
    const userMessageIdx = messages.findIndex((m) => m.id === userMessageIdForSlug);
    if (userMessageIdx >= 0) {
      const userMessage = messages[userMessageIdx];
      const assistantMessage = messages[userMessageIdx + 1];
      if (assistantMessage) {
        removeMessages([userMessage.id, assistantMessage.id]);
      } else {
        removeMessages([userMessage.id]);
      }
    }
  };

  const editPage = (editSummary: string) => {
    if (chat.isLoading) {
      chat.stop();
    }
    chat.setMessages([]);
    removePage(slug);
    const userMessageIdx = messages.findIndex((m) => m.id === userMessageIdForSlug);
    if (userMessageIdx >= 0) {
      const userMessage = messages[userMessageIdx];
      const assistantMessage = messages[userMessageIdx + 1] ?? {
        id: "placeholder-message",
        content:
          "<error> Previous version not available, please use your best judgement to generate the new page. </error>",
      };
      removeMessages([userMessage.id, assistantMessage.id]);
      addMessages([
        {
          id: `edit-${userMessage.id}`,
          role: "user",
          content: userMessage.content,
        },
        {
          id: `edit-${assistantMessage.id}`,
          role: "assistant",
          content: assistantMessage.content,
        },
        {
          id: `edit-request-${slug}`,
          role: "user",
          content: `<edit_target> page:${slug} </edit_target>
<edit_summary> ${editSummary} </edit_summary>`,
        },
        {
          id: `edit-confirm-${slug}`,
          role: "assistant",
          content: "<ooc> *This message was inserted by the system.* </ooc> <confirm> Edit saved. </confirm>",
        },
      ]);
    }
  };

  // useEffect for finalizing the assistant response
  const penultimateMessage = chat.messages[chat.messages.length - 2];
  const ultimateMessage = chat.messages[chat.messages.length - 1];
  useEffect(() => {
    if (chat.isLoading || hasPageForSlug) {
      return;
    } else if (!chat.isLoading && !hasPageForSlug && penultimateMessage?.id === userMessageIdForSlug) {
      // we're not loading because we just finished generating
      // add the user & assistant messages to the history and save the page
      const page = parseArticle(ultimateMessage.content);
      if (page.paragraphs.length > 0) {
        // assuming it's well-formed, that is
        addMessages([
          {
            id: penultimateMessage.id,
            role: "user",
            content: penultimateMessage.content,
          },
          {
            id: ultimateMessage.id,
            role: "assistant",
            content: ultimateMessage.content,
          },
        ]);
        addPage(slug, page);
      }
    }
  }, [
    addMessages,
    addPage,
    chat,
    messages,
    chat.isLoading,
    userMessageIdForSlug,
    slug,
    penultimateMessage?.id,
    penultimateMessage?.content,
    ultimateMessage?.content,
    ultimateMessage?.id,
    hasPageForSlug,
  ]);

  if (hasPageForSlug) {
    return { page: pages[slug], isLoading: false, regeneratePage, editPage };
  } else if (chat.isLoading) {
    if (chat.messages.length === 0 || chat.messages[chat.messages.length - 1].role !== "assistant") {
      return { page: { title: "", paragraphs: [] }, isLoading: true, regeneratePage, editPage };
    }
    const page = parseArticle(chat.messages[chat.messages.length - 1].content);
    return { page, isLoading: true, regeneratePage, editPage };
  } else if (chat.error) {
    return { ...makeErrorReturn(`${chat.error.name}: ${chat.error.message}`), regeneratePage, editPage };
  } else {
    if (apiKey && !chat.messages.some((m) => m.id === userMessageIdForSlug)) {
      // only attempt the request if the API key is ready
      // (might take a tick to pop in because of zustand hydration)
      const userMessage: Message = {
        id: userMessageIdForSlug,
        role: "user",
        content: `<click> page:${slug} </click>`,
      };
      // despite the name, these actually just update refs, so they're safe to
      // call outside useEffect--in fact, we must, to immediately update the
      // isLoading state
      chat.setMessages([...messages, userMessage]);
      chat.reload({
        options: {
          headers: {
            Authorization: apiKey,
          },
        },
      });
    }
    return { page: { title: "", paragraphs: [] }, isLoading: true, regeneratePage, editPage };
  }
};

function makeErrorReturn(error: string): { page: Article; isLoading: boolean } {
  return {
    page: {
      title: "Error",
      paragraphs: [
        { parts: [{ type: "italic", display: "Please reload the page or try a different one." }] },
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
  const { clearMessages, addMessages } = useChatStore();
  const { addPage } = usePageStore();
  const router = useRouter();

  return (text) => {
    const article = parseArticle(text);
    clearMessages();
    const slug = slugify(article.title);
    addMessages([
      {
        id: userMessageId(slug),
        role: "user",
        content: `<click> page:${slug} </click>`,
      },
      {
        id: `example-asst-response`,
        role: "assistant",
        content: text,
      },
    ]);
    addPage(slug, article);
    router.push(`/wiki/${slug}`);
  };
};
