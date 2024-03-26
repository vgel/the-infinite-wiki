"use client";

import React, { FormEvent, useState } from "react";

import WikiPage from "@/components/WikiPage";
import { usePageStore, useApiKeyStore, useSetSeed, useReset } from "./store";
import WikiLink from "@/components/WikiLink";
import SEEDS from "./seeds";

export default function Home() {
  const { pages } = usePageStore();

  return (
    <div>
      <main className="container max-w-lg mx-auto py-8 flex flex-col gap-4">
        <header>
          <h1 className="text-xl font-bold serif text-center">Welcome to The Infinite Wiki,</h1>
          <h2 className="text-lg text-center">an infinitely-unfurling encylopedia.</h2>
        </header>
        <p>
          The Infinite Wiki is a wiki that goes on forever. Starting from a &ldquo;seed page&rdquo;, new pages are
          iteratively rolled out by a Large Language Model (currently Anthropic&apos;s Claude 3 Opus) based on the pages
          you visit. A history of pages is kept in the model context, so a self-consistent world accretes around your
          trail through latent space. You can visit new pages either by clicking generated links, or searching for a
          page you want to see in the search bar above, once the wiki has been initialized.{" "}
        </p>
        <p>
          The Infinite Wiki is currently very early in development, so expect bugs. Most pressingly, navigating away
          from a page mid-generation currently loses all progress on that page.
        </p>
        <p>
          To get started, get an{" "}
          <WikiLink target="_blank" href="https://console.anthropic.com/login">
            Anthropic API key
          </WikiLink>{" "}
          and paste it in the box below. Then scroll down and click one of the preset seed pages, then click Initialize
          to start the wiki with it.{" "}
          <small>
            (You can also design your own seed if you want—check the presets for the format. Make sure to use enough
            [[links]] and &apos;&apos;formatting&apos;&apos; for Claude to get the gist! Automatic metaprompt seed page
            generation coming Soon™. Until then, it can be helpful to write a not-so-good seed page, let Claude riff on
            it a bit, then copy a page you particularly like to be the real seed page for the theme. If you come up with
            any cool themes, I&apos;d appreciate if you&apos;d share them with me—I&apos;d love to integrate them as new
            presets!)
          </small>
        </p>
        <hr></hr>
        <ApiKeyForm />
        <hr></hr>
        {Object.keys(pages).length === 0 ? <CreateSeedPage /> : <PageList />}
        <hr></hr>
        <p>
          The Infinite Wiki is made by{" "}
          <WikiLink target="_blank" href="https://vgel.me">
            Theia Vogel
          </WikiLink>{" "}
          (
          <WikiLink target="_blank" href="https://twitter.com/voooooogel">
            @voooooogel
          </WikiLink>
          ). Thanks to my friends{" "}
          <WikiLink target="_blank" href="https://twitter.com/lumpenspace">
            lumpen space process
          </WikiLink>{" "}
          for code review, architectural feedback, early testing, various ideas, and coming up with the Infinite Wiki
          name (a much better name than my original one!), and{" "}
          <WikiLink target="_blank" href="https://twitter.com/karan4d">
            mephisto (Nous Research)
          </WikiLink>{" "}
          for prompt inspiration and various ideas. And as with all my projects, thanks to my wife{" "}
          <WikiLink target="_blank" href="https://linneaisaac.com">
            Linnea
          </WikiLink>{" "}
          for inspiration and motivation—along with the Lovecraft seed.
        </p>
      </main>
    </div>
  );
}

const ApiKeyForm = () => {
  const { apiKey, setApiKey } = useApiKeyStore();

  return (
    <div className={`flex flex-col justify-start gap-2 p-2 ${!apiKey && "bg-red-300"}`}>
      <div className="flex flex-row gap-2 items-center">
        <label className="block text-gray-700 font-semibold text-sm" htmlFor="apikey">
          Anthropic API Key
        </label>
        <input
          className="appearance-none border w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline max-w-xs"
          id="apikey"
          type="password"
          autoComplete="none"
          autoCorrect="none"
          autoCapitalize="none"
          placeholder="sk-ant-api03-..."
          value={apiKey ?? ""}
          onChange={(e) => setApiKey(e.target.value || null)}
        />
      </div>
      <small className="text-xs">
        This key will be transmitted to a server-side API proxy (because Anthropic&apos;s API doesn&apos;t set the
        appropriate CORS headers for browser usage), but the key will not be stored on the server—it is only saved
        locally. The Infinite Wiki is open-source on Github if you&apos;d like to assure yourself that I won&apos;t mess
        with your key, or just run your own instance:{" "}
        <WikiLink target="_blank" href="https://github.com/vgel/the-infinite-wiki">
          vgel/the-infinite-wiki
        </WikiLink>
        .
      </small>
    </div>
  );
};

const CreateSeedPage = () => {
  const [text, setText] = useState("");
  const setSeed = useSetSeed();
  const seedLooksValid =
    text.includes("<wiki>") &&
    text.includes("</wiki>") &&
    text.includes("<title>") &&
    text.includes("</title>") &&
    text.includes("<article>") &&
    text.includes("</article>") &&
    text.includes("[[") &&
    text.includes("]]") &&
    text.includes("''");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (seedLooksValid) {
      setSeed(text);
    } else {
      alert("Seed doesn't look valid (missing XML tags, [[link]], or ''formatting'').");
    }
  };

  return (
    <div className="flex flex-col gap-2 max-w-md p-2">
      <p className="font-bold">The wiki currently doesn&apos;t have any pages.</p>
      <p>Choose a preset seed page, or create your own below to get started!</p>
      <div className="flex flex-row flex-wrap gap-2">
        {Object.entries(SEEDS).map(([desc, seed]) => (
          <button
            key={desc}
            className="bg-green-200 p-2"
            onClick={() => {
              setText(seed.text);
            }}
          >
            {desc}
          </button>
        ))}
      </div>
      <form className="flex flex-col gap-1" onSubmit={onSubmit}>
        <label className="font-bold" htmlFor="articletext">
          Text
        </label>
        <textarea
          className="border"
          rows={10}
          id="articletext"
          value={text}
          onChange={(e) => setText(e.target.value || "")}
        />
        <button className="bg-green-500 text-white p-2" type="submit">
          Initialize Wiki
        </button>
      </form>
    </div>
  );
};

const PageList = () => {
  const [deleteClicked, setDeleteClicked] = useState(false);
  const reset = useReset();
  const { pages } = usePageStore();
  const numPages = Object.keys(pages).length;

  return (
    <div className="flex flex-col gap-2 max-w-md p-2">
      <p className="font-bold">
        The wiki currently has {numPages} {numPages === 1 ? "page" : "pages"}.
      </p>
      <ul>
        {Object.entries(pages).map(([slug, article]) => (
          <li key={slug} className="list-disc">
            <WikiLink href={`/wiki/${slug}`}>[[{article.title}]]</WikiLink>
          </li>
        ))}
      </ul>
      <button
        className="bg-red-500 hover:bg-red-700 text-white font-bold p-1 focus:outline-none focus:shadow-outline"
        onClick={() => {
          if (deleteClicked) {
            reset();
            setDeleteClicked(false);
          } else {
            setDeleteClicked(true);
          }
        }}
      >
        {deleteClicked ? "Are you sure?" : "Delete all pages and start over"}
      </button>
    </div>
  );
};
