import { useMemo, useState } from "react"
import {
  Search,
  Filter,
  FileText,
  Calendar,
  Clock,
  CheckCircle2,
  X,
  ClipboardList,
  ShieldCheck,
} from "lucide-react"

const protocolData = [
  {
    id: "PR-001",
    procedure: "Endoscopy",
    title: "Endoscopy Preparation Protocol",
    description:
      "Standard preparation instructions for patients scheduled for an endoscopy procedure.",
    duration: "24 hours",
    status: "Active",
    requirements: [
      "Do not eat solid food for at least 6 hours before the procedure.",
      "Clear liquids may be taken according to clinic instructions.",
      "Avoid alcohol and heavy meals before the procedure.",
      "Inform the clinic about current medications.",
      "Arrive at the clinic at least 30 minutes before the scheduled procedure.",
    ],
    timeline: [
      {
        time: "24 hours before",
        task: "Review preparation instructions",
      },
      {
        time: "12 hours before",
        task: "Follow dietary restrictions",
      },
      {
        time: "6 hours before",
        task: "Stop solid food intake",
      },
      {
        time: "Before procedure",
        task: "Complete final readiness check",
      },
    ],
  },

  {
    id: "PR-002",
    procedure: "Colonoscopy",
    title: "Colonoscopy Preparation Protocol",
    description:
      "Preparation protocol covering dietary restrictions, medication review and final readiness checks.",
    duration: "48 hours",
    status: "Active",
    requirements: [
      "Follow the prescribed low-residue diet before the procedure.",
      "Avoid foods that may interfere with bowel preparation.",
      "Follow the clinic-provided bowel preparation instructions.",
      "Drink sufficient clear fluids as instructed.",
      "Complete the final preparation confirmation before arrival.",
    ],
    timeline: [
      {
        time: "48 hours before",
        task: "Begin dietary preparation",
      },
      {
        time: "24 hours before",
        task: "Follow bowel preparation instructions",
      },
      {
        time: "12 hours before",
        task: "Continue clear-liquid preparation",
      },
      {
        time: "Before procedure",
        task: "Confirm final readiness",
      },
    ],
  },

  {
    id: "PR-003",
    procedure: "MRI",
    title: "MRI Preparation Protocol",
    description:
      "General preparation protocol for patients scheduled for an MRI procedure.",
    duration: "12 hours",
    status: "Active",
    requirements: [
      "Follow any fasting instructions provided by the clinic.",
      "Remove metal objects before entering the MRI area.",
      "Inform clinic staff about implants or medical devices.",
      "Wear comfortable clothing without metal components.",
      "Arrive early for the final safety screening.",
    ],
    timeline: [
      {
        time: "12 hours before",
        task: "Review MRI preparation instructions",
      },
      {
        time: "6 hours before",
        task: "Follow fasting instructions if applicable",
      },
      {
        time: "1 hour before",
        task: "Prepare required documents",
      },
      {
        time: "Before procedure",
        task: "Complete MRI safety screening",
      },
    ],
  },
]

