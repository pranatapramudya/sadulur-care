// app/layout.tsx
import "./globals.css";
import type { Metadata, Viewport } from "next"; // 🔥 Tambah Viewport di sini
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import CapacitorHelper from "./CapacitorHelper";
// import { TrialExpirationLock } from "@/components/TrialExpirationLock";

export const metadata: Metadata = {
  title: "Sadulur-App",
  description: "Aplikasi pantauan medis dan edukasi pasien pasca rawat.",
};

// 🔥 CHEAT CODE FINAL: Maksa layarnya nabrak poni kamera 🔥
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover", // Kunci utama biar full screen
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <CapacitorHelper />
          {/* <TrialExpirationLock> */}
            {children}
          {/* </TrialExpirationLock> */}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
