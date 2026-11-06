import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import { lexicalFromText } from '../src/generator/lexical'

const rt = (text: string) => lexicalFromText(text)

type PostSeed = {
	title: string
	slug: string
	categorySlug: string
	excerpt: string
	markdown: string
}

const categoriesData = [
	{
		name: 'Panduan Ebook',
		slug: 'panduan-ebook',
		headline: 'Cara Menulis, Menerbitkan & Menjual Ebook',
		description:
			'Panduan praktis dari ide sampai ebook siap jual: struktur, cover, format, distribusi, dan strategi pemasaran digital.',
	},
	{
		name: 'Buku Cetak',
		slug: 'buku-cetak',
		headline: 'Produksi & Cetak Buku Berkualitas',
		description:
			'Panduan teknis cetak buku: pilihan kertas, binding, ISBN, proofing, dan estimasi biaya cetak satuan maupun massal.',
	},
	{
		name: 'Menulis & Editing',
		slug: 'menulis-editing',
		headline: 'Kerajinan Menulis dan Penyuntingan Naskah',
		description:
			'Teknik menulis yang menjual, menyunting naskah, memilih diksi, dan menyiapkan naskah siap terbit.',
	},
]

const postsData: PostSeed[] = [
	{
		title: 'Panduan Lengkap Menulis Ebook Pertama Anda Sampai Siap Jual',
		slug: 'panduan-menulis-ebook-pertama',
		categorySlug: 'panduan-ebook',
		excerpt:
			'Langkah demi langkah menulis ebook pertama: menentukan ide, menyusun kerangka, menetapkan target harian, sampai naskah siap diformat untuk dijual.',
		markdown: `## Mulai dari Masalah, Bukan dari Ide

Ebook yang laku bukan yang paling panjang, tapi yang paling tepat menyelesaikan masalah pembacanya. Sebelum menulis satu paragraf pun, jawab tiga pertanyaan ini: siapa pembacanya, masalah apa yang mereka alami, dan hasil konkret apa yang mereka dapat setelah membaca?

## Bangun Kerangka 10 Bab

Kerangka yang rapi membuat proses menulis jauh lebih tenang. Gunakan pola yang mudah diprediksi pembaca:

1. Masalah yang dihadapi pembaca
2. Kesalahan umum yang memperparah
3. Kerangka solusi langkah demi langkah
4. Studi kasus singkat
5. Templat siap pakai
6. Penutup dan langkah selanjutnya

## Target Harian yang Realistis

Buku setebal 100 halaman ebook kira-kira sama dengan 25.000–30.000 kata. Dengan target 500 kata per hari, naskah selesai dalam dua bulan tanpa lembur. Kunci konsistensi: tulis setiap hari di jam yang sama, dan jangan menyunting saat menulis.

## Selesaikan Dulu, Rapikan Belakangan

Banyak naskah mangkrak karena penulis menyunting terlalu dini. Tulis berantakan sampai tuntas, baru masuk tahap penyuntingan. Naskah kasar yang selesai selalu mengalahkan draf sempurna yang tidak pernah rampung.`,
	},
	{
		title: 'Cara Menentukan Harga Jual Ebook Tanpa Merugi',
		slug: 'cara-menentukan-harga-jual-ebook',
		categorySlug: 'panduan-ebook',
		excerpt:
			'Menghitung biaya produksi, memilih positioning harga, dan menyusun strategi bundling agar ebook tetap menguntungkan tanpa terkesan mahal.',
		markdown: `## Hitung Dulu Biaya Sebenarnya

Harga tidak boleh ditentukan perasaan. Hitung biaya penyuntingan, desain cover, konversi format, dan waktu Anda sendiri. Angka ini menjadi dasar harga minimum yang aman.

## Tentukan Positioning, Bukan Sekadar Angka

Ebook panduan praktis biasanya punya tiga zona harga: pemula, profesional, dan premium. Pembaca tidak menilai harga dari jumlah halaman, tetapi dari besarnya masalah yang diselesaikan.

## Bundling Meningkatkan Nilai Rata-Rata

Pasangkan ebook dengan templat, kelas singkat, atau sesi konsultasi. Bundling menaikkan nilai transaksi tanpa harus menaikkan harga ebook satuan.

## Jangan Terjebak Perang Harga

Menurunkan harga terus-menerus akan menarik pembaca yang paling tidak loyal. Lebih baik memperkuat janji hasil di judul dan halaman penjualan, lalu pertahankan harga.`,
	},
	{
		title: 'Cetak Buku Satuan vs Massal: Memilih yang Tepat untuk Naskah Anda',
		slug: 'cetak-buku-satuan-vs-massal',
		categorySlug: 'buku-cetak',
		excerpt:
			'Perbandingan lengkap cetak buku satuan (POD) dan cetak massal dari sisi biaya, waktu, kualitas, dan risiko stok menumpuk.',
		markdown: `## Cetak Satuan (Print on Demand)

Cetak satuan cocok untuk penulis pemula, buku kado, atau uji pasar. Tidak ada risiko stok, dan jumlah cetak bisa menyesuaikan permintaan. Konsekuensinya, harga per buku jauh lebih tinggi.

## Cetak Massal

Cetak massal menekan biaya per unit secara drastis, tetapi menuntut modal awal besar dan ruang penyimpanan. Cara paling aman: mulai dari jumlah kecil untuk validasi, lalu naikkan saat permintaan terbukti.

## Faktor Kualitas yang Wajib Dicek

Sebelum produksi besar, selalu minta proof cetak. Periksa ketajaman teks, konsistensi warna cover, dan kekuatan binding. Satu kesalahan kecil yang diperbanyak seribu kali jauh lebih mahal daripada biaya proof.

## Kapan Memilih Masing-Masing

Pilih satuan saat naskah masih diuji pasar. Pindah ke massal ketika penjualan sudah stabil dan Anda yakin dengan estimasi permintaan.`,
	},
	{
		title: 'Memilih Kertas dan Binding untuk Buku yang Nyaman Dibaca',
		slug: 'memilih-kertas-dan-binding-buku',
		categorySlug: 'buku-cetak',
		excerpt:
			'Panduan praktis memilih jenis kertas, ukuran buku, dan teknik binding agar buku nyaman di tangan dan tidak mudah rusak.',
		markdown: `## Kenyamanan Membaca Dimulai dari Kertas

Kertas book paper lebih ringan dan tidak silau, cocok untuk buku bacaan. Kertas HVS lebih putih dan tajam, cocok untuk buku kerja atau buku yang banyak berisi gambar.

## Ukuran Buku Mempengaruhi Biaya

Ukuran umum seperti A5 dan B5 paling efisien karena mengikuti standar ukuran kertas induk, sehingga sisa potongan minimal. Ukuran tidak lazim akan menaikkan biaya karena lebih banyak kertas terbuang.

## Binding Sesuai Kegunaan

Untuk buku tipis, binding staples cukup. Untuk buku tebal yang sering dibuka-tutup, jilid lem atau binding jahit lem lebih awet. Buku premium bisa memakai hardcover.

## Uji Coba Sebelum Produksi

Cetak satu eksemplar dulu. Rasakan beratnya, buka beberapa halaman, dan periksa apakah buku tetap terbuka nyaman.}`,
	},
	{
		title: 'Teknik Menulis Judul Ebook yang Membuat Orang Klik',
		slug: 'teknik-menulis-judul-ebook',
		categorySlug: 'menulis-editing',
		excerpt:
			'Rumus menulis judul dan subjudul yang jelas, spesifik, dan menjanjikan hasil, tanpa terjebak clickbait yang merusak kepercayaan.',
		markdown: `## Judul Menjawab Hasil, Bukan Fitur

Pembaca tidak mencari "panduan 120 halaman". Mereka mencari hasil: memperbaiki, meningkatkan, atau menyelesaikan sesuatu. Tulis judul dari sisi manfaat.

## Rumus Tiga Bagian

Gabungkan tiga unsur: target pembaca, hasil yang dijanjikan, dan cara atau kerangka yang ditawarkan. Contohnya: "Panduan Menulis Ebook Pertama Anda Sampai Siap Jual".

## Hindari Clickbait

Judul yang menjanjikan hal mustahil memang menaikkan klik, tetapi menghancurkan kepercayaan dan memicu komplain. Janjikan hasil nyata yang memang kamu berikan di dalam.

## Uji Beberapa Versi

Buat tiga sampai lima varian judul, lalu tanyakan ke calon pembaca mana yang paling jelas. Judul terbaik biasanya yang paling mudah dipahami dalam sekali baca.}`,
	},
	{
		title: 'Menyunting Naskah Sendiri: Checklist Sebelum Kirim ke Editor',
		slug: 'menyunting-naskah-checklist-sebelum-terbit',
		categorySlug: 'menulis-editing',
		excerpt:
			'Daftar periksa penyuntingan mandiri untuk membuang typo, menguatkan kalimat, dan merapikan struktur sebelum naskah diserahkan ke editor.',
		markdown: `## Bacakan dengan Suara

Membaca naskah dengan suara adalah cara tercepat menemukan kalimat janggal dan kata berulang. Telinga menangkap kesalahan yang sering dilewatkan mata.

## Periksa Satu Hal Per Satu

Jangan menyunting struktur, ejaan, dan gaya bahasa sekaligus. Lakukan satu putaran khusus untuk struktur, putaran kedua untuk ejaan, dan putaran ketiga untuk ketajaman kalimat.

## Potong Kata yang Tidak Menambah Makna

Kata seperti "sangat", "benar-benar", dan "sebenarnya" sering hanya menambah panjang. Buang kalau tidak mengubah makna.

## Konsisten dengan Istilah

Pilih satu istilah untuk satu hal, lalu pakai konsisten sampai akhir. Pembaca merasa lebih nyaman saat istilah tidak berubah-ubah.`,
	},
]

