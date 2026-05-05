'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Lottie from "lottie-react";
import { useRouter } from 'next/navigation';
import { createClient } from "@supabase/supabase-js";
import { supabase } from '@/lib/supabase';
import { completeToday, hasCompletedToday } from '@/lib/streak';
import { getXp } from '@/lib/xp';
import { getProgramById } from '@/lib/programs';
import {
  completeSegment,
  getProgramProgress,
  getResumeSegmentIndex,
} from '@/lib/programProgress';
import { getUserPlan as getTrainingPlan } from '@/lib/userPlan';
import { getUserPlan } from '@/lib/getUserPlan';
import { getSubscriptionStatus } from '@/lib/user';
import { addIncorrectQuestion, getIncorrectQuestions } from '@/lib/review';
import { recordAnswerPerformance } from '@/lib/performance';
import { playSound, triggerHaptic } from '@/lib/sound';
import { getXpConfig } from '@/lib/xpEngine';
import checkAnim from "@/public/lottie/check.json";
import Flame from '@/components/Flame';

type Question = {
  id: string;
  segmentId: string;
  reference: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'scholar';
};

type IncorrectItem = {
  question: Question;
  userAnswer: string;
};

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

function getStreakMessage(streak: number) {
  if (streak >= 10) return "Unstoppable 🔥";
  if (streak >= 5) return "Strong momentum";
  if (streak >= 3) return "You're on fire";
  return "";
}

