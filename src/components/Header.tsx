"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

import SearchBar from "./SearchBar";
import { usePageStore } from "@/app/store";
import { slugify } from "../app/util";

const Header = () => {
  const router = useRouter();
  const { pages } = usePageStore();

  const numPages = Object.values(pages).length;

  return (
    <header className="bg-green-100 px-2 py-1">
      <nav className="flex flex-row flex-wrap items-center justify-between gap-4">
        <div className="flex flex-row flex-wrap items-center justify-between gap-4">
          <Link href="/">
            <svg width="200" viewBox="0 0 375 100" xmlns="http://www.w3.org/2000/svg">
              <style>{`text { font-family: "Linux Libertine","Georgia","Times",serif; }`}</style>
              <g>
                <circle cx="40" cy="50" r="40" fill="#000000" />
                <path
                  d="m15 32 l20 0 l0 15 l-10 0 l0 20 l30 0 l0 -20 l-10 0 l0 -15 l20 0"
                  stroke="#ffffff"
                  strokeWidth="5"
                  fill="none"
                />
              </g>
              <g>
                <text x="80" y="45" fontSize="40" fill="#000000">
                  The Infinite Wiki
                </text>
                <rect x="60" y="50" width="300" height="2" fill="#000000" />
                <text x="85" y="69" fontSize="20" fill="#000000">
                  The Simulated Encyclopedia
                </text>
              </g>
            </svg>
          </Link>
          <SearchBar onSearch={(s) => router.push(`/wiki/${slugify(s)}`)} />
        </div>
        <div>
          {numPages} {numPages == 1 ? "page" : "pages"} generated.
        </div>
      </nav>
    </header>
  );
};

export default Header;
