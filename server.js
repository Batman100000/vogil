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

// MCP Client wrapper
class MCPClient {
  constructor() {
    this.process = null;
    this.messageId = 0;
    this.callbacks = new Map();
  }

  async init() {
    return new Promise((resolve, reject) => {
      this.process = spawn('npx', ['-y', 'data-gov-il-mcp'], {
        cwd: __dirname,
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });

      this.process.stdout.on('data', (data) => {
        this.handleResponse(data.toString());
      });

      this.process.stderr.on('data', (data) => {
        console.error('MCP stderr:', data.toString());
      });

      this.process.on('error', reject);

      setTimeout(() => resolve(), 1000);
    });
  }

  async call(tool, args) {
    return new Promise((resolve, reject) => {
      const id = ++this.messageId;
      const timeout = setTimeout(() => {
        this.callbacks.delete(id);
        reject(new Error(`Timeout calling ${tool}`));
      }, 30000);

      this.callbacks.set(id, { resolve, reject, timeout });

      const request = {
        jsonrpc: '2.0',
        id,
        method: 'tools/call',
        params: { name: tool, arguments: args }
      };

      this.process.stdin.write(JSON.stringify(request) + '\n');
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
          if (msg.error) reject(new Error(msg.error.message));
          else resolve(msg.result);
        }
      } catch (e) {
        // Parse error, ignore
      }
    });
  }

  stop() {
    if (this.process) this.process.kill();
  }
}

const mcp = new MCPClient();

// Routes
app.get('/api/search', async (req, res) => {
  try {
    const { query } = req.query;
    const result = await mcp.call('find_datasets', { query });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/organizations', async (req, res) => {
  try {
    const result = await mcp.call('list_organizations', {});
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tags', async (req, res) => {
  try {
    const result = await mcp.call('list_available_tags', {});
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/datasets', async (req, res) => {
  try {
    const { org } = req.query;
    const result = await mcp.call('list_all_datasets', { organization: org });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/dataset/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await mcp.call('get_dataset_info', { dataset_id: id });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/records', async (req, res) => {
  try {
    const { resourceId, query, limit = 50 } = req.query;
    const result = await mcp.call('search_records', {
      resource_id: resourceId,
      query,
      limit: parseInt(limit)
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await mcp.init();
    console.log('✅ MCP server initialized');

    app.listen(PORT, () => {
      console.log(`🚀 VOGIL Dashboard running on http://localhost:${PORT}`);
    });

    process.on('SIGINT', () => {
      console.log('\nShutting down...');
      mcp.stop();
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start:', error);
    process.exit(1);
  }
})();
