import { useState } from "react";
import Footer from "../components/Footer";

type Challenge = {
  id: number;
  title: string;
  description: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

const CHALLENGES: Challenge[] = [
  {
    id: 1,
    title: "Reentrancy Vulnerability",
    description:
      "A vulnerable withdraw() function sends ETH before updating user balance. How can it be exploited?",
    options: [
      "Call withdraw() directly multiple times",
      "Use a fallback that calls withdraw() again during execution",
      "Use a staticcall to withdraw()",
      "Change storage via delegatecall",
    ],
    correctIndex: 1,
    explanation:
      "Reentrancy works when external calls happen before state updates. Attacker re-enters withdraw() through fallback and drains funds.",
  },
  {
    id: 2,
    title: "Integer Overflow",
    description:
      "A token uses uint8 for balances without SafeMath. How could an attacker exploit this?",
    options: [
      "Send small transfers to wrap balance to 0",
      "Use delegatecall to bypass math",
      "Exploit constructor to mint tokens",
      "Freeze contract storage",
    ],
    correctIndex: 0,
    explanation:
      "Without overflow checks, balance arithmetic wraps around at 256. Repeated transfers can overflow balances.",
  },
  {
    id: 3,
    title: "Access Control Flaw",
    description:
      "The contract has setOwner() callable by anyone because the constructor wasn’t run. What’s the issue?",
    options: [
      "Uninitialized ownership lets attacker become owner",
      "Private variable leak",
      "Gas limit vulnerability",
      "Locked storage slot",
    ],
    correctIndex: 0,
    explanation:
      "If ownership isn’t initialized, anyone can call the initializer to become owner — a common proxy setup bug.",
  },
];

export default function Playground() {
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [wrongAnswer, setWrongAnswer] = useState<number | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null);

  const total = CHALLENGES.length;
  const challenge = CHALLENGES[current];

  function handleStart() {
    setStarted(true);
    setFinished(false);
    setCurrent(0);
    setSelected(null);
    setWrongAnswer(null);
    setCorrectAnswer(null);
  }

  function handleAnswer(idx: number) {
    const isCorrect = idx === challenge.correctIndex;
    if (isCorrect) {
      setCorrectAnswer(idx);
      setWrongAnswer(null);
      setTimeout(() => {
        setCorrectAnswer(null);
        if (current < total - 1) {
          setCurrent(current + 1);
          setSelected(null);
        } else {
          setFinished(true);
        }
      }, 400);
    } else {
      setWrongAnswer(idx);
    }
  }

  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-background text-textPrimary px-4 py-8 relative overflow-hidden">
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

      <div className="w-full max-w-md bg-surface rounded-2xl p-5 shadow-xl shadow-black/50 border border-white/10 animate-fadeIn z-10">
        {/* Header */}
        <header className="flex flex-col gap-2 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-white flex items-center gap-2">
              🧨 Security Playground
            </h1>
            <span className="text-[10px] text-textSecondary bg-white/5 border border-white/10 rounded-md px-2 py-1 leading-none">
              {current + 1} / {total}
            </span>
          </div>
          <p className="text-sm text-textSecondary leading-relaxed">
            Learn smart contract security by solving short exploit simulations.
          </p>
        </header>

        {/* Start screen */}
        {!started && !finished && (
          <section className="flex flex-col gap-4">
            <div className="text-xs text-textSecondary bg-white/5 rounded-xl border border-white/10 p-3 leading-relaxed">
              <p className="mb-2">• Discover real smart contract bugs interactively.</p>
              <p className="mb-1">• Each challenge focuses on one exploit type.</p>
              <p className="mb-1">
                • Wrong answers turn{" "}
                <span className="text-red-400 font-medium">red</span>, but you can retry.
              </p>
              <p>• Train your detective instincts for security.</p>
            </div>

            <button
              onClick={handleStart}
              className="w-full rounded-xl bg-accent text-white font-medium text-sm py-3 shadow-lg shadow-blue-500/20 hover:opacity-90 transition"
            >
              Start Playground
            </button>
          </section>
        )}

        {/* Challenge screen */}
        {started && !finished && (
          <section className="flex flex-col gap-4 animate-fadeIn">
            <div>
              <div className="text-[11px] text-textSecondary mb-2">
                Challenge {current + 1} / {total}
              </div>
              <div className="text-white text-base font-medium leading-relaxed">
                {challenge.description}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {challenge.options.map((opt, idx) => {
                const isWrong = wrongAnswer === idx;
                const isCorrect = correctAnswer === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className={`w-full text-left rounded-xl border px-4 py-3 text-sm leading-relaxed transition-all duration-200
                      ${
                        isWrong
                          ? "border-red-500/60 bg-red-500/10 text-red-300"
                          : isCorrect
                          ? "border-green-500/60 bg-green-500/10 text-green-300"
                          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                      }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10 mt-4">
              <div
                className="bg-accent h-full transition-all"
                style={{ width: `${((current + 1) / total) * 100}%` }}
              />
            </div>
          </section>
        )}

        {/* Finish screen */}
        {finished && (
          <section className="flex flex-col gap-4 text-center animate-fadeIn">
            <h2 className="text-white text-xl font-semibold">Playground Complete 🎉</h2>
            <p className="text-sm text-textSecondary leading-relaxed">
              You’ve mastered the basics of smart contract exploits. New simulations coming soon!
            </p>

            <button
              onClick={handleStart}
              className="w-full rounded-xl bg-accent text-white font-medium text-sm py-3 shadow-lg shadow-blue-500/20 hover:opacity-90 transition"
            >
              Replay Challenges
            </button>

            <button
              onClick={() => (window.location.href = "/")}
              className="w-full mt-2 rounded-xl bg-white/5 text-xs text-textSecondary py-2 hover:bg-white/10 transition"
            >
              Back to Main
            </button>
          </section>
        )}
      </div>

      <Footer />
    </main>
  );
}
