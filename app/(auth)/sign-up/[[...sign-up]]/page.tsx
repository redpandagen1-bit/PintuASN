import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">
          Daftar Akun Baru
        </h1>
        <p className="mt-2 text-slate-600">
          Mulai perjalanan Anda menuju ASN
        </p>
      </div>
      <SignUp 
        appearance={{
          elements: {
            rootBox: 'w-full',
            card: 'shadow-xl',
          },
        }}
      />
    </div>
  );
}
