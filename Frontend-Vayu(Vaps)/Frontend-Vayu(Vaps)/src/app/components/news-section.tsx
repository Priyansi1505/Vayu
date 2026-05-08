import { useTranslation } from "react-i18next";
import { useNLPTranslation } from "@/hooks/useNLPTranslation";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, ExternalLink } from "lucide-react";

interface NewsItem {
  title: string;
  description?: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source?: { name: string };
}

export function NewsSection({ city = "delhi" }: { city?: string }) {
  const { t, i18n } = useTranslation();
  const { translateBatch } = useNLPTranslation();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [translatedNews, setTranslatedNews] = useState<NewsItem[]>([]);
  const [fetchError, setFetchError] = useState(false);
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/news?city=${encodeURIComponent(city)}`
        );
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setNews(data);
          setFetchError(false);
        }
      } catch (err) {
        console.error("NEWS FETCH ERROR:", err);
        setFetchError(true);
      }
    };
    fetchNews();
  }, [city]);

  useEffect(() => {
    if (!news.length) return;
    setTranslatedNews(news);
    const lang = i18n.language;
    if (lang === "en") return;
    const titles = news.slice(0, 10).map((a) => a.title);
    translateBatch(titles, lang).then((translated) => {
      setTranslatedNews(
        news.map((a, i) => ({ ...a, title: translated[i] ?? a.title }))
      );
    });
  }, [news, i18n.language]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
      });
    } catch {
      return dateStr;
    }
  };

  const loopItems =
    translatedNews.length > 0
      ? [...translatedNews, ...translatedNews, ...translatedNews]
      : [];

  return (
    <>
      <style>{`
        @keyframes scrollUp {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-33.333%); }
        }
        .ticker-track {
          animation: scrollUp 25s linear infinite;
        }
      `}</style>

      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#333333] dark:text-white">
              {t("latestNews")}
            </h2>
          </div>

          {fetchError ? (
            <div className="text-center py-12 text-[#333333]/40 dark:text-white/40">
              Unable to load news. Please check your backend connection.
            </div>
          ) : translatedNews.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-[#A5C7E9] border-t-transparent rounded-full animate-spin mr-3" />
              <p className="text-[#333333]/40 dark:text-white/40">{t("loading")}</p>
            </div>
          ) : (
            <div
              className="relative rounded-3xl overflow-hidden backdrop-blur-[15px] bg-white/10 border border-white/20 shadow-lg w-full"
              style={{ height: "520px" }}
            >
              {/* TOP FADE */}
              <div
                className="absolute top-0 left-0 right-0 h-14 z-10 pointer-events-none"
                style={{
                  background: "linear-gradient(to bottom, rgba(255,255,255,0.18), transparent)",
                }}
              />
              {/* BOTTOM FADE */}
              <div
                className="absolute bottom-0 left-0 right-0 h-14 z-10 pointer-events-none"
                style={{
                  background: "linear-gradient(to top, rgba(255,255,255,0.18), transparent)",
                }}
              />

              {/* LIVE BADGE */}
              <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-green-400 font-medium">{t("live")}</span>
              </div>

              {/* SCROLLING TRACK */}
              <div className="absolute inset-0 overflow-hidden px-6 pt-5">
                <div ref={tickerRef} className="ticker-track">
                  {loopItems.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedNews(item)}
                      className="flex items-start gap-3 p-3 rounded-2xl cursor-pointer hover:bg-white/20 transition-all border border-white/10 hover:border-white/30 bg-white/5 mb-4"
                    >
                      {item.urlToImage && (
                        <img
                          src={item.urlToImage}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span className="text-xs text-[#A5C7E9] font-medium truncate">
                            {item.source?.name || "News"}
                          </span>
                          <span className="text-xs text-[#333333]/40 dark:text-white/40 flex-shrink-0">
                            {formatDate(item.publishedAt)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-[#333333] dark:text-white line-clamp-2 leading-snug">
                          {item.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL */}
        <AnimatePresence>
          {selectedNews && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => setSelectedNews(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="backdrop-blur-[15px] bg-white/20 border border-white/30 rounded-3xl p-6 max-w-lg w-full shadow-2xl max-h-[80vh] overflow-y-auto"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs text-[#A5C7E9] font-medium">
                      {selectedNews.source?.name || "News"}
                    </span>
                    <p className="text-xs text-[#333333]/40 dark:text-white/40 mt-0.5">
                      {formatDate(selectedNews.publishedAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedNews(null)}
                    className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all"
                  >
                    <X className="w-4 h-4 text-[#333333] dark:text-white" />
                  </button>
                </div>

                {selectedNews.urlToImage && (
                  <img
                    src={selectedNews.urlToImage}
                    alt={selectedNews.title}
                    className="w-full h-48 object-cover rounded-2xl mb-4"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}

                <h3 className="text-lg font-bold text-[#333333] dark:text-white mb-3 leading-snug">
                  {selectedNews.title}
                </h3>

                {selectedNews.description && (
                  <p className="text-sm text-[#333333]/70 dark:text-white/70 leading-relaxed mb-5">
                    {selectedNews.description}
                  </p>
                )}

                <button
                  onClick={() =>
                    window.open(selectedNews.url, "_blank", "noopener,noreferrer")
                  }
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-[#A5C7E9] text-white font-medium hover:bg-[#7fb3d8] transition-all text-sm"
                >
                  {t("readFullArticle")}
                  <ExternalLink className="w-4 h-4" />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </>
  );
}