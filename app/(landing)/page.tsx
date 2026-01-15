import { HomePage } from "@/views";
import { Suspense } from "react";

export default function page() {
  return (
    <Suspense fallback={null}>
      <HomePage />
    </Suspense>
  );
}
