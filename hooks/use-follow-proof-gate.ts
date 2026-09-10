'use client';

// ============================================================
// hooks/use-follow-proof-gate.ts
// Cek sekali apakah user butuh upload bukti follow sebelum lanjut
// (hanya fetch kalau `required` true — hemat request untuk item yang
// tidak butuh bukti sama sekali).
// ============================================================

import { useEffect, useState } from 'react';

export function useFollowProofGate(required: boolean) {
  const [checked, setChecked]       = useState(!required);
  const [needsProof, setNeedsProof] = useState(false);

  useEffect(() => {
    if (!required) return;
    let cancelled = false;
    fetch('/api/follow-proof/status')
      .then(r => r.json())
      .then(d => { if (!cancelled) { setNeedsProof(!d.hasSubmitted); setChecked(true); } })
      .catch(() => { if (!cancelled) setChecked(true); });
    return () => { cancelled = true; };
  }, [required]);

  return { checked, needsProof };
}
