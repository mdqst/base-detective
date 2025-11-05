import { createWalletClient, custom } from "viem";
import { base } from "viem/chains";
import contractABI from "../abi/SmartContractDetective.json";
import { sdk } from "@farcaster/miniapp-sdk";

export const contractAddress = "0xfbc5fbe823f76964de240433ad00651a76c672c8";

/**
 * Получаем Farcaster-провайдер
 */
export async function getFarcasterProvider(sdkInstance: typeof sdk) {
  try {
    if (sdkInstance?.wallet?.ethProvider) return sdkInstance.wallet.ethProvider;
    console.warn("⚠️ Farcaster provider not found via SDK");
    return null;
  } catch (err) {
    console.error("❌ getFarcasterProvider failed:", err);
    return null;
  }
}

/**
 * Записывает результат расследования.
 * Если контракт требует startCase — вызывает его автоматически.
 */
export async function completeCaseTx(provider: any, caseId: number, score: number) {
  if (!provider) throw new Error("No provider connected");

  const walletClient = createWalletClient({
    chain: base,
    transport: custom(provider),
  });

  const [account] = await walletClient.getAddresses();

  try {
    // 🟢 Пытаемся сразу записать результат
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
    console.warn("⚠️ completeCase failed:", err.message || err);

    // Если контракт требует startCase()
    if (err.message?.includes("#1002") || err.message?.includes("Start case first")) {
      console.log("🟡 Calling startCase first...");

      try {
        // 1️⃣ startCase
        const startTx = await walletClient.writeContract({
          address: contractAddress as `0x${string}`,
          abi: contractABI.abi,
          functionName: "startCase",
          args: [caseId],
          account,
          value: BigInt(0),
        });
        console.log("🟢 startCase TX:", startTx);

        // 2️⃣ completeCase
        const retryTx = await walletClient.writeContract({
          address: contractAddress as `0x${string}`,
          abi: contractABI.abi,
          functionName: "completeCase",
          args: [caseId, score],
          account,
        });
        console.log("✅ completeCase TX after startCase:", retryTx);
        return retryTx;
      } catch (innerErr) {
        console.error("❌ startCase or retry completeCase failed:", innerErr);
        throw innerErr;
      }
    }

    throw err;
  }
}
