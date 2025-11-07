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

type AnalysisEvent = {
  txHash: string;
  block: number;
};

type AnalysisStats = {
  txCount?: number;
  lastActivity?: string;
};

type AnalysisResult = {
  address: string;
  verified: boolean;
  balance: string;
  contractType: string;
  owner: string;
  riskFlags: string[];
  events: AnalysisEvent[];
  sourcePreview: string;
  stats: AnalysisStats;
};

export default function ToolsPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
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
      const [bytecodeRaw, balance] = await Promise.all([
        client.getBytecode({ address }),
        client.getBalance({ address }),
      ]);

      const bytecode = bytecodeRaw as string | null;
      const verified = !!bytecode && bytecode.length > 2;
      let contractType = "EOA (Externally Owned Account)";
      let owner = "Unknown";
      let riskFlags: string[] = [];
      let events: AnalysisEvent[] = [];
      let sourcePreview = "";
      let stats: AnalysisStats = {};

      if (verified) {
        // Тип контракта
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
          try {
            const erc165 = await client.readContract({
              address,
              abi: [
                {
                  name: "supportsInterface",
                  type: "function",
                  stateMutability: "view",
                  inputs: [{ name: "interfaceId", type: "bytes4" }],
                  outputs: [{ type: "bool" }],
                },
              ],
              functionName: "supportsInterface",
              args: ["0x80ac58cd"], // ERC721
            });
            if (erc165) contractType = "ERC721 NFT";
          } catch {
            contractType = "Custom Contract";
          }
        }

        // Owner
        try {
          const ownerAddr = await client.readContract({
            address,
            abi: [
              {
                name: "owner",
                type: "function",
                stateMutability: "view",
                inputs: [],
                outputs: [{ type: "address" }],
              },
            ],
            functionName: "owner",
          });
          owner = ownerAddr as string;
        } catch {
          owner = "Unknown";
        }

        // Risk scan
        if (bytecode && typeof bytecode === "string") {
          if (bytecode.includes("delegatecall")) {
            riskFlags.push("Uses delegatecall");
          }
          if (bytecode.includes("selfdestruct")) {
            riskFlags.push("Contains selfdestruct");
          }
          if (bytecode.length < 1000) {
            riskFlags.push("Unusually small bytecode (possible stub)");
          }
        }

        // Events
        try {
          const latestBlock = await client.getBlockNumber();
          const fromBlock = Number(latestBlock) - 5000;
          const logs = await client.getLogs({
            address,
            fromBlock: BigInt(fromBlock),
            toBlock: latestBlock,
          });
          events = logs.slice(-5).map((log) => ({
            txHash: log.transactionHash as string,
            block: Number(log.blockNumber),
          }));
        } catch {
          events = [];
        }

        // Source preview
        try {
          const resp = await fetch(
            `https://api.basescan.org/api?module=contract&action=getsourcecode&address=${address}`
          );
          const data = await resp.json();
          if (data?.result?.[0]?.SourceCode) {
            const lines = (data.result[0].SourceCode as string)
              .split("\n")
              .slice(0, 8);
            sourcePreview = lines.join("\n");
          }
        } catch {
          sourcePreview = "";
        }

        // Stats
        try {
          const txResp = await fetch(
            `https://api.basescan.org/api?module=account&action=txlist&address=${address}&sort=desc`
          );
          const txData = await txResp.json();
          if (txData?.result?.length) {
            const count = txData.result.length as number;
            const last = txData.result[0];
            stats = {
              txCount: count,
              lastActivity: new Date(
                Number(last.timeStamp) * 1000
              ).toLocaleDateString(),
            };
          }
        } catch {
          stats = {};
        }
      }

      setResult({
        address,
        verified,
        balance: formatEther(balance),
        contractType,
        owner,
        riskFlags,
        events,
        sourcePreview,
        stats,
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
        <header className="flex flex-col gap-1 mb-4">
          <h1 className="text-lg font-semibold text-white flex items-center gap-2">
            🧰 Onchain Tools
          </h1>
          <p className="text-[11px] text-textSecondary tracking-[0.05em]">
            Investigate any Base contract address
          </p>
        </header>

        <div className="bg-black/30 rounded-xl border border-white/10 p-3 mb-5 text-xs text-gray-300">
          <p className="text-blue-400 mb-1 font-medium">ℹ️ How to use these tools</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Enter any Base contract address to analyze it</li>
            <li>Check if it&apos;s ERC20, NFT, or a custom contract</li>
            <li>Review source, events, and basic risk indicators</li>
          </ul>
        </div>

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
            className="mt-5 bg-black/30 rounded-xl border border-white/10 p-4 text-sm space-y-2"
          >
            <p className="text-accent font-semibold mb-2">🔎 Analysis Result</p>
            <p>
              <span className="text-gray-400">Address:</span> {result.address}
            </p>
            <p>
              <span className="text-gray-400">Verified:</span>{" "}
              {result.verified ? "✅ Yes" : "❌ No"}
            </p>
            <p>
              <span className="text-gray-400">Balance:</span>{" "}
              {result.balance} ETH
            </p>
            <p>
              <span className="text-gray-400">Type:</span>{" "}
              {result.contractType}
            </p>
            <p>
              <span className="text-gray-400">Owner:</span> {result.owner}
            </p>

            {result.stats.txCount && (
              <>
                <p>
                  <span className="text-gray-400">Transactions:</span>{" "}
                  {result.stats.txCount}
                </p>
                <p>
                  <span className="text-gray-400">Last Activity:</span>{" "}
                  {result.stats.lastActivity}
                </p>
              </>
            )}

            {result.riskFlags.length > 0 && (
              <div className="mt-2">
                <p className="text-red-400 font-medium">⚠️ Risk Flags:</p>
                <ul className="list-disc list-inside text-xs text-gray-300">
                  {result.riskFlags.map((r: string, i: number) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.events.length > 0 && (
              <div className="mt-2">
                <p className="text-blue-400 font-medium">📜 Recent Events:</p>
                <ul className="list-disc list-inside text-xs text-gray-300">
                  {result.events.map((e: AnalysisEvent, i: number) => (
                    <li key={i}>
                      Block {e.block} —{" "}
                      <a
                        href={`https://basescan.org/tx/${e.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {e.txHash.slice(0, 10)}...
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.sourcePreview && (
              <div className="mt-3">
                <p className="text-green-400 font-medium">📄 Source Preview:</p>
                <pre className="text-xs bg-black/40 rounded-xl p-3 mt-1 overflow-x-auto text-gray-300">
                  {result.sourcePreview}
                </pre>
              </div>
            )}

            <p className="mt-3">
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

      <button
              onClick={() => (window.location.href = "/")}
              className="w-full mt-2 rounded-xl bg-white/5 text-xs text-textSecondary py-2 hover:bg-white/10 transition"
            >
              Back to Main
      </button>
      <Footer />
    </div>
  );
}
