import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const CKAN_API = 'https://data.gov.il/api/3/action';

// Fetch from CKAN API
async function fetchFromCKAN(endpoint, params = {}) {
  return new Promise((resolve, reject) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${CKAN_API}/${endpoint}${queryString ? '?' + queryString : ''}`;

    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      timeout: 10000,
      headers: {
        'User-Agent': 'VOGIL-Dashboard'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.on('error', reject);
    req.end();
  });
}

// Routes
app.get('/api/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'Missing query' });

    const result = await fetchFromCKAN('package_search', { q: query, rows: 10 });
    res.json(result);
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/organizations', async (req, res) => {
  try {
    const result = await fetchFromCKAN('organization_list', { all_fields: true, limit: 200 });
    res.json(result);
  } catch (error) {
    console.error('Orgs error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tags', async (req, res) => {
  try {
    const result = await fetchFromCKAN('tag_list', { all_fields: true, limit: 200 });
    res.json(result);
  } catch (error) {
    console.error('Tags error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/datasets', async (req, res) => {
  try {
    const { org } = req.query;
    const result = await fetchFromCKAN('package_search', {
      fq: org ? `organization:${org}` : '',
      rows: 50
    });
    res.json(result);
  } catch (error) {
    console.error('Datasets error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/dataset/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await fetchFromCKAN('package_show', { id });
    res.json(result);
  } catch (error) {
    console.error('Dataset info error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/records', async (req, res) => {
  try {
    const { resourceId, query, limit = 50 } = req.query;
    if (!resourceId) return res.status(400).json({ error: 'Missing resourceId' });

    const result = await fetchFromCKAN('datastore_search', {
      resource_id: resourceId,
      q: query || '',
      limit: Math.min(parseInt(limit) || 50, 100)
    });
    res.json(result);
  } catch (error) {
    console.error('Records error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', apiReady: true });
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n✅ VOGIL Dashboard running on http://localhost:${PORT}\n`);
  console.log('Using direct CKAN API: ' + CKAN_API);
  console.log('\nAvailable endpoints:');
  console.log('  GET /api/search?query=...');
  console.log('  GET /api/organizations');
  console.log('  GET /api/datasets');
  console.log('  GET /api/tags');
  console.log('  GET /api/records?resourceId=...&query=...');
  console.log('  GET /api/health');
  console.log('\nPress Ctrl+C to stop\n');
});

process.on('SIGINT', () => {
  console.log('\n\nShutting down...');
  process.exit(0);
});
