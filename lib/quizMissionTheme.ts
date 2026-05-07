import { getGenesisMissionMeta } from "@/lib/genesisCampaign"

type QuizMissionTheme = {
  campaignLabel: string
  worldLabel: string
  missionTitle: string
  missionAtmosphere: string
  missionBrief: string
  backgroundImage: string
  backgroundPosition: string
  surfaceClass: string
  overlayClass: string
  progressClass: string
  accentTextClass: string
  badgeClass: string
  answerIdleClass: string
  answerHoverClass: string
  answerCorrectClass: string
  answerWrongClass: string
  answerMutedClass: string
}

const CATEGORY_BACKGROUNDS = {
  pentateuch: "/explorer/pentateuch/region.png",
  historical: "/explorer/historical/region.png",
  wisdom: "/explorer/wisdom/region.png",
  majorProphets: "/explorer/major-prophets/region.png",
  minorProphets: "/explorer/minor-prophets/region.png",
  gospels: "/explorer/gospels/region.png",
  acts: "/explorer/acts/region.png",
  pauline: "/explorer/pauline-epistles/region.png",
  general: "/explorer/general-epistles/region.png",
  apocalyptic: "/explorer/apocalyptic/region.png",
} as const

const BOOK_LABELS: Record<string, string> = {
  genesis: "Genesis",
  exodus: "Exodus",
  leviticus: "Leviticus",
  numbers: "Numbers",
  deuteronomy: "Deuteronomy",
  joshua: "Joshua",
  judges: "Judges",
  ruth: "Ruth",
  "1_samuel": "1 Samuel",
  "2_samuel": "2 Samuel",
  "1_kings": "1 Kings",
  "2_kings": "2 Kings",
  "1_chronicles": "1 Chronicles",
  "2_chronicles": "2 Chronicles",
  ezra: "Ezra",
  nehemiah: "Nehemiah",
  esther: "Esther",
  job: "Job",
  psalms: "Psalms",
  proverbs: "Proverbs",
  ecclesiastes: "Ecclesiastes",
  song_of_songs: "Song of Songs",
  isaiah: "Isaiah",
  jeremiah: "Jeremiah",
  lamentations: "Lamentations",
  ezekiel: "Ezekiel",
  daniel: "Daniel",
  hosea: "Hosea",
  joel: "Joel",
  amos: "Amos",
  obadiah: "Obadiah",
  jonah: "Jonah",
  micah: "Micah",
  nahum: "Nahum",
  habakkuk: "Habakkuk",
  zephaniah: "Zephaniah",
  haggai: "Haggai",
  zechariah: "Zechariah",
  malachi: "Malachi",
  matthew: "Matthew",
  mark: "Mark",
  luke: "Luke",
  john: "John",
  acts: "Acts",
  romans: "Romans",
  "1_corinthians": "1 Corinthians",
  "2_corinthians": "2 Corinthians",
  galatians: "Galatians",
  ephesians: "Ephesians",
  philippians: "Philippians",
  colossians: "Colossians",
  "1_thessalonians": "1 Thessalonians",
  "2_thessalonians": "2 Thessalonians",
  "1_timothy": "1 Timothy",
  "2_timothy": "2 Timothy",
  titus: "Titus",
  philemon: "Philemon",
  hebrews: "Hebrews",
  james: "James",
  "1_peter": "1 Peter",
  "2_peter": "2 Peter",
  "1_john": "1 John",
  jude: "Jude",
  revelation: "Revelation",
}

function getBookKey(segment: string) {
  return segment.toLowerCase().replaceAll("-", "_").split("_").slice(0, -2).join("_")
}

function getBookLabel(bookKey: string) {
  return BOOK_LABELS[bookKey] || bookKey.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())
}

