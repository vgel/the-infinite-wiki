"use client";

import { useState } from "react";

import { Article, Part } from "@/app/parser";
import { Spinner, Reload, Edit } from "./Icons";
import WikiLink from "./WikiLink";
import EditModal from "./EditModal";

export interface WikiPageProps {
  article: Article;
  isLoading?: boolean;
  regeneratePage: (() => void) | null;
  editPage: (editSummary: string) => void;
}

const WikiPage = ({ article, isLoading, regeneratePage, editPage }: WikiPageProps) => {
  const [editOpen, setEditOpen] = useState(false);

  const spinner = (
    <span className="inline-block ml-2">
      <Spinner size={18} />
    </span>
  );
  const titleSpinner = isLoading && article.paragraphs.length === 0 && spinner;
  const lastParaSpinner = isLoading && article.paragraphs.length > 0 && spinner;
  return (
    <>
      {editOpen && (
        <EditModal
          close={() => setEditOpen(false)}
          onSubmit={(content) => {
            setEditOpen(false);
            editPage(content);
          }}
        />
      )}
      <article className="max-w-4xl mx-auto">
        <div className="flex flex-row justify-between">
          <h1 className="text-4xl text-left italic font-serif border-b-2 border-black p-2 mb-2 flex-grow">
            {article.title}
            {titleSpinner}
          </h1>
          {!isLoading && (
            <div className="flex flex-row gap-2 items-center">
              {regeneratePage !== null && (
                <button title="Regenerate" onClick={regeneratePage}>
                  <Reload />
                </button>
              )}
              <button
                title="Edit"
                onClick={() => {
                  setEditOpen(true);
                }}
              >
                <Edit />
              </button>
            </div>
          )}
        </div>
        {article.paragraphs.map((p, idx) => (
          <p className="mb-2" key={idx}>
            {p.parts.map((part, idx) => (
              <RenderPart key={idx} part={part} clickableLinks={!isLoading} />
            ))}
            {idx == article.paragraphs.length - 1 && lastParaSpinner}
          </p>
        ))}
      </article>
    </>
  );
};

const RenderPart = ({ part, clickableLinks }: { part: Part; clickableLinks: boolean }) => {
  if (typeof part === "string") {
    return part;
  } else if (part.type === "bold") {
    return <strong className="font-bold">{part.display}</strong>;
  } else if (part.type === "italic") {
    return <span className="italic">{part.display}</span>;
  } else if (part.type === "link" || part.type === "boldlink") {
    const el = clickableLinks ? <WikiLink href={part.dest}>{part.display}</WikiLink> : <span>{part.display}</span>;
    return part.type === "boldlink" ? <strong className="font-bold">{el}</strong> : el;
  } else if (part.type === "header") {
    const HeaderTag = (["h1", "h2", "h3", "h4", "h5", "h6"] as const)[part.level] ?? "h6";
    const size = ["3xl", "2xl", "xl", "lg", "base", "base"][part.level] ?? "base";
    const style =
      ["font-bold", "font-bold", "font-bold", "font-semibold", "font-semibold", "italic"][part.level] ?? "italic";
    return <HeaderTag className={`text-${size} ${style}`}>{part.display}</HeaderTag>;
  } else {
    let _x: never = part.type;
    console.error("unknown part", part);
    return <span>{`${part}`}</span>;
  }
};

export default WikiPage;
