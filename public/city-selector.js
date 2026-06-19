// City Selector Module - Shared across all pages
const CITY_KEY = 'vogil-selected-city';

const CITIES = {
  'tel-aviv': { name: 'תל אביב', housing: 2800, pollution: 58, rental: 3200 },
  'jerusalem': { name: 'ירושלים', housing: 2100, pollution: 62, rental: 2300 },
  'haifa': { name: 'חיפה', housing: 1400, pollution: 72, rental: 2400 },
  'beersheba': { name: 'באר שבע', housing: 1200, pollution: 45, rental: 1800 },
  'rishon-lezion': { name: 'ראש העין', housing: 1850, pollution: 87, rental: 2100 },
  'ramat-gan': { name: 'רמת גן', housing: 2300, pollution: 52, rental: 2600 },
  'netanya': { name: 'נתניה', housing: 1520, pollution: 54, rental: 2050 },
  'kfar-saba': { name: 'כפר סבא', housing: 2080, pollution: 52, rental: 2500 },
  'ashdod': { name: 'אשדוד', housing: 1100, pollution: 48, rental: 1650 },
  'ashkelon': { name: 'אשקלון', housing: 980, pollution: 50, rental: 1520 }
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
