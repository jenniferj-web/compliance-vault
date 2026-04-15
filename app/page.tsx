"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = "Compliant" | "Expiring Soon" | "Expired";

interface Subcontractor {
  id: number;
  name: string;
  trade: string;
  status: Status;
  glExpiry: string;
  wcExpiry: string;
  policyLimit: string;
}

// ─── Fake Data ────────────────────────────────────────────────────────────────

const DATA: Subcontractor[] = [
  { id: 1,  name: "Apex Electrical LLC",          trade: "Electrical",    status: "Compliant",     glExpiry: "2026-11-15", wcExpiry: "2026-11-15", policyLimit: "$2,000,000" },
  { id: 2,  name: "Iron Ridge Structural",         trade: "Steel / Iron",  status: "Compliant",     glExpiry: "2026-09-30", wcExpiry: "2026-09-30", policyLimit: "$2,000,000" },
  { id: 3,  name: "Summit Plumbing Co.",           trade: "Plumbing",      status: "Expiring Soon", glExpiry: "2026-05-02", wcExpiry: "2026-05-02", policyLimit: "$1,000,000" },
  { id: 4,  name: "Clearline HVAC Solutions",      trade: "HVAC",          status: "Expiring Soon", glExpiry: "2026-04-28", wcExpiry: "2026-04-28", policyLimit: "$1,000,000" },
  { id: 5,  name: "Bedrock Foundation Group",      trade: "Concrete",      status: "Expired",       glExpiry: "2026-03-10", wcExpiry: "2026-03-10", policyLimit: "$1,000,000" },
  { id: 6,  name: "Nova Roofing & Waterproof",     trade: "Roofing",       status: "Compliant",     glExpiry: "2026-12-01", wcExpiry: "2026-12-01", policyLimit: "$2,000,000" },
  { id: 7,  name: "Greystone Masonry Works",       trade: "Masonry",       status: "Expired",       glExpiry: "2026-02-14", wcExpiry: "2026-02-14", policyLimit: "$1,000,000" },
  { id: 8,  name: "Pacific Glass & Glazing",       trade: "Glazing",       status: "Compliant",     glExpiry: "2026-10-20", wcExpiry: "2026-10-20", policyLimit: "$2,000,000" },
  { id: 9,  name: "Delta Fire Protection Inc.",    trade: "Fire Safety",   status: "Expiring Soon", glExpiry: "2026-05-10", wcExpiry: "2026-05-10", policyLimit: "$1,000,000" },
  { id: 10, name: "Trident Demolition Svcs.",      trade: "Demolition",    status: "Expired",       glExpiry: "2026-01-30", wcExpiry: "2026-01-30", policyLimit: "$5,000,000" },
  { id: 11, name: "Meridian Painting & Coatings",  trade: "Painting",      status: "Compliant",     glExpiry: "2026-08-18", wcExpiry: "2026-08-18", policyLimit: "$1,000,000" },
  { id: 12, name: "Cascade Insulation Co.",        trade: "Insulation",    status: "Compliant",     glExpiry: "2026-07-05", wcExpiry: "2026-07-05", policyLimit: "$1,000,000" },
  { id: 13, name: "Vantage Elevator Systems",      trade: "Elevators",     status: "Expiring Soon", glExpiry: "2026-04-25", wcExpiry: "2026-04-25", policyLimit: "$3,000,000" },
  { id: 14, name: "Bluestone Tile & Terrazzo",     trade: "Flooring",      status: "Compliant",     glExpiry: "2026-09-12", wcExpiry: "2026-09-12", policyLimit: "$1,000,000" },
  { id: 15, name: "Hallmark Drywall Partners",     trade: "Drywall",       status: "Expired",       glExpiry: "2026-03-01", wcExpiry: "2026-03-01", policyLimit: "$1,000,000" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_META: Record<Status, { color: string; bg: string; dot: string; border: string; cardBg: string; cardBorder: string; icon: string }> = {
  "Compliant":     { color: "text-emerald-700", bg: "bg-emerald-50",  dot: "bg-emerald-500", border: "border-emerald-200", cardBg: "bg-emerald-50",  cardBorder: "border-emerald-200", icon: "✓" },
  "Expiring Soon": { color: "text-amber-700",   bg: "bg-amber-50",    dot: "bg-amber-400",   border: "border-amber-200",   cardBg: "bg-amber-50",    cardBorder: "border-amber-200",   icon: "!" },
  "Expired":       { color: "text-red-700",     bg: "bg-red-50",      dot: "bg-red-500",     border: "border-red-200",     cardBg: "bg-red-50",      cardBorder: "border-red-200",     icon: "✕" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, count, status }: { label: string; count: number; status: Status }) {
  const m = STATUS_META[status];
  return (
    <div className={`rounded-2xl border-2 ${m.cardBorder} ${m.cardBg} p-6 flex flex-col gap-3 shadow-sm`}>
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-sm ${m.bg} ${m.color} border ${m.border}`}>
          {m.icon}
        </span>
        <span className={`text-sm font-semibold tracking-wide uppercase ${m.color}`}>{label}</span>
      </div>
      <div className={`text-5xl font-black tabular-nums ${m.color}`}>{count}</div>
      <div className="text-xs text-slate-400 font-medium">subcontractors</div>
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const m = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${m.bg} ${m.color} ${m.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {status}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type FilterStatus = Status | "All";

export default function ComplianceDashboard() {
  const [filter, setFilter] = useState<FilterStatus>("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "status" | "glExpiry">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const compliant    = DATA.filter((d) => d.status === "Compliant").length;
  const expiringSoon = DATA.filter((d) => d.status === "Expiring Soon").length;
  const expired      = DATA.filter((d) => d.status === "Expired").length;

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(col); setSortDir("asc"); }
  };

  const filtered = DATA
    .filter((d) => filter === "All" || d.status === filter)
    .filter((d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.trade.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name")    cmp = a.name.localeCompare(b.name);
      if (sortBy === "status")  cmp = a.status.localeCompare(b.status);
      if (sortBy === "glExpiry") cmp = a.glExpiry.localeCompare(b.glExpiry);
      return sortDir === "asc" ? cmp : -cmp;
    });

  const SortIcon = ({ col }: { col: typeof sortBy }) => (
    <span className="ml-1 text-slate-400 select-none">
      {sortBy === col ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
    </span>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 11.965C3 18.033 7.373 22.5 12 22.5s9-4.467 9-10.535c0-2.152-.623-4.157-1.698-5.858A11.94 11.94 0 0112 2.715z" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">Compliance Vault</h1>
            <p className="text-xs text-slate-400">Subcontractor Insurance Tracker</p>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Upload COI
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ── Stat Cards ── */}
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Compliant"     count={compliant}    status="Compliant"     />
            <StatCard label="Expiring Soon" count={expiringSoon} status="Expiring Soon" />
            <StatCard label="Expired"       count={expired}      status="Expired"       />
          </div>
        </div>

        {/* ── Table Section ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Table toolbar */}
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">All Subcontractors</h2>
              <p className="text-xs text-slate-400">{filtered.length} of {DATA.length} records</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 w-44"
                />
              </div>
              {/* Filter buttons */}
              {(["All", "Compliant", "Expiring Soon", "Expired"] as FilterStatus[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    filter === f
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {[
                    { label: "Subcontractor", col: "name" as const },
                    { label: "Trade",         col: null },
                    { label: "Status",        col: "status" as const },
                    { label: "GL Expiry",     col: "glExpiry" as const },
                    { label: "WC Expiry",     col: null },
                    { label: "Policy Limit",  col: null },
                  ].map(({ label, col }) => (
                    <th
                      key={label}
                      onClick={col ? () => toggleSort(col) : undefined}
                      className={`px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap ${col ? "cursor-pointer hover:text-slate-700 select-none" : ""}`}
                    >
                      {label}{col && <SortIcon col={col} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                      No subcontractors match your filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 group-hover:text-slate-700">{sub.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                          {sub.trade}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={sub.status} />
                      </td>
                      <td className="px-6 py-4 text-slate-600 tabular-nums">
                        {formatDate(sub.glExpiry)}
                      </td>
                      <td className="px-6 py-4 text-slate-600 tabular-nums">
                        {formatDate(sub.wcExpiry)}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                        {sub.policyLimit}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
            <span className="text-xs text-slate-400">
              {compliant} compliant · {expiringSoon} expiring · {expired} expired
            </span>
          </div>
        </div>

      </main>
    </div>
  );
}