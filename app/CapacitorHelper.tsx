"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { App } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";

export default function CapacitorHelper() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initCapacitor = async () => {
      // 🔥 FIX: Tambahin "as any" biar TypeScript nggak cerewet
      if (typeof window !== "undefined" && (window as any).Capacitor) {
        try {
          await StatusBar.setBackgroundColor({ color: "#0D9488" });
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setOverlaysWebView({ overlay: true });
        } catch (e) {
          console.log("Gagal set status bar", e);
        }

        App.removeAllListeners();
        App.addListener("backButton", () => {
          if (pathname === "/" || pathname === "/dashboard") {
            App.exitApp();
          } else {
            router.back();
          }
        });
      }
    };

    initCapacitor();

    return () => {
      if (typeof window !== "undefined" && (window as any).Capacitor) {
        App.removeAllListeners();
      }
    };
  }, [pathname, router]);

  return null;
}
