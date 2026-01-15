import { ResetPasswordPage } from "@/views/auth";
import { Suspense } from "react";

export default function ResetPassword() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordPage />
    </Suspense>
  );
}