function Protocols() {
  const [searchTerm, setSearchTerm] = useState("")
  const [procedureFilter, setProcedureFilter] = useState("All")
  const [selectedProtocol, setSelectedProtocol] = useState(null)

  const filteredProtocols = useMemo(() => {
    return protocolData.filter((protocol) => {
      const matchesSearch =
        protocol.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        protocol.procedure.toLowerCase().includes(searchTerm.toLowerCase()) ||
        protocol.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesProcedure =
        procedureFilter === "All" ||
        protocol.procedure === procedureFilter

      return matchesSearch && matchesProcedure
    })
  }, [searchTerm, procedureFilter])

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-[#020617]">
        <div className="flex items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold">Protocols</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage preparation protocols for clinic procedures
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-500/15 text-blue-400">
            <ShieldCheck size={21} />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Overview cards */}
        <div className="mb-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-[#0b1226] p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-slate-400">Total Protocols</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <FileText size={20} />
              </div>
            </div>

            <p className="text-3xl font-bold">{protocolData.length}</p>
            <p className="mt-2 text-sm text-slate-500">
              Available clinic protocols
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0b1226] p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-slate-400">Active Protocols</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 size={20} />
              </div>
            </div>

            <p className="text-3xl font-bold">
              {protocolData.filter((p) => p.status === "Active").length}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Currently available
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0b1226] p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-slate-400">Procedures Covered</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                <ClipboardList size={20} />
              </div>
            </div>

            <p className="text-3xl font-bold">3</p>

            <p className="mt-2 text-sm text-slate-500">
              Endoscopy, Colonoscopy & MRI
            </p>
          </div>
        </div>

        {/* Search + filters */}
        <div className="mb-7 rounded-2xl border border-slate-800 bg-[#0b1226] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                placeholder="Search protocol or procedure..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-[#020617] py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <Filter size={18} className="text-slate-500" />

              <select
                value={procedureFilter}
                onChange={(e) => setProcedureFilter(e.target.value)}
                className="rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
              >
                <option value="All">All Procedures</option>
                <option value="Endoscopy">Endoscopy</option>
                <option value="Colonoscopy">Colonoscopy</option>
                <option value="MRI">MRI</option>
              </select>
            </div>
          </div>
        </div>

        {/* Protocol list */}
        <section className="rounded-2xl border border-slate-800 bg-[#0b1226]">
          <div className="border-b border-slate-800 px-6 py-5">
            <h2 className="text-lg font-semibold">Preparation Protocols</h2>
            <p className="mt-1 text-sm text-slate-500">
              {filteredProtocols.length} protocol
              {filteredProtocols.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {filteredProtocols.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <FileText
                size={40}
                className="mx-auto mb-4 text-slate-600"
              />

              <h3 className="text-lg font-semibold">
                No protocols found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Try another search term or procedure filter.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {filteredProtocols.map((protocol) => (
                <div
                  key={protocol.id}
                  className="p-6 transition hover:bg-slate-900/40"
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    {/* Left */}
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                        <FileText size={22} />
                      </div>

                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-semibold">
                            {protocol.title}
                          </h3>

                          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                            {protocol.status}
                          </span>
                        </div>

                        <p className="mb-3 text-sm text-blue-400">
                          {protocol.procedure}
                        </p>

                        <p className="max-w-3xl text-sm leading-6 text-slate-500">
                          {protocol.description}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-5 text-sm text-slate-500">
                          <span className="flex items-center gap-2">
                            <Clock size={16} />
                            {protocol.duration}
                          </span>

                          <span className="flex items-center gap-2">
                            <ClipboardList size={16} />
                            {protocol.requirements.length} requirements
                          </span>

                          <span className="flex items-center gap-2">
                            <Calendar size={16} />
                            {protocol.timeline.length} checkpoints
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Button */}
                    <button
                      onClick={() => setSelectedProtocol(protocol)}
                      className="shrink-0 rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-white transition hover:border-blue-500 hover:bg-blue-500/10"
                    >
                      View Protocol
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Protocol Modal */}
      {selectedProtocol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-700 bg-[#0b1226] shadow-2xl">
            {/* Modal header */}
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-800 bg-[#0b1226] px-6 py-5">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                  <FileText size={23} />
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    {selectedProtocol.title}
                  </h2>

                  <p className="mt-1 text-sm text-blue-400">
                    {selectedProtocol.procedure}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedProtocol(null)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-white"
              >
                <X size={21} />
              </button>
            </div>

            {/* Modal body */}
            <div className="space-y-7 p-6">
              {/* Overview */}
              <div className="rounded-xl border border-slate-800 bg-[#020617] p-5">
                <h3 className="mb-2 font-semibold">Protocol Overview</h3>

                <p className="text-sm leading-6 text-slate-500">
                  {selectedProtocol.description}
                </p>

                <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                  <Clock size={17} />
                  Preparation window:{" "}
                  <span className="text-white">
                    {selectedProtocol.duration}
                  </span>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                    <ClipboardList size={18} />
                  </div>

                  <h3 className="font-semibold">
                    Preparation Requirements
                  </h3>
                </div>

                <div className="space-y-3">
                  {selectedProtocol.requirements.map(
                    (requirement, index) => (
                      <div
                        key={index}
                        className="flex gap-3 rounded-xl border border-slate-800 bg-[#020617] p-4"
                      >
                        <CheckCircle2
                          size={19}
                          className="mt-0.5 shrink-0 text-emerald-400"
                        />

                        <p className="text-sm leading-6 text-slate-400">
                          {requirement}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                    <Calendar size={18} />
                  </div>

                  <h3 className="font-semibold">
                    Preparation Timeline
                  </h3>
                </div>

                <div className="space-y-3">
                  {selectedProtocol.timeline.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-4 rounded-xl border border-slate-800 bg-[#020617] p-4"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-sm font-semibold text-blue-400">
                        {index + 1}
                      </div>

                      <div>
                        <p className="text-sm font-medium text-blue-400">
                          {item.time}
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                          {item.task}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety note */}
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
                <div className="flex gap-3">
                  <ShieldCheck
                    size={20}
                    className="mt-0.5 shrink-0 text-blue-400"
                  />

                  <div>
                    <h3 className="text-sm font-semibold text-blue-300">
                      Clinic Safety Note
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      These protocol instructions are for clinic workflow
                      management. Staff should follow the final instructions
                      approved by the responsible clinical team.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="border-t border-slate-800 px-6 py-5">
              <button
                onClick={() => setSelectedProtocol(null)}
                className="w-full rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-500"
              >
                Close Protocol
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Protocols