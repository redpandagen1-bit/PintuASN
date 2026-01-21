import { z } from 'zod';

export const onboardingSchema = z.object({
  full_name: z
    .string()
    .min(1, "Nama lengkap wajib diisi")
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  phone: z
    .string()
    .min(1, "Nomor telepon wajib diisi")
    .regex(/^(\+62|08)[0-9]+$/, "Format nomor telepon tidak valid. Gunakan format +62xxx atau 08xxx"),
  date_of_birth: z
    .string()
    .min(1, "Tanggal lahir wajib diisi")
    .refine((date) => {
      const parsedDate = new Date(date);
      const now = new Date();
      const thirteenYearsAgo = new Date(now.getFullYear() - 13, now.getMonth(), now.getDate());
      return !isNaN(parsedDate.getTime()) && parsedDate <= now && parsedDate <= thirteenYearsAgo;
    }, {
      message: "Usia minimal 13 tahun"
    }),
  gender: z.enum(['male', 'female'], {
    errorMap: () => ({ message: "Jenis kelamin wajib diisi" })
  })
});
