'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  disabledPlaceholder?: string;
  /** Opsi yang selalu muncul di paling atas list, terpisah dari hasil pencarian */
  pinnedOption?: string;
}

export default function SearchableDropdown({
  value,
  onChange,
  options,
  placeholder = 'Cari...',
  disabled = false,
  disabledPlaceholder,
  pinnedOption,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? options.filter(o => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSelect(option: string) {
    onChange(option);
    setQuery('');
    setOpen(false);
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange('');
    setQuery('');
    setOpen(false);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    if (!open) setOpen(true);
  }

  function handleInputFocus() {
    if (!disabled) setOpen(true);
  }

  const displayValue = open ? query : value;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={disabled ? (disabledPlaceholder ?? placeholder) : placeholder}
          disabled={disabled}
          className={`w-full px-4 py-2.5 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition-all text-slate-800 placeholder:text-slate-400 ${
            disabled
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-200 cursor-text'
          }`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && !disabled && (
            <button type="button" onClick={handleClear} className="text-slate-400 hover:text-slate-600">
              <X size={13} />
            </button>
          )}
          {!value && (
            <ChevronDown
              size={15}
              className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
            />
          )}
        </div>
      </div>

      {open && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          <ul className="overflow-y-auto" style={{ maxHeight: '200px' }}>

            {/* Pinned option — selalu muncul di atas, tidak terfilter search */}
            {pinnedOption && (
              <>
                <li
                  onMouseDown={() => handleSelect(pinnedOption)}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center gap-2 ${
                    pinnedOption === value
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 italic hover:bg-slate-50'
                  }`}
                >
                  {pinnedOption}
                </li>
                {/* Divider */}
                <li className="border-t border-slate-100 mx-3" aria-hidden />
              </>
            )}

            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-slate-400">Tidak ditemukan</li>
            ) : (
              filtered.map(option => (
                <li
                  key={option}
                  onMouseDown={() => handleSelect(option)}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                    option === value
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {option}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}