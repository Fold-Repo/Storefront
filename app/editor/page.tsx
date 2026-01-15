"use client";

import { PageEditor } from "@/components/editor/PageEditor";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function EditorPageContent() {
  const searchParams = useSearchParams();
  const subdomain = searchParams.get("subdomain") || undefined;
  const page = searchParams.get("page") || undefined;

  return <PageEditor subdomain={subdomain} initialPage={page} />;
}

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <EditorPageContent />
    </Suspense>
  );
}
