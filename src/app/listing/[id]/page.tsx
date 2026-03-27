"use client";

import { useRef, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { motion } from "framer-motion";
import { useAccount, useWriteContract } from "wagmi";
import Footer from "@/components/shared/Footer";
import { buildPurchaseArgs, buildRateSellerArgs, stringToBytes32 } from "@/lib/fhenix";
import { fetchListing, createPurchase, fetchPurchases, fetchSellerRatings, createRating, ListingRecord, SellerRatings } from "@/lib/listings";
import { decryptBlob, unpackKey } from "@/lib/crypto";
import { fetchFromWalrus } from "@/lib/walrus";

export default function ListingPage() {
  const { id } = useParams();
  const pageRef = useRef<HTMLDivElement>(null);
  const { address, isConnected: connected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [listing, setListing] = useState<ListingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [txResult, setTxResult] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [alreadyBought, setAlreadyBought] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sellerRatings, setSellerRatings] = useState<SellerRatings | null>(null);
  const [ratingScore, setRatingScore] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [previewData, setPreviewData] = useState<string[][] | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchListing(id as string).then((found) => {
      if (cancelled) return;
      setListing(found);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (!address || !listing) return;
    let cancelled = false;
    fetchPurchases(address).then((purchases) => {
      if (cancelled) return;
      const bought = purchases.some((p) => p.listingId === listing.listingId);
      setAlreadyBought(bought);
    });
    return () => { cancelled = true; };
  }, [address, listing?.listingId]);

  // Load seller ratings
  useEffect(() => {
    if (!listing) return;
    fetchSellerRatings(listing.seller).then(setSellerRatings);
  }, [listing?.seller]);

  // Load preview data
  useEffect(() => {
    if (!listing?.previewBlobId) return;
    setPreviewLoading(true);
    fetchFromWalrus(listing.previewBlobId)
      .then((data) => {
        const text = new TextDecoder().decode(data);
        const rows = text.split("\n").filter(Boolean).map((row) => row.split(","));
        setPreviewData(rows.slice(0, 21)); // header + 20 rows max
      })
      .catch(() => setPreviewData(null))
      .finally(() => setPreviewLoading(false));
  }, [listing?.previewBlobId]);

  const handleRate = async () => {
    if (!address || !writeContractAsync || !listing || ratingScore === 0) return;
    setRatingLoading(true);
    try {
      const txArgs = buildRateSellerArgs({
        listingId: listing.listingId,
        score: ratingScore,
      });
      const txHash = await writeContractAsync(txArgs);
      if (!txHash) throw new Error("Rating rejected");

      await createRating({
        listingId: listing.listingId,
        buyer: address,
        seller: listing.seller,
        score: ratingScore,
        txId: txHash,
      });
      setRatingSubmitted(true);
      // Refresh ratings
      fetchSellerRatings(listing.seller).then(setSellerRatings);
    } catch (err) {
      console.error("Rating failed:", err);
    } finally {
      setRatingLoading(false);
    }
  };

  const [animationPlayed, setAnimationPlayed] = useState(false);

  useGSAP(
    () => {
      if (!listing || animationPlayed) return;
      setAnimationPlayed(true);
      const tl = gsap.timeline({ delay: 0.2 });
      tl.from(".listing-header", { y: 30, opacity: 0, duration: 0.7, ease: "power3.out" })
        .from(".listing-body", { y: 40, opacity: 0, duration: 0.7, ease: "power3.out" }, "-=0.4")
        .from(".listing-sidebar", { y: 50, opacity: 0, duration: 0.7, ease: "power3.out" }, "-=0.4");
    },
    { scope: pageRef, dependencies: [listing, animationPlayed] }
  );

  const handlePurchase = async () => {
    if (!address || !writeContractAsync || !listing) return;
    setPurchasing(true);
    setError("");

    try {
      const txArgs = buildPurchaseArgs({
        listingId: listing.listingId,
        price: listing.price,
      });

      const txHash = await writeContractAsync(txArgs);
      if (!txHash) {
        throw new Error("Transaction was rejected by wallet");
      }

      setTxResult(txHash);

      // Record the purchase in database
      await createPurchase({
        listingId: listing.listingId,
        buyer: address,
        seller: listing.seller,
        amount: listing.price,
        blobHash: stringToBytes32(listing.blobId),
        txId: txHash,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Transaction was rejected by wallet";
      console.error("Purchase failed:", err);
      setError(message);
    } finally {
      setPurchasing(false);
    }
  };

  const handleDownload = async () => {
    if (!address || !listing) return;
    setDownloading(true);
    setError("");
    try {
      // Fetch decryption key from API
      const keyRes = await fetch(`/api/listings/${listing.listingId}/key?address=${address}`);
      if (!keyRes.ok) {
        const data = await keyRes.json();
        throw new Error(data.error || "Could not retrieve decryption key");
      }
      const { encryptionKey } = await keyRes.json();
      const { key, iv } = unpackKey(encryptionKey);

      // Fetch encrypted blob from Walrus
      const encryptedData = await fetchFromWalrus(listing.blobId);

      // Decrypt
      const decrypted = await decryptBlob(encryptedData, key, iv);

      // Download
      const blob = new Blob([decrypted]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${listing.title.replace(/\s+/g, "_")}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Download failed";
      console.error("Download failed:", err);
      setError(message);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Listing not found</h1>
          <p className="text-muted mb-4">This listing doesn&apos;t exist or hasn&apos;t been indexed yet.</p>
          <Link href="/marketplace" className="text-accent hover:underline">
            Back to marketplace
          </Link>
        </div>
      </div>
    );
  }

  const schemaFields = listing.schemaFields.split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <div ref={pageRef}>
      <main className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="listing-header mb-8">
            <Link href="/marketplace" className="text-sm text-muted hover:text-foreground transition-colors font-mono">
              &larr; Back to Marketplace
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main content */}
            <div className="listing-body flex-1">
              {/* Category badge */}
              <span className="inline-block text-xs font-mono px-3 py-1 rounded-full border border-accent/20 bg-accent/10 text-accent mb-4">
                {listing.category}
              </span>

              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {listing.title}
              </h1>

              <p className="text-text-secondary text-lg leading-relaxed mb-8">
                {listing.description}
              </p>

              {/* Data Properties */}
              <div className="glass-card rounded-2xl p-6 mb-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">
                  Data Properties
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-xs text-muted">Rows</span>
                    <p className="text-xl font-bold">{listing.rowCount.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted">Columns</span>
                    <p className="text-xl font-bold">{schemaFields.length}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted">Storage</span>
                    <p className="text-xl font-bold">Walrus</p>
                  </div>
                </div>
              </div>

              {/* Schema */}
              <div className="glass-card rounded-2xl p-6 mb-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">
                  Schema
                </h3>
                <div className="flex flex-wrap gap-2">
                  {schemaFields.map((col) => (
                    <span
                      key={col}
                      className="text-sm font-mono px-3 py-1.5 rounded-lg bg-secondary border border-border text-text-secondary"
                    >
                      {col}
                    </span>
                  ))}
                </div>
              </div>

              {/* Data Preview — always shown */}
              <div className="glass-card rounded-2xl p-6 mb-6 border border-accent/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-accent">
                    Data Preview
                  </h3>
                  <span className="text-[0.62rem] font-mono uppercase tracking-[0.18em] text-muted">
                    Verify before you buy
                  </span>
                </div>
                {previewLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : previewData && previewData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-mono">
                      <thead>
                        <tr className="border-b border-border">
                          {previewData[0].map((header, i) => (
                            <th key={i} className="text-left py-2 px-3 text-accent font-semibold">
                              {header.trim()}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.slice(1).map((row, ri) => (
                          <tr key={ri} className="border-b border-border/50 hover:bg-white/5">
                            {row.map((cell, ci) => (
                              <td key={ci} className="py-2 px-3 text-text-secondary">
                                {cell.trim()}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="text-xs text-muted mt-3">
                      Showing sample rows — purchase to access full dataset ({listing.rowCount.toLocaleString()} rows)
                    </p>
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <p className="text-sm text-muted">No preview available for this listing</p>
                    <p className="text-xs text-muted mt-1">This listing was created before preview was required</p>
                  </div>
                )}
              </div>

              {/* On-chain info */}
              <div className="glass-card rounded-2xl p-6 mb-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">
                  On-Chain Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-text-secondary">Program</span>
                    <span className="font-mono text-xs text-accent">VeilDataMarket (Fhenix)</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-text-secondary">Listing ID</span>
                    <span className="font-mono text-xs text-muted">{listing.listingId.slice(0, 20)}...</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-text-secondary">Blob ID (Walrus)</span>
                    <span className="font-mono text-xs text-muted">{listing.blobId.slice(0, 20)}...</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-text-secondary">Create Tx</span>
                    <span className="font-mono text-xs text-muted">{listing.txId.slice(0, 20)}...</span>
                  </div>
                </div>
              </div>

              {/* Privacy info */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">
                  Privacy Model
                </h3>
                <div className="space-y-3 text-sm">
                  {[
                    { label: "Data contents", status: "Encrypted (AES-256-GCM)", private: true },
                    { label: "Buyer identity", status: "Hidden via FHE", private: true },
                    { label: "Payment amount", status: "ETH escrow (on-chain)", private: true },
                    { label: "Row count", status: "Public (on-chain)", private: false },
                    { label: "Schema structure", status: "Public", private: false },
                    { label: "Storage", status: "Walrus (decentralized)", private: false },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <span className="text-text-secondary">{item.label}</span>
                      <span className={`font-mono text-xs ${item.private ? "text-accent" : "text-muted"}`}>
                        {item.private ? "🔒" : "📋"} {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="listing-sidebar lg:w-80 shrink-0">
              <div className="glass-card rounded-2xl p-6 lg:sticky lg:top-28">
                {/* Price */}
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold text-accent">{listing.price}</span>
                  <span className="text-lg text-muted ml-2">ETH</span>
                </div>

                {/* Transaction result */}
                {txResult && (
                  <div className="mb-4 p-3 rounded-xl bg-accent/10 border border-accent/20">
                    <p className="text-xs text-accent font-semibold mb-1">Purchase Submitted</p>
                    <p className="text-xs text-muted font-mono break-all">{txResult}</p>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <p className="text-xs text-red-400">{error}</p>
                  </div>
                )}

                {/* Buy / Download button */}
                {alreadyBought || txResult ? (
                  <div className="space-y-3 mb-4">
                    <div className="w-full py-3 text-center text-sm text-accent border border-accent/30 bg-accent/5 rounded-full">
                      Purchased
                    </div>
                    <motion.button
                      onClick={handleDownload}
                      disabled={downloading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 bg-accent text-black font-semibold rounded-full text-lg hover:bg-accent-dim transition-colors disabled:opacity-50"
                    >
                      {downloading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          Decrypting...
                        </span>
                      ) : (
                        "Download Data"
                      )}
                    </motion.button>
                  </div>
                ) : !connected ? (
                  <div className="w-full py-4 text-center text-sm text-muted border border-border rounded-full mb-4">
                    Connect MetaMask to purchase
                  </div>
                ) : address === listing.seller ? (
                  <div className="w-full py-4 text-center text-sm text-muted border border-border rounded-full mb-4">
                    This is your listing
                  </div>
                ) : (
                  <motion.button
                    onClick={handlePurchase}
                    disabled={purchasing || !!txResult || alreadyBought}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-accent text-black font-semibold rounded-full text-lg hover:bg-accent-dim transition-colors mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {purchasing ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Approve in MetaMask...
                      </span>
                    ) : txResult ? (
                      "Purchased"
                    ) : (
                      "Purchase Dataset"
                    )}
                  </motion.button>
                )}

                <p className="text-xs text-muted text-center mb-6">
                  {listing.price} ETH paid directly to seller via the marketplace contract.
                  Download is available immediately after purchase.
                </p>

                {/* Seller info + reputation */}
                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Seller</span>
                    <span className="font-mono text-xs">
                      {listing.seller.slice(0, 10)}...
                    </span>
                  </div>
                  {sellerRatings && sellerRatings.count > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted">Rating</span>
                      <span className="flex items-center gap-1.5">
                        <span className="text-accent">{"★".repeat(Math.round(sellerRatings.average))}</span>
                        <span className="text-muted text-xs">{sellerRatings.average} ({sellerRatings.count})</span>
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Payment</span>
                    <span className="text-accent font-mono text-xs">Direct ETH</span>
                  </div>
                </div>

                {/* Rate seller (only for buyers who purchased) */}
                {(alreadyBought || txResult) && !ratingSubmitted && (
                  <div className="border-t border-border pt-4 mt-4">
                    <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Rate Seller</h4>
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRatingScore(star)}
                          className={`text-2xl transition-colors ${
                            star <= ratingScore ? "text-accent" : "text-muted/30"
                          } hover:text-accent`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    {ratingScore > 0 && (
                      <motion.button
                        onClick={handleRate}
                        disabled={ratingLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-2.5 text-sm bg-accent/10 border border-accent/30 text-accent rounded-full hover:bg-accent/20 transition-colors disabled:opacity-50"
                      >
                        {ratingLoading ? "Submitting..." : `Submit ${ratingScore}-star rating`}
                      </motion.button>
                    )}
                  </div>
                )}
                {ratingSubmitted && (
                  <div className="border-t border-border pt-4 mt-4">
                    <p className="text-xs text-accent text-center">Rating submitted on-chain</p>
                  </div>
                )}

                {/* Flow info */}
                <div className="border-t border-border pt-4 mt-4">
                  <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Purchase Flow</h4>
                  <div className="space-y-2 text-xs text-text-secondary">
                    <div className="flex gap-2">
                      <span className="text-accent font-mono">1.</span>
                      <span>Sign transaction — ETH sent directly to seller</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-accent font-mono">2.</span>
                      <span>Decryption key is delivered automatically</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-accent font-mono">3.</span>
                      <span>Download and decrypt the data instantly</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
