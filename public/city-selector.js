// City Selector Module - Shared across all pages
const CITY_KEY = 'vogil-selected-city';

const CITIES = {
  'tel-aviv': { name: 'תל אביב', housing: 2800, pollution: 58, rental: 3200, airQuality: { pm25: 58, pm10: 95, badDays: 82, riskLevel: 35 } },
  'jerusalem': { name: 'ירושלים', housing: 2100, pollution: 62, rental: 2300, airQuality: { pm25: 62, pm10: 105, badDays: 98, riskLevel: 42 } },
  'haifa': { name: 'חיפה', housing: 1400, pollution: 72, rental: 2400, airQuality: { pm25: 72, pm10: 125, badDays: 115, riskLevel: 52 } },
  'beersheba': { name: 'באר שבע', housing: 1200, pollution: 45, rental: 1800, airQuality: { pm25: 45, pm10: 78, badDays: 65, riskLevel: 28 } },
  'rishon-lezion': { name: 'ראש העין', housing: 1850, pollution: 87, rental: 2100, airQuality: { pm25: 87, pm10: 142, badDays: 156, riskLevel: 68 } },
  'ramat-gan': { name: 'רמת גן', housing: 2300, pollution: 52, rental: 2600, airQuality: { pm25: 52, pm10: 88, badDays: 75, riskLevel: 32 } },
  'netanya': { name: 'נתניה', housing: 1520, pollution: 54, rental: 2050, airQuality: { pm25: 54, pm10: 92, badDays: 78, riskLevel: 35 } },
  'kfar-saba': { name: 'כפר סבא', housing: 2080, pollution: 52, rental: 2500, airQuality: { pm25: 52, pm10: 85, badDays: 72, riskLevel: 30 } },
  'ashdod': { name: 'אשדוד', housing: 1100, pollution: 48, rental: 1650, airQuality: { pm25: 48, pm10: 82, badDays: 68, riskLevel: 26 } },
  'ashkelon': { name: 'אשקלון', housing: 980, pollution: 50, rental: 1520, airQuality: { pm25: 50, pm10: 86, badDays: 72, riskLevel: 28 } }
};

function initCitySelector() {
  const citySelector = document.getElementById('citySelector');
  if (!citySelector) return;

  // Load saved city
  const savedCity = localStorage.getItem(CITY_KEY);
  if (savedCity) {
    citySelector.value = savedCity;
  }

  // Save city when changed
  citySelector.addEventListener('change', (e) => {
    const selectedCity = e.target.value;
    localStorage.setItem(CITY_KEY, selectedCity);

    // Dispatch custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('cityChanged', { detail: { city: selectedCity } }));
  });
}

function getSelectedCity() {
  return localStorage.getItem(CITY_KEY) || '';
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
