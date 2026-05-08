import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface Props {
  city: string;
  mlData: any;
  currentAQI?: number;
}

export function AQIGraph({ city, mlData, currentAQI }: Props) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"today" | "3days">("today");
const [data, setData] = useState<any[]>([]);
const [activeIndex, setActiveIndex] = useState(0);
const [graphLoading, setGraphLoading] = useState(false);

  // ================= FETCH DATA =================
  const fetchData = async (m: string) => {
  setGraphLoading(true);
  try {
    if (m === "today") {
      // ✅ works for both city name AND coords
      const res = await fetch(
        `http://localhost:5000/api/aqi/forecast/${encodeURIComponent(city)}?range=today`
      );
      const json = await res.json();
      const forecast = json.forecast || [];
      const currentHour = new Date().getHours();

      const hourly = Array.from({ length: 24 }, (_, i) => {
        const ampm = i >= 12 ? "PM" : "AM";
        const formattedHour = i % 12 || 12;
        return {
          time: `${formattedHour} ${ampm}`,
          aqi: i === currentHour && currentAQI && currentAQI > 0
            ? currentAQI
            : Number(forecast[i]?.aqi) || 0,
        };
      });
      setData(hourly);
    }

    else if (m === "3days") {
      // ✅ use mlData if available, else fetch from open-meteo directly
      let predictions: number[] = [];

      if (mlData?.predictions) {
        predictions = mlData.predictions.slice(0, 72);
      } else {
        // coords mode — fetch from open-meteo directly
        const isCoords = city.match(/^(-?\d+\.?\d*),(-?\d+\.?\d*)$/);
        if (isCoords) {
          const lat = isCoords[1];
          const lon = isCoords[2];
          const res = await fetch(
            `http://localhost:5000/api/aqi/forecast/${encodeURIComponent(city)}?range=3days`
          );
          const json = await res.json();
          predictions = (json.forecast || []).slice(0, 72).map((f: any) => f.aqi);
        }
      }

      if (!predictions.length) { setData([]); return; }

      const now = new Date();
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const hourlyData: any[] = [];

      predictions.forEach((aqi: number, index: number) => {
        const d = new Date();
        d.setDate(now.getDate() + Math.floor(index / 24) + 1);
        d.setHours(index % 24);
        const hour = index % 24;
        const ampm = hour >= 12 ? "PM" : "AM";
        const formattedHour = hour % 12 || 12;
        const dayName = dayNames[d.getDay()];
        const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
        const label = hour === 0 ? `${dayName} ${dateStr}` : "";

        hourlyData.push({
          date: label,
          time: `${formattedHour} ${ampm}`,
          aqi: Math.max(0, Math.round(aqi)),
        });
      });
      setData(hourlyData);
    }
  } catch (err) {
    console.error(err);
    setData([]);
  } finally {
    setGraphLoading(false);
  }
};
  // ================= EFFECT =================
  useEffect(() => {
  const isCoords = city.match(/^(-?\d+\.?\d*),(-?\d+\.?\d*)$/);
  if (mode === "3days" && !mlData && !isCoords) return;

  setData([]);

  // small timeout to let UI update first
  const timer = setTimeout(() => {
    fetchData(mode);
  }, 50);

  return () => clearTimeout(timer);
}, [city, mode, mlData]);
  // ================= CURRENT HOUR =================
  useEffect(() => {
    if (mode !== "today" || data.length === 0) return;

    const currentHour = new Date().getHours();
    if (currentHour < data.length) {
      setActiveIndex(currentHour);
    }
  }, [data, mode, mlData, currentAQI]);

  // ================= INSIGHTS =================
  const generateInsights = (data: any[]) => {
    if (!data.length) return null;

    let best = data[0];
    let worst = data[0];

    data.forEach((d) => {
      if (d.aqi < best.aqi) best = d;
      if (d.aqi > worst.aqi) worst = d;
    });

    const trendKey =
      data[data.length - 1].aqi < data[0].aqi ? "improving" : "worsening";
    const trend = trendKey;

    return { best, worst, trend };
  };

  const insights = generateInsights(data);

  // ================= UI =================
  return (
    <section className="py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl p-6 shadow-md">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-semibold">{t("aqiTrends")}</h2>

            <div className="flex gap-2">
              <button
          
  onClick={() => setMode("today")}
  className={`px-4 py-1 rounded-full text-sm ${
    mode === "today" ? "bg-black text-white" : "bg-gray-200"
  }`}
>
  {t("today")}
</button>

<button
  onClick={() => setMode("3days")}
  className={`px-4 py-1 rounded-full text-sm ${
    mode === "3days" ? "bg-black text-white" : "bg-gray-200"
  }`}
>
  {t("threeDays")}
</button>
            </div>
          </div>

          {/* INSIGHTS */}
          {insights && (
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">

              <div className="bg-green-100/40 rounded-2xl p-5">
                <p className="text-sm text-gray-600">{t("bestTime")}</p>
                <p className="font-semibold text-green-600 text-lg">
  {mode === "3days"
    ? insights.best.date
    : insights.best.time}
</p>
                <p className="text-xs">AQI: {Math.round(insights.best.aqi)}</p>
              </div>

              <div className="bg-red-100/40 rounded-2xl p-5">
               <p className="text-sm text-gray-600">{t("avoidOutdoor")}</p>
                <p className="font-semibold text-red-500 text-lg">
  {mode === "3days"
    ? insights.worst.date
    : insights.worst.time}
</p>
                <p className="text-xs">AQI: {Math.round(insights.worst.aqi)}</p>
              </div>

              <div className="bg-blue-100/40 rounded-2xl p-5">
                <p className="text-sm text-gray-600">{t("trend")}</p>
                <p className="font-semibold text-blue-600 text-lg">
                  {t(insights.trend)} {insights.trend === "improving" ? "📉" : "📈"}
                </p>
              </div>

            </div>
          )}

          {/* GRAPH */}
         <div
  className="rounded-2xl p-4"
  style={{
    background:
      "linear-gradient(to bottom, rgba(239,68,68,0.15), rgba(34,197,94,0.15))",
  }}
>
           {graphLoading || data.length === 0 ? (
  <div className="flex flex-col items-center justify-center h-[350px] gap-3">
    <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
   <p className="text-gray-400 text-sm">
  {mode === "3days" ? t("runningML") : t("loadingForecast")}
</p>
  </div>
) : (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart key={city + mode + data.length} data={data}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
<XAxis
  dataKey={mode === "3days" ? "date" : "time"}
  interval={0}
/>

                  <YAxis
  label={{ value: "AQI", angle: -90, position: "insideLeft", offset: 10 }}
  domain={([dataMin, dataMax]) => {
    const min = Math.max(0, dataMin - 20);
    const max = dataMax + 20;
    return [min, max];
  }}
/>
                  

                  {mode === "today" && data.length > 0 && (
  <ReferenceLine
    x={data[activeIndex]?.time}
    stroke="red"
    strokeDasharray="4 4"
    label={{
      value: `AQI ${currentAQI && currentAQI > 0 ? Math.round(currentAQI) : ""}`,
      position: "top",
      fill: "red",
      fontSize: 12,
      fontWeight: "bold",
    }}
  />
)}

<Tooltip
  formatter={(value: any) => [`AQI: ${Math.round(value)}`, ""]}
/>

                  <Area
                    type="monotone"
                    dataKey="aqi"
                    stroke="#6366f1"
                    fillOpacity={0.2}
                  />

                  <Line
                    type="monotone"
                    dataKey="aqi"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* CURRENT AQI */}
          {mode === "today" && (
  <div className="mt-4 flex items-center justify-center gap-3">
    <div className="flex items-center gap-2">
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
      </span>
      <p className="text-lg font-semibold">
  {t("currentAQI")}:{" "}
        <span className="text-red-500">
          {currentAQI && currentAQI > 0
            ? Math.round(currentAQI)
            : data[activeIndex]
            ? Math.round(data[activeIndex].aqi)
            : "--"}
        </span>
      </p>
    </div>
   <p className="text-sm text-gray-500">
     {t("rightNowIn")}{" "}
     {city.match(/^-?\d+\.?\d*,-?\d+\.?\d*$/) ? "My Location" : city}
   </p>
  </div>
)}

        </div>
      </div>
    </section>
  );
}