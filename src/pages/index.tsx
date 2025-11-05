"use client";

import { useEffect, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { getFarcasterProvider, completeCaseTx } from "../hooks/useContract";
import { motion, AnimatePresence } from "framer-motion";

const CASE = { caseId: 1 };

const QUESTIONS = [
  {
    question: "Which function visibility allows only external calls?",
    answers: ["public", "external", "internal", "private"],
    correct: 1,
  },
  {
    question: "What does 'view' mean in Solidity?",
    answers: [
      "The function changes state",
      "The function reads state but doesn't modify it",
      "The function is payable",
      "The function is only internal",
    ],
    correct: 1,
  },
  {
    question: "What is the purpose of require() in Solidity?",
    answers: [
      "To execute external calls",
      "To check a condition and revert on failure",
      "To store data permanently",
      "To transfer Ether",
    ],
    correct: 1,
  },
  {
    question: "What does msg.sender represent?",
    answers: [
      "The contract deployer",
      "The function return value",
      "The caller’s address",
      "The Base chain ID",
    ],
    correct: 2,
  },
  {
    question: "Which function modifier allows receiving ETH?",
    answers: ["pure", "view", "payable", "external"],
    correct: 2,
  },
  {
    question: "Which keyword prevents a function from being overridden?",
    answers: ["immutable", "constant", "final", "virtual"],
    correct: 3,
  },
  {
    question: "What is emitted to the blockchain logs?",
    answers: ["events", "functions", "errors", "mappings"],
    correct: 0,
  },
  {
    question: "What does 'mapping' in Solidity represent?",
    answers: [
      "A loop structure",
      "A key-value data store",
      "An imported library",
      "A struct definition",
    ],
    correct: 1,
  },
  {
    question: "What happens when assert() fails?",
    answers: [
      "It returns false",
      "It reverts and consumes all gas",
      "It logs a warning",
      "It emits an event",
    ],
    correct: 1,
  },
  {
    question: "What is the default value of an uninitialized bool?",
    answers: ["true", "false", "0", "undefined"],
    correct: 1,
  },
];

export default function Home() {
  const [provider, setProvider] = useState<any>(null);
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [txStatus, setTxStatus] = useState<
    "none" | "pending" | "success" | "error"
  >("none");

  // подключаем Farcaster или MetaMask
  useEffect(() => {
    (async () => {
      const p = await getFarcasterProvider(sdk);
      setProvider(p);
    })();
  }, []);

  const startGame = () => {
    setStarted(true);
    setCurrent(0);
    setAnswers([]);
    setFinished(false);
    setTxStatus("none");
  };

  const selectAnswer = (index: number) => {
    if (finished) return;
    const newAnswers = [...answers];
    newAnswers[current] = index;
    setAnswers(newAnswers);

    setTimeout(() => {
      if (current + 1 < QUESTIONS.length) {
        setCurrent(current + 1);
      } else {
        finishGame(newAnswers);
      }
    }, 600);
  };

  const finishGame = async (answersArray: number[]) => {
    setFinished(true);
    const correct = answersArray.filter(
      (a, i) => a === QUESTIONS[i].correct
    ).length;
    setCorrectCount(correct);

    if (!provider) {
      setTxStatus("error");
      return;
    }

    try {
      setSubmitting(true);
      setTxStatus("pending");
      const result = correct === QUESTIONS.length ? 1 : 0;
      await completeCaseTx(provider, CASE.caseId, result);
      setTxStatus("success");
    } catch (err) {
      console.error("❌ Failed to record result:", err);
      setTxStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white text-center">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-4"
        >
          🕵️‍♂️ Base Detective
        </motion.h1>
        <p className="text-gray-400 mb-6 max-w-md">
          Solve 10 smart contract riddles. Only true detectives reach the end!
        </p>
        <button
          onClick={startGame}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-lg font-semibold"
        >
          Start Investigation
        </button>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white text-center">
        <h2 className="text-2xl font-bold mb-2">
          {correctCount === QUESTIONS.length
            ? "🟢 Perfect Investigation!"
            : "🧩 Case Closed"}
        </h2>
        <p className="text-gray-400 mb-6">
          You got {correctCount} / {QUESTIONS.length} correct.
        </p>

        <AnimatePresence>
          {txStatus === "pending" && (
            <motion.div
              key="pending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-yellow-400 animate-pulse mb-4"
            >
              ⏳ Recording result on-chain...
            </motion.div>
          )}
          {txStatus === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-green-400 mb-4"
            >
              ✅ Successfully recorded on Base!
            </motion.div>
          )}
          {txStatus === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-red-400 mb-4"
            >
              ❌ Failed to record result.
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={startGame}
          disabled={submitting}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-lg font-semibold disabled:opacity-50"
        >
          {submitting ? "Please wait..." : "Try Again"}
        </button>
      </div>
    );
  }

  const q = QUESTIONS[current];
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-md w-full bg-gray-900 p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4">
          Question {current + 1} / {QUESTIONS.length}
        </h2>
        <p className="mb-6 text-gray-300">{q.question}</p>
        <div className="space-y-3">
          {q.answers.map((a, i) => {
            const selected = answers[current] === i;
            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.97 }}
                onClick={() => selectAnswer(i)}
                className={`w-full text-left px-4 py-2 rounded-lg border transition-colors
                  ${
                    selected
                      ? "bg-blue-700 border-blue-500"
                      : "bg-gray-800 border-gray-700 hover:bg-gray-700"
                  }`}
              >
                {a}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
