import { motion } from "framer-motion";
import Link from "next/link";
import Footer from "../components/Footer";

export default function AboutPage() {
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
            📜 About
          </h1>
          <p className="text-[11px] text-textSecondary tracking-[0.05em]">
            Onchain learning miniapp for detectives on Base
          </p>
        </header>

        <section className="flex flex-col gap-3 text-sm text-textSecondary leading-relaxed">
          <p>
            <span className="text-textPrimary font-medium">Base Detective</span> is an interactive
            onchain learning experience that turns blockchain investigation into a game.
          </p>

          <p>
            Each week, you’ll face a new mystery — inspired by real smart contract exploits, DeFi
            hacks, and web3 puzzles.
          </p>

          <p>
            Solve questions, analyze clues, and uncover what went wrong. At the end, your result is
            permanently recorded on Base — proof of your skills and progress as an onchain
            detective.
          </p>

          <p>
            Whether you’re a beginner learning how contracts work or a seasoned dev testing your
            audit instincts, Base Detective helps you learn security, logic, and onchain behavior
            through short, story-driven cases.
          </p>

          <p className="text-textPrimary font-medium">
            🕵️‍♂️ New cases are released every week — there’s always a new challenge waiting to be
            solved.
          </p>
        </section>

        <div className="mt-5">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center rounded-xl bg-accent text-white font-medium text-sm py-3 shadow-lg shadow-blue-500/20 hover:opacity-90 transition"
          >
            🔍 Back to the Case
          </Link>
                        <button
        onClick={() => (window.location.href = "/")}
        className="w-full max-w-md mt-6 rounded-xl bg-white/5 text-xs text-textSecondary py-2 hover:bg-white/10 transition"
      >
        Back to Main
      </button>
        </div>
      </motion.div>

      <Footer />
    </div>
  );
}
