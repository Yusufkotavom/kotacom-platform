import Image from 'next/image'
import React from 'react'

import { CountUp } from './CountUp'
import {
  Arrow,
  CrossMark,
  GlyphInfra,
  GlyphPrint,
  GlyphSoftware,
  GlyphWebsite,
  Plus,
} from './icons'
import { Reveal } from './Reveal'
import { Terminal } from './Terminal'
import classes from './index.module.scss'

const WA_TEXT = encodeURIComponent(
  'Halo Kotacom, saya ingin konsultasi mengenai kebutuhan digital bisnis saya.',
)
const WA = `https://wa.me/6285799520350?text=${WA_TEXT}`

type Stat = { k: string; v?: string; count?: number; suffix?: string; s: string }

const stats: Stat[] = [
  { k: 'Berdiri sejak', v: '2008', s: '17 tahun mendampingi bisnis' },
  { k: 'Proyek terkirim', count: 150, suffix: '+', s: 'Website, aplikasi & cetak' },
  { k: 'Kota terjangkau', count: 394, s: 'Layanan remote seluruh Indonesia' },
  { k: 'Respon teknis', v: '< 24 jam', s: 'Dukungan aktif hari kerja' },
]

const clients = [
  'BUTIK CANTIK',
  'CV MAJU BERSAMA',
  'KOPERASI SEJAHTERA',
  'SINAR ABADI',
  'PRIMA MEDIA',
  'NUSANTARA PRINT',
  'ARENA DIGITAL',
  'MAJU JAYA LOGISTIK',
]

const services = [
  {
    n: '01',
    title: 'Website Profesional',
    desc: 'Company profile, landing page, e-commerce, dan portal yang cepat, rapi, dan mudah dikelola.',
    items: ['Next.js / Astro', 'SEO teknis', 'CMS terintegrasi', 'Core Web Vitals'],
    Glyph: GlyphWebsite,
  },
  {
    n: '02',
    title: 'Software Development',
    desc: 'Aplikasi custom untuk operasional bisnis — dari POS, inventory, sampai sistem internal.',
    items: ['Web app & dashboard', 'Mobile (Flutter)', 'Integrasi API', 'Otomasi proses'],
    Glyph: GlyphSoftware,
  },
  {
    n: '03',
    title: 'IT Support & Infrastruktur',
    desc: 'Kelola server, jaringan, dan perangkat kantor supaya operasional tidak pernah berhenti.',
    items: ['Setup & migrasi server', 'Jaringan & VPN', 'Monitoring', 'Backup terjadwal'],
    Glyph: GlyphInfra,
  },
  {
    n: '04',
    title: 'Percetakan & Branding',
    desc: 'Cetak buku, kemasan, dan materi promosi dengan kontrol kualitas end-to-end.',
    items: ['Offset & digital', 'Buku & katalog', 'Kemasan', 'Desain grafis'],
    Glyph: GlyphPrint,
  },
]

const steps = [
  { n: '01', t: 'Pahami kebutuhan', d: 'Kami petakan tujuan bisnis, alur kerja, dan kendala teknis sebelum menyentuh baris kode pertama.' },
  { n: '02', t: 'Susun solusi realistis', d: 'Rencana kerja, arsitektur, dan estimasi yang jujur — tanpa fitur berlebihan yang tidak terpakai.' },
  { n: '03', t: 'Eksekusi & dampingi', d: 'Bangun, uji, rilis, lalu dampingi operasional harian beserta dokumentasi dan pelatihan.' },
]

const tech: { name: string; icon: string; role: string; wide?: boolean }[] = [
  { name: 'TypeScript', icon: 'typescript', role: 'Language' },
  { name: 'Next.js', icon: 'nextdotjs', role: 'Framework' },
  { name: 'React', icon: 'react', role: 'Library' },
  { name: 'Node.js', icon: 'nodedotjs', role: 'Runtime' },
  { name: 'PostgreSQL', icon: 'postgresql', role: 'Database' },
  { name: 'MongoDB', icon: 'mongodb', role: 'Database' },
  { name: 'Tailwind', icon: 'tailwindcss', role: 'Styling' },
  { name: 'Payload CMS', icon: 'payload', role: 'CMS' },
  { name: 'Docker', icon: 'docker', role: 'Container' },
  { name: 'Linux', icon: 'linux', role: 'Server' },
  { name: 'AWS', icon: 'cloud', role: 'Cloud' },
  { name: 'Cloudflare', icon: 'cloudflare', role: 'Edge' },
]

