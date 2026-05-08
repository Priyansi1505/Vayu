
import "../i18n";
import { useTranslation } from "react-i18next";

import { useState, useEffect } from "react";
import { getMLPrediction } from "../services/api";

import { Navigation } from "./components/navigation";
import { HeroAQI } from "./components/hero-aqi";
import { PollutantDetails } from "./components/pollutant-details";
import { AQIGraph } from "./components/aqi-graph";
import { CityBelts } from "./components/city-belts";
import { HealthTips } from "./components/health-tips";
import { NewsSection } from "./components/news-section";
import { AQIImportance } from "./components/aqi-importance";
import { FAQs } from "./components/faqs";
import { Footer } from "./components/footer";
import { LoginModal } from "./components/login-modal";
import { SignupModal } from "./components/signup-modal";

const API_URL = "http://localhost:5000";

export default function App() {
const { t } = useTranslation();
  // 🔥 STATES
  const [mlData, setMlData] = useState<any>(null);
  const [aqiData, setAqiData] = useState<any>(null);
  const [city, setCity] = useState("delhi");

  const [loading, setLoading] = useState(false);
const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState("");

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  const [user, setUser] = useState<any>(null);

  // 🔥 ML FETCH
  const fetchML = async (cityName: string) => {
    try {
      const data = await getMLPrediction(cityName);
      console.log("ML DATA:", data);
      setMlData(data);
    } catch (err) {
      console.error("ML ERROR:", err);
      setMlData(null); // safety reset
    }
  };

  // 🔥 AQI + ML FETCH
  useEffect(() => {

    console.log("CITY VALUE:", city);

    let ignore = false;

    const fetchAQI = async () => {
      setLoading(true);
      setError("");
      try {
        let url = "";

        if (city.includes(",")) {
          const [lat, lon] = city.split(",");
          url = `${API_URL}/api/aqi/coords?lat=${lat}&lon=${lon}`;
        } else {
          url = `${API_URL}/api/aqi/${city}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (!ignore) {
          if (!res.ok) throw new Error(data.message || "Failed");
          setAqiData(data);
        }

      } catch (err: any) {
        if (!ignore) setError(err.message);
      } finally {
  if (!ignore) {
    setLoading(false);
    setInitialLoad(false);
  }
}
    };

    fetchAQI();

    // ✅ FINAL ML FIX
    if (!city.includes(",")) {
      const cleanCity = city.split(",")[0].toLowerCase();
      fetchML(cleanCity);
    } else {
      setMlData(null); // reset when coords used
    }

    return () => {
      ignore = true;
    };
  }, [city]);

  // 🔥 USER PROFILE
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/api/user/profile`, {
          headers: { Authorization: token },
        });

        const data = await res.json();
        if (res.ok) setUser(data.user);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen">
      <Navigation
        user={user}
        onLoginClick={() => setIsLoginOpen(true)}
        onSignupClick={() => setIsSignupOpen(true)}
        onCityChange={setCity}
      />

      <main className="pt-28">

        {/* ERROR */}
        {error && (
          <p className="text-red-400 text-center">{error}</p>
        )}

        {/* LOADING */}
        {initialLoad && loading ? (
  <div className="flex justify-center items-center h-[50vh]">
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 border-4 border-[#A5C7E9] border-t-transparent rounded-full animate-spin"></div>
      <p>{t("fetchingAirData")}</p>
    </div>
  </div>
) : (
  <div className="relative">
   <HeroAQI
  aqi={aqiData?.aqi ?? 0}
  city={aqiData?.city ?? city}
  searchedCity={city}
  lat={aqiData?.lat}
  lon={aqiData?.lon}
  temperature={aqiData?.temperature}
  humidity={aqiData?.humidity}
  wind={aqiData?.wind}
  weatherCondition={aqiData?.weatherCondition}
  pollutants={aqiData?.pollutants}
/>
    {!initialLoad && loading && (
      <div className="absolute inset-0 z-40 rounded-3xl bg-white/30 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white/90 rounded-full px-6 py-3 shadow-2xl flex items-center gap-3 border border-gray-100">
          <div className="w-4 h-4 border-2 border-[#A5C7E9] border-t-transparent rounded-full animate-spin"></div>
          <p>{t("updatingAirData")}</p>
        </div>
      </div>
    )}
  </div>
)}
{!initialLoad && loading && (
  <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40">
    <div className="bg-white/90 rounded-full px-6 py-3 shadow-2xl flex items-center gap-3 border border-gray-100">
      <div className="w-4 h-4 border-2 border-[#A5C7E9] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-700 text-sm font-medium">Updating air data...</p>
    </div>
  </div>
)}
        {/* 🔥 ML UI */}
       

        {/* POLLUTANTS */}
        <PollutantDetails
          pollutants={
            aqiData?.pollutants || {
              pm25: null,
              pm10: null,
              no2: null,
              so2: null,
              co: null,
              o3: null,
            }
          }
        />

        {/* GRAPH */}
       <AQIGraph 
  city={city} 
  mlData={mlData} 
  currentAQI={aqiData?.aqi ?? 0}
/>


        <CityBelts />
        <HealthTips />
        <NewsSection city={city} />
        <AQIImportance />
        <FAQs />
        <Footer />

      </main>

      {/* MODALS */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToSignup={() => {
          setIsLoginOpen(false);
          setIsSignupOpen(true);
        }}
      />

      <SignupModal
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onSwitchToLogin={() => {
          setIsSignupOpen(false);
          setIsLoginOpen(true);
        }}
      />

    </div>
  );
}

