/**
 * Privara/ReineiraOS SDK integration for confidential USDC escrow payments.
 * Dynamically imported to avoid Node.js module issues in browser bundle.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sdkInstance: any = null;

/**
 * Initialize Privara SDK with a wagmi wallet client.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getPrivaraSDK(walletClient: any): Promise<any> {
  if (sdkInstance) return sdkInstance;

  const { ReineiraSDK, walletClientToSigner } = await import("@reineira-os/sdk");
  const signer = await walletClientToSigner(walletClient);
  sdkInstance = ReineiraSDK.create({
    signer,
    network: "testnet" as const,
  });
  await sdkInstance.initialize();

  return sdkInstance;
}

/**
 * Create a confidential escrow for a data purchase.
 * Amount is encrypted via FHE — neither the chain nor observers can see the payment amount.
 */
export async function createPurchaseEscrow(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sdk: any,
  sellerAddress: string,
  amount: number
) {
  const { usdc } = await import("@reineira-os/sdk");
  const escrow = await sdk.escrow.create({
    amount: usdc(amount),
    owner: sellerAddress,
  });
  return escrow;
}

/**
 * Fund an escrow with USDC (auto-approves).
 */
export async function fundEscrow(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  escrow: any,
  amount: number
) {
  const { usdc } = await import("@reineira-os/sdk");
  return escrow.fund(usdc(amount), { autoApprove: true });
}

/**
 * Format USDC amount for display.
 */
export function formatUSDC(amount: number): string {
  return `${amount.toFixed(2)} USDC`;
}
