"use client";

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Stage = "idle" | "dragging" | "verifying" | "confirm" | "submitting" | "success" | "error";

interface ExtractedData {
  companyName:    string | null;
  expirationDate: string | null;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=IBM+Plex+Mono:wght@300;400;500&display=swap');

  .font-display { font-family: 'Syne', sans-serif; }
  .font-mono-ui { font-family: 'IBM Plex Mono', monospace; }

  @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
  @keyframes bgScan  { 0% { transform:translateY(-100%); } 100% { transform:translateY(110vh); } }
  @keyframes spinRing { to { transform:rotate(360deg); } }
  @keyframes pulseRing {
    0%   { transform:scale(1);    opacity:.55; }
    100% { transform:scale(1.6);  opacity:0; }
  }
  @keyframes shimBar {
    0%   { transform:translateX(-100%); }
    100% { transform:translateX(100%); }
  }
  @keyframes dotBlink {
    0%,80%,100% { opacity:.2; transform:scaleY(.6); }
    40%          { opacity:1;  transform:scaleY(1); }
  }

  .a1 { animation: fadeUp .6s cubic-bezier(.22,1,.36,1) .05s  both; }
  .a2 { animation: fadeUp .6s cubic-bezier(.22,1,.36,1) .18s  both; }
  .a3 { animation: fadeUp .6s cubic-bezier(.22,1,.36,1) .30s  both; }
  .a4 { animation: fadeUp .6s cubic-bezier(.22,1,.36,1) .42s  both; }
  .bg-in { animation: fadeIn 1.2s ease both; }

  .scan-el {
    position:fixed; top:0; left:0; right:0; height:160px;
    background:linear-gradient(to bottom,transparent,rgba(59,130,246,.02) 50%,transparent);
    animation:bgScan 14s linear infinite;
    pointer-events:none; z-index:1;
  }
  .noise-el {
    position:fixed; inset:0; opacity:.016;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size:120px 120px; pointer-events:none; z-index:2;
  }

  /* Drop zone */
  .drop-zone {
    border:2px dashed rgba(51,65,85,.65);
    transition:border-color .25s, background .25s, transform .2s;
    cursor:pointer;
  }
  .drop-zone:hover { border-color:rgba(59,130,246,.6); background:rgba(59,130,246,.04); transform:scale(1.007); }
  .drop-zone.drag-over { border-color:rgba(96,165,250,.8); background:rgba(59,130,246,.07); transform:scale(1.01); }

  /* Spinner */
  .spin-ring { animation:spinRing 1s linear infinite; }

  /* Pulse halo behind spinner */
  .pulse-halo::before {
    content:''; position:absolute; inset:-8px; border-radius:50%;
    background:rgba(59,130,246,.3);
    animation:pulseRing 1.6s ease-out infinite;
  }

  /* Shimmer loading bar */
  .shim-bar { position:relative; overflow:hidden; background:rgba(30,41,59,.55); }
  .shim-bar::after {
    content:''; position:absolute; inset:0;
    background:linear-gradient(90deg,transparent,rgba(59,130,246,.28),transparent);
    animation:shimBar 1.4s ease-in-out infinite;
  }

  /* Typing dots */
  .t-dot {
    display:inline-block; width:4px; height:14px;
    background:rgba(96,165,250,.65); border-radius:2px;
    animation:dotBlink 1.2s ease-in-out infinite;
  }
  .t-dot:nth-child(2) { animation-delay:.15s; }
  .t-dot:nth-child(3) { animation-delay:.30s; }

  /* Vault input */
  .vi {
    background:rgba(15,23,42,.65);
    border:1px solid rgba(51,65,85,.65);
    color:#e2e8f0;
    outline:none; width:100%; box-sizing:border-box;
    transition:border-color .2s, background .2s, box-shadow .2s;
  }
  .vi:focus {
    border-color:rgba(59,130,246,.65);
    background:rgba(15,23,42,.9);
    box-shadow:0 0 0 3px rgba(59,130,246,.1);
  }
  .vi::placeholder { color:rgba(100,116,139,.5); }
  .vi::-webkit-calendar-picker-indicator { filter:invert(.4) brightness(1.2); }

