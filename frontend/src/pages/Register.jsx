import { Link } from "react-router-dom"
import {
  ShieldCheck,
  ArrowLeft,
  User,
  Mail,
  Lock,
  Building2,
} from "lucide-react"
import { useState } from "react"

function Register() {
  const [role, setRole] = useState("patient")

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center px-6 py-5">

          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              <ShieldCheck size={22} />
            </div>

            <span className="text-xl font-bold">
              PrepBuddy
            </span>
          </Link>

        </div>
      </header>

      {/* Register Section */}
      <main className="flex min-h-[calc(100vh-81px)] items-center justify-center px-6 py-12">

        <div className="w-full max-w-md">

          {/* Back */}
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>

          {/* Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl">

            {/* Heading */}
            <div className="mb-7 text-center">

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                <ShieldCheck size={28} />
              </div>

              <h1 className="text-3xl font-bold">
                Create Account
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Join PrepBuddy to manage procedure preparation
              </p>

            </div>

            {/* Role Selection */}
            <div className="mb-6">

              <label className="mb-3 block text-sm font-medium text-slate-300">
                I am registering as
              </label>

              <div className="grid grid-cols-2 gap-3">

                {/* Patient */}
                <button
                  type="button"
                  onClick={() => setRole("patient")}
                  className={`rounded-xl border p-4 text-left transition ${
                    role === "patient"
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-slate-700 bg-slate-950 hover:border-slate-600"
                  }`}
                >

                  <User
                    size={22}
                    className={
                      role === "patient"
                        ? "text-blue-400"
                        : "text-slate-500"
                    }
                  />

                  <p className="mt-2 font-semibold">
                    Patient
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Manage your preparation
                  </p>

                </button>

                {/* Clinic Staff */}
                <button
                  type="button"
                  onClick={() => setRole("clinic")}
                  className={`rounded-xl border p-4 text-left transition ${
                    role === "clinic"
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-slate-700 bg-slate-950 hover:border-slate-600"
                  }`}
                >

                  <Building2
                    size={22}
                    className={
                      role === "clinic"
                        ? "text-blue-400"
                        : "text-slate-500"
                    }
                  />

                  <p className="mt-2 font-semibold">
                    Clinic Staff
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Monitor patient preparation
                  </p>

                </button>

              </div>

            </div>

            {/* Form */}
            <form className="space-y-5">

              {/* Full Name */}
              <div>

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Full Name
                </label>

                <div className="relative">

                  <User
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-white outline-none placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />

                </div>

              </div>

              {/* Email */}
              <div>

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Email Address
                </label>

                <div className="relative">

                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-white outline-none placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />

                </div>

              </div>

              {/* Password */}
              <div>

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Password
                </label>

                <div className="relative">

                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    type="password"
                    placeholder="Create a password"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-white outline-none placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />

                </div>

              </div>

              {/* Register Button */}
              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 py-3.5 font-semibold text-white transition hover:bg-blue-500"
              >
                Create Account
              </button>

            </form>

            {/* Login Link */}
            <p className="mt-6 text-center text-sm text-slate-400">

              Already have an account?{" "}

              <Link
                to="/login"
                className="font-medium text-blue-400 transition hover:text-blue-300"
              >
                Sign In
              </Link>

            </p>

          </div>

          <p className="mt-6 text-center text-xs text-slate-600">
            PrepBuddy is a preparation management and communication tool.
          </p>

        </div>

      </main>

    </div>
  )
}

export default Register