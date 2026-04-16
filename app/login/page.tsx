"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// ─── Inline styles & animations ──────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');

  .login-root { font-family: 'DM Mono', 'Courier New', monospace; }
  .display-font { font-family: 'Cormorant Garamond', Georgia, serif; }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }
  @keyframes scanline {
    0%   { transform: translateY(-100%); opacity: 1; }
    100% { transform: translateY(100vh); opacity: 0; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .anim-1 { animation: fadeSlideUp 0.75s cubic-bezier(0.22,1,0.36,1) 0.05s both; }
  .anim-2 { animation: fadeSlideUp 0.75s cubic-bezier(0.22,1,0.36,1) 0.2s  both; }
  .anim-3 { animation: fadeSlideUp 0.75s cubic-bezier(0.22,1,0.36,1) 0.35s both; }
  .anim-4 { animation: fadeSlideUp 0.75s cubic-bezier(0.22,1,0.36,1) 0.5s  both; }
  .anim-5 { animation: fadeSlideUp 0.75s cubic-bezier(0.22,1,0.36,1) 0.65s both; }
  .anim-6 { animation: fadeSlideUp 0.75s cubic-bezier(0.22,1,0.36,1) 0.75s both; }

  .bg-fade { animation: fadeIn 1.4s ease both; }

  .gold-shimmer {
    background: linear-gradient(90deg, #7a6a4a 0%, #c8aa72 30%, #e8d5a3 50%, #c8aa72 70%, #7a6a4a 100%);
    background-size: 600px 100%;
    animation: shimmer 3.5s ease-in-out infinite;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .scanline-el {
    position: fixed; top: 0; left: 0; right: 0;
    height: 200px;
    background: linear-gradient(to bottom, transparent 0%, rgba(180,158,110,0.018) 50%, transparent 100%);
    animation: scanline 10s ease-in-out infinite;
    pointer-events: none; z-index: 1;
  }

  .noise-bg {
    position: fixed; inset: 0;
    opacity: 0.022;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 150px 150px;
    pointer-events: none; z-index: 2;
  }

  .gold-input {
    background: rgba(180,158,110,0.04);
    border: 1px solid rgba(180,158,110,0.18);
    color: #e8d9c4;
    transition: border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
    caret-color: #c8aa72;
    outline: none;
  }
  .gold-input::placeholder { color: rgba(180,158,110,0.28); }
  .gold-input:focus {
    border-color: rgba(180,158,110,0.65);
    background: rgba(180,158,110,0.07);
    box-shadow: 0 0 0 4px rgba(180,158,110,0.07), inset 0 1px 0 rgba(255,255,255,0.04);
  }

  .gold-btn {
    background: linear-gradient(135deg, #c8aa72 0%, #a08650 35%, #c8aa72 65%, #a08650 100%);
    background-size: 300% 100%;
    background-position: 0% 0;
    color: #12100a;
    transition: background-position 0.5s ease, box-shadow 0.25s ease, transform 0.15s ease;
    box-shadow: 0 4px 28px rgba(180,158,110,0.2), inset 0 1px 0 rgba(255,255,255,0.2);
  }
  .gold-btn:hover:not(:disabled) {
    background-position: 100% 0;
    box-shadow: 0 6px 36px rgba(180,158,110,0.38), inset 0 1px 0 rgba(255,255,255,0.25);
    transform: translateY(-1px);
  }
  .gold-btn:active:not(:disabled) { transform: translateY(0px); }
  .gold-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  .corner { position: absolute; width: 14px; height: 14px; border-color: rgba(180,158,110,0.35); border-style: solid; }
  .c-tl { top: 0;  left: 0;  border-width: 1px 0 0 1px; }
  .c-tr { top: 0;  right: 0; border-width: 1px 1px 0 0; }
  .c-bl { bottom: 0; left: 0;  border-width: 0 0 1px 1px; }
  .c-br { bottom: 0; right: 0; border-width: 0 1px 1px 0; }

  .eye-btn { background: none; border: none; cursor: pointer; padding: 0; color: rgba(180,158,110,0.35); transition: color 0.2s; }
  .eye-btn:hover { color: rgba(180,158,110,0.75); }

  .link-gold { color: rgba(180,158,110,0.35); text-decoration: none; transition: color 0.2s; letter-spacing: 0.18em; text-transform: uppercase; font-size: 10px; }
  .link-gold:hover { color: rgba(180,158,110,0.75); }

  .error-box {
    background: rgba(200,60,50,0.06);
    border: 1px solid rgba(200,60,50,0.22);
    color: rgba(240,148,140,0.9);
    animation: fadeSlideUp 0.3s ease both;
  }

  .divider-gold {
    flex: 1; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(180,158,110,0.18), transparent);
  }

  .spinner { animation: spin 0.9s linear infinite; }
`;

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconMail = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IconEyeOpen = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconEyeClosed = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const IconAlert = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{flexShrink:0,marginTop:"1px"}}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const IconShield = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9,12 11,14 15,10"/>
  </svg>
);
const IconSpinner = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="spinner">
    <path d="M21 12a9 9 0 1 1-6.22-8.56" strokeLinecap="round"/>
  </svg>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router   = useRouter();
  const supabase = createClientComponentClient();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [mounted,  setMounted]  = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/dashboard");
    });
    const t = setTimeout(() => emailRef.current?.focus(), 900);
    return () => clearTimeout(t);
  }, [supabase, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setError(null);
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError) {
      setError(
        authError.message.toLowerCase().includes("invalid")
          ? "The credentials you entered are incorrect."
          : authError.message
      );
      setLoading(false);
      return;
    }

    router.replace("/dashboard");
  };

  if (!mounted) return null;

  return (
    <>
      <style>{STYLES}</style>

      {/* Atmospheric FX */}
      <div className="scanline-el" aria-hidden="true" />
      <div className="noise-bg" aria-hidden="true" />

      {/* Page */}
      <div
        className="login-root bg-fade min-h-screen flex flex-col items-center justify-center px-4"
        style={{
          background:
            "radial-gradient(ellipse 90% 65% at 50% -5%, #1c1708 0%, #0e0d0b 50%, #070706 100%)",
        }}
      >
        {/* Background grid */}
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none select-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(180,158,110,0.035) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(180,158,110,0.035) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        {/* Deep vignette */}
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 75% 75% at 50% 50%, transparent 30%, rgba(0,0,0,0.65) 100%)",
          }}
        />

        {/* ── Card ── */}
        <div className="relative z-10 w-full" style={{ maxWidth: "400px" }}>

          {/* Outer border frame */}
          <div
            className="relative p-px"
            style={{ border: "1px solid rgba(180,158,110,0.1)" }}
          >
            {/* Corner accents */}
            <span className="corner c-tl" /><span className="corner c-tr" />
            <span className="corner c-bl" /><span className="corner c-br" />

            {/* Card body */}
            <div
              className="relative px-10 py-11"
              style={{
                background:
                  "linear-gradient(165deg, rgba(22,19,11,0.98) 0%, rgba(11,10,8,0.99) 100%)",
              }}
            >
              {/* Inner inset highlight */}
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(160deg, rgba(180,158,110,0.04) 0%, transparent 60%)",
                }}
              />

              {/* ── Brand mark ── */}
              <div className="anim-1 flex flex-col items-center gap-4 mb-9">
                {/* Crest */}
                <div
                  style={{
                    width: "52px", height: "52px",
                    border: "1px solid rgba(180,158,110,0.3)",
                    background: "rgba(180,158,110,0.055)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(180,158,110,0.8)" strokeWidth="1.25">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <polyline points="9,12 11,14 15,10" strokeWidth="1.5"/>
                  </svg>
                </div>

                <div className="text-center" style={{ lineHeight: 1 }}>
                  <div
                    className="display-font gold-shimmer"
                    style={{ fontSize: "38px", fontWeight: 300, letterSpacing: "0.2em" }}
                  >
                    AURUM
                  </div>
                  <div
                    style={{
                      fontSize: "8.5px",
                      letterSpacing: "0.38em",
                      color: "rgba(180,158,110,0.35)",
                      marginTop: "6px",
                      textTransform: "uppercase",
                    }}
                  >
                    Private Banking Group
                  </div>
                </div>
              </div>

              {/* ── Divider ── */}
              <div className="anim-2 flex items-center gap-3 mb-7">
                <div className="divider-gold" />
                <span style={{ fontSize: "8px", letterSpacing: "0.32em", color: "rgba(180,158,110,0.28)", textTransform: "uppercase" }}>
                  Secure Portal
                </span>
                <div className="divider-gold" />
              </div>

              {/* ── Form ── */}
              <form onSubmit={handleSubmit} noValidate>

                {/* Email field */}
                <div className="anim-3" style={{ marginBottom: "18px" }}>
                  <label
                    htmlFor="email"
                    style={{
                      display: "flex", alignItems: "center", gap: "7px",
                      fontSize: "9.5px", letterSpacing: "0.24em",
                      color: "rgba(180,158,110,0.5)",
                      textTransform: "uppercase", marginBottom: "8px",
                    }}
                  >
                    <IconMail /> Email Address
                  </label>
                  <input
                    ref={emailRef}
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(null); }}
                    placeholder="name@institution.com"
                    className="gold-input w-full"
                    style={{
                      padding: "11px 14px",
                      fontSize: "12.5px",
                      letterSpacing: "0.04em",
                      borderRadius: "1px",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Password field */}
                <div className="anim-4" style={{ marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <label
                      htmlFor="password"
                      style={{
                        display: "flex", alignItems: "center", gap: "7px",
                        fontSize: "9.5px", letterSpacing: "0.24em",
                        color: "rgba(180,158,110,0.5)",
                        textTransform: "uppercase",
                      }}
                    >
                      <IconLock /> Passphrase
                    </label>
                    <a href="#" className="link-gold">Forgot?</a>
                  </div>
                  <div style={{ position: "relative" }}>
                    <input
                      id="password"
                      type={showPass ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(null); }}
                      placeholder="••••••••••••"
                      className="gold-input w-full"
                      style={{
                        padding: "11px 42px 11px 14px",
                        fontSize: "13px",
                        letterSpacing: showPass ? "0.04em" : "0.18em",
                        borderRadius: "1px",
                        width: "100%",
                        boxSizing: "border-box",
                      }}
                    />
                    <button
                      type="button"
                      className="eye-btn"
                      onClick={() => setShowPass(v => !v)}
                      aria-label={showPass ? "Hide passphrase" : "Show passphrase"}
                      style={{ position: "absolute", right: "13px", top: "50%", transform: "translateY(-50%)" }}
                    >
                      {showPass ? <IconEyeOpen /> : <IconEyeClosed />}
                    </button>
                  </div>
                </div>

                {/* Error banner */}
                {error && (
                  <div
                    className="error-box"
                    style={{
                      display: "flex", alignItems: "flex-start", gap: "9px",
                      padding: "10px 13px", marginBottom: "18px",
                      fontSize: "11.5px", letterSpacing: "0.02em", borderRadius: "1px",
                    }}
                  >
                    <IconAlert />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit */}
                <div className="anim-5">
                  <button
                    type="submit"
                    disabled={loading || !email || !password}
                    className="gold-btn w-full"
                    style={{
                      padding: "13px 24px",
                      fontSize: "10px",
                      letterSpacing: "0.28em",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      borderRadius: "1px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      width: "100%",
                      border: "none",
                    }}
                  >
                    {loading ? (
                      <><IconSpinner />Authenticating</>
                    ) : (
                      <><IconLock />Access Account</>
                    )}
                  </button>
                </div>
              </form>

              {/* ── Security badge ── */}
              <div
                className="anim-6"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: "7px", marginTop: "28px",
                  color: "rgba(180,158,110,0.2)",
                }}
              >
                <IconShield />
                <span style={{ fontSize: "8.5px", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                  256-bit TLS · SOC 2 Type II Certified
                </span>
              </div>

            </div>
          </div>

          {/* Session reference line */}
          <div
            style={{
              marginTop: "14px",
              textAlign: "center",
              fontSize: "8.5px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(180,158,110,0.12)",
            }}
          >
            Session · {
              typeof window !== "undefined"
                ? Math.random().toString(36).slice(2, 10).toUpperCase()
                : "--------"
            }
          </div>

        </div>
      </div>
    </>
  );
}