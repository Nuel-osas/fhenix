"use client";

import Link from "next/link";
import VeilMark from "./VeilMark";

export default function Footer() {
  return (
    <footer className="border-t border-border py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-12">
          {/* Brand */}
          <div className="max-w-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-accent/20 bg-accent/10 text-accent">
                <VeilMark className="h-5 w-5" />
              </div>
              <span className="font-display text-xl uppercase tracking-[-0.04em]">
                Veil<span className="text-accent">Data</span>
              </span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              The first confidential data marketplace powered by Fhenix
              Fully Homomorphic Encryption and Walrus decentralized storage.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-16">
            <div>
              <h4 className="text-sm font-semibold mb-4">Product</h4>
              <div className="flex flex-col gap-2">
                <Link href="/marketplace" className="text-sm text-muted hover:text-foreground transition-colors">Marketplace</Link>
                <Link href="/sell" className="text-sm text-muted hover:text-foreground transition-colors">Sell Data</Link>
                <Link href="/dashboard" className="text-sm text-muted hover:text-foreground transition-colors">Dashboard</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Built With</h4>
              <div className="flex flex-col gap-2">
                <span className="text-sm text-muted">Fhenix</span>
                <span className="text-sm text-muted">Walrus</span>
                <span className="text-sm text-muted">MetaMask</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">
            &copy; 2026 VeilData. Privacy is not a feature — it&apos;s the default.
          </p>
          <p className="text-xs text-muted font-mono">
            Powered by Fhenix Zero-Knowledge Proofs
          </p>
        </div>
      </div>
    </footer>
  );
}
