// City Selector Module - Shared across all pages
const CITY_KEY = 'vogil-selected-city';

const CITIES = {
  'rishon-lezion': { name: 'ראש העין', housing: 1850, pollution: 87, rental: 2100, airQuality: { pm25: 87, pm10: 142, badDays: 156, riskLevel: 68 } },
  'petah-tikva': { name: 'פתח תקווה', housing: 2450, pollution: 85, rental: 2800, airQuality: { pm25: 85, pm10: 138, badDays: 152, riskLevel: 65 } },
  'caesarea': { name: 'קיסריה', housing: 3200, pollution: 81, rental: 3500, airQuality: { pm25: 81, pm10: 138, badDays: 148, riskLevel: 62 } },
  'haifa': { name: 'חיפה', housing: 1400, pollution: 72, rental: 2400, airQuality: { pm25: 72, pm10: 125, badDays: 115, riskLevel: 52 } },
  'holon': { name: 'חולון', housing: 2100, pollution: 70, rental: 2500, airQuality: { pm25: 70, pm10: 120, badDays: 112, riskLevel: 50 } },
  'bat-yam': { name: 'בת ים', housing: 1950, pollution: 68, rental: 2400, airQuality: { pm25: 68, pm10: 118, badDays: 108, riskLevel: 48 } },
  'givatayim': { name: 'גבעתיים', housing: 2650, pollution: 66, rental: 3000, airQuality: { pm25: 66, pm10: 112, badDays: 105, riskLevel: 46 } },
  'jerusalem': { name: 'ירושלים', housing: 2100, pollution: 62, rental: 2300, airQuality: { pm25: 62, pm10: 105, badDays: 98, riskLevel: 42 } },
  'bnei-brak': { name: 'בני ברק', housing: 2200, pollution: 61, rental: 2600, airQuality: { pm25: 61, pm10: 102, badDays: 95, riskLevel: 40 } },
  'netanya': { name: 'נתניה', housing: 1520, pollution: 54, rental: 2050, airQuality: { pm25: 54, pm10: 92, badDays: 78, riskLevel: 35 } },
  'tel-aviv': { name: 'תל אביב', housing: 2800, pollution: 58, rental: 3200, airQuality: { pm25: 58, pm10: 95, badDays: 82, riskLevel: 35 } },
  'kfar-saba': { name: 'כפר סבא', housing: 2080, pollution: 52, rental: 2500, airQuality: { pm25: 52, pm10: 85, badDays: 72, riskLevel: 30 } },
  'ramat-gan': { name: 'רמת גן', housing: 2300, pollution: 52, rental: 2600, airQuality: { pm25: 52, pm10: 88, badDays: 75, riskLevel: 32 } },
  'givat-shmuel': { name: 'גבעת שמואל', housing: 2350, pollution: 56, rental: 2700, airQuality: { pm25: 56, pm10: 93, badDays: 80, riskLevel: 38 } },
  'lod': { name: 'לוד', housing: 1450, pollution: 59, rental: 2000, airQuality: { pm25: 59, pm10: 98, badDays: 85, riskLevel: 36 } },
  'ramla': { name: 'רמלה', housing: 1380, pollution: 61, rental: 1950, airQuality: { pm25: 61, pm10: 100, badDays: 92, riskLevel: 39 } },
  'modiin': { name: 'מודיעין', housing: 2600, pollution: 49, rental: 2950, airQuality: { pm25: 49, pm10: 84, badDays: 70, riskLevel: 27 } },
  'ashkelon': { name: 'אשקלון', housing: 980, pollution: 50, rental: 1520, airQuality: { pm25: 50, pm10: 86, badDays: 72, riskLevel: 28 } },
  'ashdod': { name: 'אשדוד', housing: 1100, pollution: 48, rental: 1650, airQuality: { pm25: 48, pm10: 82, badDays: 68, riskLevel: 26 } },
  'beersheba': { name: 'באר שבע', housing: 1200, pollution: 45, rental: 1800, airQuality: { pm25: 45, pm10: 78, badDays: 65, riskLevel: 28 } },
  'nahariya': { name: 'נהריה', housing: 1650, pollution: 55, rental: 2100, airQuality: { pm25: 55, pm10: 91, badDays: 79, riskLevel: 34 } },
  'afula': { name: 'עפולה', housing: 1350, pollution: 51, rental: 1900, airQuality: { pm25: 51, pm10: 86, badDays: 73, riskLevel: 29 } },
  'safed': { name: 'צפת', housing: 1100, pollution: 42, rental: 1600, airQuality: { pm25: 42, pm10: 72, badDays: 58, riskLevel: 22 } },
  'tiberias': { name: 'טבריה', housing: 980, pollution: 46, rental: 1550, airQuality: { pm25: 46, pm10: 80, badDays: 66, riskLevel: 25 } },
  'eilat': { name: 'אילת', housing: 1850, pollution: 35, rental: 2200, airQuality: { pm25: 35, pm10: 62, badDays: 42, riskLevel: 15 } },
  'mitzpe-ramon': { name: 'מצפה רמון', housing: 950, pollution: 32, rental: 1400, airQuality: { pm25: 32, pm10: 58, badDays: 38, riskLevel: 12 } }
};

function initCitySelector() {
  const citySelector = document.getElementById('citySelector');
  if (!citySelector) return;

  // Load saved city or set default to Tel Aviv
  const savedCity = localStorage.getItem(CITY_KEY) || 'tel-aviv';
  citySelector.value = savedCity;

  // Save city when changed
  citySelector.addEventListener('change', (e) => {
    const selectedCity = e.target.value;
    localStorage.setItem(CITY_KEY, selectedCity);

    // Dispatch custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('cityChanged', { detail: { city: selectedCity } }));
  });
}

function getSelectedCity() {
  return localStorage.getItem(CITY_KEY) || 'tel-aviv';
}

function getCityData(cityId) {
  return CITIES[cityId] || null;
}

function formatCityComparison(cityId, otherCities = []) {
  const selectedData = getCityData(cityId);
  if (!selectedData) return null;

  return {
    selected: selectedData,
    comparison: otherCities.map(id => ({
      id,
      ...getCityData(id)
    }))
  };
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCitySelector);
} else {
  initCitySelector();
}
