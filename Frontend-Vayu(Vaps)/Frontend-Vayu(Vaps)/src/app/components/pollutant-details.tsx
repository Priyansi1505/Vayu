import { Wind, Droplets, Cloud, Flame, Zap, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Pollutants {
  pm25?: number;
  pm10?: number;
  no2?: number;
  so2?: number;
  co?: number;
  o3?: number;
}

export function PollutantDetails({ pollutants }: { pollutants?: Pollutants }) {
  const { t } = useTranslation();

  if (!pollutants) return null;

  const pollutantList = [
    { name: "PM2.5", value: pollutants.pm25, unit: "μg/m³", icon: Wind, color: "#A5C7E9", limit: 25 },
    { name: "PM10", value: pollutants.pm10, unit: "μg/m³", icon: Cloud, color: "#F4D7DA", limit: 50 },
    { name: "NO2", value: pollutants.no2, unit: "ppb", icon: Flame, color: "#FFE66D", limit: 40 },
    { name: "SO2", value: pollutants.so2, unit: "ppb", icon: Droplets, color: "#A8D5BA", limit: 20 },
    { name: "CO", value: pollutants.co, unit: "ppm", icon: Zap, color: "#FFA552", limit: 4 },
    { name: "O3", value: pollutants.o3, unit: "ppb", icon: Sun, color: "#A5C7E9", limit: 70 },
  ];

  return (
    <section className="relative py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-semibold text-center mb-12 text-[#333333] dark:text-white">
          {t("pollutantDetails")}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
          {pollutantList.map((p, i) => {
            if (p.value === undefined) return null;

            const Icon = p.icon;
            const percentage = (p.value / p.limit) * 100;

            return (
              <div
                key={i}
                className="backdrop-blur-[15px] bg-[#FFFBEB]/30 border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${p.color}40` }}
                >
                  <Icon className="w-8 h-8" style={{ color: p.color }} />
                </div>

                <h3 className="text-center text-lg font-semibold mb-2 text-[#333333] dark:text-white">
                  {p.name}
                </h3>

                <div className="text-center mb-3">
                  <span className="text-2xl font-bold text-[#333333] dark:text-white">
                    {p.value}
                  </span>
                  <span className="text-sm ml-1 text-[#333333]/70 dark:text-white/70">
                    {p.unit}
                  </span>
                </div>

                <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: p.color,
                    }}
                  />
                </div>

                <div className="text-xs text-center mt-2 text-[#333333]/60 dark:text-white/60">
                  {t("limit")}: {p.limit} {p.unit}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}