const pagesData = [
	{
		title: 'Ebookku — Panduan Menulis & Menerbitkan Ebook',
		slug: 'home',
		description:
			'Ebookku membantu penulis pemula mengubah ide menjadi ebook dan buku cetak yang siap dijual: panduan menulis, penyuntingan, desain cover, ISBN, dan cetak.',
		richText:
			'## Dari Ide sampai Ebook Siap Jual\nPanduan praktis menulis, menyunting, mencetak, dan menjual ebook serta buku — tanpa jargon, langsung bisa diikuti.',
	},
	{
		title: 'Tentang Ebookku',
		slug: 'tentang',
		description:
			'Ebookku adalah tempat penulis dan pembaca bertemu: panduan menulis, menerbitkan, dan menjual ebook serta buku cetak.',
		richText:
			'## Rumah untuk Penulis dan Pembaca\nEbookku membantu penulis pemula mengubah ide menjadi ebook dan buku cetak yang siap dijual, lengkap dengan panduan teknis cetak, penyuntingan, dan strategi pemasaran.',
	},
	{
		title: 'Kontak',
		slug: 'kontak',
		description:
			'Hubungi tim Ebookku untuk konsultasi penulisan, penyuntingan, desain cover, hingga cetak buku.',
		richText:
			'## Mari Bicarakan Naskah Anda\nPunya draf naskah, butuh editor, atau ingin mencetak buku? Tim kami siap membantu dari penyuntingan sampai produksi cetak.',
	},
	{
		title: 'Layanan Penerbitan',
		slug: 'layanan',
		description:
			'Layanan lengkap dari naskah mentah sampai buku terbit: penyuntingan, desain cover, tata letak, ISBN, dan cetak.',
		richText:
			'## Dari Naskah Mentah Sampai Siap Jual\nKami menangani penyuntingan, desain cover, tata letak isi, pengurusan ISBN, konversi ebook, dan cetak buku satuan maupun massal.',
	},
]

