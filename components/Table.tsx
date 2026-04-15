"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Subcontractor {
  id: number | string;
  name: string;
  trade?: string;
  expirationDate: string; // ISO 8601 — "YYYY-MM-DD"
}

interface TableProps {
  data?: Subcontractor[];
}

// ─── Status logic ─────────────────────────────────────────────────────────────

type StatusKind = "Active" | "Expiring Soon" | "Expired";

function getStatus(isoDate: string): StatusKind {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(isoDate);
  const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return "Expired";
  if (daysLeft <= 30) return "Expiring Soon";
  return "Active";
}

function getDaysLabel(isoDate: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(isoDate);
  const days = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Expires today";
  return `${days}d left`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<StatusKind, { badge: string; dot: string; row: string }> = {
  "Active":        { badge: "bg-emerald-50 text-emerald-700 border-emerald-200",  dot: "bg-emerald-500",  row: "" },
  "Expiring Soon": { badge: "bg-amber-50   text-amber-700   border-amber-200",    dot: "bg-amber-400",    row: "bg-amber-50/40" },
  "Expired":       { badge: "bg-red-50     text-red-700     border-red-200",      dot: "bg-red-500",      row: "bg-red-50/30" },
};

function StatusBadge({ status }: { status: StatusKind }) {
  const s = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot} ${status === "Active" ? "animate-pulse" : ""}`} />
      {status}
    </span>
  );
}

// ─── Avatars ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-cyan-100 text-cyan-700",
  "bg-rose-100 text-rose-700",
  "bg-teal-100 text-teal-700",
  "bg-orange-100 text-orange-700",
];

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

// ─── Sort indicator ───────────────────────────────────────────────────────────

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  return (
    <span className={`ml-1 text-[10px] transition-opacity ${active ? "opacity-100" : "opacity-30"}`}>
      {active && dir === "desc" ? "↓" : "↑"}
    </span>
  );
}

// ─── Sample data ──────────────────────────────────────────────────────────────

function offsetDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const SAMPLE_DATA: Subcontractor[] = [
  { id: 1,  name: "Apex Electrical LLC",         trade: "Electrical",   expirationDate: offsetDate(210)  },
  { id: 2,  name: "Summit Plumbing Co.",          trade: "Plumbing",     expirationDate: offsetDate(18)   },
  { id: 3,  name: "Iron Ridge Structural",        trade: "Steel / Iron", expirationDate: offsetDate(305)  },
  { id: 4,  name: "Clearline HVAC Solutions",     trade: "HVAC",         expirationDate: offsetDate(-42)  },
  { id: 5,  name: "Nova Roofing & Waterproof",    trade: "Roofing",      expirationDate: offsetDate(88)   },
  { id: 6,  name: "Bedrock Foundation Group",     trade: "Concrete",     expirationDate: offsetDate(-7)   },
  { id: 7,  name: "Pacific Glass & Glazing",      trade: "Glazing",      expirationDate: offsetDate(140)  },
  { id: 8,  name: "Delta Fire Protection Inc.",   trade: "Fire Safety",  expirationDate: offsetDate(25)   },
  { id: 9,  name: "Greystone Masonry Works",      trade: "Masonry",      expirationDate: offsetDate(-120) },
  { id: 10, name: "Meridian Painting & Coatings", trade: "Painting",     expirationDate: offsetDate(260)  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

type SortCol = "name" | "expirationDate" | "status";

export default function Table({ data = SAMPLE_DATA }: TableProps) {
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<SortCol>("expirationDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState<StatusKind | "All">("All");

  const ORDER: Record<StatusKind, number> = { Expired: 0, "Expiring Soon": 1, Active: 2 };

  const handleSort = (col: SortCol) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
  };

  const rows = data
    .map((sub) => ({ ...sub, status: getStatus(sub.expirationDate) }))
    .filter((sub) => statusFilter === "All" || sub.status === statusFilter)
    .filter((sub) =>
      sub.name.toLowerCase().includes(search.toLowerCase()) ||
      (sub.trade ?? "").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let cmp = 0;
      if (sortCol === "name")           cmp = a.name.localeCompare(b.name);
      if (sortCol === "expirationDate") cmp = a.expirationDate.localeCompare(b.expirationDate);
      if (sortCol === "status")         cmp = ORDER[a.status] - ORDER[b.status];
      return sortDir === "asc" ? cmp : -cmp;
    });

  const counts = {
    Active:        data.filter((d) => getStatus(d.expirationDate) === "Active").length,
    "Expiring Soon": data.filter((d) => getStatus(d.expirationDate) === "Expiring Soon").length,
    Expired:       data.filter((d) => getStatus(d.expirationDate) === "Expired").length,
  };

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">

        {/* Title + count */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Subcontractors</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {rows.length} of {data.length} records
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 w-40 placeholder-slate-400"
            />
          </div>

          {/* Filter pills */}
          {(["All", "Active", "Expiring Soon", "Expired"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap ${
                statusFilter === f
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"
              }`}
            >
              {f}
              {f !== "All" && (
                <span className={`ml-1.5 tabular-nums ${statusFilter === f ? "text-slate-300" : "text-slate-400"}`}>
                  {counts[f]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">

              {/* Name column */}
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-800 select-none whitespace-nowrap"
                onClick={() => handleSort("name")}
              >
                Subcontractor
                <SortIcon active={sortCol === "name"} dir={sortDir} />
              </th>

              {/* Expiration column */}
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-800 select-none whitespace-nowrap"
                onClick={() => handleSort("expirationDate")}
              >
                Insurance Expiration
                <SortIcon active={sortCol === "expirationDate"} dir={sortDir} />
              </th>

              {/* Status column */}
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-800 select-none whitespace-nowrap"
                onClick={() => handleSort("status")}
              >
                Status
                <SortIcon active={sortCol === "status"} dir={sortDir} />
              </th>

            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-slate-400 text-sm">
                  No subcontractors match your search.
                </td>
              </tr>
            ) : (
              rows.map((sub, idx) => {
                const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                const rowStyle = STATUS_STYLES[sub.status].row;
                const daysLabel = getDaysLabel(sub.expirationDate);
                const isOverdue = sub.status === "Expired";
                const isWarn    = sub.status === "Expiring Soon";

                return (
                  <tr
                    key={sub.id}
                    className={`group transition-colors hover:bg-slate-50 ${rowStyle}`}
                  >
                    {/* Name + trade */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor}`}>
                          {initials(sub.name)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 leading-snug group-hover:text-slate-700">
                            {sub.name}
                          </div>
                          {sub.trade && (
                            <div className="text-xs text-slate-400 mt-0.5">{sub.trade}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Expiration date */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className={`tabular-nums font-medium ${isOverdue ? "text-red-600" : "text-slate-700"}`}>
                          {formatDate(sub.expirationDate)}
                        </span>
                        <span className={`text-xs font-semibold ${
                          isOverdue ? "text-red-400" : isWarn ? "text-amber-500" : "text-slate-400"
                        }`}>
                          {daysLabel}
                        </span>
                      </div>
                    </td>

                    {/* Status badge */}
                    <td className="px-6 py-4">
                      <StatusBadge status={sub.status} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            {counts.Active} active
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            {counts["Expiring Soon"]} expiring
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            {counts.Expired} expired
          </span>
        </div>
        <span className="text-xs text-slate-400">
          Updated {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      </div>

    </div>
  );
}