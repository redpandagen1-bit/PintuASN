import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">
          SKD CPNS Tryout
        </h1>
        <p className="mt-2 text-slate-600">
          Masuk ke akun Anda untuk melanjutkan latihan
        </p>
      </div>
      <SignIn 
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
