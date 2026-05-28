# VAYU — Air Quality Intelligence Platform

> Breathing intelligence into every Indian home. Real-time AQI, ML forecasts, and health insights.

---

## Project Title and Brief Description

**VAYU** is a full-stack, AI-powered Air Quality Index (AQI) monitoring web application designed for Indian cities. It provides real-time air quality data, machine learning-based 72-hour AQI predictions, interactive pollution heatmaps, health tips, live news, and multi-language support — all in a modern glassmorphism UI.

The platform empowers users to:
- Monitor live AQI of any Indian city or their GPS location
- Predict future air quality using an LSTM neural network
- Understand pollutant breakdowns (PM2.5, PM10, NO2, SO2, CO, O3)
- Access health advice and air quality news in 22 Indian languages

---

## Technology Stack and Tools Used

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | Core UI framework |
| Vite | Fast build tool and dev server |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Animations and transitions |
| Recharts | AQI trend graphs |
| Leaflet.js | Interactive AQI heatmap |
| react-i18next | 22-language internationalization |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Server runtime |
| Express.js | REST API framework |
| Axios | HTTP client for external APIs |
| JWT | User authentication |
| dotenv | Environment variable management |
| In-memory Cache | Reduce API calls, improve speed |

### Machine Learning
| Technology | Purpose |
|---|---|
| Python | ML runtime |
| NumPy | LSTM model implementation |
| Flask | ML microservice API |
| Open-Meteo API | Historical forecast data for training |

### External APIs
| API | Purpose |
|---|---|
| WAQI API | Live AQI from monitoring stations |
| OpenWeather Geocoding | City search and coordinates |
| GNews API | Live air quality news |
| YouTube Data API | Health tip videos |
| MyMemory API | NLP translation for 22 languages |

### Tools
| Tool | Purpose |
|---|---|
| VS Code | Code editor |
| Figma | UI/UX design |
| Git + GitHub | Version control |
| Postman | API testing |

---

## Features and Functionalities Implemented

### 1. Live AQI Dashboard
- Real-time AQI fetched from WAQI API using hardcoded city coordinates for accuracy
- Dynamic background color changes based on AQI level
- Shows AQI number, status (Good/Moderate/Unhealthy etc.), temperature, and weather condition

### 2. ML-Powered 72-Hour Prediction
- LSTM (Long Short-Term Memory) neural network trained on historical AQI patterns
- Predicts AQI for next 72 hours (3 days)
- Displayed as interactive area chart with daily labels

### 3. AQI Trend Graph
- Today mode: hourly AQI forecast with current hour reference line
- 3-Days mode: ML predictions with day-wise breakdown
- Insights panel showing best time, worst time, and improving/worsening trend

### 4. Interactive AQI Heatmap
- Leaflet.js map with OpenStreetMap tiles
- Color-coded circles for each monitoring station in ±1.5° radius
- Animated pulsing marker for current location
- AQI legend with color key

### 5. City Air Quality Belts
- Auto-scrolling cards for Best Air Quality cities (left to right)
- Auto-scrolling cards for Needs Attention cities (right to left)
- Live AQI badge on each card
- Click to view city AQI popup

### 6. Detailed Pollutant Breakdown
- PM2.5, PM10, NO2, SO2, CO, O3 with values and units
- Progress bars showing proximity to safe limits
- Temperature, humidity, and wind speed display

### 7. Live News Ticker
- GNews API fetches latest air quality news
- Auto-scrolling vertical ticker (bottom to top)
- Click any news card to open full article modal
- Live badge indicator

### 8. Health Tips with Videos
- 6 health tips with icons and descriptions
- YouTube API fetches relevant video guides
- Click any tip to watch video

### 9. 22 Language Support
- Full UI translated via react-i18next
- Dynamic content (news titles, city names) translated via MyMemory NLP API
- Batch translation with caching to avoid rate limits
- Auto-detects script (Hindi, Bengali, Tamil etc.) from search input
- RTL support for Urdu and Arabic

