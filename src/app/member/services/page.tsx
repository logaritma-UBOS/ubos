'use client';

import { FormEvent, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  LayoutGrid,
  Megaphone,
  Printer,
  ShoppingBag,
  Sparkles,
  Tool,
  MessageCircle,
  ShieldCheck,
  Send,
} from 'lucide-react';

const ADMIN_WHATSAPP = '6285179660408';
const META_ADS_PACKAGES = [
  {
    name: 'Paket 7 Hari',
    price: 'Rp 150.000',
    description: 'Optimasi iklan awal untuk awareness dan traffic cepat.',
    duration: '7 hari',
    badge: 'Starter',
  },
  {
    name: 'Paket 14 Hari',
    price: 'Rp 250.000',
    description: 'Kampanye terukur untuk promosi menu dan event singkat.',
    duration: '14 hari',
    badge: 'Popular',
  },
  {
    name: 'Paket 30 Hari',
    price: 'Rp 450.000',
    description: 'Full campaign bulanan dengan monitoring dan rekomendasi.',
    duration: '30 hari',
    badge: 'Best Value',
  },
];

const HARDWARE_PRODUCTS = [
  {
    name: 'Printer Thermal Bluetooth',
    price: 'Rp 420.000',
    link: 'https://shopee.co.id',
    caption: 'Cocok untuk kasir mobile dan pembayaran cepat.',
  },
  {
    name: 'Kertas Kasir Thermal Roll 57x40mm',
    price: 'Rp 45.000',
    link: 'https://shopee.co.id',
    caption: 'Roll kasir standar untuk cetak nota rapi setiap hari.',
  },
];

const PRINT_SERVICES = [
  { value: 'Cetak Stiker', label: 'Cetak Stiker' },
  { value: 'Cetak Spanduk', label: 'Cetak Spanduk' },
  { value: 'Foto Produk F&B', label: 'Foto Produk F&B' },
];

const buildWhatsAppLink = (message: string) =>
  `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`;

