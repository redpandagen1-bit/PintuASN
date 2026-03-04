'use client';

import { useState } from 'react';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Eye, Pencil, Trash2, Package } from 'lucide-react';

interface PackageTableProps {
  packages: any[];
}

export function PackageTable({ packages }: PackageTableProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/packages/${deleteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
        setDeleteId(null);
      } else {
        const data = await response.json();
        alert(data.error || 'Gagal menghapus paket');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Terjadi kesalahan');
    } finally {
      setIsDeleting(false);
    }
  };

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
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead className="min-w-[300px]">Nama Paket</TableHead>
              <TableHead className="w-32">Tier</TableHead>
              <TableHead className="w-32">Tingkat</TableHead>
              <TableHead className="w-32">Jumlah Soal</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="w-20">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.map((pkg, index) => (
              <TableRow key={pkg.id}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-slate-900">{pkg.title}</div>
                    {pkg.description && (
                      <div className="text-sm text-slate-500 line-clamp-1">
                        {pkg.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      pkg.tier === 'free' ? 'secondary' :
                      pkg.tier === 'premium' ? 'default' :
                      'outline'
                    }
                    className={
                      pkg.tier === 'platinum'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : ''
                    }
                  >
                    {pkg.tier === 'free' ? 'Gratis' :
                     pkg.tier === 'premium' ? 'Premium' :
                     'Platinum'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {pkg.difficulty === 'easy' ? 'Mudah' :
                     pkg.difficulty === 'medium' ? 'Sedang' :
                     'Sulit'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{pkg.question_count || 0}</span>
                  <span className="text-slate-500 text-sm"> soal</span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={pkg.is_active ? 'default' : 'secondary'}
                    className={
                      pkg.is_active
                        ? 'bg-green-100 text-green-800 border-green-300'
                        : 'bg-slate-100 text-slate-700'
                    }
                  >
                    {pkg.is_active ? 'Aktif' : 'Nonaktif'}
                  </Badge>
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
            ))}
          </TableBody>
        </Table>
      </div>

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