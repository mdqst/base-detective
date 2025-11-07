import { createWalletClient, custom } from "viem";
import { base } from "viem/chains";
import contractABI from "../abi/SmartContractDetective.json";

export const contractAddress = "0xfbc5fbe823f76964de240433ad00651a76c672c8";

/**
 * Берём провайдер из Farcaster Miniapp SDK.
 * В index.tsx ты передаёшь сюда sdk: getFarcasterProvider(sdk)
 */
export async function getFarcasterProvider(sdkInstance: any) {
  try {
    // Новый способ в miniapp-sdk: ethProvider вместо requestProvider
    const provider = sdkInstance.wallet.ethProvider;
    if (!provider) {
      throw new Error("Farcaster ethProvider is not available");
    }
    return provider;
  } catch (err) {
    console.error("❌ Failed to get Farcaster provider:", err);
    return null;
  }
}

/**
 * Записываем результат прохождения кейса в контракт.
 * caseId — номер кейса, result — условный результат (у тебя сейчас 1).
 */
export async function completeCaseTx(
  provider: any,
  caseId: number,
  result: number
) {
  if (!provider) {
    throw new Error("Provider not found");
  }

  // Клиент поверх Farcaster-провайдера
  const walletClient = createWalletClient({
    chain: base,
    transport: custom(provider),
  });

  const [account] = await walletClient.getAddresses();

  // ✅ Проверка сети: Base Mainnet (0x2105)
  const chainId = await provider.request({ method: "eth_chainId" });
  if (chainId !== "0x2105") {
    alert("Please switch to Base Mainnet to record your result.");
    return;
  }

  // ✅ Проверка баланса на газ
  const balanceHex = await provider.request({
    method: "eth_getBalance",
    params: [account, "latest"],
  });
  const balance = BigInt(balanceHex as string);
  const minBalance = BigInt("50000000000000"); // ~0.00005 ETH

  if (balance < minBalance) {
    alert("You need some ETH on Base to cover gas fees.");
    return;
  }

  console.log("🚀 Sending TX from:", account);

  try {
    const hash = await walletClient.writeContract({
      address: contractAddress as `0x${string}`,
      // ABI может быть либо целиком, либо в поле abi
      abi: (contractABI as any).abi || (contractABI as any),
      functionName: "completeCase",
      args: [BigInt(caseId), BigInt(result)],
      account,
    });

    console.log("✅ TX sent:", hash);
    return hash;
  } catch (err: any) {
    console.error("❌ TX error:", err);

    if (err?.message?.toLowerCase().includes("simulation failed")) {
      alert(
        "Simulation failed when trying to record your result. The contract may require different conditions."
      );
    } else {
      alert("Failed to record result. Please try again later.");
    }

    throw err;
  }
}
