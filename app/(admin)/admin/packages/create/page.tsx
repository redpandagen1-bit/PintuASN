'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PackageFormStep1 } from '@/components/admin/package-form-step1';
import { PackageFormStep2 } from '@/components/admin/package-form-step2';
import { PackageFormStep3 } from '@/components/admin/package-form-step3';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

type PackageFormData = {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tier: 'free' | 'premium' | 'platinum';
  is_active: boolean;
  selectedQuestions: {
    TWK: string[];
    TIU: string[];
    TKP: string[];
  };
};

export default function CreatePackagePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<PackageFormData>({
    title: '',
    description: '',
    difficulty: 'medium',
    tier: 'free',
    is_active: true,
    selectedQuestions: {
      TWK: [],
      TIU: [],
      TKP: [],
    },
  });

  const steps = [
    { number: 1, label: 'Info Paket' },
    { number: 2, label: 'Pilih Soal' },
    { number: 3, label: 'Review' },
  ];

  const updateFormData = (updates: Partial<PackageFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Buat Paket Tryout Baru</h1>
        <p className="text-slate-600 mt-2">Lengkapi informasi paket dan pilih soal</p>
      </div>

      {/* Step Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {steps.map((s, index) => (
              <div key={s.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold ${
                      step >= s.number
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {step > s.number ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      s.number
                    )}
                  </div>
                  <span className="text-sm font-medium mt-2 text-slate-700">
                    {s.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 ${
                      step > s.number ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form Steps */}
      {step === 1 && (
        <PackageFormStep1
          formData={formData}
          onUpdate={updateFormData}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <PackageFormStep2
          formData={formData}
          onUpdate={updateFormData}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <PackageFormStep3
          formData={formData}
          onBack={() => setStep(2)}
          onSubmit={() => {
            // Will be handled in Step3 component
          }}
        />
      )}
    </div>
  );
}