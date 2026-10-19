import { useMemo, useState } from "react"
import {
  Bot,
  Send,
  User,
  Sparkles,
  Search,
  Trash2,
  UserRound,
  CalendarDays,
  Activity,
  CheckCircle2,
  Clock3,
  MessageCircle,
} from "lucide-react"
import useAuth from "../hooks/useAuth"
import usePatients from "../hooks/usePatients"
import useAppointments from "../hooks/useAppointments"
import { getPatientProgress, getPatientStatus } from "../services/api"

const suggestedQuestions = [
  "Is this patient ready for the procedure?",
  "What preparation steps are pending?",
  "What reminders should be sent?",
  "Give me a preparation summary.",
]
const initialMessages = [
  {
    role: "assistant",
    text: "Hello! I'm PrepBuddy AI. Select a patient and ask me about their preparation, procedure, pending tasks, or reminders.",
  },
]

function AIAssistant() {
  const { user } = useAuth()
  const accountId = user?.id || user?._id
  const {
    patients: backendPatients,
    loading: patientsLoading,
    error: patientsError,
    refresh: refreshPatients,
  } = usePatients(accountId)
  const { appointments } = useAppointments(accountId)
  const patients = useMemo(
    () =>
      backendPatients.map((patient) => {
        const appointment = appointments.find(
          (item) =>
            String(item.patient?._id || item.patient) === String(patient._id)
        )
        const progress = getPatientProgress(patient)
        const scheduledAt = appointment?.appointmentDate || patient.procedureDate
        const dateValue = scheduledAt ? new Date(scheduledAt) : null
        return {
          ...patient,
          id: patient._id,
          procedure: patient.procedure || "Procedure not specified",
          date:
            dateValue && !Number.isNaN(dateValue.getTime())
              ? dateValue.toLocaleDateString()
              : "Not scheduled",
          time:
            dateValue && !Number.isNaN(dateValue.getTime())
              ? dateValue.toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "Not scheduled",
          progress,
          status: getPatientStatus(patient),
          pending: (patient.preparationSteps || []).filter(
            (step) => !step.completed
          ).length,
        }
      }),
    [backendPatients, appointments]
  )
  const [selection, setSelection] = useState({ accountId: null, id: "" })
  const [search, setSearch] = useState("")
  const [message, setMessage] = useState("")
  const [chat, setChat] = useState({ accountId: null, messages: initialMessages })
  const selectedPatientId =
    selection.accountId === accountId ? selection.id : ""
  const messages =
    chat.accountId === accountId ? chat.messages : initialMessages

  const selectedPatient = useMemo(
    () =>
      patients.find((patient) => patient.id === selectedPatientId) ||
      patients[0],
    [patients, selectedPatientId]
  )

  const filteredPatients = patients.filter((patient) =>
    `${patient.name} ${patient.id} ${patient.procedure}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const generateResponse = (question) => {
    if (!selectedPatient) {
      return "Please select a patient first."
    }

    const lower = question.toLowerCase()

    if (lower.includes("ready")) {
      if (selectedPatient.progress === 100) {
        return `${selectedPatient.name} is ready for the ${selectedPatient.procedure}. Preparation is complete at 100%.`
      }

      return `${selectedPatient.name} is not fully ready yet. Current preparation progress is ${selectedPatient.progress}%. There are ${selectedPatient.pending} pending preparation checkpoint(s).`
    }

    if (lower.includes("pending")) {
      return `${selectedPatient.name} currently has ${selectedPatient.pending} pending preparation checkpoint(s). The current preparation progress is ${selectedPatient.progress}%.`
    }

    if (lower.includes("reminder")) {
      return `A preparation reminder may be useful for ${selectedPatient.name}, especially because their current preparation progress is ${selectedPatient.progress}%.`
    }

    if (lower.includes("summary")) {
      return `${selectedPatient.name} is scheduled for ${selectedPatient.procedure} on ${selectedPatient.date} at ${selectedPatient.time}. Current preparation progress is ${selectedPatient.progress}% and the status is ${selectedPatient.status}.`
    }

    return `Based on the current PrepBuddy data, ${selectedPatient.name} is at ${selectedPatient.progress}% preparation for ${selectedPatient.procedure}. I can help with readiness, pending tasks, reminders, or a preparation summary.`
  }

  const sendMessage = (text = message) => {
    const trimmedMessage = text.trim()

    if (!trimmedMessage) return

    const response = generateResponse(trimmedMessage)

    setChat((previous) => ({
      accountId,
      messages: [
        ...(previous.accountId === accountId
          ? previous.messages
          : initialMessages),
        {
          role: "user",
          text: trimmedMessage,
        },
        {
          role: "assistant",
          text: response,
        },
      ],
    }))

    setMessage("")
  }

  const clearChat = () => {
    setChat({
      accountId,
      messages: [
        {
          role: "assistant",
          text: "Chat cleared. How can I help you with patient preparation?",
        },
      ],
    })
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-[#020617]">
        <div className="flex h-[72px] items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
              <Bot size={24} />
            </div>

            <div>
              <h1 className="text-lg font-semibold">PrepBuddy AI</h1>
              <p className="text-xs text-slate-500">
                Intelligent healthcare assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900/60 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-sm text-slate-300">AI Assistant Online</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-6 py-8">
        {/* Page heading */}
        <div className="mb-7">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles size={18} className="text-blue-400" />
            <span className="text-sm font-medium text-blue-400">
              Intelligent Assistance
            </span>
          </div>

          <h2 className="text-3xl font-bold">AI Patient Assistant</h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Get quick insights about patient preparation, procedures,
            readiness, pending tasks and reminders.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Patient Selection */}
          <aside className="rounded-2xl border border-slate-800 bg-[#0b1225] p-5">
            <div className="mb-5 flex items-center gap-2">
              <UserRound size={18} className="text-blue-400" />
              <h3 className="font-semibold">Select Patient</h3>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search patient..."
                className="w-full rounded-xl border border-slate-700 bg-[#020617] py-3 pl-10 pr-3 text-sm text-white outline-none transition focus:border-blue-500"
              />
            </div>

            {/* Patients */}
            <div className="space-y-3">
              {patientsError && (
                <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                  {patientsError}
                  <button type="button" onClick={refreshPatients} className="ml-2 underline">
                    Retry
                  </button>
                </div>
              )}
              {patientsLoading && (
                <p role="status" className="py-4 text-center text-sm text-slate-500">
                  Loading patients...
                </p>
              )}
              {filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => setSelection({ accountId, id: patient.id })}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    selectedPatientId === patient.id
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-sm font-semibold text-blue-400">
                      {patient.name
                        .split(" ")
                        .map((word) => word[0])
                        .join("")
                        .slice(0, 2)}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-medium">{patient.name}</p>
                      <p className="text-xs text-slate-500">
                        {patient.id}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-slate-400">
                    {patient.procedure}
                  </div>
                </button>
              ))}

              {!patientsLoading && filteredPatients.length === 0 && (
                <p className="py-6 text-center text-sm text-slate-500">
                  No patients in this clinic account yet.
                </p>
              )}
            </div>
          </aside>

          {/* Main Assistant */}
          <section className="grid min-h-[650px] gap-6 xl:grid-cols-[1fr_310px]">
            {/* Chat */}
            <div className="flex min-h-[650px] flex-col rounded-2xl border border-slate-800 bg-[#0b1225]">
              {/* Chat header */}
              <div className="flex items-center justify-between border-b border-slate-800 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/15 text-blue-400">
                    <MessageCircle size={21} />
                  </div>

                  <div>
                    <h3 className="font-semibold">AI Conversation</h3>
                    <p className="text-xs text-slate-500">
                      Discussing {selectedPatient?.name}
                    </p>
                  </div>
                </div>

                <button
                  onClick={clearChat}
                  className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-400 transition hover:border-red-500/40 hover:text-red-400"
                >
                  <Trash2 size={15} />
                  Clear
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 space-y-5 overflow-y-auto p-5">
                {messages.map((item, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${
                      item.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    {item.role === "assistant" && (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600/15 text-blue-400">
                        <Bot size={18} />
                      </div>
                    )}

                    <div
                      className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                        item.role === "user"
                          ? "bg-blue-600 text-white"
                          : "border border-slate-800 bg-slate-900 text-slate-300"
                      }`}
                    >
                      {item.text}
                    </div>

                    {item.role === "user" && (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
                        <User size={17} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Suggestions */}
              <div className="border-t border-slate-800 px-5 pt-4">
                <p className="mb-3 text-xs text-slate-500">
                  Suggested questions
                </p>

                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((question) => (
                    <button
                      key={question}
                      onClick={() => sendMessage(question)}
                      className="rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-xs text-slate-300 transition hover:border-blue-500/50 hover:text-blue-400"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="p-5">
                <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-[#020617] p-2 focus-within:border-blue-500">
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        sendMessage()
                      }
                    }}
                    placeholder="Ask PrepBuddy AI..."
                    className="flex-1 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600"
                  />

                  <button
                    onClick={() => sendMessage()}
                    disabled={!message.trim()}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Send size={17} />
                  </button>
                </div>
              </div>
            </div>

            {/* Patient Context */}
            {selectedPatient && (
              <div className="rounded-2xl border border-slate-800 bg-[#0b1225] p-5">
                <div className="mb-5 flex items-center gap-2">
                  <Activity size={18} className="text-emerald-400" />
                  <h3 className="font-semibold">Patient Context</h3>
                </div>

                <div className="mb-5 rounded-xl border border-slate-800 bg-[#020617] p-4">
                  <p className="text-lg font-semibold">
                    {selectedPatient.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {selectedPatient.id}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Activity size={17} className="mt-0.5 text-blue-400" />

                    <div>
                      <p className="text-xs text-slate-500">Procedure</p>
                      <p className="mt-1 text-sm font-medium">
                        {selectedPatient.procedure}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CalendarDays
                      size={17}
                      className="mt-0.5 text-purple-400"
                    />

                    <div>
                      <p className="text-xs text-slate-500">
                        Scheduled Date
                      </p>
                      <p className="mt-1 text-sm font-medium">
                        {selectedPatient.date}
                      </p>
                      <p className="text-xs text-slate-500">
                        {selectedPatient.time}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock3 size={17} className="mt-0.5 text-yellow-400" />

                    <div>
                      <p className="text-xs text-slate-500">Status</p>
                      <p className="mt-1 text-sm font-medium">
                        {selectedPatient.status}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-7">
                  <div className="mb-2 flex justify-between">
                    <span className="text-xs text-slate-500">
                      Preparation
                    </span>

                    <span className="text-sm font-semibold text-emerald-400">
                      {selectedPatient.progress}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{
                        width: `${selectedPatient.progress}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Pending */}
                <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  <div className="flex items-center gap-3">
                    {selectedPatient.pending === 0 ? (
                      <CheckCircle2
                        size={20}
                        className="text-emerald-400"
                      />
                    ) : (
                      <Clock3 size={20} className="text-yellow-400" />
                    )}

                    <div>
                      <p className="text-sm font-medium">
                        {selectedPatient.pending === 0
                          ? "Preparation complete"
                          : `${selectedPatient.pending} task(s) pending`}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        AI uses this information for assistance.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                  <div className="flex gap-3">
                    <Sparkles
                      size={18}
                      className="mt-0.5 shrink-0 text-blue-400"
                    />

                    <p className="text-xs leading-5 text-slate-400">
                      AI responses are based on the currently available
                      patient preparation data. Backend AI integration will
                      be added in the next phase.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default AIAssistant