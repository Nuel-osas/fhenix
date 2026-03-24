"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

const cards = [
  {
    title: "ZK quality signals",
    desc: "Sellers prove the shape and value of a dataset without exposing the dataset itself.",
    tone: "accent",
    eyebrow: "Listing logic",
    span: "lg:col-span-7",
  },
  {
    title: "Private escrow",
    desc: "Payment is part of the structure, but the transaction does not become public theatre.",
    tone: "dark",
    eyebrow: "Settlement",
    span: "lg:col-span-5",
  },
  {
    title: "Ciphertext on Walrus",
    desc: "Storage is decentralized, but what gets stored is unreadable until the buyer receives the key.",
    tone: "dark",
    eyebrow: "Storage",
    span: "lg:col-span-5",
  },
  {
    title: "Seller stakes keep the market honest",
    desc: "Deposits and disputes create consequences. That makes the marketplace credible, not just private.",
    tone: "muted",
    eyebrow: "Integrity",
    span: "lg:col-span-7",
  },
];

function toneClasses(tone: string) {
  if (tone === "accent") {
    return "bg-accent text-black border-accent";
  }
  if (tone === "muted") {
    return "bg-[#141414] text-foreground border-white/10";
  }
  return "bg-[#101010] text-foreground border-white/10";
}

export default function Features() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(".feature-panel", {
        y: 48,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 72%",
          toggleActions: "play none none reverse",
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="px-4 py-24 md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 border-t border-white/10 pt-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <div className="section-kicker">Why it works</div>
              <h2 className="mt-6 font-display text-[clamp(3.2rem,6vw,6.5rem)] uppercase leading-[0.88] tracking-[-0.01em]">
                Privacy with
                <br />
                <span className="text-accent">market structure</span>
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg">
              The references work because each block has a clear point of view.
              This section now does the same: fewer cards, stronger hierarchy,
              and more contrast between ideas.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {cards.map((card, index) => (
            <motion.article
              key={card.title}
              whileHover={{ y: -6, rotate: index % 2 === 0 ? -0.4 : 0.4 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className={`feature-panel ${card.span} group relative overflow-hidden rounded-[2.1rem] border p-7 md:p-9 ${toneClasses(card.tone)}`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.09),transparent_36%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative flex h-full flex-col justify-between gap-14">
                <div className="flex items-center justify-between">
                  <span className={`text-[0.68rem] font-mono uppercase tracking-[0.24em] ${card.tone === "accent" ? "text-black/60" : "text-muted"}`}>
                    {card.eyebrow}
                  </span>
                  <span className={`font-display text-4xl leading-none tracking-[-0.01em] ${card.tone === "accent" ? "text-black/25" : "text-white/10"}`}>
                    0{index + 1}
                  </span>
                </div>

                <div>
                  <h3 className={`max-w-[16ch] font-display text-[2.4rem] uppercase leading-[0.9] tracking-[-0.01em] md:text-[3rem] ${card.tone === "accent" ? "text-black" : "text-foreground"}`}>
                    {card.title}
                  </h3>
                  <p className={`mt-4 max-w-2xl text-sm leading-relaxed md:text-base ${card.tone === "accent" ? "text-black/75" : "text-text-secondary"}`}>
                    {card.desc}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
