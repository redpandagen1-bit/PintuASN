import { requireAdmin } from '@/lib/auth/check-admin';
import { PackageCreateForm } from '@/components/admin/package-create-form';

export default async function CreatePackagePage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Buat Paket Tryout Baru</h1>
        <p className="text-slate-600 mt-2">Lengkapi informasi paket tryout</p>
      </div>

      <PackageCreateForm />
    </div>
  );
}