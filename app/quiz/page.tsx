'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getQuestions, type Question } from '@/lib/questions';
import { completeToday, hasCompletedToday } from '@/lib/streak';
import { addXp, getXp } from '@/lib/xp';
import { getProgramById, toQuizSegmentId } from '@/lib/programs';
import {
  clearActiveProgram,
  getProgramProgress,
  markProgramBonusAwarded,
  markProgramSegmentComplete,
  startProgram
} from '@/lib/programProgress';
import { getSubscriptionStatus } from '@/lib/user';
import { addIncorrectQuestion, getIncorrectQuestions } from '@/lib/review';

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
  const [isTrainingMode, setIsTrainingMode] = useState(false);
  const [quizSeed, setQuizSeed] = useState(0);
  const [isWeaknessMode, setIsWeaknessMode] = useState(false);
  const [weakQuestions, setWeakQuestions] = useState<Question[]>([]);
  const [noWeakAreasMessage, setNoWeakAreasMessage] = useState(false);
  const [mode, setMode] = useState<'normal' | 'training' | 'scholar'>('normal');
  const [activeProgramId, setActiveProgramId] = useState<string | null>(null);
  const [activeProgramSegmentIndex, setActiveProgramSegmentIndex] = useState<number | null>(null);
  const [programProgressSaved, setProgramProgressSaved] = useState(false);

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
        const matchedIndex = matchedProgram.segments.findIndex(
          (programSegment) => toQuizSegmentId(programSegment.segment) === segmentParam
        );
        const safeIndex = matchedIndex >= 0 ? matchedIndex : 0;

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

  const questions = useMemo(() => {
    if (!paramsInitialized) return [] as Question[];

    let fetchedQuestions: Question[];

    if (mode === 'scholar') {
      // Scholar Mode: Load questions from all segments at hard difficulty
      const allSegments = ['genesis_1_3', 'genesis_4_6', 'genesis_7_9', 'genesis_10_11'];
      let combinedQuestions: Question[] = [];
      
      for (const seg of allSegments) {
        combinedQuestions = combinedQuestions.concat(getQuestions(seg, 'hard'));
      }

      fetchedQuestions = combinedQuestions.slice(0, 15);
    } else if (isProgramMode) {
      fetchedQuestions = getQuestions(segment, 'mixed', isProPlusUser).slice(0, 15);
    } else if (isProPlusUser) {
      fetchedQuestions = getQuestions(segment, 'mixed', true).slice(0, 15);
    } else if (isProUser) {
      fetchedQuestions = getQuestions(segment, 'mixed', false).slice(0, 15);
    } else {
      fetchedQuestions = getQuestions(segment, 'easy').slice(0, 2);
    }

    const startIndex = fetchedQuestions.length > 0 ? quizSeed % fetchedQuestions.length : 0;
    const seededQuestions = fetchedQuestions.length > 0
      ? [...fetchedQuestions.slice(startIndex), ...fetchedQuestions.slice(0, startIndex)]
      : fetchedQuestions;

    // Shuffle answers for each question
    return seededQuestions.map(q => {
      const shuffledOptions = shuffleArray(q.options);
      const newCorrectIndex = shuffledOptions.indexOf(q.options[q.correctIndex]);
      return {
        ...q,
        options: shuffledOptions,
        correctIndex: newCorrectIndex
      };
    });
  }, [isProgramMode, isProPlusUser, isProUser, mode, paramsInitialized, quizSeed, segment]);

  const activeQuestions = isReviewMode ? reviewQuestions : isWeaknessMode ? weakQuestions : questions;
  const totalQuestions = activeQuestions.length;
  const currentQuestion = activeQuestions[currentQuestionIndex];

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
    const collected = new Map<string, Question>();

    for (let i = 0; i < 8; i++) {
      const batch = getQuestions(segment, 'mixed');
      for (const question of batch) {
        if (idSet.has(question.id)) {
          collected.set(question.id, question);
        }
      }

      if (collected.size >= idSet.size) break;
    }

    return shuffleArray(Array.from(collected.values()));
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
      markProgramSegmentComplete(activeProgram.id, activeProgramSegmentIndex);

      if (activeProgramSegmentIndex === activeProgram.segments.length - 1) {
        const progress = getProgramProgress(activeProgram.id);

        if (!progress.bonusAwarded) {
          const updatedXp = await addXp(PROGRAM_COMPLETION_BONUS_XP);
          setTotalXp(updatedXp);
          markProgramBonusAwarded(activeProgram.id);
        }

        clearActiveProgram(activeProgram.id);
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
  if (completedToday && !isReviewMode && !isTrainingMode && !isWeaknessMode && !isProgramMode && mode !== 'scholar') {
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
    setSelectedAnswer(answerIndex);

    if (!isReviewMode) {
      const handleProgress = async () => {
        const previousXp = await getXp();
        const previousLevel = Math.floor(previousXp / 100) + 1;

        if (answerIndex === currentQuestion.correctIndex) {
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

  const handleContinueProgram = () => {
    if (!activeProgram || activeProgramSegmentIndex === null) {
      return;
    }

    const nextSegment = activeProgram.segments[activeProgramSegmentIndex + 1];
    if (!nextSegment) {
      window.location.assign('/programs');
      return;
    }

    startProgram(activeProgram.id);
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
                <p className="text-sm text-gray-600 mt-2">You&apos;re building mastery with every session!</p>
              </>
            ) : (
              <>
                <p className="text-lg text-gray-700">Correct Answers: {score} / {questions.length}</p>
                <p className="text-lg text-gray-700">XP Total: {totalXp}</p>
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
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
          {!isReviewMode && !quizCompleted && !isProgramMode && (
            <div className="mt-4 space-y-2">
              <button
                onClick={handleTrainWeakAreas}
                className="bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Review Past Answers
              </button>
              {noWeakAreasMessage && (
                <p className="text-sm text-gray-700">You&apos;re doing great! No past errors to review right now.</p>
              )}
            </div>
          )}
        </div>

        {/* Summary Row */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex justify-between items-center">
          <span className="text-gray-700">Score: {score} / {questions.length}</span>
          <span className="text-gray-700">XP: {totalXp}</span>
        </div>

        {/* Segment Card */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {mode === 'scholar'
                  ? 'All Segments'
                  : isProgramMode
                    ? activeProgram?.segments[activeProgramSegmentIndex || 0]?.label || activeQuestions[0]?.reference || 'Unknown Segment'
                    : activeQuestions[0]?.reference || 'Unknown Segment'}
              </h2>
              <p className="text-gray-600">
                {mode === 'scholar'
                  ? 'Scholar training across scripture'
                  : isProgramMode
                    ? `Program path: ${activeProgram?.title || 'Training Program'}`
                    : 'Segment being studied'}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
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

        {/* Progress Indicator */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700">Question {currentQuestionIndex + 1} of {totalQuestions}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-blue-600 h-3 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Question Card */}
        <div className={`rounded-lg shadow-md p-6 mb-6 ${
          currentQuestion.difficulty === 'scholar'
            ? 'bg-gray-900 border-2 border-yellow-500'
            : 'bg-white'
        }`}>
          {currentQuestion.difficulty === 'scholar' && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-yellow-500 bg-opacity-20 border border-yellow-500">
              <p className="text-yellow-400 font-bold text-center text-sm tracking-wider">🏆 SCHOLAR MODE</p>
            </div>
          )}
          <h3 className={`text-xl leading-relaxed font-semibold mb-6 ${
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
              let buttonClass = 'w-full text-left py-4 px-4 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 min-h-14 ';
              let label = '';

              if (currentQuestion.difficulty === 'scholar') {
                // Scholar mode styling
                if (selectedAnswer === null) {
                  buttonClass += 'bg-gray-800 text-white border-yellow-500 hover:bg-gray-700';
                } else if (index === currentQuestion.correctIndex) {
                  buttonClass += 'bg-green-900 text-green-100 border-green-500';
                  label = 'Correct';
                } else if (index === selectedAnswer && index !== currentQuestion.correctIndex) {
                  buttonClass += 'bg-red-900 text-red-100 border-red-500';
                  label = 'Incorrect';
                } else {
                  buttonClass += 'bg-gray-800 text-white border-gray-600';
                }
                if (selectedAnswer !== null) {
                  buttonClass += ' focus:ring-yellow-500';
                }
              } else {
                // Regular mode styling
                if (selectedAnswer === null) {
                  buttonClass += 'bg-white text-gray-900 border-gray-300 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500';
                } else if (index === currentQuestion.correctIndex) {
                  buttonClass += 'bg-green-100 text-green-900 border-green-700';
                  label = 'Correct';
                } else if (index === selectedAnswer && index !== currentQuestion.correctIndex) {
                  buttonClass += 'bg-red-100 text-red-900 border-red-700';
                  label = 'Incorrect';
                } else {
                  buttonClass += 'bg-white text-gray-900 border-gray-300';
                }
                if (selectedAnswer !== null) {
                  buttonClass += ' focus:ring-2 focus:ring-blue-500';
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
            <div className={`mt-4 p-3 rounded-lg ${
              currentQuestion.difficulty === 'scholar'
                ? 'bg-gray-800 border border-yellow-500 text-yellow-100'
                : 'bg-gray-50 text-gray-700'
            }`}>
              <p>{currentQuestion.explanation}</p>
            </div>
          )}

          {selectedAnswer !== null && (
            <div className={`mt-4 p-3 rounded-lg ${
              currentQuestion.difficulty === 'scholar'
                ? 'bg-gray-800 border border-yellow-500 text-yellow-100'
                : 'bg-gray-50 text-gray-700'
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

        {/* Next Question Button */}
        {selectedAnswer !== null && (
          <button
            onClick={handleNextQuestion}
            className="w-full bg-blue-700 text-white py-4 px-4 rounded-lg text-lg font-bold shadow-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : isReviewMode ? 'Finish Review' : 'Finish Quiz'}
          </button>
        )}
      </div>
    </div>
  );
}