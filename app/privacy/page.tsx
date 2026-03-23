export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-10 text-black">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy – Bible Athlete</h1>
          <p className="text-sm text-black/80">Last updated: March 23, 2026</p>
        </header>

        <section className="space-y-2">
          <p className="leading-relaxed">
            At Bible Athlete, protecting your privacy is important to us. This policy explains how we collect, use,
            and safeguard your data when you use our platform.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Data Collected</h2>
          <p className="leading-relaxed">
            We collect account information such as your email address and usage data needed to run Bible Athlete, including
            progress details like XP and streak activity.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">How Data Is Used</h2>
          <p className="leading-relaxed">
            We use data to operate core features, personalize your learning experience, and improve product quality and
            reliability.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Payments</h2>
          <p className="leading-relaxed">
            Payments are processed by Stripe. We do not store full card details on our servers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Data Storage</h2>
          <p className="leading-relaxed">
            Application data is stored using Supabase infrastructure and related services needed to provide the app.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">User Rights</h2>
          <p className="leading-relaxed">
            You may request deletion of your account and associated data by contacting us.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Contact</h2>
          <p className="leading-relaxed">
            For privacy questions about Bible Athlete or data deletion requests, contact <a className="underline" href="mailto:privacy@biblemastery.app">privacy@biblemastery.app</a>.
          </p>
        </section>
      </div>
    </main>
  );
}
