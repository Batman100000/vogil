// Navigation Module - Consistent navigation across all pages
const CURRENT_PAGE_KEY = 'vogil-current-page';

const PAGES = [
  { id: 'home', path: '/', he: '🏠 דאשבורד', en: '🏠 Dashboard', emoji: '🏠' },
  { id: 'analytics', path: '/analytics.html', he: '📊 ניתוחים', en: '📊 Analytics', emoji: '📊' },
  { id: 'investment', path: '/investment-insights.html', he: '💰 השקעות', en: '💰 Investment', emoji: '💰' },
  { id: 'insights', path: '/insights-dashboard.html', he: '🔍 תובנות', en: '🔍 Insights', emoji: '🔍' },
  { id: 'graphs', path: '/graphs.html', he: '📈 גרפים', en: '📈 Graphs', emoji: '📈' },
  { id: 'air-quality', path: '/air-quality.html', he: '🌍 איכות אוויר', en: '🌍 Air Quality', emoji: '🌍' },
  { id: 'people-tech', path: '/people-tech.html', he: '👥 People & Tech', en: '👥 People & Tech', emoji: '👥' }
];

const CITIES = {
  'tel-aviv': { he: 'תל אביב', en: 'Tel Aviv' },
  'jerusalem': { he: 'ירושלים', en: 'Jerusalem' },
  'haifa': { he: 'חיפה', en: 'Haifa' },
  'beersheba': { he: 'באר שבע', en: 'Beersheba' },
  'rishon-lezion': { he: 'ראש העין', en: 'Rishon LeZion' },
  'ramat-gan': { he: 'רמת גן', en: 'Ramat Gan' },
  'netanya': { he: 'נתניה', en: 'Netanya' },
  'kfar-saba': { he: 'כפר סבא', en: 'Kfar Saba' },
  'ashdod': { he: 'אשדוד', en: 'Ashdod' },
  'ashkelon': { he: 'אשקלון', en: 'Ashkelon' }
};

function initNavigation() {
  const currentPage = getCurrentPage();

  // Update active breadcrumb items
  document.querySelectorAll('.breadcrumb-item').forEach(btn => {
    const pageId = btn.getAttribute('data-page');
    if (pageId === currentPage) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update old nav buttons if they exist
  document.querySelectorAll('.nav-btn').forEach(btn => {
    const href = btn.getAttribute('href');
    const pageId = PAGES.find(p => p.path === href)?.id;

    if (pageId === currentPage) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update city selectors if they exist
  const savedCity = localStorage.getItem('vogil-selected-city');

  const headerCitySelector = document.getElementById('headerCitySelector');
  if (headerCitySelector) {
    if (savedCity) {
      headerCitySelector.value = savedCity;
    }
    headerCitySelector.addEventListener('change', (e) => {
      localStorage.setItem('vogil-selected-city', e.target.value);
      window.dispatchEvent(new CustomEvent('cityChanged', { detail: { city: e.target.value } }));
    });
  }

  const citySelector = document.getElementById('citySelector');
  if (citySelector) {
    if (savedCity) {
      citySelector.value = savedCity;
    }
    citySelector.addEventListener('change', (e) => {
      localStorage.setItem('vogil-selected-city', e.target.value);
      window.dispatchEvent(new CustomEvent('cityChanged', { detail: { city: e.target.value } }));
    });
  }

  // Listen for city changes
  window.addEventListener('cityChanged', (e) => {
    console.log('City changed to:', e.detail.city);
  });
}

function getCurrentPage() {
  const path = window.location.pathname;
  if (path === '/' || path.includes('index.html')) return 'home';
  if (path.includes('analytics.html')) return 'analytics';
  if (path.includes('investment-insights.html')) return 'investment';
  if (path.includes('insights-dashboard.html')) return 'insights';
  if (path.includes('graphs.html')) return 'graphs';
  if (path.includes('air-quality.html')) return 'air-quality';
  if (path.includes('people-tech.html')) return 'people-tech';
  return 'home';
}

function getSelectedCity() {
  return localStorage.getItem('vogil-selected-city') || '';
}

function getCityName(cityId, lang = 'he') {
  return CITIES[cityId]?.[lang] || cityId;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavigation);
} else {
  initNavigation();
}
