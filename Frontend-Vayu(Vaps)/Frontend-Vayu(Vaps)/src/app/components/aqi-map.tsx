import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

interface AQIMapProps {
  lat?: number;
  lon?: number;
  city?: string;
}

export function AQIMap({ lat, lon, city }: AQIMapProps) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (!lat || !lon || !containerRef.current) return;

    const loadMap = async () => {
      const L = await import("leaflet");

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      if (containerRef.current) {
        (containerRef.current as any)._leaflet_id = undefined;
      }

      const map = L.map(containerRef.current!, {
        zoomControl: true,
      }).setView([lat, lon], 11);

      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      const pulsingIcon = L.divIcon({
        className: "",
        html: `
          <div style="position:relative;width:20px;height:20px;">
            <div style="position:absolute;width:20px;height:20px;background:rgba(239,68,68,0.4);border-radius:50%;animation:ping 1.5s ease-in-out infinite;"></div>
            <div style="position:absolute;top:4px;left:4px;width:12px;height:12px;background:#ef4444;border-radius:50%;border:2px solid white;"></div>
          </div>
          <style>@keyframes ping{0%{transform:scale(1);opacity:0.8}100%{transform:scale(2.5);opacity:0}}</style>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      L.marker([lat, lon], { icon: pulsingIcon })
        .addTo(map)
        .bindPopup(`📍 ${city || "Your Location"}`)
        .openPopup();

      const drawFallbackCircle = (aqi: number) => {
        const color =
          aqi <= 50  ? "#00e400" :
          aqi <= 100 ? "#ffff00" :
          aqi <= 150 ? "#ff7e00" :
          aqi <= 200 ? "#ff0000" :
          aqi <= 300 ? "#8f3f97" : "#7e0023";

        L.circle([lat, lon], {
          radius: 8000,
          color: "transparent",
          fillColor: color,
          fillOpacity: 0.35,
        }).addTo(map);
      };

      try {
        console.log("MAP FETCH:", lat, lon);
        const res = await fetch(`http://localhost:5000/api/map?lat=${lat}&lon=${lon}`);
        const data = await res.json();
        console.log("MAP DATA:", data);

        if (!Array.isArray(data) || data.length === 0) {
          try {
            const aqiRes = await fetch(`http://localhost:5000/api/aqi/coords?lat=${lat}&lon=${lon}`);
            const aqiData = await aqiRes.json();
            drawFallbackCircle(aqiData?.aqi ?? 80);
          } catch {
            drawFallbackCircle(80);
          }
          return;
        }

        data
          .filter((p: any) => p.aqi && !isNaN(p.aqi))
          .forEach((p: any) => {
            const aqi = Number(p.aqi);
            const color =
              aqi <= 50  ? "#00e400" :
              aqi <= 100 ? "#ffff00" :
              aqi <= 150 ? "#ff7e00" :
              aqi <= 200 ? "#ff0000" :
              aqi <= 300 ? "#8f3f97" : "#7e0023";

            L.circle([p.lat, p.lon], {
              radius: 5000,
              color: "transparent",
              fillColor: color,
              fillOpacity: 0.4,
            }).addTo(map);
          });

        const hasNearCenter = data.some(
          (p: any) => Math.abs(p.lat - lat) < 0.5 && Math.abs(p.lon - lon) < 0.5
        );
        if (!hasNearCenter) {
          drawFallbackCircle(data[0]?.aqi ?? 80);
        }

      } catch (err) {
        console.error("MAP ERROR:", err);
        drawFallbackCircle(80);
      }
    };

    loadMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lon, city]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full rounded-2xl" />

      <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-xl text-xs border border-gray-200">
        <p className="font-semibold mb-2 text-gray-700">{t("aqi")} Levels</p>
        {[
          { color: "#00e400", label: `0–50 ${t("good")}` },
          { color: "#ffff00", label: `51–100 ${t("moderate")}` },
          { color: "#ff7e00", label: `101–150 ${t("unhealthySensitive")}` },
          { color: "#ff0000", label: `151–200 ${t("unhealthy")}` },
          { color: "#8f3f97", label: `201–300 ${t("hazardous")}` },
          { color: "#7e0023", label: `301+ ${t("veryUnhealthy")}` },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2 mb-1">
            <span className="w-4 h-4 rounded-sm" style={{ backgroundColor: item.color }}></span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}