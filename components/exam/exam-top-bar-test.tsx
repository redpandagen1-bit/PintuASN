'use client';

import { useState } from 'react';
import { ExamTopBar } from './exam-top-bar';

export function ExamTopBarTest() {
  const [isSaving, setIsSaving] = useState(false);
  const [timer, setTimer] = useState({
    formatted: '59:45',
    isWarning: false
  });

  const handleSubmit = () => {
    alert('Submit button clicked!');
  };

  const toggleSaving = () => {
    setIsSaving(!isSaving);
  };

  const toggleWarning = () => {
    setTimer({
      formatted: '04:30',
      isWarning: !timer.isWarning
    });
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex gap-2 mb-4">
        <button
          onClick={toggleSaving}
          className="px-4 py-2 bg-slate-200 rounded"
        >
          {isSaving ? 'Stop Saving' : 'Start Saving'}
        </button>
        <button
          onClick={toggleWarning}
          className="px-4 py-2 bg-slate-200 rounded"
        >
          {timer.isWarning ? 'Normal Time' : 'Warning Time'}
        </button>
      </div>

      <ExamTopBar
        timer={timer}
        packageTitle="Tes Kompetensi Dasar - Simulasi CPNS 2024"
        onSubmit={handleSubmit}
        isSaving={isSaving}
      />

      <div className="mt-8 p-4 bg-slate-50 rounded">
        <h2 className="text-lg font-semibold mb-2">Component Test</h2>
        <ul className="text-sm space-y-1">
          <li>✅ Timer display with warning state</li>
          <li>✅ Package title (desktop only)</li>
          <li>✅ Submit button with icon</li>
          <li>✅ Saving indicator</li>
          <li>✅ Responsive layout</li>
          <li>✅ Sticky positioning</li>
        </ul>
      </div>
    </div>
  );
}
