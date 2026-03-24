"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import VeilMark from "./VeilMark";

const navLinks = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/sell", label: "Sell Data" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isConnected } = useAccount();

  return (
    <nav className="fixed top-0 left-0 z-50 w-full px-4 pt-4 md:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/8 bg-black/50 px-5 py-3 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-accent/20 bg-accent/10 text-accent">
            <VeilMark className="h-5 w-5" />
          </div>
          <div>
            <span className="font-display text-xl uppercase tracking-[-0.04em]">
              Veil<span className="text-accent">Data</span>
            </span>
            <p className="hidden text-[0.6rem] font-mono uppercase tracking-[0.24em] text-muted md:block">
              confidential exchange
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          {isConnected && (
            <div className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[0.65rem] font-mono uppercase tracking-[0.24em] text-accent">
              Wallet live
            </div>
          )}
          <div className="flex items-center gap-2 rounded-full border border-white/6 bg-white/3 px-3 py-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] text-text-secondary transition-colors duration-300 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <ConnectButton />
        </div>

        <button
          className="flex flex-col gap-1.5 md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          <motion.span
            animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
            className="block h-0.5 w-6 bg-foreground"
          />
          <motion.span
            animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
            className="block h-0.5 w-6 bg-foreground"
          />
          <motion.span
            animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
            className="block h-0.5 w-6 bg-foreground"
          />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.65, 0, 0.35, 1] }}
            className="mx-auto mt-3 max-w-7xl overflow-hidden rounded-[1.6rem] border border-white/8 bg-black/70 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-4 px-6 py-5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="font-display text-2xl uppercase tracking-[-0.04em] text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-3">
                <ConnectButton />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
