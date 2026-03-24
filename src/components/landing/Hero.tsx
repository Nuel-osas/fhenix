"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const previewRows = [
  {
    label: "01",
    title: "Ciphertext uploaded",
    detail: "The file leaves the browser already encrypted.",
  },
  {
    label: "02",
    title: "Signal listed on Fhenix",
    detail: "Buyers inspect proof-backed metadata, not the raw dataset.",
  },
  {
    label: "03",
    title: "Key released after confirmation",
    detail: "The trade closes only when access is actually delivered.",
  },
];

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ delay: 0.15 });

      tl.from(".hero-kicker", {
        y: 20,
        opacity: 0,
        duration: 0.55,
        ease: "power3.out",
      })
        .from(
          ".hero-row",
          {
            yPercent: 110,
            opacity: 0,
            duration: 1,
            ease: "power4.out",
            stagger: 0.09,
          },
          "-=0.05"
        )
        .from(
          ".hero-copy",
          {
            y: 24,
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
          },
          "-=0.45"
        )
        .from(
          ".hero-actions",
          {
            y: 18,
            opacity: 0,
            duration: 0.65,
            ease: "power3.out",
          },
          "-=0.4"
        )
        .from(
          ".hero-meta",
          {
            y: 20,
            opacity: 0,
            duration: 0.55,
            ease: "power3.out",
            stagger: 0.08,
          },
          "-=0.3"
        )
        .from(
          ".hero-slab",
          {
            y: 40,
            opacity: 0,
            scale: 0.98,
            duration: 0.9,
            ease: "power3.out",
          },
          "-=0.8"
        )
        .from(
          ".hero-micro",
          {
            y: 18,
            opacity: 0,
            duration: 0.55,
            ease: "power3.out",
            stagger: 0.08,
          },
          "-=0.55"
        );

      gsap.to(".hero-slab", {
        yPercent: -8,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
      });
    },
    { scope: heroRef }
  );

  return (
    <section ref={heroRef} className="relative px-4 pb-16 pt-28 md:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,255,59,0.12),transparent_26%),radial-gradient(circle_at_80%_15%,rgba(255,255,255,0.05),transparent_18%)]" />
      <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-7xl items-end gap-12 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="relative z-10">
          <div className="hero-kicker section-kicker mb-8">
            Confidential data market
          </div>

          <div className="space-y-2">
            <div className="overflow-hidden">
              <h1 className="hero-row font-display text-[clamp(4.4rem,11vw,10rem)] uppercase leading-[0.86] tracking-[-0.01em]">
                Sell data
              </h1>
            </div>
            <div className="flex flex-wrap items-end gap-3 overflow-hidden">
              <div className="hero-row rounded-[1.4rem] bg-accent px-4 py-2 text-[0.68rem] font-mono uppercase tracking-[0.26em] text-black">
                without leaks
              </div>
              <h1 className="hero-row font-display text-[clamp(4.4rem,11vw,10rem)] uppercase leading-[0.86] tracking-[-0.01em]">
                keep the file
              </h1>
            </div>
            <div className="overflow-hidden">
              <h1 className="hero-row font-display text-[clamp(4.4rem,11vw,10rem)] uppercase leading-[0.86] tracking-[-0.01em] text-accent">
                private
              </h1>
            </div>
          </div>

          <p className="hero-copy mt-8 max-w-2xl text-lg leading-relaxed text-text-secondary md:text-[1.18rem]">
            VeilData lets healthcare providers, research teams, and data brokers
            sell sensitive datasets without exposing contents or buyer identity.
            Files are encrypted client-side, stored on Walrus, and traded through
            Fhenix&apos;s Fully Homomorphic Encryption.
          </p>

          <div className="hero-actions mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/sell"
              className="inline-flex items-center justify-center rounded-full bg-accent px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.18em] text-black transition-transform duration-300 hover:-translate-y-1"
            >
              Start a listing
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center rounded-full border border-white/10 px-7 py-3.5 text-sm uppercase tracking-[0.18em] text-foreground transition-all duration-300 hover:-translate-y-1 hover:border-accent/35"
            >
              Browse the market
            </Link>
          </div>

          <div className="mt-14 grid gap-5 border-t border-white/10 pt-6 md:grid-cols-3">
            <div className="hero-meta">
              <p className="text-[0.68rem] font-mono uppercase tracking-[0.24em] text-muted">
                Built for
              </p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                Healthcare providers, hedge funds, AI labs, and compliance
                teams trading regulated or proprietary data.
              </p>
            </div>
            <div className="hero-meta">
              <p className="text-[0.68rem] font-mono uppercase tracking-[0.24em] text-muted">
                Trust layer
              </p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                Fhenix FHE proofs hide buyer identity and verify data integrity on-chain.
              </p>
            </div>
            <div className="hero-meta">
              <p className="text-[0.68rem] font-mono uppercase tracking-[0.24em] text-muted">
                Storage layer
              </p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                Walrus stores ciphertext only. The payload stays unreadable.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="hero-slab relative overflow-hidden rounded-[2.5rem] border border-white/8 bg-[#101010] p-6 md:p-8">
            <div className="soft-grid absolute inset-0 opacity-20" />
            <div className="absolute right-4 top-2 font-display text-[6rem] uppercase leading-none tracking-[-0.02em] text-white/5 md:text-[8rem]">
              veil
            </div>

            <div className="relative flex min-h-[31rem] flex-col justify-between">
              <div className="flex items-center justify-between text-[0.68rem] font-mono uppercase tracking-[0.24em] text-muted">
                <span>Listing preview</span>
                <span>Testnet live</span>
              </div>

              <div className="space-y-4">
                <div className="rounded-[1.8rem] border border-white/8 bg-white/4 p-5">
                  <p className="text-[0.68rem] font-mono uppercase tracking-[0.24em] text-accent">
                    Sample inventory
                  </p>
                  <h2 className="mt-4 font-display text-[2.8rem] uppercase leading-[0.9] tracking-[-0.01em]">
                    Urban mobility heatmaps
                  </h2>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-text-secondary">
                    Buyers see coverage, structure, and proof-backed metadata
                    first. The underlying movement data remains encrypted until
                    access is granted.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {["geospatial", "75k rows", "verified schema"].map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/8 px-3 py-1 text-[0.68rem] font-mono uppercase tracking-[0.18em] text-muted"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {previewRows.map((row) => (
                    <div
                      key={row.label}
                      className="hero-micro rounded-[1.4rem] border border-white/8 bg-black/25 px-4 py-4"
                    >
                      <div className="flex items-start gap-4">
                        <span className="font-display text-3xl leading-none tracking-[-0.01em] text-accent">
                          {row.label}
                        </span>
                        <div>
                          <p className="font-display text-[1.35rem] uppercase leading-[0.92] tracking-[-0.02em]">
                            {row.title}
                          </p>
                          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                            {row.detail}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { value: "AES-256", label: "local encryption" },
                  { value: "Private", label: "escrow flow" },
                  { value: "FHE", label: "listing signal" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="hero-micro rounded-[1.2rem] border border-white/8 bg-white/3 px-4 py-4"
                  >
                    <p className="font-display text-2xl uppercase leading-none tracking-[-0.02em] text-accent">
                      {item.value}
                    </p>
                    <p className="mt-2 text-[0.68rem] font-mono uppercase tracking-[0.18em] text-muted">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
