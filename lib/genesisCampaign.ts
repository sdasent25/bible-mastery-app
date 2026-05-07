export type GenesisMissionMeta = {
  title: string
  subtitle: string
  atmosphere: string
}

const GENESIS_MISSION_META: Record<string, GenesisMissionMeta> = {
  genesis_1_3: {
    title: "In the Beginning",
    subtitle: "Creation light breaks over the void as the first mission opens.",
    atmosphere: "The Foundations of Creation",
  },
  genesis_4_6: {
    title: "The First Family",
    subtitle: "The beauty of Eden gives way to exile, labor, and the first bloodshed.",
    atmosphere: "The fracture of humanity",
  },
  genesis_7_9: {
    title: "Waters Above",
    subtitle: "Judgment and mercy meet as the flood remakes the world.",
    atmosphere: "Storm and covenant",
  },
  genesis_10_12: {
    title: "The Scattered Nations",
    subtitle: "Pride rises in Babel before the call of Abram begins a new line.",
    atmosphere: "Cities, tongues, and calling",
  },
  genesis_13_15: {
    title: "Promise Under the Stars",
    subtitle: "Abram walks by faith beneath a covenant sky.",
    atmosphere: "The promise widens",
  },
  genesis_16_18: {
    title: "Covenant Fire",
    subtitle: "Names are changed and promise grows clearer in the wilderness.",
    atmosphere: "Sacred visitation",
  },
  genesis_19_21: {
    title: "Ashes and Laughter",
    subtitle: "Judgment falls, yet the child of promise is born.",
    atmosphere: "Fire over the plain",
  },
  genesis_22_24: {
    title: "Upon the Mountain",
    subtitle: "A test of devotion leads to provision and lasting memory.",
    atmosphere: "Sacrifice and provision",
  },
  genesis_25_27: {
    title: "The Rival Sons",
    subtitle: "Inheritance, hunger, and blessing shape the next generation.",
    atmosphere: "Conflict in the house",
  },
  genesis_28_30: {
    title: "The Ladder and the Long Road",
    subtitle: "Jacob flees, dreams, and begins the slow work of becoming Israel.",
    atmosphere: "Exile and encounter",
  },
  genesis_31_33: {
    title: "The Night of Wrestling",
    subtitle: "Fear, return, and surrender mark the road home.",
    atmosphere: "Reunion at dawn",
  },
  genesis_34_36: {
    title: "Bloodlines and Brokenness",
    subtitle: "The family grows in number even while wounds deepen.",
    atmosphere: "The cost of inheritance",
  },
  genesis_37_39: {
    title: "The Dreamer Sold",
    subtitle: "Joseph descends into betrayal, slavery, and hidden favor.",
    atmosphere: "The coat and the pit",
  },
  genesis_40_42: {
    title: "The Prison of Waiting",
    subtitle: "Dreams return as God prepares a rise through confinement.",
    atmosphere: "Silence before ascent",
  },
  genesis_43_46: {
    title: "Bread in Egypt",
    subtitle: "Provision, testing, and revelation gather the family again.",
    atmosphere: "Reckoning and mercy",
  },
  genesis_47_50: {
    title: "The End of Beginnings",
    subtitle: "Blessing, burial, and promise close the first great book.",
    atmosphere: "Inheritance remembered",
  },
}

export function normalizeSegmentId(id: string) {
  return id.replaceAll("_", "-")
}

export function getGenesisMissionMeta(segmentId: string): GenesisMissionMeta {
  return (
    GENESIS_MISSION_META[segmentId] || {
      title: segmentId,
      subtitle:
        "Continue through Genesis and deepen your mastery of the next sacred passage.",
      atmosphere: "Sacred mission",
    }
  )
}

export function getGenesisMissionArt(segmentId: string) {
  if (segmentId.includes("1_3") || segmentId.includes("1-3")) return "/icons/genesis/creation.png"
  if (segmentId.includes("4_6") || segmentId.includes("4-6")) return "/icons/genesis/people.png"
  if (segmentId.includes("7_9") || segmentId.includes("7-9")) return "/icons/genesis/flood.png"
  if (segmentId.includes("10_12") || segmentId.includes("10-12")) return "/icons/genesis/tower.png"
  if (segmentId.includes("13_15") || segmentId.includes("13-15")) return "/icons/genesis/promise.png"
  if (segmentId.includes("16_18") || segmentId.includes("16-18")) return "/icons/genesis/covenant.png"
  if (segmentId.includes("19_21") || segmentId.includes("19-21")) return "/icons/genesis/fire.png"
  if (segmentId.includes("22_24") || segmentId.includes("22-24")) return "/icons/genesis/sacrifice.png"
  if (segmentId.includes("25_27") || segmentId.includes("25-27")) return "/icons/genesis/twins.png"
  if (segmentId.includes("28_30") || segmentId.includes("28-30")) return "/icons/genesis/ladder.png"
  if (segmentId.includes("31_33") || segmentId.includes("31-33")) return "/icons/genesis/reunion.png"
  if (segmentId.includes("34_36") || segmentId.includes("34-36")) return "/icons/genesis/conflict.png"
  if (segmentId.includes("37_39") || segmentId.includes("37-39")) return "/icons/genesis/coat.png"
  if (segmentId.includes("40_42") || segmentId.includes("40-42")) return "/icons/genesis/prison.png"
  if (segmentId.includes("43_46") || segmentId.includes("43-46")) return "/icons/genesis/provision.png"
  if (segmentId.includes("47_50") || segmentId.includes("47-50")) return "/icons/genesis/egypt.png"

  return "/explorer/pentateuch/region.png"
}
