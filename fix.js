const fs = require('fs');

let content = fs.readFileSync('src/app/member/page.tsx', 'utf8');

// 1. Fix Missing Imports
const oldImport = "import { Target, AlertTriangle, ArrowRight, Package, Wallet, CheckCircle2, MonitorPlay, LogOut, Megaphone, Printer, Handshake, MessageCircle, X, Loader2, ShoppingBag, Shirt, Lock, Home, Wrench, Star, BookOpen, HelpCircle, Info, Flame, Copy, FileText, Download, Camera, Users, Video, ShoppingCart, Search, ChevronDown, ChevronUp, LayoutGrid } from 'lucide-react';";
const newImport = "import { Target, AlertTriangle, ArrowRight, Package, Wallet, CheckCircle2, MonitorPlay, LogOut, Megaphone, Printer, Handshake, MessageCircle, X, Loader2, ShoppingBag, Shirt, Lock, Home, Wrench, Star, BookOpen, HelpCircle, Info, Flame, Copy, FileText, Download, Camera, Users, Video, ShoppingCart, Search, ChevronDown, ChevronUp, LayoutGrid, Rocket, TrendingUp, ShieldCheck, Play } from 'lucide-react';";
content = content.replace(oldImport, newImport);

// 2. Fix ???? Symbols
content = content.replace(/{trialDaysLeft > 0 \? '\?\?\?\?' : '\?\?\?\?'}/g, "{trialDaysLeft > 0 ? '🔥' : '⚠️'}");
content = content.replace(/Aktif \?\?\? Sisa \{trialDaysLeft\} Hari/g, "Aktif • Sisa {trialDaysLeft} Hari");
content = content.replace(/\?\?\? Upgrade Rp 49\.000/g, "⚡ Upgrade Rp 49.000");
content = content.replace(/FAQ UBOS \?\?\?\?/g, "FAQ UBOS 💡");
content = content.replace(/Owner F&B! \?\?\?\?/g, "Owner F&B! 🤝");

// 3. Fix Copywriting positioning UBOS as Toolset Eksekusi
const oldFnBDesc = "Aplikasi Kasir F&B Anti-Bocor & Pengunci Profit";
const newFnBDesc = "Toolset Eksekusi Logaritma Anti-Bocor & Pengunci Profit";
content = content.replace(oldFnBDesc, newFnBDesc);

const oldFnBText = "UBOS F&B dibikin khusus buat bantuin kamu ngunci target untung bulanan tanpa ribet. Gak cuma buat kasir biasa, tapi otomatis pisahin uang modal belanja besok sama untung bersih kamu hari ini, jadi uang usaha gak kecampur uang pribadi!";
const newFnBText = "UBOS BUKAN SEKADAR Aplikasi Kasir/POS biasa! Ini adalah Toolset Eksekusi Utama dari Metode Logaritma yang dibikin khusus buat bantuin kamu ngunci target untung bulanan. Secara otomatis sistem akan memisahkan uang modal belanja besok dan profit bersih hari ini, jadi uang usaha gak pernah kecampur uang pribadi!";
content = content.replace(oldFnBText, newFnBText);

const oldPercetakanDesc = "Tools Kontrol Antrean & HPP Kertas";
const newPercetakanDesc = "Toolset Logaritma: Kontrol Antrean & HPP Kertas";
content = content.replace(oldPercetakanDesc, newPercetakanDesc);

const oldRitelDesc = "Manajemen Stok Anti Dead-Stock";
const newRitelDesc = "Toolset Logaritma: Stok & Kontrol Margin Ritel";
content = content.replace(oldRitelDesc, newRitelDesc);

const oldLaundryDesc = "Tracking Slot & Nota Otomatis";
const newLaundryDesc = "Toolset Logaritma: Tracking & Profitabilitas Jasa";
content = content.replace(oldLaundryDesc, newLaundryDesc);

// Ensure the F&B checklist also aligns with Logaritma Method
const oldChecklistHeader = "Cara Gampang Mulainya:";
const newChecklistHeader = "Cara Eksekusi Metode Logaritma dengan UBOS:";
content = content.replace(oldChecklistHeader, newChecklistHeader);

fs.writeFileSync('src/app/member/page.tsx', content, 'utf8');
console.log("Fixes applied successfully.");
