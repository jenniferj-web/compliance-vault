"use client";

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type UploadState = "idle" | "dragging" | "ready" | "uploading" | "success" | "error";

// ─── Icons ────────────────────────────────────────────────────────────────────

function UploadCloudIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.338-2.32 5.75 5.75 0 0 1 1.023 11.096" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
    </svg>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.955 11.955 0 0 0 3 11.965C3 18.033 7.373 22.5 12 22.5s9-4.467 9-10.535c0-2.152-.623-4.157-1.698-5.858A11.94 11.94 0 0 1 12 2.715z" />
    </svg>
  );
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UploadPage() {
  const [state, setState] = useState<UploadState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // ── File validation ──────────────────────────────────────────────────────
  const validateAndSet = useCallback((f: File | null) => {
    if (!f) return;
    if (f.type !== "application/pdf") {
      setErrorMsg("Only PDF files are accepted.");
      setState("error");
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      setErrorMsg("File must be smaller than 20 MB.");
      setState("error");
      return;
    }
    setFile(f);
    setState("ready");
    setErrorMsg("");
  }, []);

  // ── Drag handlers ────────────────────────────────────────────────────────
  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (state !== "uploading" && state !== "success") setState("dragging");
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setState(file ? "ready" : "idle");
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0] ?? null;
    validateAndSet(dropped);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    validateAndSet(e.target.files?.[0] ?? null);
  };

  const clearFile = () => {
    setFile(null);
    setState("idle");
    setErrorMsg("");
    if (inputRef.current) inputRef.current.value = "";
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!file || state !== "ready") return;
    setState("uploading");
    setProgress(0);

    // Simulated progress — replace with real fetch to your Server Action
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) { clearInterval(interval); return 90; }
        return p + Math.random() * 18;
      });
    }, 200);

    try {
      // ── Wire up real upload here ──────────────────────────────────────────
      // const formData = new FormData();
      // formData.append("file", file);
      // const result = await extractCOIData(formData);
      // ─────────────────────────────────────────────────────────────────────

      await new Promise((res) => setTimeout(res, 2200)); // remove when wired
      clearInterval(interval);
      setProgress(100);
      setState("success");
    } catch {
      clearInterval(interval);
      setErrorMsg("Upload failed. Please try again.");
      setState("error");
    }
  };

  // ── Derived ──────────────────────────────────────────────────────────────
  const isDragging  = state === "dragging";
  const isUploading = state === "uploading";
  const isSuccess   = state === "success";
  const isError     = state === "error";
  const hasFile     = !!file && (state === "ready" || isUploading || isSuccess);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex flex-col">

      {/* ── Subtle grid texture ───────────────────────────────────────────── */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="relative z-10 px-8 py-5 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
            <ShieldIcon className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold text-sm tracking-wide">Compliance Vault</span>
        </div>
        <a
          href="/"
          className="text-blue-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back to Dashboard
        </a>
      </header>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg space-y-6">

          {/* Title block */}
          <div className="text-center space-y-2">
            <p className="text-blue-300 text-xs font-semibold uppercase tracking-[0.2em]">
              Certificate of Insurance
            </p>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Submit Your COI
            </h1>
            <p className="text-blue-200/70 text-sm">
              Upload your ACORD 25 form to stay compliant. PDF only, max 20 MB.
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-2xl shadow-blue-950/50 overflow-hidden">

            {/* Drop zone */}
            <div className="p-8">
              {isSuccess ? (
                // ── Success state ──────────────────────────────────────────
                <div className="flex flex-col items-center gap-4 py-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
                    <CheckCircleIcon className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-slate-900 text-lg">Upload Complete</p>
                    <p className="text-slate-400 text-sm mt-1">
                      Your COI has been received and is being processed.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500">
                    <FileIcon className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="truncate max-w-[220px] font-medium text-slate-700">{file?.name}</span>
                  </div>
                  <button
                    onClick={clearFile}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                  >
                    Upload another file
                  </button>
                </div>
              ) : (
                // ── Drop zone (idle / dragging / ready / error) ────────────
                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => !isUploading && inputRef.current?.click()}
                  className={`
                    relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer
                    flex flex-col items-center justify-center gap-4 px-6 py-10 text-center
                    ${isDragging
                      ? "border-blue-400 bg-blue-50 scale-[1.01]"
                      : isError
                      ? "border-red-300 bg-red-50"
                      : hasFile
                      ? "border-blue-300 bg-blue-50/50"
                      : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/30"
                    }
                  `}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={onFileChange}
                    disabled={isUploading}
                  />

                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors
                    ${isDragging ? "bg-blue-100" : hasFile ? "bg-blue-100" : isError ? "bg-red-100" : "bg-slate-100"}`}>
                    {isError
                      ? <XIcon className="w-6 h-6 text-red-500" />
                      : hasFile
                      ? <FileIcon className="w-6 h-6 text-blue-600" />
                      : <UploadCloudIcon className="w-6 h-6 text-slate-400" />
                    }
                  </div>

                  {/* Text */}
                  {hasFile ? (
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-800 text-sm truncate max-w-[280px]">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-400">{formatBytes(file.size)}</p>
                    </div>
                  ) : isError ? (
                    <div className="space-y-1">
                      <p className="font-semibold text-red-600 text-sm">{errorMsg}</p>
                      <p className="text-xs text-slate-400">Click to try a different file</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-700 text-sm">
                        {isDragging ? "Drop it here" : "Drag & drop your COI here"}
                      </p>
                      <p className="text-xs text-slate-400">
                        or <span className="text-blue-600 font-semibold">browse files</span> · PDF only
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Progress bar */}
              {isUploading && (
                <div className="mt-5 space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-400 font-medium">
                    <span>Uploading…</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Clear file button */}
              {hasFile && !isUploading && !isSuccess && (
                <button
                  onClick={(e) => { e.stopPropagation(); clearFile(); }}
                  className="mt-3 flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors mx-auto"
                >
                  <XIcon className="w-3 h-3" /> Remove file
                </button>
              )}
            </div>

            {/* Divider */}
            {!isSuccess && <div className="border-t border-slate-100" />}

            {/* Footer / Submit */}
            {!isSuccess && (
              <div className="px-8 py-5 bg-slate-50 flex items-center justify-between gap-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your document is encrypted in transit and stored securely.
                </p>
                <button
                  onClick={handleSubmit}
                  disabled={!hasFile || isUploading}
                  className={`
                    shrink-0 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
                    ${hasFile && !isUploading
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300 hover:-translate-y-px active:translate-y-0"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }
                  `}
                >
                  {isUploading ? "Submitting…" : "Submit"}
                </button>
              </div>
            )}
          </div>

          {/* Footer note */}
          <p className="text-center text-blue-300/50 text-xs">
            Questions? Contact your project coordinator.
          </p>

        </div>
      </main>
    </div>
  );
}