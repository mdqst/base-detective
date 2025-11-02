import {
  createWalletClient,
  custom,
  createPublicClient,
  http,
} from "viem";
import { base } from "viem/chains";
import contractABI from "../abi/SmartContractDetective.json";
import { sdk } from "@farcaster/miniapp-sdk";

export const contractAddress =
  "0xfbc5fbe823f76964de240433ad00651a76c672c8";

/**
 * Получает Farcaster provider (новый API)
 * Если miniapp запущен в Farcaster — вернёт встроенный кошелёк
 * Если нет — fallback к WalletConnect (через window.ethereum)
 */
export async function getFarcasterProvider(sdkInstance: typeof sdk) {
  try {
    // ✅ Новый API: провайдер доступен напрямую
    const provider = sdkInstance.wallet?.ethProvider;

    if (provider) {
      console.log("🟢 Farcaster provider detected");
      return provider;
    }

    // 🔄 fallback — если miniapp открыт вне Farcaster (например, в браузере)
    if (typeof window !== "undefined" && (window as any).ethereum) {
      console.log("🟡 Using browser or WalletConnect provider");
      return (window as any).ethereum;
    }

    throw new Error("No provider found (Farcaster or WalletConnect).");
  } catch (err) {
    console.error("❌ Failed to get provider:", err);
    return null;
  }
}

/**
 * Старт расследования (startCase)
 * @param provider EIP-1193 provider
 * @param caseId ID кейса
 * @param value Сумма в wei (по умолчанию 0n — без оплаты)
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
 * Завершение расследования (completeCase)
 * @param provider EIP-1193 provider
 * @param caseId ID кейса
 * @param result Результат (1, 2, 3)
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
 * Получает статус расследования для игрока (view-функция)
 * @param address адрес игрока
 * @param caseId ID кейса
 */
export async function getCaseStatus(address: string, caseId: number) {
  try {
    const publicClient = createPublicClient({
      chain: base,
      transport: http("https://mainnet.base.org"),
    });

    console.log("🔍 getCaseStatus:", { address, caseId });

    // ⚠️ ЗАМЕНИ имя функции ниже, если в контракте оно другое
    // например: "playerCases" или "cases"
    const data = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: contractABI,
      functionName: "getCase", // <-- если контракт возвращает структуру по игроку
      args: [address, caseId],
    });

    console.log("📄 Case status:", data);
    return data;
  } catch (err) {
    console.error("❌ Error reading case status:", err);
    return null;
  }
}
