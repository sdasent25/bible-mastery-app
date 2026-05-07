'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from "@supabase/supabase-js";
import { MISSION_CTA_CLASS } from '@/lib/missionUi';
import { getQuizMissionTheme } from '@/lib/quizMissionTheme';
import { supabase } from '@/lib/supabase';
import { completeToday } from '@/lib/streak';
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
  const [showCelebration, setShowCelebration] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [incorrectQuestions, setIncorrectQuestions] = useState<IncorrectItem[]>([]);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [reviewQuestions, setReviewQuestions] = useState<Question[]>([]);
  const [streakSaved, setStreakSaved] = useState(false);
  const [, setShowRetryPrompt] = useState(false);
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
        <p className="text-lg text-slate-300">Preparing mission...</p>
      </div>
    );
  }

  if (loadingQuestions) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <p className="text-lg text-slate-300">Gathering mission prompts...</p>
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
  const missionTheme = getQuizMissionTheme(resolvedSegment || segment);
  const getButtonStyle = (index: number) => {
    if (!showFeedback) return `${missionTheme.answerIdleClass} ${missionTheme.answerHoverClass}`;

    if (index === correctIndex) {
      return missionTheme.answerCorrectClass;
    }

    if (index === selectedAnswer) {
      return missionTheme.answerWrongClass;
    }

    return missionTheme.answerMutedClass;
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
          playSound("/sounds/journey-selected.mp3");
          triggerHaptic("light");
          setShowCelebration(true);
          setTimeout(() => {
            setShowCelebration(false);
          }, 1000);
          setStreak(prev => prev + 1);
          setCombo(prev => prev + 1);
          setScore(score + 1);
        } else {
          playSound("/sounds/wrong.mp3");
          triggerHaptic("medium");
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
    setShowCelebration(false);
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
          <div className="fixed inset-x-4 top-4 z-50 mx-auto max-w-md rounded-2xl border border-amber-300/30 bg-black/35 px-4 py-3 text-center text-sm font-semibold text-amber-100 shadow-[0_0_24px_rgba(251,191,36,0.12)] backdrop-blur-sm">
            A new mission arrives tomorrow. Upgrade if you want to keep moving tonight.
          </div>
        )}

        {showCelebration && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            <div className="animate-pop text-center">
              <div className="text-5xl mb-2 text-amber-200">✦</div>
              <div className="text-xl font-bold text-white">
                Mission Secured
              </div>
            </div>
          </div>
        )}

        <div className="min-h-screen bg-[#08090d] text-white flex items-center justify-center p-4">
          <div className={`max-w-md w-full rounded-[1.8rem] border p-6 ${missionTheme.surfaceClass}`}>
          <h1 className="text-2xl font-bold text-center text-white mb-4">
            {isReviewMode
              ? 'Review Complete'
              : isProgramMode
                ? isFinalProgramSegment
                  ? 'Campaign Complete'
                  : 'Mission Complete'
                : isTrainingMode
                  ? 'Training Complete'
                  : 'Mission Complete'}
          </h1>
          <div className="text-center mb-6">
            {isReviewMode ? (
              <p className="text-sm text-slate-300 mt-2">
                You reinforced the mission material and sharpened your recall.
              </p>
            ) : isProgramMode ? (
              <>
                <p className={`text-sm uppercase tracking-[0.24em] ${missionTheme.accentTextClass}`}>{missionTheme.campaignLabel}</p>
                <p className="mt-3 text-lg text-slate-200">Resolved {score} of {questions.length} prompts</p>
                <p className="text-lg text-slate-200">XP Total: {totalXp}</p>
                <p className={`mt-3 text-xl font-semibold ${missionTheme.accentTextClass}`}>
                  {missionTheme.missionTitle}
                </p>
                {isFinalProgramSegment ? (
                  <p className="text-sm text-slate-300 mt-2">
                    You finished {activeProgram?.title} and carried the campaign to its close.
                  </p>
                ) : (
                  <p className="text-sm text-slate-300 mt-2">Next mission: {next?.label}</p>
                )}
                <p className="text-sm text-amber-200 mt-2">
                  Streak now stands at {streak}
                </p>
              </>
            ) : isTrainingMode ? (
              <>
                <p className={`text-sm uppercase tracking-[0.24em] ${missionTheme.accentTextClass}`}>Training Debrief</p>
                <p className="mt-3 text-lg text-slate-200">Resolved {score} of {questions.length} prompts</p>
                <p className="text-lg text-slate-200">XP Total: {totalXp}</p>
                <p className={`mt-3 text-xl font-semibold ${missionTheme.accentTextClass}`}>
                  {missionTheme.missionAtmosphere}
                </p>
                <p className="text-sm text-slate-300 mt-2">You&apos;re building mastery with every return to the text.</p>
              </>
            ) : (
              <>
                <p className={`text-sm uppercase tracking-[0.24em] ${missionTheme.accentTextClass}`}>Mission Debrief</p>
                <p className="mt-3 text-lg text-slate-200">Resolved {score} of {questions.length} prompts</p>
                <p className="text-lg text-slate-200">XP Total: {totalXp}</p>
                <p className={`mt-3 text-xl font-semibold ${missionTheme.accentTextClass}`}>
                  {missionTheme.missionTitle}
                </p>
                <p className="text-sm text-slate-300 mt-2">The mission is complete. Continue the campaign or return for mastery.</p>
              </>
            )}
          </div>
          <p className="text-sm text-slate-300 text-center mb-4">
            Choose your next step in the campaign.
          </p>
          <div className="space-y-3">
            {next && !isPreviewMode && (
              <button
                onClick={() => router.push("/journey?completed=true")}
                className={`${MISSION_CTA_CLASS} flex w-full py-3 text-lg`}
              >
                Continue Campaign →
              </button>
            )}

            {isPreviewMode && (
              <button
                onClick={() => router.push("/journey?completed=true")}
                className={`${MISSION_CTA_CLASS} flex w-full py-3 text-lg`}
              >
                Continue Journey
              </button>
            )}

            {incorrectQuestions.length > 0 && (
              <button
                onClick={handleTrainWeakAreas}
                className="w-full rounded-full border border-white/12 bg-white/10 py-3 text-white font-semibold backdrop-blur-sm transition hover:bg-white/14 hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Train Weak Areas
              </button>
            )}

            {incorrectQuestions.length > 0 && (
              <button
                onClick={startReview}
                className="w-full rounded-full border border-white/12 bg-white/10 py-3 text-white font-semibold backdrop-blur-sm transition hover:bg-white/14 hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Review Mistakes
              </button>
            )}

            <button
              onClick={() => router.push('/journey?completed=true')}
              className="w-full rounded-full border border-white/10 bg-black/18 py-3 text-white/84 font-semibold backdrop-blur-sm transition hover:bg-black/26 hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Return to Journey
            </button>
          </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#060709]">
      {showCelebration && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="animate-pop text-center">
            <div className="text-5xl mb-2 text-amber-200">✦</div>
            <div className="text-xl font-bold text-white">
              Truth secured
            </div>
          </div>
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0">
          <Image
            src={missionTheme.backgroundImage}
            alt=""
            fill
            priority
            className="object-cover opacity-34"
            style={{ objectPosition: missionTheme.backgroundPosition }}
            sizes="100vw"
          />
        </div>
        <div className={`absolute inset-0 ${missionTheme.overlayClass}`} />
        <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-black/80 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-black/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 to-transparent" />
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

                  <span className={`text-sm md:text-base ${missionTheme.accentTextClass}`}>
                    Question {currentQuestionIndex + 1} of {availableQuestionCount}
                  </span>
                </div>

                <div className={`text-sm md:text-base ${missionTheme.accentTextClass}`}>
                  {missionTheme.campaignLabel}
                </div>
              </div>

              <div className="h-[6px] rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full ${missionTheme.progressClass} shadow-[0_0_18px_rgba(251,191,36,0.18)] transition-all duration-500 ease-out`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div
              key={currentQuestion.id}
              className={`animate-[fadeIn_0.3s_ease] flex h-full flex-col rounded-[1.9rem] border px-4 py-6 md:p-10 scale-[1.02] ${missionTheme.surfaceClass} ${
                currentQuestion.difficulty === 'scholar'
                  ? 'border-2 border-yellow-300/40'
                  : ''
              }`}
            >
              <div className="flex flex-col gap-5 pt-2">
                <div className="w-full flex-[0_1_auto]">
                  <div className="flex items-center justify-between gap-2 text-sm text-slate-300/84">
                    <div>
                      <p className={`mt-1 text-sm ${missionTheme.accentTextClass}`}>
                        {missionTheme.worldLabel}
                      </p>

                      <p className="text-xs text-white/62 mt-1">
                        {missionTheme.missionTitle}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${missionTheme.badgeClass}`}>
                        Streak {streak}
                      </div>
                      <div className={`${comboFlash ? "scale-110 text-amber-200" : "text-white/72"} transition-all duration-200 text-[11px] uppercase tracking-[0.18em]`}>
                        Combo {combo}
                      </div>
                    </div>
                  </div>

                  {currentQuestion.difficulty === 'scholar' && (
                    <div className="mt-3 rounded-full border border-yellow-300/32 bg-yellow-200/8 px-4 py-2">
                      <p className="text-center text-xs font-bold tracking-[0.24em] text-yellow-100">SCHOLAR MISSION</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center text-center gap-4">
                  {currentQuestion.reference && (
                    <p className="text-sm text-gray-300">
                      {currentQuestion.reference}
                    </p>
                  )}

                  <h1 className="text-[22px] leading-snug font-bold text-white text-center break-words">
                    {currentQuestion.question}
                  </h1>

                  {!isAnswered && (
                    <p className="text-sm text-slate-400">
                      Choose the answer that fulfills the mission prompt
                    </p>
                  )}

                  {isReviewMode && currentIncorrectItem && (
                    <div className="rounded-lg border border-red-400/40 bg-red-600/15 p-3 text-sm text-red-100">
                      You previously chose: <strong>{currentIncorrectItem.userAnswer}</strong>
                    </div>
                  )}
                </div>

                {(!isAnswered || showFeedback) && (
                  <div className="flex flex-col gap-3 pt-2">
                    {currentQuestion.options.map((answer, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={selectedAnswer !== null}
                        className={`min-h-[60px] w-full rounded-[1.4rem] border px-4 py-3 text-left text-base leading-tight font-medium text-white shadow-[0_18px_36px_rgba(0,0,0,0.18)] transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-200/40 md:px-6 ${getButtonStyle(index)}`}
                        aria-label={`Answer option ${index + 1}: ${answer}`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-base leading-tight font-normal">
                            <span className={`font-bold text-xl mr-4 ${missionTheme.accentTextClass}`}>
                              {["A", "B", "C", "D"][index]}.
                            </span>
                            {answer}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isAnswered && !showFeedback && (
                <div className="flex flex-col items-center justify-center text-center mt-1 animate-[fadeIn_0.25s_ease]">
                  {isCorrectAnswer ? (
                    <>
                      <div className="mb-2 text-5xl text-amber-200">✦</div>

                      <h1 className="text-2xl font-bold text-emerald-300">
                        Truth Confirmed
                      </h1>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl mb-2 text-rose-300">✕</div>
                      <div className="text-3xl font-bold mb-2 text-rose-300">
                        Missed the Mark
                      </div>
                    </>
                  )}

                  <div className="mt-2 text-sm uppercase tracking-[0.22em] text-slate-400">
                    Correct Answer
                  </div>

                  <div className="text-xl font-semibold text-white mt-2">
                    {currentQuestion.options[currentQuestion.correctIndex]}
                  </div>

                  {isCorrectAnswer && (
                    <div className={`text-lg font-bold mt-3 animate-pop ${missionTheme.accentTextClass}`}>
                      Mission momentum rises
                    </div>
                  )}

                  <div className="pb-4 w-full">
                    <button
                      id="continueBtn"
                      onClick={() => {
                        playSound("/sounds/tap.mp3");
                        triggerHaptic("light");
                        handleNextQuestion();
                      }}
                      className={`${MISSION_CTA_CLASS} mt-4 flex w-full px-6 py-4 text-xl`}
                    >
                      Advance Mission →
                    </button>
                  </div>
                </div>
              )}

              {currentIncorrectItem && isReviewMode && selectedAnswer === null && (
                <div className={`mt-2 rounded-[1.3rem] border border-white/10 bg-black/26 p-4 text-slate-200 backdrop-blur-sm ${
                  currentQuestion.difficulty === 'scholar'
                    ? 'ring-1 ring-yellow-300/25'
                    : ''
                }`}>
                  <p>{currentQuestion.explanation}</p>
                </div>
              )}

              {isAnswered && (
                <div className={`mt-2 rounded-[1.3rem] border border-white/10 bg-black/26 p-4 text-slate-200 backdrop-blur-sm ${
                  currentQuestion.difficulty === 'scholar'
                    ? 'ring-1 ring-yellow-300/25'
                    : ''
                }`}>
                  <p>{currentQuestion.explanation}</p>
                </div>
              )}

              {isReviewMode && selectedAnswer !== null && (
                <button
                  onClick={handleTryAgain}
                  className={`${MISSION_CTA_CLASS} mt-3 flex w-full py-3 text-base`}
                >
                  Reattempt Mission Prompt
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
