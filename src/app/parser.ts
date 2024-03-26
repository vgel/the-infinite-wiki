import { slugify } from "./util";

export interface Article {
  title: string;
  paragraphs: Paragraph[];
}

export interface Paragraph {
  parts: Array<Part>;
}

export type Part =
  | string
  | { type: "link"; display: string; dest: string }
  | { type: "bold" | "italic"; display: string };

export function parseArticle(text: string): Article {
  if (!text.includes("<title>")) {
    return { title: "", paragraphs: [] };
  }
  text = text.split("<title>")[1].trim();
  if (!text.includes("</title>")) {
    // not a complete </title> string yet
    return { title: text.trim(), paragraphs: [] };
  }

  // we have a complete <title> ... </title>
  let title;
  [title, text] = text.split("</title>");
  title = title.trim();

  if (!text.includes("<article>")) {
    return { title, paragraphs: [] };
  }
  text = text.split("<article>")[1].trim();
  if (!text.includes("</article>")) {
    return { title, paragraphs: parseParagraphs(text) };
  }
  return { title, paragraphs: parseParagraphs(text.split("</article>")[0]) };
}

function parseParagraphs(text: string): Paragraph[] {
  return text
    .trim()
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s !== "")
    .map((p) => ({
      parts: p.split(/(\[\[[^\]]+?\]\]|'''[^']+?'''|''[^']+?'')/).map((part) => {
        if (part.startsWith("[[")) {
          if (part.includes("|")) {
            const slug = slugify(part.split("|")[0].replace("[[", ""));
            const display = part.split("|")[1].replace("]]", "").trim();
            return { type: "link", display: `[[${display}]]`, dest: `/wiki/${slug}` };
          } else {
            const slug = slugify(part.replace("[[", "").replace("]]", ""));
            return { type: "link", display: part, dest: `/wiki/${slug}` };
          }
        } else if (part.startsWith("'''")) {
          return { type: "bold", display: part.replace(/'''/g, "") };
        } else if (part.startsWith("''")) {
          return { type: "italic", display: part.replace(/''/g, "") };
        } else {
          return part;
        }
      }),
    }));
}
