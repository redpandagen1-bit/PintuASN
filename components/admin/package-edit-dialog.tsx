'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Package, Shield, BarChart3, Eye, EyeOff, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PackageEditDialogProps {
  packageData: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function PackageEditDialog({
  packageData,
  open,
  onOpenChange,
  onSuccess,
}: PackageEditDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: packageData.title || '',
    description: packageData.description || '',
    difficulty: packageData.difficulty || 'medium',
    tier: packageData.tier || 'free',
    is_active: packageData.is_active || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/packages/${packageData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal mengupdate paket');
      }

      onOpenChange(false);
      onSuccess();
      router.refresh();
    } catch (error: any) {
      alert('❌ ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">Pengaturan Paket</DialogTitle>
              <DialogDescription className="text-sm mt-0.5">
                Kelola informasi dan akses paket tryout
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          {/* Status Active - PROMINENT */}
          <div
            className={cn(
              'relative overflow-hidden rounded-xl border-2 transition-all',
              formData.is_active
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
                : 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-300'
            )}
          >
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {formData.is_active ? (
                      <Eye className="h-5 w-5 text-green-600" />
                    ) : (
                      <EyeOff className="h-5 w-5 text-slate-500" />
                    )}
                    <Label className="text-base font-semibold cursor-pointer">
                      {formData.is_active ? 'Paket Aktif' : 'Paket Nonaktif'}
                    </Label>
                  </div>
                  <p className="text-sm text-slate-600">
                    {formData.is_active
                      ? 'Paket dapat diakses oleh user sesuai tier'
                      : 'Paket disembunyikan dari semua user'}
                  </p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>
            </div>

            {/* Decorative gradient overlay */}
            <div
              className={cn(
                'absolute inset-0 opacity-10 pointer-events-none',
                formData.is_active
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                  : 'bg-gradient-to-r from-slate-400 to-slate-500'
              )}
            />
          </div>

          {/* Basic Info Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <div className="h-px flex-1 bg-slate-200" />
              <span>INFORMASI DASAR</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Nama Paket <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Contoh: Tryout SKD CPNS 2024"
                className="h-11"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Deskripsi
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Jelaskan tentang paket ini..."
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          {/* Settings Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <div className="h-px flex-1 bg-slate-200" />
              <span>PENGATURAN</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Difficulty */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-slate-500" />
                  Tingkat Kesulitan
                </Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span>Mudah</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        <span>Sedang</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="hard">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span>Sulit</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tier */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-slate-500" />
                  Tier Akses
                </Label>
                <Select
                  value={formData.tier}
                  onValueChange={(value) => setFormData({ ...formData, tier: value })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-400" />
                        <span className="font-medium">Gratis</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="premium">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="font-medium">Premium</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="platinum">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span className="font-medium">Platinum</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tier Info */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <span className="font-semibold">💡 Info Tier:</span>{' '}
                {formData.tier === 'free' && 'Semua user bisa mengakses paket ini'}
                {formData.tier === 'premium' && 'Hanya user Premium & Platinum yang bisa akses'}
                {formData.tier === 'platinum' && 'Eksklusif untuk user Platinum saja'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1 h-11"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Package className="h-4 w-4 mr-2" />
                  Simpan Perubahan
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}