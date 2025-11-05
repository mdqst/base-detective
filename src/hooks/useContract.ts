import { createWalletClient, custom, encodeAbiParameters, keccak256, toHex } from "viem";
import { base } from "viem/chains";
import contractABI from "../abi/SmartContractDetective.json";
import { sdk } from "@farcaster/miniapp-sdk";

export const contractAddress = "0xfbc5fbe823f76964de240433ad00651a76c672c8";

/**
 * Возвращает Farcaster-провайдер
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
 * Полностью записывает результат расследования в одной транзакции
 * — вызывает startCase() + completeCase() через multicall.
 */
export async function completeCaseTx(provider: any, caseId: number, score: number) {
  if (!provider) throw new Error("No provider connected");

  const walletClient = createWalletClient({
    chain: base,
    transport: custom(provider),
  });

  const [account] = await walletClient.getAddresses();

  try {
    // 🧠 multicall: вызывает startCase и completeCase в одной транзакции
    const txHash = await walletClient.writeContract({
      address: contractAddress as `0x${string}`,
      abi: contractABI.abi,
      functionName: "multicall",
      args: [
        [
          // startCase
          encodeFunctionCall("startCase", [caseId]),
          // completeCase
          encodeFunctionCall("completeCase", [caseId, score]),
        ],
      ],
      account,
    });

    console.log("✅ multicall TX:", txHash);
    return txHash;
  } catch (err: any) {
    console.error("❌ completeCaseTx failed:", err);

    // fallback: если multicall() отсутствует
    if (err.message?.includes("function selector was not recognized")) {
      console.warn("⚠️ Contract has no multicall(). Falling back to single call.");
      const fallbackTx = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi: contractABI.abi,
        functionName: "completeCase",
        args: [caseId, score],
        account,
      });
      return fallbackTx;
    }

    throw err;
  }
}

/**
 * Кодирует вызов функции в байты (для multicall)
 */
function encodeFunctionCall(name: string, args: any[]) {
  const iface = (contractABI as any).abi ?? contractABI;
  const fn = iface.find((f: any) => f.name === name && f.type === "function");
  if (!fn) throw new Error(`Function ${name} not found in ABI`);

  const types = fn.inputs.map((i: any) => i.type);
  const values = args;
  const selector = getSelector(name, types);
  const encodedArgs = encodeArgs(types, values);
  return selector + encodedArgs.slice(2);
}

/**
 * Получает 4-байтный selector из имени и типов (через viem)
 */
function getSelector(name: string, types: string[]) {
  const signature = `${name}(${types.join(",")})`;
  const hash = keccak256(toHex(signature));
  return "0x" + hash.substring(2, 10);
}

/**
 * Кодирует аргументы для вызова функции
 */
function encodeArgs(types: string[], values: any[]) {
  try {
    return encodeAbiParameters(
      types.map((t) => ({ type: t })),
      values
    );
  } catch (err) {
    console.warn("⚠️ Could not encode args via viem:", err);
    return "0x";
  }
}
