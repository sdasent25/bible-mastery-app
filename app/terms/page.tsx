export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-10 text-black">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Terms of Service – Bible Athlete</h1>
          <p className="text-sm text-black/80">Last updated: March 23, 2026</p>
        </header>

        <section className="space-y-2">
          <p className="leading-relaxed">
            Bible Athlete is a scripture-focused learning platform designed to help you master Bible knowledge through
            engaging quizzes and study tools. By using Bible Athlete, you agree to these terms.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Use of Service</h2>
          <p className="leading-relaxed">
            Bible Athlete is provided for educational and personal study purposes. We aim to offer a helpful learning
            experience, but we do not guarantee uninterrupted availability, specific outcomes, or error-free content.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Accounts</h2>
          <p className="leading-relaxed">
            You are responsible for maintaining the security of your account credentials and login activity. Please use a
            strong password and notify us if you suspect unauthorized access.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Payments</h2>
          <p className="leading-relaxed">
            Paid subscriptions are processed through Stripe. Billing, payment method handling, and related payment
            processing are managed by Stripe under their terms and policies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Content Disclaimer</h2>
          <p className="leading-relaxed">
            App content is based on Bible references and study material. It is intended as a learning aid and should not
            be treated as final theological authority or professional religious counsel.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Limitation of Liability</h2>
          <p className="leading-relaxed">
            To the maximum extent allowed by law, Bible Athlete and its operators are not liable for indirect,
            incidental, or consequential damages related to your use of the service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Contact</h2>
          <p className="leading-relaxed">
            Questions about Bible Athlete's terms? Contact us at <a className="underline" href="mailto:support@biblemastery.app">support@biblemastery.app</a>.
          </p>
        </section>
      </div>
    </main>
  );
}
