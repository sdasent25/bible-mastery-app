'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getQuestions, type Question } from '@/lib/questions';
import { completeToday, hasCompletedToday } from '@/lib/streak';
import { addXp, getXp } from '@/lib/xp';
import { isPro, isProPlus } from '@/lib/user';
import { addIncorrectQuestion, getIncorrectQuestions } from '@/lib/review';

type IncorrectItem = {
  question: Question;
  userAnswer: string;
};

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
  const [isContinueTrainingMode, setIsContinueTrainingMode] = useState(false);
  const [showContinueLocked, setShowContinueLocked] = useState(false);
  const [quizSeed, setQuizSeed] = useState(0);
  const [isWeaknessMode, setIsWeaknessMode] = useState(false);
  const [weakQuestions, setWeakQuestions] = useState<Question[]>([]);
  const [noWeakAreasMessage, setNoWeakAreasMessage] = useState(false);


  useEffect(() => {
    const initializeQuiz = async () => {
      const search = typeof window !== 'undefined' ? window.location.search : '';
      const params = new URLSearchParams(search);
      const segmentParam = params.get('segment') || 'genesis_1_3';
      setSegment(segmentParam);

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
      const result = await isPro();
      const isProPlusUser = await isProPlus();
      setIsProUser(result);
      setIsProPlusUser(isProPlusUser);
      setLoadingPro(false);
    }
    checkPro();
  }, []);

  const effectiveDifficulty = isProUser ? "mixed" : "easy";

  const questions = useMemo(() => {
    if (!paramsInitialized) return [] as Question[];

    let fetchedQuestions: Question[];

    if (isProUser) {
      fetchedQuestions = getQuestions(segment, 'mixed').slice(0, 15);
    } else {
      fetchedQuestions = getQuestions(segment, effectiveDifficulty).slice(0, 2);
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
  }, [paramsInitialized, segment, effectiveDifficulty, isProUser, quizSeed]);

  const activeQuestions = isReviewMode ? reviewQuestions : isWeaknessMode ? weakQuestions : questions;
  const totalQuestions = activeQuestions.length;
  const currentQuestion = activeQuestions[currentQuestionIndex];

  const handleContinueTraining = () => {
    if (isProPlusUser) {
      setIsContinueTrainingMode(true);
      setShowContinueLocked(false);
      setQuizSeed(prev => prev + 1);
      resetQuiz();
      return;
    }

    setShowContinueLocked(true);
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
    setIsContinueTrainingMode(false);
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
      if (quizCompleted && !isReviewMode && !streakSaved) {
        await completeToday();
        setStreakSaved(true);
      }
    };

    markComplete();
  }, [quizCompleted, isReviewMode, streakSaved]);

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

  // Check if user already completed today and not in review mode
  if (completedToday && !isReviewMode && !isContinueTrainingMode && !isWeaknessMode) {
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
              Train Weak Areas
            </button>
            {noWeakAreasMessage && (
              <p className="text-center text-sm text-gray-700">You&apos;re doing great! No weak areas yet.</p>
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

    setQuizCompleted(false);
    setIncorrectQuestions([]);
    setIsReviewMode(false);
    setReviewQuestions([]);
    setStreakSaved(false);
    setShowRetryPrompt(false);
    setIsWeaknessMode(false);
    setWeakQuestions([]);
    setNoWeakAreasMessage(false);
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

  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
            {isReviewMode ? 'Review Completed!' : 'Quiz Completed!'}
          </h1>
          <div className="text-center mb-6">
            {isReviewMode ? (
              <p className="text-sm text-gray-600 mt-2">
                Review complete — great job reinforcing your knowledge
              </p>
            ) : (
              <>
                <p className="text-lg text-gray-700">Correct Answers: {score} / {questions.length}</p>
                <p className="text-lg text-gray-700">XP Total: {totalXp}</p>
                <p className="text-sm text-gray-600 mt-2">Great job! Keep studying to master more verses.</p>
              </>
            )}
          </div>
          <div className="space-y-3">
            <button
              onClick={resetQuiz}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isReviewMode ? 'Back to Quiz' : 'Retry Quiz'}
            </button>
            {!isReviewMode && (
              <>
                <button
                  onClick={handleContinueTraining}
                  className="w-full bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Continue Training
                </button>
                {showContinueLocked && !isProPlusUser && (
                  <div className="rounded-lg border border-gray-300 bg-gray-50 p-3 text-center">
                    <p className="text-gray-900 mb-3">🔒 Continue Training is available on Pro+</p>
                    <Link href="/upgrade" className="inline-block">
                      <button className="bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        Upgrade to Pro+
                      </button>
                    </Link>
                  </div>
                )}
              </>
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isReviewMode ? 'Review Mode' : 'Bible Quiz'}
          </h1>
          <p className="text-gray-600">
            {isReviewMode
              ? 'Reinforce what you missed'
              : 'Test your knowledge and earn XP as part of your daily mastery routine.'}
          </p>
          {!isReviewMode && !quizCompleted && (
            <div className="mt-4 space-y-2">
              <button
                onClick={handleTrainWeakAreas}
                className="bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Train Weak Areas
              </button>
              {noWeakAreasMessage && (
                <p className="text-sm text-gray-700">You&apos;re doing great! No weak areas yet.</p>
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
                {activeQuestions[0]?.reference || 'Unknown Segment'}
              </h2>
              <p className="text-gray-600">Segment being studied</p>
            </div>
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
              {isWeaknessMode ? 'Weak Areas' : isProUser ? 'Mixed' : 'Easy'}
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
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl leading-relaxed font-semibold text-gray-900 mb-6">{currentQuestion.question}</h3>

          {isReviewMode && currentIncorrectItem && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              You previously chose: <strong>{currentIncorrectItem.userAnswer}</strong>
            </div>
          )}

          <div className="space-y-4">
            {currentQuestion.options.map((answer, index) => {
              let buttonClass = 'w-full text-left py-4 px-4 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-14 ';
              let label = '';

              if (selectedAnswer === null) {
                buttonClass += 'bg-white text-gray-900 border-gray-300 hover:bg-gray-100';
              } else if (index === currentQuestion.correctIndex) {
                buttonClass += 'bg-green-100 text-green-900 border-green-700';
                label = 'Correct';
              } else if (index === selectedAnswer && index !== currentQuestion.correctIndex) {
                buttonClass += 'bg-red-100 text-red-900 border-red-700';
                label = 'Incorrect';
              } else {
                buttonClass += 'bg-white text-gray-900 border-gray-300';
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
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-gray-700">
              <p>{currentQuestion.explanation}</p>
            </div>
          )}

          {selectedAnswer !== null && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-700">{currentQuestion.explanation}</p>
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