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
import TabDressCode from "./admin/TabDressCode";
import { HeartDoodle } from "../lib/ui";
import { useAdminConfig } from "../lib/adminSettings";
import { getCloudAdmin } from "../lib/cloudConfig";
import { getLastSyncLabel, useAutoSync } from "../lib/autoSync";
import { Pill, TabIcon } from "./admin/ui";

type TabId =
  | "stats" | "settings" | "media" | "sections" | "dress" | "gifts"
  | "guests" | "wishes" | "cloud" | "danger";

const NAV: { group: string; items: { id: TabId; label: string; icon: string }[] }[] = [
  { group: "Ringkasan", items: [{ id: "stats", label: "Statistik", icon: "stats" }] },
  {
    group: "Isi Undangan",
    items: [
      { id: "settings", label: "Pengaturan Acara", icon: "settings" },
      { id: "media", label: "Media & Foto", icon: "media" },
      { id: "sections", label: "Tampilan Section", icon: "sections" },
      { id: "dress", label: "Dress Code", icon: "dress" },
      { id: "gifts", label: "Amplop Digital", icon: "gifts" },
    ],
  },
  {
    group: "Tamu",
    items: [
      { id: "guests", label: "Daftar Tamu", icon: "guests" },
      { id: "wishes", label: "Ucapan & RSVP", icon: "wishes" },
    ],
  },
  {
    group: "Sistem",
    items: [
      { id: "cloud", label: "Cloud Sync", icon: "cloud" },
      { id: "danger", label: "Zona Berbahaya", icon: "danger" },
    ],
  },
];

const ALL_TABS: TabId[] = NAV.flatMap((g) => g.items.map((i) => i.id));

const STATUS: Record<string, { tone: "ok" | "warn" | "info" | "muted" | "bad"; label: string }> = {
  offline: { tone: "muted", label: "Cloud nonaktif" },
  pending: { tone: "info", label: "Perubahan disimpan…" },
  syncing: { tone: "info", label: "Sync berjalan…" },
  synced: { tone: "ok", label: "Tersinkron" },
  error: { tone: "bad", label: "Sync gagal" },
};

