import bride from "../assets/bride.jpg";
import groom from "../assets/groom.jpg";
import { SECTION_PAD, WEDDING, WRAP } from "../lib/data";
import { DoodleDivider, HeartDoodle, Reveal, RoughFrame, SectionHead, Sprig } from "../lib/ui";

function PortraitCard({
  img,
  alt,
  tag,
  nick,
  full,
  parents,
  insta,
  rotate,
}: {
  img: string;
  alt: string;
  tag: string;
  nick: string;
  full: string;
  parents: string;
  insta: string;
  rotate: string;
}) {
  return (
    <article className={`relative flex flex-col items-center text-center ${rotate}`}>
      <div className="relative h-52 w-52 sm:h-60 sm:w-60">
        <img
          src={img}
          alt={alt}
          className="h-full w-full rounded-full object-cover"
          loading="lazy"
        />
        <svg
          className="draw pointer-events-none absolute -inset-3 h-[calc(100%+24px)] w-[calc(100%+24px)] text-ink/70"
          viewBox="0 0 200 200"
          fill="none"
          aria-hidden
        >
          <path
            pathLength={1}
            d="M100 6c50 0 94 42 94 94s-46 94-96 94S4 152 4 100 50 6 100 6Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            pathLength={1}
            d="M100 15c46 0 85 39 85 85s-41 85-87 85S13 147 13 100 54 15 100 15Z"
            stroke="#B5533C"
            strokeWidth="1.1"
            strokeDasharray="1 6"
            strokeLinecap="round"
            opacity="0.85"
          />
        </svg>
        <HeartDoodle className="heartbeat absolute -right-1 bottom-4 h-8 w-8 text-terra" filled />
      </div>

      <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.32em] text-navy/70">{tag}</p>
      <h3 className="mt-1.5 font-hand text-5xl leading-none text-ink">{nick}</h3>
      <p className="mt-3 max-w-xs font-sans text-sm font-semibold text-ink/85">{full}</p>
      <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-ink/60">{parents}</p>
      <p className="mt-3 font-note text-sm text-terra/90">{insta}</p>
    </article>
  );
}

export default function Opening({ guestName }: { guestName?: string | null }) {
  const guest = guestName ?? (
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("to")?.trim()
      : null
  );

  return (
    <>
      {/* ---------------------------------------------------- 01 · salam */}
      <section id="salam" className={`${SECTION_PAD} relative bg-paper2/70`}>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-ink/20"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 border-b border-dashed border-ink/20"
        />
        <div className={WRAP}>
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-navy/70">
              01 &mdash; Salam Pembuka
            </p>
            <p className="mt-6 font-hand text-3xl leading-snug text-navy sm:text-4xl">
              Assalamu&rsquo;alaikum Warahmatullahi Wabarakatuh
            </p>
            <p className="mt-6 font-note text-lg text-terra">Dear Family and Friends,</p>
            <p className="mt-4 text-[15px] leading-[1.9] text-ink/75 sm:text-base">
              Dengan penuh rasa syukur ke hadirat Tuhan Yang Maha Esa, kami bermaksud menyelenggarakan
              pernikahan putra-putri kami. Merupakan suatu kebahagiaan apabila Bapak, Ibu, Saudara, dan
              Saudari berkenan hadir untuk memberikan doa restu pada hari bahagia kami.
            </p>

            <div className="mt-9 flex justify-center">
              <DoodleDivider />
            </div>

            <blockquote className="mt-8">
              <p className="font-hand text-[clamp(1.5rem,4.4vw,2.1rem)] leading-snug text-ink">
                &ldquo;Dan di antara tanda-tanda kekuasaan-Nya diciptakan-Nya untukmu pasangan hidup dari
                jenismu sendiri, supaya kamu mendapat ketenangan hati dan dijadikan-Nya kasih sayang
                di antara kamu.&rdquo;
              </p>
              <footer className="mt-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-terra">
                QS. Ar-Rum &middot; Ayat 21
              </footer>
            </blockquote>

            <p className="mt-9 text-[15px] leading-[1.9] text-ink/75">
              Kehadiran dan doa restu Anda adalah hadiah terindah bagi kami berdua.
            </p>
            <p className="mt-4 font-hand text-3xl text-navy">Iwan &amp; Ica</p>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------- 02 · mempelai */}
      <section id="mempelai" className={`${SECTION_PAD} relative overflow-hidden`}>
        <Sprig className="pointer-events-none absolute left-4 top-16 hidden h-32 w-20 text-navy/20 xl:block" />
        <HeartDoodle className="drift pointer-events-none absolute right-8 top-24 hidden h-10 w-10 text-terra/30 xl:block" />

        <div className={WRAP}>
          <SectionHead
            num="02"
            kicker="The Bride & Groom"
            title="Mempelai"
            aside="dua keluarga, satu doa"
          />

          <div className="mt-16 grid gap-16 md:grid-cols-2 md:gap-10">
            <Reveal delay={80}>
              <PortraitCard
                img={groom}
                alt="Ilustrasi wajah Iwan Pratama"
                tag="Mempelai Pria"
                nick={WEDDING.groomNick}
                full={WEDDING.groomName}
                parents={WEDDING.groomParents}
                insta={WEDDING.groomInsta}
                rotate="md:-rotate-1"
              />
            </Reveal>

            <Reveal delay={220}>
              <div className="relative">
                <span
                  aria-hidden
                  className="absolute -left-6 top-1/2 hidden h-40 w-px -translate-y-1/2 border-l border-dashed border-ink/25 md:block"
                />
                <PortraitCard
                  img={bride}
                  alt="Ilustrasi wajah Ica Lestari"
                  tag="Mempelai Wanita"
                  nick={WEDDING.brideNick}
                  full={WEDDING.brideName}
                  parents={WEDDING.brideParents}
                  insta={WEDDING.brideInsta}
                  rotate="md:rotate-1"
                />
              </div>
            </Reveal>
          </div>

          <Reveal delay={120} className="relative mx-auto mt-20 max-w-md">
            <div className="relative bg-paper px-7 py-6 text-center">
              <RoughFrame stroke="rgba(44,62,99,0.45)" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-navy/70">
                Kepada Yth.
              </p>
              <p className="mt-2 break-words font-hand text-3xl leading-tight text-ink">
                {guest ? guest : "Bapak / Ibu / Saudara / i"}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-ink/60">
                {guest ? (
                  <>
                    <span className="italic">
                      terima kasih sudah bersedia meluangkan waktu untuk kami
                    </span>{" "}
                    &mdash; besar harapan kami Anda berkenan hadir
                  </>
                ) : (
                  <>
                    di tempat &mdash;{" "}
                    <span className="italic">besar harapan kami Anda berkenan hadir</span>
                  </>
                )}
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