async function main() {
	console.log('--- Seeding Ebookku content ---')
	const payload = await getPayload({ config: configPromise })

	// 1. Categories
	const categoryMap = new Map<string, string>()
	for (const cat of categoriesData) {
		const existing = await payload.find({
			collection: 'categories',
			where: { slug: { equals: cat.slug } },
			limit: 1,
		})
		if (existing.docs.length > 0) {
			console.log(`[Category] exists: ${cat.name}`)
			categoryMap.set(cat.slug, String(existing.docs[0].id))
		} else {
			const created = await payload.create({ collection: 'categories', data: cat })
			console.log(`[Category] created: ${cat.name}`)
			categoryMap.set(cat.slug, String(created.id))
		}
	}

	// 2. Pages
	for (const page of pagesData) {
		const existing = await payload.find({
			collection: 'pages',
			where: { slug: { equals: page.slug } },
			limit: 1,
		})
		if (existing.docs.length > 0) {
			console.log(`[Page] exists: ${page.slug}`)
			continue
		}
		await payload.create({
			collection: 'pages',
			data: {
				title: page.title,
				slug: page.slug,
				description: page.description,
				hero: { type: 'default', richText: rt(page.richText) },
				layout: [
					{
						blockType: 'cta',
						ctaFields: {
							style: 'buttons',
							richText: rt(page.richText),
							links: [
								{ link: { type: 'custom', url: '/kontak', label: 'Hubungi Kami' } },
							],
						},
					},
				],
			} as never,
		})
		console.log(`[Page] created: ${page.slug}`)
	}

	// 3. Posts
	for (const post of postsData) {
		const existing = await payload.find({
			collection: 'posts',
			where: { slug: { equals: post.slug } },
			limit: 1,
		})
		if (existing.docs.length > 0) {
			console.log(`[Post] exists: ${post.slug}`)
			continue
		}
		await payload.create({
			collection: 'posts',
			data: {
				title: post.title,
				slug: post.slug,
				category: categoryMap.get(post.categorySlug),
				featuredMedia: 'videoUrl',
				videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
				dynamicThumbnail: true,
				authorType: 'guest',
				guestAuthor: 'Tim Ebookku',
				publishedOn: new Date().toISOString(),
				excerpt: rt(post.excerpt),
				content: [
					{
						blockType: 'blogMarkdown',
						blogMarkdownFields: { markdown: post.markdown },
					},
				],
			} as never,
		})
		console.log(`[Post] created: ${post.slug}`)
	}

	console.log('--- Done ---')
	process.exit(0)
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})
