import { motion } from "framer-motion";
import Link from "next/link";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import contractABI from "../abi/SmartContractDetective.json";
import { contractAddress } from "../hooks/useContract";

const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://mainnet.base.org"),
});

// простая функция форматирования адреса
function shortenAddress(addr: string) {
  return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";
}

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<{ address: string; cases: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaders() {
      try {
        // ⚙️ вызов контракта для получения списка прошедших квест
        const users = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: contractABI.abi,
          functionName: "getCompletedUsers", // замени на свою функцию
        });

        const formatted = (users as string[]).map((u) => ({
          address: u,
          cases: 1, // можно заменить на реальное значение, если контракт возвращает количество
        }));

        setLeaders(formatted);
      } catch (err) {
        console.error("❌ Failed to fetch leaderboard:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaders();
  }, []);

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
            🏆 Leaderboard
          </h1>
          <p className="text-[11px] text-textSecondary tracking-[0.05em]">
            Top onchain detectives of Base
          </p>
        </header>

        {loading ? (
          <p className="text-center text-textSecondary py-8 text-sm">Loading detectives...</p>
        ) : leaders.length > 0 ? (
          <section className="flex flex-col divide-y divide-white/10">
            {leaders.map((user, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-3 text-sm"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-white">
                    {shortenAddress(user.address)}
                  </span>
                  <span className="text-[11px] text-textSecondary">
                    Detective Rank #{index + 1}
                  </span>
                </div>
                <span className="text-accent font-semibold">{user.cases} case</span>
              </div>
            ))}
          </section>
        ) : (
          <p className="text-center text-textSecondary py-6 text-sm">
            No detectives on record yet. Be the first to solve a case!
          </p>
        )}

        <div className="mt-5">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center rounded-xl bg-accent text-white font-medium text-sm py-3 shadow-lg shadow-blue-500/20 hover:opacity-90 transition"
          >
            🔍 Back to Cases
          </Link>
        </div>
      </motion.div>

      <Footer />
    </div>
  );
}
