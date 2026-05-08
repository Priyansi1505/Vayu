import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { useNLPTranslation } from "@/hooks/useNLPTranslation";
import { Shield, Wind, Home, Activity, Droplets, AlertCircle, Heart, Brain, Sun, Coffee, X } from "lucide-react";

const allTipsPool = [
  { title: "Wear a Mask",            key: "tipWearMask",      icon: Shield,      color: "#A5C7E9", searchQuery: "how to wear N95 mask air pollution protection",              category: "AQI"    },
  { title: "Check AQI Regularly",    key: "tipCheckAQI",      icon: AlertCircle, color: "#FF6B6B", searchQuery: "how to check AQI air quality index India explained",          category: "AQI"    },
  { title: "Avoid Outdoor Activity", key: "tipAvoidOutdoor",  icon: Wind,        color: "#F4D7DA", searchQuery: "avoid outdoor exercise air pollution health tips",            category: "AQI"    },
  { title: "Use Air Purifiers",      key: "tipAirPurifier",   icon: Home,        color: "#A8D5BA", searchQuery: "HEPA air purifier indoor air quality benefits",               category: "AQI"    },
  { title: "Stay Hydrated",          key: "tipHydrated",      icon: Droplets,    color: "#FFE66D", searchQuery: "drink water benefits health detox daily hydration",           category: "Health" },
  { title: "Monitor Your Health",    key: "tipMonitorHealth", icon: Activity,    color: "#FFA552", searchQuery: "monitor health symptoms respiratory breathing problems",       category: "Health" },
  { title: "Heart Health",           key: "tipHeartHealth",   icon: Heart,       color: "#FF6B6B", searchQuery: "heart health tips daily exercise cardio benefits",            category: "Health" },
  { title: "Mental Wellness",        key: "tipMentalWellness",icon: Brain,       color: "#9B59B6", searchQuery: "mental health wellness tips meditation stress relief",         category: "Health" },
  { title: "Vitamin D and Sunlight", key: "tipVitaminD",      icon: Sun,         color: "#F39C12", searchQuery: "vitamin D sunlight benefits health immunity",                 category: "Health" },
  { title: "Healthy Diet",           key: "tipDiet",          icon: Coffee,      color: "#27AE60", searchQuery: "healthy diet tips nutrition immunity boost foods",            category: "Health" },
];
const generalHealthAdvice = [
  "Don't ignore your posture — sit straight and take stretch breaks every hour",
  "Protect your gut — regular meal timing, fiber, and curd help digestion",
  "Do preventive checkups — early detection saves lives",
  "Sleep 7-8 hours daily — poor sleep weakens your immune system",
  "Walk 10,000 steps daily — even small walks add up significantly",
  "Limit screen time — give your eyes 20 seconds break every 20 minutes",
  "Eat a rainbow — colorful vegetables provide different essential nutrients",
  "Never skip breakfast — it kickstarts your metabolism for the day",
  "Wash hands regularly — it prevents 80% of common infections",
  "Practice gratitude daily — it reduces stress and improves mental health",
  "Avoid sitting for more than 45 minutes — stand and move regularly",
  "Include nuts and seeds in your diet — they are rich in healthy fats",
  "Laugh more — laughter boosts immunity and reduces stress hormones",
  "Deep breathing for 5 minutes daily improves lung capacity significantly",
  "Cut down on sugar — excess sugar causes inflammation and energy crashes",
  "Green tea has antioxidants that protect cells from pollution damage",
  "Avoid eating late at night — your body needs rest not digestion",
  "Cold water bath in morning boosts circulation and alertness",
  "Read for 30 minutes daily — it reduces stress by up to 68%",
  "Spend time in nature — even 20 minutes reduces cortisol levels",
  "Limit caffeine after 2 PM — it disrupts sleep quality",
  "Indoor plants like aloe vera and spider plant naturally purify air",
  "Tulsi leaves boost immunity — chew 2-3 fresh leaves daily",
  "Avoid eating while watching TV — mindful eating improves digestion",
  "Music therapy reduces anxiety — listen to calming music daily",
  "Yoga for 20 minutes daily improves flexibility and reduces stress",
  "Vitamin B12 deficiency causes fatigue — include dairy and eggs in diet",
  "Iron rich foods like spinach and dates prevent anemia",
  "Stay socially connected — loneliness is as harmful as smoking",
  "Honey and ginger tea soothes throat irritation from pollution",
  "Avoid antibiotics without prescription — they destroy gut bacteria",
  "Cold pressed oils like coconut and mustard are healthier for cooking",
  "Massage your feet before sleeping — it improves blood circulation",
  "Drink copper vessel water — it has natural antimicrobial properties",
  "Limit alcohol — it dehydrates body and weakens immune response",
  "Eat slowly and chew well — digestion starts in the mouth",
  "Regular eye checkups prevent vision problems from worsening",
  "Omega 3 fatty acids in fish reduce inflammation caused by pollution",
  "Take stairs instead of lift — small habits make big health differences",
  "Track your water intake — most people are chronically dehydrated",
  "Jaggery after meals helps remove pollution particles from lungs",
  "Avoid plastic containers for hot food — chemicals leach into food",
  "Check your blood pressure monthly — hypertension is a silent killer",
  "Probiotic foods like yogurt and kimchi boost gut and immune health",
  "Sunflower seeds are rich in Vitamin E — protect lungs from pollution",
  "Avoid tight clothing — it restricts blood flow and breathing",
  "Spend 10 minutes in silence daily — it recharges your mental energy",
  "Amla is rich in Vitamin C — eat daily for immunity boost",
  "N95 masks block 95% of airborne particles — always carry one",
  "AQI above 150 means everyone should reduce outdoor exposure",
];

