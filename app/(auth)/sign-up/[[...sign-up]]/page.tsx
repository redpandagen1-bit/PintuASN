import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Buat Akun Baru
        </h2>
        <p className="text-sm text-slate-600">
          Mulai perjalanan Anda menjadi ASN hari ini
        </p>
      </div>
      
      <SignUp 
        appearance={{
          elements: {
            rootBox: 'w-full',
            card: 'shadow-xl border-slate-200',
            formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-sm',
            footerActionLink: 'text-blue-600 hover:text-blue-500',
            // Remove Clerk branding
            footer: 'hidden',
            footerAction: 'hidden',
            // Customize header
            headerTitle: 'text-xl font-bold',
            headerSubtitle: 'text-sm text-slate-600',
          },
          layout: {
            socialButtonsPlacement: 'top',
            logoPlacement: 'none', // Remove Clerk logo
          },
        }}
        localization={{
          formFieldLabel__emailAddress: 'Alamat Email',
          formFieldLabel__password: 'Kata Sandi',
          formButtonPrimary: 'Daftar',
          footerActionLink__signIn: 'Masuk',
          socialButtonsBlockButton__google: 'Lanjutkan dengan Google',
          socialButtonsBlockButton__github: 'Lanjutkan dengan GitHub',
        }}
      />
    </div>
  );
}
