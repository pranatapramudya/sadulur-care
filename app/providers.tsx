"use client";

import { ClerkProvider } from "@clerk/nextjs";
import React from "react";

// Ambil key dari environment variable
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function Providers({ children }: { children: React.ReactNode }) {
  // Jika key tidak ada, jangan biarkan aplikasi crash, tapi kasih peringatan di console
  if (!PUBLISHABLE_KEY) {
    console.error(
      "Waduh bre, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY nggak ketemu di .env!",
    );
    return <>{children}</>;
  }

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>{children}</ClerkProvider>
  );
}
