import { motion } from "framer-motion";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f12] to-[#1a1a1d] text-gray-100 flex flex-col items-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl text-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-white">
          Base Detective
        </h1>
        <p className="text-gray-400 leading-relaxed mb-4">
          <strong>Base Detective</strong> is an interactive onchain learning
          experience that turns blockchain investigation into a game.
        </p>

        <p className="text-gray-400 leading-relaxed mb-4">
          Each week, you’ll face a new mystery — inspired by real smart contract
          exploits, DeFi hacks, and web3 puzzles.
        </p>

        <p className="text-gray-400 leading-relaxed mb-4">
          Solve questions, analyze clues, and uncover what went wrong. At the
          end, your result is permanently recorded on Base — proof of your
          skills and progress as an onchain detective.
        </p>

        <p className="text-gray-400 leading-relaxed mb-4">
          Whether you’re a beginner learning how contracts work or a seasoned
          dev testing your audit instincts, Base Detective helps you learn
          security, logic, and onchain behavior through short, story-driven
          cases.
        </p>

        <p className="text-gray-400 leading-relaxed mb-8">
          <strong>New cases are released every week</strong>, so there’s always
          a new challenge waiting to be solved.
        </p>

        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition"
        >
          🔍 Back to the Case
        </Link>
      </motion.div>

      <footer className="mt-12 text-xs text-gray-600 flex flex-col items-center gap-1">
        <div className="flex items-center space-x-1">
          <motion.span
            animate={{
              scale: [1, 1.3, 1],
              color: ["#60a5fa", "#3b82f6", "#60a5fa"],
            }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="text-blue-400 text-base"
          >
            💙
          </motion.span>
          <a
            href="https://farcaster.xyz/mdqst"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-400 transition text-sm"
          >
            Built for Base by <span className="font-semibold">mdqst</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
