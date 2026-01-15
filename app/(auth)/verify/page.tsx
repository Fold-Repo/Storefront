import { VerifyAccountPage } from "@/views/auth/VerifyAccountPage";
import { Suspense } from "react";

export default function VerifyAccount() {
  return (
    <Suspense fallback={null}>
      <VerifyAccountPage />
    </Suspense>
  );
}
