"use client";

import { Spinner } from "./Icons";
import { Article, Part } from "@/app/parser";
import WikiLink from "./WikiLink";

export interface WikiPageProps {
  article: Article;
  isLoading?: boolean;
}

const WikiPage = ({ article, isLoading }: WikiPageProps) => {
  const spinner = (
    <span className="inline-block ml-2">
      <Spinner size={18} />
    </span>
  );
  const titleSpinner = isLoading && article.paragraphs.length === 0 && spinner;
  const lastParaSpinner = isLoading && article.paragraphs.length > 0 && spinner;
  return (
    <article className="max-w-4xl mx-auto">
      <h1 className="text-4xl text-left italic font-serif border-b-2 border-black p-2 mb-2">
        {article.title}
        {titleSpinner}
      </h1>
      {article.paragraphs.map((p, idx) => (
        <p key={idx}>
          {p.parts.map((part, idx) => (
            <RenderPart key={idx} part={part} clickableLinks={!isLoading} />
          ))}
          {idx == article.paragraphs.length - 1 && lastParaSpinner}
        </p>
      ))}
    </article>
  );
};

const RenderPart = ({ part, clickableLinks }: { part: Part; clickableLinks: boolean }) => {
  if (typeof part === "string") {
    return part;
  } else if (part.type === "bold") {
    return <strong className="font-bold">{part.display}</strong>;
  } else if (part.type === "italic") {
    return <span className="italic">{part.display}</span>;
  } else if (part.type === "link") {
    return clickableLinks ? <WikiLink href={part.dest}>{part.display}</WikiLink> : <span>{part.display}</span>;
  } else {
    console.error("unknown part", part);
    return <span>{`${part}`}</span>;
  }
};

export default WikiPage;
