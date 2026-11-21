import { type FormEvent, useState } from "react";
import { getAdminConfig } from "../lib/adminSettings";
import { HeartDoodle } from "../lib/ui";

export default function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cfg = getAdminConfig();
    if (pin === cfg.adminPin) {
      sessionStorage.setItem("admin-auth", "1");
      onLogin();
    } else {
      setError("PIN salah. Coba lagi.");
      setPin("");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <HeartDoodle className="heartbeat mx-auto h-10 w-10 text-terra" filled />
          <h1 className="mt-4 font-hand text-5xl text-ink">Admin Panel</h1>
          <p className="mt-2 text-[12px] font-semibold uppercase tracking-[0.28em] text-navy/70">
            Undangan Ica &amp; Iwan
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative bg-paper2 px-7 py-9">
          {/* rough frame */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full text-ink/50" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none" aria-hidden>
            <path d="M1.6 3.4C20 1.4 46 2.8 70 1.7c15-.7 26 .2 28.4 1.7.8 17 .2 52 .4 77.1.1 11.6-.8 16.2-2.2 17.8-21.6 1-56.6-.2-78.6.6C8.4 99 3.4 98.2 2.2 97 1.4 75 2.5 40 1.6 3.4Z" stroke="currentColor" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
          </svg>

          <label className="block text-[10px] font-semibold uppercase tracking-[0.3em] text-navy/75">
            Masukkan PIN Admin
          </label>
          <input
            type="password"
            inputMode="numeric"
            maxLength={12}
            value={pin}
            onChange={(e) => { setPin(e.target.value); setError(""); }}
            placeholder="••••••"
            className="mt-3 w-full border-b border-ink/30 bg-transparent py-2.5 text-center font-hand text-4xl text-ink tracking-widest outline-none transition-colors focus:border-terra"
            autoFocus
          />
          {error && <p className="mt-3 text-center font-note text-sm text-terra">{error}</p>}
          <div className="mt-7 flex justify-center">
            <button
              type="submit"
              className="relative inline-flex items-center justify-center px-9 py-3.5 text-terra transition-transform duration-300 hover:-translate-y-0.5"
            >
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 200 64" preserveAspectRatio="none" fill="none" aria-hidden>
                <path d="M100 3c55 0 97 12 97 29S152 61 100 61 3 48 3 32 45 3 100 3Z" stroke="currentColor" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
              </svg>
              <span className="relative font-hand text-2xl leading-none tracking-wide">Masuk</span>
            </button>
          </div>
        </form>
        <p className="mt-6 text-center font-note text-xs text-ink/40">
          Akses admin hanya untuk pasangan. PIN default: <span className="font-semibold">140626</span>
        </p>
      </div>
    </div>
  );
}
