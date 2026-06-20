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
  const headerCitySelector = document.getElementById('headerCitySelector');
  const refreshBtn = document.getElementById('refreshDataBtn');

  const citySelectors = [
    headerCitySelector,
    document.getElementById('citySelector')
  ];

  citySelectors.forEach(selector => {
    if (selector) {
      // Set default to Tel Aviv if no saved city
      const cityToSet = savedCity || 'tel-aviv';
      selector.value = cityToSet;
      // Show refresh button if city is already selected (default or saved)
      if (refreshBtn && headerCitySelector === selector) {
        refreshBtn.style.display = 'block';
      }
      selector.addEventListener('change', (e) => {
        localStorage.setItem('vogil-selected-city', e.target.value);

        // Show/hide refresh button based on city selection
        if (refreshBtn && selector === headerCitySelector) {
          refreshBtn.style.display = e.target.value ? 'block' : 'none';
        }

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
  return localStorage.getItem('vogil-selected-city') || 'tel-aviv';
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

// Global Refresh Data Function
function refreshDataByCity() {
  const selectedCity = document.getElementById('headerCitySelector')?.value || localStorage.getItem('vogil-selected-city');
  const refreshBtn = document.getElementById('refreshDataBtn');
  const lastUpdatedCity = localStorage.getItem('vogil-last-updated-city');
  const lastUpdateTime = localStorage.getItem('vogil-last-update-time');

  if (!selectedCity) {
    console.warn('⚠️ בחר עיר קודם לכן');
    alert('אנא בחר עיר קודם לכן');
    return;
  }

  // Check if city is already updated
  if (lastUpdatedCity === selectedCity && lastUpdateTime) {
    const timeSinceUpdate = Date.now() - parseInt(lastUpdateTime);
    const minutesSinceUpdate = Math.floor(timeSinceUpdate / 60000);
    console.log('✅ העיר כבר עודכנה לפני', minutesSinceUpdate, 'דקות');

    // Show "already updated" message
    const citySelector = document.getElementById('headerCitySelector');
    const cityLabel = citySelector ? citySelector.selectedOptions[0].text : selectedCity;
    showUpdateMessage('עודכן', `הנתונים של ${cityLabel} כבר עודכנו`, 'success');
    return;
  }

  // Need to refresh - show progress bar
  showProgressBar();

  if (refreshBtn) {
    refreshBtn.classList.add('loading');
    refreshBtn.disabled = true;
  }

  console.log('🔄 מתחיל רענון נתונים עבור:', selectedCity);

  // Simulate data refresh with progress
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += Math.random() * 30;
    if (progress > 95) progress = 95;
    updateProgressBar(progress);
  }, 200);

  // Simulate API call (in production, this would actually fetch from API)
  setTimeout(() => {
    clearInterval(progressInterval);
    updateProgressBar(100);

    console.log('📊 רענון נתונים עבור:', selectedCity);

    // Save update info
    localStorage.setItem('vogil-last-updated-city', selectedCity);
    localStorage.setItem('vogil-last-update-time', Date.now());

    // Dispatch custom event for pages to listen to
    window.dispatchEvent(new CustomEvent('refreshData', {
      detail: { city: selectedCity, timestamp: new Date(), isRefresh: true }
    }));

    // Remove loading animation
    if (refreshBtn) {
      refreshBtn.classList.remove('loading');
      refreshBtn.disabled = false;
    }

    // Hide progress bar and show success message
    hideProgressBar();
    const citySelector = document.getElementById('headerCitySelector');
    const cityLabel = citySelector ? citySelector.selectedOptions[0].text : selectedCity;
    showUpdateMessage('✅ סיום', `הנתונים של ${cityLabel} עודכנו בהצלחה`, 'success');

    console.log('✅ נתונים רוענו בהצלחה עבור:', cityLabel);
  }, 2000);
}

// Progress Bar Functions
function showProgressBar() {
  let progressContainer = document.getElementById('progressContainer');
  if (!progressContainer) {
    progressContainer = document.createElement('div');
    progressContainer.id = 'progressContainer';
    progressContainer.style.cssText = `
      position: fixed;
      top: 56px;
      left: 0;
      right: 0;
      height: 4px;
      background: #f0f0f0;
      z-index: 997;
      border-bottom: 1px solid #ddd;
    `;
    document.body.appendChild(progressContainer);
  }

  let progressBar = document.getElementById('progressBar');
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.id = 'progressBar';
    progressBar.style.cssText = `
      height: 100%;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      width: 0%;
      transition: width 0.3s ease;
    `;
    progressContainer.appendChild(progressBar);
  }

  progressContainer.style.display = 'block';
}

function updateProgressBar(percent) {
  const progressBar = document.getElementById('progressBar');
  if (progressBar) {
    progressBar.style.width = percent + '%';
  }
}

function hideProgressBar() {
  setTimeout(() => {
    const progressContainer = document.getElementById('progressContainer');
    if (progressContainer) {
      progressContainer.style.display = 'none';
    }
  }, 500);
}

function showUpdateMessage(title, message, type = 'info') {
  let messageBox = document.getElementById('updateMessageBox');
  if (!messageBox) {
    messageBox = document.createElement('div');
    messageBox.id = 'updateMessageBox';
    messageBox.style.cssText = `
      position: fixed;
      top: 70px;
      right: 20px;
      padding: 15px 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      max-width: 300px;
      animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(messageBox);
  }

  const bgColor = type === 'success' ? '#e8f5e9' : '#e3f2fd';
  const borderColor = type === 'success' ? '#4caf50' : '#2196f3';
  const textColor = type === 'success' ? '#2e7d32' : '#1565c0';

  messageBox.style.background = bgColor;
  messageBox.style.borderLeft = '4px solid ' + borderColor;
  messageBox.innerHTML = `
    <div style="color: ${textColor}; font-weight: 600; margin-bottom: 5px;">${title}</div>
    <div style="color: ${textColor}; font-size: 0.9em;">${message}</div>
  `;
  messageBox.style.display = 'block';

  // Auto-hide after 3 seconds
  setTimeout(() => {
    messageBox.style.display = 'none';
  }, 3000);
}

// Add CSS animation for message box
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);

// Initialize refresh button visibility on load
window.addEventListener('load', () => {
  const citySelector = document.getElementById('headerCitySelector');
  const refreshBtn = document.getElementById('refreshDataBtn');

  if (citySelector && refreshBtn) {
    citySelector.addEventListener('change', () => {
      if (citySelector.value) {
        refreshBtn.style.display = 'block';
      } else {
        refreshBtn.style.display = 'none';
      }
    });

    // Check if city already selected on load
    const savedCity = localStorage.getItem('vogil-selected-city');
    if (savedCity && citySelector.value) {
      refreshBtn.style.display = 'block';
    }
  }
});
