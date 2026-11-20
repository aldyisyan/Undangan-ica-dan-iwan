const story1 = "/images/story-1.jpg";
const story2 = "/images/story-2.jpg";
const story3 = "/images/story-3.jpg";
const gal1 = "/images/gal-1.jpg";
const gal2 = "/images/gal-2.jpg";
const gal3 = "/images/gal-3.jpg";

/** Kontainer standar: terpusat. */
export const WRAP = "mx-auto w-full max-w-4xl px-6 sm:px-8";

export const SECTION_PAD = "py-24 sm:py-32";

export const WEDDING = {
  groomNick: "Iwan",
  groomName: "Iwan Pratama S.Kom.",
  groomParents: "Putra pertama dari Bapak H. Suryadi Wijaya & Ibu Hj. Marlina Sari",
  groomInsta: "@iwanpratama",
  brideNick: "Ica",
  brideName: "Ica Lestari S.Pd.",
  brideParents: "Putri kedua dari Bapak H. Bambang Prasetyo & Ibu Hj. Ratna Kusuma",
  brideInsta: "@icalestari",
  iso: "2026-11-21T09:00:00+07:00",
  weekday: "Sabtu",
  dateShort: "21.11.2026",
  dateLabel: "21 November 2026",
  fullLabel: "Sabtu, 21 November 2026",
  city: "Jakarta Selatan",
  venue: "The Tribrata Darmawangsa",
  address: "Jl. Darmawangsa III No. 2, Kebayoran Baru, Jakarta Selatan 12160",
  maps: "https://www.google.com/maps/search/?api=1&query=The%20Tribrata%20Darmawangsa%20Jakarta",
  akad: {
    title: "Akad Nikah",
    time: "09.00 – 10.00 WIB",
    place: "Masjid Al-Ikhlas, Lantai 1",
    note: "Mohon hadir 15 menit lebih awal.",
  },
  resepsi: {
    title: "Resepsi",
    time: "11.00 – 14.00 WIB",
    place: "Grand Ballroom, Lantai 3",
    note: "Dress code: palet sage, nude & terakota.",
  },
};

export const STORY = [
  {
    year: "2019",
    title: "Pertama Bertemu",
    text: "Ketua dan sie acara di pameran kampus Bandung. Diskusi sampai tengah malam, kopi dingin, dan satu payung yang akhirnya dipakai berdua saat hujan turun.",
    img: story1,
    caption: "kampus, hujan & payung",
  },
  {
    year: "2021",
    title: "Memulai Perjalanan",
    text: "Setelah dua tahun saling mengirim pesan panjang, kami sepakat menyebutnya serius. Tanggal 14 Februari, di teras rumah Ica, tanpa keramaian.",
    img: null,
    caption: "14 · 02 · 2021",
  },
  {
    year: "2023",
    title: "Liburan Pertama",
    text: "Dua puluh empat jam di jalan, peta salah arah, dan matahari terbit dari puncak yang tidak kami rencanakan. Sejak itu kami tahu: jalanannya menyenangkan.",
    img: story2,
    caption: "road trip ke selatan",
  },
  {
    year: "2025",
    title: "Lamaran",
    text: "Di lantai lima, lampu-lampu kecil, dan sebuah pertanyaan yang dijawab 'iya' sebelum selesai diucapkan. Keluarga besar hadir tidak lama setelahnya.",
    img: story3,
    caption: " rooftop, 20.15",
  },
  {
    year: "2026",
    title: "Hari Bahagia",
    text: "Sabtu, 21 November. Kami menunggu hari ini dengan sabar — dan ingin Anda menjadi bagian darinya.",
    img: null,
    caption: "sabtu · 21 november",
  },
] as const;

export const CUSTOM_PHOTOS = [
  {
    src: "/custom/our-1.jpg",
    caption: "Ilustrasi personal kami — bouquet",
    ratio: "aspect-[4/5]",
  },
  {
    src: "/custom/our-2.jpg",
    caption: "Ilustrasi personal kami — first dance",
    ratio: "aspect-[4/5]",
  },
  {
    src: "/custom/our-3.jpg",
    caption: "Ilustrasi personal kami — smiling selfie",
    ratio: "aspect-[4/5]",
  },
  {
    src: "/custom/our-4.jpg",
    caption: "Ilustrasi personal kami — wedding portrait",
    ratio: "aspect-[4/5]",
  },
] as const;

export const GALLERY = [
  { src: gal1, caption: "Piknik sore di taman", ratio: "aspect-[4/5]" },
  { src: gal2, caption: "Sepeda tua & balon", ratio: "aspect-square" },
  { src: gal3, caption: "Cincin yang menunggu", ratio: "aspect-[4/5]" },
];

export const GIFTS = [
  { bank: "BCA", number: "1234567890", holder: "Ica Lestari", kind: "Rekening Tabungan" },
  { bank: "Bank Mandiri", number: "1370009988776", holder: "Iwan Pratama", kind: "Rekening Tabungan" },
  { bank: "GoPay", number: "0812 3456 7890", holder: "Iwan Pratama", kind: "Dompet Digital" },
];

export const DRESS_SWATCHES = [
  { name: "Hitam Pekat", hex: "#1E1B18" },
  { name: "Sage Olive", hex: "#7D8471" },
  { name: "Nude Beige", hex: "#E7D3BE" },
  { name: "Terakota", hex: "#B5533C" },
];

export const SEED_WISHES = [
  {
    name: "Rani & Dimas",
    status: "Hadir",
    guests: 2,
    message: "Selamat menempuh hidup baru! Semoga rumah tangganya selalu hangat dan penuh tawa.",
    when: "2 hari lalu",
  },
  {
    name: "Pak Hendra (Kantor)",
    status: "Hadir",
    guests: 1,
    message: "Barakallahu lakuma wa baraka 'alaikuma wa jama'a bainakuma fi khair.",
    when: "3 hari lalu",
  },
  {
    name: "Sinta Maharani",
    status: "Masih Ragu",
    guests: 1,
    message: "Selamat ya Iwan & Ica! Aku usahakan hadir, doakan ya.",
    when: "5 hari lalu",
  },
];
