'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Profile } from '@/types/database';

interface ProfileEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  onProfileUpdate: (profile: Profile) => void;
}

export function ProfileEditDialog({ 
  isOpen, 
  onClose, 
  profile, 
  onProfileUpdate 
}: ProfileEditDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState(profile.full_name || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [errors, setErrors] = useState<{ full_name?: string; phone?: string }>({});

  const validateForm = () => {
    const newErrors: { full_name?: string; phone?: string } = {};
    
    if (!fullName.trim()) {
      newErrors.full_name = 'Nama lengkap harus diisi';
    } else if (fullName.length > 100) {
      newErrors.full_name = 'Nama lengkap maksimal 100 karakter';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const toastId = toast.loading('Menyimpan perubahan...');
    setIsLoading(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: phone.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal memperbarui profil');
      }

      const result = await response.json();
      toast.success('Profil berhasil diperbarui!', { id: toastId });
      onProfileUpdate(result.profile);
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui profil', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setErrors({});
      onClose();
    }
  };

  const hasChanges = fullName.trim() !== (profile.full_name || '') || phone.trim() !== (profile.phone || '');

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profil</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nama Lengkap</Label>
            <Input
              id="full_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Masukkan nama lengkap"
              disabled={isLoading}
            />
            {errors.full_name && (
              <p className="text-sm text-red-600">{errors.full_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Nomor Telepon (Opsional)</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Masukkan nomor telepon"
              disabled={isLoading}
            />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={!hasChanges || isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
