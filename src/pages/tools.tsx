import { motion } from "framer-motion";
import Footer from "../components/Footer";
import { useState } from "react";
import {
  createPublicClient,
  http,
  isAddress,
  getAddress,
  formatEther,
} from "viem";
import { base } from "viem/chains";

const client = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://mainnet.base.org"),
});

export default function ToolsPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function analyzeContract() {
    setError("");
    setResult(null);

    if (!isAddress(input)) {
      setError("❌ Invalid Ethereum address");
      return;
    }

    const address = getAddress(input);
    setLoading(true);

    try {
      // Получаем bytecode и баланс
      const [bytecode, balance] = await Promise.all([
        client.getBytecode({ address }),
        client.getBalance({ address }),
      ]);

      const verified = bytecode && bytecode.length > 2;
      let contractType = "EOA (Externally Owned Account)";
      let isProxy = false;

      if (verified) {
        // Пробуем определить тип контракта
        try {
          // ERC165 поддержка — определим ERC721 или ERC1155
          const erc165 = await client.readContract({
            address,
            abi: [
              {
                name: "supportsInterface",
                type: "function",
                stateMutability: "view",
                inputs: [{ name: "interfaceId", type: "bytes4" }],
                outputs: [{ name: "", type: "bool" }],
              },
            ],
            functionName: "supportsInterface",
            args: ["0x80ac58cd"], // ERC721
          });

          if (erc165) contractType = "ERC721 NFT";
          else {
            const erc1155 = await client.readContract({
              address,
              abi: [
                {
                  name: "supportsInterface",
                  type: "function",
                  stateMutability: "view",
                  inputs: [{ name: "interfaceId", type: "bytes4" }],
                  outputs: [{ name: "", type: "bool" }],
                },
              ],
              functionName: "supportsInterface",
              args: ["0xd9b67a26"], // ERC1155
            });
            if (erc1155) contractType = "ERC1155 Multi Token";
          }
        } catch {
          // Не поддерживает supportsInterface → возможно ERC20
          try {
            const symbol = await client.readContract({
              address,
              abi: [
                {
                  name: "symbol",
                  type: "function",
                  stateMutability: "view",
                  inputs: [],
                  outputs: [{ type: "string" }],
                },
              ],
              functionName: "symbol",
            });
            if (symbol) contractType = "ERC20 Token";
          } catch {
            // Может быть прокси?
            try {
              const implSlot =
                "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"; // EIP-1967 slot
              const impl = await client.getStorageAt({ address, slot: implSlot });
              if (impl && impl !== "0x0") {
                contractType = "Proxy Contract";
                isProxy = true;
              }
            } catch {
              contractType = "Custom Contract";
            }
          }
        }
      }

      setResult({
        address,
        verified,
        balance: formatEther(balance),
        contractType,
        isProxy,
      });
    } catch (err) {
      console.error(err);
      setError("⚠️ Failed to fetch contract data. Check the address and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center bg-background text-textPrimary px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md bg-surface rounded-2xl p-5 shadow-xl shadow-black/50 border border-white/10"
      >
        <header className="flex flex-col gap-1 mb-5">
          <h1 className="text-lg font-semibold text-white flex items-center gap-2">
            🧰 Onchain Tools
          </h1>
          <p className="text-[11px] text-textSecondary tracking-[0.05em]">
            Analyze any Base contract address
          </p>
        </header>

        <div className="flex flex-col gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter contract address (0x...)"
            className="w-full rounded-xl bg-black/30 border border-white/10 text-white text-sm px-3 py-2 focus:outline-none focus:border-accent transition"
          />
          <button
            onClick={analyzeContract}
            disabled={loading}
            className="w-full rounded-xl bg-accent text-white font-medium text-sm py-3 hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Analyze Contract"}
          </button>
        </div>

        {error && <p className="text-red-400 text-xs mt-3">{error}</p>}

        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-5 bg-black/30 rounded-xl border border-white/10 p-4 text-sm"
          >
            <p className="text-accent font-semibold mb-2">🔎 Analysis Result</p>
            <p>
              <span className="text-gray-400">Address:</span> {result.address}
            </p>
            <p>
              <span className="text-gray-400">Verified:</span>{" "}
              {result.verified ? "✅ Yes (Has bytecode)" : "❌ No bytecode found"}
            </p>
            <p>
              <span className="text-gray-400">Balance:</span>{" "}
              {result.balance} ETH
            </p>
            <p>
              <span className="text-gray-400">Contract Type:</span>{" "}
              {result.contractType}
            </p>
            {result.isProxy && (
              <p className="text-yellow-400 text-xs mt-1">
                ⚠️ This contract might be an upgradeable proxy
              </p>
            )}
            <p className="mt-2">
              <a
                href={`https://basescan.org/address/${result.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline text-[13px]"
              >
                🔗 View on BaseScan
              </a>
            </p>
          </motion.div>
        )}
      </motion.div>

      <Footer />
    </div>
  );
}