  /* Buttons */
  .btn-blue {
    background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 45%,#2563eb 100%);
    background-size:200% 100%; background-position:0 0;
    box-shadow:0 4px 22px rgba(37,99,235,.35),inset 0 1px 0 rgba(255,255,255,.1);
    transition:background-position .4s, box-shadow .2s, transform .15s;
    border:none; color:#fff; cursor:pointer;
  }
  .btn-blue:hover:not(:disabled) {
    background-position:100% 0;
    box-shadow:0 7px 32px rgba(37,99,235,.55);
    transform:translateY(-1px);
  }
  .btn-blue:active:not(:disabled) { transform:translateY(0); }
  .btn-blue:disabled { opacity:.4; cursor:not-allowed; }

  .btn-ghost {
    background:rgba(30,41,59,.6); border:1px solid rgba(51,65,85,.5);
    color:rgba(148,163,184,.8); cursor:pointer;
    transition:background .15s;
  }
  .btn-ghost:hover { background:rgba(30,41,59,.9); }

  /* Card entrance */
  .c-in { animation:fadeUp .45s cubic-bezier(.22,1,.36,1) both; }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtBytes = (n: number) =>
  n < 1024 ? `${n} B` : n < 1048576 ? `${(n/1024).toFixed(1)} KB` : `${(n/1048576).toFixed(1)} MB`;

// ─── Icons ────────────────────────────────────────────────────────────────────

const IcoUpload = ({ size=36, muted=false }: { size?: number; muted?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={muted ? "rgba(59,130,246,.45)" : "rgba(96,165,250,.85)"} strokeWidth="1.3">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.338-2.32 5.75 5.75 0 0 1 1.023 11.096" />
  </svg>
);

const IcoFile = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(96,165,250,.75)" strokeWidth="1.4">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9z" />
  </svg>
);

const IcoShield = ({ s=14, c="rgba(96,165,250,.6)" }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.955 11.955 0 0 0 3 11.965C3 18.033 7.373 22.5 12 22.5s9-4.467 9-10.535c0-2.152-.623-4.157-1.698-5.858A11.94 11.94 0 0 1 12 2.715z" />
  </svg>
);

const IcoCheck = ({ big=false }: { big?: boolean }) => (
  <svg width={big?32:16} height={big?32:16} viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth={big?1.75:2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
  </svg>
);

const IcoX = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

const IcoCal = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
  </svg>
);

const IcoBldg = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
  </svg>
);

// ─── Step bar ─────────────────────────────────────────────────────────────────

const STAGE_STEP: Record<Stage, number> = {
  idle:0, dragging:0, verifying:1, confirm:2, submitting:3, success:4, error:0,
};

