"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Table from "@/components/Table";
import type { Subcontractor } from "@/components/Table";

// ─── Config — swap for real Supabase values ───────────────────────────────────
const COMPANY_ID  = "123";
const SITE_ORIGIN = "https://my-site.com";

// ─── Fake data ────────────────────────────────────────────────────────────────
function offsetDate(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const ALL_SUBS: Subcontractor[] = [
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
  { id: 11, name: "Vantage Elevator Systems",     trade: "Elevators",    expirationDate: offsetDate(22)   },
  { id: 12, name: "Bluestone Tile & Terrazzo",    trade: "Flooring",     expirationDate: offsetDate(190)  },
  { id: 13, name: "Trident Demolition Svcs.",     trade: "Demolition",   expirationDate: offsetDate(-55)  },
  { id: 14, name: "Cascade Insulation Co.",       trade: "Insulation",   expirationDate: offsetDate(330)  },
  { id: 15, name: "Hallmark Drywall Partners",    trade: "Drywall",      expirationDate: offsetDate(-3)   },
];

// ─── Status classifier ────────────────────────────────────────────────────────
function classify(iso: string): "Active" | "Expiring Soon" | "Expired" {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = Math.ceil((new Date(iso).getTime() - today.getTime()) / 86_400_000);
  if (days < 0)   return "Expired";
  if (days <= 30) return "Expiring Soon";
  return "Active";
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function ShieldCheck({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.955 11.955 0 0 0 3 11.965C3 18.033 7.373 22.5 12 22.5s9-4.467 9-10.535c0-2.152-.623-4.157-1.698-5.858A11.94 11.94 0 0 1 12 2.715z" />
    </svg>
  );
}
function LinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
    </svg>
  );
}
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}
function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
  );
}
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
    </svg>
  );
}
function FunnelIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591L15.75 12.5v6.44a.75.75 0 0 1-.387.656l-3 1.636a.75.75 0 0 1-1.113-.657V12.5L4.659 7.409A2.25 2.25 0 0 1 4 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3z" />
    </svg>
  );
}
function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18h3" />
    </svg>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string; value: number; accent: string; glowColor: string;
  icon: React.ReactNode; onClick: () => void; active: boolean;
}
function StatCard({ label, value, accent, glowColor, icon, onClick, active }: StatCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative w-full text-left rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 glass-card"
      style={active ? { boxShadow: `0 8px 40px -8px ${glowColor}55`, outline: `1.5px solid ${glowColor}40` } : undefined}
    >
      {active && (
        <span className="pointer-events-none absolute inset-0 rounded-2xl opacity-[0.07]"
          style={{ background: glowColor }} />
      )}
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-3">{label}</p>
          <p className={`text-5xl font-black tabular-nums ${accent}`}>{value}</p>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">subcontractors</p>
        </div>
        <div className={`p-2.5 rounded-xl bg-white/70 border border-white/90 shadow-sm ${accent}`}>{icon}</div>
      </div>
      {active && (
        <p className="absolute bottom-3 right-4 text-[10px] font-bold uppercase tracking-widest text-indigo-500">
          Filtered ↑
        </p>
      )}
    </button>
  );
}

