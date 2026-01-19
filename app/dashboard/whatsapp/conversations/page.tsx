"use client";

import React, { Suspense } from "react";
import { ConversationsContent } from "./ConversationsContent";

export default function ConversationsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ConversationsContent />
    </Suspense>
  );
}
