"use client";

import dynamic from "next/dynamic";
import { ReactNode } from "react";

const ClientProviders = dynamic(() => import("./ClientProviders"), { ssr: false });
const Navbar = dynamic(() => import("./Navbar"), { ssr: false });

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <ClientProviders>
      <Navbar />
      {children}
    </ClientProviders>
  );
}
