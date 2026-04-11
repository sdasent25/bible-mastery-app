"use client"

export default function TestCheckout() {
  const handleCheckout = async () => {
    console.log("CLICKED")

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ plan: "pro_plus" }),
    })

    console.log("STATUS:", res.status)

    const data = await res.json()
    console.log("DATA:", data)

    if (data.url) {
      window.location.href = data.url
    } else {
      alert("No URL returned")
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Test Checkout</h1>

      <button
        onClick={handleCheckout}
        style={{
          padding: 20,
          background: "green",
          color: "white",
          fontSize: 18,
        }}
      >
        TEST CHECKOUT
      </button>
    </div>
  )
}
