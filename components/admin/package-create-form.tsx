'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

export function PackageCreateForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'medium',
    tier: 'free',
    duration_minutes: 100,
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal membuat paket');
      }

      const { package: pkg } = await response.json();
      router.push(`/admin/packages/${pkg.id}`);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Informasi Paket</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Nama Paket */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Nama Paket <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Contoh: Tryout CPNS 2025 Batch 1"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              placeholder="Deskripsi singkat tentang paket tryout..."
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tingkat Kesulitan */}
            <div className="space-y-2">
              <Label htmlFor="difficulty">
                Tingkat Kesulitan <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
              >
                <SelectTrigger id="difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Mudah</SelectItem>
                  <SelectItem value="medium">Sedang</SelectItem>
                  <SelectItem value="hard">Sulit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tier */}
            <div className="space-y-2">
              <Label htmlFor="tier">
                Tier Akses <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.tier}
                onValueChange={(value) => setFormData({ ...formData, tier: value })}
              >
                <SelectTrigger id="tier">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Gratis (Semua user)</SelectItem>
                  <SelectItem value="premium">Premium (Premium + Platinum)</SelectItem>
                  <SelectItem value="platinum">Platinum (Hanya Platinum)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                User hanya bisa akses paket sesuai tier subscription mereka
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Durasi */}
            <div className="space-y-2">
              <Label htmlFor="duration">Durasi (menit)</Label>
              <Input
                id="duration"
                type="number"
                min="60"
                max="180"
                value={formData.duration_minutes}
                onChange={(e) =>
                  setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })
                }
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="is_active">Status</Label>
              <Select
                value={formData.is_active ? 'active' : 'inactive'}
                onValueChange={(value) =>
                  setFormData({ ...formData, is_active: value === 'active' })
                }
              >
                <SelectTrigger id="is_active">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif (Tampil di user)</SelectItem>
                  <SelectItem value="inactive">Nonaktif (Hidden)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Membuat...
                </>
              ) : (
                'Buat Paket'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}