# DESIGN.md — Kontrak Desain Kotacom

> Acuan tetap untuk semua halaman, komponen, dan media UI ke depan.
> Sumber kebenaran: situs `payloadcms.com` + design system di repo ini
> (`src/css/*.scss`, `src/components/BackgroundGrid`). Repo ini **adalah**
> codebase design system tersebut — token di bawah sudah ada di dalamnya.
> **Konsisten = pakai ulang token & kelas ini, bukan menciptakan gaya baru.**

---

## 0. Filosofi

Desain ini bergaya **technical blueprint / gambar teknik**, bukan poster marketing.

- Grid **sengaja dibuat terlihat** (garis hairline vertikal).
- Sudut **siku** (radius 0), label **mono**, motion **cepat & datar**.
- Tujuannya terasa **presisi & transparan**, lalu **dihangatkan secukupnya**:
  aksen brand, radius selektif pada elemen interaktif, dan fotografi berwarna —
  karena bisnis ini setengah percetakan (warna, tinta, kertas).
- Semua keputusan visual di bawah mengalir dari satu prinsip ini:
  **struktur dulu, dekorasi belakangan.**

---

## 1. Grid (tulang punggung)

```scss
.grid {
  display: grid;
  grid-template-columns: repeat(16, 1fr); // 16 kolom desktop
  grid-row-gap: 0;
  grid-column-gap: 0;
}
// → 8 kolom di breakpoint mid/small/extra-small (mobile)

--gutter-h: calc(50vw - 40rem);            // konten max 80rem (1280px) center
--column:   calc((100vw - (var(--gutter-h) * 2)) / 16);
```

- **Desktop 16 kolom, mobile 8 kolom.** Gap **selalu 0** — jarak dibentuk oleh
  *border & posisi kolom*, bukan `gap`.
- Utility: `.cols-N` (span), `.start-N` (posisi awal), plus varian breakpoint:
  `cols-xl-* / cols-l-* / cols-m-* / cols-s-* / cols-xs-*` (sama untuk `start-*`).
- **Aturan:** setiap elemen WAJIB diletakkan "di kolom berapa". Pola umum:
  konten 8 kolom kiri (`start-1 cols-8`), visual 8 kolom kanan (`start-9 cols-8`).
- Gutter responsif: `8rem` (XL) → `4rem` (L) → `2rem` (mid) → `1rem` (small).

Referensi: `src/css/grid.scss`, `src/css/app.scss`, `src/components/Gutter`.

---

## 2. Garis hairline (identitas visual #1)

```scss
--grid-line-dark:  rgba(255, 255, 255, 0.125); // 12.5% alpha
--grid-line-light: rgba(0, 0, 0, 0.125);
--theme-border-color: var(--grid-line-light|dark);
--default-border-width: 2px;                    // aturan tebal / pemisah kuat
```

- **Semua border = 1px alpha 12,5%** — nyaris tak terlihat, tapi menenun halaman.
- `BackgroundGrid` menaruh **kolom vertikal 1px** (`width:1px`,
  `background: var(--theme-border-color)`) di posisi grid 1 / 5 / 9 / 13 / 17,
  `position:absolute; pointer-events:none; z-index:-1`.
- `BackgroundScanline` menambah tekstur scanline halus (`/images/scanline-*.png`).
- **Tidak ada box-shadow / glow / glassmorphism** di sistem dasar. Shadow hanya di
  overlay gelap (mis. DocSearch, testimoni: `rgba(0,0,0,.5)`).

Referensi: `src/components/BackgroundGrid/index.module.scss`.

---

## 3. Radius — struktural 0, interaktif dilembutkan

| Elemen | Nilai |
|--------|-------|
| Panel, section, grid, kartu struktural | **0px** — siku, ortogonal |
| **Tombol, chip/tag, input** | **4px** (`--kc-radius-sm`) |
| **Mockup, kartu konten mengambang** | **8–12px** (`--kc-radius` / `--kc-radius-lg`) |
| Pil (avatar, URL bar, badge bulat) | `999px` / `50%` |

**Panel & gambar struktural tetap `border-radius: 0`.** Yang dilembutkan hanya
permukaan **interaktif** (tombol, chip, mockup) supaya tidak terasa kaku — siku
besar tetap jadi identitas. Shadows (`--kc-shadow`) hanya pada permukaan lesung.

Referensi: `src/css/brand.scss` (`--kc-radius-*`).

---

## 4. Warna — monokrom + palet semantik

```scss
--color-base-0   : rgb(255,255,255);  // putih
--color-base-1000: rgb(0,0,0);        // ← base gelap = #000 (AMOLED)
// 21 langkah: base-0, 50, 100 … 950, 1000 (tiap ±13 unit)
--color-{success,error,warning}-50…950
--color-{blue,purple,orange,red}-*  + pasangan -text/-bg/-border light|dark
```

- **Aksen brand = `--kc-accent` (`#0070F3`), dipakai hemat & terarah.** Tombol
  primer, link hover, chip/tag, glyph, penanda. Bukan sebagai *wash*/latar besar.
  Tombol sekunder tetap mono (transparan + border).
- **Warna = pembawa makna dua pilar:** `--kc-accent` (biru) → **IT/digital**,
  `--kc-warm` (amber) → **percetakan**. Palet semantik (`--color-*`) tetap untuk
  status/callout, bukan dekorasi.
