import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";

export function AQIImportance() {
  const { t } = useTranslation();

  const aqiLevels = [
    { range: "0-50",   level: t("good"),               color: "#A8D5BA", description: t("aqiGoodDesc") },
    { range: "51-100", level: t("moderate"),            color: "#FFE66D", description: t("aqiModerateDesc") },
    { range: "101-150",level: t("unhealthySensitive"),  color: "#FFA552", description: t("aqiSensitiveDesc") },
    { range: "151-200",level: t("unhealthy"),           color: "#FF6B6B", description: t("aqiUnhealthyDesc") },
    { range: "201-300",level: t("veryUnhealthy"),       color: "#C44569", description: t("aqiVeryUnhealthyDesc") },
    { range: "301+",   level: t("hazardous"),           color: "#8B3A62", description: t("aqiHazardousDesc") },
  ];

  return (
    <section className="relative py-12 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Importance Text */}
        <div className="backdrop-blur-[15px] bg-white/10 border border-white/20 rounded-3xl p-12 mb-12 shadow-2xl">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#A5C7E9] to-[#F4D7DA] flex items-center justify-center flex-shrink-0">
              <Info className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-semibold mb-4 text-[#333333] dark:text-white">
                {t("whyAQI")}
              </h2>
              <p className="text-lg text-[#333333]/80 dark:text-white/80 leading-relaxed mb-4">
                {t("aqiDesc")}
              </p>
              <p className="text-lg text-[#333333]/80 dark:text-white/80 leading-relaxed">
                {t("aqiHealthWarning")}
              </p>
            </div>
          </div>
        </div>

        {/* AQI Chart */}
        <div className="backdrop-blur-[15px] bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          <h3 className="text-3xl font-semibold mb-8 text-center text-[#333333] dark:text-white">
            {t("understandingAQI")}
          </h3>

          <div className="space-y-4">
            {aqiLevels.map((level, index) => (
              <div
                key={index}
                className="backdrop-blur-sm bg-white/20 border border-white/20 rounded-2xl p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-6 flex-wrap">
                  <div
                    className="px-6 py-3 rounded-xl font-bold text-white text-xl min-w-[120px] text-center"
                    style={{ backgroundColor: level.color }}
                  >
                    {level.range}
                  </div>

                  <div className="flex-1 min-w-[200px]">
                    <div className="text-xl font-semibold mb-1 text-[#333333] dark:text-white">
                      {level.level}
                    </div>
                    <div className="text-sm text-[#333333]/70 dark:text-white/70">
                      {level.description}
                    </div>
                  </div>

                  <div className="w-32 h-3 rounded-full overflow-hidden flex-shrink-0">
                    <div className="h-full w-full" style={{ backgroundColor: level.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Key Takeaways */}
          <div className="mt-8 p-6 rounded-2xl bg-[#FFFBEB]/40 border border-white/20">
            <h4 className="font-semibold mb-3 text-[#333333] dark:text-white">
              {t("keyTakeaways")}:
            </h4>
            <ul className="grid md:grid-cols-2 gap-3 text-sm text-[#333333]/80 dark:text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-[#A5C7E9] text-lg">•</span>
                {t("takeaway1")}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#A5C7E9] text-lg">•</span>
                {t("takeaway2")}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#F4D7DA] text-lg">•</span>
                {t("takeaway3")}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#F4D7DA] text-lg">•</span>
                {t("takeaway4")}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}