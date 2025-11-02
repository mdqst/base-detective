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
  // deterministic PRNG based on seed (xorshift32 style)
  let x = seed % 0xffffffff;
  if (x === 0) x = 0xdeadbeef;
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    // pseudo random
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    const j = x % (i + 1);
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

export default function Home() {
  // ui state
  const [provider, setProvider] = useState<any | null>(null);

  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [seed, setSeed] = useState<number | null>(null);

  // ask miniapp SDK to be ready + try to fetch fc provider
  useEffect(() => {
    sdk.actions.ready();
    // try to get Farcaster embedded provider (will fail in normal browser)
    getFarcasterProvider(sdk).then((prov) => {
      if (prov) setProvider(prov);
    });
  }, []);

  // fallback note for non-miniapp web users:
  // they will connect wallet via ConnectKit which sets wagmi signer/provider in the ConnectKit modal,
  // and we can't automatically grab it here without extra wiring.
  // For now they will see a hint below.

  // randomize questions after seed known
  const questionOrder = useMemo(() => {
    if (!seed) return CASE.questions;
    return shuffleWithSeed(CASE.questions, seed);
  }, [seed]);

  const currentQuestion = questionOrder[step];

  async function handleStart() {
    try {
      if (!provider) {
        alert("Please connect wallet first (Farcaster in-app wallet or Connect Wallet).");
        return;
      }
      // call startCase onchain
      await startCaseTx(provider, CASE.caseId);

      // generate local seed for this session if we don't have onchain read yet.
      // Real version: read playerCases[msg.sender][caseId].seed via viem publicClient.
      // For now, just fake a seed from Date.now()
      const localSeed = Date.now() % 0xffffffff;
      setSeed(localSeed);

      setStarted(true);
    } catch (err: any) {
      console.error(err);
      alert("Failed to start case.");
    }
  }

  function handleAnswer(answerIndex: number) {
    setAnswers((prev) => [...prev, answerIndex]);
    if (step < TOTAL - 1) {
        setStep(step + 1);
    } else {
        setFinished(true);
    }
  }

  async function handleRecord() {
    try {
      if (!provider) {
        alert("Please connect wallet first.");
        return;
      }
      // simple scoring: answerIndex === 0 is considered the 'best' reasoning choice
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
          <p className="text-sm text-textSecondary leading-relaxed">
            {CASE.intro}
          </p>
        </header>

        {!started && !finished && (
          <section className="flex flex-col gap-4">
            <div className="text-xs text-textSecondary bg-white/5 rounded-xl border border-white/10 p-3 leading-relaxed">
              <p className="mb-2">
                1. Connect wallet (Farcaster in-app wallet or any wallet via the button below).
              </p>
              <p className="mb-2">
                2. Start the investigation. We’ll generate a random question order.
              </p>
              <p>
                3. Answer all 10 questions. At the end you can record your result on Base.
              </p>
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
          <section className="flex flex-col gap-4">
            <div>
              <div className="text-[11px] text-textSecondary mb-2">
                Question {step + 1} / {TOTAL}
              </div>
              <div className="text-white text-base font-medium leading-relaxed">
                {currentQuestion.text}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {currentQuestion.answers.map((ans, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className="w-full text-left rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition px-4 py-3 text-sm leading-relaxed text-textPrimary"
                >
                  {ans}
                </button>
              ))}
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
          <section className="flex flex-col gap-4 text-center">
            <h2 className="text-white text-xl font-semibold">
              Investigation Complete
            </h2>
            <p className="text-sm text-textSecondary leading-relaxed">
              You answered all {TOTAL} questions. You can now record your final
              result on Base. This becomes public, permanent evidence that you
              ran the investigation.
            </p>

            <button
              onClick={handleRecord}
              className="w-full rounded-xl bg-green-600 text-white font-medium text-sm py-3 shadow-lg shadow-green-500/20 hover:opacity-90 transition"
            >
              Record Result On-Chain
            </button>

            <p className="text-[11px] text-textSecondary">
              This sends one transaction to contract and stores only your final
              outcome — not every answer.
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
