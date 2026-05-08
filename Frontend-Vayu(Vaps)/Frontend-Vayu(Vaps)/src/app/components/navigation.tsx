// src/app/components/navigation.tsx
import { Moon, Sun, MapPin, Globe } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

function detectLanguage(text: string): string | null {
  const patterns: Record<string, RegExp> = {
    hi: /[\u0900-\u097F]/,
    bn: /[\u0980-\u09FF]/,
    ta: /[\u0B80-\u0BFF]/,
    te: /[\u0C00-\u0C7F]/,
    gu: /[\u0A80-\u0AFF]/,
    pa: /[\u0A00-\u0A7F]/,
    kn: /[\u0C80-\u0CFF]/,
    ml: /[\u0D00-\u0D7F]/,
    ur: /[\u0600-\u06FF]/,
  };
  for (const [lang, regex] of Object.entries(patterns)) {
    if (regex.test(text)) return lang;
  }
  return null;
}

export function Navigation({ user, onLoginClick, onSignupClick, onCityChange }: any) {
  const { t, i18n } = useTranslation();
  const [isDark, setIsDark] = useState(false);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: "en",  label: "English",    flag: "🇬🇧" },
    { code: "hi",  label: "हिंदी",       flag: "🇮🇳" },
    { code: "mr",  label: "मराठी",       flag: "🇮🇳" },
    { code: "bn",  label: "বাংলা",       flag: "🇮🇳" },
    { code: "te",  label: "తెలుగు",      flag: "🇮🇳" },
    { code: "ta",  label: "தமிழ்",       flag: "🇮🇳" },
    { code: "gu",  label: "ગુજરાતી",     flag: "🇮🇳" },
    { code: "kn",  label: "ಕನ್ನಡ",       flag: "🇮🇳" },
    { code: "ml",  label: "മലയാളം",      flag: "🇮🇳" },
    { code: "pa",  label: "ਪੰਜਾਬੀ",      flag: "🇮🇳" },
    { code: "or",  label: "ଓଡ଼ିଆ",        flag: "🇮🇳" },
    { code: "as",  label: "অসমীয়া",      flag: "🇮🇳" },
    { code: "ur",  label: "اردو",         flag: "🇮🇳" },
    { code: "sa",  label: "संस्कृतम्",    flag: "🇮🇳" },
    { code: "ne",  label: "नेपाली",       flag: "🇮🇳" },
    { code: "kok", label: "कोंकणी",      flag: "🇮🇳" },
    { code: "sd",  label: "سنڌي",         flag: "🇮🇳" },
    { code: "mai", label: "मैथिली",       flag: "🇮🇳" },
    { code: "bho", label: "भोजपुरी",      flag: "🇮🇳" },
    { code: "raj", label: "राजस्थानी",    flag: "🇮🇳" },
    { code: "doi", label: "डोगरी",        flag: "🇮🇳" },
    { code: "mni", label: "মৈতৈলোন্",     flag: "🇮🇳" },
  ];

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const closeSuggestions = () => {
    setSearch("");
    setSuggestions([]);
    setHighlightIndex(-1);
  };

  const selectCity = (city: any) => {
    const rawName = city.city || city.name || "";
    const cleanName = rawName.split(",")[0].trim().toLowerCase();
    onCityChange(cleanName);
    closeSuggestions();
  };

  useEffect(() => {
    if (search.length < 2) { setSuggestions([]); return; }
    const controller = new AbortController();
    const fetchCities = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/cities/search?q=${encodeURIComponent(search)}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        if (Array.isArray(data)) { setSuggestions(data); setHighlightIndex(-1); }
      } catch (err: any) {
        if (err.name !== "AbortError") setSuggestions([]);
      }
    };
    fetchCities();
    return () => controller.abort();
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSuggestions([]); setHighlightIndex(-1);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) return;
    if (e.key === "ArrowDown") setHighlightIndex((p) => p < suggestions.length - 1 ? p + 1 : p);
    else if (e.key === "ArrowUp") setHighlightIndex((p) => p > 0 ? p - 1 : p);
    else if (e.key === "Enter" && highlightIndex >= 0) selectCity(suggestions[highlightIndex]);
    else if (e.key === "Escape") closeSuggestions();
  };

  const handleMyLocation = () => {
    if (!navigator.geolocation) return;
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { onCityChange(`${pos.coords.latitude},${pos.coords.longitude}`); setLoadingLocation(false); },
      () => setLoadingLocation(false)
    );
  };

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setShowLangMenu(false);
    document.documentElement.setAttribute("dir", ["ur", "sd", "ar"].includes(code) ? "rtl" : "ltr");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-10 pt-4 pb-2">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-sm px-6 py-3 flex items-center gap-6">

        {/* LOGO */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#A5C7E9] to-[#F4D7DA] flex items-center justify-center">
            <span className="text-white font-bold text-base">V</span>
          </div>
          <span className="text-2xl font-bold text-[#333333]">VAYU</span>
        </div>

        {/* SEARCH */}
        <div className="flex-1 relative" ref={dropdownRef}>
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-5 py-2.5">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                const value = e.target.value;
                setSearch(value);
                const detected = detectLanguage(value);
                if (detected && detected !== i18n.language) changeLanguage(detected);
              }}
              onKeyDown={handleKeyDown}
              placeholder={t("search") || "Search location..."}
              className="flex-1 bg-transparent text-base text-[#333333] placeholder-gray-400 outline-none"
            />
            <button
              onClick={handleMyLocation}
              disabled={loadingLocation}
              className="flex items-center gap-1 text-sm text-[#A5C7E9] hover:text-[#7fb3d8] transition-colors flex-shrink-0 font-medium"
            >
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">{t("myLocation") || "My Location"}</span>
            </button>
          </div>

          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xl z-50">
              {suggestions.map((city: any, idx: number) => (
                <button
                  key={city.id || idx}
                  onClick={() => selectCity(city)}
                  className={`w-full text-left px-5 py-3 transition-colors ${
                    idx === highlightIndex
                      ? "bg-[#A5C7E9]/20 text-[#333333]"
                      : "text-[#333333]/80 hover:bg-gray-50"
                  }`}
                >
                  <span className="font-medium text-base">{city.name || city.city}</span>
                  {city.state && <span className="text-sm ml-2 text-gray-400">{city.state}</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT CONTROLS */}
        <div className="flex items-center gap-3 flex-shrink-0">

          {/* LANGUAGE */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-2 px-2 py-2 hover:bg-gray-50 rounded-xl transition-all text-base text-[#333333] font-medium"
            >
              <Globe className="w-5 h-5" />
              <span className="font-semibold">{currentLang.code.toUpperCase()}</span>
            </button>
            {showLangMenu && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xl z-50 max-h-80 overflow-y-auto">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors ${
                      i18n.language === lang.code
                        ? "bg-[#A5C7E9]/20 font-semibold text-[#333333]"
                        : "text-[#333333]/80 hover:bg-gray-50"
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                    {i18n.language === lang.code && <span className="ml-auto text-[#A5C7E9]">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* THEME */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full hover:bg-gray-50 flex items-center justify-center transition-all"
          >
            {isDark ? <Sun className="w-5 h-5 text-[#333333]" /> : <Moon className="w-5 h-5 text-[#333333]" />}
          </button>

          {/* LOGIN */}
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-base text-[#333333] hidden sm:inline">
                {t("hello")}, {user.name?.split(" ")[0]}
              </span>
              <button
                onClick={() => { localStorage.removeItem("token"); window.location.reload(); }}
                className="text-sm px-4 py-2 rounded-xl hover:bg-gray-50 transition-all text-[#333333] font-medium"
              >
                {t("logout")}
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="text-base text-[#333333] font-medium hover:opacity-70 transition-all"
            >
              {t("login") || "Login"}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}