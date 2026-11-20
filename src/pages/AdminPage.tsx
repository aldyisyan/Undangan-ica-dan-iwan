import { useState } from "react";
import AdminLogin from "./AdminLogin";
import TabCloud from "./admin/TabCloud";
import TabSettings from "./admin/TabSettings";
import TabSections from "./admin/TabSections";
import TabGifts from "./admin/TabGifts";
import TabWishes from "./admin/TabWishes";
import TabGuests from "./admin/TabGuests";
import TabMedia from "./admin/TabMedia";
import TabStats from "./admin/TabStats";
import TabDanger from "./admin/TabDanger";
import { HeartDoodle } from "../lib/ui";
import { useAdminConfig } from "../lib/adminSettings";

const TABS = [
  { id: "stats",    label: "📊 Statistik" },
  { id: "cloud",    label: "☁ Cloud Sync" },
  { id: "settings", label: "⚙ Pengaturan" },
  { id: "media",    label: "🖼 Media" },
  { id: "sections", label: "👁 Section" },
  { id: "gifts",    label: "🎁 Amplop" },
  { id: "wishes",   label: "💌 Ucapan" },
  { id: "guests",   label: "📋 Tamu" },
  { id: "danger",   label: "⚠ Zona Berbahaya" },
] as const;

type Tab = (typeof TABS)[number]["id"];

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => typeof window !== "undefined" ? sessionStorage.getItem("admin-auth") === "1" : false);
  const [tab, setTab] = useState<Tab>("stats");
  const cfg = useAdminConfig();

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;

  const renderTab = () => {
    if (tab === "stats")    return <TabStats />;
    if (tab === "cloud")    return <TabCloud />;
    if (tab === "settings") return <TabSettings />;
    if (tab === "media")    return <TabMedia />;
    if (tab === "sections") return <TabSections />;
    if (tab === "gifts")    return <TabGifts />;
    if (tab === "wishes")   return <TabWishes />;
    if (tab === "guests")   return <TabGuests />;
    if (tab === "danger")   return <TabDanger />;
    return null;
  };

  return (
    <div className="min-h-screen bg-paper text-ink antialiased">
      <div className="paper-grain" aria-hidden />

      {/* header */}
      <header className="sticky top-0 z-40 border-b border-dashed border-ink/20 bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <HeartDoodle className="h-5 w-5 text-terra heartbeat" filled />
            <div>
              <p className="font-hand text-2xl leading-none text-ink">Admin Panel</p>
              <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-navy/60">
                {cfg.groomNick} &amp; {cfg.brideNick}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-navy/70 transition-colors hover:text-terra">
              ← Lihat Undangan
            </a>
            <button
              type="button"
              onClick={() => { if (typeof window !== "undefined") sessionStorage.removeItem("admin-auth"); setAuthed(false); }}
              className="text-[10px] font-semibold uppercase tracking-[0.2em] text-terra hover:underline"
            >
              Keluar
            </button>
          </div>
        </div>

        {/* tabs — scrollable on mobile */}
        <div className="mx-auto max-w-6xl overflow-x-auto px-5 no-scrollbar">
          <div className="flex gap-0 border-t border-ink/10" style={{ minWidth: "max-content" }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex-shrink-0 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] transition-all duration-200 ${
                  tab === t.id
                    ? "border-b-2 border-terra text-terra"
                    : t.id === "danger"
                    ? "text-terra/40 hover:text-terra"
                    : "text-ink/50 hover:text-terra"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* content */}
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        {renderTab()}
      </main>
    </div>
  );
}
