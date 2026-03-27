"use client";

import { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ListingCard, { ListingData } from "./ListingCard";
import { fetchListings } from "@/lib/listings";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

const categories = [
  "All",
  "Finance",
  "Healthcare",
  "Social",
  "Analytics",
  "AI",
  "Geospatial",
];

export default function MarketplaceGrid() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [listings, setListings] = useState<ListingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadListings() {
      setLoading(true);
      const data = await fetchListings(activeCategory);
      if (cancelled) return;

      const mapped: ListingData[] = data.map((listing) => ({
        id: listing.listingId,
        title: listing.title,
        description: listing.description,
        category: listing.category,
        rowCount: listing.rowCount,
        price: listing.price,
        seller: listing.seller,
        schemaPreview: listing.schemaFields
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        salesCount: 0,
      }));

      setListings(mapped);
      setLoading(false);
    }

    void loadListings();

    return () => {
      cancelled = true;
    };
  }, [activeCategory]);

  useGSAP(
    () => {
      if (listings.length === 0) return;
      gsap.from(".listing-card", {
        y: 34,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.07,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });
    },
    { scope: sectionRef, dependencies: [listings] }
  );

  return (
    <section id="marketplace" ref={sectionRef} className="px-4 py-28 md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 border-t border-white/10 pb-10 pt-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <div className="section-kicker">Marketplace</div>
            <h2 className="mt-6 font-display text-[clamp(3.2rem,6vw,6.2rem)] uppercase leading-[0.88] tracking-[-0.01em]">
              Buy the signal.
              <br />
              <span className="text-accent">Unlock the file later.</span>
            </h2>
          </div>

          <div className="space-y-6">
            <p className="max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg">
              The board should feel selective. Each listing is a proposition,
              not a pile of metadata. The structure below is tighter and more
              editorial for that reason.
            </p>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full border px-4 py-2 text-xs font-mono uppercase tracking-[0.18em] transition-all duration-300 ${
                    activeCategory === category
                      ? "border-accent bg-accent text-black"
                      : "border-white/10 text-muted hover:border-accent/30 hover:text-foreground"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <div key={listing.id} className="listing-card">
                <ListingCard listing={listing} />
              </div>
            ))}
          </div>
        ) : (
          <div className="border-t border-white/10 py-16">
            <div className="max-w-xl">
              <p className="font-display text-[3rem] uppercase leading-[0.9] tracking-[-0.01em] text-accent">
                No listings yet.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                That is normal for a fresh market. The first strong listing sets
                the tone for the rest of the board.
              </p>
              <Link
                href="/sell"
                className="mt-8 inline-flex rounded-full bg-accent px-8 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black transition-transform duration-300 hover:-translate-y-1"
              >
                Create the first listing
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
