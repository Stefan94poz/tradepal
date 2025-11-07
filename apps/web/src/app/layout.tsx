export const metadata = {
  title: "Tradepal Web",
  description: "Next.js app in Turborepo",
};

import "./globals.css";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
