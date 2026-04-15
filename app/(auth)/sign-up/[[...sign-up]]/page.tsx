import { SignUp } from '@clerk/nextjs';

interface Props {
  searchParams: { plan?: string };
}

export default function SignUpPage({ searchParams }: Props) {
  const plan = searchParams?.plan;
  const redirectUrl = plan ? `/onboarding?plan=${plan}` : '/onboarding';

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
        forceRedirectUrl={redirectUrl}
        appearance={{
          elements: {
            rootBox: 'w-full',
            card: 'shadow-xl border-slate-200',
            formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-sm',
            footerActionLink: 'text-blue-600 hover:text-blue-500',
            footer: 'hidden',
            footerAction: 'hidden',
            headerTitle: 'text-xl font-bold',
            headerSubtitle: 'text-sm text-slate-600',
          },
          layout: {
            socialButtonsPlacement: 'top',
            logoPlacement: 'none',
          },
        }}
      />
    </div>
  );
}