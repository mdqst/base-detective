import { useEffect, useState, useMemo } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import data from "../data/questions_case1.json";
import WalletConnectButton from "../components/WalletConnectButton";
import { startCaseTx, completeCaseTx, getFarcasterProvider } from "../hooks/useContract";

type Question = {
  id: number;
  text: string;
  answers: string[];
};

type CaseData = {
  caseId: number;
  title: string;
  intro: string;
  questions: Question[];
};

const CASE: CaseData = data as CaseData;
const TOTAL = CASE.questions.length;

function shuffleWithSeed<T>(arr: T[], seed: number): T[] {
  let x = seed % 0xffffffff;
  if (x === 0) x = 0xdeadbeef;
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    const j = Math.abs(x) % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function Home() {
  const [provider, setProvider] = useState<any | null>(null);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [wrongAnswer, setWrongAnswer] = useState<number | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null);
  const [seed, setSeed] = useState<number | null>(null);

  useEffect(() => {
    sdk.actions.ready();
    getFarcasterProvider(sdk).then((prov) => {
      if (prov) setProvider(prov);
    });
  }, []);

  const questionOrder = useMemo(() => {
    if (!seed) return CASE.questions;
    return shuffleWithSeed(CASE.questions, seed);
  }, [seed]);

  const currentQuestion = questionOrder[step];

  async function handleStart() {
    try {
      if (!provider) {
        alert("Please connect wallet first (Farcaster or external wallet).");
        return;
      }

      await startCaseTx(provider, CASE.caseId, 0n); // 🚫 без оплаты

      const localSeed = Date.now() % 0xffffffff;
      setSeed(localSeed);
      setStarted(true);
    } catch (err: any) {
      console.error(err);
      alert("Failed to start case.");
    }
  }

  function handleAnswer(answerIndex: number) {
    const isCorrect = answerIndex === 0;

    if (isCorrect) {
      setCorrectAnswer(answerIndex);
      setWrongAnswer(null);

      setTimeout(() => {
        setCorrectAnswer(null);
        setAnswers((prev) => [...prev, answerIndex]);
        if (step < TOTAL - 1) {
          setStep(step + 1);
        } else {
          setFinished(true);
        }
      }, 700);
    } else {
      setWrongAnswer(answerIndex);
      setTimeout(() => setWrongAnswer(null), 1000);
    }
  }

  async function handleRecord() {
    try {
      if (!provider) {
        alert("Please connect wallet first.");
        return;
      }

      const score = answers.filter((a) => a === 0).length;
      const result = score >= 7 ? 1 : score >= 4 ? 2 : 3;

      await completeCaseTx(provider, CASE.caseId, result);
      alert("✅ Result recorded on Base. You're officially on-chain.");
    } catch (err: any) {
      console.error(err);
      alert("Failed to record result.");
    }
  }

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
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>

      <div className="w-full max-w-md bg-surface rounded-2xl p-5 shadow-xl shadow-black/50 border border-white/10">
        <header className="flex flex-col gap-2 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-white flex items-center gap-2">
              🕵️ Base Detective
            </h1>
            <span className="text-[10px] text-textSecondary bg-white/5 border border-white/10 rounded-md px-2 py-1 leading-none">
              Case #{CASE.caseId}
            </span>
          </div>
          <p className="text-sm text-textSecondary leading-relaxed">{CASE.intro}</p>
        </header>

        {!started && !finished && (
          <section className="flex flex-col gap-4 animate-fadeIn">
            <div className="text-xs text-textSecondary bg-white/5 rounded-xl border border-white/10 p-3 leading-relaxed">
              <p className="mb-2">
                1. Connect your wallet (Farcaster in-app or external).
              </p>
              <p className="mb-2">
                2. Start the investigation — answer all 10 questions correctly.
              </p>
              <p>3. Wrong answers blink red, correct ones flash green.</p>
            </div>

            <WalletConnectButton />

            <button
              onClick={handleStart}
              className="w-full rounded-xl bg-accent text-white font-medium text-sm py-3 shadow-lg shadow-blue-500/20 hover:opacity-90 transition"
            >
              Start Investigation
            </button>
          </section>
        )}

        {started && !finished && currentQuestion && (
          <section key={step} className="flex flex-col gap-4 animate-fadeIn">
            <div>
              <div className="text-[11px] text-textSecondary mb-2">
                Question {step + 1} / {TOTAL}
              </div>
              <div className="text-white text-base font-medium leading-relaxed">
                {currentQuestion.text}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {currentQuestion.answers.map((ans, idx) => {
                const isWrong = wrongAnswer === idx;
                const isCorrect = correctAnswer === idx;

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className={`w-full text-left rounded-xl border px-4 py-3 text-sm leading-relaxed transition-all duration-300
                      ${
                        isWrong
                          ? "border-red-500/50 bg-red-500/10 text-red-400 animate-pulse"
                          : isCorrect
                          ? "border-green-500/50 bg-green-500/10 text-green-400 animate-pulse"
                          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                      }`}
                  >
                    {ans}
                  </button>
                );
              })}
            </div>

            <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10 mt-4">
              <div
                className="bg-accent h-full transition-all"
                style={{ width: `${((step + 1) / TOTAL) * 100}%` }}
              />
            </div>
          </section>
        )}

        {finished && (
          <section className="flex flex-col gap-4 text-center animate-fadeIn">
            <h2 className="text-white text-xl font-semibold">Investigation Complete</h2>
            <p className="text-sm text-textSecondary leading-relaxed">
              You solved all {TOTAL} questions! You can now record your final
              result on Base. This becomes permanent, public proof of your investigation.
            </p>

            <button
              onClick={handleRecord}
              className="w-full rounded-xl bg-green-600 text-white font-medium text-sm py-3 shadow-lg shadow-green-500/20 hover:opacity-90 transition"
            >
              Record Result On-Chain
            </button>

            <p className="text-[11px] text-textSecondary">
              Only your final result is stored — not individual answers.
            </p>
          </section>
        )}
      </div>

      <footer className="text-[10px] text-textSecondary mt-6 opacity-60">
        <div className="text-center leading-relaxed">
          <div>Contract: 0xfbc5fbe823f76964de240433ad00651a76c672c8</div>
          <div>Network: Base Mainnet (chainId 8453)</div>
        </div>
      </footer>
    </main>
  );
}
