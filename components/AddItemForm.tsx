
import React, { useState, useRef, useEffect } from 'react';
import { parseSilverInput } from '../services/geminiService';
import { SilverItem, User } from '../types';

const SUGGESTIONS = [
  "10 American Silver Eagles",
  "1kg Silver Bar",
  "5oz Silver Round",
  "Roll of Silver Quarters",
  "100oz Silver Bar",
  "25 Silver Maple Leafs",
  "1oz Austrian Philharmonic",
  "10oz Valcambi Silver Bar",
  "Roll of Silver Dimes (Junk)",
  "100g PAMP Suisse Silver"
];

interface AddItemFormProps {
  onAdd: (item: SilverItem) => void;
  user: User | null;
}

const AddItemForm: React.FC<AddItemFormProps> = ({ onAdd, user }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = SUGGESTIONS.filter(s => 
    s.toLowerCase().includes(input.toLowerCase()) && input.length > 0
  );

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredSuggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(filteredSuggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !user) return;

    setIsLoading(true);
    setShowSuggestions(false);
    try {
      const parsed = await parseSilverInput(input);
      const newItem: SilverItem = {
        id: crypto.randomUUID(),
        name: parsed.name,
        quantity: parsed.quantity,
        ozPerUnit: parsed.ozPerUnit,
        totalOz: parsed.quantity * parsed.ozPerUnit,
        category: parsed.category,
        purity: parsed.purity,
        addedAt: Date.now(),
      };
      onAdd(newItem);
      setInput('');
      setSelectedIndex(-1);
    } catch (error) {
      console.error(error);
      alert("Oops! I couldn't understand that item. Try something like '10 American Silver Eagles' or '1kg Silver Bar'.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 mb-8 transition-all relative overflow-hidden">
        
        {/* Logged Out Overlay */}
        {!user && (
          <div className="absolute inset-0 z-10 bg-white/60 dark:bg-slate-900/80 backdrop-blur-[2px] flex items-center justify-center p-6 text-center animate-in fade-in duration-500">
            <div className="max-w-xs">
              <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="text-slate-900 dark:text-white font-bold text-sm mb-1">Add Items Locked</h4>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                Please <span className="font-bold text-slate-900 dark:text-slate-100">Sign in with Google</span> at the top to start building your silver stack.
              </p>
            </div>
          </div>
        )}

        <label className={`block text-sm font-semibold mb-3 transition-colors ${!user ? 'text-slate-300 dark:text-slate-700' : 'text-slate-700 dark:text-slate-300'}`}>
          Add Silver to Stack
        </label>
        
        <div className="flex flex-col sm:flex-row gap-3 relative">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onFocus={() => user && setShowSuggestions(true)}
              onChange={(e) => {
                setInput(e.target.value);
                setShowSuggestions(true);
                setSelectedIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              placeholder="e.g., '25 Silver Maple Leafs' or '5oz Silver Bar'"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all text-slate-700 dark:text-slate-200 disabled:opacity-50"
              disabled={isLoading || !user}
            />
            
            {/* Auto-complete Dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && user && (
              <div className="absolute left-0 right-0 top-full mt-2 z-[60] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                      index === selectedIndex 
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-medium">{suggestion}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !input.trim() || !user}
            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold px-6 py-3 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed transition-colors whitespace-nowrap shadow-sm"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </span>
            ) : "Add Item"}
          </button>
        </div>
        <p className={`text-xs mt-3 transition-colors ${!user ? 'text-slate-300 dark:text-slate-700' : 'text-slate-400 dark:text-slate-500'}`}>
          Tip: Our AI automatically recognizes coins, bars, rounds, and junk silver weights.
        </p>
      </form>
    </div>
  );
};

export default AddItemForm;
