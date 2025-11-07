"use client";

import { Button } from "@repo/ui/button";

export default function HomePage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Tradepal Next.js App</h1>
      <p>App is wired to Turborepo and uses shared UI package.</p>
      <Button appName="web" className="btn">
        Click me
      </Button>
    </main>
  );
}
