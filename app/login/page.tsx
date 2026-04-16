"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// ─── Styles & animations ──────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=IBM+Plex+Mono:wght@300;400;500&display=swap');

  .font-display { font-family: 'Syne', sans-serif; }
  .font-mono-ui { font-family: 'IBM Plex Mono', monospace; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes bgFade { from { opacity: 0; } to { opacity: 1; } }
  @keyframes scanMove {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(110vh); }
  }
  @keyframes spinRing { to { transform: rotate(360deg); } }
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%,60%  { transform: translateX(-5px); }
    40%,80%  { transform: translateX(5px); }
  }

  .a1 { animation: fadeUp .65s cubic-bezier(.22,1,.36,1) .06s  both; }
  .a2 { animation: fadeUp .65s cubic-bezier(.22,1,.36,1) .18s  both; }
  .a3 { animation: fadeUp .65s cubic-bezier(.22,1,.36,1) .30s  both; }
  .a4 { animation: fadeUp .65s cubic-bezier(.22,1,.36,1) .42s  both; }
  .a5 { animation: fadeUp .65s cubic-bezier(.22,1,.36,1) .54s  both; }
  .a6 { animation: fadeUp .65s cubic-bezier(.22,1,.36,1) .64s  both; }
  .bg-in { animation: bgFade 1.2s ease both; }

  .scanline-el {
    position: fixed; top: 0; left: 0; right: 0; height: 180px;
    background: linear-gradient(to bottom,
      transparent, rgba(59,130,246,.022) 50%, transparent);
    animation: scanMove 14s linear infinite;
    pointer-events: none; z-index: 1;
  }

  .noise-el {
    position: fixed; inset: 0; opacity: .016;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 120px 120px;
    pointer-events: none; z-index: 2;
  }

  .vault-input {
    background: rgba(15,23,42,.6);
    border: 1px solid rgba(51,65,85,.7);
    color: #e2e8f0;
    transition: border-color .2s, background .2s, box-shadow .2s;
    caret-color: #3b82f6;
    outline: none;
    width: 100%;
    box-sizing: border-box;
  }
  .vault-input::placeholder { color: rgba(100,116,139,.55); }
  .vault-input:focus {
    border-color: rgba(59,130,246,.65);
    background: rgba(15,23,42,.85);
    box-shadow: 0 0 0 3px rgba(59,130,246,.1);
  }
  .vault-input:-webkit-autofill,
  .vault-input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px #0f1729 inset !important;
    -webkit-text-fill-color: #e2e8f0 !important;
  }

  .vault-btn {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 45%, #2563eb 100%);
    background-size: 200% 100%;
    background-position: 0 0;
    box-shadow: 0 4px 24px rgba(37,99,235,.35), inset 0 1px 0 rgba(255,255,255,.1);
    transition: background-position .4s ease, box-shadow .25s, transform .15s;
  }
  .vault-btn:hover:not(:disabled) {
    background-position: 100% 0;
    box-shadow: 0 8px 36px rgba(37,99,235,.55), inset 0 1px 0 rgba(255,255,255,.15);
    transform: translateY(-1px);
  }
  .vault-btn:active:not(:disabled) { transform: translateY(0); }
  .vault-btn:disabled { opacity: .45; cursor: not-allowed; }

  .spin-ring { animation: spinRing .8s linear infinite; }
  .do-shake  { animation: shake .35s ease both; }

  .eye-btn {
    background: none; border: none; cursor: pointer; padding: 0;
    color: rgba(100,116,139,.55);
    transition: color .15s;
    position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
  }
  .eye-btn:hover { color: rgba(148,163,184,.9); }

  .divider { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(51,65,85,.6), transparent); }

  .link-sm {
    font-size: 10px; letter-spacing: .08em;
    color: rgba(59,130,246,.7); text-decoration: none;
    transition: color .15s;
  }
  .link-sm:hover { color: rgba(96,165,250,1); }
