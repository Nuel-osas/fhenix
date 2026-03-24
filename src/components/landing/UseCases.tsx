"use client";

const useCases = [
  {
    industry: "Healthcare & Pharma",
    title: "Share patient datasets without violating HIPAA",
    desc: "Research hospitals can sell anonymized clinical trial data to pharmaceutical companies. Buyers verify dataset structure and completeness via on-chain metadata before purchasing — without ever seeing protected health information.",
    example: "A biotech startup purchases 50k anonymized patient records to train a drug interaction model. The hospital earns revenue; patient identities stay protected by encryption + FHE proofs.",
    tags: ["HIPAA compliant", "anonymized records", "clinical trials"],
  },
  {
    industry: "Financial Intelligence",
    title: "Trade proprietary market data privately",
    desc: "Hedge funds and research desks buy trading signal datasets without revealing their strategy. The buyer's identity is hidden on-chain via Fhenix's FHE proofs — competitors never know who purchased what.",
    example: "A quant fund purchases DeFi liquidity snapshots to backtest a strategy. The purchase is invisible to other market participants thanks to FHE execution.",
    tags: ["trading signals", "competitive intelligence", "buyer anonymity"],
  },
  {
    industry: "AI & Machine Learning",
    title: "Monetize training data without losing control",
    desc: "Data labeling companies and content creators sell curated training datasets. Buyers preview schema and sample rows before committing. Sellers retain the encryption key — data can't be redistributed without a new purchase.",
    example: "An AI lab purchases 200k labeled images for computer vision training. The seller proves dataset quality via preview samples and on-chain row counts before any money moves.",
    tags: ["training data", "labeled datasets", "model development"],
  },
  {
    industry: "Compliance & Risk",
    title: "Share audit data across organizations securely",
    desc: "Compliance teams share KYC verification results, sanctions screening data, or audit trails across institutions. The encrypted vault ensures data is only accessible to authorized purchasers — with a full on-chain receipt trail.",
    example: "A fintech purchases sanctions screening results from a compliance provider. Both parties have on-chain proof of the exchange, but the data itself is never exposed publicly.",
    tags: ["KYC data", "audit trails", "regulatory compliance"],
  },
];

export default function UseCases() {
  return (
    <section className="px-4 py-28 md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 border-t border-white/10 pt-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <div className="section-kicker">Real-world applications</div>
              <h2 className="mt-6 font-display text-[clamp(3.2rem,6vw,6.2rem)] uppercase leading-[0.88] tracking-[-0.02em]">
                Who uses
                <br />
                <span className="text-accent">VeilData?</span>
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg">
              Any organization that needs to buy or sell sensitive data without
              exposing the buyer, the contents, or the transaction details.
              VeilData replaces trust with cryptographic proof.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {useCases.map((uc) => (
            <article
              key={uc.industry}
              className="usecase-card group relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#101010] p-7 md:p-8 transition-all duration-300 hover:border-accent/20"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[0.68rem] font-mono uppercase tracking-[0.18em] text-accent">
                  {uc.industry}
                </span>
              </div>

              <h3 className="font-display text-[1.8rem] uppercase leading-[0.92] tracking-[-0.02em] md:text-[2rem]">
                {uc.title}
              </h3>

              <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                {uc.desc}
              </p>

              <div className="mt-5 rounded-xl border border-accent/10 bg-accent/5 p-4">
                <p className="text-[0.68rem] font-mono uppercase tracking-[0.18em] text-accent mb-2">
                  Example scenario
                </p>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {uc.example}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {uc.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/8 px-3 py-1 text-[0.62rem] font-mono uppercase tracking-[0.16em] text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
