import { Link } from "react-router-dom"
import {
  ShieldCheck,
  ArrowLeft,
  Mail,
  Lock,
} from "lucide-react"

function Login() {
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

      {/* Login Section */}
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
            <div className="mb-8 text-center">

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                <ShieldCheck size={28} />
              </div>

              <h1 className="text-3xl font-bold">
                Welcome Back
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Sign in to continue to PrepBuddy
              </p>

            </div>

            {/* Form */}
            <form className="space-y-5">

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
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />

                </div>

              </div>

              {/* Password */}
              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label className="text-sm font-medium text-slate-300">
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Forgot password?
                  </button>

                </div>

                <div className="relative">

                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />

                </div>

              </div>

              {/* Login */}
              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 py-3.5 font-semibold text-white transition hover:bg-blue-500"
              >
                Sign In
              </button>

            </form>

            {/* Register */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-800" />

              <span className="text-xs text-slate-500">
                OR
              </span>

              <div className="h-px flex-1 bg-slate-800" />
            </div>

            <p className="text-center text-sm text-slate-400">

              Don't have an account?{" "}

              <Link
                to="/register"
                className="font-medium text-blue-400 transition hover:text-blue-300"
              >
                Create Account
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

export default Login