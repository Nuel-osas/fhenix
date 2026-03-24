"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    num: "01",
    title: "Encrypt locally",
    desc: "The seller never uploads a readable file. Only ciphertext leaves the browser.",
  },
  {
    num: "02",
    title: "List the signal",
    desc: "Row count, schema, price, and other proof-backed market cues go public. The file does not.",
  },
  {
    num: "03",
    title: "Escrow privately",
    desc: "The buyer commits funds in Fhenix without turning the purchase into a public broadcast.",
  },
  {
    num: "04",
    title: "Release access",
    desc: "The key moves privately to the buyer, who decrypts locally and confirms before settlement.",
  },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(".flow-intro", {
        y: 24,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 78%",
        },
      });

      gsap.from(".flow-row", {
        y: 42,
        opacity: 0,
        duration: 0.7,
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
    <section ref={sectionRef} className="px-4 py-28 md:px-6">
      <div className="mx-auto max-w-7xl border-t border-white/10 pt-8">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div className="flow-intro">
            <div className="section-kicker">The deal flow</div>
            <h2 className="mt-6 font-display text-[clamp(3.4rem,7vw,7rem)] uppercase leading-[0.88] tracking-[-0.01em]">
              Four moves.
              <br />
              <span className="text-accent">No leaks.</span>
            </h2>
          </div>

          <div>
            <p className="flow-intro max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg">
              This section should read like market choreography, not feature
              documentation. One row per action. No filler. No over-explaining.
            </p>

            <div className="mt-10">
              {steps.map((step) => (
                <div
                  key={step.num}
                  className="flow-row group grid gap-4 border-b border-white/10 py-6 md:grid-cols-[120px_1fr_60px] md:items-start"
                >
                  <div className="font-display text-[3rem] leading-none tracking-[-0.01em] text-accent">
                    {step.num}
                  </div>
                  <div>
                    <h3 className="font-display text-[2rem] uppercase leading-[0.9] tracking-[-0.01em]">
                      {step.title}
                    </h3>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary md:text-base">
                      {step.desc}
                    </p>
                  </div>
                  <div className="hidden pt-2 text-right text-xl text-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent md:block">
                    &rarr;
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
