// src/app/components/city-belts.tsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MapPin } from "lucide-react";
import { useNLPTranslation } from "../../hooks/useNLPTranslation";

const cityTranslations: Record<string, Record<string, string>> = {
  hi: {
    Delhi: "दिल्ली", Mumbai: "मुंबई", Bangalore: "बेंगलुरु",
    Chennai: "चेन्नई", Kolkata: "कोलकाता", Hyderabad: "हैदराबाद",
    Pune: "पुणे", Ahmedabad: "अहमदाबाद", Jaipur: "जयपुर",
    Lucknow: "लखनऊ", Chandigarh: "चंडीगढ़", Bhopal: "भोपाल",
    Indore: "इंदौर", Patna: "पटना", Kanpur: "कानपुर",
    Nagpur: "नागपुर", Surat: "सूरत", Varanasi: "वाराणसी",
    Agra: "आगरा", Amritsar: "अमृतसर", Jodhpur: "जोधपुर",
    Kota: "कोटा", Guwahati: "गुवाहाटी", Raipur: "रायपुर",
    Ranchi: "रांची", Coimbatore: "कोयंबटूर", Visakhapatnam: "विशाखापट्टनम",
    Bhubaneswar: "भुवनेश्वर", Dehradun: "देहरादून", Noida: "नोएडा",
  },
  bn: {
    Delhi: "দিল্লি", Mumbai: "মুম্বই", Bangalore: "বেঙ্গালুরু",
    Chennai: "চেন্নাই", Kolkata: "কলকাতা", Hyderabad: "হায়দরাবাদ",
    Pune: "পুণে", Ahmedabad: "আহমেদাবাদ", Jaipur: "জয়পুর",
    Lucknow: "লখনৌ", Chandigarh: "চণ্ডীগড়", Bhopal: "ভোপাল",
    Indore: "ইন্দোর", Patna: "পাটনা", Kanpur: "কানপুর",
    Nagpur: "নাগপুর", Surat: "সুরাট", Varanasi: "বারাণসী",
    Agra: "আগ্রা", Amritsar: "অমৃতসর", Jodhpur: "যোধপুর",
    Kota: "কোটা", Guwahati: "গুয়াহাটি", Raipur: "রায়পুর",
    Ranchi: "রাঁচি", Coimbatore: "কোয়েম্বাটুর", Visakhapatnam: "বিশাখাপত্তনম",
    Bhubaneswar: "ভুবনেশ্বর", Dehradun: "দেরাদুন", Noida: "নয়ডা",
  },
  gu: {
    Delhi: "દિલ્હી", Mumbai: "મુંબઈ", Bangalore: "બેંગ્લોર",
    Chennai: "ચેન્નઈ", Kolkata: "કોલકાતા", Hyderabad: "હૈદરાબાદ",
    Pune: "પુણે", Ahmedabad: "અમદાવાદ", Jaipur: "જયપુર",
    Lucknow: "લખનૌ", Indore: "ઇન્દોર", Patna: "પટના",
    Surat: "સુરત", Varanasi: "વારાણસી", Raipur: "રાયપુર",
    Noida: "નોઇડા",
  },
  te: {
    Delhi: "ఢిల్లీ", Mumbai: "ముంబై", Bangalore: "బెంగళూరు",
    Chennai: "చెన్నై", Kolkata: "కోల్‌కతా", Hyderabad: "హైదరాబాద్",
    Pune: "పుణే", Ahmedabad: "అహ్మదాబాద్", Jaipur: "జైపూర్",
    Visakhapatnam: "విశాఖపట్నం", Raipur: "రాయ్‌పూర్",
  },
  ta: {
    Delhi: "டெல்லி", Mumbai: "மும்பை", Bangalore: "பெங்களூரு",
    Chennai: "சென்னை", Kolkata: "கொல்கத்தா", Hyderabad: "ஹைதராபாத்",
    Coimbatore: "கோயம்புத்தூர்", Madurai: "மதுரை",
  },
};
interface CityData {
  city: string;
  aqi: number;
  country?: string;
}

const scrollStyle = `
  @keyframes scrollLeft {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes scrollRight {
    0% { transform: translateX(-50%); }
    100% { transform: translateX(0); }
  }
  .auto-scroll-left {
    animation: scrollLeft 25s linear infinite;
  }
  .auto-scroll-right {
    animation: scrollRight 25s linear infinite;
  }
`;

