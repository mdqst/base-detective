import { createWalletClient, custom, createPublicClient, http } from "viem";
import { base } from "viem/chains";
import contractABI from "../abi/SmartContractDetective.json";
import { sdk } from "@farcaster/miniapp-sdk";

export const contractAddress = "0xfbc5fbe823f76964de240433ad00651a76c672c8";

/**
 * Получение Farcaster provider, если miniapp запущен внутри клиента
 */
export async function getFarcasterProvider(sdkInstance: typeof sdk) {
  try {
    const provider = await sdkInstance.wallet.requestProvider();
    return provider;
  } catch (err) {
    console.error("❌ Failed to get Farcaster provider:", err);
    return null;
  }
}

/**
 * Старт расследования (вызов startCase)
 * @param provider - EIP-1193 провайдер
 * @param caseId - ID кейса
 * @param value - ETH value (по умолчанию 0n)
 */
export async function startCaseTx(
  provider: any,
  caseId: number,
  value: bigint = 0n
) {
  if (!provider) throw new Error("No provider connected");

  const walletClient = createWalletClient({
    chain: base,
    transport: custom(provider),
  });

  const [account] = await walletClient.getAddresses();

  console.log("🔹 startCase:", { caseId, value, account });

  const txHash = await walletClient.writeContract({
    address: contractAddress as `0x${string}`,
    abi: contractABI,
    functionName: "startCase",
    args: [caseId],
    account,
    value, // 🚫 без оплаты
  });

  console.log("✅ startCase tx:", txHash);
  return txHash;
}

/**
 * Завершение расследования (вызов completeCase)
 * @param provider - EIP-1193 провайдер
 * @param caseId - ID кейса
 * @param result - результат (1, 2, 3)
 */
export async function completeCaseTx(
  provider: any,
  caseId: number,
  result: number
) {
  if (!provider) throw new Error("No provider connected");

  const walletClient = createWalletClient({
    chain: base,
    transport: custom(provider),
  });

  const [account] = await walletClient.getAddresses();

  console.log("🔹 completeCase:", { caseId, result, account });

  const txHash = await walletClient.writeContract({
    address: contractAddress as `0x${string}`,
    abi: contractABI,
    functionName: "completeCase",
    args: [caseId, result],
    account,
  });

  console.log("✅ completeCase tx:", txHash);
  return txHash;
}

/**
 * Получение статуса расследования из контракта (только чтение)
 * Проверяет, проходил ли пользователь квест, и возвращает его данные
 * @param address - адрес игрока
 * @param caseId - ID кейса
 */
export async function getCaseStatus(address: string, caseId: number) {
  try {
    const publicClient = createPublicClient({
      chain: base,
      transport: http("https://mainnet.base.org"),
    });

    console.log("🔍 getCaseStatus:", { address, caseId });

    // ⚠️ ВАЖНО: название view-функции должно совпадать с контрактом
    // Ниже пример — замени "getCase" на фактическую view-функцию в ABI
    const data = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: contractABI,
      functionName: "getCase",
      args: [address, caseId],
    });

    console.log("📄 Case status:", data);
    return data;
  } catch (err) {
    console.error("❌ Error reading case status:", err);
    return null;
  }
}
