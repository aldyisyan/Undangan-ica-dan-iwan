import brideFallback from "../assets/bride.jpg";
import groomFallback from "../assets/groom.jpg";
import { SECTION_PAD, WRAP } from "../lib/data";
import { useAdminConfig } from "../lib/adminSettings";
import { useMediaSrc } from "../lib/mediaStore";
import { DoodleDivider, HeartDoodle, Reveal, RoughFrame, SectionHead, Sprig } from "../lib/ui";

function PortraitCard({
  img, alt, tag, nick, full, parents, rotate,
}: {
  img: string; alt: string; tag: string; nick: string; full: string; parents: string; rotate: string;
}) {
  return (
    <article className={`relative flex flex-col items-center text-center ${rotate}`}>
      <div className="relative h-44 w-44 sm:h-52 sm:w-52">
        <img src={img} alt={alt} className="h-full w-full rounded-full object-cover" loading="lazy" />
        <svg className="draw pointer-events-none absolute -inset-3 h-[calc(100%+24px)] w-[calc(100%+24px)] text-ink/70" viewBox="0 0 200 200" fill="none" aria-hidden>
          <path pathLength={1} d="M100 6c50 0 94 42 94 94s-46 94-96 94S4 152 4 100 50 6 100 6Z" stroke="currentColor" strokeWidth="1.6" />
        </svg>
        <HeartDoodle className="heartbeat absolute -right-1 bottom-4 h-7 w-7 text-terra" filled />
      </div>
      <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.32em] text-navy/70">{tag}</p>
      <h3 className="mt-1.5 font-hand text-4xl leading-none text-ink sm:text-5xl">{nick}</h3>
      <p className="mt-3 max-w-xs text-sm font-semibold text-ink/85">{full}</p>
      <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-ink/60">{parents}</p>
    </article>
  );
}

export default function Opening({ guestName }: { guestName?: string | null }) {
  const cfg = useAdminConfig();
  const guest = guestName ?? (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("to")?.trim() : null);

  const groomPhoto = useMediaSrc(cfg.groomPhoto);
  const bridePhoto = useMediaSrc(cfg.bridePhoto);
  const groomImg = groomPhoto || (typeof groomFallback === 'string' ? groomFallback : (groomFallback as any).src);
  const brideImg = bridePhoto || (typeof brideFallback === 'string' ? brideFallback : (brideFallback as any).src);

  return (
    <>
      {/* 01 · salam */}
      <section id="salam" className={`${SECTION_PAD} relative bg-paper2/70`}>
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-ink/20" />
        <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 border-b border-dashed border-ink/20" />
        <div className={WRAP}>
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="font-hand text-3xl leading-snug text-navy sm:text-4xl">
              Assalamu&rsquo;alaikum Warahmatullahi Wabarakatuh
            </p>
            <p className="mt-5 font-note text-lg text-terra">Dear Family and Friends,</p>
            <p className="mt-4 text-[15px] leading-[1.9] text-ink/75 sm:text-base">
              Dengan penuh rasa syukur ke hadirat Tuhan Yang Maha Esa, kami bermaksud menyelenggarakan
              pernikahan putra-putri kami. Merupakan suatu kebahagiaan apabila Bapak, Ibu, Saudara, dan
              Saudari berkenan hadir untuk memberikan doa restu pada hari bahagia kami.
            </p>
            <div className="mt-8 flex justify-center"><DoodleDivider /></div>
            <blockquote className="mt-7">
              <p className="font-hand text-[clamp(1.4rem,4vw,2rem)] leading-snug text-ink">
                &ldquo;Dan di antara tanda-tanda kekuasaan-Nya diciptakan-Nya untukmu pasangan hidup dari
                jenismu sendiri, supaya kamu mendapat ketenangan hati dan dijadikan-Nya kasih sayang
                di antara kamu.&rdquo;
              </p>
              <footer className="mt-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-terra">
                QS. Ar-Rum &middot; Ayat 21
              </footer>
            </blockquote>
            <p className="mt-8 font-hand text-3xl text-navy">{cfg.groomNick} &amp; {cfg.brideNick}</p>
          </Reveal>
        </div>
      </section>

      {/* 02 · mempelai */}
      <section id="mempelai" className={`${SECTION_PAD} relative overflow-hidden`}>
        <Sprig className="pointer-events-none absolute left-4 top-16 hidden h-32 w-20 text-navy/20 lg:block" />
        <div className={WRAP}>
          <SectionHead num="02" kicker="The Bride & Groom" title="Mempelai" />

          <div className="mt-14 grid gap-14 sm:grid-cols-2 sm:gap-8">
            <Reveal delay={80}>
              <PortraitCard
                img={groomImg}
                alt={`Foto ${cfg.groomNick}`}
                tag="Mempelai Pria"
                nick={cfg.groomNick}
                full={cfg.groomName}
                parents={cfg.groomParents}
                rotate="sm:-rotate-1"
              />
            </Reveal>
            <Reveal delay={200}>
              <PortraitCard
                img={brideImg}
                alt={`Foto ${cfg.brideNick}`}
                tag="Mempelai Wanita"
                nick={cfg.brideNick}
                full={cfg.brideName}
                parents={cfg.brideParents}
                rotate="sm:rotate-1"
              />
            </Reveal>
          </div>

          <Reveal delay={120} className="relative mx-auto mt-16 max-w-sm">
            <div className="relative bg-paper px-6 py-5 text-center">
              <RoughFrame stroke="rgba(44,62,99,0.45)" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-navy/70">Kepada Yth.</p>
              <p className="mt-2 break-words font-hand text-3xl leading-tight text-ink">
                {guest || "Bapak / Ibu / Saudara / i"}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-ink/60">
                {guest ? (
                  <><span className="italic">besar harapan kami Anda berkenan hadir</span></>
                ) : (
                  <>di tempat &mdash; <span className="italic">besar harapan kami Anda berkenan hadir</span></>
                )}
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