function StepBar({ stage }: { stage: Stage }) {
  const cur = STAGE_STEP[stage];
  const steps = ["Upload","AI Verify","Confirm","Submit"];
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"28px" }}>
      {steps.map((label, i) => {
        const done   = i < cur;
        const active = i === cur;
        return (
          <div key={label} style={{ display:"flex", alignItems:"center" }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"5px" }}>
              <div style={{
                width:"26px", height:"26px", borderRadius:"50%",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"10px", fontWeight:600, letterSpacing:".04em",
                background: done ? "rgba(52,211,153,.12)" : active ? "rgba(59,130,246,.14)" : "rgba(30,41,59,.8)",
                border:`1px solid ${done?"rgba(52,211,153,.38)":active?"rgba(59,130,246,.48)":"rgba(51,65,85,.5)"}`,
                color: done?"#34d399":active?"#60a5fa":"rgba(71,85,105,.65)",
                boxShadow: active?"0 0 10px rgba(59,130,246,.18)":"none",
                transition:"all .3s ease",
              }}>
                {done?"✓":i+1}
              </div>
              <span style={{
                fontSize:"9px", letterSpacing:".17em", textTransform:"uppercase",
                color: done?"rgba(52,211,153,.75)":active?"rgba(96,165,250,.9)":"rgba(71,85,105,.5)",
                transition:"color .3s",
              }}>{label}</span>
            </div>
            {i < steps.length-1 && (
              <div style={{
                width:"44px", height:"1px", marginBottom:"20px",
                background: done?"rgba(52,211,153,.28)":"rgba(51,65,85,.4)",
                transition:"background .3s",
              }}/>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UploadPage() {
  const [stage,    setStage]    = useState<Stage>("idle");
  const [file,     setFile]     = useState<File | null>(null);
  const [extracted, setExtracted] = useState<ExtractedData>({ companyName:null, expirationDate:null });
  const [cName,    setCName]    = useState("");
  const [expDate,  setExpDate]  = useState("");
  const [errMsg,   setErrMsg]   = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Process file ──────────────────────────────────────────────────────────
  const processFile = useCallback(async (f: File) => {
    const ok = ["application/pdf","image/jpeg","image/png","image/webp"].includes(f.type);
    if (!ok)              { setErrMsg("Upload a PDF, JPEG, PNG, or WEBP file."); setStage("error"); return; }
    if (f.size > 20<<20)  { setErrMsg("File must be under 20 MB.");             setStage("error"); return; }

    setFile(f);
    setStage("verifying");
    setErrMsg("");

    try {
      const fd = new FormData();
      fd.append("file", f);
      const res  = await fetch("/api/extract", { method:"POST", body:fd });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Extraction failed.");

      const data: ExtractedData = {
        companyName:    json.subcontractorName ?? "",
        expirationDate: json.expirationDate    ?? "",
      };
      setExtracted(data);
      setCName(data.companyName    ?? "");
      setExpDate(data.expirationDate ?? "");
      setStage("confirm");
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : "Something went wrong.");
      setStage("error");
    }
  }, []);

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setStage("idle");
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  };
  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };
  const reset = () => {
    setStage("idle"); setFile(null);
    setExtracted({ companyName:null, expirationDate:null });
    setCName(""); setExpDate(""); setErrMsg("");
    if (fileRef.current) fileRef.current.value = "";
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setStage("submitting");
    try {
      // Wire real Supabase insert here:
      // await supabase.from("certificates").insert({
      //   company_name: cName, expiration_date: expDate, file_name: file?.name
      // });
      await new Promise(r => setTimeout(r, 1400));
      setStage("success");
    } catch {
      setErrMsg("Failed to save. Please try again.");
      setStage("error");
    }
  };

  // ── Label style helper ────────────────────────────────────────────────────
  const lbl: React.CSSProperties = {
    display:"flex", alignItems:"center", gap:"6px",
    fontSize:"9.5px", letterSpacing:".22em", textTransform:"uppercase",
    color:"rgba(100,116,139,.7)", marginBottom:"7px",
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="scan-el"  aria-hidden="true" />
      <div className="noise-el" aria-hidden="true" />

      <div
        className="font-mono-ui bg-in min-h-screen flex flex-col items-center justify-center px-4 py-12"
        style={{ background:"radial-gradient(ellipse 110% 70% at 50% -8%,#0d1829 0%,#090e1a 45%,#050709 100%)" }}
      >
        {/* Grid */}
        <div aria-hidden="true" className="fixed inset-0 pointer-events-none" style={{
          backgroundImage:"linear-gradient(rgba(59,130,246,.028) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,.028) 1px,transparent 1px)",
          backgroundSize:"50px 50px",
        }}/>
        {/* Vignette */}
        <div aria-hidden="true" className="fixed inset-0 pointer-events-none" style={{
          background:"radial-gradient(ellipse 80% 80% at 50% 50%,transparent 30%,rgba(0,0,0,.62) 100%)",
        }}/>

        <div className="relative z-10 w-full" style={{ maxWidth:"560px" }}>

          {/* ── Page header ─────────────────────────────────────── */}
          <div className="a1" style={{ textAlign:"center", marginBottom:"32px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"10px", marginBottom:"10px" }}>
              <div style={{
                width:"36px", height:"36px", borderRadius:"9px",
                display:"flex", alignItems:"center", justifyContent:"center",
                background:"rgba(37,99,235,.12)", border:"1px solid rgba(59,130,246,.22)",
                boxShadow:"0 4px 14px rgba(37,99,235,.15)",
              }}>
                <IcoShield s={18} c="#60a5fa" />
              </div>
              <h1 className="font-display" style={{ fontSize:"21px", fontWeight:700, color:"#f1f5f9", letterSpacing:"-.3px", margin:0 }}>
                Compliance Vault
              </h1>
            </div>
            <p style={{ fontSize:"10.5px", letterSpacing:".24em", textTransform:"uppercase", color:"rgba(100,116,139,.55)" }}>
              Certificate of Insurance · Upload Portal
            </p>
          </div>

          {/* ── Step bar ────────────────────────────────────────── */}
          <div className="a2"><StepBar stage={stage} /></div>

          {/* ── Card ────────────────────────────────────────────── */}
          <div
            className="a3"
            style={{
              borderRadius:"18px",
              background:"linear-gradient(160deg,rgba(13,20,38,.97) 0%,rgba(7,10,18,.99) 100%)",
              border:"1px solid rgba(51,65,85,.55)",
              boxShadow:"0 28px 60px rgba(0,0,0,.6), 0 0 0 1px rgba(59,130,246,.05)",
              overflow:"hidden", position:"relative",
            }}
          >
            {/* Top shimmer line */}
            <div aria-hidden="true" style={{
              position:"absolute", top:0, left:0, right:0, height:"1px",
              background:"linear-gradient(90deg,transparent,rgba(59,130,246,.38),transparent)",
            }}/>

            <div style={{ padding:"36px 36px 32px" }}>

              {/* ══ IDLE / DRAGGING ══════════════════════════════════ */}
              {(stage==="idle"||stage==="dragging") && (
                <div
                  className={`drop-zone${stage==="dragging"?" drag-over":""}`}
                  style={{ borderRadius:"12px", padding:"52px 20px 44px", textAlign:"center" }}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setStage("dragging"); }}
                  onDragLeave={() => setStage("idle")}
                  onDrop={onDrop}
                  role="button" tabIndex={0}
                  onKeyDown={e => e.key==="Enter" && fileRef.current?.click()}
                  aria-label="Click or drag to upload your COI"
                >
                  <input ref={fileRef} type="file" accept=".pdf,image/*" style={{ display:"none" }} onChange={onPick} />

                  {/* Upload icon with animated glow ring */}
                  <div style={{ display:"flex", justifyContent:"center", marginBottom:"22px" }}>
                    <div style={{
                      width:"76px", height:"76px", borderRadius:"50%",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      background:"rgba(37,99,235,.08)", border:"1px solid rgba(59,130,246,.16)",
                      boxShadow:"0 0 36px rgba(37,99,235,.1)",
                      transition:"all .25s ease",
                    }}>
                      <IcoUpload size={36} muted={stage!=="dragging"} />
                    </div>
                  </div>

                  <p className="font-display" style={{ fontSize:"17px", fontWeight:700, color:"#e2e8f0", marginBottom:"8px", letterSpacing:"-.25px" }}>
                    {stage==="dragging" ? "Release to upload" : "Upload your Certificate of Insurance (COI)"}
                  </p>
                  <p style={{ fontSize:"12px", color:"rgba(100,116,139,.65)", marginBottom:"22px", letterSpacing:".02em" }}>
                    Drag & drop your file here, or{" "}
                    <span style={{ color:"rgba(96,165,250,.9)" }}>browse files</span>
                  </p>

                  {/* Format chips */}
                  <div style={{ display:"flex", justifyContent:"center", gap:"7px", flexWrap:"wrap" }}>
                    {["PDF","JPEG","PNG","WEBP"].map(f => (
                      <span key={f} style={{
                        padding:"3px 10px", borderRadius:"999px",
                        fontSize:"9px", fontWeight:500, letterSpacing:".14em", textTransform:"uppercase",
                        background:"rgba(30,41,59,.7)", border:"1px solid rgba(51,65,85,.5)",
                        color:"rgba(100,116,139,.7)",
                      }}>{f}</span>
                    ))}
                    <span style={{ fontSize:"9px", color:"rgba(71,85,105,.5)", padding:"3px 4px", letterSpacing:".1em" }}>
                      · Max 20 MB
                    </span>
                  </div>
                </div>
              )}

              {/* ══ VERIFYING ════════════════════════════════════════ */}
              {stage==="verifying" && (
                <div className="c-in" style={{ textAlign:"center", padding:"12px 0 6px" }}>

                  {/* File badge */}
                  {file && (
                    <div style={{
                      display:"flex", alignItems:"center", gap:"10px",
                      padding:"9px 13px", borderRadius:"10px", marginBottom:"28px",
                      background:"rgba(30,41,59,.5)", border:"1px solid rgba(51,65,85,.5)",
                      textAlign:"left",
                    }}>
                      <IcoFile />
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:"12px", color:"#e2e8f0", fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {file.name}
                        </p>
                        <p style={{ fontSize:"9.5px", color:"rgba(100,116,139,.55)", marginTop:"1px" }}>
                          {fmtBytes(file.size)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Spinner with pulse halo */}
                  <div style={{ display:"flex", justifyContent:"center", marginBottom:"22px" }}>
                    <div className="pulse-halo" style={{
                      width:"64px", height:"64px", borderRadius:"50%", position:"relative",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      background:"rgba(37,99,235,.1)", border:"1px solid rgba(59,130,246,.2)",
                    }}>
                      <svg className="spin-ring" width="42" height="42" viewBox="0 0 42 42" fill="none">
                        <circle cx="21" cy="21" r="17" stroke="rgba(51,65,85,.45)" strokeWidth="3"/>
                        <path d="M21 4 A17 17 0 0 1 38 21" stroke="url(#g1)" strokeWidth="3" strokeLinecap="round" fill="none"/>
                        <defs>
                          <linearGradient id="g1" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%"   stopColor="#3b82f6" stopOpacity="0"/>
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="1"/>
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>

                  <p className="font-display" style={{ fontSize:"17px", fontWeight:700, color:"#e2e8f0", marginBottom:"7px" }}>
                    AI is verifying your documents...
                  </p>
                  <p style={{ fontSize:"12px", color:"rgba(100,116,139,.6)", marginBottom:"28px", letterSpacing:".02em" }}>
                    Reading certificate fields with Claude Vision
                  </p>

                  {/* Progress steps */}
                  {[
                    { label:"Parsing document structure",   done:true  },
                    { label:"Extracting insurance fields",  done:false },
                    { label:"Validating expiration dates",  done:false },
                  ].map((s,i) => (
                    <div key={i} style={{
                      display:"flex", alignItems:"center", gap:"10px",
                      padding:"8px 12px", borderRadius:"8px", marginBottom:"6px",
                      background:"rgba(15,23,42,.45)",
                      animation:`fadeUp .4s ease ${i*.12}s both`,
                      textAlign:"left",
                    }}>
                      <div style={{ width:"16px", height:"16px", flexShrink:0 }}>
                        {s.done
                          ? <IcoCheck />
                          : <div className="shim-bar" style={{ width:"16px", height:"16px", borderRadius:"50%" }} />
                        }
                      </div>
                      <span style={{ flex:1, fontSize:"11.5px", color:s.done?"rgba(52,211,153,.8)":"rgba(100,116,139,.6)" }}>
                        {s.label}
                      </span>
                      {!s.done && (
                        <div style={{ display:"flex", gap:"3px" }}>
                          <span className="t-dot"/><span className="t-dot"/><span className="t-dot"/>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Progress bar */}
                  <div className="shim-bar" style={{ height:"3px", borderRadius:"99px", marginTop:"22px" }} />
                </div>
              )}

              {/* ══ CONFIRM ══════════════════════════════════════════ */}
              {stage==="confirm" && (
                <div className="c-in">
                  {/* Success file badge */}
                  {file && (
                    <div style={{
                      display:"flex", alignItems:"center", gap:"10px",
                      padding:"9px 13px", borderRadius:"10px", marginBottom:"22px",
                      background:"rgba(52,211,153,.06)", border:"1px solid rgba(52,211,153,.2)",
                    }}>
                      <IcoCheck big />
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:"11.5px", color:"#34d399", fontWeight:600 }}>AI extraction complete</p>
                        <p style={{ fontSize:"10px", color:"rgba(100,116,139,.6)", marginTop:"1px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {file.name} · {fmtBytes(file.size)}
                        </p>
                      </div>
                      <button onClick={reset} style={{ color:"rgba(100,116,139,.5)", background:"none", border:"none", cursor:"pointer", padding:"2px" }} aria-label="Remove file">
                        <IcoX />
                      </button>
                    </div>
                  )}

                  <p className="font-display" style={{ fontSize:"15px", fontWeight:700, color:"#e2e8f0", marginBottom:"4px" }}>
                    Verify extracted details
                  </p>
                  <p style={{ fontSize:"11.5px", color:"rgba(100,116,139,.6)", marginBottom:"20px", letterSpacing:".02em" }}>
                    Review and edit if needed, then submit to the vault.
                  </p>

                  {/* Fields */}
                  <div style={{ display:"flex", flexDirection:"column", gap:"16px", marginBottom:"20px" }}>

                    {/* Company name */}
                    <div>
                      <label htmlFor="cname" style={lbl}><IcoBldg /> Company Name (Insured)</label>
                      <input
                        id="cname" type="text" value={cName}
                        onChange={e => setCName(e.target.value)}
                        placeholder="e.g. Fremont Concrete Co."
                        className="vi"
                        style={{ padding:"10px 13px", fontSize:"13px", borderRadius:"9px", letterSpacing:".02em" }}
                      />
                      {!extracted.companyName && (
                        <p style={{ fontSize:"10px", color:"rgba(251,191,36,.7)", marginTop:"5px" }}>
                          ⚠ Not found — please enter manually
                        </p>
                      )}
                    </div>

                    {/* Expiration date */}
                    <div>
                      <label htmlFor="expd" style={lbl}><IcoCal /> GL Expiration Date</label>
                      <input
                        id="expd" type="date" value={expDate}
                        onChange={e => setExpDate(e.target.value)}
                        className="vi"
                        style={{ padding:"10px 13px", fontSize:"13px", borderRadius:"9px", colorScheme:"dark" }}
                      />
                      {!extracted.expirationDate && (
                        <p style={{ fontSize:"10px", color:"rgba(251,191,36,.7)", marginTop:"5px" }}>
                          ⚠ Not found — please enter manually
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Security note */}
                  <div style={{
                    display:"flex", alignItems:"center", gap:"8px",
                    padding:"9px 12px", borderRadius:"8px", marginBottom:"20px",
                    background:"rgba(15,23,42,.5)", border:"1px solid rgba(51,65,85,.4)",
                    fontSize:"10.5px", color:"rgba(100,116,139,.55)",
                  }}>
                    <IcoShield s={12} c="rgba(71,85,105,.6)" />
                    Data is encrypted and stored securely in the Compliance Vault.
                  </div>

                  {/* Buttons */}
                  <div style={{ display:"flex", gap:"10px" }}>
                    <button className="btn-ghost" onClick={reset}
                      style={{ flex:"0 0 auto", padding:"11px 18px", borderRadius:"9px", fontSize:"11px", letterSpacing:".1em", textTransform:"uppercase" }}>
                      Re-upload
                    </button>
                    <button
                      className="btn-blue" onClick={handleSubmit}
                      disabled={!cName || !expDate}
                      style={{ flex:1, padding:"11px 18px", borderRadius:"9px", fontSize:"11px", letterSpacing:".14em", textTransform:"uppercase", fontWeight:600 }}>
                      Submit to Vault
                    </button>
                  </div>
                </div>
              )}

              {/* ══ SUBMITTING ════════════════════════════════════════ */}
              {stage==="submitting" && (
                <div className="c-in" style={{ textAlign:"center", padding:"16px 0" }}>
                  <div style={{ display:"flex", justifyContent:"center", marginBottom:"18px" }}>
                    <svg className="spin-ring" width="44" height="44" viewBox="0 0 44 44" fill="none">
                      <circle cx="22" cy="22" r="18" stroke="rgba(51,65,85,.45)" strokeWidth="3"/>
                      <path d="M22 4 A18 18 0 0 1 40 22" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <p className="font-display" style={{ fontSize:"16px", fontWeight:700, color:"#e2e8f0" }}>Saving to vault…</p>
                  <p style={{ fontSize:"11.5px", color:"rgba(100,116,139,.6)", marginTop:"6px" }}>Encrypting and storing your certificate</p>
                </div>
              )}

              {/* ══ SUCCESS ═════════════════════════════════════════ */}
              {stage==="success" && (
                <div className="c-in" style={{ textAlign:"center", padding:"10px 0" }}>
                  <div style={{ display:"flex", justifyContent:"center", marginBottom:"16px" }}>
                    <div style={{
                      width:"64px", height:"64px", borderRadius:"50%",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      background:"rgba(52,211,153,.1)", border:"1px solid rgba(52,211,153,.28)",
                      boxShadow:"0 0 24px rgba(52,211,153,.14)",
                    }}>
                      <IcoCheck big />
                    </div>
                  </div>
                  <p className="font-display" style={{ fontSize:"19px", fontWeight:700, color:"#34d399", marginBottom:"8px" }}>
                    Submitted to Vault!
                  </p>
                  <p style={{ fontSize:"12px", color:"rgba(226,232,240,.65)", marginBottom:"4px" }}>
                    <strong style={{ color:"rgba(226,232,240,.85)" }}>{cName}</strong> has been verified.
                  </p>
                  <p style={{ fontSize:"12px", color:"rgba(100,116,139,.55)", marginBottom:"28px" }}>
                    Expiry: <span style={{ color:"rgba(96,165,250,.8)" }}>{expDate}</span>
                  </p>
                  <button className="btn-ghost" onClick={reset}
                    style={{ padding:"10px 24px", borderRadius:"9px", fontSize:"11px", letterSpacing:".12em", textTransform:"uppercase" }}>
                    Upload Another
                  </button>
                </div>
              )}

              {/* ══ ERROR ════════════════════════════════════════════ */}
              {stage==="error" && (
                <div className="c-in" style={{ textAlign:"center", padding:"10px 0" }}>
                  <div style={{
                    width:"56px", height:"56px", borderRadius:"50%", margin:"0 auto 16px",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.24)",
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.008v.008H12v-.008z"/>
                    </svg>
                  </div>
                  <p className="font-display" style={{ fontSize:"16px", fontWeight:700, color:"#f87171", marginBottom:"8px" }}>Something went wrong</p>
                  <p style={{ fontSize:"12px", color:"rgba(100,116,139,.65)", marginBottom:"24px" }}>{errMsg}</p>
                  <button className="btn-blue" onClick={reset}
                    style={{ padding:"10px 24px", borderRadius:"9px", fontSize:"11px", letterSpacing:".12em", textTransform:"uppercase" }}>
                    Try Again
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* ── Footer ──────────────────────────────────────────── */}
          <div className="a4" style={{
            display:"flex", alignItems:"center", justifyContent:"center",
            gap:"7px", marginTop:"18px", color:"rgba(30,41,59,.75)",
          }}>
            <IcoShield s={10} c="rgba(51,65,85,.55)" />
            <span style={{ fontSize:"9px", letterSpacing:".2em", textTransform:"uppercase" }}>
              256-bit TLS · SOC 2 Type II · Industrial Corridor
            </span>
          </div>

        </div>
      </div>
    </>
  );
}