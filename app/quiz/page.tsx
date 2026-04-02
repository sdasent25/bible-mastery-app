'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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
  const [segment, setSegment] = useState('genesis_1_3');
  const [paramsInitialized, setParamsInitialized] = useState(false);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
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

      // Block non-Pro+ users from Scholar Mode
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <p className="text-lg text-gray-700">Preparing quiz...</p>
      </div>
    );
  }

  if (loadingQuestions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <p className="text-lg text-gray-700">Loading questions...</p>
      </div>
    );
  }

  if (showLevelUp && newLevel !== null) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
        <div className="w-full max-w-md rounded-xl bg-white p-6 text-center shadow-2xl">
          <div className="text-5xl mb-4">🎉</div>
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

  // Check if user already completed today and not in review, scholar, or program mode
  if (false && completedToday && !isReviewMode && !isTrainingMode && !isWeaknessMode && !isProgramMode && mode !== 'scholar') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
            You&apos;ve completed today&apos;s quiz ✅
          </h1>
          <p className="text-center text-gray-600 mb-2">
            Great work! Keep building your mastery by reviewing what you missed.
          </p>
          <p className="text-center text-gray-500 text-sm mb-6">
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
              <p className="text-center text-sm text-gray-700">You&apos;re doing great! No past errors to review right now.</p>
            )}
            {isProPlusUser ? (
              <button
                onClick={handleContinueTraining}
                className="w-full bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Continue Training
              </button>
            ) : (
              <div className="rounded-lg border border-gray-300 bg-gray-50 p-3 text-center">
                <p className="text-gray-900 mb-3">🔒 Continue Training is available on Pro+</p>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">Unlock Full Bible Mastery</h1>
          <p className="text-center text-gray-600 mb-4">Go deeper with full 15-question quizzes across multiple difficulty levels</p>
          <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg text-gray-700">No questions available for this segment yet</p>
        </div>
      </div>
    );
  }

  if (activeQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg text-gray-700">No questions in review mode yet</p>
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
          setScore(score + 1);
          const updatedXp = await addXp(10);
          setTotalXp(updatedXp);

          const currentLevel = Math.floor(updatedXp / 100) + 1;
          if (currentLevel > previousLevel) {
            setNewLevel(currentLevel);
            setShowLevelUp(true);
          }
        } else {
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
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowRetryPrompt(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
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

    // In training mode we loop sessions without touching daily streak flow.
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

  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
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
              <p className="text-sm text-gray-600 mt-2">
                Review complete — great job reinforcing your knowledge
              </p>
            ) : isProgramMode ? (
              <>
                <p className="text-lg text-gray-700">Correct Answers: {score} / {questions.length}</p>
                <p className="text-lg text-gray-700">XP Total: {totalXp}</p>
                <p className="mt-3 text-xl font-semibold text-indigo-700">
                  {percentileEmoji} You&apos;re ahead of <span className="font-extrabold">{percentile}%</span> of users
                </p>
                {isFinalProgramSegment ? (
                  <p className="text-sm text-gray-600 mt-2">
                    You finished {activeProgram?.title} and earned {PROGRAM_COMPLETION_BONUS_XP} bonus XP.
                  </p>
                ) : (
                  <p className="text-sm text-gray-600 mt-2">Next: {nextProgramSegment?.label}</p>
                )}
              </>
            ) : isTrainingMode ? (
              <>
                <p className="text-lg text-gray-700">Correct Answers: {score} / {questions.length}</p>
                <p className="text-lg text-gray-700">XP Total: {totalXp}</p>
                <p className="mt-3 text-xl font-semibold text-indigo-700">
                  {percentileEmoji} You&apos;re ahead of <span className="font-extrabold">{percentile}%</span> of users
                </p>
                <p className="text-sm text-gray-600 mt-2">You&apos;re building mastery with every session!</p>
              </>
            ) : (
              <>
                <p className="text-lg text-gray-700">Correct Answers: {score} / {questions.length}</p>
                <p className="text-lg text-gray-700">XP Total: {totalXp}</p>
                <p className="mt-3 text-xl font-semibold text-indigo-700">
                  {percentileEmoji} You&apos;re ahead of <span className="font-extrabold">{percentile}%</span> of users
                </p>
                <p className="text-sm text-gray-600 mt-2">Great job! Keep studying to master more verses.</p>
              </>
            )}
          </div>
          <div className="space-y-3">
            {!isReviewMode && isTrainingMode && (
              <p className="text-center text-sm text-gray-700 font-medium">Keep going — every question makes you stronger</p>
            )}
            {!isReviewMode && isProgramMode && (
              <p className="text-center text-sm text-gray-700 font-medium">
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
                  <p className="text-center text-sm text-gray-600">Keep training and master scripture</p>
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
    <div className="min-h-screen bg-gray-50 px-4 py-4 md:py-6 lg:py-8">
      <div className="mx-auto max-w-xl space-y-4">
        <div className="space-y-4">
          <div className="text-center">
            {!isReviewMode && isTrainingMode && (
              <div className="mb-2 inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-800">
                Training Mode
              </div>
            )}
            {!isReviewMode && isProgramMode && (
              <div className="mb-2 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
                Program Mode
              </div>
            )}
            {!isReviewMode && mode === 'scholar' && (
              <div className="mb-2 inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800">
                Scholar Mode
              </div>
            )}
            <h1 className="mb-2 text-3xl font-bold text-gray-800">
              {isReviewMode
                ? 'Review Mode'
                : mode === 'scholar'
                  ? 'Master Training'
                  : isProgramMode
                    ? activeProgram?.title || 'Training Program'
                    : isTrainingMode
                      ? 'Training Session'
                      : 'Bible Quiz'}
            </h1>
            <p className="text-gray-600">
              {isReviewMode
                ? 'Reinforce what you missed'
                : isProgramMode
                  ? 'Move through your guided program one segment at a time.'
                  : 'Test your knowledge and earn XP as part of your daily mastery routine.'}
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="font-medium text-gray-700">
                {mode === 'scholar'
                  ? 'All Segments'
                  : isProgramMode
                    ? activeProgram?.segments[activeProgramSegmentIndex || 0]?.label || activeQuestions[0]?.reference || 'Unknown Segment'
                    : activeQuestions[0]?.reference || 'Unknown Segment'}
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                mode === 'scholar' || currentQuestion?.difficulty === 'scholar'
                  ? 'bg-yellow-500 text-gray-900'
                  : isProgramMode
                    ? 'bg-slate-100 text-slate-800'
                    : isWeaknessMode ? 'bg-indigo-100 text-indigo-800' : isProPlusUser ? 'bg-purple-100 text-purple-800' : isProUser ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              }`}>
                {mode === 'scholar' || currentQuestion?.difficulty === 'scholar'
                  ? '🏆 Scholar'
                  : isProgramMode
                    ? 'Program'
                    : isWeaknessMode
                      ? 'Weak Areas'
                      : isProPlusUser
                        ? 'Pro+ Mixed'
                        : isProUser
                          ? 'Mixed'
                          : 'Easy'}
              </span>
            </div>
          </div>

          {!isReviewMode && !quizCompleted && !isProgramMode && (
            <div className="space-y-2 text-center">
              <button
                onClick={handleTrainWeakAreas}
                className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Review Past Answers
              </button>
              <div>
                <Link href="/quiz?mode=scholar">
                  <button className="rounded-lg bg-white px-4 py-2 font-semibold text-gray-800 shadow-sm transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    Scholar Mode
                  </button>
                </Link>
              </div>
              {noWeakAreasMessage && (
                <p className="text-sm text-gray-700">You&apos;re doing great! No past errors to review right now.</p>
              )}
            </div>
          )}

          <div className="rounded-2xl bg-white p-5 shadow-md">
            <div className="mb-3 flex items-center justify-between text-sm font-semibold text-gray-700">
              <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
              <span>XP: {totalXp}</span>
            </div>
            <div className="h-3 w-full rounded-full bg-gray-200">
              <div
                className="h-3 rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className={`rounded-2xl p-8 shadow-lg ${
          currentQuestion.difficulty === 'scholar'
            ? 'border-2 border-yellow-500 bg-gray-900'
            : 'bg-white'
        }`}>
          {currentQuestion.difficulty === 'scholar' && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-yellow-500 bg-opacity-20 border border-yellow-500">
              <p className="text-yellow-400 font-bold text-center text-sm tracking-wider">🏆 SCHOLAR MODE</p>
            </div>
          )}
          <h3 className={`mb-6 text-2xl font-semibold leading-relaxed ${
            currentQuestion.difficulty === 'scholar'
              ? 'text-white'
              : 'text-gray-900'
          }`}>{currentQuestion.question}</h3>

          {isReviewMode && currentIncorrectItem && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              You previously chose: <strong>{currentIncorrectItem.userAnswer}</strong>
            </div>
          )}

          <div className="space-y-4">
            {currentQuestion.options.map((answer, index) => {
              let buttonClass = 'w-full min-h-14 rounded-xl border-2 px-5 py-4 text-left transition-all duration-200 focus:outline-none focus:ring-2 active:scale-95 ';
              let label = '';

              if (currentQuestion.difficulty === 'scholar') {
                if (selectedAnswer === null) {
                  buttonClass += 'border-gray-300 bg-white text-gray-900 hover:scale-[1.02] hover:bg-gray-100 focus:ring-blue-500';
                } else if (index === currentQuestion.correctIndex) {
                  buttonClass += 'border-green-600 bg-green-100 text-green-900';
                  label = 'Correct';
                } else if (index === selectedAnswer && index !== currentQuestion.correctIndex) {
                  buttonClass += 'border-red-600 bg-red-100 text-red-900';
                  label = 'Incorrect';
                } else {
                  buttonClass += 'border-gray-300 bg-white text-gray-900 opacity-80';
                }
                if (selectedAnswer !== null) {
                  buttonClass += ' focus:ring-blue-500';
                }
              } else {
                if (selectedAnswer === null) {
                  buttonClass += 'border-gray-300 bg-white text-gray-900 hover:scale-[1.02] hover:bg-gray-100 focus:ring-blue-500';
                } else if (index === currentQuestion.correctIndex) {
                  buttonClass += 'border-green-600 bg-green-100 text-green-900';
                  label = 'Correct';
                } else if (index === selectedAnswer && index !== currentQuestion.correctIndex) {
                  buttonClass += 'border-red-600 bg-red-100 text-red-900';
                  label = 'Incorrect';
                } else {
                  buttonClass += 'border-gray-300 bg-white text-gray-900 opacity-80';
                }
                if (selectedAnswer !== null) {
                  buttonClass += ' focus:ring-blue-500';
                }
              }

              if (selectedAnswer !== null && index === selectedAnswer && index !== currentQuestion.correctIndex) {
                label = 'Your Choice';
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={selectedAnswer !== null}
                  className={buttonClass}
                  aria-label={`Answer option ${index + 1}: ${answer}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-base font-medium">{answer}</span>
                    {label && <span className="text-sm font-semibold">{label}</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {currentIncorrectItem && isReviewMode && selectedAnswer === null && (
            <div className={`mt-5 rounded-lg p-4 ${
              currentQuestion.difficulty === 'scholar'
                ? 'bg-gray-800 border border-yellow-500 text-yellow-100'
                : 'bg-gray-100 text-gray-700'
            }`}>
              <p>{currentQuestion.explanation}</p>
            </div>
          )}

          {selectedAnswer !== null && (
            <div className={`mt-5 rounded-lg p-4 ${
              currentQuestion.difficulty === 'scholar'
                ? 'bg-gray-800 border border-yellow-500 text-yellow-100'
                : 'bg-gray-100 text-gray-700'
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
            onClick={handleNextQuestion}
            className="w-full rounded-xl bg-blue-700 px-4 py-4 text-lg font-bold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : isReviewMode ? 'Finish Review' : 'Finish Quiz'}
          </button>
        )}
      </div>
    </div>
  );
}
