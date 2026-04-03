'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from "@supabase/supabase-js";
import { completeToday, hasCompletedToday } from '@/lib/streak';
import { addXp, getXp } from '@/lib/xp';
import { getProgramById, toQuizSegmentId } from '@/lib/programs';
import {
  completeProgramSegment,
  getProgramProgress,
  getResumeSegmentIndex,
  markProgramBonusAwarded,
} from '@/lib/programProgress';
import { getSubscriptionStatus } from '@/lib/user';
import { addIncorrectQuestion, getIncorrectQuestions } from '@/lib/review';
import { recordAnswerPerformance } from '@/lib/performance';
import Flame from '@/components/Flame';
import XpPop from '@/components/XpPop';

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

const PROGRAM_COMPLETION_BONUS_XP = 50;

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function QuizPage() {
  const router = useRouter();
  const [segment, setSegment] = useState('genesis_1_3');
  const [paramsInitialized, setParamsInitialized] = useState(false);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [combo, setCombo] = useState(0);
  const [showResult, setShowResult] = useState<"correct" | "wrong" | null>(null);
  const [, setFlameState] = useState<"idle" | "correct" | "wrong">("idle");
  const [showXp, setShowXp] = useState(false);
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
  const [questions, setQuestions] = useState<Question[]>([]);

  const activeProgram = getProgramById(activeProgramId);
  const isProgramMode = Boolean(activeProgram && activeProgramSegmentIndex !== null);
  const isFinalProgramSegment = Boolean(
    activeProgram &&
    activeProgramSegmentIndex !== null &&
    activeProgramSegmentIndex === activeProgram.segments.length - 1
  );
  const nextProgramSegment = activeProgram && activeProgramSegmentIndex !== null
    ? activeProgram.segments[activeProgramSegmentIndex + 1] || null
    : null;

  useEffect(() => {
    const initializeQuiz = async () => {
      const search = typeof window !== 'undefined' ? window.location.search : '';
      const params = new URLSearchParams(search);
      const segmentParam = params.get('segment') || 'genesis_1_3';
      const programParam = params.get('program');
      const modeParam = params.get('mode') as 'scholar' | null;

      if (modeParam === 'scholar') {
        setMode('scholar');
      }

      const matchedProgram = getProgramById(programParam);
      if (matchedProgram) {
        const progress = await getProgramProgress(matchedProgram.id);

        if (progress.completed) {
          window.location.assign('/programs');
          return;
        }

        const safeIndex = getResumeSegmentIndex(progress, matchedProgram.segments.length);

        setActiveProgramId(matchedProgram.id);
        setActiveProgramSegmentIndex(safeIndex);
        setSegment(toQuizSegmentId(matchedProgram.segments[safeIndex].segment));
      } else {
        setSegment(segmentParam);
      }

      const completed = await hasCompletedToday();
      setCompletedToday(completed);

      const storedXp = await getXp();
      setTotalXp(storedXp);

      setParamsInitialized(true);
    };

    initializeQuiz();
  }, []);

  useEffect(() => {
    async function checkPro() {
      const { isPro, isProPlus } = await getSubscriptionStatus();
      setIsProUser(isPro);
      setIsProPlusUser(isProPlus);
      setLoadingPro(false);

      if (mode === 'scholar' && !isProPlus) {
        window.location.assign('/upgrade');
        return;
      }

      if (activeProgramId && !isPro) {
        window.location.assign('/upgrade');
      }
    }
    checkPro();
  }, [activeProgramId, mode]);

  useEffect(() => {
    if (!paramsInitialized || loadingPro) {
      return;
    }

    const loadQuestions = async () => {
      setLoadingQuestions(true);

      try {
        const resolvedSegment =
          isProgramMode && activeProgram && activeProgramSegmentIndex !== null
            ? toQuizSegmentId(activeProgram.segments[activeProgramSegmentIndex].segment)
            : segment;

        const response = await fetch(
          `/api/quiz/questions?segment=${encodeURIComponent(resolvedSegment)}&mode=${encodeURIComponent(mode)}&isPro=${String(isProUser || isProPlusUser)}&seed=${quizSeed}`,
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

        setQuestions((data as Question[]).map((q) => ({
          ...q,
          id: q.id
        })));
      } catch (error) {
        console.error('Error loading quiz questions:', error);
        setQuestions([]);
      } finally {
        setLoadingQuestions(false);
      }
    };

    loadQuestions();
  }, [
    activeProgram,
    activeProgramSegmentIndex,
    isProgramMode,
    isProPlusUser,
    isProUser,
    loadingPro,
    mode,
    paramsInitialized,
    quizSeed,
    segment
  ]);

  const activeQuestions = isReviewMode ? reviewQuestions : isWeaknessMode ? weakQuestions : questions;
  const totalQuestions = activeQuestions.length;
  const currentQuestion = activeQuestions[currentQuestionIndex];

  const percentageScore = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
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

    window.location.assign('/upgrade');
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
      if (
        !quizCompleted ||
        isReviewMode ||
        !activeProgram ||
        activeProgramSegmentIndex === null ||
        programProgressSaved
      ) {
        return;
      }

      setProgramProgressSaved(true);
      const nextProgress = await completeProgramSegment(activeProgram.id, activeProgram.segments.length);

      if (activeProgramSegmentIndex === activeProgram.segments.length - 1) {
        if (!nextProgress.bonusAwarded) {
          const updatedXp = await addXp(PROGRAM_COMPLETION_BONUS_XP);
          setTotalXp(updatedXp);
          await markProgramBonusAwarded(activeProgram.id);
        }
      }
    };

    syncProgramProgress();
  }, [activeProgram, activeProgramSegmentIndex, isReviewMode, programProgressSaved, quizCompleted]);

  if (loadingPro) {
    return <div className="p-6 text-black">Loading...</div>;
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
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <p className="text-center text-slate-400 text-sm mb-6">
            New questions unlock tomorrow 🔥
          </p>
          <div className="space-y-3">
            <button
              onClick={handleTrainWeakAreas}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Review Past Answers
            </button>
            {noWeakAreasMessage && (
              <p className="text-center text-sm text-slate-300">You&apos;re doing great! No past errors to review right now.</p>
            )}
            {isProPlusUser ? (
              <button
                onClick={handleContinueTraining}
                className="w-full bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Continue Training
              </button>
            ) : (
              <div className="rounded-lg border border-slate-700 bg-slate-800 p-3 text-center">
                <p className="text-white mb-3">🔒 Continue Training is available on Pro+</p>
                <Link href="/upgrade" className="block">
                  <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    Upgrade to Pro+
                  </button>
                </Link>
              </div>
            )}
            {incorrectQuestions.length > 0 && (
              <button
                onClick={() => startReview()}
                className="w-full bg-yellow-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                Review Mistakes
              </button>
            )}
            <Link href="/dashboard" className="block">
              <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                Back to Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isProUser && quizCompleted && !isReviewMode) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 rounded-2xl shadow-xl p-6">
          <h1 className="text-2xl font-bold text-center text-white mb-4">Unlock Full Bible Mastery</h1>
          <p className="text-center text-slate-300 mb-4">Go deeper with full 15-question quizzes across multiple difficulty levels</p>
          <ul className="list-disc list-inside text-slate-300 mb-6 space-y-1">
            <li>15-question full sessions</li>
            <li>Easy, Medium, Hard questions</li>
            <li>Deeper understanding of each passage</li>
          </ul>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              Upgrade to Pro
            </button>
            <Link href="/dashboard" className="block">
              <button className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500">
                Back to Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg text-slate-300">No questions available for this segment yet</p>
        </div>
      </div>
    );
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

  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const currentIncorrectItem = incorrectQuestions.find(x => x.question.id === currentQuestion.id);

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    const correctAnswer = currentQuestion.correctIndex;
    console.log("ANSWER CLICKED", {
      questionId: currentQuestion.id,
      selectedAnswer: answerIndex,
      correctAnswer
    });
    setSelectedAnswer(answerIndex);
    document.getElementById("continueBtn")?.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    if (!isReviewMode) {
      const handleProgress = async () => {
        const isCorrect = answerIndex === currentQuestion.correctIndex;
        recordAnswerPerformance(currentQuestion.segmentId, isCorrect);

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
            correct: isCorrect
          })
        });
        console.log("API RESPONSE", await response.clone().json());

        const previousXp = await getXp();
        const previousLevel = Math.floor(previousXp / 100) + 1;

        if (isCorrect) {
          setShowResult("correct");
          setShowXp(true);
          setFlameState("correct");
          setShowCelebration(true);
          setTimeout(() => {
            setShowCelebration(false);
          }, 1000);
          setStreak(prev => prev + 1);
          setCombo(prev => prev + 1);
          setScore(score + 1);
          const updatedXp = await addXp(10);
          setTotalXp(updatedXp);

          const currentLevel = Math.floor(updatedXp / 100) + 1;
          if (currentLevel > previousLevel) {
            setNewLevel(currentLevel);
            setShowLevelUp(true);
          }
        } else {
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
    }
  };

  const handleNextQuestion = () => {
    setShowResult(null);
    setShowXp(false);
    setShowCelebration(false);
    setFlameState("idle");

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowRetryPrompt(false);
    } else {
      setQuizCompleted(true);
      if (!isReviewMode && !isTrainingMode) {
        updateMastery();
      }
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setStreak(0);
    setCombo(0);
    setShowResult(null);
    setFlameState("idle");
    setShowXp(false);
    setShowCelebration(false);
    setProgramProgressSaved(false);

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
    setQuizCompleted(false);
    setShowRetryPrompt(false);
  };

  const handleTryAgain = () => {
    setSelectedAnswer(null);
    setShowRetryPrompt(false);
  };

  const navItems = [
    { label: 'Home', href: '/dashboard', active: false },
    { label: 'Journey', href: '/journey', active: false },
    { label: 'Training', href: '/quiz', active: true },
    { label: 'Review', href: '/review', active: false },
  ];

  const handleContinueProgram = async () => {
    if (!activeProgram || activeProgramSegmentIndex === null) {
      return;
    }

    const progress = await getProgramProgress(activeProgram.id);
    if (progress.completed) {
      window.location.assign('/programs');
      return;
    }

    const resumeIndex = getResumeSegmentIndex(progress, activeProgram.segments.length);
    const nextSegment = activeProgram.segments[resumeIndex];

    window.location.assign(`/quiz?program=${activeProgram.id}&segment=${toQuizSegmentId(nextSegment.segment)}`);
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
                    You finished {activeProgram?.title} and earned {PROGRAM_COMPLETION_BONUS_XP} bonus XP.
                  </p>
                ) : (
                  <p className="text-sm text-slate-300 mt-2">Next: {nextProgramSegment?.label}</p>
                )}
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
          <div className="space-y-3">
            {!isReviewMode && isTrainingMode && (
              <p className="text-center text-sm text-slate-300 font-medium">Keep going — every question makes you stronger</p>
            )}
            {!isReviewMode && isProgramMode && (
              <p className="text-center text-sm text-slate-300 font-medium">
                {isFinalProgramSegment
                  ? 'You completed the full path. Bonus XP has been added to your journey.'
                  : 'Stay with the path and keep building momentum segment by segment.'}
              </p>
            )}
            {!isReviewMode && isProgramMode && !isFinalProgramSegment && (
              <button
                onClick={handleContinueProgram}
                className="w-full bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Continue Program
              </button>
            )}
            <button
              onClick={resetQuiz}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isReviewMode ? 'Back to Quiz' : isProgramMode ? 'Retry Segment' : 'Retry Quiz'}
            </button>
            {!isReviewMode && !isProgramMode && (
              <>
                {!isTrainingMode && (
                  <p className="text-center text-sm text-slate-300">Keep training and master scripture</p>
                )}
                <button
                  onClick={handleContinueTraining}
                  className={`w-full py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 ${
                    isProPlusUser
                      ? 'bg-black text-white hover:bg-gray-900 focus:ring-gray-500'
                      : 'bg-gray-200 text-gray-700 border border-gray-300 hover:bg-gray-300 focus:ring-gray-400'
                  }`}
                >
                  {isProPlusUser ? 'Continue Training' : '🔒 Continue Training'}
                </button>
              </>
            )}
            {!isReviewMode && isProgramMode && isFinalProgramSegment && (
              <Link href="/programs" className="block">
                <button className="w-full bg-slate-900 text-white py-3 px-4 rounded-lg font-semibold hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500">
                  View Programs
                </button>
              </Link>
            )}
            {!isReviewMode && incorrectQuestions.length > 0 && (
              <button
                onClick={startReview}
                className="w-full bg-yellow-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                Review Your Mistakes
              </button>
            )}
            <Link href="/dashboard" className="block">
              <button className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500">
                Back to Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-100px] left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-blue-500 opacity-10 blur-3xl" />
        <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-slate-950 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-slate-950 to-transparent" />
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_20%_20%,white,transparent_20%)]" />
      </div>
      <aside className="hidden w-72 border-r border-white/5 bg-slate-900/60 px-5 py-6 backdrop-blur lg:block">
        <div className="sticky top-6">
          <h2 className="text-2xl font-bold">Bible Mastery</h2>
          <p className="mt-2 text-sm text-slate-400">Quiz navigation</p>

          <div className="mt-8 space-y-3">
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => router.push(item.href)}
                className={[
                  "w-full rounded-xl px-4 py-4 text-left text-base font-semibold transition-all duration-200",
                  item.active
                    ? "border border-blue-500/30 bg-blue-600/20 text-white"
                    : "border border-white/5 bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white"
                ].join(" ")}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <div className="relative z-10 flex-1 px-10 py-4 md:py-8">
        <div className="max-w-4xl">
          <div className="space-y-3 md:space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/journey')}
                  className="
                    text-slate-400
                    hover:text-white
                    text-2xl
                    font-bold
                    transition-all
                    active:scale-90
                  "
                  aria-label="Close quiz and return to journey"
                >
                  ✕
                </button>

                <span className="text-sm md:text-base text-slate-300">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>
              </div>

              <div className="text-sm md:text-base text-slate-300">
                XP: {totalXp} • Level {Math.floor(totalXp / 100) + 1}
              </div>
            </div>

            <div className="h-3 rounded-full bg-slate-800">
              <div
                className="transition-all duration-500 ease-out h-4 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div
              key={currentQuestion.id}
              className={`animate-[fadeIn_0.3s_ease] bg-slate-900 rounded-2xl p-5 md:p-10 shadow-xl border border-white/5 ${
                currentQuestion.difficulty === 'scholar'
                  ? 'border-2 border-yellow-500'
                  : ''
              }`}
            >
              {currentQuestion.difficulty === 'scholar' && (
                <div className="mb-4 rounded-lg border border-yellow-500 bg-yellow-500 bg-opacity-20 px-3 py-2">
                  <p className="text-center text-sm font-bold tracking-wider text-yellow-400">SCHOLAR MODE</p>
                </div>
              )}

              <div className="flex justify-center mb-3">
                {streak > 0 && (
                  <div className="px-4 py-2 rounded-full bg-orange-500/10 border border-orange-400/30 text-orange-400 font-bold text-base md:text-lg animate-pop">
                    🔥 Streak {streak}
                  </div>
                )}
              </div>

              {combo >= 2 && (
                <div className="text-orange-400 text-center font-bold text-xl mb-3 animate-pop">
                  ⚡ {combo} combo!
                </div>
              )}

              <div className="flex justify-center mb-2 md:mb-4">
                <Flame
                  state={
                    showResult === "correct"
                      ? "happy"
                      : showResult === "wrong"
                        ? "sad"
                        : combo >= 3
                          ? "super"
                          : "idle"
                  }
                  size={64}
                />
              </div>

              {showCelebration && (
                <div className="mb-2 text-center text-3xl text-yellow-400 animate-bounce">
                  ✨ +10 XP
                </div>
              )}

              <h3 className="text-5xl font-bold leading-tight text-center mb-4 md:mb-8">
                {currentQuestion.question}
              </h3>

              {currentQuestion.reference && (
                <p className="text-base text-slate-300 text-center mb-2">
                  {currentQuestion.reference}
                </p>
              )}

              {showResult === "correct" && (
                <div className="text-green-400 text-xl font-bold text-center mt-4 animate-pop">
                  +10 XP 🔥
                </div>
              )}

              {isReviewMode && currentIncorrectItem && (
                <div className="mb-4 rounded-lg border border-red-400/40 bg-red-600/15 p-3 text-sm text-red-100">
                  You previously chose: <strong>{currentIncorrectItem.userAnswer}</strong>
                </div>
              )}

              <p className="text-sm text-slate-300 text-center mb-2">
                Choose an answer
              </p>

              <div className="flex flex-col gap-3 md:gap-6 max-h-none">
                {currentQuestion.options.map((answer, index) => {
                  let buttonClass = `
                    relative
                    w-full text-left
                    py-4 md:py-7
                    px-4 md:px-6
                    rounded-xl md:rounded-2xl
                    border border-white/10
                    bg-slate-900
                    text-base md:text-2xl font-medium
                    min-h-[60px] md:min-h-[100px]
                    transition-all duration-200
                    hover:bg-slate-800
                    hover:scale-[1.02]
                    hover:shadow-lg
                    active:scale-95
                    button-primary
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                  `;
                  let label = '';

                  if (selectedAnswer === null) {
                    buttonClass += ' text-white';
                  } else if (index !== currentQuestion.correctIndex && index !== selectedAnswer) {
                    buttonClass += ' opacity-80 text-slate-300';
                  } else {
                    buttonClass += ' text-white';
                  }

                  if (selectedAnswer !== null) {
                    if (index === currentQuestion.correctIndex) {
                      label = 'Correct';
                    } else if (index === selectedAnswer) {
                      label = 'Your Choice';
                    }
                  }

                  if (selectedAnswer === index) {
                    buttonClass += ' scale-95 ring-2 ring-blue-400';
                  }

                  if (showResult === "correct" && index === currentQuestion.correctIndex) {
                    buttonClass += ' bg-green-500/20 border-green-400 animate-correct shadow-[0_0_20px_rgba(34,197,94,0.5)]';
                  }

                  if (showResult === "wrong" && selectedAnswer === index) {
                    buttonClass += ' bg-red-500/20 border-red-400 animate-shake';
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={selectedAnswer !== null}
                      className={buttonClass}
                      aria-label={`Answer option ${index + 1}: ${answer}`}
                    >
                      {showXp && selectedAnswer === index && (
                        <div className="absolute right-6 top-1/2 -translate-y-1/2">
                          <XpPop value={10} />
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-4">
                        <span>
                          <span className="font-bold text-xl mr-4">
                            {["A", "B", "C", "D"][index]}.
                          </span>
                          {answer}
                        </span>
                        {label && <span className="text-sm font-semibold">{label}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedAnswer !== null && (
                <div className="text-center mt-4 text-lg font-bold">
                  {selectedAnswer === currentQuestion.correctIndex
                    ? "Correct! 🔥"
                    : "Not quite — try again 💪"}
                </div>
              )}

              {currentIncorrectItem && isReviewMode && selectedAnswer === null && (
                <div className={`mt-6 rounded-lg p-4 ${
                  currentQuestion.difficulty === 'scholar'
                    ? 'border border-yellow-500 bg-slate-800 text-slate-200'
                    : 'bg-slate-800 text-slate-200'
                }`}>
                  <p>{currentQuestion.explanation}</p>
                </div>
              )}

              {selectedAnswer !== null && (
                <div className={`mt-6 rounded-lg p-4 ${
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
                  className="mt-3 w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Try Again
                </button>
              )}
            </div>

            {selectedAnswer !== null && (
              <button
                id="continueBtn"
                onClick={handleNextQuestion}
                className="w-full mt-4 py-4 text-lg md:text-xl rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : isReviewMode ? 'Finish Review' : 'Finish Quiz'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="w-80 p-6 hidden xl:flex flex-col gap-4 border-l border-white/5 relative z-10">
        <div className="bg-slate-900 p-4 rounded-xl border border-white/5 text-lg font-semibold">
          🔥 Streak: {streak}
          <div className="mt-2 h-2 bg-slate-800 rounded-full">
            <div className="h-2 bg-blue-500 rounded-full w-[60%]" />
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-white/5 text-lg font-semibold">
          ⚡ Combo: {combo}
          <div className="mt-2 h-2 bg-slate-800 rounded-full">
            <div className="h-2 bg-blue-500 rounded-full w-[60%]" />
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-white/5 text-lg font-semibold">
          🎯 Keep going to level up
          <div className="mt-2 h-2 bg-slate-800 rounded-full">
            <div className="h-2 bg-blue-500 rounded-full w-[60%]" />
          </div>
        </div>
      </div>
    </div>
  );
}
