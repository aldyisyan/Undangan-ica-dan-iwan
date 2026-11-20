import { useAdminConfig, saveAdminConfig } from "../../lib/adminSettings";
import { getCloudAdmin } from "../../lib/cloudConfig";
import { syncToCloud } from "../../lib/cloud";

const SECTIONS = [
  { key: "showRsvp", label: "RSVP & Ucapan", desc: "Form konfirmasi kehadiran dan kolom ucapan tamu." },
  { key: "showGifts", label: "Amplop Digital / Kirim Hadiah", desc: "Nomor rekening & e-wallet untuk tamu." },
  { key: "showStory", label: "Perjalanan Cinta (Love Story)", desc: "Timeline perjalanan pasangan dengan foto polaroid." },
  { key: "showDressCode", label: "Dress Code", desc: "Panduan warna & busana untuk tamu." },
  { key: "showGallery", label: "Galeri Foto", desc: "Grid galeri dengan lightbox — termasuk foto yang diupload di tab Media." },
  { key: "showSaveCalendar", label: "Simpan ke Kalender", desc: "Tombol agar tamu bisa menyimpan tanggal ke Google Calendar / iCal." },
  { key: "showMapsEmbed", label: "Peta Lokasi (Embed)", desc: "Tampilkan peta Google Maps tersemat (perlu isi iframe src di tab Acara)." },
  { key: "showVoiceNote", label: "Pesan Suara (Voice Note)", desc: "Player audio pesan suara dari pasangan untuk tamu." },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];

export default function TabSections() {
  const cfg = useAdminConfig();

  const toggle = async (key: SectionKey) => {
    const next = { [key]: !cfg[key] } as Parameters<typeof saveAdminConfig>[0];
    saveAdminConfig(next);
    const admin = getCloudAdmin();
    if (admin) {
      const updated = { ...cfg, ...next };
      await syncToCloud(admin, updated as unknown as Record<string, unknown>);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-hand text-4xl text-ink">Tampilkan / Sembunyikan Section</h2>
        <p className="mt-1 text-sm text-ink/60">
          Aktifkan atau nonaktifkan bagian tertentu dari halaman undangan. Perubahan langsung tersinkronisasi ke cloud.
        </p>
      </div>

      <div className="divide-y divide-ink/15">
        {SECTIONS.map(({ key, label, desc }) => {
          const on = cfg[key];
          return (
            <div key={key} className="flex items-center justify-between gap-6 py-5">
              <div className="min-w-0">
                <p className="font-semibold text-ink">{label}</p>
                <p className="mt-0.5 text-[13px] text-ink/60">{desc}</p>
              </div>
              <button
                type="button"
                onClick={() => toggle(key)}
                role="switch"
                aria-checked={on}
                className={`relative h-7 w-14 shrink-0 rounded-full border-2 transition-all duration-300 ${
                  on ? "border-terra bg-terra" : "border-ink/30 bg-ink/10"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-paper shadow transition-transform duration-300 ${
                    on ? "translate-x-7" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>

      <div className="rounded bg-navy/5 px-5 py-4 text-sm text-ink/70">
        <p className="font-semibold text-navy">Catatan:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Toggle langsung tersimpan & tersinkronisasi ke cloud (jika terhubung).</li>
          <li>Tamu melihat perubahan dalam 15 detik (polling otomatis).</li>
          <li>Section yang dimatikan tidak membuang data — bisa dinyalakan kembali kapan saja.</li>
        </ul>
      </div>
    </div>
  );
}
