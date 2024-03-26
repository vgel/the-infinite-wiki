"use client";

import { usePathname } from "next/navigation";

import WikiPage from "@/components/WikiPage";
import { usePage } from "@/app/store";

const PostPage = () => {
  const slug = useSlug();
  const { page, isLoading } = usePage(slug);

  return (
    <div>
      <main className="container mx-auto py-8">
        <WikiPage article={page} isLoading={isLoading} />
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
