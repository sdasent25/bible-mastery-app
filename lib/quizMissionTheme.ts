import { getGenesisMissionMeta } from "@/lib/genesisCampaign"

type QuizMissionTheme = {
  bookLabel: string
  campaignLabel: string
  worldLabel: string
  missionTitle: string
  missionAtmosphere: string
  missionBrief: string
  backgroundImage: string
  backgroundVideo?: string
  backgroundPosition: string
  backgroundFallbackPosition: string
  surfaceClass: string
  overlayClass: string
  progressClass: string
  accentTextClass: string
  badgeClass: string
  hudClass: string
  answerShellClass: string
  answerIdleClass: string
  answerHoverClass: string
  answerCorrectClass: string
  answerWrongClass: string
  answerMutedClass: string
}

type QuizMissionThemeBase = Omit<
  QuizMissionTheme,
  "bookLabel" | "missionTitle" | "missionAtmosphere" | "missionBrief"
>

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
      backgroundVideo: "/animations/genesis/creation.mp4",
      backgroundPosition: "50% 42%",
      backgroundFallbackPosition: "50% 42%",
      surfaceClass: "bg-[linear-gradient(180deg,rgba(26,18,8,0.78),rgba(10,8,6,0.92))] border-amber-100/14 shadow-[0_0_40px_rgba(251,191,36,0.10),0_28px_70px_rgba(0,0,0,0.34)]",
      overlayClass: "bg-[radial-gradient(circle_at_top,rgba(247,217,138,0.20),transparent_30%),radial-gradient(circle_at_50%_18%,rgba(255,246,215,0.12),transparent_24%),linear-gradient(180deg,rgba(6,5,4,0.14),rgba(8,7,5,0.38)_48%,rgba(4,3,2,0.84))]",
      progressClass: "bg-gradient-to-r from-[#f6e5af] via-[#efcb6a] to-[#dd9f45]",
      accentTextClass: "text-amber-100/84",
      badgeClass: "border-amber-100/14 bg-amber-100/8 text-amber-50/78",
      hudClass: "border-amber-100/12 bg-[linear-gradient(180deg,rgba(17,13,9,0.42),rgba(7,6,5,0.68))] shadow-[0_14px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl",
      answerShellClass: "border-amber-200/10 bg-[linear-gradient(180deg,rgba(18,14,10,0.78),rgba(8,6,5,0.9))] shadow-[inset_0_1px_0_rgba(255,235,186,0.08),0_18px_40px_rgba(0,0,0,0.22)]",
      answerIdleClass: "border-amber-200/12 bg-[linear-gradient(180deg,rgba(30,22,14,0.86),rgba(14,10,8,0.96))]",
      answerHoverClass: "hover:border-amber-200/34 hover:bg-[linear-gradient(180deg,rgba(39,28,15,0.94),rgba(18,13,9,0.98))] hover:shadow-[inset_0_1px_0_rgba(255,236,189,0.16),0_0_30px_rgba(251,191,36,0.10)]",
      answerCorrectClass: "border-emerald-200/52 bg-[linear-gradient(180deg,rgba(23,74,52,0.98),rgba(10,32,22,0.99))] shadow-[inset_0_1px_0_rgba(236,253,245,0.24),0_0_34px_rgba(16,185,129,0.22)] scale-[1.015]",
      answerWrongClass: "border-rose-200/54 bg-[linear-gradient(180deg,rgba(88,22,30,0.98),rgba(40,12,16,0.99))] shadow-[inset_0_1px_0_rgba(255,228,230,0.16),0_0_30px_rgba(244,63,94,0.22)]",
      answerMutedClass: "border-white/12 bg-[linear-gradient(180deg,rgba(18,16,14,0.92),rgba(10,9,8,0.97))] opacity-70",
    } satisfies QuizMissionThemeBase
  }

  if (historical.has(bookKey)) {
    return {
      campaignLabel: "Historical Campaign",
      worldLabel: "Kingdom Roads",
      backgroundImage: CATEGORY_BACKGROUNDS.historical,
      backgroundPosition: "50% 45%",
      backgroundFallbackPosition: "50% 45%",
      surfaceClass: "bg-[linear-gradient(180deg,rgba(10,18,32,0.78),rgba(7,10,20,0.92))] border-sky-100/14 shadow-[0_0_40px_rgba(96,165,250,0.10),0_28px_70px_rgba(0,0,0,0.34)]",
      overlayClass: "bg-[radial-gradient(circle_at_top,rgba(219,180,110,0.14),transparent_30%),linear-gradient(180deg,rgba(8,11,16,0.14),rgba(8,10,14,0.34)_48%,rgba(3,4,7,0.84))]",
      progressClass: "bg-gradient-to-r from-[#ede0c0] via-[#d4ad73] to-[#8b5d36]",
      accentTextClass: "text-stone-100/84",
      badgeClass: "border-stone-100/14 bg-stone-100/8 text-stone-50/78",
      hudClass: "border-stone-100/12 bg-[linear-gradient(180deg,rgba(11,14,20,0.42),rgba(5,6,10,0.7))] shadow-[0_14px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl",
      answerShellClass: "border-[#d4ad73]/10 bg-[linear-gradient(180deg,rgba(14,18,24,0.8),rgba(8,9,14,0.92))] shadow-[inset_0_1px_0_rgba(240,225,198,0.08),0_18px_40px_rgba(0,0,0,0.22)]",
      answerIdleClass: "border-[#d4ad73]/14 bg-[linear-gradient(180deg,rgba(18,24,32,0.88),rgba(10,12,18,0.97))]",
      answerHoverClass: "hover:border-[#e2c38d]/34 hover:bg-[linear-gradient(180deg,rgba(23,30,39,0.94),rgba(12,15,21,0.98))] hover:shadow-[inset_0_1px_0_rgba(245,229,205,0.14),0_0_30px_rgba(212,173,115,0.10)]",
      answerCorrectClass: "border-emerald-200/52 bg-[linear-gradient(180deg,rgba(23,74,52,0.98),rgba(10,32,22,0.99))] shadow-[inset_0_1px_0_rgba(236,253,245,0.24),0_0_34px_rgba(16,185,129,0.22)] scale-[1.015]",
      answerWrongClass: "border-rose-200/54 bg-[linear-gradient(180deg,rgba(88,22,30,0.98),rgba(40,12,16,0.99))] shadow-[inset_0_1px_0_rgba(255,228,230,0.16),0_0_30px_rgba(244,63,94,0.22)]",
      answerMutedClass: "border-white/12 bg-[linear-gradient(180deg,rgba(14,18,24,0.92),rgba(8,10,14,0.97))] opacity-70",
    } satisfies QuizMissionThemeBase
  }

  if (wisdom.has(bookKey)) {
    return {
      campaignLabel: "Wisdom Campaign",
      worldLabel: "Celestial Silence",
      backgroundImage: CATEGORY_BACKGROUNDS.wisdom,
      backgroundPosition: "50% 38%",
      backgroundFallbackPosition: "50% 38%",
      surfaceClass: "bg-[linear-gradient(180deg,rgba(18,14,34,0.78),rgba(8,7,18,0.92))] border-fuchsia-100/14 shadow-[0_0_40px_rgba(192,132,252,0.10),0_28px_70px_rgba(0,0,0,0.34)]",
      overlayClass: "bg-[radial-gradient(circle_at_top,rgba(220,179,121,0.12),transparent_30%),linear-gradient(180deg,rgba(10,9,16,0.12),rgba(10,8,16,0.34)_48%,rgba(5,4,10,0.86))]",
      progressClass: "bg-gradient-to-r from-[#f0e1c1] via-[#c19a6b] to-[#8a6538]",
      accentTextClass: "text-stone-100/84",
      badgeClass: "border-stone-100/14 bg-stone-100/8 text-stone-50/78",
      hudClass: "border-stone-100/12 bg-[linear-gradient(180deg,rgba(14,11,22,0.44),rgba(7,6,12,0.7))] shadow-[0_14px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl",
      answerShellClass: "border-[#c19a6b]/10 bg-[linear-gradient(180deg,rgba(18,15,28,0.8),rgba(8,7,16,0.92))] shadow-[inset_0_1px_0_rgba(240,225,198,0.08),0_18px_40px_rgba(0,0,0,0.22)]",
      answerIdleClass: "border-[#c19a6b]/14 bg-[linear-gradient(180deg,rgba(24,19,37,0.88),rgba(11,10,22,0.97))]",
      answerHoverClass: "hover:border-[#e1c38f]/34 hover:bg-[linear-gradient(180deg,rgba(31,24,46,0.94),rgba(14,11,26,0.98))] hover:shadow-[inset_0_1px_0_rgba(245,229,205,0.14),0_0_30px_rgba(193,154,107,0.10)]",
      answerCorrectClass: "border-emerald-200/52 bg-[linear-gradient(180deg,rgba(23,74,52,0.98),rgba(10,32,22,0.99))] shadow-[inset_0_1px_0_rgba(236,253,245,0.24),0_0_34px_rgba(16,185,129,0.22)] scale-[1.015]",
      answerWrongClass: "border-rose-200/54 bg-[linear-gradient(180deg,rgba(88,22,30,0.98),rgba(40,12,16,0.99))] shadow-[inset_0_1px_0_rgba(255,228,230,0.16),0_0_30px_rgba(244,63,94,0.22)]",
      answerMutedClass: "border-white/12 bg-[linear-gradient(180deg,rgba(16,14,22,0.92),rgba(8,8,12,0.97))] opacity-70",
    } satisfies QuizMissionThemeBase
  }

  if (majorProphets.has(bookKey) || minorProphets.has(bookKey) || bookKey === "revelation") {
    const apocalyptic = bookKey === "revelation"
    return {
      campaignLabel: apocalyptic ? "Apocalyptic Campaign" : "Prophetic Campaign",
      worldLabel: apocalyptic ? "Revelation Storm" : "Prophetic Horizon",
      backgroundImage: apocalyptic ? CATEGORY_BACKGROUNDS.apocalyptic : CATEGORY_BACKGROUNDS.majorProphets,
      backgroundPosition: "50% 42%",
      backgroundFallbackPosition: "50% 42%",
      surfaceClass: "bg-[linear-gradient(180deg,rgba(24,10,22,0.78),rgba(10,6,14,0.92))] border-rose-100/14 shadow-[0_0_40px_rgba(244,114,182,0.10),0_28px_70px_rgba(0,0,0,0.34)]",
      overlayClass: "bg-[radial-gradient(circle_at_top,rgba(215,176,114,0.14),transparent_30%),linear-gradient(180deg,rgba(12,7,12,0.14),rgba(12,7,12,0.34)_48%,rgba(8,4,10,0.86))]",
      progressClass: "bg-gradient-to-r from-[#f0e1c1] via-[#cda56f] to-[#8d5f38]",
      accentTextClass: "text-stone-100/84",
      badgeClass: "border-stone-100/14 bg-stone-100/8 text-stone-50/78",
      hudClass: "border-stone-100/12 bg-[linear-gradient(180deg,rgba(18,10,18,0.44),rgba(8,5,11,0.7))] shadow-[0_14px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl",
      answerShellClass: "border-[#cda56f]/10 bg-[linear-gradient(180deg,rgba(20,11,19,0.8),rgba(10,7,14,0.92))] shadow-[inset_0_1px_0_rgba(240,225,198,0.08),0_18px_40px_rgba(0,0,0,0.22)]",
      answerIdleClass: "border-[#cda56f]/14 bg-[linear-gradient(180deg,rgba(28,13,23,0.88),rgba(13,9,17,0.97))]",
      answerHoverClass: "hover:border-[#e5c797]/34 hover:bg-[linear-gradient(180deg,rgba(35,16,28,0.94),rgba(17,10,19,0.98))] hover:shadow-[inset_0_1px_0_rgba(245,229,205,0.14),0_0_30px_rgba(205,165,111,0.10)]",
      answerCorrectClass: "border-emerald-200/52 bg-[linear-gradient(180deg,rgba(23,74,52,0.98),rgba(10,32,22,0.99))] shadow-[inset_0_1px_0_rgba(236,253,245,0.24),0_0_34px_rgba(16,185,129,0.22)] scale-[1.015]",
      answerWrongClass: "border-rose-200/54 bg-[linear-gradient(180deg,rgba(88,22,30,0.98),rgba(40,12,16,0.99))] shadow-[inset_0_1px_0_rgba(255,228,230,0.16),0_0_30px_rgba(244,63,94,0.22)]",
      answerMutedClass: "border-white/12 bg-[linear-gradient(180deg,rgba(20,12,18,0.92),rgba(8,8,12,0.97))] opacity-70",
    } satisfies QuizMissionThemeBase
  }

  if (gospels.has(bookKey) || bookKey === "acts") {
    return {
      campaignLabel: bookKey === "acts" ? "Acts Campaign" : "Gospel Campaign",
      worldLabel: bookKey === "acts" ? "Witness and Fire" : "Radiant Hope",
      backgroundImage: bookKey === "acts" ? CATEGORY_BACKGROUNDS.acts : CATEGORY_BACKGROUNDS.gospels,
      backgroundPosition: "50% 40%",
      backgroundFallbackPosition: "50% 40%",
      surfaceClass: "bg-[linear-gradient(180deg,rgba(22,17,10,0.78),rgba(10,8,6,0.92))] border-yellow-100/14 shadow-[0_0_40px_rgba(253,224,71,0.10),0_28px_70px_rgba(0,0,0,0.34)]",
      overlayClass: "bg-[radial-gradient(circle_at_top,rgba(246,214,137,0.18),transparent_30%),linear-gradient(180deg,rgba(12,9,6,0.14),rgba(12,9,6,0.34)_48%,rgba(8,6,4,0.84))]",
      progressClass: "bg-gradient-to-r from-[#f2e6c8] via-[#d7af76] to-[#8b623b]",
      accentTextClass: "text-stone-100/84",
      badgeClass: "border-stone-100/14 bg-stone-100/8 text-stone-50/78",
      hudClass: "border-stone-100/12 bg-[linear-gradient(180deg,rgba(18,13,8,0.44),rgba(8,6,5,0.7))] shadow-[0_14px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl",
      answerShellClass: "border-[#d7af76]/10 bg-[linear-gradient(180deg,rgba(20,15,10,0.8),rgba(10,8,6,0.92))] shadow-[inset_0_1px_0_rgba(240,225,198,0.08),0_18px_40px_rgba(0,0,0,0.22)]",
      answerIdleClass: "border-[#d7af76]/14 bg-[linear-gradient(180deg,rgba(28,21,14,0.88),rgba(13,10,8,0.97))]",
      answerHoverClass: "hover:border-[#ecd29d]/34 hover:bg-[linear-gradient(180deg,rgba(35,26,15,0.94),rgba(17,12,9,0.98))] hover:shadow-[inset_0_1px_0_rgba(245,229,205,0.14),0_0_30px_rgba(215,175,118,0.10)]",
      answerCorrectClass: "border-emerald-200/52 bg-[linear-gradient(180deg,rgba(23,74,52,0.98),rgba(10,32,22,0.99))] shadow-[inset_0_1px_0_rgba(236,253,245,0.24),0_0_34px_rgba(16,185,129,0.22)] scale-[1.015]",
      answerWrongClass: "border-rose-200/54 bg-[linear-gradient(180deg,rgba(88,22,30,0.98),rgba(40,12,16,0.99))] shadow-[inset_0_1px_0_rgba(255,228,230,0.16),0_0_30px_rgba(244,63,94,0.22)]",
      answerMutedClass: "border-white/12 bg-[linear-gradient(180deg,rgba(18,15,11,0.92),rgba(9,8,8,0.97))] opacity-70",
    } satisfies QuizMissionThemeBase
  }

  if (pauline.has(bookKey) || general.has(bookKey)) {
    return {
      campaignLabel: pauline.has(bookKey) ? "Pauline Campaign" : "General Epistles Campaign",
      worldLabel: "Letters by Candlelight",
      backgroundImage: pauline.has(bookKey) ? CATEGORY_BACKGROUNDS.pauline : CATEGORY_BACKGROUNDS.general,
      backgroundPosition: "50% 44%",
      backgroundFallbackPosition: "50% 44%",
      surfaceClass: "bg-[linear-gradient(180deg,rgba(12,18,28,0.78),rgba(7,10,16,0.92))] border-cyan-100/14 shadow-[0_0_40px_rgba(125,211,252,0.10),0_28px_70px_rgba(0,0,0,0.34)]",
      overlayClass: "bg-[radial-gradient(circle_at_top,rgba(217,178,113,0.12),transparent_30%),linear-gradient(180deg,rgba(8,10,14,0.14),rgba(8,10,14,0.34)_48%,rgba(5,6,10,0.84))]",
      progressClass: "bg-gradient-to-r from-[#f0e1c1] via-[#d4ad73] to-[#8b5d36]",
      accentTextClass: "text-stone-100/84",
      badgeClass: "border-stone-100/14 bg-stone-100/8 text-stone-50/78",
      hudClass: "border-stone-100/12 bg-[linear-gradient(180deg,rgba(11,14,19,0.44),rgba(5,7,10,0.7))] shadow-[0_14px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl",
      answerShellClass: "border-[#d4ad73]/10 bg-[linear-gradient(180deg,rgba(15,18,24,0.8),rgba(8,10,15,0.92))] shadow-[inset_0_1px_0_rgba(240,225,198,0.08),0_18px_40px_rgba(0,0,0,0.22)]",
      answerIdleClass: "border-[#d4ad73]/14 bg-[linear-gradient(180deg,rgba(18,23,30,0.88),rgba(10,12,18,0.97))]",
      answerHoverClass: "hover:border-[#e2c38d]/34 hover:bg-[linear-gradient(180deg,rgba(22,28,36,0.94),rgba(12,15,21,0.98))] hover:shadow-[inset_0_1px_0_rgba(245,229,205,0.14),0_0_30px_rgba(212,173,115,0.10)]",
      answerCorrectClass: "border-emerald-200/52 bg-[linear-gradient(180deg,rgba(23,74,52,0.98),rgba(10,32,22,0.99))] shadow-[inset_0_1px_0_rgba(236,253,245,0.24),0_0_34px_rgba(16,185,129,0.22)] scale-[1.015]",
      answerWrongClass: "border-rose-200/54 bg-[linear-gradient(180deg,rgba(88,22,30,0.98),rgba(40,12,16,0.99))] shadow-[inset_0_1px_0_rgba(255,228,230,0.16),0_0_30px_rgba(244,63,94,0.22)]",
      answerMutedClass: "border-white/12 bg-[linear-gradient(180deg,rgba(14,18,22,0.92),rgba(8,10,14,0.97))] opacity-70",
    } satisfies QuizMissionThemeBase
  }

  return {
    campaignLabel: "Bible Campaign",
    worldLabel: "Sacred Terrain",
    backgroundImage: CATEGORY_BACKGROUNDS.pentateuch,
    backgroundPosition: "50% 42%",
    backgroundFallbackPosition: "50% 42%",
    surfaceClass: "bg-[linear-gradient(180deg,rgba(18,16,14,0.80),rgba(8,8,8,0.92))] border-white/12 shadow-[0_28px_70px_rgba(0,0,0,0.34)]",
    overlayClass: "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_28%),linear-gradient(180deg,rgba(10,10,10,0.04),rgba(10,10,10,0.28)_48%,rgba(5,5,5,0.78))]",
    progressClass: "bg-gradient-to-r from-stone-100 via-stone-300 to-zinc-400",
    accentTextClass: "text-stone-100/84",
    badgeClass: "border-stone-100/14 bg-stone-100/8 text-stone-50/78",
    hudClass: "border-stone-100/12 bg-[linear-gradient(180deg,rgba(18,16,14,0.44),rgba(8,8,8,0.7))] shadow-[0_14px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl",
    answerShellClass: "border-stone-200/10 bg-[linear-gradient(180deg,rgba(20,18,16,0.8),rgba(10,10,9,0.92))] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_18px_40px_rgba(0,0,0,0.22)]",
    answerIdleClass: "border-white/12 bg-[linear-gradient(180deg,rgba(20,18,16,0.84),rgba(10,10,9,0.92))]",
    answerHoverClass: "hover:border-white/20 hover:bg-[linear-gradient(180deg,rgba(28,24,20,0.92),rgba(12,11,10,0.96))]",
    answerCorrectClass: "border-emerald-200/52 bg-[linear-gradient(180deg,rgba(23,74,52,0.98),rgba(10,32,22,0.99))] shadow-[inset_0_1px_0_rgba(236,253,245,0.24),0_0_34px_rgba(16,185,129,0.22)] scale-[1.015]",
    answerWrongClass: "border-rose-200/54 bg-[linear-gradient(180deg,rgba(88,22,30,0.98),rgba(40,12,16,0.99))] shadow-[inset_0_1px_0_rgba(255,228,230,0.16),0_0_30px_rgba(244,63,94,0.22)]",
    answerMutedClass: "border-white/12 bg-[linear-gradient(180deg,rgba(16,16,16,0.92),rgba(9,9,9,0.97))] opacity-70",
  } satisfies QuizMissionThemeBase
}

export function getQuizMissionTheme(segment: string): QuizMissionTheme {
  const bookKey = getBookKey(segment || "genesis-1-3")
  const bookLabel = getBookLabel(bookKey)
  const categoryTheme = getCategoryTheme(bookKey)
  const normalizedId = segment.replaceAll("-", "_")
  const genesisMeta = bookKey === "genesis" ? getGenesisMissionMeta(normalizedId) : null

  return {
    ...categoryTheme,
    bookLabel,
    missionTitle: genesisMeta?.title || `${bookLabel} Mission`,
    missionAtmosphere: genesisMeta?.atmosphere || categoryTheme.worldLabel,
    missionBrief:
      genesisMeta?.subtitle ||
      `Enter the next sacred mission in ${bookLabel} and move through the campaign with focus and clarity.`,
  }
}
