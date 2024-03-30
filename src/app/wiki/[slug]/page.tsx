"use client";

import { usePathname } from "next/navigation";

import WikiPage from "@/components/WikiPage";
import { usePage, usePageStore } from "@/app/store";

const PostPage = () => {
  const slug = useSlug();
  const { pages } = usePageStore();
  const { page, isLoading, regeneratePage, editPage } = usePage(slug);
  const canRegenerate = Object.keys(pages).filter((key) => key != slug).length > 0;

  return (
    <div>
      <main className="container mx-auto py-8">
        <WikiPage
          article={page}
          isLoading={isLoading}
          regeneratePage={canRegenerate ? regeneratePage : null}
          editPage={editPage}
        />
      </main>
    </div>
  );
};

function useSlug() {
  const pathname = usePathname();
  const parts = pathname.split("/");
  return parts[parts.length - 1].trim().toLowerCase();
}

export default PostPage;