export default function MemberServicesPage() {
  const [cetakType, setCetakType] = useState('Cetak Stiker');
  const [cetakQty, setCetakQty] = useState('100');
  const [cetakName, setCetakName] = useState('');
  const [cetakPhone, setCetakPhone] = useState('');
  const [cetakNotes, setCetakNotes] = useState('');
  const [customCompany, setCustomCompany] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [customIndustry, setCustomIndustry] = useState('Kuliner & F&B');
  const [customBudget, setCustomBudget] = useState('');
  const [customNotes, setCustomNotes] = useState('');

  const handleWhatsAppOpen = (message: string) => {
    window.open(buildWhatsAppLink(message), '_blank', 'noopener,noreferrer');
  };

  const handleCetakSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = `Halo Admin Logaritma, saya ingin pesan layanan ${cetakType}.\nNama Usaha: ${cetakName || '-'}\nNomor WA: ${cetakPhone || '-'}\nJumlah/Ukuran: ${cetakQty}\nKeterangan: ${cetakNotes || '-'}\nMohon bantu infokan paket dan estimasi harga.`;
    handleWhatsAppOpen(message);
  };

  const handleCustomSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = `Halo Admin Logaritma, saya ingin konsultasi Custom Enterprise Operating System untuk bisnis saya.\nNama Perusahaan/Usaha: ${customCompany || '-'}\nNomor WA: ${customPhone || '-'}\nKategori Bisnis: ${customIndustry}\nEstimasi Anggaran: ${customBudget || '-'}\nKebutuhan / Masalah: ${customNotes || '-'}\nTolong bantu jadwalkan konsultasi.`;
    handleWhatsAppOpen(message);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900/80 p-8 shadow-2xl shadow-slate-950/30 overflow-hidden">
          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-emerald-300 shadow-sm shadow-emerald-500/10">
                <Sparkles size={14} /> Public Showcase Ecosystem Services
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">Layanan Ekosistem Logaritma untuk Bisnis Anda</h1>
              <p className="max-w-2xl text-slate-300 leading-7">
                Pilih paket Meta Ads, layanan cetak, hardware kasir, dan custom enterprise OS dengan mudah. Semua layanan dapat langsung dipesan via WhatsApp / Fonnte ke Admin Logaritma.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-700/80 bg-slate-900/60 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Kontak Admin</p>
                  <p className="mt-2 font-black text-white">Admin Logaritma</p>
                  <p className="text-sm text-slate-400">Pesan layanan, konsultasi atau minta penawaran.</p>
                </div>
                <div className="rounded-3xl border border-slate-700/80 bg-slate-900/60 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">WhatsApp / Fonnte</p>
                  <p className="mt-2 font-black text-white">+62 851-7966-0408</p>
                  <button
                    type="button"
                    onClick={() => handleWhatsAppOpen('Halo Admin Logaritma, saya mau tanya tentang layanan Ecosystem Services.')}
                    className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
                  >
                    <MessageCircle size={16} /> Chat Admin Sekarang
                  </button>
                </div>
              </div>
            </div>
            <div className="rounded-[1.75rem] bg-slate-900/60 p-6 shadow-xl shadow-slate-950/40 border border-white/10">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-b from-emerald-500/20 to-slate-800 text-emerald-300 shadow-lg shadow-emerald-500/10">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Layanan Terintegrasi</p>
                  <p className="mt-2 text-lg font-black text-white">Solusi lengkap untuk iklan, cetak, hardware, dan sistem bisnis.</p>
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  'Meta Ads Setup',
                  'Cetak Branding',
                  'Shopee Affiliate Hardware',
                  'Custom Enterprise OS',
                ].map((item) => (
                  <div key={item} className="rounded-3xl border border-slate-700/60 bg-slate-950/70 p-4">
                    <p className="text-sm font-semibold text-slate-300">{item}</p>
                    <p className="mt-2 text-sm text-slate-400">Dukung performa usaha Anda dengan layanan siap pakai.</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section className="mt-10 space-y-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20">
              <div className="flex items-center gap-3 text-sm uppercase tracking-[0.24em] text-emerald-300 font-bold">
                <Megaphone size={18} /> Paket Meta Ads Manager
              </div>
              <h2 className="mt-4 text-2xl font-black text-white">Pilihan Paket Setting Iklan Meta Ads</h2>
              <p className="mt-3 text-slate-400 leading-7">Kami bantu pasang dan optimasi iklan Meta Ads sesuai durasi kebutuhan usaha Anda.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {META_ADS_PACKAGES.map((pkg) => (
                  <div key={pkg.name} className="group rounded-3xl border border-slate-800/90 bg-slate-950/90 p-5 transition hover:border-emerald-500/60 hover:bg-slate-900">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.24em] text-emerald-300">{pkg.badge}</span>
                    </div>
                    <h3 className="mt-4 text-xl font-black text-white">{pkg.name}</h3>
                    <p className="mt-3 text-3xl font-black text-emerald-300">{pkg.price}</p>
                    <p className="mt-3 text-sm text-slate-400 leading-6">{pkg.description}</p>
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                      <span className="rounded-full bg-slate-800/80 px-2 py-1">{pkg.duration}</span>
                      <span className="inline-flex items-center gap-1 text-emerald-300 font-bold"><CheckCircle2 size={14} /> Full Support</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleWhatsAppOpen(`Halo Admin Logaritma, saya ingin pesan ${pkg.name} Meta Ads. Mohon infokan detail paket dan biaya.`)}
                      className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
                    >
                      Pesan via WhatsApp / Fonnte <ArrowRight size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20">
              <div className="flex items-center gap-3 text-sm uppercase tracking-[0.24em] text-sky-300 font-bold">
                <Printer size={18} /> Cetak & Branding
              </div>
              <h2 className="mt-4 text-2xl font-black text-white">Form Layanan Cetak</h2>
              <p className="mt-3 text-slate-400 leading-7">Pilih layanan stiker, spanduk, atau foto produk, lalu langsung kirim permintaan ke admin.</p>
              <form onSubmit={handleCetakSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-bold text-slate-200">Jenis Layanan</label>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {PRINT_SERVICES.map((service) => (
                      <button
                        key={service.value}
                        type="button"
                        onClick={() => setCetakType(service.value)}
                        className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${cetakType === service.value ? 'border-emerald-500 bg-emerald-500/10 text-white' : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500'}`}
                      >
                        <p className="font-bold">{service.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-bold text-slate-200">Nama Usaha / Kontak</span>
                    <input
                      value={cetakName}
                      onChange={(event) => setCetakName(event.target.value)}
                      placeholder="Contoh: Warung Makan Bunda"
                      className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-500"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-slate-200">Nomor WhatsApp</span>
                    <input
                      value={cetakPhone}
                      onChange={(event) => setCetakPhone(event.target.value)}
                      placeholder="0812xxxxxxx"
                      className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-500"
                    />
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-bold text-slate-200">Jumlah / Ukuran</span>
                    <input
                      value={cetakQty}
                      onChange={(event) => setCetakQty(event.target.value)}
                      placeholder="100 pcs / 200x50 mm"
                      className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-500"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-slate-200">Catatan / Deskripsi</span>
                    <input
                      value={cetakNotes}
                      onChange={(event) => setCetakNotes(event.target.value)}
                      placeholder="Contoh: desain logo + nomor meja"
                      className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-500"
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-sky-400"
                >
                  Pesan via WhatsApp / Fonnte <ArrowRight size={16} />
                </button>
              </form>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20">
              <div className="flex items-center gap-3 text-sm uppercase tracking-[0.24em] text-amber-300 font-bold">
                <ShoppingBag size={18} /> Hardware Kasir Shopee Affiliate
              </div>
              <h2 className="mt-4 text-2xl font-black text-white">Katalog Hardware Kasir</h2>
              <p className="mt-3 text-slate-400 leading-7">Rekomendasi printer thermal bluetooth dan kertas kasir siap pakai, dengan link Shopee Affiliate.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {HARDWARE_PRODUCTS.map((item) => (
                  <div key={item.name} className="rounded-3xl border border-slate-800 bg-slate-950/90 p-5 transition hover:border-amber-500/40 hover:bg-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/10 text-amber-300">
                        <Tool size={20} />
                      </div>
                      <div>
                        <p className="font-black text-white">{item.name}</p>
                        <p className="text-xs text-slate-400">{item.caption}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-lg font-black text-amber-300">{item.price}</p>
                      </div>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-200 transition hover:bg-amber-500/15"
                      >
                        Shopee Affiliate <ArrowRight size={14} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20">
              <div className="flex items-center gap-3 text-sm uppercase tracking-[0.24em] text-emerald-300 font-bold">
                <LayoutGrid size={18} /> Custom Enterprise OS
              </div>
              <h2 className="mt-4 text-2xl font-black text-white">Form Pengajuan Custom OS</h2>
              <p className="mt-3 text-slate-400 leading-7">Ajukan solusi sistem bisnis kustom untuk operasi, laporan, dan integrasi multi-outlet.</p>
              <form onSubmit={handleCustomSubmit} className="mt-6 space-y-4">
                <label className="block">
                  <span className="text-sm font-bold text-slate-200">Nama Perusahaan / Usaha</span>
                  <input
                    value={customCompany}
                    onChange={(event) => setCustomCompany(event.target.value)}
                    placeholder="Contoh: CV Logam Prima"
                    className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-500"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-200">Nomor WhatsApp</span>
                  <input
                    value={customPhone}
                    onChange={(event) => setCustomPhone(event.target.value)}
                    placeholder="0812xxxxxxx"
                    className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-500"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-200">Kategori Bisnis</span>
                  <input
                    value={customIndustry}
                    onChange={(event) => setCustomIndustry(event.target.value)}
                    placeholder="Kuliner & F&B"
                    className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-500"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-200">Estimasi Anggaran</span>
                  <input
                    value={customBudget}
                    onChange={(event) => setCustomBudget(event.target.value)}
                    placeholder="Rp 10.000.000"
                    className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-500"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-200">Deskripsi Kebutuhan</span>
                  <textarea
                    value={customNotes}
                    onChange={(event) => setCustomNotes(event.target.value)}
                    placeholder="Jelaskan kebutuhan sistem, workflow, integrasi, atau fitur khusus."
                    rows={5}
                    className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-500 resize-none"
                  />
                </label>
                <button
                  type="submit"
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
                >
                  Konsultasi via WhatsApp / Fonnte <ArrowRight size={16} />
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400 font-bold">Catatan</p>
              <h2 className="mt-3 text-2xl font-black text-white">Dapatkan layanan lebih cepat lewat WhatsApp / Fonnte</h2>
              <p className="mt-3 text-slate-400 leading-7">Setiap layanan sudah disiapkan untuk komunikasi langsung dengan tim admin Logaritma. Cukup pilih paket, isi form, dan kirim pesan untuk konfirmasi segera.</p>
            </div>
            <button
              type="button"
              onClick={() => handleWhatsAppOpen('Halo Admin Logaritma, saya ingin informasi lengkap tentang layanan Ecosystem Services.')} 
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-700"
            >
              <Send size={16} /> Hubungi Admin Sekarang
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
