import { useState, type FormEvent } from "react";
import { getAdminConfig, saveAdminConfig } from "../../lib/adminSettings";
import { getCloudAdmin, saveCloudAdmin, clearCloudAdmin, getLastSync } from "../../lib/cloudConfig";
import { testCloudConnection, syncToCloud, pullFromCloud } from "../../lib/cloud";

export default function TabCloud() {
  const cfg = getAdminConfig();
  const [url, setUrl] = useState(cfg.supabaseUrl);
  const [bucket, setBucket] = useState(cfg.supabaseBucket || "invite");
  const [anonKey, setAnonKey] = useState(cfg.supabaseAnonKey);
  const [status, setStatus] = useState<{ type: "ok" | "err" | "info"; msg: string } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState<string>("");

  const toast = (type: "ok" | "err" | "info", msg: string) => {
    setStatus({ type, msg });
    if (type === "ok") setTimeout(() => setStatus(null), 4000);
  };

  const save = (e: FormEvent) => {
    e.preventDefault();
    saveAdminConfig({ supabaseUrl: url.trim(), supabaseBucket: bucket.trim(), supabaseAnonKey: anonKey.trim() });
    if (url.trim() && anonKey.trim()) {
      saveCloudAdmin({ url: url.trim(), bucket: bucket.trim() || "invite", anonKey: anonKey.trim() });
    }
    toast("ok", "Konfigurasi cloud disimpan.");
  };

  const test = async () => {
    if (!url || !anonKey) { toast("err", "Isi URL dan Anon Key terlebih dahulu."); return; }
    setStatus({ type: "info", msg: "Menguji koneksi…" });
    const admin = { url: url.trim(), bucket: bucket.trim() || "invite", anonKey: anonKey.trim() };
    const r = await testCloudConnection(admin);
    if (r.ok) toast("ok", "✓ Koneksi berhasil! Bucket dapat diakses.");
    else toast("err", r.hint || `Error${r.status ? ` ${r.status}` : ""}`);
  };

  const push = async () => {
    const admin = getCloudAdmin();
    if (!admin) { toast("err", "Simpan & uji konfigurasi cloud dulu."); return; }
    setSyncing(true);
    setProgress("Mempersiapkan…");
    const ok = await syncToCloud(admin, cfg as unknown as Record<string, unknown>, (d, t) => setProgress(`${d}/${t} selesai`));
    setSyncing(false);
    setProgress("");
    toast(ok ? "ok" : "err", ok ? "✓ Data berhasil diunggah ke Supabase!" : "Gagal upload. Cek koneksi & policy RLS.");
  };

  const pull = async () => {
    setSyncing(true);
    setProgress("Menarik data dari cloud…");
    const ok = await pullFromCloud();
    setSyncing(false);
    setProgress("");
    toast(ok ? "ok" : "err", ok ? "✓ Data berhasil ditarik dari cloud!" : "Tidak ada data di cloud atau koneksi gagal.");
  };

  const disconnect = () => {
    clearCloudAdmin();
    setUrl(""); setBucket("invite"); setAnonKey("");
    saveAdminConfig({ supabaseUrl: "", supabaseBucket: "invite", supabaseAnonKey: "" });
    toast("info", "Konfigurasi cloud dihapus dari perangkat ini.");
  };

  const lastSync = getLastSync();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-hand text-4xl text-ink">Supabase Cloud Sync</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink/65">
          Sinkronkan settings, ucapan, dan daftar tamu ke Supabase Storage. Tamu membaca lewat URL publik; admin mengunggah dengan anon key.
        </p>
      </div>

      <div className="relative bg-navy/5 px-6 py-5 text-sm leading-relaxed text-ink/75">
        <p className="font-semibold text-navy">Cara Setup Supabase (3 langkah):</p>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5">
          <li>Buat project baru di <a href="https://app.supabase.com" target="_blank" rel="noreferrer" className="text-terra underline">supabase.com</a> → catat Project URL.</li>
          <li>Di menu <strong>Storage</strong>, buat bucket bernama <code className="rounded bg-ink/10 px-1">invite</code> dan aktifkan <strong>Public</strong>.</li>
          <li>Di <strong>SQL Editor</strong> jalankan 4 policy:<br />
            <code className="mt-1 block rounded bg-ink/10 p-2 text-xs leading-relaxed">
              CREATE POLICY &quot;read&quot; ON storage.objects FOR SELECT TO anon USING (bucket_id=&apos;invite&apos;);<br />
              CREATE POLICY &quot;insert&quot; ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id=&apos;invite&apos;);<br />
              CREATE POLICY &quot;update&quot; ON storage.objects FOR UPDATE TO anon USING (bucket_id=&apos;invite&apos;);<br />
              CREATE POLICY &quot;delete&quot; ON storage.objects FOR DELETE TO anon USING (bucket_id=&apos;invite&apos;);
            </code>
          </li>
        </ol>
      </div>

      <form onSubmit={save} className="space-y-5">
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.28em] text-navy/75">Project URL</label>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://xxxxxxxxxxx.supabase.co"
            className="mt-2 w-full border-b border-ink/25 bg-transparent py-2.5 font-mono text-sm text-ink outline-none transition-colors focus:border-terra" />
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.28em] text-navy/75">Bucket Name</label>
          <input value={bucket} onChange={(e) => setBucket(e.target.value)} placeholder="invite"
            className="mt-2 w-full border-b border-ink/25 bg-transparent py-2.5 font-mono text-sm text-ink outline-none transition-colors focus:border-terra" />
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.28em] text-navy/75">Anon Public Key</label>
          <textarea value={anonKey} onChange={(e) => setAnonKey(e.target.value)} rows={3} placeholder="eyJhbGciOiJ…"
            className="mt-2 w-full resize-none border-b border-ink/25 bg-transparent py-2.5 font-mono text-xs text-ink outline-none transition-colors focus:border-terra" />
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit" className="admin-btn-primary">Simpan Config</button>
          <button type="button" onClick={test} className="admin-btn">Uji Koneksi</button>
          <button type="button" onClick={push} disabled={syncing} className="admin-btn">
            {syncing ? progress || "…" : "⬆ Push ke Cloud"}
          </button>
          <button type="button" onClick={pull} disabled={syncing} className="admin-btn">
            {syncing ? progress || "…" : "⬇ Pull dari Cloud"}
          </button>
          <button type="button" onClick={disconnect} className="admin-btn-danger">Putuskan</button>
        </div>
      </form>

      {lastSync && (
        <p className="text-xs text-ink/50">Terakhir sync: {new Date(lastSync).toLocaleString("id-ID")}</p>
      )}

      {status && (
        <div className={`rounded px-4 py-3 text-sm ${status.type === "ok" ? "bg-green-50 text-green-800" : status.type === "err" ? "bg-red-50 text-red-800" : "bg-blue-50 text-blue-800"}`}>
          {status.msg}
        </div>
      )}
    </div>
  );
}
