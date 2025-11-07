import { useEffect, useState } from "react";
import Footer from "../components/Footer";

type Challenge = {
  id: number;
  title: string;
  description: string;
  question: string;
  options: string[];
  correctIndex: number;
  difficulty: "Easy" | "Medium" | "Hard";
  explanation: string;
};

const CHALLENGES: Challenge[] = [
  {
    id: 1,
    title: "Reentrancy Vulnerability",
    description:
      "A smart contract calls an external address before updating its internal balance. What could an attacker do?",
    question: "What's the risk?",
    options: [
      "Drain the contract by re-entering before the balance updates",
      "Steal admin privileges",
      "Freeze the contract forever",
      "Nothing happens — it's safe",
    ],
    correctIndex: 0,
    difficulty: "Medium",
    explanation:
      "When a contract sends ETH before updating its balance, the receiver’s fallback function can call back into the contract and withdraw repeatedly — draining funds. Always update state before external calls or use reentrancy guards.",
  },
  {
    id: 2,
    title: "Delegatecall Risk",
    description:
      "The contract executes code from another contract via delegatecall without validating the address.",
    question: "What can happen?",
    options: [
      "The target contract's storage is modified",
      "The call will always revert",
      "Delegatecall is sandboxed and safe",
      "It just calls like a normal function",
    ],
    correctIndex: 0,
    difficulty: "Hard",
    explanation:
      "Delegatecall runs the target contract's code in the *caller’s* context — it can overwrite storage and even self-destruct your contract. Only delegatecall trusted addresses or avoid it entirely.",
  },
  {
    id: 3,
    title: "Integer Overflow",
    description:
      "A contract adds user deposits to a uint256 balance without overflow checks.",
    question: "What’s the potential issue?",
    options: [
      "The balance wraps around to 0 after max value",
      "Gas costs increase drastically",
      "The transaction is automatically reverted",
      "It becomes a view function",
    ],
    correctIndex: 0,
    difficulty: "Easy",
    explanation:
      "Before Solidity 0.8, arithmetic overflow would wrap around — e.g., 2^256 - 1 + 1 = 0. This allowed exploits in token logic. Modern compilers include overflow checks by default.",
  },
  {
    id: 4,
    title: "Access Control",
    description:
      "A function is missing the onlyOwner modifier but updates critical state.",
    question: "What can an attacker do?",
    options: [
      "Call the function and change state",
      "Steal contract funds directly",
      "Pause the blockchain",
      "Nothing — it’s still protected",
    ],
    correctIndex: 0,
    difficulty: "Easy",
    explanation:
      "Without access modifiers like onlyOwner, anyone can call the function — potentially changing config, ownership, or prices. Always restrict sensitive functions.",
  },
  {
    id: 5,
    title: "Front-Running",
    description:
      "A DeFi user sends a transaction to buy tokens at a specific price. A bot sees it in the mempool.",
    question: "What can the bot do?",
    options: [
      "Front-run the trade to profit from price change",
      "Steal the private key",
      "Block the user’s transaction",
      "Increase gas fees indefinitely",
    ],
    correctIndex: 0,
    difficulty: "Medium",
    explanation:
      "Since pending transactions are public in the mempool, bots can copy them, raise gas price, and execute first — profiting from price movement. Use private mempools or commit-reveal schemes.",
  },
];

export default function PlaygroundPage() {
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // выбираем случайное задание при загрузке
  useEffect(() => {
    pickRandomChallenge();
  }, []);

  function pickRandomChallenge() {
    const random = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
    setCurrentChallenge(random);
    setSelectedOption(null);
    setResult(null);
    setShowExplanation(false);
  }

  function handleSelectOption(index: number) {
    if (!currentChallenge) return;
    const isCorrect = index === currentChallenge.correctIndex;
    setSelectedOption(index);
    setResult(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      setTimeout(() => setShowExplanation(true), 600);
    }
  }

  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-background text-textPrimary px-4 py-8 relative overflow-hidden">
      <div className="w-full max-w-md bg-surface rounded-2xl p-5 shadow-xl shadow-black/50 border border-white/10 animate-fadeIn z-10">
        {currentChallenge && (
          <section className="flex flex-col gap-4 animate-fadeIn">
            <header className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  {currentChallenge.title}
                </h2>
                <span
                  className={`text-[10px] px-2 py-1 rounded-md border leading-none ${
                    currentChallenge.difficulty === "Easy"
                      ? "text-green-400 border-green-400/40 bg-green-400/5"
                      : currentChallenge.difficulty === "Medium"
                      ? "text-yellow-400 border-yellow-400/40 bg-yellow-400/5"
                      : "text-red-400 border-red-400/40 bg-red-400/5"
                  }`}
                >
                  {currentChallenge.difficulty}
                </span>
              </div>
              <p className="text-sm text-textSecondary leading-relaxed">
                {currentChallenge.description}
              </p>
            </header>

            <div className="bg-white/[0.03] rounded-xl border border-white/10 p-3 text-sm">
              <p className="text-textSecondary mb-3">{currentChallenge.question}</p>
              <div className="flex flex-col gap-2">
                {currentChallenge.options.map((opt, idx) => {
                  const isWrong = result === "wrong" && selectedOption === idx;
                  const isCorrect = result === "correct" && selectedOption === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={showExplanation}
                      className={`w-full text-left rounded-xl border px-4 py-2 text-sm transition-all ${
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
            </div>

            {showExplanation && (
              <div className="bg-black/40 rounded-xl border border-white/10 p-3 mt-2 text-xs text-gray-300 leading-relaxed">
                <p className="text-green-400 font-medium mb-1">✅ Explanation:</p>
                {currentChallenge.explanation}
              </div>
            )}

            <div className="flex flex-col gap-2 mt-3">
              <button
                onClick={pickRandomChallenge}
                className="w-full rounded-xl bg-accent text-white font-medium text-sm py-3 hover:opacity-90 transition"
              >
                Next Challenge
              </button>

              <button
                onClick={() => (window.location.href = "/")}
                className="w-full rounded-xl bg-white/5 text-xs text-textSecondary py-2 hover:bg-white/10 transition"
              >
                Back to Main
              </button>
            </div>
          </section>
        )}
      </div>
      <Footer />
    </main>
  );
}