function getCategoryTheme(bookKey: string) {
  const historical = new Set(["joshua", "judges", "ruth", "1_samuel", "2_samuel", "1_kings", "2_kings", "1_chronicles", "2_chronicles", "ezra", "nehemiah", "esther"])
  const wisdom = new Set(["job", "psalms", "proverbs", "ecclesiastes", "song_of_songs"])
  const majorProphets = new Set(["isaiah", "jeremiah", "lamentations", "ezekiel", "daniel"])
  const minorProphets = new Set(["hosea", "joel", "amos", "obadiah", "jonah", "micah", "nahum", "habakkuk", "zephaniah", "haggai", "zechariah", "malachi"])
  const gospels = new Set(["matthew", "mark", "luke", "john"])
  const pauline = new Set(["romans", "1_corinthians", "2_corinthians", "galatians", "ephesians", "philippians", "colossians", "1_thessalonians", "2_thessalonians", "1_timothy", "2_timothy", "titus", "philemon"])
  const general = new Set(["hebrews", "james", "1_peter", "2_peter", "1_john", "jude"])

  if (["genesis", "exodus", "leviticus", "numbers", "deuteronomy"].includes(bookKey)) {
    return {
      campaignLabel: "Pentateuch Campaign",
      worldLabel: "Sacred Wilderness",
      backgroundImage: CATEGORY_BACKGROUNDS.pentateuch,
      backgroundPosition: "50% 42%",
      surfaceClass: "bg-[linear-gradient(180deg,rgba(26,18,8,0.78),rgba(10,8,6,0.92))] border-amber-100/14 shadow-[0_0_40px_rgba(251,191,36,0.10),0_28px_70px_rgba(0,0,0,0.34)]",
      overlayClass: "bg-[radial-gradient(circle_at_top,rgba(255,226,153,0.22),transparent_28%),linear-gradient(180deg,rgba(12,10,6,0.04),rgba(12,10,6,0.26)_48%,rgba(6,5,4,0.72))]",
      progressClass: "bg-gradient-to-r from-[#f6e5af] via-[#efcb6a] to-[#dd9f45]",
      accentTextClass: "text-amber-100/84",
      badgeClass: "border-amber-100/14 bg-amber-100/8 text-amber-50/78",
      answerIdleClass: "border-amber-100/12 bg-[linear-gradient(180deg,rgba(26,19,10,0.84),rgba(13,10,8,0.92))]",
      answerHoverClass: "hover:border-amber-200/28 hover:bg-[linear-gradient(180deg,rgba(34,24,10,0.92),rgba(18,13,9,0.96))] hover:shadow-[0_0_22px_rgba(251,191,36,0.10)]",
      answerCorrectClass: "border-emerald-300/34 bg-[linear-gradient(180deg,rgba(18,48,34,0.96),rgba(11,28,20,0.98))] shadow-[0_0_28px_rgba(110,231,183,0.16)] scale-[1.01]",
      answerWrongClass: "border-rose-300/30 bg-[linear-gradient(180deg,rgba(62,18,22,0.96),rgba(32,11,14,0.98))] shadow-[0_0_24px_rgba(251,113,133,0.14)]",
      answerMutedClass: "border-white/10 bg-[linear-gradient(180deg,rgba(18,16,14,0.88),rgba(10,9,8,0.94))] opacity-55",
    } satisfies Omit<QuizMissionTheme, "missionTitle" | "missionAtmosphere" | "missionBrief">
  }

  if (historical.has(bookKey)) {
    return {
      campaignLabel: "Historical Campaign",
      worldLabel: "Kingdom Roads",
      backgroundImage: CATEGORY_BACKGROUNDS.historical,
      backgroundPosition: "50% 45%",
      surfaceClass: "bg-[linear-gradient(180deg,rgba(10,18,32,0.78),rgba(7,10,20,0.92))] border-sky-100/14 shadow-[0_0_40px_rgba(96,165,250,0.10),0_28px_70px_rgba(0,0,0,0.34)]",
      overlayClass: "bg-[radial-gradient(circle_at_top,rgba(165,204,255,0.18),transparent_28%),linear-gradient(180deg,rgba(9,12,18,0.04),rgba(9,12,18,0.28)_48%,rgba(4,6,10,0.76))]",
      progressClass: "bg-gradient-to-r from-sky-100 via-blue-300 to-indigo-400",
      accentTextClass: "text-sky-100/84",
      badgeClass: "border-sky-100/14 bg-sky-100/8 text-sky-50/78",
      answerIdleClass: "border-sky-100/12 bg-[linear-gradient(180deg,rgba(14,22,38,0.84),rgba(9,12,22,0.92))]",
      answerHoverClass: "hover:border-sky-200/28 hover:bg-[linear-gradient(180deg,rgba(18,31,52,0.92),rgba(11,15,26,0.96))] hover:shadow-[0_0_22px_rgba(96,165,250,0.10)]",
      answerCorrectClass: "border-emerald-300/34 bg-[linear-gradient(180deg,rgba(18,48,34,0.96),rgba(11,28,20,0.98))] shadow-[0_0_28px_rgba(110,231,183,0.16)] scale-[1.01]",
      answerWrongClass: "border-rose-300/30 bg-[linear-gradient(180deg,rgba(62,18,22,0.96),rgba(32,11,14,0.98))] shadow-[0_0_24px_rgba(251,113,133,0.14)]",
      answerMutedClass: "border-white/10 bg-[linear-gradient(180deg,rgba(14,18,24,0.88),rgba(8,10,14,0.94))] opacity-55",
    } satisfies Omit<QuizMissionTheme, "missionTitle" | "missionAtmosphere" | "missionBrief">
  }

  if (wisdom.has(bookKey)) {
    return {
      campaignLabel: "Wisdom Campaign",
      worldLabel: "Celestial Silence",
      backgroundImage: CATEGORY_BACKGROUNDS.wisdom,
      backgroundPosition: "50% 38%",
      surfaceClass: "bg-[linear-gradient(180deg,rgba(18,14,34,0.78),rgba(8,7,18,0.92))] border-fuchsia-100/14 shadow-[0_0_40px_rgba(192,132,252,0.10),0_28px_70px_rgba(0,0,0,0.34)]",
      overlayClass: "bg-[radial-gradient(circle_at_top,rgba(216,204,255,0.20),transparent_28%),linear-gradient(180deg,rgba(11,9,18,0.04),rgba(11,9,18,0.28)_48%,rgba(5,4,10,0.76))]",
      progressClass: "bg-gradient-to-r from-fuchsia-100 via-violet-300 to-sky-300",
      accentTextClass: "text-fuchsia-100/84",
      badgeClass: "border-fuchsia-100/14 bg-fuchsia-100/8 text-fuchsia-50/78",
      answerIdleClass: "border-fuchsia-100/12 bg-[linear-gradient(180deg,rgba(22,17,38,0.84),rgba(10,9,20,0.92))]",
      answerHoverClass: "hover:border-fuchsia-200/28 hover:bg-[linear-gradient(180deg,rgba(28,21,48,0.92),rgba(14,11,26,0.96))] hover:shadow-[0_0_22px_rgba(192,132,252,0.10)]",
      answerCorrectClass: "border-emerald-300/34 bg-[linear-gradient(180deg,rgba(18,48,34,0.96),rgba(11,28,20,0.98))] shadow-[0_0_28px_rgba(110,231,183,0.16)] scale-[1.01]",
      answerWrongClass: "border-rose-300/30 bg-[linear-gradient(180deg,rgba(62,18,22,0.96),rgba(32,11,14,0.98))] shadow-[0_0_24px_rgba(251,113,133,0.14)]",
      answerMutedClass: "border-white/10 bg-[linear-gradient(180deg,rgba(16,14,22,0.88),rgba(8,8,12,0.94))] opacity-55",
    } satisfies Omit<QuizMissionTheme, "missionTitle" | "missionAtmosphere" | "missionBrief">
  }

  if (majorProphets.has(bookKey) || minorProphets.has(bookKey) || bookKey === "revelation") {
    const apocalyptic = bookKey === "revelation"
    return {
      campaignLabel: apocalyptic ? "Apocalyptic Campaign" : "Prophetic Campaign",
      worldLabel: apocalyptic ? "Revelation Storm" : "Prophetic Horizon",
      backgroundImage: apocalyptic ? CATEGORY_BACKGROUNDS.apocalyptic : CATEGORY_BACKGROUNDS.majorProphets,
      backgroundPosition: "50% 42%",
      surfaceClass: "bg-[linear-gradient(180deg,rgba(24,10,22,0.78),rgba(10,6,14,0.92))] border-rose-100/14 shadow-[0_0_40px_rgba(244,114,182,0.10),0_28px_70px_rgba(0,0,0,0.34)]",
      overlayClass: "bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.16),transparent_28%),linear-gradient(180deg,rgba(14,7,14,0.04),rgba(14,7,14,0.28)_48%,rgba(8,4,10,0.78))]",
      progressClass: "bg-gradient-to-r from-rose-100 via-fuchsia-300 to-orange-300",
      accentTextClass: "text-rose-100/84",
      badgeClass: "border-rose-100/14 bg-rose-100/8 text-rose-50/78",
      answerIdleClass: "border-rose-100/12 bg-[linear-gradient(180deg,rgba(26,11,22,0.84),rgba(12,8,16,0.92))]",
      answerHoverClass: "hover:border-rose-200/28 hover:bg-[linear-gradient(180deg,rgba(34,14,28,0.92),rgba(16,10,18,0.96))] hover:shadow-[0_0_22px_rgba(244,114,182,0.10)]",
      answerCorrectClass: "border-emerald-300/34 bg-[linear-gradient(180deg,rgba(18,48,34,0.96),rgba(11,28,20,0.98))] shadow-[0_0_28px_rgba(110,231,183,0.16)] scale-[1.01]",
      answerWrongClass: "border-rose-300/30 bg-[linear-gradient(180deg,rgba(62,18,22,0.96),rgba(32,11,14,0.98))] shadow-[0_0_24px_rgba(251,113,133,0.14)]",
      answerMutedClass: "border-white/10 bg-[linear-gradient(180deg,rgba(20,12,18,0.88),rgba(8,8,12,0.94))] opacity-55",
    } satisfies Omit<QuizMissionTheme, "missionTitle" | "missionAtmosphere" | "missionBrief">
  }

  if (gospels.has(bookKey) || bookKey === "acts") {
    return {
      campaignLabel: bookKey === "acts" ? "Acts Campaign" : "Gospel Campaign",
      worldLabel: bookKey === "acts" ? "Witness and Fire" : "Radiant Hope",
      backgroundImage: bookKey === "acts" ? CATEGORY_BACKGROUNDS.acts : CATEGORY_BACKGROUNDS.gospels,
      backgroundPosition: "50% 40%",
      surfaceClass: "bg-[linear-gradient(180deg,rgba(22,17,10,0.78),rgba(10,8,6,0.92))] border-yellow-100/14 shadow-[0_0_40px_rgba(253,224,71,0.10),0_28px_70px_rgba(0,0,0,0.34)]",
      overlayClass: "bg-[radial-gradient(circle_at_top,rgba(255,236,179,0.20),transparent_28%),linear-gradient(180deg,rgba(14,10,6,0.04),rgba(14,10,6,0.28)_48%,rgba(8,6,4,0.76))]",
      progressClass: "bg-gradient-to-r from-yellow-100 via-amber-300 to-orange-300",
      accentTextClass: "text-yellow-100/84",
      badgeClass: "border-yellow-100/14 bg-yellow-100/8 text-yellow-50/78",
      answerIdleClass: "border-yellow-100/12 bg-[linear-gradient(180deg,rgba(24,18,11,0.84),rgba(12,10,8,0.92))]",
      answerHoverClass: "hover:border-yellow-200/28 hover:bg-[linear-gradient(180deg,rgba(32,23,12,0.92),rgba(16,12,9,0.96))] hover:shadow-[0_0_22px_rgba(253,224,71,0.10)]",
      answerCorrectClass: "border-emerald-300/34 bg-[linear-gradient(180deg,rgba(18,48,34,0.96),rgba(11,28,20,0.98))] shadow-[0_0_28px_rgba(110,231,183,0.16)] scale-[1.01]",
      answerWrongClass: "border-rose-300/30 bg-[linear-gradient(180deg,rgba(62,18,22,0.96),rgba(32,11,14,0.98))] shadow-[0_0_24px_rgba(251,113,133,0.14)]",
      answerMutedClass: "border-white/10 bg-[linear-gradient(180deg,rgba(18,15,11,0.88),rgba(9,8,8,0.94))] opacity-55",
    } satisfies Omit<QuizMissionTheme, "missionTitle" | "missionAtmosphere" | "missionBrief">
  }

  if (pauline.has(bookKey) || general.has(bookKey)) {
    return {
      campaignLabel: pauline.has(bookKey) ? "Pauline Campaign" : "General Epistles Campaign",
      worldLabel: "Letters by Candlelight",
      backgroundImage: pauline.has(bookKey) ? CATEGORY_BACKGROUNDS.pauline : CATEGORY_BACKGROUNDS.general,
      backgroundPosition: "50% 44%",
      surfaceClass: "bg-[linear-gradient(180deg,rgba(12,18,28,0.78),rgba(7,10,16,0.92))] border-cyan-100/14 shadow-[0_0_40px_rgba(125,211,252,0.10),0_28px_70px_rgba(0,0,0,0.34)]",
      overlayClass: "bg-[radial-gradient(circle_at_top,rgba(186,230,253,0.18),transparent_28%),linear-gradient(180deg,rgba(10,12,16,0.04),rgba(10,12,16,0.28)_48%,rgba(6,7,10,0.76))]",
      progressClass: "bg-gradient-to-r from-cyan-100 via-sky-300 to-blue-400",
      accentTextClass: "text-cyan-100/84",
      badgeClass: "border-cyan-100/14 bg-cyan-100/8 text-cyan-50/78",
      answerIdleClass: "border-cyan-100/12 bg-[linear-gradient(180deg,rgba(16,22,32,0.84),rgba(9,12,18,0.92))]",
      answerHoverClass: "hover:border-cyan-200/28 hover:bg-[linear-gradient(180deg,rgba(20,30,42,0.92),rgba(11,14,20,0.96))] hover:shadow-[0_0_22px_rgba(125,211,252,0.10)]",
      answerCorrectClass: "border-emerald-300/34 bg-[linear-gradient(180deg,rgba(18,48,34,0.96),rgba(11,28,20,0.98))] shadow-[0_0_28px_rgba(110,231,183,0.16)] scale-[1.01]",
      answerWrongClass: "border-rose-300/30 bg-[linear-gradient(180deg,rgba(62,18,22,0.96),rgba(32,11,14,0.98))] shadow-[0_0_24px_rgba(251,113,133,0.14)]",
      answerMutedClass: "border-white/10 bg-[linear-gradient(180deg,rgba(14,18,22,0.88),rgba(8,10,14,0.94))] opacity-55",
    } satisfies Omit<QuizMissionTheme, "missionTitle" | "missionAtmosphere" | "missionBrief">
  }

  return {
    campaignLabel: "Bible Campaign",
    worldLabel: "Sacred Terrain",
    backgroundImage: CATEGORY_BACKGROUNDS.pentateuch,
    backgroundPosition: "50% 42%",
    surfaceClass: "bg-[linear-gradient(180deg,rgba(18,16,14,0.80),rgba(8,8,8,0.92))] border-white/12 shadow-[0_28px_70px_rgba(0,0,0,0.34)]",
    overlayClass: "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_28%),linear-gradient(180deg,rgba(10,10,10,0.04),rgba(10,10,10,0.28)_48%,rgba(5,5,5,0.78))]",
    progressClass: "bg-gradient-to-r from-stone-100 via-stone-300 to-zinc-400",
    accentTextClass: "text-stone-100/84",
    badgeClass: "border-stone-100/14 bg-stone-100/8 text-stone-50/78",
    answerIdleClass: "border-white/12 bg-[linear-gradient(180deg,rgba(20,18,16,0.84),rgba(10,10,9,0.92))]",
    answerHoverClass: "hover:border-white/20 hover:bg-[linear-gradient(180deg,rgba(28,24,20,0.92),rgba(12,11,10,0.96))]",
    answerCorrectClass: "border-emerald-300/34 bg-[linear-gradient(180deg,rgba(18,48,34,0.96),rgba(11,28,20,0.98))] shadow-[0_0_28px_rgba(110,231,183,0.16)] scale-[1.01]",
    answerWrongClass: "border-rose-300/30 bg-[linear-gradient(180deg,rgba(62,18,22,0.96),rgba(32,11,14,0.98))] shadow-[0_0_24px_rgba(251,113,133,0.14)]",
    answerMutedClass: "border-white/10 bg-[linear-gradient(180deg,rgba(16,16,16,0.88),rgba(9,9,9,0.94))] opacity-55",
  } satisfies Omit<QuizMissionTheme, "missionTitle" | "missionAtmosphere" | "missionBrief">
}

export function getQuizMissionTheme(segment: string): QuizMissionTheme {
  const bookKey = getBookKey(segment || "genesis-1-3")
  const bookLabel = getBookLabel(bookKey)
  const categoryTheme = getCategoryTheme(bookKey)
  const normalizedId = segment.replaceAll("-", "_")
  const genesisMeta = bookKey === "genesis" ? getGenesisMissionMeta(normalizedId) : null

  return {
    ...categoryTheme,
    missionTitle: genesisMeta?.title || `${bookLabel} Mission`,
    missionAtmosphere: genesisMeta?.atmosphere || categoryTheme.worldLabel,
    missionBrief:
      genesisMeta?.subtitle ||
      `Enter the next sacred mission in ${bookLabel} and move through the campaign with focus and clarity.`,
  }
}
