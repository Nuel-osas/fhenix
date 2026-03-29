/**
 * Privara/ReineiraOS SDK integration for confidential USDC escrow payments.
 * Dynamically imported to avoid Node.js module issues in browser bundle.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sdkInstance: any = null;

/**
 * Initialize Privara SDK with a wagmi wallet client.
 * Patches the provider's getFeeData to fix Arb Sepolia gas pricing.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getPrivaraSDK(walletClient: any): Promise<any> {
  if (sdkInstance) return sdkInstance;

  const { ReineiraSDK, walletClientToSigner } = await import("@reineira-os/sdk");
  const signer = await walletClientToSigner(walletClient);

  // Patch provider's getFeeData to return higher gas prices for Arb Sepolia
  // The SDK uses ethers internally and defaults to gas prices below base fee
  const provider = signer.provider;
  if (provider) {
    const originalGetFeeData = provider.getFeeData.bind(provider);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (provider as any).getFeeData = async () => {
      const feeData = await originalGetFeeData();
      const minGasPrice = BigInt(100000000); // 0.1 gwei
      return {
        ...feeData,
        gasPrice: feeData.gasPrice && feeData.gasPrice > minGasPrice ? feeData.gasPrice : minGasPrice,
        maxFeePerGas: feeData.maxFeePerGas && feeData.maxFeePerGas > minGasPrice ? feeData.maxFeePerGas * BigInt(2) : minGasPrice,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || BigInt(10000000),
      };
    };
  }

  sdkInstance = ReineiraSDK.create({
    signer,
    network: "testnet" as const,
  });
  await sdkInstance.initialize();

  return sdkInstance;
}

/**
 * Create a confidential escrow for a data purchase.
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
