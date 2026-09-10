// ============================================================
// types/follow-proof.ts
// ============================================================

export interface FollowProofSubmission {
  id: string;
  user_id: string;
  package_id: string | null;
  event_id: string | null;
  storage_paths: string[];
  viewed_at: string | null;
  file_deleted_at: string | null;
  created_at: string;
}
