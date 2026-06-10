'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Eye, Trash2, Package, ChevronLeft, ChevronRight, Save, CheckCircle2 } from 'lucide-react';

const PAGE_SIZE = 10;

interface PackageRow {
  id: string;
  title: string;
  description?: string;
  tier: 'free' | 'premium' | 'platinum';
  difficulty: 'easy' | 'medium' | 'hard';
  question_count: number;
  is_active: boolean;
  [key: string]: any;
}

interface EditedField {
  tier?: 'free' | 'premium' | 'platinum';
  is_active?: boolean;
}

interface PackageTableProps {
  packages: PackageRow[];
}

export function PackageTable({ packages }: PackageTableProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [edits, setEdits] = useState<Record<string, EditedField>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const totalPages = Math.ceil(packages.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentPackages = packages.slice(startIndex, startIndex + PAGE_SIZE);

  const hasChanges = Object.keys(edits).length > 0;

  const handleTierChange = useCallback((id: string, value: 'free' | 'premium' | 'platinum', original: PackageRow) => {
    setEdits(prev => {
      const existing = prev[id] || {};
      const newField: EditedField = { ...existing, tier: value };
      // Remove if same as original
      if (value === original.tier) delete newField.tier;
      if (Object.keys(newField).length === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: newField };
    });
  }, []);

  const handleStatusChange = useCallback((id: string, value: string, original: PackageRow) => {
    const isActive = value === 'active';
    setEdits(prev => {
      const existing = prev[id] || {};
      const newField: EditedField = { ...existing, is_active: isActive };
      // Remove if same as original
      if (isActive === original.is_active) delete newField.is_active;
      if (Object.keys(newField).length === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: newField };
    });
  }, []);

  const handleSave = async () => {
    if (!hasChanges) return;
    setIsSaving(true);
    try {
      await Promise.all(
        Object.entries(edits).map(([id, fields]) =>
          fetch(`/api/admin/packages/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fields),
          }).then(r => {
            if (!r.ok) throw new Error(`Gagal menyimpan paket ${id}`);
          })
        )
      );
      setEdits({});
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menyimpan. Coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/packages/${deleteId}`, { method: 'DELETE' });
      if (response.ok) {
        router.refresh();
        setDeleteId(null);
      } else {
        const data = await response.json();
        alert(data.error || 'Gagal menghapus paket');
      }
    } catch {
      alert('Terjadi kesalahan');
    } finally {
      setIsDeleting(false);
    }
  };

  const getTierValue = (pkg: PackageRow) => edits[pkg.id]?.tier ?? pkg.tier;
  const getStatusValue = (pkg: PackageRow) =>
    edits[pkg.id]?.is_active !== undefined ? edits[pkg.id].is_active : pkg.is_active;

  const isRowEdited = (id: string) => !!edits[id] && Object.keys(edits[id]).length > 0;

  if (packages.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">Belum ada paket tryout</p>
        <p className="text-sm text-slate-400 mt-1">Buat paket baru untuk memulai</p>
      </div>
    );
  }

  return (
    <>
      {/* Save bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <p className="text-sm text-slate-500">
          {hasChanges
            ? `${Object.keys(edits).length} paket diubah — belum disimpan`
            : 'Ubah Tier atau Status langsung di tabel, lalu simpan.'}
        </p>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          size="sm"
          className={`gap-2 transition-all ${
            saveSuccess
              ? 'bg-green-600 hover:bg-green-700'
              : hasChanges
              ? 'bg-blue-600 hover:bg-blue-700'
              : ''
          }`}
        >
          {saveSuccess ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Tersimpan
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </>
          )}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead className="min-w-[300px]">Nama Paket</TableHead>
              <TableHead className="w-36">Tier</TableHead>
              <TableHead className="w-32">Tingkat</TableHead>
              <TableHead className="w-32">Jumlah Soal</TableHead>
              <TableHead className="w-36">Status</TableHead>
              <TableHead className="w-20">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPackages.map((pkg, index) => {
              const tierValue = getTierValue(pkg);
              const statusValue = getStatusValue(pkg);
              const edited = isRowEdited(pkg.id);

              return (
                <TableRow
                  key={pkg.id}
                  className={edited ? 'bg-amber-50 border-l-2 border-l-amber-400' : ''}
                >
                  <TableCell className="font-medium text-slate-500">
                    {startIndex + index + 1}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-slate-900">{pkg.title}</div>
                      {pkg.description && (
                        <div className="text-sm text-slate-500 line-clamp-1">{pkg.description}</div>
                      )}
                    </div>
                  </TableCell>

                  {/* Tier dropdown */}
                  <TableCell>
                    <Select
                      value={tierValue}
                      onValueChange={(v) =>
                        handleTierChange(pkg.id, v as 'free' | 'premium' | 'platinum', pkg)
                      }
                    >
                      <SelectTrigger className="h-8 w-28 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-slate-400" />
                            Gratis
                          </span>
                        </SelectItem>
                        <SelectItem value="premium">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            Premium
                          </span>
                        </SelectItem>
                        <SelectItem value="platinum">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            Platinum
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {pkg.difficulty === 'easy' ? 'Mudah' :
                       pkg.difficulty === 'medium' ? 'Sedang' : 'Sulit'}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <span className="font-medium">{pkg.question_count || 0}</span>
                    <span className="text-slate-500 text-sm"> soal</span>
                  </TableCell>

                  {/* Status dropdown */}
                  <TableCell>
                    <Select
                      value={statusValue ? 'active' : 'inactive'}
                      onValueChange={(v) => handleStatusChange(pkg.id, v, pkg)}
                    >
                      <SelectTrigger className="h-8 w-28 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            Aktif
                          </span>
                        </SelectItem>
                        <SelectItem value="inactive">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-slate-400" />
                            Nonaktif
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/packages/${pkg.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Detail & Soal
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(pkg.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            Menampilkan {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, packages.length)} dari {packages.length} paket
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page =>
                page === 1 ||
                page === totalPages ||
                Math.abs(page - currentPage) <= 1
              )
              .reduce<(number | '...')[]>((acc, page, idx, arr) => {
                if (idx > 0 && typeof arr[idx - 1] === 'number' && (page as number) - (arr[idx - 1] as number) > 1) {
                  acc.push('...');
                }
                acc.push(page);
                return acc;
              }, [])
              .map((page, idx) =>
                page === '...' ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-slate-400 text-sm">…</span>
                ) : (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page as number)}
                    className={`h-8 w-8 p-0 text-xs ${currentPage === page ? 'bg-slate-800 text-white hover:bg-slate-700' : ''}`}
                  >
                    {page}
                  </Button>
                )
              )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Paket?</AlertDialogTitle>
            <AlertDialogDescription>
              Paket akan dihapus secara permanen. Pastikan tidak ada user yang sedang
              mengerjakan tryout dari paket ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
