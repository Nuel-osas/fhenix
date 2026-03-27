"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export interface ListingData {
  id: string;
  title: string;
  description: string;
  category: string;
  rowCount: number;
  price: number;
  seller: string;
  schemaPreview: string[];
  salesCount: number;
  sellerRating?: number;
  sellerRatingCount?: number;
  hasPreview?: boolean;
}

const categoryColors: Record<string, string> = {
  finance: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  healthcare: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  social: "bg-purple-500/10 text-purple-300 border-purple-500/20",
  geospatial: "bg-orange-500/10 text-orange-300 border-orange-500/20",
  analytics: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  ai: "bg-pink-500/10 text-pink-300 border-pink-500/20",
  default: "bg-accent/10 text-accent border-accent/20",
};

export default function ListingCard({ listing }: { listing: ListingData }) {
  const colorClass =
    categoryColors[listing.category.toLowerCase()] || categoryColors.default;

  return (
    <Link href={`/listing/${listing.id}`}>
      <motion.article
        whileHover={{ y: -8 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="group relative h-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#101010] p-6"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,255,59,0.14),transparent_30%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-lg text-muted transition-all duration-300 group-hover:border-accent/30 group-hover:text-accent">
          &rarr;
        </div>

        <div className="relative flex h-full flex-col">
          <div className="mb-8 flex items-start justify-between pr-14">
            <span
              className={`rounded-full border px-3 py-1 text-[0.68rem] font-mono uppercase tracking-[0.18em] ${colorClass}`}
            >
              {listing.category}
            </span>
            <div className="text-right">
              <p className="font-display text-[2rem] uppercase leading-none tracking-[-0.02em] text-accent">
                {listing.price}
              </p>
              <p className="text-[0.68rem] font-mono uppercase tracking-[0.18em] text-muted">
                ETH
              </p>
            </div>
          </div>

          <h3 className="max-w-[12ch] font-display text-[2.2rem] uppercase leading-[0.9] tracking-[-0.01em] transition-colors duration-300 group-hover:text-accent">
            {listing.title}
          </h3>

          <p className="mt-4 flex-1 text-sm leading-relaxed text-text-secondary">
            {listing.description}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {listing.schemaPreview.slice(0, 3).map((column) => (
              <span
                key={column}
                className="rounded-full border border-white/8 px-3 py-1 text-[0.62rem] font-mono uppercase tracking-[0.16em] text-muted"
              >
                {column}
              </span>
            ))}
            {listing.schemaPreview.length > 3 && (
              <span className="rounded-full border border-white/8 px-3 py-1 text-[0.62rem] font-mono uppercase tracking-[0.16em] text-muted">
                +{listing.schemaPreview.length - 3} fields
              </span>
            )}
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
            <div>
              <p className="text-[0.62rem] font-mono uppercase tracking-[0.18em] text-muted">
                Seller
              </p>
              <p className="mt-2 text-xs font-mono text-foreground">
                {listing.seller.slice(0, 8)}...
              </p>
            </div>
            <div className="text-center">
              <p className="text-[0.62rem] font-mono uppercase tracking-[0.18em] text-muted">
                Rating
              </p>
              <p className="mt-2 text-xs text-foreground">
                {listing.sellerRating ? (
                  <span className="text-accent">★ {listing.sellerRating}</span>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[0.62rem] font-mono uppercase tracking-[0.18em] text-muted">
                Rows
              </p>
              <p className="mt-2 text-xs text-foreground">
                {listing.rowCount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}