const timeLabelKeys = ["morningTips", "afternoonTips", "eveningTips", "nightTips"] as const;

function getCurrentAdviceIndex() {
  const hour = new Date().getHours();
  const minute = new Date().getMinutes();
  return (hour * 3 + Math.floor(minute / 20)) % generalHealthAdvice.length;
}

function getCurrentTimeLabelKey(): string {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "morningTips";
  if (hour >= 12 && hour < 18) return "afternoonTips";
  if (hour >= 18 && hour < 24) return "eveningTips";
  return "nightTips";
}

export function HealthTips() {
  const { t, i18n } = useTranslation();
  const { translateBatch } = useNLPTranslation();

  const [selectedTip, setSelectedTip] = useState<any | null>(null);
  const [timeLabelKey] = useState(getCurrentTimeLabelKey());
  const [adviceIndex] = useState(getCurrentAdviceIndex());
  const [tips] = useState(allTipsPool.slice(0, 6));
  const [videoIds, setVideoIds] = useState<Record<string, string>>({});
  const [videoLoading, setVideoLoading] = useState(false);

  // Translated dynamic content
  const [translatedTitles, setTranslatedTitles] = useState<string[]>(tips.map(t => t.title));
 const [translatedAdvice, setTranslatedAdvice] = useState<string>(generalHealthAdvice[adviceIndex]);
  const [translatedUpdates, setTranslatedUpdates] = useState("Updates every 20 minutes");
  const [isTranslatingTips, setIsTranslatingTips] = useState(false);
  // Translate tip titles + advice banner when language changes
  useEffect(() => {
    const lang = i18n.language;
    if (lang === "en") {
      setTranslatedTitles(tips.map(tip => tip.title));
      setTranslatedAdvice(generalHealthAdvice[adviceIndex]);
      setTranslatedUpdates("Updates every 20 minutes");
      return;
    }

    // ✅ Show English immediately
    setTranslatedTitles(tips.map(tip => tip.title));
    setTranslatedAdvice(generalHealthAdvice[adviceIndex]);
    setTranslatedUpdates("Updates every 20 minutes");

    const doTranslate = async () => {
      setIsTranslatingTips(true);
      try {
        const titlesToTranslate = tips.map(tip => tip.title);
        const [translatedT, translatedA] = await Promise.all([
          translateBatch(titlesToTranslate, lang),
          translateBatch([generalHealthAdvice[adviceIndex], "Updates every 20 minutes"], lang),
        ]);
        setTranslatedTitles(translatedT);
        setTranslatedAdvice(translatedA[0]);
        setTranslatedUpdates(translatedA[1]);
      } finally {
        setIsTranslatingTips(false);
      }
    };

    doTranslate();
  }, [i18n.language]);

  // Fetch YouTube video when tip is selected
  useEffect(() => {
    if (!selectedTip) return;
    const fetchVideo = async () => {
      if (videoIds[selectedTip.title]) return;
      setVideoLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/youtube?q=${encodeURIComponent(selectedTip.searchQuery)}`
        );
        const data = await res.json();
        if (data.videoId) {
          setVideoIds(prev => ({ ...prev, [selectedTip.title]: data.videoId }));
        }
      } catch (err) {
        console.error("VIDEO FETCH ERROR:", err);
      } finally {
        setVideoLoading(false);
      }
    };
    fetchVideo();
  }, [selectedTip]);

  const currentVideoId = selectedTip ? videoIds[selectedTip.title] : null;

  return (
    <section className="relative py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-semibold text-center mb-2 text-[#333333] dark:text-white">
          {t("healthTips")}
        </h2>

        <div className="flex justify-center gap-3 mb-4 flex-wrap">
          <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-white/30 border border-white/20 backdrop-blur-sm text-[#333333] dark:text-white">
            {t(timeLabelKey)}
          </span>
          <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-[#A5C7E9]/30 border border-[#A5C7E9]/30 text-[#333333] dark:text-white">
            AQI + {t("healthTips")}
          </span>
        </div>

        {/* ROTATING ADVICE BANNER */}
        <div className="max-w-3xl mx-auto mb-8 p-4 rounded-2xl bg-gradient-to-r from-[#A5C7E9]/20 to-[#F4D7DA]/20 border border-white/20 text-center">
          <p className="text-sm font-medium text-[#333333] dark:text-white">
            💡 {translatedAdvice}
          </p>
          <p className="text-xs text-gray-400 mt-1">{translatedUpdates}</p>
        </div>

        <p className="text-center text-[#333333]/70 dark:text-white/70 mb-12">
          {t("clickTip")}
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tips.map((tip, index) => {
            const Icon = tip.icon;
            return (
              <motion.div
                key={`${tip.title}-${index}`}
                whileHover={{ scale: 1.05, y: -5 }}
                onClick={() => setSelectedTip(tip)}
                className="cursor-pointer backdrop-blur-[15px] bg-white/10 border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${tip.color}40` }}
                  >
                    <Icon className="w-8 h-8" style={{ color: tip.color }} />
                  </div>
                  <span
                    className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{ backgroundColor: `${tip.color}30`, color: tip.color }}
                  >
                    {tip.category}
                  </span>
                </div>

                <h3 className="text-xl font-semibold mb-2 text-[#333333] dark:text-white">
                  {t(tip.key)}
                </h3>

                <p className="text-sm text-[#333333]/70 dark:text-white/70 mb-4">
                  {translatedAdvice}
                </p>

                <div className="text-sm font-medium" style={{ color: tip.color }}>
                  {t("watchVideo")}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* VIDEO MODAL */}
      <AnimatePresence>
        {selectedTip && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedTip(null)}
          >
            <div className="absolute inset-0 backdrop-blur-[30px] bg-black/50" />
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="relative backdrop-blur-[15px] bg-white/20 border border-white/30 rounded-3xl p-6 max-w-4xl w-full shadow-2xl"
            >
              <button
                onClick={() => setSelectedTip(null)}
                className="absolute -top-4 -right-4 p-3 rounded-full bg-white/90 hover:bg-white transition-all shadow-lg z-10"
              >
                <X className="w-6 h-6 text-[#333333]" />
              </button>

              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-[#333333] dark:text-white flex items-center gap-3">
                    {selectedTip.icon && (
                      <selectedTip.icon className="w-8 h-8" style={{ color: selectedTip.color }} />
                    )}
                   {t(selectedTip.key)}
                  </h3>
                  <p className="text-[#333333]/70 dark:text-white/70 mt-1">
                    {translatedAdvice}
                  </p>
                </div>
                <span
                  className="text-xs px-3 py-1 rounded-full font-medium flex-shrink-0"
                  style={{ backgroundColor: `${selectedTip.color}30`, color: selectedTip.color }}
                >
                  {selectedTip.category}
                </span>
              </div>

              <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden">
                {videoLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : currentVideoId ? (
                  <iframe
                    key={currentVideoId}
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&rel=0&modestbranding=1`}
                    title={selectedTip.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gray-900">
                    <p className="text-white">{t("videoUnavailable")}</p>
                    <button
                      onClick={() =>
                        window.open(
                          `https://www.youtube.com/results?search_query=${encodeURIComponent(selectedTip.searchQuery)}`,
                          "_blank"
                        )
                      }
                      className="px-6 py-3 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition-all"
                    >
                      {t("searchYouTube")}
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 p-4 rounded-xl bg-[#FFFBEB]/40 border border-white/20">
                <h4 className="font-semibold mb-2 text-[#333333] dark:text-white">
                  {t("quickTips")}:
                </h4>
                <ul className="space-y-1 text-sm text-[#333333]/70 dark:text-white/70">
                  <li>{t("tip1")}</li>
                  <li>{t("tip2")}</li>
                  <li>{t("tip3")}</li>
                </ul>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}