const projects = [
  {
    tag: 'Retail',
    t: 'POS System — Butik Cantik',
    d: 'Kasir, stok multi-outlet, dan laporan penjualan real-time untuk jaringan butik di Jawa Timur.',
    m: ['Next.js', 'PostgreSQL', 'Prisma'],
    img: '/images/kotacom/retail-store.jpg',
    alt: 'Toko retail pakaian dengan rak dan pencahayaan gantung',
  },
  {
    tag: 'Infrastruktur',
    t: 'IT Upgrade — CV Maju Bersama',
    d: 'Migrasi server lama ke VPS terkelola, VPN kantor, dan backup otomatis harian.',
    m: ['Linux', 'Docker', 'WireGuard'],
    img: '/images/kotacom/server-racks.jpg',
    alt: 'Kabel jaringan tertata pada panel patch server',
  },
  {
    tag: 'Koperasi',
    t: 'Koperasi Digital',
    d: 'Simpan pinjam, anggota, dan pembukuan otomatis dengan alur persetujuan berjenjang.',
    m: ['Laravel', 'MySQL', 'Redis'],
    img: '/images/kotacom/meeting.jpg',
    alt: 'Tim berdiskusi dengan sticky notes di dinding kantor',
  },
]

const gallery = [
  { src: '/images/kotacom/press-roll.jpg', alt: 'Mesin cetak offset industri bertingkat dengan tangga logam', cap: 'Percetakan offset' },
  { src: '/images/kotacom/datacenter.jpg', alt: 'Diagram sirkuit bercahaya pada layar pemantauan', cap: 'Infrastruktur' },
  { src: '/images/kotacom/printshop.jpg', alt: 'Mesin cetak di dalam ruang produksi percetakan', cap: 'Workshop cetak' },
  { src: '/images/kotacom/tech-team.jpg', alt: 'Tim teknis bekerja dengan laptop di meja kayu', cap: 'Kolaborasi teknis' },
]

const quotes = [
  { q: 'Tim Kotacom paham kebutuhan operasional kami, bukan cuma tampilan. Sistemnya dipakai setiap hari tanpa drama.', n: 'Rina Wijaya', r: 'Owner, Butik Cantik' },
  { q: 'Server kami akhirnya rapi dan terdokumentasi. Gangguan turun drastis setelah serah terima.', n: 'Agus Santoso', r: 'Direktur, CV Maju Bersama' },
  { q: 'Prosesnya jelas dari awal. Estimasi sesuai, komunikasi enak, hasilnya bisa kami kelola sendiri.', n: 'Dewi Kartika', r: 'Manajer, Koperasi Sejahtera' },
]

const faqs = [
  { q: 'Berapa lama proses pengerjaan website?', a: 'Tergantung cakupan. Landing page sederhana biasanya 1–2 minggu, company profile 3–4 minggu, dan aplikasi custom 6–12 minggu termasuk pengujian.' },
  { q: 'Apakah saya bisa mengelola konten sendiri?', a: 'Bisa. Kami integrasikan CMS (Payload) sehingga tim Anda dapat mengubah halaman, artikel, dan gambar tanpa menyentuh kode.' },
  { q: 'Bagaimana skema pembayarannya?', a: 'Bertahap: 40% di awal sebagai komitmen, 40% saat proses rilis, dan 20% setelah serah terima serta pelatihan.' },
  { q: 'Apakah termasuk dukungan setelah rilis?', a: 'Ya. Ada masa garansi perbaikan bug 30 hari, dan tersedia paket dukungan bulanan untuk pemeliharaan serta monitoring.' },
  { q: 'Apakah bisa menangani infrastruktur & server?', a: 'Bisa. Kami mengelola VPS, jaringan kantor, VPN, backup, dan monitoring — all-in-one dengan pengembangan aplikasinya.' },
  { q: 'Apakah melayani klien di luar Surabaya?', a: 'Tentu. Basis kami di Surabaya, tetapi seluruh alur kerja bisa dilakukan remote via Google Meet, WhatsApp, dan repositori bersama.' },
]