export function CityBelts() {
  const { t, i18n } = useTranslation();
  const { translateBatch } = useNLPTranslation();
  const [cities, setCities] = useState<CityData[]>([]);
  const [translatedCities, setTranslatedCities] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);

  // FETCH CITIES
  useEffect(() => {
    fetch("http://localhost:5000/api/aqi-cities")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCities(data);
          setTranslatedCities(data);
        }
      })
      .catch(err => console.error("CITIES ERROR:", err))
      .finally(() => setLoading(false));
  }, []);

  // TRANSLATE ON LANGUAGE CHANGE
  useEffect(() => {
  if (!cities.length) return;
  const lang = i18n.language;
  if (lang === "en" || !cityTranslations[lang]) {
    setTranslatedCities(cities);
    return;
  }
  const translated = cities.map((c) => ({
    ...c,
    city: cityTranslations[lang][c.city] || c.city,
  }));
  setTranslatedCities(translated);
}, [i18n.language, cities]);// eslint-disable-line react-hooks/exhaustive-deps

  const getAQIColor = (value: number) => {
    if (value <= 50) return "#A8D5BA";
    if (value <= 100) return "#FFE66D";
    if (value <= 150) return "#FFA552";
    if (value <= 200) return "#FF6B6B";
    if (value <= 300) return "#C44569";
    return "#8B3A62";
  };

  const getAQIStatus = (value: number) => {
    if (value <= 50) return "Excellent";
    if (value <= 100) return "Good";
    if (value <= 150) return "Moderate";
    if (value <= 200) return "Moderate to Unhealthy";
    if (value <= 300) return "Unhealthy";
    return "Very Unhealthy";
  };

  const sorted = [...translatedCities].sort((a, b) => a.aqi - b.aqi);
  const best = sorted.slice(0, 8);
  const worst = sorted.slice(-8).reverse();

  const CityCard = ({ item }: { item: CityData }) => (
    <div
      onClick={() => setSelectedCity(item)}
      className="flex-shrink-0 bg-white rounded-2xl px-6 py-5 flex items-center gap-5 shadow-sm border border-gray-100 min-w-[260px] cursor-pointer hover:shadow-md transition-shadow"
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
        style={{ backgroundColor: getAQIColor(item.aqi) }}
      >
        {item.aqi}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <p className="font-bold text-[#333333] text-lg capitalize">{item.city}</p>
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-600 font-medium">Live</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
          <MapPin className="w-3.5 h-3.5" />
          <span>{item.country || "India"}</span>
        </div>
        <p className="text-sm text-gray-400 mt-1">
          AQI Status:{" "}
          <span style={{ color: getAQIColor(item.aqi) }}>
            {getAQIStatus(item.aqi)}
          </span>
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <section className="py-16 px-6">
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-[#A5C7E9] border-t-transparent rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-6">
      <style>{scrollStyle}</style>
      <div className="max-w-7xl mx-auto">

        {/* BEST AIR QUALITY */}
        <div className="mb-10">
          <h3 className="text-xl font-bold text-[#333333] mb-4">
            {t("bestAirQuality") || "Best Air Quality"} 🌿
          </h3>
          <div className="overflow-hidden">
            <div className="auto-scroll-left flex gap-4 w-max">
              {[...best, ...best].map((item, index) => (
                <CityCard key={index} item={item} />
              ))}
            </div>
          </div>
        </div>

        {/* NEEDS ATTENTION */}
        <div>
          <h3 className="text-xl font-bold text-[#333333] mb-4">
            {t("needsAttention") || "Needs Attention"} ⚠️
          </h3>
          <div className="overflow-hidden">
            <div className="auto-scroll-right flex gap-4 w-max">
              {[...worst, ...worst].map((item, index) => (
                <CityCard key={index} item={item} />
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* AQI POPUP */}
      {selectedCity && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setSelectedCity(null)}
        >
          <div
            className="bg-white rounded-3xl p-8 shadow-2xl min-w-[280px] text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4"
              style={{ backgroundColor: getAQIColor(selectedCity.aqi) }}
            >
              {selectedCity.aqi}
            </div>
            <h3 className="text-2xl font-bold text-[#333333] capitalize mb-1">
              {selectedCity.city}
            </h3>
            <div className="flex items-center justify-center gap-1 text-gray-400 mb-3">
              <MapPin className="w-4 h-4" />
              <span>{selectedCity.country || "India"}</span>
            </div>
            <div
              className="text-lg font-semibold px-4 py-2 rounded-full inline-block"
              style={{
                backgroundColor: getAQIColor(selectedCity.aqi) + "33",
                color: getAQIColor(selectedCity.aqi),
              }}
            >
              {getAQIStatus(selectedCity.aqi)}
            </div>
            <p className="text-gray-400 text-sm mt-4">Click outside to close</p>
          </div>
        </div>
      )}
    </section>
  );
}