import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { Globe, ChevronDown } from 'lucide-react';

const LANGUAGES = [
  { code: 'tr', name: 'Türkçe', flag: '\ud83c\uddf9\ud83c\uddf7' },
  { code: 'en', name: 'English', flag: '\ud83c\uddec\ud83c\udde7' },
  { code: 'de', name: 'Deutsch', flag: '\ud83c\udde9\ud83c\uddea' },
  { code: 'ru', name: 'Русский', flag: '\ud83c\uddf7\ud83c\uddfa' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLangCode = i18n.language || 'tr';
  const currentLang = LANGUAGES.find((l) => l.code === currentLangCode) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code);
    
    // Replace URL language prefix
    const pathParts = location.pathname.split('/');
    if (['tr', 'en', 'de', 'ru'].includes(pathParts[1])) {
      pathParts[1] = code;
    } else {
      pathParts.unshift('', code);
    }
    const newPath = pathParts.join('/') || `/${code}`;
    navigate(newPath);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#6F7255]/20 bg-white/50 backdrop-blur-sm text-xs font-medium text-[#6F7255] hover:border-[#6F7255] transition-all"
        aria-label="Change language"
      >
        <span className="text-sm">{currentLang.flag}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 rounded-lg bg-white border border-[#E7E1D3] shadow-md py-1 z-50 animate-fadeIn">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors ${
                currentLangCode === lang.code
                  ? 'bg-[#6F7255] text-white font-medium'
                  : 'text-[#2B2B2B] hover:bg-[#F7F4EE]'
              }`}
            >
              <span className="text-sm">{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
