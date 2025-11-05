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
 * Запускает кейс вручную (если нужно)
 */
export async function startCaseTx(provider: any, caseId: number) {
  if (!provider) throw new Error("No provider connected");

  const walletClient = createWalletClient({
    chain: base,
    transport: custom(provider),
  });

  const [account] = await walletClient.getAddresses();

  const hash = await walletClient.writeContract({
    address: contractAddress as `0x${string}`,
    abi: contractABI.abi,
    functionName: "startCase",
    args: [caseId],
    account,
    value: 0n, // без оплаты
  });

  console.log("📦 startCase TX:", hash);
  return hash;
}

/**
 * Записывает результат расследования (автоматически вызывает startCase, если нужно)
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
    // 🟡 1. Попробуем вызвать startCase, если он ещё не вызывался
    try {
      const startTx = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi: contractABI.abi,
        functionName: "startCase",
        args: [caseId],
        account,
        value: 0n,
      });
      console.log("🟢 startCase called automatically:", startTx);
    } catch (err) {
      console.log("ℹ️ startCase likely already done:", err);
    }

    // 🟢 2. Записываем результат расследования
    const completeTx = await walletClient.writeContract({
      address: contractAddress as `0x${string}`,
      abi: contractABI.abi,
      functionName: "completeCase",
      args: [caseId, score],
      account,
    });

    console.log("✅ completeCase TX:", completeTx);
    return completeTx;
  } catch (err) {
    console.error("❌ completeCaseTx failed:", err);
    throw err;
  }
}
