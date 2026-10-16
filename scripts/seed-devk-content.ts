import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import { lexicalFromText } from '../src/generator/lexical'

const rt = (text: string) => lexicalFromText(text)

async function main() {
  console.log('--- Seeding Categories, Pages, and Posts as DRAFT for devk-website ---')

  const payload = await getPayload({ config: configPromise })

  // 1. Seed Categories
  const categoriesData = [
    {
      name: 'Web Development',
      slug: 'web-development',
      headline: 'Standar Pembuatan Website Modern',
      description: 'Panduan dan wawasan teknis pembuatan website instan dan custom dengan performa tinggi.',
    },
    {
      name: 'SEO & Optimasi',
      slug: 'seo',
      headline: 'Strategi Ranking & Dominasi Search Engine',
      description: 'Taktik SEO on-page, teknikal, dan arsitektur konten untuk mendominasi Google.',
    },
    {
      name: 'Studi Kasus',
      slug: 'studi-kasus',
      headline: 'Benchmark & Hasil Implementasi Nyata',
      description: 'Analisis mendalam dan hasil nyata pertumbuhan traffic serta konversi website klien.',
    },
  ]

  const categoryMap = new Map<string, string>()

  for (const cat of categoriesData) {
    const existing = await payload.find({
      collection: 'categories',
      where: { slug: { equals: cat.slug } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      console.log(`[Category] Found existing: ${cat.name} (${existing.docs[0].id})`)
      categoryMap.set(cat.slug, existing.docs[0].id)
    } else {
      const created = await payload.create({
        collection: 'categories',
        data: cat,
      })
      console.log(`[Category] Created: ${cat.name} (${created.id})`)
      categoryMap.set(cat.slug, created.id)
    }
  }

  // 2. Seed Pages as DRAFT
  const pagesData = [
    {
      title: 'Jasa Pembuatan Website & SEO Domination',
      slug: 'jasa-pembuatan-website',
      description:
        'Layanan pembuatan website profesional: pilih template siap pakai (ready-made) untuk launching instan atau custom build dari nol dengan arsitektur headless Next.js & garansi SEO domination.',
      hero: {
        type: 'default',
        richText: rt(
          'Solusi Website Bisnis Siap Pakai & Custom Build dari Nol dengan Arsitektur SEO Modern.',
        ),
      },
      layout: [
        {
          blockType: 'cta',
          ctaFields: {
            style: 'buttons',
            richText: rt(
              '## Mau Website Cepat Jadi atau Sistem Custom Khusus?\nKami menyediakan dua jalur: Ready-Made Express (live 1-3 hari) dan Custom Headless Development (Next.js & Payload CMS) yang dirancang untuk performa Core Web Vitals maksimal.',
            ),
            links: [
              {
                link: {
                  type: 'custom',
                  url: '/jasa-web-instan',
                  label: 'Lihat Web Instan (Ready-Made)',
                },
              },
              {
                link: {
                  type: 'custom',
                  url: '/jasa-web-custom',
                  label: 'Konsultasi Custom Build',
                },
              },
            ],
          },
        },
        {
          blockType: 'comparisonTable',
          comparisonTableFields: {
            introContent: rt(
              '## Perbandingan: Ready-Made vs Custom Build\nPilih solusi yang paling efisien untuk fase bisnis Anda saat ini.',
            ),
            header: {
              tableTitle: 'Kriteria Evaluasi',
              columnOneHeader: 'Ready-Made (Instan)',
              columnTwoHeader: 'Custom from Scratch',
            },
            rows: [
              {
                feature: 'Waktu Pengerjaan',
                columnOne: '1 - 3 Hari Kerja',
                columnOneCheck: true,
                columnTwo: '2 - 4 Minggu',
              },
              {
                feature: 'Investasi Awal',
                columnOne: 'Hemat & Terjangkau',
                columnOneCheck: true,
                columnTwo: 'Menyesuaikan Skala Fitur',
              },
              {
                feature: 'Teknologi Frontend',
                columnOne: 'Modern Static / SSR',
                columnOneCheck: true,
                columnTwo: 'Next.js App Router + Tailwind',
              },
              {
                feature: 'Panel Kontrol Konten',
                columnOne: 'Admin CMS Intuitif',
                columnOneCheck: true,
                columnTwo: 'Payload Headless CMS Custom',
              },
              {
                feature: 'Optimasi SEO On-Page',
                columnOne: 'Fondasi Standar Lengkap',
                columnOneCheck: true,
                columnTwo: 'SEO Domination & Schema Lanjutan',
              },
              {
                feature: 'Kustomisasi Desain',
                columnOne: 'Berdasarkan Katalog Template',
                columnOneCheck: false,
                columnTwo: '100% Unik Sesuai Brand Guide',
              },
            ],
          },
        },
        {
          blockType: 'cardGrid',
          cardGridFields: {
            richText: rt(
              '## 4 Pilar SEO Domination Engine\nSetiap website yang kami bangun dilengkapi fondasi teknikal agar mudah merangking di halaman 1 Google.',
            ),
            cards: [
              {
                title: 'Technical SEO & Core Web Vitals',
                description:
                  'Skor Lighthouse hijau, waktu muat sub-detik, mobile-responsive sempurna, dan aset terkompresi otomatis.',
              },
              {
                title: 'Arsitektur Topic Cluster',
                description:
                  'Struktur URL dan internal linking silang terencana untuk membangun topical authority di mata mesin pencari.',
              },
              {
                title: 'Structured Data & Schema.org',
                description:
                  'Integrasi JSON-LD schema (Organization, WebSite, LocalBusiness, FAQ) agar Google mengenali entitas bisnis secara akurat.',
              },
              {
                title: 'Programmatic SEO Ready',
                description:
                  'Infrastruktur dinamis yang memungkinkan pembuatan ratusan landing page per kota atau per layanan secara scalable.',
              },
            ],
          },
        },
        {
          blockType: 'steps',
          stepsFields: {
            steps: [
              {
                content: rt(
                  '### 1. Konsultasi & Pemilihan Jalur\nDiskusikan target bisnis Anda: pilih template katalog siap pakai atau susun spesifikasi custom.',
                ),
              },
              {
                content: rt(
                  '### 2. Pengerjaan & Input Konten\nKami siapkan infrastruktur web, styling visual, integrasi CMS, serta input profil dan katalog produk Anda.',
                ),
              },
              {
                content: rt(
                  '### 3. Audit SEO & Launching\nPengujian kecepatan, konfigurasi Google Search Console & Analytics, domain live, dan serah terima akses admin.',
                ),
              },
            ],
          },
        },
        {
          blockType: 'whatsappCta',
          heading: 'Siap Membangun Website Berperforma Tinggi?',
          body: 'Konsultasikan kebutuhan website Anda sekarang. Dapatkan rekomendasi jalur terbaik serta estimasi biaya transparan.',
          label: 'Hubungi Tim Devk via WhatsApp →',
        },
      ],
    },
    {
      title: 'Jasa Website Siap Pakai (Ready-Made) — Live 48 Jam',
      slug: 'jasa-web-instan',
      description:
        'Solusi website instan profesional dari katalog desain siap pakai. Hemat biaya, performa kencang, langsung online dalam hitungan hari lengkap dengan CMS.',
      hero: {
        type: 'default',
        richText: rt('Website Siap Pakai, Live dalam 48 Jam dengan Tampilan Modern.'),
      },
      layout: [
        {
          blockType: 'cta',
          ctaFields: {
            style: 'buttons',
            richText: rt(
              '## Website Siap Pakai untuk Bisnis Cepat Tumbuh\nTak perlu menunggu berminggu-minggu. Pilih desain dari katalog industri kami, kirimkan materi bisnis Anda, dan website siap menerima pengunjung dalam 1–3 hari.',
            ),
            links: [
              {
                link: {
                  type: 'custom',
                  url: 'https://wa.me/6285799520350',
                  label: 'Pilih Katalog Template Sekarang',
                },
              },
            ],
          },
        },
        {
          blockType: 'cardGrid',
          cardGridFields: {
            richText: rt(
              '## Pilihan Template Sesuai Industri Anda\nDesain telah dioptimasi untuk konversi dan keterbacaan di semua ukuran layar.',
            ),
            cards: [
              {
                title: 'Company Profile & Korporat',
                description:
                  'Tampilan elegan dan kredibel untuk perusahaan jasa, konsultan, kontraktor, dan agensi.',
              },
              {
                title: 'Klinik & Layanan Kesehatan',
                description:
                  'Dilengkapi jadwal dokter, daftar layanan medis, dan tombol booking appointment langsung ke WhatsApp.',
              },
              {
                title: 'Katalog Produk & Manufaktur',
                description:
                  'Tampilkan spesifikasi produk, galeri foto detail, dan permintaan penawaran harga (RFQ) terstruktur.',
              },
              {
                title: 'Landing Page Penjualan (Single Page)',
                description:
                  'Fokus konversi tinggi untuk peluncuran produk khusus, seminar, kursus, atau penawaran promo terbatas.',
              },
            ],
          },
        },
        {
          blockType: 'pricing',
          pricingFields: {
            plans: [
              {
                name: 'Starter Ready-Made',
                hasPrice: true,
                price: 'Rp 1.490.000',
                description:
                  'Cocok untuk UMKM & perorangan yang butuh kehadiran online resmi secara kilat.',
              },
              {
                name: 'Pro Business Ready-Made',
                hasPrice: true,
                price: 'Rp 2.890.000',
                description:
                  'Solusi lengkap dengan CMS multi-halaman, integrasi form lead, dan setup Google Search Console.',
              },
            ],
          },
        },
        {
          blockType: 'whatsappCta',
          heading: 'Butuh Website Online Minggu Ini?',
          body: 'Hubungi kami via WhatsApp untuk melihat demo live template dan memulai setup hari ini.',
          label: 'Chat WhatsApp Sekarang →',
        },
      ],
    },
    {
      title: 'Jasa Pembuatan Website Custom (Build from Scratch)',
      slug: 'jasa-web-custom',
      description:
        'Pengembangan website custom dari nol menggunakan Next.js App Router, Tailwind CSS, dan Headless CMS Payload. Desain eksklusif, skalabilitas tinggi, tanpa batasan template.',
      hero: {
        type: 'default',
        richText: rt(
          'Arsitektur Web Khusus Sesuai Skalabilitas Bisnis Anda Tanpa Batasan Template.',
        ),
      },
      layout: [
        {
          blockType: 'cta',
          ctaFields: {
            style: 'buttons',
            richText: rt(
              '## Bangun Website Sesuai Kebutuhan Unik Bisnis Anda\nKetika template standar tidak lagi mampu menampung proses bisnis dan identitas brand Anda, arsitektur custom Next.js adalah fondasi terbaik untuk jangka panjang.',
            ),
            links: [
              {
                link: {
                  type: 'custom',
                  url: 'https://wa.me/6285799520350',
                  label: 'Jadwalkan Konsultasi Teknis',
                },
              },
            ],
          },
        },
        {
          blockType: 'cardGrid',
          cardGridFields: {
            richText: rt(
              '## Keunggulan Arsitektur Headless Modern\nKami meninggalkan arsitektur monolitik lambat dan membangun web modern dengan standar industri terkini.',
            ),
            cards: [
              {
                title: 'Next.js App Router & React 19',
                description:
                  'Server-Side Rendering (SSR) dan Server Components untuk rendering secepat kilat serta SEO optimal.',
              },
              {
                title: 'Headless CMS Mandiri (Self-Hosted)',
                description:
                  'Panel admin Payload CMS yang sepenuhnya disesuaikan dengan skema data produk, pesanan, atau konten Anda tanpa biaya lisensi bulanan.',
              },
              {
                title: 'Bebas Plugin Bloatware',
                description:
                  'Kode bersih tanpa dependensi plugin pihak ketiga yang rawan celah keamanan dan sering memperlambat website.',
              },
              {
                title: 'Skalabilitas Cloud & Kontainer',
                description:
                  'Dideploy menggunakan Docker container dengan auto-restart, monitoring performa, dan isolasi database aman.',
              },
            ],
          },
        },
        {
          blockType: 'steps',
          stepsFields: {
            steps: [
              {
                content: rt(
                  '### 1. Discovery & Pemetaan Kebutuhan\nAnalisis proses bisnis, alur pengguna, wireframe arsitektur data, dan penentuan tech stack.',
                ),
              },
              {
                content: rt(
                  '### 2. UI/UX & Prototipe Interaktif\nPembuatan desain antarmuka sesuai identitas brand dengan fokus kemudahan navigasi dan konversi.',
                ),
              },
              {
                content: rt(
                  '### 3. Full-Stack Development\nCoding frontend Next.js, pembuatan API, konfigurasi database MongoDB/Postgres, dan panel CMS.',
                ),
              },
              {
                content: rt(
                  '### 4. Stress Test, Security & Deploy\nPengujian beban traffic, audit celah keamanan, konfigurasi SSL & CDN, serta live deployment.',
                ),
              },
            ],
          },
        },
        {
          blockType: 'whatsappCta',
          heading: 'Punya Spesifikasi Khusus untuk Proyek Web Anda?',
          body: 'Kirimkan dokumen brief atau diskusikan konsep bersama tim engineering kami.',
          label: 'Konsultasi Proyek Custom →',
        },
      ],
    },
    {
      title: 'Jasa SEO Dominasi & Retainer Pertumbuhan Organik',
      slug: 'jasa-seo-dominasi',
      description:
        'Program SEO komprehensif untuk menguasai halaman pertama Google. Menggabungkan technical SEO, strategi topic cluster, programmatic SEO, dan optimasi konversi on-page.',
      hero: {
        type: 'default',
        richText: rt('Kuasai Kata Kunci Transaksional di Google Tanpa Bakar Uang Iklan.'),
      },
      layout: [
        {
          blockType: 'cta',
          ctaFields: {
            style: 'buttons',
            richText: rt(
              '## Kuasai Kata Kunci Transaksional di Google\nTraffic organik dari pencarian Google memiliki niat beli (buying intent) tertinggi. Kami membangun strategi SEO yang berfokus mendatangkan lead berkualitas, bukan sekadar vanity metrics.',
            ),
            links: [
              {
                link: {
                  type: 'custom',
                  url: 'https://wa.me/6285799520350',
                  label: 'Ajukan Audit SEO Website',
                },
              },
            ],
          },
        },
        {
          blockType: 'cardGrid',
          cardGridFields: {
            richText: rt(
              '## Roadmap Strategi Dominasi SEO\nLangkah terukur untuk menaikkan ranking dan mempertahankan posisi puncak dari kompetitor.',
            ),
            cards: [
              {
                title: 'Technical SEO Foundation',
                description:
                  'Perbaikan crawl budget, arsitektur sitemap XML dinamis, eliminasi 404/redirect chains, dan optimasi Core Web Vitals.',
              },
              {
                title: 'Topic Cluster & Semantic Content',
                description:
                  'Penyusunan pilar konten utama dan sub-artikel yang saling menguatkan authority domain pada topik spesifik.',
              },
              {
                title: 'Local SEO & Google Maps Domination',
                description:
                  'Optimasi profil Google Bisnisku, LocalBusiness JSON-LD schema, dan sinyal lokasi untuk mendominasi area target.',
              },
              {
                title: 'Conversion Rate Optimization (CRO)',
                description:
                  'Memastikan pengunjung yang masuk dari Google tidak langsung keluar, melainkan melakukan tindakan (klik WA, form, telepon).',
              },
            ],
          },
        },
        {
          blockType: 'pricing',
          pricingFields: {
            plans: [
              {
                name: 'Paket SEO Setup & Audit',
                hasPrice: true,
                price: 'Rp 3.500.000',
                description:
                  'Audit teknis menyeluruh, perbaikan struktur on-page, integrasi Schema, dan riset kata kunci target 6 bulan.',
              },
              {
                name: 'Retainer SEO Domination',
                hasPrice: true,
                price: 'Rp 5.500.000',
                description:
                  'Produksi artikel otoritas rutin, monitoring ranking mingguan, optimasi teknikal berkala, dan laporan kinerja bulanan.',
              },
            ],
          },
        },
        {
          blockType: 'whatsappCta',
          heading: 'Website Anda Sepi Pengunjung?',
          body: 'Dapatkan analisis gratis posisi ranking dan potensi kata kunci industri Anda bersama spesialis SEO kami.',
          label: 'Minta Audit SEO Gratis via WhatsApp →',
        },
      ],
    },
  ]

  for (const page of pagesData) {
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: page.slug } },
      draft: true,
      limit: 1,
    })

    if (existing.docs.length > 0) {
      console.log(`[Page] Updating existing draft: ${page.title}`)
      await payload.update({
        collection: 'pages',
        id: existing.docs[0].id,
        data: page,
        draft: true,
      })
    } else {
      console.log(`[Page] Creating new draft: ${page.title}`)
      await payload.create({
        collection: 'pages',
        data: page,
        draft: true,
      })
    }
  }

  // 3. Seed Posts as DRAFT
  const webDevCatId = categoryMap.get('web-development')!
  const seoCatId = categoryMap.get('seo')!

  const postsData = [
    {
      title: 'Template vs Custom Website: Mana yang Tepat untuk Bisnis Anda?',
      slug: 'template-vs-custom-website',
      category: webDevCatId,
      featuredMedia: 'videoUrl' as const,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      dynamicThumbnail: true,
      authorType: 'guest' as const,
      guestAuthor: 'Tim Devk',
      publishedOn: new Date().toISOString(),
      excerpt: rt(
        'Panduan komprehensif membedah kelebihan, kekurangan, estimasi biaya, dan waktu pengerjaan antara website template siap pakai dengan website custom dari nol.',
      ),
      content: [
        {
          blockType: 'blogMarkdown',
          blogMarkdownFields: {
            markdown: `## Pengantar: Dilema Setiap Pemilik Bisnis

Ketika memutuskan untuk membangun kehadiran online resmi, pertanyaan pertama yang selalu muncul adalah: **apakah sebaiknya menggunakan template siap pakai (ready-made) atau membangun website custom dari nol (build from scratch)?**

Kedua pendekatan ini memiliki tempatnya masing-masing. Pilihan yang keliru bukan hanya menghamburkan anggaran, tetapi juga bisa memperlambat ekspansi bisnis Anda.

---

## 1. Website Siap Pakai (Ready-Made)

### Kelebihan:
- **Waktu Peluncuran Kilat:** Website siap dalam hitungan 1–3 hari kerja karena layout, struktur halaman, dan styling telah teruji.
- **Biaya Investasi Rendah:** Biaya awal jauh lebih terjangkau, sangat ideal untuk validasi pasar dan bisnis tahap awal.
- **Struktur Terbukti (Battle-Tested):** Pola penempatan tombol call-to-action dan alur navigasi sudah mengadopsi standar UX terbaik.

### Keterbatasan:
- **Kustomisasi Terbatas:** Anda mengikuti framework yang sudah ada; penambahan fitur unik yang terlalu spesifik akan sulit dilakukan.
- **Diferensiasi:** Ada kemungkinan kompetitor di industri lain menggunakan struktur visual yang serupa.

**Kapan Memilih Ready-Made?**
Ketika Anda butuh kehadiran digital resmi segera, memiliki katalog produk/layanan standar, dan ingin mengalokasikan sisa modal untuk operasional bisnis.

---

## 2. Website Custom from Scratch

### Kelebihan:
- **100% Sesuai Identitas Brand:** Tidak ada batasan layout, micro-interaction, atau arsitektur visual.
- **Performa & Kecepatan Maksimal:** Dibangun menggunakan teknologi modern seperti Next.js App Router dan Tailwind CSS tanpa dependensi plugin yang memperlambat website.
- **Skalabilitas Tanpa Batas:** Mudah dihubungkan dengan API internal, ERP, CRM, atau sistem pembayaran khusus.

### Keterbatasan:
- **Waktu Pengerjaan Lebih Panjang:** Membutuhkan fase riset, wireframing, UI design, dan frontend/backend development (biasanya 2–4 minggu).
- **Investasi Awal Lebih Tinggi:** Menuntut anggaran lebih besar karena melibatkan tim engineering khusus.

**Kapan Memilih Custom?**
Ketika bisnis Anda memiliki alur transaksi unik, membutuhkan integrasi sistem khusus, atau brand positioning Anda menuntut tampilan eksklusif yang membedakan Anda dari kompetitor.

---

## Kesimpulan

Pilihlah solusi yang selaras dengan fase bisnis Anda saat ini. Mulai dengan template siap pakai jika kecepatan dan efisiensi modal adalah prioritas, lalu lakukan eskalasi ke arsitektur custom saat volume bisnis Anda menuntut skalabilitas tingkat lanjut.`,
          },
        },
      ],
    },
    {
      title: 'Berapa Biaya Pembuatan Website Profesional di 2026?',
      slug: 'biaya-pembuatan-website-2026',
      category: webDevCatId,
      featuredMedia: 'videoUrl' as const,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      dynamicThumbnail: true,
      authorType: 'guest' as const,
      guestAuthor: 'Tim Devk',
      publishedOn: new Date().toISOString(),
      excerpt: rt(
        'Rincian komponen biaya pembuatan website: domain, hosting/server cloud, lisensi CMS, UI/UX design, hingga biaya pemeliharaan tahunan yang perlu Anda ketahui.',
      ),
      content: [
        {
          blockType: 'blogMarkdown',
          blogMarkdownFields: {
            markdown: `## Anatomi Biaya Website Profesional

Banyak calon klien bertanya: *"Kenapa harga website ada yang 500 ribu, tapi ada juga yang puluhan juta rupiah?"*

Perbedaan harga tersebut bukan sekadar margin keuntungan agensi, melainkan mencerminkan arsitektur teknologi, keamanan, performa kecepatan, dan dukungan jangka panjang. Berikut rincian komponen biaya yang sesungguhnya di tahun 2026.

---

### Komponen Biaya Pokok

1. **Domain & Identitas (.com / .id):**
   - Rata-rata berkisar antara Rp 150.000 – Rp 250.000 per tahun.
2. **Infrastruktur Server & Hosting:**
   - Shared hosting murah (kurang direkomendasikan untuk bisnis): Rp 300.000 - Rp 600.000/thn.
   - Cloud VPS / Container (Docker, Next.js, SSL otomatis, stabil): Rp 1.200.000 - Rp 3.000.000/thn.
3. **Engineering & Desain Antarmuka:**
   - Website Instan / Ready-Made: Rp 1.500.000 - Rp 3.500.000.
   - Website Custom Modern (Headless Next.js + Payload CMS): Rp 5.000.000 - Rp 25.000.000+.

---

## Jebakan Biaya Tersembunyi (Hidden Costs)

Hati-hati dengan tawaran website yang terlalu murah di awal:
- **Lisensi Plugin Tahunan:** Website WordPress murah seringkali menggunakan plugin bajakan (nulled) yang rawan malware, atau meminta biaya perpanjangan lisensi mahal setiap tahun.
- **Ketergantungan Developer:** Struktur kode yang berantakan membuat Anda terkunci dan tidak bisa memindahkan website ke server lain.
- **Tanpa Optimasi SEO:** Website jadi tetapi tidak pernah terindeks Google karena tidak ada sitemap, meta tag, atau schema markup.

## Rekomendasi Devk

Investasikan dana pada arsitektur web yang bersih, cepat diakses mobile, dan mudah dikelola sendiri kontennya tanpa harus selalu membayar jasa teknisi setiap kali ada perubahan teks kecil.`,
          },
        },
      ],
    },
    {
      title: 'Checklist Wajib Sebelum Membeli Jasa Pembuatan Website',
      slug: 'checklist-jasa-pembuatan-website',
      category: webDevCatId,
      featuredMedia: 'videoUrl' as const,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      dynamicThumbnail: true,
      authorType: 'guest' as const,
      guestAuthor: 'Tim Devk',
      publishedOn: new Date().toISOString(),
      excerpt: rt(
        '10 hal krusial yang wajib Anda tanyakan ke agensi web sebelum menandatangani kontrak, mulai dari kepemilikan kode hingga jaminan performa.',
      ),
      content: [
        {
          blockType: 'blogMarkdown',
          blogMarkdownFields: {
            markdown: `## Jangan Tandatangani Kontrak Sebelum Mengecek 10 Hal Ini

Membeli jasa pembuatan website adalah investasi aset digital. Sayangnya, banyak pengusaha terjebak dengan vendor yang tidak transparan. 

Gunakan checklist ini saat wawancara atau meminta penawaran harga dari calon agensi web Anda:

1. **Kepemilikan Akun Domain & Server:** Apakah domain dan server didaftarkan atas nama Anda sendiri atau milik vendor?
2. **Akses Source Code:** Apakah Anda diberikan repositori Git lengkap atau file zip kode sumber setelah proyek selesai?
3. **Standar Core Web Vitals:** Apakah ada jaminan skor kecepatan minimal (Lighthouse skor di atas 85+ pada mobile)?
4. **Desain Mobile-First:** Apakah tampilan di layar smartphone dirancang khusus atau hanya sekadar menyusutkan versi desktop?
5. **Kemudahan Update Konten (CMS):** Apakah Anda bisa mengubah nomor WhatsApp, menambah artikel, dan mengedit produk secara mandiri?
6. **Fondasi SEO On-Page:** Apakah sudah mencakup XML Sitemap dinamis, robots.txt, Canonical URL, dan OpenGraph tag?
7. **Structured Data Schema.org:** Apakah website sudah dilengkapi JSON-LD untuk LocalBusiness dan Organization?
8. **Keamanan & SSL:** Apakah koneksi HTTPS disertakan tanpa biaya langganan tambahan?
9. **Konektivitas Analitik:** Apakah Google Tag Manager, Google Analytics 4, dan Google Search Console sudah dikonfigurasi?
10. **Masa Garansi Bug & Maintenance:** Berapa lama masa perbaikan bug gratis setelah website go-live?`,
          },
        },
      ],
    },
    {
      title: 'Kenapa Website Lambat Membunuh Konversi Penjualan Anda',
      slug: 'website-lambat-konversi-turun',
      category: seoCatId,
      featuredMedia: 'videoUrl' as const,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      dynamicThumbnail: true,
      authorType: 'guest' as const,
      guestAuthor: 'Tim Devk',
      publishedOn: new Date().toISOString(),
      excerpt: rt(
        'Data riset menunjukkan keterlambatan 1 detik menurunkan konversi hingga 7%. Simak pengaruh Core Web Vitals terhadap psikologi calon pembeli dan ranking Google.',
      ),
      content: [
        {
          blockType: 'blogMarkdown',
          blogMarkdownFields: {
            markdown: `## Kecepatan adalah Faktor Konversi Utama

Banyak pemilik website menghabiskan jutaan rupiah untuk iklan berbayar (Google Ads, Meta Ads, TikTok Ads), tetapi mengabaikan fakta krusial: **halaman tujuan (landing page) mereka membutuhkan waktu 5 detik lebih untuk terbuka.**

### Statistik Performa Web & Konversi:
- **Keterlambatan 1 Detik:** Menyebabkan penurunan kepuasan pengunjung sebesar 16% dan penurunan konversi hingga 7%.
- **Mobile Bounce Rate:** Lebih dari 53% pengguna smartphone langsung meninggalkan website jika halaman tidak tampil dalam 3 detik pertama.
- **Faktor Algoritma Google:** Sejak pembaruan Page Experience, Google secara terang-terangan memprioritaskan website dengan Core Web Vitals (LCP, INP, CLS) yang hijau.

---

### Tiga Metrik Vital yang Wajib Dipantau

1. **Largest Contentful Paint (LCP):** Waktu yang dibutuhkan untuk merender elemen konten utama pada layar. Target: di bawah 2.5 detik.
2. **Interaction to Next Paint (INP):** Responsivitas antarmuka saat pengguna menekan tombol atau menu. Target: di bawah 200 milidetik.
3. **Cumulative Layout Shift (CLS):** Stabilitas visual halaman agar elemen tidak bergeser tiba-tiba saat loading aset. Target: di bawah 0.1.

Di Devk, setiap website dibangun dengan optimasi aset modern (Next.js Image WebP/AVIF, CSS modular Tailwind v4, server-side caching) untuk memastikan Core Web Vitals selalu berada di zona hijau.`,
          },
        },
      ],
    },
    {
      title: 'Cara Mendominasi Google Search dengan Strategi Topic Cluster',
      slug: 'strategi-topic-cluster-seo',
      category: seoCatId,
      featuredMedia: 'videoUrl' as const,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      dynamicThumbnail: true,
      authorType: 'guest' as const,
      guestAuthor: 'Tim Devk',
      publishedOn: new Date().toISOString(),
      excerpt: rt(
        'Zaman keyword stuffing sudah berakhir. Pelajari cara membangun Topical Authority dengan struktur Pillar Page dan Cluster Content yang disukai algoritma Google.',
      ),
      content: [
        {
          blockType: 'blogMarkdown',
          blogMarkdownFields: {
            markdown: `## Mengapa Menulis Artikel Acak Tidak Lagi Berhasil?

Dahulu, Anda cukup membuat artikel pendek dengan mengulang kata kunci berkali-kali untuk merangking di Google. Saat ini, algoritma Google menggunakan pemrosesan semantik untuk menilai **Topical Authority** — seberapa mendalam dan terstruktur domain Anda mengulas suatu bidang keahlian.

Di sinilah **Topic Cluster Framework** menjadi senjata utama.

---

### Struktur Topic Cluster Model

Topic cluster terdiri dari 3 pilar utama:
1. **Pillar Page (Halaman Utama):** Halaman panduan komprehensif yang membahas topik inti secara luas (contoh: Panduan Lengkap Pembuatan Website Bisnis).
2. **Cluster Content (Sub-Artikel Spesifik):** Artikel-artikel pendukung yang mengupas sub-topik secara mendalam (contoh: Biaya Website, Checklist Agensi, Perbandingan Template vs Custom).
3. **Hyperlink Kontekstual (Internal Linking):** Setiap artikel cluster menautkan kembali ke Pillar Page menggunakan anchor text relevan, dan Pillar Page menautkan ke cluster terkait.

---

### Keuntungan untuk SEO Anda

- **Sinyal Relevansi Kuat:** Google langsung memahami hierarki konten dan melihat website Anda sebagai rujukan otoritatif.
- **Distribusi PageRank Internal:** Halaman baru lebih cepat terindeks dan naik peringkat karena mendapat aliran link authority dari artikel yang sudah mapan.
- **User Journey Terstruktur:** Pengunjung tidak cepat meninggalkan web karena disuguhkan bacaan lanjutan yang relevan dengan pertanyaan mereka.`,
          },
        },
      ],
    },
    {
      title: 'Pentingnya Structured Data Schema.org untuk Bisnis Lokal',
      slug: 'structured-data-schema-bisnis-lokal',
      category: seoCatId,
      featuredMedia: 'videoUrl' as const,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      dynamicThumbnail: true,
      authorType: 'guest' as const,
      guestAuthor: 'Tim Devk',
      publishedOn: new Date().toISOString(),
      excerpt: rt(
        'Tingkatkan CTR hingga 30% dengan Rich Snippets. Panduan lengkap implementasi Schema JSON-LD untuk LocalBusiness, Organization, FAQ, dan BreadcrumbList.',
      ),
      content: [
        {
          blockType: 'blogMarkdown',
          blogMarkdownFields: {
            markdown: `## Berbicara dengan Bahasa Mesin Pencari

Ketika Google merayapi (crawl) halaman website, ia membaca teks mentah. Namun, tanpa penanda khusus, Google butuh proses ekstra untuk membedakan apakah sebuah angka adalah nomor telepon kantor, harga produk, atau tahun berdiri.

**Structured Data (Schema Markup JSON-LD)** adalah cara memberi tahu Google secara eksplisit mengenai entitas bisnis Anda.

---

### Tipe Schema Wajib untuk Website Bisnis

1. **Organization Schema:** Menyatakan nama legal entitas, logo resmi, URL website, dan tautan profil sosial media resmi.
2. **LocalBusiness Schema:** Memberi tahu Google alamat fisik kantor, titik koordinat GPS (latitude/longitude), jam operasional, dan area jangkauan layanan.
3. **FAQPage Schema:** Menampilkan daftar pertanyaan dan jawaban langsung di hasil pencarian Google (SERP), meningkatkan ruang visual dan Click-Through Rate (CTR).
4. **BreadcrumbList Schema:** Menampilkan jalur navigasi breadcrumb yang rapi di hasil pencarian alih-alih URL yang panjang.

---

### Hasil Implementasi Nyata

Website dengan Schema yang valid memenuhi syarat untuk mendapatkan **Rich Results** (tampilan bintang ulasan, sitelinks, alamat langsung, kotak FAQ) yang secara konsisten menaikkan CTR hingga 20-30% dibandingkan hasil pencarian teks biasa.`,
          },
        },
      ],
    },
  ]

  for (const post of postsData) {
    const existing = await payload.find({
      collection: 'posts',
      where: { slug: { equals: post.slug } },
      draft: true,
      limit: 1,
    })

    if (existing.docs.length > 0) {
      console.log(`[Post] Updating existing draft: ${post.title}`)
      await payload.update({
        collection: 'posts',
        id: existing.docs[0].id,
        data: post as any,
        draft: true,
      })
    } else {
      console.log(`[Post] Creating new draft: ${post.title}`)
      await payload.create({
        collection: 'posts',
        data: post as any,
        draft: true,
      })
    }
  }

  console.log('--- All Categories, Pages, and Posts have been seeded as DRAFT! ---')
  process.exit(0)
}

main().catch((err) => {
  console.error('Seeding failed:', err)
  process.exit(1)
})
