import * as React from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { Accordion } from './Accordion'
import { Card, NumBadge } from './Card'
import { LinkButton } from './Button'
import { Pill } from './Pill'
import { Section, SectionTag } from './Section'
import { Shape } from './Shape'

/* ----------------------------------------------------------------- content */

const navWa = 'https://wa.me/6285799520350'

const metrics = [
  { label: 'Berdiri sejak', value: '2008', note: '17 tahun mendampingi bisnis' },
  { label: 'Proyek terkirim', value: '150+', note: 'Website, aplikasi & cetak' },
  { label: 'Kota terjangkau', value: '394', note: 'Layanan remote seluruh Indonesia' },
  { label: 'Respons teknis', value: '<24 jam', note: 'Dukungan aktif hari kerja' },
]

const services = [
  {
    n: '01',
    shape: 'circle' as const,
    tone: 'yellow' as const,
    title: 'Website Profesional',
    body: 'Company profile, landing page, e-commerce, dan portal yang cepat, rapi, dan mudah dikelola.',
    pills: ['Next.js', 'SEO Teknis', 'CMS', 'Core Web Vitals'],
  },
  {
    n: '02',
    shape: 'square' as const,
    tone: 'blue' as const,
    title: 'Software Development',
    body: 'Aplikasi custom untuk operasional bisnis — dari POS, inventory, sampai sistem internal.',
    pills: ['Web App', 'Flutter', 'API', 'Otomasi'],
  },
  {
    n: '03',
    shape: 'triangle' as const,
    tone: 'red' as const,
    title: 'IT Support & Infrastruktur',
    body: 'Kelola server, jaringan, dan perangkat kantor supaya operasional tidak pernah berhenti.',
    pills: ['Server', 'VPN', 'Monitoring', 'Backup'],
  },
  {
    n: '04',
    shape: 'diamond' as const,
    tone: 'yellow' as const,
    title: 'Percetakan & Branding',
    body: 'Cetak buku, kemasan, dan materi promosi dengan kontrol kualitas end-to-end.',
    pills: ['Offset', 'Buku', 'Kemasan', 'Desain'],
  },
]

const steps = [
  {
    n: '01',
    title: 'Pahami kebutuhan',
    body: 'Kami petakan tujuan bisnis, alur kerja, dan kendala teknis sebelum menyentuh baris kode pertama.',
  },
  {
    n: '02',
    title: 'Susun solusi realistis',
    body: 'Rencana kerja, arsitektur, dan estimasi yang jujur — tanpa fitur berlebihan yang tidak terpakai.',
  },
  {
    n: '03',
    title: 'Eksekusi & dampingi',
    body: 'Bangun, uji, rilis, lalu dampingi operasional harian beserta dokumentasi dan pelatihan.',
  },
]

const projects = [
  {
    cat: 'Retail',
    tone: 'blue' as const,
    title: 'POS System — Butik Cantik',
    body: 'Kasir, stok multi-outlet, dan laporan penjualan real-time untuk jaringan butik di Jawa Timur.',
  },
  {
    cat: 'Infrastruktur',
    tone: 'red' as const,
    title: 'IT Upgrade — CV Maju Bersama',
    body: 'Migrasi server lama ke VPS terkelola, VPN kantor, dan backup otomatis harian.',
  },
  {
    cat: 'Koperasi',
    tone: 'yellow' as const,
    title: 'Koperasi Digital',
    body: 'Simpan pinjam, anggota, dan pembukuan otomatis dengan alur persetujuan berjenjang.',
  },
]

const faqs = [
  {
    q: 'Berapa lama proses pengerjaan website?',
    a: 'Tergantung cakupan. Landing page sederhana biasanya 1–2 minggu, company profile 3–4 minggu, dan aplikasi custom 6–12 minggu termasuk pengujian.',
  },
  {
    q: 'Apakah saya bisa mengelola konten sendiri?',
    a: 'Bisa. Kami serahkan panel admin beserta pelatihan singkat, jadi tim Anda dapat mengubah konten tanpa menyentuh kode.',
  },
  {
    q: 'Bagaimana skema pembayarannya?',
    a: 'Pembayaran bertahap mengikuti tahapan proyek — DP, termin saat progres, dan pelunasan saat serah terima.',
  },
]

/* --------------------------------------------------------------------- UI */

