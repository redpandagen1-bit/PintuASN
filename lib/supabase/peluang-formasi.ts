import { createAdminClient } from './server';
import { PASSING_GRADES } from '@/constants/exam';

export type PeluangFormasi = {
  hasData: boolean;
  finalScore: number;
  twk: number;
  tiu: number;
  tkp: number;
  instansi: string | null;
  // Perbandingan di antara peserta yang memilih instansi sama
  instansiPeers: number;        // jumlah peserta lain (selain kamu)
  instansiBetter: number;       // peserta lain yang nilainya lebih rendah
  instansiPercentile: number | null; // % peserta instansi yang kamu ungguli
  instansiRank: number | null;  // perkiraan peringkat (1 = teratas), termasuk kamu
  // Perbandingan se-nasional (semua peserta PintuASN)
  nationalPeers: number;
  nationalBetter: number;
  nationalPercentile: number | null;
  passing: { twk: boolean; tiu: boolean; tkp: boolean; all: boolean };
};

export async function getPeluangFormasi(userId: string): Promise<PeluangFormasi> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase.rpc('peluang_formasi', { p_user_id: userId });
  if (error) throw new Error(`Failed to fetch peluang formasi: ${error.message}`);

  const row = (Array.isArray(data) ? data[0] : data) as
    | {
        my_final: number | null; my_twk: number | null; my_tiu: number | null; my_tkp: number | null;
        inst: string | null;
        inst_total: number; inst_better: number; nat_total: number; nat_better: number;
      }
    | undefined;

  if (!row || row.my_final == null) {
    return {
      hasData: false, finalScore: 0, twk: 0, tiu: 0, tkp: 0,
      instansi: row?.inst ?? null,
      instansiPeers: 0, instansiBetter: 0, instansiPercentile: null, instansiRank: null,
      nationalPeers: 0, nationalBetter: 0, nationalPercentile: null,
      passing: { twk: false, tiu: false, tkp: false, all: false },
    };
  }

  const twk = row.my_twk ?? 0;
  const tiu = row.my_tiu ?? 0;
  const tkp = row.my_tkp ?? 0;

  const instPeers = Number(row.inst_total) || 0;
  const instBetter = Number(row.inst_better) || 0;
  const natPeers = Number(row.nat_total) || 0;
  const natBetter = Number(row.nat_better) || 0;

  const passTwk = twk >= PASSING_GRADES.TWK;
  const passTiu = tiu >= PASSING_GRADES.TIU;
  const passTkp = tkp >= PASSING_GRADES.TKP;

  return {
    hasData: true,
    finalScore: row.my_final,
    twk, tiu, tkp,
    instansi: row.inst,
    instansiPeers: instPeers,
    instansiBetter: instBetter,
    instansiPercentile: instPeers > 0 ? Math.round((instBetter / instPeers) * 100) : null,
    // peringkat termasuk diri sendiri: (peserta lain yang lebih tinggi) + 1
    instansiRank: instPeers > 0 ? (instPeers - instBetter) + 1 : (row.inst ? 1 : null),
    nationalPeers: natPeers,
    nationalBetter: natBetter,
    nationalPercentile: natPeers > 0 ? Math.round((natBetter / natPeers) * 100) : null,
    passing: { twk: passTwk, tiu: passTiu, tkp: passTkp, all: passTwk && passTiu && passTkp },
  };
}
