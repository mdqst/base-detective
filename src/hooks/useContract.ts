import { createWalletClient, custom, createPublicClient, http } from "viem";
import { base } from "viem/chains";
import contractABI from "../abi/SmartContractDetective.json";
import { sdk } from "@farcaster/miniapp-sdk";

export const contractAddress = "0xfbc5fbe823f76964de240433ad00651a76c672c8";

/**
 * Возвращает Farcaster-провайдер, если он доступен
 */
export async function getFarcasterProvider(sdkInstance: typeof sdk) {
  try {
    if (sdkInstance?.wallet?.ethProvider) {
      return sdkInstance.wallet.ethProvider;
    } else {
      console.warn("⚠️ Farcaster provider not found via SDK");
      return null;
    }
  } catch (err) {
    console.error("❌ getFarcasterProvider failed:", err);
    return null;
  }
}

/**
 * Только запись результата расследования (одна транзакция)
 */
export async function completeCaseTx(provider: any, caseId: number, score: number) {
  if (!provider) throw new Error("No provider connected");

  const publicClient = createPublicClient({
    chain: base,
    transport: http(),
  });

  const walletClient = createWalletClient({
    chain: base,
    transport: custom(provider),
  });

  const [account] = await walletClient.getAddresses();

  try {
    const completeTx = await walletClient.writeContract({
      address: contractAddress as `0x${string}`,
      abi: contractABI.abi,
      functionName: "completeCase",
      args: [caseId, score],
      account,
    });

    console.log("✅ completeCase TX:", completeTx);
    return completeTx;
  } catch (err: any) {
    console.error("❌ completeCaseTx failed:", err);

    // 🔍 Контракт вернул #1002 — пользователь не стартовал кейс
    if (err.message?.includes("#1002")) {
      alert("Please start the case first on-chain before completing it.");
    }

    throw err;
  }
}