function Hero() {
  return (
    <Section bg="canvas" bleed className="overflow-hidden">
      <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
        {/* left */}
        <div className="px-4 py-12 sm:px-6 lg:py-20 lg:pr-12">
          <span className="inline-flex items-center gap-2 border-2 border-ink bg-paper px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest shadow-nb-sm">
            <span className="h-2 w-2 rounded-full bg-nb-red" />
            Digital Studio — Surabaya
          </span>
          <h1 className="mt-6 text-4xl uppercase leading-[0.9] tracking-tighter sm:text-6xl lg:text-7xl">
            Bangun fondasi digital yang{' '}
            <span className="border-2 border-ink bg-nb-yellow px-2">rapi</span>, stabil, dan siap
            tumbuh.
          </h1>
          <p className="mt-6 max-w-xl text-lg font-medium leading-relaxed">
            Kotacom membantu bisnis merancang, membangun, dan merawat sistem digital — dari website
            dan aplikasi custom hingga infrastruktur IT dan percetakan.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <LinkButton href={navWa} variant="primary" size="md">
              Konsultasi Gratis <ArrowRight className="h-4 w-4" />
            </LinkButton>
            <LinkButton href="#layanan" variant="outline" size="md">
              Lihat Layanan
            </LinkButton>
          </div>
          <p className="mt-10 border-t-4 border-ink pt-6 font-mono text-xs font-bold uppercase tracking-widest">
            Basis di Surabaya · Est. 2008
          </p>
        </div>

        {/* right: geometric blue panel */}
        <div className="relative min-h-[320px] border-t-4 border-ink bg-nb-blue lg:border-l-4 lg:border-t-0">
          <span className="absolute inset-0 opacity-20 dots-white" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative h-64 w-64 lg:h-80 lg:w-80">
              <Shape kind="circle" tone="yellow" className="absolute left-4 top-0 h-40 w-40 lg:h-52 lg:w-52" />
              <Shape kind="diamond" tone="red" className="absolute bottom-2 right-2 h-32 w-32 lg:h-40 lg:w-40" />
              <Shape kind="triangle" tone="white" className="absolute bottom-10 left-16 h-24 w-24" />
              <span className="absolute right-10 top-12 block h-14 w-14 rounded-full border-4 border-white bg-ink" />
            </div>
          </div>
          <div className="absolute right-5 top-5 max-w-[220px] border-4 border-ink bg-paper p-4 shadow-nb-lg lg:right-8 lg:top-8">
            <p className="font-mono text-[11px] font-bold uppercase tracking-widest">
              Respons teknis
            </p>
            <p className="mt-1 text-3xl font-black leading-none">&lt; 24 jam</p>
            <p className="mt-1 text-xs font-medium">Dukungan aktif hari kerja</p>
          </div>
        </div>
      </div>
    </Section>
  )
}

function MetricsBar() {
  return (
    <Section bg="yellow" compact bleed>
      <dl className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className={[
              'border-ink px-5 py-6 sm:px-8',
              i % 2 === 1 ? 'border-l-4' : '',
              i >= 2 ? 'border-t-4 lg:border-t-0' : '',
              i === 2 ? 'clear-left' : '',
              i === 2 || i === 3 ? 'lg:border-l-4' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <dt className="font-mono text-xs font-bold uppercase tracking-widest">{m.label}</dt>
            <dd className="mt-2 text-4xl font-black leading-none tracking-tighter">{m.value}</dd>
            <dd className="mt-2 text-sm font-medium">{m.note}</dd>
          </div>
        ))}
      </dl>
    </Section>
  )
}

