import { useEffect, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import data from "../data/questions_case1.json";
import { getFarcasterProvider, completeCaseTx } from "../hooks/useContract";
import WalletConnectButton from "../components/WalletConnectButton";
import Footer from "../components/Footer";

type Question = { id: number; text: string; answers: string[] };
type CaseData = { caseId: number; title: string; intro: string; questions: Question[] };
type PreparedQuestion = { id: number; text: string; answers: string[]; correctIndex: number };

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
  const [showConfetti, setShowConfetti] = useState(false);
  const [step, setStep] = useState(0);
  const [questions, setQuestions] = useState<PreparedQuestion[] | null>(null);
  const [wrongAnswer, setWrongAnswer] = useState<number | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null);
  const [txStatus, setTxStatus] = useState<"idle" | "pending" | "success" | "error">("idle");

  useEffect(() => {
    try {
      sdk.actions.ready();
      console.log("🟢 Farcaster Miniapp ready");
    } catch (e) {
      console.warn("⚠️ Farcaster SDK initialization failed:", e);
    }

    (async () => {
      try {
        const prov = await getFarcasterProvider(sdk);
        if (prov) setProvider(prov);
        else console.warn("⚠️ No Farcaster wallet provider found");
      } catch (err) {
        console.error("❌ Provider error:", err);
      }
    })();
  }, []);

  function prepareQuestions() {
    const seed = Date.now() % 0xffffffff;
    const shuffledQuestions = shuffleWithSeed(CASE.questions, seed);

    const prepared: PreparedQuestion[] = shuffledQuestions.map((q, idx) => {
      let x = (seed + (idx + 1) * 9973) >>> 0;
      if (x === 0) x = 0xabcdef;

      const indices = q.answers.map((_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        x ^= x << 13;
        x ^= x >>> 17;
        x ^= x << 5;
        const j = Math.abs(x) % (i + 1);
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }

      const shuffledAnswers = indices.map((origIdx) => q.answers[origIdx]);
      const correctIndex = indices.indexOf(0);
      return { id: q.id, text: q.text, answers: shuffledAnswers, correctIndex };
    });

    return prepared;
  }

  function handleStart() {
    const prepared = prepareQuestions();
    setQuestions(prepared);
    setStarted(true);
    setFinished(false);
    setShowConfetti(false);
    setStep(0);
    setWrongAnswer(null);
    setCorrectAnswer(null);
    setTxStatus("idle");
  }

  function handleAnswer(idx: number) {
    if (!questions || !questions[step] || finished) return;
    const currentQuestion = questions[step];
    const isCorrect = idx === currentQuestion.correctIndex;

    if (isCorrect) {
      setCorrectAnswer(idx);
      setWrongAnswer(null);
      setTimeout(() => {
        setCorrectAnswer(null);
        if (step < TOTAL - 1) setStep(step + 1);
        else {
          setFinished(true);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
      }, 400);
    } else {
      setWrongAnswer(idx);
    }
  }

  async function handleRecord() {
    try {
      if (!provider) {
        const prov = await getFarcasterProvider(sdk);
        if (!prov) {
          alert("No wallet provider found. Please connect a wallet.");
          return;
        }
        setProvider(prov);
      }

      setTxStatus("pending");
      await completeCaseTx(provider, CASE.caseId, 1);
      setTxStatus("success");
    } catch (err) {
      console.error("Failed to record result:", err);
      setTxStatus("error");
    }
  }

  async function handleShare() {
    try {
      await sdk.actions.composeCast({
        text: `I just cracked the Base Detective case #${CASE.caseId}! 🔍 Check it out:`,
        embeds: ["https://farcaster.xyz/miniapps/WZQp7-9rAp3R/base-detective"],
      });
      console.log("🎉 Shared on Farcaster");
    } catch (err) {
      console.error("⚠️ Failed to share cast:", err);
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
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0);
            opacity: 1;
          }
          100% {
            transform: translateY(800px) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        .confetti {
          position: absolute;
          width: 6px;
          height: 12px;
          background: var(--color);
          top: 0;
          left: var(--x);
          opacity: 0.8;
          border-radius: 2px;
          animation: confetti 2.5s ease-in forwards;
        }
      `}</style>

      {/* 🎉 Конфетти */}
      {showConfetti &&
        Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="confetti"
            style={{
              "--x": `${Math.random() * 100}%`,
              "--color": ["#60a5fa", "#a78bfa", "#34d399", "#f472b6", "#fbbf24"][
                Math.floor(Math.random() * 5)
              ],
              animationDelay: `${Math.random() * 0.4}s`,
            } as React.CSSProperties}
          />
        ))}

      <div className="w-full max-w-md bg-surface rounded-2xl p-5 shadow-xl shadow-black/50 border border-white/10 animate-fadeIn z-10">
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

        {/* Начало игры */}
        {!started && !finished && (
          <section className="flex flex-col gap-4">
            <div className="text-xs text-textSecondary bg-white/5 rounded-xl border border-white/10 p-3 leading-relaxed">
              <p className="mb-2">• This is an on-chain investigation based on a real DAO exploit.</p>
              <p className="mb-1">• Answer all 10 questions correctly to complete the case.</p>
              <p className="mb-1">
                • Wrong answers turn <span className="text-red-400 font-medium">red</span>, but you can retry.
              </p>
              <p>• Your result is recorded on Base only after completion.</p>
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

        {/* Процесс */}
        {started && !finished && questions && (
          <section className="flex flex-col gap-4 animate-fadeIn">
            <div>
              <div className="text-[11px] text-textSecondary mb-2">
                Question {step + 1} / {TOTAL}
              </div>
              <div className="text-white text-base font-medium leading-relaxed">{questions[step].text}</div>
            </div>

            <div className="flex flex-col gap-3">
              {questions[step].answers.map((ans, idx) => {
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

        {/* Завершение */}
        {finished && (
          <section className="flex flex-col gap-4 text-center animate-fadeIn">
            <h2 className="text-white text-xl font-semibold">Investigation Complete 🎉</h2>
            <p className="text-sm text-textSecondary leading-relaxed">
              You cracked all {TOTAL} questions. Record your detective proof on Base.
            </p>

            <button
              onClick={handleRecord}
              className="w-full rounded-xl bg-green-600 text-white font-medium text-sm py-3 shadow-lg shadow-green-500/20 hover:opacity-90 transition"
            >
              {txStatus === "pending" ? "Recording on-chain..." : "Record Result On-Chain"}
            </button>

            {txStatus === "success" && (
              <>
                <p className="text-[11px] text-green-400">
                  ✅ Result recorded on Base. You can replay the case anytime.
                </p>
                <button
                  onClick={handleShare}
                  className="w-full rounded-xl bg-indigo-600 text-white font-medium text-sm py-3 shadow-lg shadow-indigo-500/20 hover:opacity-90 transition"
                >
                  Share on Farcaster
                </button>
              </>
            )}
            {txStatus === "error" && (
              <p className="text-[11px] text-red-400">❌ Failed to record result. Try again later.</p>
            )}

            <button
              onClick={handleStart}
              className="w-full mt-2 rounded-xl bg-white/5 text-xs text-textSecondary py-2 hover:bg-white/10 transition"
            >
              Play Again
            </button>
          </section>
        )}
      </div>

      <footer className="text-[10px] text-textSecondary mt-6 opacity-60 text-center leading-relaxed z-10">
        <div>Contract: 0xfbc5fbe823f76964de240433ad00651a76c672c8</div>
      </footer>
      <Footer />
    </main>
  );
}
