"use client";

const topRow = [
  "PROOF WITHOUT EXPOSURE",
  "PRIVATE BY DEFAULT",
  "BUY SIGNAL BEFORE ACCESS",
];

const bottomRow = [
  "SELL SIGNAL, NOT THE PAYLOAD",
  "CIPHERTEXT ON WALRUS",
  "ALEO HOLDS THE TRUST",
  "KEYS MOVE ONLY TO THE BUYER",
];

function Row({
  items,
  reverse = false,
  accent = false,
}: {
  items: string[];
  reverse?: boolean;
  accent?: boolean;
}) {
  const repeated = [...items, ...items];

  return (
    <div
      className={`overflow-hidden border-y ${
        accent
          ? "border-black/15 bg-accent text-black"
          : "border-white/8 bg-[#111111] text-foreground"
      }`}
    >
      <div className={`marquee-rail ${reverse ? "reverse" : ""}`}>
        {repeated.map((item, index) => (
          <div
            key={`${item}-${index}`}
            className="marquee-chip px-6 py-6 font-display text-[clamp(1.9rem,4.8vw,4.6rem)] uppercase leading-none tracking-[-0.02em]"
          >
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SignalMarquee() {
  return (
    <section className="pb-10 pt-2">
      <Row items={topRow} accent />
      <Row items={bottomRow} reverse />
    </section>
  );
}