`;

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconShield = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.955 11.955 0 0 0 3 11.965C3 18.033 7.373 22.5 12 22.5s9-4.467 9-10.535c0-2.152-.623-4.157-1.698-5.858A11.94 11.94 0 0 1 12 2.715z" />
  </svg>
);

const IconMail = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
  </svg>
);

const IconLock = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25z" />
  </svg>
);

const IconEyeOpen = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
  </svg>
);

const IconEyeClosed = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

const IconAlert = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
    style={{ flexShrink: 0, marginTop: "1px" }}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.008v.008H12v-.008z" />
  </svg>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router   = useRouter();
  const supabase = createClientComponentClient();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [mounted,  setMounted]  = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    // Already logged in → go straight to dashboard
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/dashboard");
    });
    const t = setTimeout(() => emailRef.current?.focus(), 800);
    return () => clearTimeout(t);
  }, [supabase, router]);

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setError(null);
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email:    email.trim().toLowerCase(),
      password,
    });

    if (authError) {
      const msg = authError.message.toLowerCase().includes("invalid")
        ? "Incorrect email or password. Please try again."
        : authError.message;
      setError(msg);
      setShakeKey(k => k + 1);
      setLoading(false);
      return;
    }

    // ✓ Success — redirect to dashboard
    router.replace("/dashboard");
  };

  if (!mounted) return null;

  return (
    <>
      <style>{STYLES}</style>

      {/* Atmospheric layers */}
      <div className="scanline-el" aria-hidden="true" />
      <div className="noise-el"    aria-hidden="true" />

      <div
        className="font-mono-ui bg-in min-h-screen flex flex-col items-center justify-center px-4"
        style={{
          background:
            "radial-gradient(ellipse 110% 70% at 50% -8%, #0d1829 0%, #090e1a 45%, #050709 100%)",
        }}
      >
        {/* Grid */}
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(59,130,246,.03) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(59,130,246,.03) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
        {/* Deep vignette */}
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 75% 75% at 50% 50%, transparent 30%, rgba(0,0,0,.65) 100%)",
          }}
        />

        {/* ── Card ── */}
        <div className="relative z-10 w-full" style={{ maxWidth: "400px" }}>

          {/* Outer gradient ring */}
          <div
            className="absolute -inset-px pointer-events-none"
            style={{
              borderRadius: "18px",
              background:
                "linear-gradient(140deg, rgba(59,130,246,.25) 0%, transparent 45%, rgba(59,130,246,.1) 100%)",
            }}
          />

          {/* Card body */}
          <div
            style={{
              borderRadius: "17px",
              background: "linear-gradient(160deg, rgba(13,20,38,.97) 0%, rgba(7,10,18,.99) 100%)",
              border: "1px solid rgba(51,65,85,.55)",
              boxShadow:
                "0 30px 70px rgba(0,0,0,.65)," +
                "0 0 0 1px rgba(59,130,246,.05)," +
                "inset 0 1px 0 rgba(255,255,255,.04)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Top shimmer line */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "1px",
                background:
                  "linear-gradient(90deg, transparent, rgba(59,130,246,.45), transparent)",
              }}
            />

            <div style={{ padding: "48px 40px 44px" }}>

              {/* ── Logo + title ── */}
              <div className="a1" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", marginBottom: "36px" }}>
                <div
                  style={{
                    width: "56px", height: "56px", borderRadius: "16px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#60a5fa",
                    background: "linear-gradient(135deg, rgba(37,99,235,.15), rgba(29,78,216,.07))",
                    border: "1px solid rgba(59,130,246,.22)",
                    boxShadow: "0 8px 28px rgba(37,99,235,.18), inset 0 1px 0 rgba(255,255,255,.06)",
                  }}
                >
                  <IconShield />
                </div>

                <div style={{ textAlign: "center" }}>
                  <h1
                    className="font-display"
                    style={{ fontSize: "22px", fontWeight: 700, color: "#f1f5f9", letterSpacing: "-.5px", margin: 0 }}
                  >
                    Compliance Vault
                  </h1>
                  <p
                    style={{
                      fontSize: "9.5px", letterSpacing: ".28em", textTransform: "uppercase",
                      color: "rgba(100,116,139,.65)", marginTop: "6px",
                    }}
                  >
                    Enterprise · Secure Portal
                  </p>
                </div>
              </div>

              {/* ── Divider ── */}
              <div className="a2" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
                <div className="divider" />
                <span style={{ fontSize: "9px", letterSpacing: ".28em", textTransform: "uppercase", color: "rgba(71,85,105,.75)", whiteSpace: "nowrap" }}>
                  Sign In
                </span>
                <div className="divider" />
              </div>

              {/* ── Form ── */}
              <form onSubmit={handleSignIn} noValidate>

                {/* Email */}
                <div className="a3" style={{ marginBottom: "18px" }}>
                  <label
                    htmlFor="email"
                    style={{
                      display: "flex", alignItems: "center", gap: "7px",
                      fontSize: "9.5px", letterSpacing: ".22em", textTransform: "uppercase",
                      color: "rgba(100,116,139,.75)", marginBottom: "8px",
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
                    placeholder="you@company.com"
                    className="vault-input"
                    style={{ padding: "11px 14px", fontSize: "13px", letterSpacing: ".03em", borderRadius: "10px" }}
                  />
                </div>

                {/* Password */}
                <div className="a4" style={{ marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <label
                      htmlFor="password"
                      style={{
                        display: "flex", alignItems: "center", gap: "7px",
                        fontSize: "9.5px", letterSpacing: ".22em", textTransform: "uppercase",
                        color: "rgba(100,116,139,.75)",
                      }}
                    >
                      <IconLock /> Password
                    </label>
                    <a href="#" className="link-sm">Forgot password?</a>
                  </div>
                  <div style={{ position: "relative" }}>
                    <input
                      id="password"
                      type={showPw ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(null); }}
                      placeholder="••••••••••••"
                      className="vault-input"
                      style={{
                        padding: "11px 44px 11px 14px",
                        fontSize: "13px",
                        letterSpacing: showPw ? ".03em" : ".16em",
                        borderRadius: "10px",
                      }}
                    />
                    <button
                      type="button"
                      className="eye-btn"
                      onClick={() => setShowPw(v => !v)}
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? <IconEyeOpen /> : <IconEyeClosed />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div
                    key={shakeKey}
                    className="do-shake"
                    style={{
                      display: "flex", alignItems: "flex-start", gap: "9px",
                      padding: "10px 13px", marginBottom: "18px",
                      background: "rgba(239,68,68,.07)",
                      border: "1px solid rgba(239,68,68,.22)",
                      borderRadius: "10px",
                      color: "rgba(252,165,165,.9)",
                      fontSize: "12px",
                      letterSpacing: ".02em",
                    }}
                  >
                    <IconAlert />
                    <span>{error}</span>
                  </div>
                )}

                {/* Sign In button */}
                <div className="a5">
                  <button
                    type="submit"
                    disabled={loading || !email || !password}
                    className="vault-btn"
                    style={{
                      width: "100%",
                      padding: "13px 24px",
                      borderRadius: "10px",
                      border: "none",
                      fontSize: "11px",
                      letterSpacing: ".2em",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      cursor: loading || !email || !password ? "not-allowed" : "pointer",
                    }}
                  >
                    {loading ? (
                      <>
                        <svg
                          className="spin-ring"
                          width="15" height="15" viewBox="0 0 24 24"
                          fill="none" stroke="currentColor" strokeWidth="2.5"
                        >
                          <path strokeLinecap="round" d="M12 3a9 9 0 1 0 9 9" />
                        </svg>
                        Authenticating
                      </>
                    ) : (
                      <>
                        <IconLock />
                        Sign In
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Security badge */}
              <div
                className="a6"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: "7px", marginTop: "28px",
                  color: "rgba(51,65,85,.7)",
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25z" />
                </svg>
                <span style={{ fontSize: "9px", letterSpacing: ".2em", textTransform: "uppercase" }}>
                  256-bit TLS · SOC 2 Type II
                </span>
              </div>

            </div>
          </div>

          {/* Session token line */}
          <p
            style={{
              textAlign: "center", marginTop: "14px",
              fontSize: "9px", letterSpacing: ".2em", textTransform: "uppercase",
              color: "rgba(30,41,59,.7)",
            }}
          >
            Session ·{" "}
            {typeof window !== "undefined"
              ? Math.random().toString(36).slice(2, 10).toUpperCase()
              : "--------"}
          </p>
        </div>
      </div>
    </>
  );
}