"use client"

export default function Paywall({
  title,
  message,
}: {
  title: string
  message: string
}) {
  return (
    <div
      style={{
        padding: 40,
        textAlign: "center",
        maxWidth: 500,
        margin: "0 auto",
      }}
    >
      <h1>{title}</h1>

      <p style={{ marginTop: 10 }}>{message}</p>

      <a
        href="/pricing"
        style={{
          marginTop: 20,
          display: "inline-block",
          padding: 15,
          background: "gold",
          color: "black",
          fontWeight: "bold",
          borderRadius: 8,
        }}
      >
        Upgrade Now
      </a>
    </div>
  )
}
