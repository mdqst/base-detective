import { motion } from "framer-motion";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f12] to-[#1a1a1d] text-gray-100 flex flex-col items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-xl rounded-2xl border border-gray-800 bg-[#151518]/80 backdrop-blur-sm shadow-lg p-8 md:p-10 text-center"
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-white">
          Base Detective
        </h1>

        <p className="text-gray-300 text-base leading-relaxed mb-4">
          <strong>Base Detective</strong> is an interactive onchain learning
          experience that turns blockchain investigation into a game.
        </p>

        <p className="text-gray-400 text-sm leading-relaxed mb-4">
          Each week, you’ll face a new mystery — inspired by real smart contract
          exploits, DeFi hacks, and web3 puzzles.
        </p>

        <p className="text-gray-400 text-sm leading-relaxed mb-4">
          Solve questions, analyze clues, and uncover what went wrong. At the
          end, your result is permanently recorded on Base — proof of your
          skills and progress as an onchain detective.
        </p>

        <p className="text-gray-400 text-sm leading-relaxed mb-4">
          Whether you’re a beginner learning how contracts work or a seasoned
          dev testing your audit instincts, Base Detective helps you learn
          security, logic, and onchain behavior through short, story-driven
          cases.
        </p>

        <p className="text-gray-300 text-sm leading-relaxed mb-8 font-medium">
          🕵️‍♂️ New cases are released every week — there’s always a new
          challenge waiting to be solved.
        </p>

        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition"
        >
          🔍 Back to the Case
        </Link>
      </motion.div>
    </div>
  );
}