// ─── Invite Button ────────────────────────────────────────────────────────────
function InviteButton({ companyId }: { companyId: string }) {
  const [copied,    setCopied]    = useState(false);
  const [showToast, setShowToast] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up on unmount
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const handleClick = async () => {
    const link = `${SITE_ORIGIN}/upload?company_id=${companyId}`;

    // Primary: modern Clipboard API
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // Fallback: textarea execCommand (works on HTTP / older browsers)
      const el = document.createElement("textarea");
      el.value = link;
      el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0;";
      document.body.appendChild(el);
      el.focus();
      el.select();
      try { document.execCommand("copy"); } catch { /* silent */ }
      document.body.removeChild(el);
    }

    // Show success state
    setCopied(true);
    setShowToast(true);

    // Reset after 3.5 s
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCopied(false);
      setShowToast(false);
    }, 3500);
  };

  return (
    <div className="relative">
      {/* Button */}
      <button
        onClick={handleClick}
        aria-live="polite"
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold
          transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1
          ${copied
            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200/60 scale-[1.02] focus-visible:ring-emerald-400"
            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-300/40 hover:-translate-y-px active:translate-y-0 focus-visible:ring-indigo-400"
          }
        `}
      >
        {copied ? (
          <>
            <CheckIcon className="w-4 h-4" />
            Link Copied!
          </>
        ) : (
          <>
            <LinkIcon className="w-4 h-4" />
            Invite Subcontractor
          </>
        )}
      </button>

      {/* Toast popup */}
      {showToast && (
        <div
          role="status"
          aria-live="polite"
          className="absolute top-full right-0 mt-3 z-50 toast-in"
        >
          {/* Caret */}
          <div className="absolute -top-[7px] right-[18px] w-3.5 h-3.5 rotate-45 bg-slate-900 border-l border-t border-slate-700/60" />

          {/* Card */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/60 shadow-2xl shadow-black/30 whitespace-nowrap">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/25 shrink-0">
              <PhoneIcon className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-snug">Copied to clipboard</p>
              <p className="text-[11px] font-medium text-emerald-400 mt-0.5">
                📱 Text this link to your sub!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
type FilterKind = "All" | "Active" | "Expiring Soon" | "Expired";

export default function ComplianceDashboard() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKind>("All");

  const counts = useMemo(() => ({
    Active:          ALL_SUBS.filter(s => classify(s.expirationDate) === "Active").length,
    "Expiring Soon": ALL_SUBS.filter(s => classify(s.expirationDate) === "Expiring Soon").length,
    Expired:         ALL_SUBS.filter(s => classify(s.expirationDate) === "Expired").length,
  }), []);

  const filteredData = useMemo(() =>
    ALL_SUBS
      .filter(s => filter === "All" || classify(s.expirationDate) === filter)
      .filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.trade ?? "").toLowerCase().includes(search.toLowerCase())
      ),
    [search, filter]
  );

  const toggleFilter = (f: FilterKind) => setFilter(prev => prev === f ? "All" : f);

  return (
    <>
      <style>{`
        /* Toast entrance */
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-10px) scale(0.94); }
          to   { opacity: 1; transform: translateY(0)     scale(1); }
        }
        .toast-in { animation: toastIn 0.22s cubic-bezier(0.22,1,0.36,1) both; }

        /* Glassmorphism cards */
        .glass-card {
          background: rgba(255,255,255,0.65);
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.75);
          box-shadow: 0 4px 24px -4px rgba(99,102,241,0.10), 0 1px 4px -1px rgba(15,23,42,0.06);
          transition: box-shadow 0.25s, transform 0.25s, background 0.2s;
        }
        .glass-card:hover {
          background: rgba(255,255,255,0.80);
          box-shadow: 0 12px 40px -6px rgba(99,102,241,0.18), 0 2px 8px -2px rgba(15,23,42,0.08);
        }

        /* Table row hover */
        tbody tr { transition: background-color 0.15s ease, box-shadow 0.15s ease; }
        tbody tr:hover {
          background-color: rgba(238,242,255,0.55) !important;
          box-shadow: inset 3px 0 0 0 #6366f1;
        }

        /* Ambient blobs */
        @keyframes blobDrift {
          0%   { transform: translate(0,0)        scale(1);    }
          33%  { transform: translate(28px,-18px) scale(1.04); }
          66%  { transform: translate(-14px,22px) scale(0.96); }
          100% { transform: translate(0,0)        scale(1);    }
        }
        .blob          { animation: blobDrift 16s ease-in-out infinite; }
        .blob-delay-2  { animation-delay: 2s; }
        .blob-delay-4  { animation-delay: 4s; }

        /* Page entrance */
        @keyframes pageUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        main { animation: pageUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      <div className="min-h-screen bg-gray-50 relative overflow-x-hidden">

        {/* Ambient mesh blobs */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="blob absolute -top-48 -left-48 w-[640px] h-[640px] rounded-full bg-indigo-200/25 blur-[120px]" />
          <div className="blob blob-delay-2 absolute top-1/2 -right-48 w-[520px] h-[520px] rounded-full bg-violet-200/20 blur-[100px]" />
          <div className="blob blob-delay-4 absolute -bottom-48 left-1/3 w-[420px] h-[420px] rounded-full bg-sky-200/15 blur-[80px]" />
        </div>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-30 border-b border-white/50 px-6 py-3 bg-white/60 backdrop-blur-xl shadow-sm shadow-slate-200/40">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-300/50">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-900 font-black text-base tracking-tight">Compliance</span>
                  <span className="text-indigo-600 font-black text-base tracking-tight">Vault</span>
                  <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-600 border border-indigo-200">
                    Enterprise
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Subcontractor Insurance Tracker</p>
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              {/* Live indicator */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-700">Live</span>
              </div>

              {/* ── Invite Subcontractor ── */}
              <InviteButton companyId={COMPANY_ID} />

              {/* Upload COI */}
              <a
                href="/upload"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold border border-slate-200 hover:bg-slate-200 hover:-translate-y-px active:translate-y-0 transition-all duration-150"
              >
                <UploadIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Upload COI</span>
              </a>
            </div>
          </div>
        </header>

        {/* ── Main ───────────────────────────────────────────────────────── */}
        <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">

          {/* Page heading */}
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-indigo-600 shrink-0" />
              Compliance Dashboard
            </h1>
            <p className="text-sm text-slate-500 pl-[34px]">
              Monitor subcontractor insurance status and manage certificate expirations.
            </p>
          </div>

          {/* ── Stat cards ─────────────────────────────────────────────── */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-4">
              Overview — click a card to filter
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <StatCard
                label="Compliant" value={counts.Active} accent="text-emerald-600"
                glowColor="#10b981" active={filter === "Active"}
                onClick={() => toggleFilter("Active")}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                  </svg>
                }
              />
              <StatCard
                label="Expiring Soon" value={counts["Expiring Soon"]} accent="text-amber-600"
                glowColor="#f59e0b" active={filter === "Expiring Soon"}
                onClick={() => toggleFilter("Expiring Soon")}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                  </svg>
                }
              />
              <StatCard
                label="Expired" value={counts.Expired} accent="text-red-600"
                glowColor="#ef4444" active={filter === "Expired"}
                onClick={() => toggleFilter("Expired")}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                }
              />
            </div>
          </section>

          {/* ── Table ──────────────────────────────────────────────────── */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">All Subcontractors</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {filteredData.length} of {ALL_SUBS.length} records
                  {filter !== "All" && (
                    <span className="ml-1 text-indigo-500 font-semibold">· filtered by {filter}</span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Search */}
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search subcontractors…"
                    className="pl-9 pr-8 py-2 text-sm rounded-xl w-52 bg-white/70 backdrop-blur-sm border border-slate-200/80 shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-300 transition-all duration-150"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Expired-only filter */}
                <button
                  onClick={() => toggleFilter("Expired")}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all duration-150
                    ${filter === "Expired"
                      ? "bg-red-600 text-white border-red-600 shadow-md shadow-red-200/50"
                      : "bg-white/70 backdrop-blur-sm text-slate-600 border-slate-200/80 hover:border-red-300 hover:text-red-600"
                    }`}
                >
                  <FunnelIcon className="w-3.5 h-3.5" />
                  Expired only
                </button>

                {/* Clear */}
                {(filter !== "All" || search) && (
                  <button
                    onClick={() => { setFilter("All"); setSearch(""); }}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Glass table wrapper */}
            <div className="rounded-2xl overflow-hidden bg-white/60 backdrop-blur-xl border border-white/70 shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5">
              <Table data={filteredData} />
            </div>
          </section>

          {/* ── Footer ─────────────────────────────────────────────────── */}
          <footer className="border-t border-slate-200/60 pt-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Compliance Vault Enterprise · All data encrypted at rest</span>
            </div>
            <span className="text-xs text-slate-400">
              {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
          </footer>
        </main>
      </div>
    </>
  );
}