import { Link } from "react-router-dom"

import {
  BellRing,
  CheckCircle2,
  Clock3,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
} from "lucide-react"

function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              <ShieldCheck size={23} />
            </div>

            <span className="text-xl font-bold">
              PrepBuddy
            </span>
          </div>

          <div className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <a href="#features" className="hover:text-white">
              Features
            </a>

            <a href="#how-it-works" className="hover:text-white">
              How It Works
            </a>

            <a href="#about" className="hover:text-white">
              About
            </a>
          </div>

          <Link
          to="/login"
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium transition hover:border-blue-500 hover:bg-blue-500/10">
          Login
         </Link>

        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">

        <div className="absolute left-1/2 top-10 -z-0 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-28 text-center">

          <div className="mx-auto max-w-4xl">

            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400">
              <ShieldCheck size={16} />
              Intelligent Healthcare Preparation
            </div>

            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Prepare Better.
              <span className="block text-blue-500">
                Stay On Track.
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-400">
              PrepBuddy simplifies complex pre-procedure instructions
              into personalized reminders, confirmations, and intelligent
              preparation tracking.
            </p>

            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">

              <button className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 font-semibold hover:bg-blue-500">
                Get Started
                <ArrowRight
                  size={18}
                  className="transition group-hover:translate-x-1"
                />
              </button>

              <a
                href="#features"
                className="rounded-xl border border-slate-700 px-7 py-3.5 font-semibold text-slate-200 hover:bg-slate-900"
              >
                Explore Features
              </a>

            </div>

          </div>

          {/* Dashboard Preview */}
          <div className="mx-auto mt-20 max-w-5xl rounded-2xl border border-slate-800 bg-slate-900/80 p-3 shadow-2xl">

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">

              <div className="flex items-center justify-between border-b border-slate-800 pb-5">

                <div className="text-left">
                  <p className="text-sm text-slate-400">
                    Preparation Overview
                  </p>

                  <h3 className="mt-1 text-xl font-semibold">
                    Today's Patient Status
                  </h3>
                </div>

                <div className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-400">
                  84% Ready
                </div>

              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">

                <StatCard
                  icon={<CheckCircle2 size={20} />}
                  title="Ready"
                  value="72"
                  iconClass="bg-blue-500/10 text-blue-400"
                />

                <StatCard
                  icon={<Clock3 size={20} />}
                  title="At Risk"
                  value="18"
                  iconClass="bg-amber-500/10 text-amber-400"
                />

                <StatCard
                  icon={<BellRing size={20} />}
                  title="Alerts"
                  value="7"
                  iconClass="bg-red-500/10 text-red-400"
                />

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* Features */}
      <section
        id="features"
        className="border-t border-slate-800 bg-slate-900/40"
      >

        <div className="mx-auto max-w-7xl px-6 py-24">

          <div className="mx-auto max-w-2xl text-center">

            <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
              Features
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Everything needed for better preparation
            </h2>

            <p className="mt-4 text-slate-400">
              From personalized reminders to early preparation alerts,
              PrepBuddy keeps patients and clinic staff connected.
            </p>

          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

            <FeatureCard
              icon={<BellRing size={22} />}
              title="Smart Reminders"
              text="Personalized reminders based on procedure date and time."
            />

            <FeatureCard
              icon={<CheckCircle2 size={22} />}
              title="Step Confirmation"
              text="Patients can confirm important preparation milestones."
            />

            <FeatureCard
              icon={<Clock3 size={22} />}
              title="Early Alerts"
              text="Identify missed or unconfirmed preparation steps early."
            />

            <FeatureCard
              icon={<MessageCircle size={22} />}
              title="AI Assistant"
              text="Get answers based on approved preparation guidelines."
            />

          </div>

        </div>

      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-t border-slate-800">

        <div className="mx-auto max-w-7xl px-6 py-24">

          <div className="text-center">

            <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
              How It Works
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Preparation made simple
            </h2>

          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-4">

            <Step
              number="01"
              title="Select Protocol"
              text="Clinic selects the appropriate preparation protocol."
            />

            <Step
              number="02"
              title="Set Procedure"
              text="Patient procedure date and time are entered."
            />

            <Step
              number="03"
              title="Track Preparation"
              text="PrepBuddy sends reminders and tracks confirmations."
            />

            <Step
              number="04"
              title="Take Action"
              text="Clinic staff are alerted when critical steps are missed."
            />

          </div>

        </div>

      </section>

      {/* CTA */}
      <section id="about" className="border-t border-slate-800">

        <div className="mx-auto max-w-4xl px-6 py-24 text-center">

          <h2 className="text-3xl font-bold sm:text-4xl">
            Better preparation starts here.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-slate-400">
            PrepBuddy helps patients stay prepared and gives clinics
            visibility into preparation progress before procedures.
          </p>

          <button className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 font-semibold hover:bg-blue-500">
            Get Started
            <ArrowRight size={18} />
          </button>

        </div>

      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800">

        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">

          <p>
            © 2026 PrepBuddy AI.
          </p>

          <p>
            Intelligent Pre-Procedure Preparation Management System
          </p>

        </div>

      </footer>

    </div>
  )
}


/* Reusable Components */

function StatCard({ icon, title, value, iconClass }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

      <div className="flex items-center gap-3">

        <div className={`rounded-lg p-2 ${iconClass}`}>
          {icon}
        </div>

        <div className="text-left">

          <p className="text-sm text-slate-400">
            {title}
          </p>

          <p className="text-2xl font-bold">
            {value}
          </p>

        </div>

      </div>

    </div>
  )
}


function FeatureCard({ icon, title, text }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 transition hover:-translate-y-1 hover:border-blue-500/40">

      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
        {icon}
      </div>

      <h3 className="text-lg font-semibold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-slate-400">
        {text}
      </p>

    </div>
  )
}
function Step({ number, title, text }) {
  return (
    <div>

      <div className="text-4xl font-bold text-blue-500/40">
        {number}
      </div>

      <h3 className="mt-4 text-lg font-semibold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-slate-400">
        {text}
      </p>

    </div>
  )
}


export default Landing