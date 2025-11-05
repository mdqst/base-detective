import { useEffect, useMemo, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import data from "../data/questions_case1.json";
import { getFarcasterProvider, completeCaseTx } from "../hooks/useContract";
// если у тебя есть отдельная кнопка — можно оставить, иначе убери строку ниже
import WalletConnectButton from "../components/WalletConnectButton";

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
  const [answers, setAnswers] = useState<number[]>([]); // храним индексы правильных ответов
  const [wrongAnswer, setWrongAnswer] = useState<number | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null);

  const [seed, setSeed] = useState<number | null>(null);
  const [txStatus, setTxStatus] = useState<"idle" | "pending" | "success" | "error">("idle");

  useEffect(() => {
    sdk.actions.ready();
    (async () => {
      const prov = await getFarcasterProvider(sdk);
      if (prov) setProvider(prov);
    })();
  }, []);

  const questionOrder = useMemo(() => {
    if (!seed) return CASE.questions;
    return shuffleWithSeed(CASE.questions, seed);
  }, [seed]);

  const currentQuestion = questionOrder[step];

  function handleStart() {
    // никакого вызова контракта здесь
    const localSeed = Date.now() % 0xffffffff;
    setSeed(localSeed);
    setStarted(true);
    setFinished(false);
    setStep(0);
    setAnswers([]);
    setWrongAnswer(null);
    setCorrectAnswer(null);
    setTxStatus("idle");
  }

  function handleAnswer(idx: number) {
    if (!currentQuestion || finished) return;

    const isCorrect = idx === 0; // по нашей схеме правильный ответ всегда первый в массиве

    if (isCorrect) {
      setCorrectAnswer(idx);
      setWrongAnswer(null);

      setTimeout(() => {
        setCorrectAnswer(null);
        setAnswers((prev) => [...prev, idx]);

        if (step < TOTAL - 1) {
          setStep(step + 1);
        } else {
          setFinished(true);
        }
      }, 450);
    } else {
      // подсветить красным, но не переходить к следующему вопросу
      setWrongAnswer(idx);
    }
  }

  async function handleRecord() {
    try {
      if (!provider) {
        // ещё раз попробуем вытащить провайдер
        const prov = await getFarcasterProvider(sdk);
        if (!prov) {
          alert("No wallet provider found. Please open in Farcaster or connect a wallet.");
          return;
        }
        setProvider(prov);
      }

      setTxStatus("pending");

      const correctCount = TOTAL; // раз мы двигаемся дальше только при правильном ответе, значит все 10 правильные
      // но можно сделать гибкую оценку, на будущее:
      // const correctCount = answers.length;
      const result = correctCount >= 7 ? 1 : correctCount >= 4 ? 2 : 3;

      await completeCaseTx(provider, CASE.caseId, result);

      setTxStatus("success");
    } catch (err) {
      console.error("Failed to record result:", err);
      setTxStatus("error");
    }
  }

  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-background text-textPrimary px-4 py-8">
      {/* лёгкая анимация появления */}
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

      <div className="w-full max-w-md bg-surface rounded-2xl p-5 shadow-xl shadow-black/50 border border-white/10 animate-fadeIn">
        <header className="flex flex-col gap-2 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-white flex items-center gap-2">
              🕵️ Base Detective
            </h1>
            <span className="text-[10px] text-textSecondary bg-white/5 border border-white/10 rounded-md px-2 py-1 leading-none">
              Case #{CASE.caseId}
            </span>
          </div>
          {/* История кейса — та самая про хак DAO и т.п. */}
          <p className="text-sm text-textSecondary leading-relaxed">{CASE.intro}</p>
        </header>

        {!started && !finished && (
          <section className="flex flex-col gap-4">
            <div className="text-xs text-textSecondary bg-white/5 rounded-xl border border-white/10 p-3 leading-relaxed">
              <p className="mb-2">
                • This is an on-chain investigation training based on a real DeFi exploit.
              </p>
              <p className="mb-1">
                • You <span className="text-textPrimary font-medium">must answer all 10 questions correctly</span>.
              </p>
              <p className="mb-1">
                • Wrong answers turn <span className="text-red-400 font-medium">red</span>, you can try again.
              </p>
              <p>
                • Only when you finish the whole case, your final result can be written to Base.
              </p>
            </div>

            {/* Если у тебя есть рабочая кнопка кошелька — оставляем */}
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
          <section className="flex flex-col gap-4 animate-fadeIn">
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

        {finished && (
          <section className="flex flex-col gap-4 text-center animate-fadeIn">
            <h2 className="text-white text-xl font-semibold">Investigation Complete</h2>
            <p className="text-sm text-textSecondary leading-relaxed">
              You solved all {TOTAL} questions. Now you can optionally record your
              final detective rank on Base. This is a permanent proof that you cracked this case.
            </p>

            <button
              onClick={handleRecord}
              className="w-full rounded-xl bg-green-600 text-white font-medium text-sm py-3 shadow-lg shadow-green-500/20 hover:opacity-90 transition"
            >
              {txStatus === "pending" ? "Recording on-chain..." : "Record Result On-Chain"}
            </button>

            {txStatus === "success" && (
              <p className="text-[11px] text-green-400">
                ✅ Result recorded on Base. You can replay the case anytime.
              </p>
            )}
            {txStatus === "error" && (
              <p className="text-[11px] text-red-400">
                ❌ Failed to record result. You can try again later.
              </p>
            )}

            <button
              onClick={handleStart}
              className="w-full mt-2 rounded-xl bg-white/5 text-xs text-textSecondary py-2 hover:bg-white/10 transition"
            >
              Play Again (off-chain)
            </button>
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
