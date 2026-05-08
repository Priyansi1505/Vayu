import { MapPin, Sun } from "lucide-react";
import { Wind } from "lucide-react";
import { AQIMap } from "./aqi-map";
import { useTranslation } from "react-i18next";

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
};

interface HeroAQIProps {
  searchedCity?: string;
  aqi?: number;
  city?: string;
  lat?: number;
  lon?: number;
  temperature?: number;
  humidity?: number;
  wind?: number;
  weatherCondition?: string;
  pollutants?: {
    pm25?: number;
    pm10?: number;
    o3?: number;
  };
}

export function HeroAQI({
  aqi,
  city,
  lat,
  lon,
  temperature,
  humidity,
  wind,
  weatherCondition,
  searchedCity,
  pollutants,
}: HeroAQIProps) {
  const { t, i18n } = useTranslation();

  const translateCity = (name?: string) => {
  if (!name) return t("unknown");
  const lang = i18n.language;
  const map = cityTranslations[lang];
  if (!map) return name;
  const key = Object.keys(map).find(
    (k) => k.toLowerCase() === name.toLowerCase()
  );
  return key ? map[key] : name;
};

  const getAQIColor = (value?: number) => {
    if (value === undefined) return "#9ca3af";
    if (value <= 50) return "#A8D5BA";
    if (value <= 100) return "#FFE66D";
    if (value <= 150) return "#FFA552";
    if (value <= 200) return "#FF6B6B";
    if (value <= 300) return "#C44569";
    return "#8B3A62";
  };

  const getAQIStatus = (value?: number) => {
    if (value === undefined) return t("unknown");
    if (value <= 50) return t("good");
    if (value <= 100) return t("moderate");
    if (value <= 150) return t("unhealthySensitive");
    if (value <= 200) return t("unhealthy");
    if (value <= 300) return t("veryUnhealthy");
    return t("hazardous");
  };

  const aqiColor = getAQIColor(aqi);
  const aqiStatus = getAQIStatus(aqi);

  return (
    <section className="relative pt-8 pb-12 px-6 overflow-hidden">

      {/* BACKGROUND */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: `linear-gradient(135deg, ${aqiColor}60 0%, #A5C7E960 50%, #F4D7DA60 100%)`,
        }}
      />

      <div className="relative max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">

         {/* LEFT CARD */}
<div className="backdrop-blur-[15px] bg-white/40 border border-white/30 rounded-3xl p-8 shadow-lg min-h-[500px] flex flex-col justify-between">

  {/* LOCATION */}
  <div className="flex items-center gap-2 mb-6">
    <div className="relative flex items-center justify-center">
      <span className="absolute w-6 h-6 rounded-full bg-red-400 opacity-30 animate-ping"></span>
      <MapPin className="w-5 h-5 text-red-500 relative z-10" />
    </div>
   <div className="flex flex-col">
 <div className="flex flex-col">
  <span className="text-xl font-semibold text-[#333333]">
    {translateCity(city?.split(",")[0])}
  </span>
  <span className="text-sm text-gray-400 capitalize mt-0.5">
    {searchedCity?.includes(",") ? "Current Location" : searchedCity}
  </span>
</div>
  <span className="text-sm text-gray-400 capitalize">
    {city?.split(",")[0] || ""}
  </span>
</div>
  </div>

  {/* AQI + WEATHER */}
  <div className="flex items-start justify-between mb-10 pr-4">

    {/* AQI */}
    <div>
      <div className="text-9xl font-bold mb-2" style={{ color: aqiColor }}>
        {aqi ?? "--"}
      </div>
      <div className="text-2xl mb-4 text-[#333333] font-semibold">{t("aqi")}</div>
      <div
        className="inline-block px-4 py-1.5 rounded-full text-white font-medium text-sm"
        style={{ backgroundColor: aqiColor }}
      >
        {aqiStatus}
      </div>
    </div>

    {/* WEATHER */}
    <div className="p-5 rounded-2xl bg-white/60 border border-white/30 flex flex-col items-center gap-3 min-w-[110px]">
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FFE66D] to-[#FFA552] flex items-center justify-center">
        <Sun className="w-7 h-7 text-white" />
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-[#333333]">
          {temperature !== undefined ? `${Math.round(temperature)}°C` : "--"}
        </div>
        <div className="text-sm text-[#555] mt-1 capitalize">
          {weatherCondition || "Sunny"}
        </div>
      </div>
    </div>
  </div>

  {/* POLLUTANTS */}
  <div className="grid grid-cols-3 gap-3">
    {[
      { name: "PM2.5", value: pollutants?.pm25 },
      { name: "PM10", value: pollutants?.pm10 },
      { name: "O3", value: pollutants?.o3 },
    ].map((item, i) => (
      <div
        key={i}
        className="flex flex-col items-center p-4 rounded-2xl bg-white/40 border border-white/30"
      >
        <div className="w-14 h-14 rounded-full bg-blue-100/60 flex items-center justify-center mb-2">
  <Wind className="w-7 h-7 text-blue-400" />
          <Wind className="w-5 h-5 text-blue-400" />
        </div>
        <div className="text-sm font-medium text-[#555]">{item.name}</div>
        <div className="text-base font-bold text-[#333] mt-1">
          {item.value !== undefined && item.value !== null ? item.value : "--"}
        </div>
      </div>
    ))}
  </div>
</div>

          {/* RIGHT CARD — MAP */}
          <div className="backdrop-blur-[15px] bg-white/40 border border-white/30 rounded-3xl p-4 shadow-lg">
            <p className="text-sm font-semibold text-[#555] mb-2 capitalize px-2">
              {city ? `${city} Region` : "Region"}
            </p>
            <div className="relative w-full h-[420px] rounded-2xl overflow-hidden">
              {lat !== undefined && lon !== undefined ? (
                <AQIMap lat={lat} lon={lon} city={city} />
              ) : (
                <div className="flex items-center justify-center h-full text-[#555]">
                  {t("loadingMap")}
                </div>
              )}
              <div className="absolute bottom-4 right-4 text-xs bg-black/30 text-white px-3 py-1 rounded-full">
                {t("realTimeAQI")}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}