### 10. My Location (Hyperlocal AQI)
- GPS-based location detection
- Fetches AQI from nearest monitoring station
- Shows station name and "Current Location" label
- Graph works for GPS coordinates too

### 11. Smart City Search
- Google-style autocomplete with India-first results
- OpenWeather Geocoding API with local fallback list
- Keyboard navigation (arrow keys, Enter, Escape)
- Auto language detection from typed script

### 12. Dark/Light Mode
- Toggle between themes
- Persists across the session

### 13. User Authentication
- JWT-based login and signup
- Protected profile route
- Token stored in localStorage

### 14. AQI Importance Section
- Educational content about AQI
- Why it matters for health

### 15. FAQs Section
- Frequently asked questions about air quality

---

## Installation / Execution Steps to Run the Project

### Prerequisites
- Node.js v18 or higher
- Python 3.8 or higher
- npm (comes with Node.js)

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/vayu.git
cd vayu
```

---

### Step 2: Setup Environment Variables

Navigate to the backend folder and create a `.env` file:

```
C:\Users\dwarika\OneDrive\Desktop\minproject\Vayu-Backend\Vayu-Backend\.env
```

Add the following content:

```env
PORT=5000
WAQI_API_KEY=your_waqi_api_key
OPENWEATHER_API_KEY=your_openweather_api_key
GNEWS_API_KEY=your_gnews_api_key
YOUTUBE_API_KEY=your_youtube_api_key
JWT_SECRET=your_jwt_secret_key
```

> Get free API keys from:
> - WAQI: https://aqicn.org/data-platform/token/
> - OpenWeather: https://openweathermap.org/api
> - GNews: https://gnews.io/
> - YouTube: https://console.cloud.google.com/

---

### Step 3: Start the Backend Server

```bash
npm install
node src/index.js
```

You should see:
```
🚀 Server running on port 5000
✅ Cities cached: 30 cities
```

---

### Step 4: Start the Frontend

Open a **new terminal** and run:

```bash
npm install
npm run dev
```

You should see:
```
VITE ready in 1911 ms
➜ Local: http://localhost:5173/
```

---

### Step 5: Open in Browser

Visit: **http://localhost:5173**

---

### Step 6: Start ML Service (for predictions)

Open a **third terminal**:

```bash
cd ml
pip install numpy flask
python app.py
```

---

## 🔗 Backend API Routes

| Method | Route | Description |
|---|---|---|
| GET | `/api/aqi/:city` | Live AQI for city |
| GET | `/api/aqi/coords?lat=&lon=` | Hyperlocal AQI |
| GET | `/api/aqi/forecast/:city` | Hourly forecast |
| GET | `/api/ml/predict` | LSTM prediction |
| GET | `/api/aqi-cities` | Best/worst cities |
| GET | `/api/news?city=` | Live news |
| GET | `/api/youtube` | Health videos |
| GET | `/api/cities/search?q=` | City autocomplete |
| GET | `/api/map?lat=&lon=` | Heatmap data |
| POST | `/api/translate` | Text translation |
| POST | `/api/translate/batch` | Batch translation |
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |

---

## 🎨 AQI Color Standards

| AQI Range | Category | Color |
|---|---|---|
| 0 – 50 | Good | 🟢 Green |
| 51 – 100 | Moderate | 🟡 Yellow |
| 101 – 150 | Unhealthy for Sensitive Groups | 🟠 Orange |
| 151 – 200 | Unhealthy | 🔴 Red |
| 201 – 300 | Very Unhealthy | 🟣 Purple |
| 301+ | Hazardous | ⚫ Dark Red |

---

##  Team

Built with ❤️ by **Team VAYU** — Mini Project 2025-26

---

## 🙏 Acknowledgements

- [WAQI](https://waqi.info/) — Air quality data
- [OpenStreetMap](https://www.openstreetmap.org/) — Map tiles  
- [Open-Meteo](https://open-meteo.com/) — Weather forecast data
- [MyMemory](https://mymemory.translated.net/) — Translation API
- [GNews](https://gnews.io/) — News API

---

> *"Clean air is not a luxury — it's a right."* 🌬️