function goInvite() {
  // buang hash #admin, pertahankan query ?to=
  window.location.href = window.location.pathname + window.location.search;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("admin-auth") === "1");
  const [tab, setTab] = useState<TabId>("stats");
  const cfg = useAdminConfig();
  const syncStatus = useAutoSync(); // pasang auto-sync di sini (sebelum early return)
  const cloudReady = !!getCloudAdmin();
  const lastSync = getLastSyncLabel();

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;

  const renderTab = () => {
    switch (tab) {
      case "stats": return <TabStats onNavigate={(t) => setTab(t as TabId)} />;
      case "cloud": return <TabCloud />;
      case "settings": return <TabSettings />;
      case "media": return <TabMedia />;
      case "sections": return <TabSections />;
      case "dress": return <TabDressCode />;
      case "gifts": return <TabGifts />;
      case "wishes": return <TabWishes />;
      case "guests": return <TabGuests />;
      case "danger": return <TabDanger />;
      default: return null;
    }
  };

  const status = STATUS[syncStatus] ?? STATUS.offline;

  const navButton = (item: { id: TabId; label: string; icon: string }, mobile = false) => {
    const active = tab === item.id;
    const danger = item.id === "danger";
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => setTab(item.id)}
        aria-current={active ? "page" : undefined}
        className={
          mobile
            ? `flex shrink-0 items-center gap-2 border-b-2 px-3.5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                active
                  ? "border-terra text-terra"
                  : danger
                  ? "border-transparent text-terra/50"
                  : "border-transparent text-ink/50"
              }`
            : `group flex w-full items-center gap-3 border-l-2 px-4 py-2.5 text-left text-[13.5px] transition-all duration-200 ${
                active
                  ? "border-terra bg-paper2 font-semibold text-terra"
                  : `border-transparent text-ink/60 hover:border-ink/25 hover:bg-paper2/60 hover:text-ink ${
                      danger ? "text-terra/55 hover:text-terra" : ""
                    }`
              }`
        }
      >
        <TabIcon name={item.icon} className={mobile ? "h-4 w-4" : "h-4 w-4 shrink-0 opacity-80"} />
        <span className={mobile ? "" : "truncate"}>{item.label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-paper text-ink antialiased">
      <div className="paper-grain" aria-hidden />

      {/* ══════════ SIDEBAR (desktop) ══════════ */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-dashed border-ink/20 bg-paper2/50 lg:flex">
        <div className="flex items-center gap-3 px-5 py-5">
          <HeartDoodle className="h-5 w-5 shrink-0 text-terra heartbeat" filled />
          <div className="min-w-0">
            <p className="truncate font-hand text-2xl leading-none text-ink">Admin Panel</p>
            <p className="mt-0.5 truncate text-[9px] font-semibold uppercase tracking-[0.2em] text-navy/60">
              {cfg.brideNick} &amp; {cfg.groomNick} · {cfg.weddingDateLabel}
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto pb-6">
          {NAV.map((group) => (
            <div key={group.group} className="mt-5 first:mt-1">
              <p className="px-4 pb-2 text-[9px] font-semibold uppercase tracking-[0.28em] text-ink/35">
                {group.group}
              </p>
              <div className="space-y-0.5">{group.items.map((item) => navButton(item))}</div>
            </div>
          ))}
        </nav>

        <div className="border-t border-dashed border-ink/20 px-4 py-4">
          <button
            type="button"
            onClick={goInvite}
            className="admin-btn w-full justify-center"
          >
            ← Lihat Undangan
          </button>
          <button
            type="button"
            onClick={() => { sessionStorage.removeItem("admin-auth"); setAuthed(false); }}
            className="mt-2 w-full py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-terra/70 transition-colors hover:text-terra"
          >
            Keluar
          </button>
        </div>
      </aside>

      {/* ══════════ MAIN COLUMN ══════════ */}
      <div className="lg:pl-64">
        {/* header mobile + status bar */}
        <header className="sticky top-0 z-30 border-b border-dashed border-ink/20 bg-paper/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-2.5 lg:hidden">
              <HeartDoodle className="h-4 w-4 shrink-0 text-terra" filled />
              <p className="truncate font-hand text-xl leading-none text-ink">
                {cfg.brideNick} <span className="text-terra">&amp;</span> {cfg.groomNick}
              </p>
            </div>

            <div className="hidden min-w-0 items-center gap-2 lg:flex">
              <Pill tone={status.tone}>
                <span
                  aria-hidden
                  className={`h-1.5 w-1.5 rounded-full ${
                    syncStatus === "syncing" || syncStatus === "pending"
                      ? "animate-pulse bg-current"
                      : "bg-current"
                  }`}
                />
                {status.label}
              </Pill>
              {lastSync && syncStatus === "synced" && (
                <span className="text-[11px] text-ink/45">terakhir sync {lastSync}</span>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <span className="lg:hidden">
                <Pill tone={status.tone}>{status.label}</Pill>
              </span>
              <button
                type="button"
                onClick={goInvite}
                className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-navy/70 transition-colors hover:text-terra lg:inline"
              >
                Lihat Undangan →
              </button>
              <button
                type="button"
                onClick={() => { sessionStorage.removeItem("admin-auth"); setAuthed(false); }}
                className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terra hover:underline lg:hidden"
              >
                Keluar
              </button>
            </div>
          </div>

          {/* nav mobile */}
          <div className="no-scrollbar overflow-x-auto lg:hidden">
            <div className="flex min-w-max px-1">
              {ALL_TABS.map((id) => {
                const item = NAV.flatMap((g) => g.items).find((i) => i.id === id)!;
                return navButton(item, true);
              })}
            </div>
          </div>
        </header>

        {/* peringatan bila cloud belum terhubung */}
        {!cloudReady && (
          <div className="border-b border-dashed border-terra/30 bg-terra/[0.05]">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
              <p className="text-[13px] leading-relaxed text-ink/70">
                <strong className="text-terra">Cloud belum terhubung.</strong>{" "}
                Perubahan (foto, setting, ucapan) hanya tersimpan di perangkat ini.
              </p>
              <button
                type="button"
                onClick={() => setTab("cloud")}
                className="admin-btn-primary"
              >
                Hubungkan Sekarang
              </button>
            </div>
          </div>
        )}

        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="space-y-8">{renderTab()}</div>
        </main>

        <footer className="border-t border-dashed border-ink/15 px-4 py-8 text-center sm:px-6">
          <p className="font-note text-[13px] text-ink/45">
            Panel admin {cfg.brideNick} &amp; {cfg.groomNick} — semua perubahan tersimpan otomatis.
          </p>
        </footer>
      </div>
    </div>
  );
}
