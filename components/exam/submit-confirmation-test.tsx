'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SubmitConfirmationModal } from './submit-confirmation-modal';

export function SubmitConfirmationTest() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(85);

  const handleClose = () => {
    if (!isSubmitting) {
      setOpen(false);
    }
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    // Simulate submission process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setOpen(false);
    alert('Ujian berhasil disubmit!');
  };

  return (
    <div className="p-8 space-y-6">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">Submit Confirmation Modal Test</h1>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-4">
            <label htmlFor="answered">Jawaban diisi:</label>
            <input
              id="answered"
              type="range"
              min="0"
              max="110"
              value={answeredCount}
              onChange={(e) => setAnsweredCount(Number(e.target.value))}
              className="w-48"
            />
            <span className="font-mono bg-slate-100 px-3 py-1 rounded">
              {answeredCount}/110
            </span>
          </div>

          <Button
            onClick={() => setOpen(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            Test Submit Modal
          </Button>
        </div>

        <div className="bg-slate-50 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Test Scenarios:</h3>
          <ul className="text-sm space-y-1 text-slate-700">
            <li>• <strong>85/110</strong> answered - Shows warning about 25 unanswered</li>
            <li>• <strong>110/110</strong> answered - No unanswered warning</li>
            <li>• <strong>0/110</strong> answered - Maximum warning</li>
          </ul>
        </div>
      </div>

      <SubmitConfirmationModal
        open={open}
        onClose={handleClose}
        onConfirm={handleConfirm}
        answeredCount={answeredCount}
        totalQuestions={110}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
