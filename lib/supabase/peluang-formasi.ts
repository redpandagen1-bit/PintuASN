import { createAdminClient } from './server';
import { PASSING_GRADES } from '@/constants/exam';

// Minimal peserta satu instansi agar perbandingan instansi dipakai;
// di bawah ini fallback ke perbandingan nasional.
const INSTANSI_MIN_PEERS = 8;

export type PeluangFormasi = {
  hasData: boolean;
  finalScore: number;
  twk: number;
  tiu: number;
  tkp: number;
  instansi: string | null;
  scope: 'instansi' | 'nasional';
  peers: number;
  betterThan: number;
  percentile: number | null;
  passing: { twk: boolean; tiu: boolean; tkp: boolean; all: boolean };
};

export async function getPeluangFormasi(userId: string): Promise<PeluangFormasi> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase.rpc('peluang_formasi', { p_user_id: userId });
  if (error) throw new Error(`Failed to fetch peluang formasi: ${error.message}`);

  const row = (Array.isArray(data) ? data[0] : data) as
    | {
        my_final: number | null;
        my_twk: number | null;
        my_tiu: number | null;
        my_tkp: number | null;
        inst: string | null;
        inst_total: number;
        inst_better: number;
        nat_total: number;
        nat_better: number;
      }
    | undefined;

  if (!row || row.my_final == null) {
    return {
      hasData: false,
      finalScore: 0, twk: 0, tiu: 0, tkp: 0,
      instansi: row?.inst ?? null,
      scope: 'nasional', peers: 0, betterThan: 0, percentile: null,
      passing: { twk: false, tiu: false, tkp: false, all: false },
    };
  }

  const twk = row.my_twk ?? 0;
  const tiu = row.my_tiu ?? 0;
  const tkp = row.my_tkp ?? 0;

  const instTotal = Number(row.inst_total) || 0;
  const useInstansi = !!row.inst && instTotal >= INSTANSI_MIN_PEERS;

  const scope: 'instansi' | 'nasional' = useInstansi ? 'instansi' : 'nasional';
  const peers = useInstansi ? instTotal : Number(row.nat_total) || 0;
  const betterThan = useInstansi ? Number(row.inst_better) || 0 : Number(row.nat_better) || 0;
  const percentile = peers > 0 ? Math.round((betterThan / peers) * 100) : null;

  const passTwk = twk >= PASSING_GRADES.TWK;
  const passTiu = tiu >= PASSING_GRADES.TIU;
  const passTkp = tkp >= PASSING_GRADES.TKP;

  return {
    hasData: true,
    finalScore: row.my_final,
    twk, tiu, tkp,
    instansi: row.inst,
    scope,
    peers,
    betterThan,
    percentile,
    passing: { twk: passTwk, tiu: passTiu, tkp: passTkp, all: passTwk && passTiu && passTkp },
  };
}
