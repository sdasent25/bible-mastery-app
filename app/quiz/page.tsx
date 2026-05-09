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
import {
  playMissionAdvanceSound,
  playMissionAffirmSound,
  playMissionPulseSound,
  playMissionSetbackSound,
  preloadMissionSounds,
  triggerHaptic,
} from '@/lib/sound';

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

  useEffect(() => {
    preloadMissionSounds();
  }, []);

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
  const missionModeLabel = isReviewMode
    ? "Review Operation"
    : isTrainingMode
      ? "Training Operation"
      : "Primary Mission";
  const missionStatusLabel = isReviewMode
    ? "Reinforce recall and resolve previous misses."
    : "Stay quick and accurate as the mission unfolds.";
  const comboStatusLabel =
    combo >= 5
      ? "Precision chain holding"
      : combo >= 3
        ? "Rhythm established"
        : combo >= 2
          ? "Momentum gathering"
          : "Hold steady";
  const streakStatusLabel =
    streak >= 7
      ? "Endurance proven"
      : streak >= 3
        ? "Continuity intact"
        : streak >= 1
          ? "Mission path active"
          : "Recovering focus";
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

  const getAnswerRevealAccent = (index: number) => {
    if (!showFeedback || selectedAnswer === null) return "";

    if (index === correctIndex) {
      return isCorrectAnswer
        ? "ring-1 ring-emerald-100/58 shadow-[inset_0_1px_0_rgba(236,253,245,0.34),0_0_42px_rgba(16,185,129,0.22),0_0_36px_rgba(245,208,116,0.22)] brightness-[1.16] before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(115deg,transparent_0%,rgba(255,248,220,0.14)_28%,rgba(255,221,160,0.30)_50%,rgba(236,253,245,0.14)_72%,transparent_100%)] before:animate-[pulse_1.3s_ease-out]"
        : "ring-1 ring-emerald-100/40 shadow-[inset_0_1px_0_rgba(236,253,245,0.24),0_0_28px_rgba(16,185,129,0.18)] brightness-[1.08] before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(115deg,transparent_0%,rgba(220,252,231,0.06)_34%,rgba(110,231,183,0.18)_50%,rgba(220,252,231,0.06)_66%,transparent_100%)]";
    }

    if (index === selectedAnswer && !isCorrectAnswer) {
      return "ring-1 ring-rose-100/66 shadow-[inset_0_1px_0_rgba(255,228,230,0.24),0_0_40px_rgba(244,63,94,0.28)] brightness-[1.15] saturate-[1.18]";
    }

    return "";
  };

  const getAnswerTextStyle = (index: number) => {
    if (!showFeedback || selectedAnswer === null) {
      return "text-white/92";
    }

    if (index === selectedAnswer && !isCorrectAnswer) {
      return "text-white font-semibold";
    }

    if (index === correctIndex) {
      return isCorrectAnswer
        ? "text-white font-semibold"
        : "text-emerald-50 font-semibold";
    }

    return "text-white/76";
  };

  const persistAnswerProgress = async (questionId: string, isCorrect: boolean, segmentId: string) => {
    try {
      const response = await fetch("/api/quiz/answer", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          questionId,
          correct: isCorrect,
          segmentId
        })
      });

      console.log("API RESPONSE", await response.clone().json());
    } catch (error) {
      console.error("Error saving quiz answer:", error);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return;

    const correct = answerIndex === correctIndex;
    const shouldAutoAdvance = !isReviewMode;

    console.log("ANSWER CLICKED", {
      questionId: currentQuestion.id,
      selectedAnswer: answerIndex,
      correctAnswer: currentQuestion.correctIndex
    });

    if (correct) {
      playMissionAffirmSound();
      triggerHaptic("light");
    } else {
      playMissionSetbackSound();
      triggerHaptic("medium");
    }

    setSelectedAnswer(answerIndex);
    setIsCorrectAnswer(correct);
    setShowFeedback(shouldAutoAdvance);

    if (correct) {
      if (!isReviewMode) {
        setStreak(prev => prev + 1);
        setCombo(prev => prev + 1);
        setScore(prev => prev + 1);
      }
    } else {
      if (!isReviewMode) {
        setStreak(0);
        setCombo(0);
        addIncorrectQuestion(currentQuestion.id);
        setIncorrectQuestions(prev =>
          prev.some(q => q.question.id === currentQuestion.id)
            ? prev
            : [...prev, { question: currentQuestion, userAnswer: currentQuestion.options[answerIndex] }]
        );
      }
    }

    if (!isReviewMode) {
      recordAnswerPerformance(currentQuestion.segmentId, correct);

      if (!resolvedSegment) {
        console.error("Missing segmentId");
      } else {
        console.log("CURRENT QUESTION:", currentQuestion);
        console.log("SENDING QUESTION ID:", currentQuestion.id);
        void persistAnswerProgress(currentQuestion.id, correct, resolvedSegment);
      }
    }
  };

  const truthConfirmationMessage = isCorrectAnswer
    ? (
      <div className="rounded-[1.15rem] border border-emerald-100/28 bg-[linear-gradient(180deg,rgba(12,52,37,0.46),rgba(7,24,18,0.68))] px-4 py-3 text-center shadow-[inset_0_1px_0_rgba(236,253,245,0.14),0_18px_30px_rgba(0,0,0,0.18)]">
        <div className="text-[10px] uppercase tracking-[0.28em] text-emerald-50/80">Confirmation</div>
        <div className="mt-2 text-base font-semibold text-white md:text-lg">Truth secured.</div>
      </div>
    )
    : (
      <div className="rounded-[1.15rem] border border-rose-100/18 bg-[linear-gradient(180deg,rgba(40,18,22,0.46),rgba(14,10,12,0.68))] px-4 py-3 text-center shadow-[inset_0_1px_0_rgba(255,228,230,0.10),0_18px_30px_rgba(0,0,0,0.18)]">
        <div className="text-[10px] uppercase tracking-[0.28em] text-white/70">Correction</div>
        <div className="mt-2 text-sm text-white/90">
          The correct answer is:
          <span className={`block mt-1 text-base font-semibold ${missionTheme.accentTextClass}`}>
            {currentQuestion.options[currentQuestion.correctIndex]}
          </span>
        </div>
      </div>
    );

  const completeQuiz = () => {
    setQuizCompleted(true);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 1000);
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
            <div className="animate-[fadeIn_0.45s_ease] rounded-[1.8rem] border border-amber-200/16 bg-black/26 px-8 py-5 text-center shadow-[0_0_40px_rgba(251,191,36,0.12)] backdrop-blur-xl">
              <div className="text-[11px] uppercase tracking-[0.32em] text-amber-100/68 mb-2">
                Debrief Received
              </div>
              <div className="text-xl font-semibold text-white">
                Mission Secured
              </div>
            </div>
          </div>
        )}

        <div className="relative min-h-screen overflow-hidden bg-[#08090d] text-white">
          <div className="absolute inset-0">
            {missionTheme.backgroundVideo ? (
              <video
                className="h-full w-full object-cover opacity-30"
                autoPlay
                loop
                muted
                playsInline
                poster={missionTheme.backgroundImage}
              >
                <source src={missionTheme.backgroundVideo} type="video/mp4" />
              </video>
            ) : (
              <Image
                src={missionTheme.backgroundImage}
                alt=""
                fill
                priority
                className="object-cover opacity-30"
                style={{ objectPosition: missionTheme.backgroundFallbackPosition }}
                sizes="100vw"
              />
            )}
          </div>
          <div className={`absolute inset-0 ${missionTheme.overlayClass}`} />
          <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-black/70 to-transparent" />
          <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-black/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black via-black/72 to-transparent" />
          <div className="relative flex min-h-screen items-center justify-center p-4">
          <div className={`max-w-lg w-full rounded-[2rem] border p-6 md:p-8 ${missionTheme.surfaceClass}`}>
          <div className="mb-5 text-center">
            <p className={`text-[11px] uppercase tracking-[0.36em] ${missionTheme.accentTextClass}`}>Mission Debrief</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">
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
          </div>
          <div className="text-center mb-8">
            {isReviewMode ? (
              <p className="text-sm text-slate-300 mt-2">
                You returned to the passage, resolved weak points, and steadied recall.
              </p>
            ) : isProgramMode ? (
              <>
                <p className={`text-sm uppercase tracking-[0.24em] ${missionTheme.accentTextClass}`}>{missionTheme.campaignLabel}</p>
                <p className={`mt-3 text-xl font-semibold ${missionTheme.accentTextClass}`}>
                  {missionTheme.missionTitle}
                </p>
                {isFinalProgramSegment ? (
                  <p className="text-sm text-slate-300 mt-2">
                    You carried {activeProgram?.title} to its close and sealed the final objective.
                  </p>
                ) : (
                  <p className="text-sm text-slate-300 mt-2">Next mission briefing: {next?.label}</p>
                )}
                <p className="mt-3 text-sm text-slate-200">
                  {score} of {questions.length} prompts were resolved with the campaign still advancing.
                </p>
              </>
            ) : isTrainingMode ? (
              <>
                <p className={`text-sm uppercase tracking-[0.24em] ${missionTheme.accentTextClass}`}>Training Debrief</p>
                <p className={`mt-3 text-xl font-semibold ${missionTheme.accentTextClass}`}>
                  {missionTheme.missionAtmosphere}
                </p>
                <p className="mt-3 text-sm text-slate-300">Each return to the text strengthens fluency without breaking campaign rhythm.</p>
                <p className="text-sm text-slate-200 mt-2">{score} of {questions.length} prompts were resolved in this training pass.</p>
              </>
            ) : (
              <>
                <p className={`mt-3 text-xl font-semibold ${missionTheme.accentTextClass}`}>
                  {missionTheme.missionTitle}
                </p>
                <p className="mt-3 text-sm text-slate-300">The mission is complete. Continue the campaign path or return to reinforce what you uncovered.</p>
                <p className="text-sm text-slate-200 mt-2">{score} of {questions.length} prompts were resolved before debrief.</p>
              </>
            )}
          </div>
          <div className="mb-6 rounded-[1.5rem] border border-white/10 bg-black/18 px-4 py-4 text-center backdrop-blur-md">
            <div className="text-[11px] uppercase tracking-[0.28em] text-white/48">Campaign Continuity</div>
            <p className="mt-3 text-sm leading-6 text-slate-200">
              Accuracy settled at {Math.round((score / Math.max(questions.length, 1)) * 100)}%. XP now stands at {totalXp}, and the current streak holds at {streak}.
            </p>
          </div>
          <div className="space-y-3">
            {next && !isPreviewMode && (
              <button
                onClick={() => router.push("/explore?completed=true")}
                className={`${MISSION_CTA_CLASS} flex w-full py-3 text-lg`}
              >
                Continue Campaign →
              </button>
            )}

            {isPreviewMode && (
              <button
                onClick={() => router.push("/explore?completed=true")}
                className={`${MISSION_CTA_CLASS} flex w-full py-3 text-lg`}
              >
                Continue Explore
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
              onClick={() => router.push('/explore?completed=true')}
              className="w-full rounded-full border border-white/10 bg-black/18 py-3 text-white/84 font-semibold backdrop-blur-sm transition hover:bg-black/26 hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Return to Explore
            </button>
          </div>
          </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-[100svh] overflow-hidden bg-[#060709]">
      <div className="absolute inset-0 pointer-events-none">
        {missionTheme.backgroundVideo ? (
          <video
            className="absolute inset-0 h-full w-full object-cover opacity-38"
            autoPlay
            loop
            muted
            playsInline
            poster={missionTheme.backgroundImage}
          >
            <source src={missionTheme.backgroundVideo} type="video/mp4" />
          </video>
        ) : (
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
        )}
        <div className={`absolute inset-0 ${missionTheme.overlayClass}`} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_30%,rgba(0,0,0,0.24),transparent_34%),linear-gradient(90deg,rgba(0,0,0,0.28),rgba(0,0,0,0.10)_42%,transparent_72%),linear-gradient(180deg,rgba(0,0,0,0.04),transparent_28%,rgba(0,0,0,0.14)_72%,rgba(0,0,0,0.34)_100%)]" />
        <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-black/85 via-black/40 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black via-black/72 to-transparent" />
        <div className="absolute left-1/2 top-[10%] h-40 w-40 -translate-x-1/2 rounded-full bg-amber-100/8 blur-3xl" />
      </div>
      <div className="relative z-10 flex-1 pb-6 md:px-6 md:py-4 md:pb-16">
        <div className="flex h-full w-full justify-center">
        <div className="mx-auto flex min-h-[100svh] h-full w-full max-w-3xl flex-col">
          <div className="flex h-full flex-col">
            <div className="flex-[0_1_auto] px-3 pt-2 pb-2 md:px-6 md:pt-3 md:pb-3">
              <div className={`rounded-[1.2rem] border px-3 py-2.5 md:rounded-[1.4rem] md:px-4 md:py-3 ${missionTheme.hudClass}`}>
              <div className="mb-2 flex items-start justify-between gap-3 md:mb-3 md:gap-4">
                <div className="flex items-start gap-3 md:gap-4">
                  <button
                    onClick={() => router.push('/explore')}
                    className="
                      rounded-[1.1rem]
                      border border-white/10
                      bg-black/20
                      px-2.5 py-2
                      text-gray-200
                      hover:text-white
                      text-base
                      font-semibold
                      transition-all duration-150
                      hover:scale-[1.02]
                      active:scale-95
                      active:brightness-90
                      md:rounded-2xl
                      md:px-3 md:py-3
                      md:text-xl
                    "
                    aria-label="Close quiz and return to explore"
                  >
                    ✕
                  </button>

                  <div>
                    <p className={`text-[11px] uppercase tracking-[0.3em] ${missionTheme.accentTextClass}`}>
                      {missionTheme.bookLabel} Mission
                    </p>
                    <p className="mt-0.5 text-[13px] text-white md:mt-1 md:text-base">
                      Prompt {currentQuestionIndex + 1} of {availableQuestionCount}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`hidden text-[11px] uppercase tracking-[0.24em] md:block ${missionTheme.accentTextClass}`}>
                    {missionTheme.campaignLabel}
                  </div>
                  <div className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-white/70 md:mt-1 md:text-sm md:normal-case md:tracking-normal md:text-white/76">
                    {missionModeLabel}
                  </div>
                </div>
              </div>

              <div className="mb-2 grid grid-cols-4 gap-1.5 text-center md:mb-3 md:gap-2">
                <div className="rounded-[1rem] border border-white/8 bg-black/16 px-1.5 py-1.5 md:rounded-2xl md:px-2 md:py-2">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/50">XP</div>
                  <div className="mt-0.5 text-[13px] font-semibold text-white md:mt-1 md:text-sm">{totalXp}</div>
                </div>
                <div className="rounded-[1rem] border border-white/8 bg-black/16 px-1.5 py-1.5 md:rounded-2xl md:px-2 md:py-2">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/50">Streak</div>
                  <div className="mt-0.5 text-[13px] font-semibold text-white md:mt-1 md:text-sm">{streak}</div>
                  <div className="mt-1 hidden text-[10px] uppercase tracking-[0.16em] text-white/40 md:block">{streakStatusLabel}</div>
                </div>
                <div className="rounded-[1rem] border border-white/8 bg-black/16 px-1.5 py-1.5 md:rounded-2xl md:px-2 md:py-2">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/50">Combo</div>
                  <div className={`mt-0.5 text-[13px] font-semibold transition-all duration-200 md:mt-1 md:text-sm ${comboFlash ? "scale-110 text-amber-100" : "text-white"}`}>{combo}</div>
                  <div className="mt-1 hidden text-[10px] uppercase tracking-[0.16em] text-white/40 md:block">{comboStatusLabel}</div>
                </div>
                <div className="rounded-[1rem] border border-white/8 bg-black/16 px-1.5 py-1.5 md:rounded-2xl md:px-2 md:py-2">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/50">Score</div>
                  <div className="mt-0.5 text-[13px] font-semibold text-white md:mt-1 md:text-sm">{score}</div>
                </div>
              </div>

              <div className="mb-1.5 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-white/44 md:mb-2 md:text-[11px] md:tracking-[0.22em]">
                <span>Mission progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-[6px] overflow-hidden rounded-full bg-white/8 md:h-[7px]">
                <div
                  className={`h-full rounded-full ${missionTheme.progressClass} shadow-[0_0_18px_rgba(251,191,36,0.18)] transition-all duration-500 ease-out`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              </div>
            </div>

            <div
              key={currentQuestion.id}
              className={`animate-[fadeIn_0.45s_ease] flex h-full flex-col rounded-[1.7rem] border px-3 py-4 md:rounded-[2rem] md:p-10 transition-[opacity,transform] duration-500 ${missionTheme.surfaceClass} ${
                currentQuestion.difficulty === 'scholar'
                  ? 'border-2 border-yellow-300/40'
                  : ''
              }`}
            >
              <div className="flex flex-col gap-3 pt-0 md:gap-5 md:pt-2">
                <div className="w-full flex-[0_1_auto]">
                  <div className="flex items-start justify-between gap-3 text-sm text-slate-300/84 md:gap-4">
                    <div>
                      <p className={`mt-1 text-[11px] uppercase tracking-[0.28em] ${missionTheme.accentTextClass}`}>
                        {missionTheme.worldLabel}
                      </p>

                      <p className="mt-2 hidden max-w-md text-sm text-white/72 md:block">
                        {missionTheme.missionBrief}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] md:px-3 md:text-[11px] md:tracking-[0.18em] ${missionTheme.badgeClass}`}>
                        {missionTheme.missionAtmosphere}
                      </div>
                    </div>
                  </div>

                  {currentQuestion.difficulty === 'scholar' && (
                    <div className="mt-2 rounded-full border border-yellow-300/32 bg-yellow-200/8 px-3 py-1.5 md:mt-3 md:px-4 md:py-2">
                      <p className="text-center text-xs font-bold tracking-[0.24em] text-yellow-100">SCHOLAR MISSION</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center gap-3 text-center md:gap-4">
                  {currentQuestion.reference && (
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-300 md:text-sm">
                      {currentQuestion.reference}
                    </p>
                  )}

                  <h1 className="max-w-2xl text-center text-[21px] leading-snug font-semibold break-words text-white md:text-[30px]">
                    {currentQuestion.question}
                  </h1>

                  {!isAnswered && (
                    <p className="text-xs text-slate-400 md:text-sm">
                      {missionStatusLabel}
                    </p>
                  )}

                  {isReviewMode && currentIncorrectItem && (
                    <div className="rounded-[1rem] border border-amber-200/14 bg-black/24 p-3 text-sm text-amber-50/88">
                      You previously chose: <strong>{currentIncorrectItem.userAnswer}</strong>
                    </div>
                  )}
                </div>

                {(!isAnswered || showFeedback) && (
                    <div className="grid grid-cols-1 gap-2 pt-1 md:grid-cols-2 md:gap-3 md:pt-2">
                      {currentQuestion.options.map((answer, index) => (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(index)}
                          disabled={selectedAnswer !== null}
                        className={`relative min-h-[60px] w-full overflow-hidden rounded-[1.2rem] border px-3 py-3 text-left text-[15px] leading-tight font-medium text-white transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-200/40 md:min-h-[132px] md:rounded-[1.55rem] md:px-6 md:py-5 md:text-base ${missionTheme.answerShellClass} ${getButtonStyle(index)} ${getAnswerRevealAccent(index)}`}
                        aria-label={`Answer option ${index + 1}: ${answer}`}
                      >
                        <div className="flex items-center justify-between gap-4 md:h-full md:items-start">
                          <span className={`text-[15px] leading-tight font-normal md:flex md:min-h-full md:flex-col md:justify-start md:text-[17px] ${getAnswerTextStyle(index)}`}>
                            <span className={`mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-xs font-semibold md:mr-0 md:mb-4 md:h-10 md:w-10 md:text-sm ${missionTheme.accentTextClass}`}>
                              {["A", "B", "C", "D"][index]}
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
                <div className="mt-1 flex flex-col items-center justify-center text-center animate-[fadeIn_0.35s_ease]">
                  {isCorrectAnswer ? (
                    <>
                      <div className="mb-2 h-px w-20 bg-gradient-to-r from-transparent via-amber-100/70 to-transparent" />
                      <div className="text-[11px] uppercase tracking-[0.3em] text-amber-100/70">Alignment</div>
                      <h1 className="mt-3 text-2xl font-semibold text-white">
                        The passage holds
                      </h1>
                    </>
                  ) : (
                    <>
                      <div className="mb-2 h-px w-20 bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                      <div className="text-[11px] uppercase tracking-[0.3em] text-white/50">Adjustment</div>
                      <div className="mt-3 text-2xl font-semibold text-white">
                        Truth remains ahead
                      </div>
                    </>
                  )}

                  <div className="mt-2 text-sm uppercase tracking-[0.22em] text-slate-400">
                    Passage Anchor
                  </div>

                  <div className="text-xl font-semibold text-white mt-2">
                    {currentQuestion.options[currentQuestion.correctIndex]}
                  </div>

                  {isCorrectAnswer && (
                    <div className={`mt-3 text-sm uppercase tracking-[0.22em] ${missionTheme.accentTextClass}`}>
                      Mission continuity preserved
                    </div>
                  )}

                  <div className="pb-4 w-full">
                    <button
                      id="continueBtn"
                      onClick={() => {
                        playMissionAdvanceSound();
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

              {isAnswered && !isReviewMode && (
                <div className="mt-3 space-y-3">
                  {truthConfirmationMessage}
                  <button
                    onClick={() => {
                      playMissionAdvanceSound();
                      triggerHaptic("light");
                      handleNextQuestion();
                    }}
                    className={`${MISSION_CTA_CLASS} flex w-full py-3 text-base md:py-4 md:text-lg`}
                  >
                    Continue Mission →
                  </button>
                </div>
              )}

              {isReviewMode && selectedAnswer !== null && (
                <button
                  onClick={() => {
                    playMissionPulseSound();
                    handleTryAgain();
                  }}
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
