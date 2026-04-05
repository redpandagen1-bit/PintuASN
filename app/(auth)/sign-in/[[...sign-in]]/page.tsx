import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Selamat Datang Kembali
        </h2>
        <p className="text-sm text-slate-600">
          Masukan kredensial Anda untuk mengakses dashboard
        </p>
      </div>
      
      <SignIn
        routing="hash"
        signUpUrl="/sign-up"
        transferable={false}
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
          formButtonPrimary: 'Masuk',
          footerActionLink__signUp: 'Daftar',
          socialButtonsBlockButton__google: 'Lanjutkan dengan Google',
          socialButtonsBlockButton__github: 'Lanjutkan dengan GitHub',
          unstable__errors: {
            externalAccountNotFound: 'Akun Google ini belum terdaftar. Silakan daftar terlebih dahulu.',
            identifierNotFound: 'Email ini belum terdaftar. Silakan daftar terlebih dahulu.',
            couldNotLocateUser: 'Akun tidak ditemukan. Periksa kembali email Anda.',
          },
        }}
      />

      <p className="text-center text-sm text-slate-500">
        Belum punya akun?{' '}
        <a href="/sign-up" className="text-blue-600 hover:text-blue-500 font-medium">
          Daftar sekarang
        </a>
      </p>
    </div>
  );
}
