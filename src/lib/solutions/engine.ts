/**
 * Recommendation Engine — Logaritma Solution Matching
 * 
 * Flow: Profile → Goal → Problem/Gap → Recommended Solution(s)
 * 
 * Menerima input dari Backward Mapping wizard dan mengembalikan
 * array Solution yang cocok, diurutkan dari yang paling relevan.
 */

import { SOLUTION_CATALOG, Solution } from './catalog';

export interface RecommendationInput {
  profesi: string;           // Raw profesi dari user
  tujuan: string;            // Tujuan utama / goal
  target: string;            // Target kuantitatif / kualitatif
  caraMencapai: string;      // Cara yang direncanakan user
}

// ─── Profile Normalizer ───────────────────────────────────────────────────────

export type NormalizedProfile =
  | 'CREATOR'
  | 'RETAIL/UMKM'
  | 'JASA'
  | 'F&B'
  | 'KARYAWAN'
  | 'PELAJAR'
  | 'LAINNYA';

export function normalizeProfile(profesi: string): NormalizedProfile {
  const p = profesi.toLowerCase();
  if (
    p.includes('youtube') || p.includes('youtuber') ||
    p.includes('tiktok') || p.includes('tiktoker') ||
    p.includes('influencer') || p.includes('content') ||
    p.includes('creator') || p.includes('kreator') ||
    p.includes('blogger')
  ) return 'CREATOR';

  if (
    p.includes('warung') || p.includes('kedai') ||
    p.includes('makan') || p.includes('f&b') ||
    p.includes('cafe') || p.includes('kafe') || p.includes('resto')
  ) return 'F&B';

  if (
    p.includes('dagang') || p.includes('pedagang') ||
    p.includes('reseller') || p.includes('toko') ||
    p.includes('retail') || p.includes('umkm') ||
    p.includes('usaha') || p.includes('pemilik')
  ) return 'RETAIL/UMKM';

  if (
    p.includes('barber') || p.includes('montir') ||
    p.includes('freelance') || p.includes('jasa') ||
    p.includes('layanan') || p.includes('servis') ||
    p.includes('profesional') || p.includes('penyedia')
  ) return 'JASA';

  if (p.includes('karyawan') || p.includes('pegawai') || p.includes('pekerja')) {
    return 'KARYAWAN';
  }

  if (p.includes('pelajar') || p.includes('mahasiswa') || p.includes('siswa')) {
    return 'PELAJAR';
  }

  return 'LAINNYA';
}

// ─── Scoring Engine ───────────────────────────────────────────────────────────

interface ScoredSolution {
  solution: Solution;
  score: number;
  matchedProblems: string[];
  matchedKeywords: string[];
}

export function getRecommendations(input: RecommendationInput): Solution[] {
  const { profesi, tujuan, target, caraMencapai } = input;

  const normalizedProfile = normalizeProfile(profesi);
  const combinedText = `${tujuan} ${target} ${caraMencapai} ${profesi}`.toLowerCase();

  const scored: ScoredSolution[] = [];

  for (const solution of SOLUTION_CATALOG) {
    if (!solution.active) continue;

    // Check exclude list
    if (solution.excludeProfile?.some(ep => normalizedProfile.startsWith(ep))) {
      continue;
    }

    let score = 0;
    const matchedKeywords: string[] = [];
    const matchedProblems: string[] = [];

    // 1. Profile match (+3 per match)
    if (solution.targetProfile.includes(normalizedProfile)) {
      score += 3;
    }

    // 2. Trigger keyword match (+2 per keyword found)
    for (const kw of solution.triggerKeywords) {
      if (combinedText.includes(kw.toLowerCase())) {
        score += 2;
        matchedKeywords.push(kw);
      }
    }

    // 3. Goal keyword match (+1 per match)
    for (const goal of solution.targetGoal) {
      if (combinedText.includes(goal.toLowerCase())) {
        score += 1;
      }
    }

    // 4. Only include solutions with at least some relevance
    if (score >= 3) {
      scored.push({ solution, score, matchedProblems, matchedKeywords });
    }
  }

  // Sort by score descending, cap at 3 recommendations
  const sorted = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(s => s.solution);

  // Fallback: if nothing matched, recommend Konsultasi
  if (sorted.length === 0) {
    const konsultasi = SOLUTION_CATALOG.find(s => s.id === 'konsultasi');
    return konsultasi ? [konsultasi] : [];
  }

  return sorted;
}

// ─── Color Map ────────────────────────────────────────────────────────────────
// Returns Tailwind classes for each solution color scheme

export function getSolutionColorClasses(color: string): {
  bg: string;
  border: string;
  badge: string;
  button: string;
  text: string;
} {
  const map: Record<string, ReturnType<typeof getSolutionColorClasses>> = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      badge: 'bg-blue-100 text-blue-700',
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
      text: 'text-blue-900',
    },
    sky: {
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      badge: 'bg-sky-100 text-sky-700',
      button: 'bg-sky-600 hover:bg-sky-700 text-white',
      text: 'text-sky-900',
    },
    indigo: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      badge: 'bg-indigo-100 text-indigo-700',
      button: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      text: 'text-indigo-900',
    },
    violet: {
      bg: 'bg-violet-50',
      border: 'border-violet-200',
      badge: 'bg-violet-100 text-violet-700',
      button: 'bg-violet-600 hover:bg-violet-700 text-white',
      text: 'text-violet-900',
    },
    emerald: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-700',
      button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      text: 'text-emerald-900',
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      badge: 'bg-amber-100 text-amber-700',
      button: 'bg-amber-600 hover:bg-amber-700 text-white',
      text: 'text-amber-900',
    },
  };

  return map[color] ?? map['blue'];
}
