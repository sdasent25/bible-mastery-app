"use client"

import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"

export default function SegmentIntro() {
  const params = useSearchParams()
  const router = useRouter()

  const segment = params.get("segment") || ""
  const program = params.get("program") || "genesis"

  function formatSegment(segment: string) {
    const parts = segment.split("-")
    const book = parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
    return `${book} ${parts[1]}-${parts[2]}`
  }

  function getImage(currentSegment: string) {
    if (currentSegment.includes("1-3")) return "creation.png"
    if (currentSegment.includes("4-6")) return "people.png"
    if (currentSegment.includes("7-9")) return "flood.png"
    if (currentSegment.includes("10-12")) return "tower.png"
    if (currentSegment.includes("13-15")) return "promise.png"
    if (currentSegment.includes("16-18")) return "covenant.png"
    if (currentSegment.includes("19-21")) return "fire.png"
    if (currentSegment.includes("22-24")) return "sacrifice.png"
    if (currentSegment.includes("25-27")) return "twins.png"
    if (currentSegment.includes("28-30")) return "ladder.png"
    if (currentSegment.includes("31-33")) return "reunion.png"
    if (currentSegment.includes("34-36")) return "conflict.png"
    if (currentSegment.includes("37-39")) return "coat.png"
    if (currentSegment.includes("40-42")) return "prison.png"
    if (currentSegment.includes("43-46")) return "provision.png"
    if (currentSegment.includes("47-50")) return "egypt.png"

    return "creation.png"
  }

  const imageName = getImage(segment)

  return (
    <div className="min-h-screen bg-[#0B1220] text-white flex flex-col">
      <button
        onClick={() => router.push("/journey")}
        className="absolute top-4 left-4 z-50 text-white text-2xl font-bold bg-black/40 px-3 py-1 rounded-lg backdrop-blur"
      >
        ✕
      </button>

      <div className="w-full flex-1 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md h-[70vh] rounded-2xl overflow-hidden shadow-2xl">
          {imageName === "creation.png" ? (
            <video
              src="/animations/genesis/creation.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              onError={(e) => console.log("Video failed to load")}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <Image
              src={`/icons/genesis/${imageName}`}
              alt="segment"
              fill
              className="object-cover"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <div className="absolute bottom-6 left-4 right-4 text-center">
            <h1 className="text-2xl font-bold mb-2">
              {formatSegment(segment)}
            </h1>
            <p className="text-sm text-slate-300">
              Read and understand this passage before testing your knowledge
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <a
          href={`https://www.biblegateway.com/passage/?search=${segment.replace("-", "%20")}`}
          target="_blank"
          rel="noreferrer"
          className="block w-full text-center bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-semibold"
        >
          Read Scripture
        </a>

        <button
          onClick={() =>
            router.push(`/quiz?program=${program}&segment=${segment}`)
          }
          className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold text-lg"
        >
          Continue →
        </button>
      </div>
    </div>
  )
}
