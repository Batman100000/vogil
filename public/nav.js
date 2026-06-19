// Navigation Module - Consistent navigation across all pages
const PAGES = [
  { id: 'home', path: '/', he: '🏠 דאשבורד', en: '🏠 Dashboard' },
  { id: 'analytics', path: '/analytics.html', he: '📊 ניתוחים', en: '📊 Analytics' },
  { id: 'investment', path: '/investment-insights.html', he: '💰 השקעות', en: '💰 Investment' },
  { id: 'insights', path: '/insights-dashboard.html', he: '🔍 תובנות', en: '🔍 Insights' },
  { id: 'graphs', path: '/graphs.html', he: '📈 גרפים', en: '📈 Graphs' },
  { id: 'air-quality', path: '/air-quality.html', he: '🌍 איכות אוויר', en: '🌍 Air Quality' },
  { id: 'people-tech', path: '/people-tech.html', he: '👥 אנשים וטכנו', en: '👥 People & Tech' }
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

function getCurrentPage() {
  const path = window.location.pathname;
  if (path === '/' || path === '' || path.includes('index.html')) return 'home';
  if (path.includes('analytics')) return 'analytics';
  if (path.includes('investment')) return 'investment';
  if (path.includes('insights-dashboard')) return 'insights';
  if (path.includes('graphs')) return 'graphs';
  if (path.includes('air-quality')) return 'air-quality';
  if (path.includes('people-tech')) return 'people-tech';
  return 'home';
}

function updateBreadcrumb() {
  const currentPage = getCurrentPage();
  const breadcrumbs = document.querySelectorAll('.breadcrumb-item');

  breadcrumbs.forEach(item => {
    const pageId = item.getAttribute('data-page');
    if (pageId === currentPage) {
      item.classList.add('active');
      // Scroll into view if needed
      item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      item.classList.remove('active');
    }
  });
}

function initNavigation() {
  // Update breadcrumb on page load
  updateBreadcrumb();

  // Handle city selector
  const savedCity = localStorage.getItem('vogil-selected-city');
  const citySelectors = [
    document.getElementById('headerCitySelector'),
    document.getElementById('citySelector')
  ];

  citySelectors.forEach(selector => {
    if (selector) {
      if (savedCity) {
        selector.value = savedCity;
      }
      selector.addEventListener('change', (e) => {
        localStorage.setItem('vogil-selected-city', e.target.value);
        window.dispatchEvent(new CustomEvent('cityChanged', { detail: { city: e.target.value } }));
      });
    }
  });

  // Listen for city changes
  window.addEventListener('cityChanged', (e) => {
    console.log('📍 City selected:', e.detail.city);
  });
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

// Re-init on page show (for back button)
window.addEventListener('pageshow', updateBreadcrumb);