const bars = [38, 52, 44, 68, 57, 79, 63, 88, 72, 94, 81, 97]

export default function KotacomHome() {
  return (
    <main className={classes.page}>
      {/* ── strip meta ────────────────────────────────────────── */}
      <div className={classes.ticker}>
        <div className={classes.tickerTrack}>
          {[0, 1].map((dup) => (
            <div className={classes.tickerRow} key={dup} aria-hidden={dup === 1}>
              {['EST. 2008 — SURABAYA, ID', 'WEBSITE', 'SOFTWARE', 'IT SUPPORT', 'PERCETAKAN', 'BRANDING', '150+ PROYEK', 'RESPON < 24 JAM'].map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── hero ──────────────────────────────────────────────── */}
      <section className={classes.hero}>
        <div className={classes.heroGrid} aria-hidden="true" />
        <div className={classes.heroGlow} aria-hidden="true" />
        <div className={classes.heroMarks} aria-hidden="true">
          <CrossMark />
          <CrossMark />
          <CrossMark />
        </div>

        <p className={classes.eyebrow}>
          <span className={classes.marker}>◆</span> Digital studio — Surabaya
        </p>
        <h1 className={classes.h1}>
          Bangun fondasi digital
          <br />
          yang rapi, stabil, dan siap tumbuh.
        </h1>
        <div className={classes.heroFoot}>
          <p className={classes.lead}>
            Kotacom membantu bisnis merancang, membangun, dan merawat sistem digital —
            dari website dan aplikasi custom hingga infrastruktur IT dan percetakan.
          </p>
          <div className={classes.heroRight}>
            <dl className={classes.heroMeta}>
              <div>
                <dt>Berdiri</dt>
                <dd>2008</dd>
              </div>
              <div>
                <dt>Proyek</dt>
                <dd>150+</dd>
              </div>
              <div>
                <dt>Basis</dt>
                <dd>Surabaya</dd>
              </div>
            </dl>
            <div className={classes.actions}>
            <a className={classes.btnPrimary} href={WA} target="_blank" rel="noopener noreferrer">
              Konsultasi gratis <Arrow />
            </a>
            <a className={classes.btnGhost} href="#layanan">
              Lihat layanan
            </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── console band ──────────────────────────────────────── */}
      <section className={classes.console} data-reveal>
        <div className={classes.consoleFrame}>
          <div className={classes.browserBar}>
            <span className={classes.browserDot} />
            <span className={classes.browserDot} />
            <span className={classes.browserDot} />
            <span className={classes.browserUrl}>
              <span className={classes.browserLock} aria-hidden="true">◆</span>
              payload.kotacom.id
            </span>
            <span className={classes.browserTag}>LIVE</span>
          </div>
          <div className={classes.consoleBody}>
            <Terminal />
            <aside className={classes.metrics}>
              <div className={classes.metric}>
                <span className={classes.metricK}>Uptime 90 hari</span>
                <span className={classes.metricV}>99,98%</span>
              </div>
              <div className={classes.metric}>
                <span className={classes.metricK}>Respons rata-rata</span>
                <span className={classes.metricV}>128 ms</span>
              </div>
              <div className={classes.spark} aria-hidden="true">
                {bars.map((h, i) => (
                  <span key={i} style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className={classes.metricRow}>
                <span className={classes.metricK}>Deploy bulan ini</span>
                <span className={classes.metricV}>42</span>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── stats ─────────────────────────────────────────────── */}
      <div className={classes.stats} data-reveal>
        {stats.map((s) => (
          <div className={classes.stat} key={s.k}>
            <span className={classes.statKey}>{s.k}</span>
            <span className={classes.statVal}>
              {typeof s.count === 'number' ? <CountUp to={s.count} /> : s.v}
              {s.suffix || ''}
            </span>
            <span className={classes.statSub}>{s.s}</span>
          </div>
        ))}
      </div>

      {/* ── logo cloud ────────────────────────────────────────── */}
      <section className={classes.cloud} data-reveal>
        <span className={classes.cloudLabel}>Dipercaya oleh</span>
        <div className={classes.cloudViewport}>
          <div className={classes.cloudTrack}>
            {[0, 1].map((dup) => (
              <div className={classes.cloudRow} key={dup} aria-hidden={dup === 1}>
                {clients.map((c) => (
                  <span key={c}>{c}</span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 01 layanan ────────────────────────────────────────── */}
      <section className={classes.section} id="layanan" data-reveal>
        <header className={classes.sectionHead}>
          <div className={classes.sectionMeta}>
            <span className={classes.num}>01</span>
            <span className={classes.label}>Layanan</span>
          </div>
          <div className={classes.sectionIntro}>
            <h2 className={classes.h2}>Empat pilar yang menopang operasional bisnis Anda.</h2>
            <p className={classes.sub}>
              Bukan daftar jasa yang terpisah — setiap pilar dirancang supaya saling menopang
              dan bisa bertambah sesuai pertumbuhan bisnis.
            </p>
          </div>
        </header>
        <div className={classes.svcGrid}>
          {services.map((s) => (
            <article className={classes.svc} key={s.n}>
              <div className={classes.svcTop}>
                <span className={classes.svcGlyph}>
                  <s.Glyph />
                </span>
                <span className={classes.svcNum}>{s.n}</span>
                <Arrow className={classes.arrow} />
              </div>
              <h3 className={classes.h3}>{s.title}</h3>
              <p className={classes.svcDesc}>{s.desc}</p>
              <ul className={classes.svcList}>
                {s.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* ── 02 cara kerja ─────────────────────────────────────── */}
      <section className={classes.section} data-reveal>
        <header className={classes.sectionHead}>
          <div className={classes.sectionMeta}>
            <span className={classes.num}>02</span>
            <span className={classes.label}>Cara kerja</span>
          </div>
          <div className={classes.sectionIntro}>
            <h2 className={classes.h2}>Tiga langkah, tanpa kejutan di tengah jalan.</h2>
          </div>
        </header>
        <ol className={classes.steps}>
          {steps.map((s) => (
            <li className={classes.step} key={s.n}>
              <span className={classes.stepNum}>{s.n}</span>
              <h3 className={classes.h3}>{s.t}</h3>
              <p className={classes.stepDesc}>{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── 03 teknologi ──────────────────────────────────────── */}
      <section className={classes.section} data-reveal>
        <header className={classes.sectionHead}>
          <div className={classes.sectionMeta}>
            <span className={classes.num}>03</span>
            <span className={classes.label}>Teknologi</span>
          </div>
          <div className={classes.sectionIntro}>
            <h2 className={classes.h2}>Perangkat yang kami kuasai.</h2>
            <p className={classes.sub}>
              Dipilih karena stabil dan banyak dipakai — supaya sistem Anda mudah dirawat
              oleh tim mana pun setelahnya.
            </p>
          </div>
        </header>
        <ul className={classes.techGrid}>
          {tech.map((t) => (
            <li className={classes.tech} key={t.name}>
              <span className={classes.techName}>
                <Image
                  className={`${classes.techIcon} ${t.wide ? classes.techIconWide : ''}`}
                  src={`/images/kotacom/icons/${t.icon}.svg`}
                  alt=""
                  width={16}
                  height={16}
                  aria-hidden="true"
                />
                {t.name}
              </span>
              <span className={classes.techRole}>{t.role}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── 04 portfolio ──────────────────────────────────────── */}
      <section className={classes.section} data-reveal>
        <header className={classes.sectionHead}>
          <div className={classes.sectionMeta}>
            <span className={classes.num}>04</span>
            <span className={classes.label}>Portfolio</span>
          </div>
          <div className={classes.sectionIntro}>
            <h2 className={classes.h2}>Sebagian pekerjaan terbaru.</h2>
          </div>
        </header>
        <div className={classes.projGrid}>
          {projects.map((p) => (
            <article className={classes.proj} key={p.t}>
              <div className={classes.projShot}>
                <Image src={p.img} alt={p.alt} fill sizes="(max-width: 768px) 100vw, 33vw" />
                <span className={classes.projTag}>{p.tag}</span>
              </div>
              <div className={classes.projBody}>
                <h3 className={classes.h3}>{p.t}</h3>
                <p className={classes.projDesc}>{p.d}</p>
                <ul className={classes.chips}>
                  {p.m.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── 05 galeri ─────────────────────────────────────────── */}
      <section className={classes.section} data-reveal>
        <header className={classes.sectionHead}>
          <div className={classes.sectionMeta}>
            <span className={classes.num}>05</span>
            <span className={classes.label}>Galeri</span>
          </div>
          <div className={classes.sectionIntro}>
            <h2 className={classes.h2}>Dari ruang server sampai ruang cetak.</h2>
            <p className={classes.sub}>
              Pekerjaan kami bergerak di antara dua dunia: perangkat lunak yang rapi
              dan produksi fisik yang presisi.
            </p>
          </div>
        </header>
        <div className={classes.mosaic}>
          {gallery.map((g) => (
            <figure className={classes.tile} key={g.src}>
              <Image src={g.src} alt={g.alt} fill sizes="(max-width: 768px) 100vw, 50vw" />
              <figcaption>{g.cap}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ── 06 testimoni ──────────────────────────────────────── */}
      <section className={classes.section} data-reveal>
        <header className={classes.sectionHead}>
          <div className={classes.sectionMeta}>
            <span className={classes.num}>06</span>
            <span className={classes.label}>Testimoni</span>
          </div>
          <div className={classes.sectionIntro}>
            <h2 className={classes.h2}>Kata mereka yang sudah bekerja dengan kami.</h2>
          </div>
        </header>
        <div className={classes.quoteGrid}>
          {quotes.map((q) => (
            <figure className={classes.quote} key={q.n}>
              <blockquote>{q.q}</blockquote>
              <figcaption>
                <span className={classes.qName}>{q.n}</span>
                <span className={classes.qRole}>{q.r}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ── 07 faq ────────────────────────────────────────────── */}
      <section className={classes.section} data-reveal>
        <header className={classes.sectionHead}>
          <div className={classes.sectionMeta}>
            <span className={classes.num}>07</span>
            <span className={classes.label}>FAQ</span>
          </div>
          <div className={classes.sectionIntro}>
            <h2 className={classes.h2}>Pertanyaan yang paling sering muncul.</h2>
          </div>
        </header>
        <div className={classes.faq}>
          {faqs.map((f) => (
            <details className={classes.faqItem} key={f.q}>
              <summary>
                <span>{f.q}</span>
                <Plus className={classes.plus} />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── 08 cta ────────────────────────────────────────────── */}
      <section className={classes.cta} data-reveal>
        <div className={classes.ctaGlow} aria-hidden="true" />
        <div className={classes.ctaMeta}>
          <span className={classes.num}>08</span>
          <span className={classes.label}>Mulai</span>
        </div>
        <div className={classes.ctaBody}>
          <h2 className={classes.h2}>Punya rencana? Mari kita rapikan bersama.</h2>
          <p className={classes.sub}>
            Ceritakan kebutuhan Anda — kami balas dengan penilaian jujur soal cakupan,
            biaya, dan waktu. Tanpa biaya konsultasi.
          </p>
          <div className={classes.actions}>
            <a className={classes.btnPrimary} href={WA} target="_blank" rel="noopener noreferrer">
              Chat via WhatsApp <Arrow />
            </a>
            <a className={classes.btnGhost} href="mailto:halo@kotacom.id">
              halo@kotacom.id
            </a>
          </div>
        </div>
        <aside className={classes.ctaCard}>
          <div className={classes.ctaCardRow}>
            <span className={classes.metricK}>Balasan pertama</span>
            <span className={classes.ctaCardV}>&lt; 24 jam</span>
          </div>
          <div className={classes.ctaCardRow}>
            <span className={classes.metricK}>Biaya konsultasi</span>
            <span className={classes.ctaCardV}>Gratis</span>
          </div>
          <div className={classes.ctaCardRow}>
            <span className={classes.metricK}>Ketersediaan</span>
            <span className={classes.ctaCardV}>2 slot · Q1</span>
          </div>
          <p className={classes.ctaCardNote}>
            Jam kerja Senin–Sabtu, 08.00–17.00 WIB. Di luar jam itu pesan Anda tetap
            masuk dan dibalas keesokan pagi.
          </p>
        </aside>
      </section>

      <Reveal />
    </main>
  )
}
