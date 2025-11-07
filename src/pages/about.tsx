import { motion } from "framer-motion";
import Link from "next/link";
import Footer from "../components/Footer";

export default function AboutPage() {
  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-background text-textPrimary px-4 py-8">
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md bg-surface rounded-2xl p-5 shadow-xl shadow-black/50 border border-white/10 animate-fadeIn"
      >
        <p className="text-[10px] text-textSecondary uppercase tracking-[0.18em] mb-2">
          📜 About
        </p>

        <header className="flex flex-col gap-1 mb-4">
          <h1 className="text-lg font-semibold text-white flex items-center gap-2">
            🕵️ Base Detective
          </h1>
        </header>

        <section className="flex flex-col gap-3 text-sm text-textSecondary leading-relaxed">
          <p>
            <span className="text-textPrimary font-medium">Base Detective</span> is an interactive
            onchain learning experience that turns blockchain investigation into a game.
          </p>

          <p>
            Each week, you’ll face a new mystery - inspired by real smart contract exploits, DeFi
            hacks, and web3 puzzles.
          </p>

          <p>
            Solve questions, analyze clues, and uncover what went wrong. At the end, your result is
            permanently recorded on Base - proof of your skills and progress as an onchain
            detective.
          </p>

          <p>
            Whether you’re a beginner learning how contracts work or a seasoned dev testing your
            audit instincts, Base Detective helps you learn security, logic, and onchain behavior
            through short, story-driven cases.
          </p>

          <p className="text-textPrimary font-medium">
            🕵️‍♂️ New cases are released every week - there’s always a new challenge waiting to be
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
        </div>
      </motion.div>
      <Footer />
    </main>
  );
}