export default function QuizPage() {
  const router = useRouter();
  const [segment, setSegment] = useState('genesis-1-3');
  const [selectedSegmentParam, setSelectedSegmentParam] = useState<string | null>(null);
  const [paramsInitialized, setParamsInitialized] = useState(false);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [combo, setCombo] = useState(0);
  const [comboFlash, setComboFlash] = useState(false);
  const [, setShowResult] = useState<"correct" | "wrong" | null>(null);
  const [, setFlameState] = useState<"idle" | "correct" | "wrong">("idle");
  const [showXpGain, setShowXpGain] = useState(false);
  const [xpAmount, setXpAmount] = useState(10);
  const [displayXp, setDisplayXp] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [incorrectQuestions, setIncorrectQuestions] = useState<IncorrectItem[]>([]);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [reviewQuestions, setReviewQuestions] = useState<Question[]>([]);
  const [streakSaved, setStreakSaved] = useState(false);
  const [, setShowRetryPrompt] = useState(false);
  const [completedToday, setCompletedToday] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState<number | null>(null);
  const [isProUser, setIsProUser] = useState(false);
  const [isProPlusUser, setIsProPlusUser] = useState(false);
  const [loadingPro, setLoadingPro] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [isTrainingMode, setIsTrainingMode] = useState(false);
  const [quizSeed, setQuizSeed] = useState(0);
  const [isWeaknessMode, setIsWeaknessMode] = useState(false);
  const [weakQuestions, setWeakQuestions] = useState<Question[]>([]);
  const [noWeakAreasMessage, setNoWeakAreasMessage] = useState(false);
  const [mode, setMode] = useState<'normal' | 'training' | 'scholar'>('normal');
  const [activeProgramId, setActiveProgramId] = useState<string | null>(null);
  const [activeProgramSegmentIndex, setActiveProgramSegmentIndex] = useState<number | null>(null);
  const [programProgressSaved, setProgramProgressSaved] = useState(false);
  const [programLimitReached, setProgramLimitReached] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewCompletionSaved, setPreviewCompletionSaved] = useState(false);
  const [previewCompleted, setPreviewCompleted] = useState<boolean | null>(null);
  const [planType, setPlanType] = useState<string | null>(null);
  const [showPreviewPaywall, setShowPreviewPaywall] = useState(false);
  const [safeDepth, setSafeDepth] = useState<number | null>(null);
  const [questionsPerDay, setQuestionsPerDay] = useState(10);

  console.log("QUIZ LOAD STATE", {
    planType,
    isPro: isProUser,
    isProPlus: isProPlusUser,
    activeProgramId,
    segment,
    selectedSegmentParam,
    safeDepth,
    mode
  });

  const activeProgram = getProgramById(activeProgramId);
  const isProgramMode = Boolean(activeProgram && activeProgramSegmentIndex !== null);
  const isFinalProgramSegment = Boolean(
    activeProgram &&
    activeProgramSegmentIndex !== null &&
    activeProgramSegmentIndex === activeProgram.segments.length - 1
  );
  const nextSegment = () => {
    if (!activeProgram || activeProgramSegmentIndex === null) return null;

    const nextIndex = activeProgramSegmentIndex + 1;

    if (nextIndex >= activeProgram.segments.length) return null;

    return activeProgram.segments[nextIndex];
  };
  const next = nextSegment();

  useEffect(() => {
    let start = 0;
    const end = xpAmount;
    const duration = 600;

    if (showXpGain) {
      const increment = end / (duration / 16);

      const counter = setInterval(() => {
        start += increment;

        if (start >= end) {
          setDisplayXp(end);
          clearInterval(counter);
        } else {
          setDisplayXp(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(counter);
    }
  }, [xpAmount, showXpGain]);

  useEffect(() => {
    const initializeQuiz = async () => {
      const search = typeof window !== 'undefined' ? window.location.search : '';
      const params = new URLSearchParams(search);
      const segmentParam = params.get('segment');
      const fallbackSegment = 'genesis-1-3';
      const programParam = params.get('program');
      const modeParam = params.get('mode') as 'scholar' | null;
      const previewParam = params.get('preview') === 'true';
      const depthParam = params.get("depth")
      const parsedDepth = depthParam ? parseInt(depthParam) : null
      const plan = await getUserPlan()
      let safeDepth = parsedDepth

      if (plan === "pro" || plan === "family_pro") {
        safeDepth = null
      }

      setSelectedSegmentParam(segmentParam);
      setIsPreviewMode(previewParam);
      setSafeDepth(
        safeDepth === 5 || safeDepth === 10 || safeDepth === 15
          ? safeDepth
          : null
      );

      if (modeParam === 'scholar') {
        setMode('scholar');
      }

      const matchedProgram = getProgramById(programParam);
      if (matchedProgram && plan !== "free") {
        const progress = await getProgramProgress(matchedProgram.id);

        if (progress.completed) {
          window.location.assign('/programs');
          return;
        }

        const safeIndex = getResumeSegmentIndex(progress, matchedProgram.segments.length);

        setActiveProgramId(matchedProgram.id);
        setActiveProgramSegmentIndex(safeIndex);
        if (!segmentParam) {
          setSegment(
            matchedProgram.segments[safeIndex].segment
              .toLowerCase()
              .replaceAll("_", "-")
          );
        } else {
          setSegment(segmentParam);
        }
      } else {
        setSegment(segmentParam || fallbackSegment);
      }

      const completed = await hasCompletedToday();
      setCompletedToday(completed);

      const storedXp = await getXp();
      setTotalXp(storedXp);

      const userPlan = await getTrainingPlan();
      setQuestionsPerDay(userPlan?.segmentsPerDay ?? 10);

      setParamsInitialized(true);
    };

    initializeQuiz();
  }, []);

  useEffect(() => {
    if (!paramsInitialized) return

    async function checkPro() {
      const { isPro, isProPlus } = await getSubscriptionStatus();
      setIsProUser(isPro);
      setIsProPlusUser(isProPlus);
      setLoadingPro(false);

      if (mode === 'scholar' && !isProPlus) {
        return;
      }
    }
    checkPro();
  }, [mode, paramsInitialized]);

  useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setPreviewCompleted(false);
        setPlanType("free");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("preview_completed")
        .eq("id", user.id)
        .single();

      const plan = await getUserPlan();

      setPreviewCompleted(profile?.preview_completed === true);
      setPlanType(plan);
    };

    checkAccess();
  }, []);

  const resolvedSegment =
    paramsInitialized && !loadingPro
      ? selectedSegmentParam || segment
      : null;

  useEffect(() => {
    if (!resolvedSegment) {
      return;
    }

    const loadQuestions = async () => {
      setLoadingQuestions(true);

      try {
        const isFree = !isProUser && !isProPlusUser;
        const enforcedDepth = isFree ? 5 : safeDepth;
        const response = await fetch(
          `/api/quiz/questions?segment=${encodeURIComponent(resolvedSegment)}&mode=${encodeURIComponent(mode)}&depth=${enforcedDepth ?? ""}&isPro=${String(isProUser || isProPlusUser)}&seed=${quizSeed}`,
          {
            credentials: 'include'
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error('Error loading quiz questions:', data);
          setQuestions([]);
          return;
        }

        const normalizedQuestions = (data as Question[]).map((q) => ({
          ...q,
          id: q.id
        }));

        setQuestions(normalizedQuestions);
      } catch (error) {
        console.error('Error loading quiz questions:', error);
        setQuestions([]);
      } finally {
        setLoadingQuestions(false);
      }
    };

    loadQuestions();
  }, [resolvedSegment]);

  const baseQuestions = isReviewMode
    ? reviewQuestions
    : isWeaknessMode
    ? weakQuestions
    : questions;
  const activeQuestions = baseQuestions;
  const availableQuestionCount = activeQuestions.length;
  const currentQuestion = activeQuestions[currentQuestionIndex];

  const percentageScore = availableQuestionCount > 0 ? (score / availableQuestionCount) * 100 : 0;
  let percentile = 50;
  let percentileEmoji = '📖';

  if (percentageScore >= 90) {
    percentile = 90;
    percentileEmoji = '🔥';
  } else if (percentageScore >= 75) {
    percentile = 75;
    percentileEmoji = '💪';
  } else if (percentageScore >= 60) {
    percentile = 60;
    percentileEmoji = '👍';
  } else {
    percentile = 40;
    percentileEmoji = '📖';
  }

  const handleContinueTraining = () => {
    if (isProPlusUser) {
      setIsTrainingMode(true);
      setQuizSeed(prev => prev + 1);
      resetQuiz();
      return;
    }

    console.error("REDIRECT TRIGGERED HERE", {
      location: "app/quiz/page.tsx",
      planType,
      isPro: isProUser,
      isProPlus: isProPlusUser,
      activeProgramId,
      segmentParam: selectedSegmentParam || segment,
      safeDepth
    });
    window.location.assign('/pricing?source=generic_upgrade');
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selectedAnswer !== null) return;

      if (e.key === "1") handleAnswerSelect(0);
      if (e.key === "2") handleAnswerSelect(1);
      if (e.key === "3") handleAnswerSelect(2);
      if (e.key === "4") handleAnswerSelect(3);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedAnswer, currentQuestion]);

  useEffect(() => {
    if (combo > 1) {
      setComboFlash(true);
      const timeout = window.setTimeout(() => setComboFlash(false), 300);
      return () => window.clearTimeout(timeout);
    }
  }, [combo]);

  const buildWeakQuestionSet = (ids: string[]) => {
    const idSet = new Set(ids);
    return shuffleArray(questions.filter((question) => idSet.has(question.id)));
  };

  const handleTrainWeakAreas = () => {
    const incorrectIds = getIncorrectQuestions();

    if (!incorrectIds.length) {
      setNoWeakAreasMessage(true);
      setIsWeaknessMode(false);
      return;
    }

    const weakSet = buildWeakQuestionSet(incorrectIds);

    if (!weakSet.length) {
      setNoWeakAreasMessage(true);
      setIsWeaknessMode(false);
      return;
    }

    setNoWeakAreasMessage(false);
    setIsTrainingMode(false);
    setIsWeaknessMode(true);
    setWeakQuestions(weakSet);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizCompleted(false);
    setIsReviewMode(false);
    setShowRetryPrompt(false);
  };

  useEffect(() => {
    const markComplete = async () => {
      if (quizCompleted && !isReviewMode && !streakSaved && !isTrainingMode && !isProgramMode) {
        await completeToday();
        setStreakSaved(true);
      }
    };

    markComplete();
  }, [isProgramMode, isReviewMode, isTrainingMode, quizCompleted, streakSaved]);

  useEffect(() => {
    const syncProgramProgress = async () => {
      if (programProgressSaved) return;

      if (
        !quizCompleted ||
        isReviewMode ||
        !activeProgram ||
        activeProgramSegmentIndex === null ||
        isPreviewMode ||
        programProgressSaved
      ) {
        return;
      }

      setProgramProgressSaved(true);
      const result = await completeSegment();

      if (result.limitReached) {
        setProgramLimitReached(true);
        return;
      }

      if (!result.success) {
        setProgramProgressSaved(false);
        return;
      }
    };

    syncProgramProgress();
  }, [activeProgram, activeProgramSegmentIndex, isPreviewMode, isReviewMode, programProgressSaved, quizCompleted]);

  useEffect(() => {
    const markPreviewCompleted = async () => {
      if (!quizCompleted || !isPreviewMode || previewCompletionSaved) {
        return;
      }

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && !isProUser && !isProPlusUser) {
        await supabase
          .from("profiles")
          .update({ preview_completed: true })
          .eq("id", user.id);
      }

      setPreviewCompletionSaved(true);
    };

    markPreviewCompleted();
  }, [isPreviewMode, isProPlusUser, isProUser, previewCompletionSaved, quizCompleted]);

  const isFreeUser = !isProUser && !isProPlusUser;

  useEffect(() => {
    if (!(quizCompleted && isPreviewMode && isFreeUser)) {
      setShowPreviewPaywall(false);
      return;
    }

    const timeout = window.setTimeout(() => {
      setShowPreviewPaywall(true);
    }, 800);

    return () => window.clearTimeout(timeout);
  }, [isFreeUser, isPreviewMode, quizCompleted]);

  if (loadingPro) {
    return <div className="p-6 text-black">Loading...</div>;
  }

  if (previewCompleted === null || planType === null) {
    return null;
  }

  if (quizCompleted && isPreviewMode && isFreeUser && !showPreviewPaywall) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 rounded-2xl shadow-xl p-6">
          <div className="text-center text-white animate-pulse mb-4">
            Completing your preview...
          </div>
        </div>
      </div>
    );
  }

  if (!paramsInitialized) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <p className="text-lg text-slate-300">Preparing quiz...</p>
      </div>
    );
  }

  if (loadingQuestions) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <p className="text-lg text-slate-300">Loading questions...</p>
      </div>
    );
  }

  if (showLevelUp && newLevel !== null) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
        <div className="w-full max-w-md rounded-xl bg-white p-6 text-center shadow-2xl">
          <div className="mb-4 flex justify-center">
            <Flame state="levelup" size={80} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Level Up!</h1>
          <p className="text-lg text-gray-700 mb-6">You&apos;re now Level {newLevel}</p>
          <button
            onClick={() => setShowLevelUp(false)}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-150 hover:bg-blue-700 hover:scale-[1.02] shadow-md hover:shadow-lg hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] active:scale-95 active:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (false && completedToday && !isReviewMode && !isTrainingMode && !isWeaknessMode && !isProgramMode && mode !== 'scholar') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 rounded-2xl shadow-xl p-6">
          <h1 className="text-2xl font-bold text-center text-white mb-4">
            You&apos;ve completed today&apos;s quiz ✅
          </h1>
          <p className="text-center text-slate-300 mb-2">
            Great work! Keep building your mastery by reviewing what you missed.
          </p>
          <p className="text-center text-gray-200 text-sm mb-6">
            New questions unlock tomorrow 🔥
          </p>
          <div className="space-y-3">
              <button
                onClick={handleTrainWeakAreas}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-150 hover:bg-indigo-700 hover:scale-[1.02] shadow-md hover:shadow-lg active:scale-95 active:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Review Past Answers
              </button>
            {noWeakAreasMessage && (
              <p className="text-center text-sm text-slate-300">You&apos;re doing great! No past errors to review right now.</p>
            )}
            {isProPlusUser ? (
              <button
                onClick={handleContinueTraining}
                className="w-full bg-black text-white py-3 px-4 rounded-xl font-semibold transition-all duration-150 hover:bg-gray-900 hover:scale-[1.02] shadow-md hover:shadow-lg active:scale-95 active:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Continue Training
              </button>
            ) : (
              <div className="rounded-lg border border-slate-700 bg-slate-800 p-3 text-center">
                <p className="text-white mb-3">🔒 Continue Training is available on Pro+</p>
                <Link href="/pricing?source=link_upgrade" className="block">
                  <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-150 hover:bg-blue-700 hover:scale-[1.02] shadow-md hover:shadow-lg hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] active:scale-95 active:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500">
                    Upgrade to Pro+
                  </button>
                </Link>
              </div>
            )}
            {incorrectQuestions.length > 0 && (
              <button
                onClick={() => startReview()}
                className="w-full bg-yellow-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-150 hover:bg-yellow-700 hover:scale-[1.02] shadow-md hover:shadow-lg active:scale-95 active:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                Review Mistakes
              </button>
            )}
            <Link href="/dashboard" className="block">
              <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-150 hover:bg-blue-700 hover:scale-[1.02] shadow-md hover:shadow-lg hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] active:scale-95 active:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500">
                Back to Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!questions) {
    return <div>Loading questions...</div>;
  }

  if (questions.length === 0) {
    return <div>No questions available for this segment.</div>;
  }

  if (activeQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg text-slate-300">No questions in review mode yet</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return <div>Loading next question...</div>;
  }

  const progress = ((currentQuestionIndex + 1) / availableQuestionCount) * 100;
  const currentIncorrectItem = incorrectQuestions.find(x => x.question.id === currentQuestion.id);
  const isAnswered = selectedAnswer !== null;
  const correctIndex = currentQuestion.correctIndex;
  const getButtonStyle = (index: number) => {
    if (!showFeedback) return "bg-blue-600";

    if (index === correctIndex) {
      return "bg-green-500 scale-105";
    }

    if (index === selectedAnswer) {
      return "bg-red-500";
    }

    return "bg-gray-700 opacity-50";
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    const correctAnswer = currentQuestion.correctIndex;
    const correct = answerIndex === correctIndex;
    const shouldAutoAdvance = !isReviewMode;
    console.log("ANSWER CLICKED", {
      questionId: currentQuestion.id,
      selectedAnswer: answerIndex,
      correctAnswer
    });
    setSelectedAnswer(answerIndex);
    setIsCorrectAnswer(correct);
    setShowFeedback(shouldAutoAdvance);

    if (!isReviewMode) {
      const handleProgress = async () => {
        const isCorrect = answerIndex === currentQuestion.correctIndex;
        recordAnswerPerformance(currentQuestion.segmentId, isCorrect);

        if (!resolvedSegment) {
          console.error("Missing segmentId");
          return;
        }

        console.log("CURRENT QUESTION:", currentQuestion);
        console.log("SENDING QUESTION ID:", currentQuestion.id);

        const response = await fetch("/api/quiz/answer", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            questionId: currentQuestion.id,
            correct: isCorrect,
            segmentId: resolvedSegment
          })
        });
        console.log("API RESPONSE", await response.clone().json());

        if (isCorrect) {
          const nextCombo = combo + 1;
          const audio = new Audio("/sounds/correct.mp3");
          audio.volume = 0.3;
          void audio.play();
          triggerHaptic("light");
          setShowResult("correct");
          setFlameState("correct");
          setShowCelebration(true);
          setTimeout(() => {
            setShowCelebration(false);
          }, 1000);
          setStreak(prev => prev + 1);
          setCombo(prev => prev + 1);
          setScore(score + 1);
        } else {
          const audio = new Audio("/sounds/wrong.mp3");
          audio.volume = 0.25;
          void audio.play();
          triggerHaptic("medium");
          setShowResult("wrong");
          setFlameState("wrong");
          setStreak(0);
          setCombo(0);
          addIncorrectQuestion(currentQuestion.id);
          setIncorrectQuestions(prev =>
            prev.some(q => q.question.id === currentQuestion.id)
              ? prev
              : [...prev, { question: currentQuestion, userAnswer: currentQuestion.options[answerIndex] }]
          );
        }

      };

      handleProgress();

      window.setTimeout(() => {
        handleNextQuestion();
        setSelectedAnswer(null);
        setShowFeedback(false);
        setIsCorrectAnswer(null);
      }, 700);
    }
  };

  const completeQuiz = () => {
    setQuizCompleted(true);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 1200);
    if (!isReviewMode && !isTrainingMode) {
      updateMastery();
    }
  };

  const handleNextQuestion = () => {
    setShowResult(null);
    setShowXpGain(false);
    setShowCelebration(false);
    setFlameState("idle");
    setShowFeedback(false);
    setIsCorrectAnswer(null);

    const isLastQuestion = currentQuestionIndex >= availableQuestionCount - 1

    if (isLastQuestion) {
      completeQuiz()
      return;
    }

    setCurrentQuestionIndex(prev => prev + 1);
    setSelectedAnswer(null);
    setShowRetryPrompt(false);
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsCorrectAnswer(null);
    setScore(0);
    setStreak(0);
    setCombo(0);
    setShowResult(null);
    setFlameState("idle");
    setShowXpGain(false);
    setShowCelebration(false);
    setProgramProgressSaved(false);
    setProgramLimitReached(false);

    setQuizCompleted(false);
    setIncorrectQuestions([]);
    setIsReviewMode(false);
    setReviewQuestions([]);
    setStreakSaved(false);
    setShowRetryPrompt(false);
    setIsWeaknessMode(false);
    setWeakQuestions([]);
    setNoWeakAreasMessage(false);

    if (isTrainingMode) {
      setStreakSaved(true);
    }
  };

  const startReview = () => {
    if (incorrectQuestions.length === 0) return;
    setIsReviewMode(true);
    setReviewQuestions(incorrectQuestions.map(item => item.question));
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsCorrectAnswer(null);
    setQuizCompleted(false);
    setShowRetryPrompt(false);
  };

  const handleTryAgain = () => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsCorrectAnswer(null);
    setShowRetryPrompt(false);
  };

  const updateMastery = async () => {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const totalAnswered = questions.length;
      const totalCorrect = score;
      const accuracy = totalCorrect / totalAnswered;

      await supabase
        .from("user_segment_mastery")
        .upsert({
          user_id: user.id,
          segment: segment,
          total_answered: totalAnswered,
          total_correct: totalCorrect,
          accuracy: accuracy,
          mastered: accuracy >= 0.8 && totalAnswered >= 10,
          updated_at: new Date().toISOString()
        }, {
          onConflict: "user_id,segment"
        });

    } catch (err) {
      console.error("Error updating mastery:", err);
    }
  };

  if (quizCompleted) {
    return (
      <>
        {programLimitReached && (
          <div className="fixed inset-x-4 top-4 z-50 mx-auto max-w-md rounded-2xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-center text-sm font-semibold text-amber-200 shadow-lg">
            Daily limit reached. Upgrade or come back tomorrow to continue.
          </div>
        )}

        {showXpGain && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-40">
            <span className="animate-xp text-xl font-bold text-green-400 animate-pulse">
              +{displayXp} XP
            </span>
          </div>
        )}

        {showCelebration && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            <div className="animate-pop text-center">
              <div className="text-5xl mb-2">🔥</div>
              <div className="text-xl font-bold text-white">
                Well Done
              </div>
            </div>
          </div>
        )}

        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 rounded-2xl shadow-xl p-6">
          <h1 className="text-2xl font-bold text-center text-white mb-4">
            {isReviewMode
              ? 'Review Completed!'
              : isProgramMode
                ? isFinalProgramSegment
                  ? 'Program Complete 🎉'
                  : 'Segment Complete!'
                : isTrainingMode
                  ? 'Training session complete!'
                  : 'Quiz Completed!'}
          </h1>
          <div className="text-center mb-6">
            {isReviewMode ? (
              <p className="text-sm text-slate-300 mt-2">
                Review complete — great job reinforcing your knowledge
              </p>
            ) : isProgramMode ? (
              <>
                <p className="text-lg text-slate-200">Correct Answers: {score} / {questions.length}</p>
                <p className="text-lg text-slate-200">XP Total: {totalXp}</p>
                <p className="mt-3 text-xl font-semibold text-indigo-400">
                  {percentileEmoji} You&apos;re ahead of <span className="font-extrabold">{percentile}%</span> of users
                </p>
                {isFinalProgramSegment ? (
                  <p className="text-sm text-slate-300 mt-2">
                    You finished {activeProgram?.title}.
                  </p>
                ) : (
                  <p className="text-sm text-slate-300 mt-2">Next: {next?.label}</p>
                )}
                <p className="text-sm text-orange-300 mt-2">
                  🔥 Streak increased to {streak}
                </p>
              </>
            ) : isTrainingMode ? (
              <>
                <p className="text-lg text-slate-200">Correct Answers: {score} / {questions.length}</p>
                <p className="text-lg text-slate-200">XP Total: {totalXp}</p>
                <p className="mt-3 text-xl font-semibold text-indigo-400">
                  {percentileEmoji} You&apos;re ahead of <span className="font-extrabold">{percentile}%</span> of users
                </p>
                <p className="text-sm text-slate-300 mt-2">You&apos;re building mastery with every session!</p>
              </>
            ) : (
              <>
                <p className="text-lg text-slate-200">Correct Answers: {score} / {questions.length}</p>
                <p className="text-lg text-slate-200">XP Total: {totalXp}</p>
                <p className="mt-3 text-xl font-semibold text-indigo-400">
                  {percentileEmoji} You&apos;re ahead of <span className="font-extrabold">{percentile}%</span> of users
                </p>
                <p className="text-sm text-slate-300 mt-2">Great job! Keep studying to master more verses.</p>
              </>
            )}
          </div>
          <p className="text-sm text-slate-300 text-center mb-4">
            What would you like to do next?
          </p>
          <div className="space-y-3">
            {next && !isPreviewMode && (
              <button
                onClick={() => router.push("/journey?completed=true")}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-lg transition-all duration-150 hover:bg-blue-500 hover:scale-[1.02] shadow-md hover:shadow-lg hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] active:scale-95 active:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue Journey →
              </button>
            )}

            {isPreviewMode && (
              <button
                onClick={() => router.push("/journey?completed=true")}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-lg transition-all duration-150 hover:bg-blue-500 hover:scale-[1.02] shadow-md hover:shadow-lg hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] active:scale-95 active:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Unlock Full Journey
              </button>
            )}

            {incorrectQuestions.length > 0 && (
              <button
                onClick={handleTrainWeakAreas}
                className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold transition-all duration-150 hover:bg-purple-500 hover:scale-[1.02] shadow-md hover:shadow-lg active:scale-95 active:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Train Weak Areas
              </button>
            )}

            {incorrectQuestions.length > 0 && (
              <button
                onClick={startReview}
                className="w-full bg-yellow-600 text-white py-3 rounded-xl font-semibold transition-all duration-150 hover:bg-yellow-500 hover:scale-[1.02] shadow-md hover:shadow-lg active:scale-95 active:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Review Mistakes
              </button>
            )}

            <button
              onClick={() => router.push('/journey?completed=true')}
              className="w-full bg-slate-700 text-white py-3 rounded-xl font-semibold transition-all duration-150 hover:bg-slate-600 hover:scale-[1.02] shadow-md hover:shadow-lg active:scale-95 active:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back to Journey
            </button>
          </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F1A] to-[#05070D]">
      {showXpGain && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-40">
          <span className="animate-xp text-xl font-bold text-green-400 animate-pulse">
            +{displayXp} XP
          </span>
        </div>
      )}

      {showCelebration && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="animate-pop text-center">
            <div className="text-5xl mb-2">🔥</div>
            <div className="text-xl font-bold text-white">
              Well Done
            </div>
          </div>
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-100px] left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-blue-500 opacity-10 blur-3xl" />
        <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-slate-950 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-slate-950 to-transparent" />
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_20%_20%,white,transparent_20%)]" />
      </div>
      <div className="relative z-10 flex-1 pb-20 md:px-6 md:py-4">
        <div className="flex h-full w-full justify-center">
        <div className="mx-auto flex h-full w-full max-w-2xl flex-col">
          <div className="h-full flex flex-col">
            <div className="flex-[0_1_auto] px-4 pt-1 pb-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.push('/journey')}
                    className="
                      rounded-xl
                      px-3 py-3
                      text-gray-200
                      hover:text-white
                      text-2xl
                      font-bold
                      transition-all duration-150
                      hover:scale-[1.02]
                      active:scale-95
                      active:brightness-90
                    "
                    aria-label="Close quiz and return to journey"
                  >
                    ✕
                  </button>

                  <span className="text-sm md:text-base text-slate-300">
                    Question {currentQuestionIndex + 1} of {availableQuestionCount}
                  </span>
                </div>

                <div className="text-sm md:text-base text-slate-300">
                  XP: {totalXp} • Level {Math.floor(totalXp / 100) + 1}
                </div>
              </div>

              <div className="h-2 rounded-full bg-slate-800">
                <div
                  className="h-2 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div
              key={currentQuestion.id}
              className={`animate-[fadeIn_0.3s_ease] flex-1 bg-slate-900 rounded-2xl px-4 py-4 md:p-10 shadow-xl shadow-[0_0_40px_rgba(59,130,246,0.15)] scale-[1.02] border border-white/5 ${
                currentQuestion.difficulty === 'scholar'
                  ? 'border-2 border-yellow-500'
                  : ''
              } flex flex-col`}
            >
              <div className="flex-[0_1_auto]">
                <div className="flex justify-between text-sm text-gray-300 mb-2">
                  <div>
                    <p className="mt-1 text-sm text-orange-400">
                      🔥 Streak: {streak}
                    </p>

                  {getStreakMessage(streak) && (
                    <p className="text-xs text-orange-300 mt-1">
                      {getStreakMessage(streak)}
                    </p>
                  )}
                  </div>
                  <div className={`${comboFlash ? "scale-110 text-yellow-400" : ""} transition-all duration-200`}>
                    🔥 Combo: {combo}
                  </div>
                  <span>🎯 Level {Math.floor(totalXp / 100) + 1}</span>
                </div>

                {currentQuestion.difficulty === 'scholar' && (
                  <div className="mb-2 rounded-lg border border-yellow-500 bg-yellow-500 bg-opacity-20 px-3 py-2">
                    <p className="text-center text-sm font-bold tracking-wider text-yellow-400">SCHOLAR MODE</p>
                  </div>
                )}
              </div>

              <div className="flex-[0_1_auto] flex items-center justify-center px-4 text-center">
                <div className="flex flex-col items-center justify-center gap-1 px-3">
                  <div className="flex items-center justify-center px-2">
                    <h1 className="text-[16px] leading-snug font-bold text-center break-words px-2">
                      {currentQuestion.question}
                    </h1>
                  </div>

                  {currentQuestion.reference && (
                    <p className="text-sm text-gray-200">
                      {currentQuestion.reference}
                    </p>
                  )}

                  {!isAnswered && (
                    <p className="text-sm text-slate-300 text-center">
                      Select the correct answer
                    </p>
                  )}

                  {isReviewMode && currentIncorrectItem && (
                    <div className="rounded-lg border border-red-400/40 bg-red-600/15 p-3 text-sm text-red-100">
                      You previously chose: <strong>{currentIncorrectItem.userAnswer}</strong>
                    </div>
                  )}
                </div>
              </div>

              {(!isAnswered || showFeedback) && (
                <div className="flex-1 flex flex-col justify-evenly gap-2 px-4 pb-[100px]">
                  {currentQuestion.options.map((answer, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={selectedAnswer !== null}
                      className={`min-h-[56px] w-full rounded-xl border border-white/10 px-4 py-2 text-left text-base leading-tight font-medium text-white shadow-md transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 md:px-6 ${getButtonStyle(index)}`}
                      aria-label={`Answer option ${index + 1}: ${answer}`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-base leading-tight">
                          <span className="font-bold text-xl mr-4">
                            {["A", "B", "C", "D"][index]}.
                          </span>
                          {answer}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {isAnswered && !showFeedback && (
                <div className="flex flex-col items-center justify-center text-center mt-1 animate-[fadeIn_0.25s_ease]">
                  {isCorrectAnswer ? (
                    <>
                      <div className="w-28 mb-2">
                        <Lottie animationData={checkAnim} loop={false} />
                      </div>

                      <h1 className="text-2xl font-bold text-green-400">
                        Correct
                      </h1>
                    </>
                  ) : (
                    <>
                      <div className="text-3xl font-bold mb-2 text-red-400">
                        Not quite
                      </div>

                      <div className="animate-float">
                        <Flame
                          state="sad"
                          size={96}
                        />
                      </div>
                    </>
                  )}

                  <div className="mt-1 text-lg text-slate-300">
                    Correct Answer:
                  </div>

                  <div className="text-xl font-semibold text-white mt-1">
                    {currentQuestion.options[currentQuestion.correctIndex]}
                  </div>

                  {isCorrectAnswer && (
                    <div className="text-2xl text-green-400 font-bold mt-2 animate-pop">
                      +10 XP
                    </div>
                  )}

                  <div className="pb-4 w-full">
                    <button
                      id="continueBtn"
                      onClick={() => {
                        playSound("/sounds/click.mp3");
                        triggerHaptic("light");
                        handleNextQuestion();
                      }}
                      className="
                        mt-2
                        w-full
                        bg-blue-600
                        hover:bg-blue-500
                        text-white
                        font-bold
                        text-xl
                        px-6 py-4
                        rounded-xl
                        shadow-md
                        transition-all duration-150
                        hover:scale-[1.02]
                        hover:shadow-lg
                        hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]
                        active:scale-95
                        active:brightness-90
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                      "
                    >
                      Continue →
                    </button>
                  </div>
                </div>
              )}

              {currentIncorrectItem && isReviewMode && selectedAnswer === null && (
                <div className={`mt-2 rounded-lg p-4 ${
                  currentQuestion.difficulty === 'scholar'
                    ? 'border border-yellow-500 bg-slate-800 text-slate-200'
                    : 'bg-slate-800 text-slate-200'
                }`}>
                  <p>{currentQuestion.explanation}</p>
                </div>
              )}

              {isAnswered && (
                <div className={`mt-2 rounded-lg p-4 ${
                  currentQuestion.difficulty === 'scholar'
                    ? 'border border-yellow-500 bg-slate-800 text-slate-200'
                    : 'bg-slate-800 text-slate-200'
                }`}>
                  <p>{currentQuestion.explanation}</p>
                </div>
              )}

              {isReviewMode && selectedAnswer !== null && (
                <button
                  onClick={handleTryAgain}
                  className="mt-3 w-full bg-indigo-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-150 hover:bg-indigo-700 hover:scale-[1.02] shadow-md hover:shadow-lg active:scale-95 active:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Try Again
                </button>
              )}
            </div>

          </div>
        </div>
        </div>
      </div>

    </div>
  );
}