function Services() {
  return (
    <Section bg="canvas" id="layanan">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <SectionTag index="01" label="Layanan" />
          <h2 className="mt-4 max-w-2xl text-3xl uppercase leading-[1.05] tracking-tighter sm:text-4xl lg:text-5xl">
            Empat pilar yang menopang operasional bisnis Anda.
          </h2>
        </div>
        <Shape kind="circle" tone="blue" className="hidden h-20 w-20 lg:block" />
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        {services.map((s) => (
          <Card key={s.n} className="p-7">
            <div className="flex items-start justify-between">
              <NumBadge n={s.n} shape={s.shape} tone={s.tone} />
            </div>
            <h3 className="mt-5 text-2xl uppercase tracking-tight">{s.title}</h3>
            <p className="mt-2 font-medium leading-relaxed">{s.body}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {s.pills.map((p) => (
                <Pill key={p} tone="white">
                  {p}
                </Pill>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </Section>
  )
}

function Steps() {
  return (
    <Section bg="paper" id="cara-kerja">
      <SectionTag index="02" label="Cara Kerja" />
      <h2 className="mt-4 max-w-2xl text-3xl uppercase leading-[1.05] tracking-tighter sm:text-4xl lg:text-5xl">
        Tiga langkah, tanpa kejutan di tengah jalan.
      </h2>
      <div className="mt-10 grid gap-8 md:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n}>
            <NumBadge n={s.n} />
            <h3 className="mt-5 text-xl uppercase tracking-tight">{s.title}</h3>
            <p className="mt-2 font-medium leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}

function Portfolio() {
  return (
    <Section bg="canvas" id="portofolio">
      <SectionTag index="03" label="Portofolio" />
      <h2 className="mt-4 max-w-2xl text-3xl uppercase leading-[1.05] tracking-tighter sm:text-4xl lg:text-5xl">
        Sebagian pekerjaan terbaru.
      </h2>
      <div className="mt-10 grid gap-8 md:grid-cols-3">
        {projects.map((p) => (
          <Card key={p.title}>
            <div className="flex h-36 items-center justify-center border-b-4 border-ink bg-canvas">
              <Shape
                kind={p.tone === 'yellow' ? 'triangle' : p.tone === 'red' ? 'diamond' : 'circle'}
                tone={p.tone}
                className="h-16 w-16"
              />
            </div>
            <div className="p-6">
              <Pill tone={p.tone === 'yellow' ? 'yellow' : p.tone}>{p.cat}</Pill>
              <h3 className="mt-4 text-lg uppercase tracking-tight">{p.title}</h3>
              <p className="mt-2 text-sm font-medium leading-relaxed">{p.body}</p>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  )
}

function Faq() {
  return (
    <Section bg="paper" id="faq">
      <SectionTag index="04" label="FAQ" />
      <h2 className="mt-4 max-w-2xl text-3xl uppercase leading-[1.05] tracking-tighter sm:text-4xl lg:text-5xl">
        Pertanyaan yang paling sering muncul.
      </h2>
      <div className="mt-10 max-w-3xl">
        <Accordion items={faqs} />
      </div>
    </Section>
  )
}

function CtaBand() {
  const points = ['Estimasi jujur, tanpa fitur berlebihan', 'Dokumentasi & serah terima rapi', 'Dukungan aktif setelah rilis']
  return (
    <Section bg="yellow" noRule className="overflow-hidden">
      <span className="absolute -right-12 -top-12 h-48 w-48 rounded-full border-4 border-ink bg-nb-red opacity-70" />
      <span className="absolute -bottom-14 -left-10 h-40 w-40 rotate-45 border-4 border-ink bg-nb-blue opacity-70" />
      <div className="relative grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl uppercase leading-[0.95] tracking-tighter sm:text-5xl">
            Siap optimalkan layanan digital untuk bisnis?
          </h2>
          <p className="mt-5 max-w-lg text-lg font-medium leading-relaxed">
            Konsultasi gratis via WhatsApp. Kami dengar kebutuhan Anda, lalu usulkan langkah paling
            masuk akal.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <LinkButton href={navWa} variant="ink" size="lg">
              Chat WhatsApp <ArrowRight className="h-4 w-4" />
            </LinkButton>
            <LinkButton href="#layanan" variant="outline" size="lg">
              Lihat Layanan
            </LinkButton>
          </div>
        </div>
        <ul className="flex flex-col justify-center gap-4">
          {points.map((p) => (
            <li
              key={p}
              className="flex items-center gap-4 border-4 border-ink bg-paper p-4 shadow-nb"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-nb-yellow">
                <Check className="h-5 w-5" strokeWidth={3} />
              </span>
              <span className="font-bold uppercase">{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}

/* ----------------------------------------------------------------- export */

export function KotacomBauhausHome() {
  return (
    <>
      <Hero />
      <MetricsBar />
      <Services />
      <Steps />
      <Portfolio />
      <Faq />
      <CtaBand />
    </>
  )
}
