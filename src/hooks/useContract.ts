import { abi, contractAddress } from "../abi/SmartContractDetective";
import { createWalletClient, custom, getAddress, http } from "viem";
import { base } from "viem/chains";

export function getPublicClient() {
  // simple viem public client (read-only via RPC)
  return {
    chain: base,
    transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://mainnet.base.org")
  };
}

// get provider from Farcaster Mini App SDK
export async function getFarcasterProvider(sdk: any) {
  try {
    const provider = await sdk.wallet.getEthereumProvider();
    return provider;
  } catch (e) {
    return null;
  }
}

// write: startCase
export async function startCaseTx(provider: any, caseId: number) {
  if (!provider) throw new Error("No provider");
  const walletClient = createWalletClient({
    chain: base,
    transport: custom(provider),
  });

  const accounts = await walletClient.getAddresses();
  const account = accounts[0];

  const hash = await walletClient.writeContract({
    address: contractAddress as `0x${string}`,
    abi,
    functionName: "startCase",
    args: [caseId],
    account,
  });

  return hash;
}

// write: completeCase
export async function completeCaseTx(provider: any, caseId: number, result: number) {
  if (!provider) throw new Error("No provider");
  const walletClient = createWalletClient({
    chain: base,
    transport: custom(provider),
  });

  const accounts = await walletClient.getAddresses();
  const account = accounts[0];

  const hash = await walletClient.writeContract({
    address: contractAddress as `0x${string}`,
    abi,
    functionName: "completeCase",
    args: [caseId, result],
    account,
  });

  return hash;
}
