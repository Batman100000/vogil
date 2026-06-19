import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simple MCP Client
let mcp = null;
let mcpReady = false;

class MCPClient {
  constructor() {
    this.process = null;
    this.messageId = 0;
    this.callbacks = new Map();
  }

  async init() {
    console.log('Starting MCP server...');
    try {
      this.process = spawn('npx', ['-y', 'data-gov-il-mcp'], {
        cwd: __dirname,
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
        timeout: 30000
      });

      this.process.on('error', (err) => {
        console.error('MCP process error:', err.message);
      });

      this.process.stdout.on('data', (data) => {
        const text = data.toString().trim();
        if (text) {
          console.log('[MCP]', text);
          this.handleResponse(text);
        }
      });

      this.process.stderr.on('data', (data) => {
        console.error('[MCP Error]', data.toString().trim());
      });

      // Wait a bit for startup
      await new Promise(r => setTimeout(r, 1000));
      console.log('✅ MCP server initialized');
      mcpReady = true;
    } catch (error) {
      console.warn('⚠️ MCP init issue (will retry on requests):', error.message);
    }
  }

  async call(tool, args) {
    if (!this.process) {
      return { error: 'MCP not initialized' };
    }

    return new Promise((resolve, reject) => {
      const id = ++this.messageId;
      const timeout = setTimeout(() => {
        this.callbacks.delete(id);
        reject(new Error(`Timeout calling ${tool}`));
      }, 20000);

      this.callbacks.set(id, { resolve, reject, timeout });

      const request = {
        jsonrpc: '2.0',
        id,
        method: 'tools/call',
        params: { name: tool, arguments: args }
      };

      try {
        this.process.stdin.write(JSON.stringify(request) + '\n');
      } catch (e) {
        clearTimeout(timeout);
        this.callbacks.delete(id);
        reject(e);
      }
    });
  }

  handleResponse(data) {
    const lines = data.split('\n').filter(l => l.trim());
    lines.forEach(line => {
      try {
        const msg = JSON.parse(line);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject, timeout } = this.callbacks.get(msg.id);
          clearTimeout(timeout);
          this.callbacks.delete(msg.id);
          if (msg.error) {
            reject(new Error(msg.error.message || JSON.stringify(msg.error)));
          } else {
            resolve(msg.result);
          }
        }
      } catch (e) {
        // Parse error, ignore
      }
    });
  }

  stop() {
    if (this.process) {
      this.process.kill();
    }
  }
}

// Routes
app.get('/api/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'Missing query' });

    const result = await mcp.call('find_datasets', { query });
    res.json(result || { error: 'No result' });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/organizations', async (req, res) => {
  try {
    const result = await mcp.call('list_organizations', {});
    res.json(result || { error: 'No result' });
  } catch (error) {
    console.error('Orgs error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tags', async (req, res) => {
  try {
    const result = await mcp.call('list_available_tags', {});
    res.json(result || { error: 'No result' });
  } catch (error) {
    console.error('Tags error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/datasets', async (req, res) => {
  try {
    const { org } = req.query;
    const result = await mcp.call('list_all_datasets', { organization: org || '' });
    res.json(result || { error: 'No result' });
  } catch (error) {
    console.error('Datasets error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/dataset/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await mcp.call('get_dataset_info', { dataset_id: id });
    res.json(result || { error: 'No result' });
  } catch (error) {
    console.error('Dataset info error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/records', async (req, res) => {
  try {
    const { resourceId, query, limit = 50 } = req.query;
    const result = await mcp.call('search_records', {
      resource_id: resourceId,
      query: query || '',
      limit: Math.min(parseInt(limit) || 50, 100)
    });
    res.json(result || { error: 'No result' });
  } catch (error) {
    console.error('Records error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mcpReady });
});

// Start server
const PORT = process.env.PORT || 3000;

async function start() {
  try {
    // Initialize MCP client
    mcp = new MCPClient();
    await mcp.init();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n✅ VOGIL Dashboard running on http://localhost:${PORT}\n`);
      console.log('Available endpoints:');
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
      if (mcp) mcp.stop();
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start:', error);
    process.exit(1);
  }
}

start();
