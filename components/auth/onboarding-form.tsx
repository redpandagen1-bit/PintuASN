'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const formSchema = z.object({
  fullName: z.string().min(3, 'Nama minimal 3 karakter').max(100),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface OnboardingFormProps {
  userId: string;
  defaultName?: string;
}

export function OnboardingForm({ userId, defaultName }: OnboardingFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: defaultName || '',
      phone: '',
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);

    try {
      const response = await fetch('/api/profile/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          fullName: values.fullName,
          phone: values.phone || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }

      toast.success('Profil berhasil dilengkapi!');
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Gagal menyimpan profil. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Lengkap *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Masukkan nama lengkap" 
                  {...field} 
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nomor Telepon (Opsional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="08xx xxxx xxxx" 
                  type="tel"
                  {...field} 
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Menyimpan...' : 'Mulai Belajar'}
        </Button>
      </form>
    </Form>
  );
}