"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type StatusKind = "Compliant" | "Expiring Soon" | "Action Required";

interface Subcontractor {
  id: number;
  name: string;
  trade: string;
  status: StatusKind;
  glExpiry: string;
  wcExpiry: string;
  contact: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const SUBS: Subcontractor[] = [
  { id: 1,  name: "Fremont Concrete Co.",       trade: "Concrete / Flatwork",  status: "Compliant",       glExpiry: "Nov 15, 2025", wcExpiry: "Nov 15, 2025", contact: "R. Dominguez"  },
  { id: 2,  name: "San Leandro HVAC",           trade: "Mechanical / HVAC",    status: "Compliant",       glExpiry: "Dec 01, 2025", wcExpiry: "Dec 01, 2025", contact: "T. Nakamura"   },
  { id: 3,  name: "Oakland Steel Fab",          trade: "Structural Steel",     status: "Compliant",       glExpiry: "Oct 30, 2025", wcExpiry: "Oct 30, 2025", contact: "M. Washington" },
  { id: 4,  name: "Hayward Electric LLC",       trade: "Electrical",           status: "Compliant",       glExpiry: "Sep 22, 2025", wcExpiry: "Sep 22, 2025", contact: "J. Alvarado"   },
  { id: 5,  name: "Union City Plumbing",        trade: "Plumbing",             status: "Compliant",       glExpiry: "Jan 10, 2026", wcExpiry: "Jan 10, 2026", contact: "C. Reyes"      },
  { id: 6,  name: "Emeryville Roofing",         trade: "Roofing",              status: "Compliant",       glExpiry: "Feb 28, 2026", wcExpiry: "Feb 28, 2026", contact: "D. Patel"      },
  { id: 7,  name: "Richmond Masonry Group",     trade: "Masonry",              status: "Compliant",       glExpiry: "Mar 05, 2026", wcExpiry: "Mar 05, 2026", contact: "A. Cortez"     },
  { id: 8,  name: "Alameda Fire Systems",       trade: "Fire Protection",      status: "Compliant",       glExpiry: "Apr 18, 2026", wcExpiry: "Apr 18, 2026", contact: "S. Kim"        },
  { id: 9,  name: "Berkeley Glass & Glaze",     trade: "Glazing",              status: "Compliant",       glExpiry: "May 01, 2026", wcExpiry: "May 01, 2026", contact: "P. Okafor"     },
  { id: 10, name: "Concord Demolition Inc.",    trade: "Demolition",           status: "Compliant",       glExpiry: "Jun 30, 2026", wcExpiry: "Jun 30, 2026", contact: "W. Tran"       },
  { id: 11, name: "Walnut Creek Insulation",    trade: "Insulation",           status: "Compliant",       glExpiry: "Jul 14, 2026", wcExpiry: "Jul 14, 2026", contact: "F. Morales"    },
  { id: 12, name: "Pittsburg Drywall Svcs.",    trade: "Drywall",              status: "Compliant",       glExpiry: "Aug 20, 2026", wcExpiry: "Aug 20, 2026", contact: "B. Nguyen"     },
  { id: 13, name: "Antioch Painting Co.",       trade: "Painting",             status: "Expiring Soon",   glExpiry: "May 12, 2025", wcExpiry: "May 12, 2025", contact: "L. Santos"     },
  { id: 14, name: "Martinez Elevators Ltd.",    trade: "Elevators",            status: "Expiring Soon",   glExpiry: "May 03, 2025", wcExpiry: "May 03, 2025", contact: "H. Ibrahim"    },
  { id: 15, name: "Brentwood Site Grading",     trade: "Grading / Earthwork",  status: "Expiring Soon",   glExpiry: "Apr 28, 2025", wcExpiry: "Apr 28, 2025", contact: "N. Espinoza"   },
  { id: 16, name: "Livermore Crane & Rigging",  trade: "Crane / Rigging",      status: "Action Required", glExpiry: "Mar 01, 2025", wcExpiry: "Mar 01, 2025", contact: "G. Blackwell"  },
];

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<StatusKind, {
  dot: string; badge: string; text: string; border: string; rowBg: string;
}> = {
  "Compliant": {
    dot:    "bg-emerald-400",
    badge:  "bg-emerald-950/60",
    text:   "text-emerald-300",
    border: "border-emerald-800/50",
    rowBg:  "",
  },
  "Expiring Soon": {
    dot:    "bg-amber-400",
    badge:  "bg-amber-950/60",
    text:   "text-amber-300",
    border: "border-amber-800/50",
    rowBg:  "bg-amber-950/10",
  },
  "Action Required": {
    dot:    "bg-red-400",
    badge:  "bg-red-950/60",
    text:   "text-red-300",
    border: "border-red-800/50",
    rowBg:  "bg-red-950/15",
  },
};

// ─── Icons ────────────────────────────────────────────────────────────────────

const ShieldIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.955 11.955 0 0 0 3 11.965C3 18.033 7.373 22.5 12 22.5s9-4.467 9-10.535c0-2.152-.623-4.157-1.698-5.858A11.94 11.94 0 0 1 12 2.715z" />
  </svg>
);

const LinkIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);

const DotsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5"  cy="12" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="19" cy="12" r="1.5" />
  </svg>
);

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
  </svg>
);

// ─── Invite Button ────────────────────────────────────────────────────────────

function InviteButton() {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    const link = "https://my-site.com/upload?company_id=123";
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const el = document.createElement("textarea");
      el.value = link;
      el.style.cssText = "position:fixed;top:-9999px;opacity:0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 3200);
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className={`
          inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold
          transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
          ${copied
            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/50 focus-visible:ring-emerald-500"
            : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/50 hover:-translate-y-px active:translate-y-0 focus-visible:ring-blue-500"
          }
        `}
      >
        {copied
          ? <><CheckIcon className="w-4 h-4" />Link Copied!</>
          : <><LinkIcon  className="w-4 h-4" />Invite Subcontractor</>
        }
      </button>

      {/* Toast */}
      {copied && (
        <div className="absolute top-full right-0 mt-2.5 z-50 pointer-events-none toast-enter">
          <div className="relative">
            <div className="absolute -top-[6px] right-4 w-3 h-3 rotate-45 bg-slate-800 border-l border-t border-slate-600/60" />
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800 border border-slate-600/60 shadow-2xl whitespace-nowrap">
              <span className="text-base leading-none">📱</span>
              <div>
                <p className="text-xs font-semibold text-white">Copied to clipboard</p>
                <p className="text-[11px] text-emerald-400 font-medium mt-0.5">Text this link to your sub!</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Actions dropdown ─────────────────────────────────────────────────────────

function ActionsMenu({ sub }: { sub: Subcontractor }) {
  const [open, setOpen] = useState(false);

  const items = [
    { label: "View Certificate", emoji: "📄" },
    { label: "Send Reminder",    emoji: "📨" },
    { label: "Update Expiry",    emoji: "📅" },
    { label: "Remove",           emoji: "🗑️", danger: true },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700/60 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
        aria-label={`Actions for ${sub.name}`}
      >
        <DotsIcon className="w-4 h-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1.5 z-50 w-44 rounded-xl bg-slate-800 border border-slate-700/60 shadow-2xl shadow-black/60 overflow-hidden menu-enter">
            {items.map(item => (
              <button
                key={item.label}
                onClick={() => setOpen(false)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-sm transition-colors
                  ${item.danger
                    ? "text-red-400 hover:bg-red-950/40 hover:text-red-300"
                    : "text-slate-300 hover:bg-slate-700/60 hover:text-white"
                  }`}
              >
                <span>{item.emoji}</span>
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Filter = "All" | StatusKind;

export default function ComplianceDashboard() {
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState<Filter>("All");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const counts = {
    compliant:      SUBS.filter(s => s.status === "Compliant").length,
    expiringSoon:   SUBS.filter(s => s.status === "Expiring Soon").length,
    actionRequired: SUBS.filter(s => s.status === "Action Required").length,
  };

  const rows = SUBS
    .filter(s => filter === "All" || s.status === filter)
    .filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.trade.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const cmp = a.name.localeCompare(b.name);
      return sortDir === "asc" ? cmp : -cmp;
    });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');

        .font-display  { font-family: 'Syne', sans-serif; }
        .font-mono-ui  { font-family: 'IBM Plex Mono', monospace; }

        @keyframes toastIn  { from { opacity:0; transform:translateY(-8px) scale(.95); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes menuIn   { from { opacity:0; transform:translateY(-5px) scale(.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes rowIn    { from { opacity:0; transform:translateX(-6px); }            to { opacity:1; transform:translateX(0); } }
        @keyframes fadeUp   { from { opacity:0; transform:translateY(14px); }            to { opacity:1; transform:translateY(0); } }

        .toast-enter { animation: toastIn .2s cubic-bezier(.22,1,.36,1) both; }
        .menu-enter  { animation: menuIn .15s ease both; }
        .row-in      { animation: rowIn .3s ease both; }
        .s1 { animation: fadeUp .55s cubic-bezier(.22,1,.36,1) .05s both; }
        .s2 { animation: fadeUp .55s cubic-bezier(.22,1,.36,1) .15s both; }
        .s3 { animation: fadeUp .55s cubic-bezier(.22,1,.36,1) .25s both; }

        /* grid texture */
        .grid-bg {
          background-image:
            linear-gradient(rgba(59,130,246,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,.04) 1px, transparent 1px);
          background-size: 44px 44px;
        }

        /* table row hover */
        .sub-row { transition: background-color .12s ease; }
        .sub-row:hover { background-color: rgba(59,130,246,.065) !important; }
        .sub-row:hover .action-cell { opacity: 1; }
        .action-cell { opacity: .35; transition: opacity .15s; }

        /* stat card lift */
        .stat-card { transition: transform .2s ease, box-shadow .2s ease; }
        .stat-card:hover { transform: translateY(-2px); }
      `}</style>

      <div className="min-h-screen bg-slate-950 text-slate-100 font-mono-ui">

        {/* Background texture + glow */}
        <div className="fixed inset-0 grid-bg pointer-events-none" aria-hidden="true" />
        <div
          className="fixed inset-0 pointer-events-none"
          aria-hidden="true"
          style={{ background: "radial-gradient(ellipse 80% 45% at 50% -5%, rgba(59,130,246,.09) 0%, transparent 65%)" }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-8">

          {/* ── Header ──────────────────────────────────────────────── */}
          <header className="s1 flex items-center justify-between gap-4 pb-7 border-b border-slate-800/80">

            <div className="flex items-center gap-4">
              {/* Shield logo mark */}
              <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-blue-600 shadow-xl shadow-blue-900/60">
                <ShieldIcon className="w-6 h-6 text-white" />
                {/* Live pulse */}
                <span className="absolute -top-1 -right-1 flex">
                  <span className="animate-ping absolute w-3 h-3 rounded-full bg-emerald-400 opacity-50" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950" />
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="font-display text-xl font-bold text-white tracking-tight">
                    Compliance Vault
                  </h1>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-blue-950/80 text-blue-400 border border-blue-800/50">
                    Enterprise
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 tracking-[0.2em] uppercase mt-0.5">
                  Industrial Corridor · Bay Area
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden md:block text-[11px] text-slate-600 tracking-wider font-mono-ui">
                {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
              </span>
              <div className="hidden md:block w-px h-4 bg-slate-800" />
              <InviteButton />
            </div>
          </header>

          {/* ── Stat Cards ──────────────────────────────────────────── */}
          <section className="s2 grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* 12 Compliant */}
            <div className="stat-card relative rounded-2xl bg-slate-900/70 border border-slate-800 p-6 overflow-hidden cursor-pointer" onClick={() => setFilter(f => f === "Compliant" ? "All" : "Compliant")}>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/40 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-24 h-24 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
              <div className="relative">
                <div className="flex items-start justify-between mb-5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/50 text-[10px] font-semibold text-emerald-400 uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Compliant
                  </span>
                  {filter === "Compliant" && <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">Filtered ↑</span>}
                </div>
                <div className="font-display text-6xl font-bold text-white tabular-nums">
                  {counts.compliant}
                </div>
                <p className="text-xs text-slate-500 mt-2 tracking-wide">subcontractors verified</p>
                <div className="mt-5 h-[2px] w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                    style={{ width: `${(counts.compliant / SUBS.length) * 100}%` }} />
                </div>
              </div>
            </div>

            {/* 3 Expiring Soon */}
            <div className="stat-card relative rounded-2xl bg-slate-900/70 border border-slate-800 p-6 overflow-hidden cursor-pointer" onClick={() => setFilter(f => f === "Expiring Soon" ? "All" : "Expiring Soon")}>
              <div className="absolute inset-0 bg-gradient-to-br from-amber-950/40 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-24 h-24 rounded-full bg-amber-500/5 blur-2xl pointer-events-none" />
              <div className="relative">
                <div className="flex items-start justify-between mb-5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-800/50 text-[10px] font-semibold text-amber-400 uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Expiring Soon
                  </span>
                  {filter === "Expiring Soon" && <span className="text-[9px] text-amber-500 font-bold uppercase tracking-widest">Filtered ↑</span>}
                </div>
                <div className="font-display text-6xl font-bold text-white tabular-nums">
                  {counts.expiringSoon}
                </div>
                <p className="text-xs text-slate-500 mt-2 tracking-wide">within 30 days</p>
                <div className="mt-5 h-[2px] w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
                    style={{ width: `${(counts.expiringSoon / SUBS.length) * 100}%` }} />
                </div>
              </div>
            </div>

            {/* 1 Action Required */}
            <div className="stat-card relative rounded-2xl bg-slate-900/70 border border-slate-800 p-6 overflow-hidden cursor-pointer" onClick={() => setFilter(f => f === "Action Required" ? "All" : "Action Required")}>
              <div className="absolute inset-0 bg-gradient-to-br from-red-950/40 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-24 h-24 rounded-full bg-red-500/5 blur-2xl pointer-events-none" />
              <div className="relative">
                <div className="flex items-start justify-between mb-5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950/80 border border-red-800/50 text-[10px] font-semibold text-red-400 uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    Action Required
                  </span>
                  {filter === "Action Required" && <span className="text-[9px] text-red-500 font-bold uppercase tracking-widest">Filtered ↑</span>}
                </div>
                <div className="font-display text-6xl font-bold text-white tabular-nums">
                  {counts.actionRequired}
                </div>
                <p className="text-xs text-slate-500 mt-2 tracking-wide">immediate attention</p>
                <div className="mt-5 h-[2px] w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-700 to-red-400 rounded-full"
                    style={{ width: `${(counts.actionRequired / SUBS.length) * 100}%` }} />
                </div>
              </div>
            </div>
          </section>

          {/* ── Table ───────────────────────────────────────────────── */}
          <section className="s3">

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between mb-4">
              <div>
                <h2 className="font-display font-bold text-white tracking-tight">
                  Subcontractor Registry
                </h2>
                <p className="text-[11px] text-slate-600 mt-0.5 tracking-wide">
                  Showing {rows.length} of {SUBS.length} records
                  {filter !== "All" && <span className="text-blue-400 font-medium ml-1">· {filter}</span>}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Search */}
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search…"
                    className="pl-8 pr-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700/60 text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-600/60 w-44 transition-colors"
                  />
                </div>

                {/* Filter pills */}
                {(["All", "Compliant", "Expiring Soon", "Action Required"] as Filter[]).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-2 rounded-lg text-[11px] font-semibold border transition-all duration-150 tracking-wide
                      ${filter === f
                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-900/40"
                        : "bg-slate-900 text-slate-500 border-slate-700/60 hover:text-slate-300 hover:border-slate-600"
                      }`}
                  >
                    {f}
                  </button>
                ))}

                {/* Sort */}
                <button
                  onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")}
                  className="px-3 py-2 rounded-lg text-[11px] font-semibold bg-slate-900 border border-slate-700/60 text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-colors"
                  title="Toggle sort order"
                >
                  A→Z {sortDir === "asc" ? "↑" : "↓"}
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-slate-800/80 overflow-hidden bg-slate-900/50 backdrop-blur-sm shadow-2xl shadow-black/50">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">

                  <thead>
                    <tr className="bg-slate-900/90 border-b border-slate-800">
                      {[
                        "Subcontractor", "Trade", "Status",
                        "GL Expiry", "WC Expiry", "Contact", "Actions"
                      ].map(h => (
                        <th key={h} className="px-5 py-3.5 text-left text-[10px] font-semibold text-slate-600 uppercase tracking-[0.14em] whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800/50">
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-16 text-center text-slate-600 text-sm">
                          No subcontractors match your search.
                        </td>
                      </tr>
                    ) : rows.map((sub, i) => {
                      const s = STATUS_STYLES[sub.status];
                      const dateColor =
                        sub.status === "Action Required" ? "text-red-400" :
                        sub.status === "Expiring Soon"   ? "text-amber-400" :
                        "text-slate-500";

                      return (
                        <tr
                          key={sub.id}
                          className={`sub-row row-in ${s.rowBg}`}
                          style={{ animationDelay: `${i * 0.028}s` }}
                        >
                          {/* Name + initials avatar */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700/50 flex items-center justify-center shrink-0 text-[10px] font-bold text-slate-400 select-none">
                                {sub.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                              </div>
                              <span className="font-semibold text-white text-sm">{sub.name}</span>
                            </div>
                          </td>

                          {/* Trade chip */}
                          <td className="px-5 py-3.5">
                            <span className="text-[11px] font-medium text-slate-500 bg-slate-800/60 border border-slate-700/40 px-2 py-1 rounded-md whitespace-nowrap">
                              {sub.trade}
                            </span>
                          </td>

                          {/* Status badge */}
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${s.badge} ${s.text} ${s.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot} ${sub.status === "Action Required" ? "animate-pulse" : ""}`} />
                              {sub.status}
                            </span>
                          </td>

                          {/* GL Expiry */}
                          <td className="px-5 py-3.5">
                            <span className={`font-mono-ui text-xs tabular-nums ${dateColor}`}>
                              {sub.glExpiry}
                            </span>
                          </td>

                          {/* WC Expiry */}
                          <td className="px-5 py-3.5">
                            <span className={`font-mono-ui text-xs tabular-nums ${dateColor}`}>
                              {sub.wcExpiry}
                            </span>
                          </td>

                          {/* Contact */}
                          <td className="px-5 py-3.5">
                            <span className="text-xs text-slate-600">{sub.contact}</span>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-3.5">
                            <div className="action-cell">
                              <ActionsMenu sub={sub} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer legend */}
              <div className="border-t border-slate-800/60 px-5 py-3 bg-slate-900/40 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-5 text-[11px] text-slate-600 font-mono-ui">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {counts.compliant} compliant
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    {counts.expiringSoon} expiring
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    {counts.actionRequired} action required
                  </span>
                </div>
                <span className="text-[11px] text-slate-700 font-mono-ui tracking-wide">
                  Last sync: just now
                </span>
              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}