- Tema light = **kertas hangat** (`--kc-paper`), bukan putih klinis.
- Referensi: `src/css/brand.scss`.
- Tema light/dark lewat `[data-theme]` → `--theme-elevation-0…1000` memetakan ke
  `--color-base-*`. Base = **`#000`**.
- Utilitas teks redup: `--text-dark / --text-light = rgba(0|255, …, 0.5)`.

Referensi: `src/css/colors.scss`, `src/css/theme.scss`.

---

## 5. Tipografi

```scss
--font-body: "untitledSans";      // body
--font-geist-mono: "GeistMono";   // kode, label, eyebrow (mono)
--font-body-size: 18px;           // 16px di layar besar
```

- **Heading weight = 500** (bukan 700). Line-height **1** pada display heading.
- **Letter-spacing heading SANGAT rapat:** H1 `-0.05em`. Live:
  H1 64px → `-3.2px`; H2 48px → `-2.4px`; H3/H4 24px → `-1.2px`.
- Body 16px / line-height 22.4px (≈1.4).
- Skala display (`jumbo`): `132px → 96 → 84 → 70` turun per breakpoint.
- **Mono untuk metadata** (label, nomor, tag, eyebrow) → nada "terminal/engineering".

Referensi: `src/css/type.scss`.

---

## 6. Spacing, motion, lapisan

```scss
--block-spacing: 7rem;         // jarak antar blok (112px); 5/3.5/2rem per breakpoint
--new-block-spacing: 8rem;     // 128px
--trans-default: 150ms;        // motion cepat, tidak bouncy
--header-height: 76px;         // 66px di mobile
--page-padding-top: calc(var(--header-height) + var(--top-bar-height));
--page-top-clearance: calc(var(--page-padding-top) + 1.75rem); // clearance header fixed
```

- Z-index: `popup 10 · status 30 · nav 40 · modal 50`.
- Section **full-bleed** mengikuti gutter; konten di dalam grid. Tak ada
  "kotak container" melayang.
- **Header `position: fixed; top:0`** — setiap halaman WAJIB reserve
  `--page-top-clearance` agar konten tidak mepet/nabrak header.

Referensi: `src/css/app.scss`.

---

## 7. Kontrak kerja (DO / DON'T)

**Selalu (DO):**
1. Mulai dari **grid 16 (desktop) / 8 (mobile)** — tentukan `cols-N start-N` dulu.
2. Border **1px `rgba(0,0,0|255,255,255,0.125)`**; `2px` untuk aturan tebal.
   **Radius 0** untuk panel/grid/section; **4px** pada tombol/chip/input; **8–12px**
   pada mockup & kartu mengambang (lihat §3).
3. Heading **untitledSans 500**, tracking `≈ -0.05em`, `line-height: 1`.
4. Label/metadata **GeistMono** (uppercase untuk eyebrow/tag).
5. Warna **hanya dari token** `--color-base-*` / semantik. Base = `#000`.
6. Jarak antar blok **7–8rem**; motion **150ms**.
7. **Full-bleed section + gutter**, bukan container kotak.
8. Reserve **`--page-top-clearance`** di bawah header fixed.

**Jangan (DON'T):**
- ❌ Box-shadow / glow / glassmorphism / gradient dekoratif pada sistem dasar.
- ❌ Radius besar pada panel/kartu.
- ❌ Heading bold 700 atau letter-spacing normal.
- ❌ Warna brand sebagai *wash*/latar besar (aksen `--kc-accent` hanya terarah).
- ❌ `gap` pada grid (biarkan 0; jarak dari border/kolom).

> **Pengecualian:** aksen grafis yang *tetap ortogonal & Geist-compatible*
> (grid overlay, marquee hairline, count-up, foto berwarna) diperbolehkan —
> selama tidak melanggar poin 1–8. **Foto tampil berwarna secara default**
> (grayscale hanya sebagai efek hover) karena warna adalah produk percetakan.

---

## 8. Peta file kunci

| Area | File |
|------|------|
| Grid | `src/css/grid.scss` |
| Gutter & token global | `src/css/app.scss` |
| Warna | `src/css/colors.scss` |
| Tema / elevation | `src/css/theme.scss` |
| Tipografi | `src/css/type.scss` |
| Breakpoint | `src/css/queries.scss` |
| Overlay garis | `src/components/BackgroundGrid/` |
| Wrapper konten | `src/components/Gutter/` |

---

## 9. Contoh penerapan

**Satu section teks + visual (16 kolom):**

```tsx
<section>
  <BackgroundGrid />
  <Gutter>
    <div className="grid">
      <div className="cols-8 start-1">
        <h2>Judul section</h2>       {/* untitledSans 500, tracking -0.05em, lh 1 */}
        <p>Paragraf isi…</p>          {/* untitledSans 16px/1.4 */}
      </div>
      <div className="cols-8 start-9">
        <img src="/api/media/file/foto.webp" alt="" /> {/* radius 0 */}
      </div>
    </div>
  </Gutter>
</section>
```

**Grid kartu 3 kolom (desktop) → 1 kolom (mobile):**

```tsx
<div className="grid">
  {items.map((it) => (
    <div key={it.slug} className="cols-5 cols-m-8">{/* kartu radius 0, border 1px */}</div>
  ))}
</div>
```

---

*Perubahan pada dokumen ini = perubahan kontrak. Update bersama kode, bukan diam-diam.*
