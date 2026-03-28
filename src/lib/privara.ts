/**
 * Privara/ReineiraOS SDK integration for confidential USDC escrow payments.
 * Used for privacy-preserving marketplace settlements.
 */

import { ReineiraSDK, walletClientToSigner, usdc, TESTNET_ADDRESSES } from "@reineira-os/sdk";

let sdkInstance: ReineiraSDK | null = null;

/**
 * Initialize Privara SDK with a wagmi wallet client.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getPrivaraSDK(walletClient: any): Promise<ReineiraSDK> {
  if (sdkInstance) return sdkInstance;

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
  sdk: ReineiraSDK,
  sellerAddress: string,
  amount: number
) {
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
  escrow: { fund: (amount: ReturnType<typeof usdc>, opts?: { autoApprove?: boolean }) => Promise<unknown> },
  amount: number
) {
  return escrow.fund(usdc(amount), { autoApprove: true });
}

/**
 * Format USDC amount for display.
 */
export function formatUSDC(amount: number): string {
  return `${amount.toFixed(2)} USDC`;
}

export { usdc, TESTNET_ADDRESSES };
