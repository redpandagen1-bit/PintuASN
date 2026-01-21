'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { createClient } from '@supabase/supabase-js';
import { onboardingSchema } from '@/lib/validations/onboarding';
import { OnboardingFormProps } from '@/types/onboarding';
import { z } from 'zod';

type FormValues = z.infer<typeof onboardingSchema>;

export function OnboardingForm({ userId, defaultName }: OnboardingFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      full_name: defaultName || '',
      phone: '',
      date_of_birth: '',
      gender: undefined,
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: values.full_name,
          phone: values.phone,
          date_of_birth: values.date_of_birth,
          gender: values.gender,
          profile_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) {
        throw new Error(error.message || 'Gagal menyimpan profil');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Onboarding error:', error);
      // You can add a toast component here if you have one
      alert(error instanceof Error ? error.message : 'Gagal menyimpan profil. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }

  const currentYear = new Date().getFullYear();
  const maxDate = new Date(currentYear - 13, new Date().getMonth(), new Date().getDate());
  const minDate = new Date(currentYear - 100, 0, 1);

  const genderOptions = [
    { value: 'male', label: 'Laki-laki' },
    { value: 'female', label: 'Perempuan' },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Nama Lengkap */}
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Lengkap <span className="text-red-500">*</span></FormLabel>
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

        {/* Nomor Telepon */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>No. WhatsApp <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input 
                  placeholder="contoh: +6281234567890 atau 081234567890" 
                  type="tel"
                  {...field} 
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tanggal Lahir */}
        <FormField
          control={form.control}
          name="date_of_birth"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Tanggal Lahir <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input
                  type="date"
                  max={new Date(maxDate).toISOString().split('T')[0]}
                  min={new Date(minDate).toISOString().split('T')[0]}
                  className={cn(
                    !field.value && "text-muted-foreground"
                  )}
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Jenis Kelamin */}
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jenis Kelamin <span className="text-red-500">*</span></FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {genderOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading || !form.formState.isValid}>
          {isLoading ? 'Menyimpan...' : 'Simpan & Lanjutkan'}
        </Button>
      </form>
    </Form>
  );
}