import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Footer from "../components/Footer";
import Link from "next/link";

type Challenge = {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

const CHALLENGES: Challenge[] = [
  {
    id: "reentrancy",
    title: "Reentrancy Vulnerability",
    difficulty: "Medium",
    prompt:
      "This contract exposes a withdraw() that sends ETH before updating the user balance. Which action describes the correct exploitation vector?",
    options: [
      "Call withdraw() directly once from an EOA repeatedly",
      "Implement a fallback that calls withdraw() again during the external call",
      "Call a view function to drain balances",
      "Use delegatecall to change storage of the contract",
    ],
    correctIndex: 1,
    explanation:
      "Reentrancy works when a contract sends funds before updating state. The attacker implements a fallback (or receive) that calls withdraw() again while the first withdraw is still executing — draining funds.",
  },
  {
    id: "overflow",
    title: "Integer Overflow",
    difficulty: "Easy",
    prompt:
      "A token contract uses `uint8` for balances and does not check arithmetic. Which of the following best describes a way to exploit it?",
    options: [
      "Send many tiny transfers until a balance wraps around to 0 then gain tokens",
      "Call owner-only function to mint tokens",
      "Use selfdestruct to steal the token's balance",
      "Call approve() without specifying spender",
    ],
    correctIndex: 0,
    explanation:
      "If arithmetic is unchecked and types are small, an attacker can craft transfers that cause wraparound (overflow/underflow) to manipulate balances. Modern solidity has built-in checks but older code/unchecked blocks are vulnerable.",
  },
  {
    id: "access_control",
    title: "Access Control Flaw",
    difficulty: "Easy",
    prompt:
      "A contract exposes `setRate(uint256 r)` and expects only owner to call it, but owner check is `if (msg.sender == owner) { ... }` and owner stored in a public variable that can be changed by anyone due to a missing initializer. What's the most likely cause?",
    options: [
      "Someone can change owner because owner was never set — call initialize() to become owner",
      "The contract is immutable and cannot be changed",
      "You need to call setRate twice to change owner",
      "This is safe — owner is private",
    ],
    correctIndex: 0,
    explanation:
      "If the owner variable was never correctly initialized (e.g., missing in constructor or initializer), an attacker can become owner by calling an initialization function or exploiting an uninitialized storage slot.",
  },
  {
    id: "delegatecall",
    title: "Delegatecall Misuse",
    difficulty: "Hard",
    prompt:
      "A proxy uses delegatecall to an implementation contract but trusts the implementation's storage layout. Which exploitation is relevant?",
    options: [
      "Call a function that delegatecalls to an attacker-controlled contract which overwrites critical slots (owner, admin).",
      "Call a pure function to get balance",
      "Use `transfer` to send ETH to the contract",
      "Read a public variable to become owner",
    ],
    correctIndex: 0,
    explanation:
      "Delegatecall executes code in the caller's context, so if the implementation address is attacker-controlled (or incorrectly set), the implementation can modify the proxy's storage and take ownership or change behavior.",
  },
];

function shuffle<T>(arr: T[], seed = Date.now()): T[] {
  const a = arr.slice();
  let m = a.length;
  let i: number;
  // simple seeded-ish shuffle using seed-derived RNG
  let random = () => {
    // xorshift32-ish
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967295;
  };
  while (m) {
    i = Math.floor(random() * m--);
    [a[m], a[i]] = [a[i], a[m]];
  }
  return a;
}

export default function PlaygroundPage() {
  // pick random order of challenges on first render
  const challengeOrder = useMemo(() => shuffle(CHALLENGES, Date.now()), []);
  const [index, setIndex] = useState(0);
  const challenge = challengeOrder[index];

  // shuffle options per challenge instance (persist per render)
  const [optionsState] = useState(() =>
    Object.fromEntries(
      challengeOrder.map((c) => [c.id, shuffle(c.options, c.id.split("").reduce((s, ch) => s + ch.charCodeAt(0), 0))])
    )
  );

  const currentOptions = optionsState[challenge.id];

  // We need to map currentOptions to know which one is correct
  const correctOptionText = challenge.options[challenge.correctIndex];
  const correctIndexInShuffled = currentOptions.findIndex((o) => o === correctOptionText);

  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  function chooseOption(i: number) {
    if (revealed) return; // once revealed, don't accept new until next challenge or restart
    setSelected(i);
    setAttempts((a) => a + 1);
    const isCorrect = i === correctIndexInShuffled;
    if (isCorrect) {
      setRevealed(true);
      setCompletedIds((ids) => (ids.includes(challenge.id) ? ids : [...ids, challenge.id]));
    } else {
      // mark wrong but allow retry — don't reveal correct yet
      setTimeout(() => {
        // keep selected to show red; allow user to change
      }, 0);
    }
  }

  function nextChallenge() {
    const next = index + 1;
    if (next < challengeOrder.length) {
      setIndex(next);
    } else {
      // wrap around or restart at 0
      setIndex(0);
    }
    setSelected(null);
    setRevealed(false);
    setAttempts(0);
  }

  function restartChallenge() {
    setSelected(null);
    setRevealed(false);
    setAttempts(0);
  }

  function completionProgress() {
    return Math.round((completedIds.length / challengeOrder.length) * 100);
  }

  return (
    <div className="flex flex-col items-center bg-background text-textPrimary px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md bg-surface rounded-2xl p-5 shadow-xl shadow-black/50 border border-white/10"
      >
        <header className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-semibold text-white flex items-center gap-2">🧨 Security Playground</h1>
            <p className="text-[11px] text-textSecondary">Learn smart contract bugs by solving short simulations</p>
          </div>
          <div className="text-right text-[12px]">
            <div className="text-[11px] text-textSecondary">Progress</div>
            <div className="text-sm font-semibold text-accent">{completedIds.length}/{challengeOrder.length} · {completionProgress()}%</div>
          </div>
        </header>

        <section className="mb-4">
          <div className="text-sm text-textSecondary mb-2">
            <strong className="text-white">{challenge.title}</strong>
            <span className="ml-2 text-[11px] px-2 py-0.5 rounded-md bg-black/20 text-textSecondary">{challenge.difficulty}</span>
          </div>

          <div className="bg-black/20 p-3 rounded-xl border border-white/6 text-sm">
            <p>{challenge.prompt}</p>
          </div>
        </section>

        <div className="flex flex-col gap-3">
          {currentOptions.map((opt, i) => {
            const isSelected = selected === i;
            const isCorrect = revealed && i === correctIndexInShuffled;
            const isWrong = isSelected && !isCorrect && revealed === false ? selected === i && selected !== correctIndexInShuffled && !revealed : false;
            // Visual rules:
            // - If revealed && correct -> green highlight
            // - If selected && not correct -> red highlight (but do not reveal correct until correct chosen)
            // - If not selected -> neutral
            const baseCls = "w-full text-sm text-left rounded-lg px-3 py-2 border transition";
            let cls = baseCls + " bg-black/10 border-white/6";
            if (revealed && isCorrect) {
              cls = baseCls + " bg-green-600/30 border-green-500 text-white";
            } else if (isSelected && !revealed && selected !== correctIndexInShuffled) {
              // user selected wrong, highlight red
              cls = baseCls + " bg-red-600/20 border-red-500 text-white";
            } else {
              cls = baseCls + " hover:bg-black/20";
            }

            return (
              <button key={i} onClick={() => chooseOption(i)} className={cls} aria-pressed={isSelected}>
                <div className="flex items-center justify-between">
                  <span>{opt}</span>
                  {revealed && isCorrect && <span className="text-[12px] text-green-200">Correct</span>}
                  {!revealed && isSelected && selected !== correctIndexInShuffled && <span className="text-[12px] text-red-200">Wrong</span>}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex gap-2">
          {!revealed ? (
            <button
              onClick={() => {
                // hint: reveal correct after a penalty — but by default we don't reveal
                setRevealed(true);
              }}
              className="flex-1 rounded-xl bg-black/20 border border-white/6 text-sm py-2 hover:bg-black/30"
            >
              Show Explanation (skip)
            </button>
          ) : (
            <div className="flex-1 rounded-xl bg-black/20 border border-white/6 text-sm py-2 px-3">
              <div className="text-sm text-textSecondary mb-1">Explanation</div>
              <div className="text-sm text-gray-100">{challenge.explanation}</div>
            </div>
          )}

          <button
            onClick={restartChallenge}
            className="rounded-xl bg-transparent border border-white/6 text-sm py-2 px-4 hover:bg-black/10"
          >
            Retry
          </button>

          <button
            onClick={nextChallenge}
            className="rounded-xl bg-accent text-white text-sm py-2 px-4 hover:opacity-90"
          >
            Next
          </button>
        </div>

        <div className="mt-4 text-[12px] text-textSecondary">
          <div>Attempts this challenge: <span className="font-medium text-white">{attempts}</span></div>
          <div className="mt-2 text-xs text-gray-400">
            Tip: read the prompt carefully — these simulations are intentionally simplified to teach core concepts.
          </div>
        </div>

        {/* Success banner when revealed correct */}
        {revealed && selected === correctIndexInShuffled && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-lg bg-green-600/20 border border-green-500 text-green-100 text-sm"
          >
            Exploit successful — well done! You can read the explanation above and proceed to the next simulation.
          </motion.div>
        )}

        {/* Footer links small */}
        <div className="mt-5 flex gap-2 justify-between items-center">
          <Link href="/tools" className="text-[13px] text-blue-400 hover:underline">
            ← Back to Tools
          </Link>
          <div className="text-[12px] text-textSecondary">Play safe — simulation only</div>
        </div>
      </motion.div>

      <Footer />
    </div>
  );
}
