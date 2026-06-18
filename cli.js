#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// MCP Client implementation
class DataGovILClient {
  constructor() {
    this.process = null;
    this.messageId = 0;
    this.pendingRequests = new Map();
  }

  async start() {
    return new Promise((resolve, reject) => {
      this.process = spawn('npx', ['-y', 'data-gov-il-mcp'], {
        cwd: __dirname,
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });

      let initOutput = '';

      this.process.stdout.on('data', (data) => {
        initOutput += data.toString();
        this.handleMessage(data.toString());
      });

      this.process.stderr.on('data', (data) => {
        console.error('MCP Error:', data.toString());
      });

      this.process.on('error', (error) => {
        reject(new Error(`Failed to start MCP: ${error.message}`));
      });

      // Give server time to start
      setTimeout(() => resolve(), 500);
    });
  }

  async callTool(toolName, args) {
    return new Promise((resolve, reject) => {
      const request = {
        jsonrpc: '2.0',
        id: ++this.messageId,
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: args
        }
      };

      const timeout = setTimeout(() => {
        this.pendingRequests.delete(request.id);
        reject(new Error(`Request timeout for ${toolName}`));
      }, 30000);

      this.pendingRequests.set(request.id, { resolve, reject, timeout });
      this.process.stdin.write(JSON.stringify(request) + '\n');
    });
  }

  handleMessage(data) {
    try {
      const lines = data.split('\n').filter(l => l.trim());
      lines.forEach(line => {
        try {
          const msg = JSON.parse(line);
          if (msg.id && this.pendingRequests.has(msg.id)) {
            const { resolve, reject, timeout } = this.pendingRequests.get(msg.id);
            clearTimeout(timeout);
            this.pendingRequests.delete(msg.id);
            if (msg.error) {
              reject(new Error(msg.error.message));
            } else {
              resolve(msg.result);
            }
          }
        } catch (e) {
          // Ignore parse errors
        }
      });
    } catch (e) {
      // Ignore
    }
  }

  async stop() {
    if (this.process) {
      this.process.kill();
    }
  }
}

// CLI Interface
class DataGovILCLI {
  constructor() {
    this.client = new DataGovILClient();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async init() {
    try {
      await this.client.start();
      console.log('\n🇮🇱 VOGIL - Israel Government Data Explorer\n');
      console.log('Connected to data.gov.il\n');
      this.showMenu();
    } catch (error) {
      console.error('Failed to initialize:', error.message);
      process.exit(1);
    }
  }

  showMenu() {
    console.log('\nChoose an action:');
    console.log('1. Search datasets');
    console.log('2. List organizations');
    console.log('3. Browse tags');
    console.log('4. Get dataset info');
    console.log('5. Search records in dataset');
    console.log('0. Exit\n');

    this.rl.question('Enter choice (0-5): ', (choice) => this.handleChoice(choice));
  }

  async handleChoice(choice) {
    switch (choice) {
      case '1':
        await this.searchDatasets();
        break;
      case '2':
        await this.listOrganizations();
        break;
      case '3':
        await this.browseTags();
        break;
      case '4':
        await this.getDatasetInfo();
        break;
      case '5':
        await this.searchRecords();
        break;
      case '0':
        await this.exit();
        break;
      default:
        console.log('Invalid choice');
        this.showMenu();
    }
  }

  async searchDatasets() {
    this.rl.question('\nSearch term (Hebrew or English): ', async (query) => {
      try {
        console.log('\n🔍 Searching...');
        const result = await this.client.callTool('find_datasets', { query });

        if (result && result.content) {
          const datasets = result.content[0]?.text || result.content;
          console.log('\n📊 Results:');
          console.log(datasets);
        } else {
          console.log('No results found');
        }
      } catch (error) {
        console.error('Search failed:', error.message);
      }
      this.showMenu();
    });
  }

  async listOrganizations() {
    try {
      console.log('\n📋 Fetching organizations...');
      const result = await this.client.callTool('list_organizations', {});

      if (result && result.content) {
        const orgs = result.content[0]?.text || result.content;
        console.log('\n🏢 Organizations:');
        console.log(orgs);
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error.message);
    }
    this.showMenu();
  }

  async browseTags() {
    try {
      console.log('\n🏷️  Fetching tags...');
      const result = await this.client.callTool('list_available_tags', {});

      if (result && result.content) {
        const tags = result.content[0]?.text || result.content;
        console.log('\n📌 Available Tags:');
        console.log(tags);
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error.message);
    }
    this.showMenu();
  }

  async getDatasetInfo() {
    this.rl.question('\nDataset ID: ', async (datasetId) => {
      try {
        console.log('\n📥 Fetching dataset info...');
        const result = await this.client.callTool('get_dataset_info', { dataset_id: datasetId });

        if (result && result.content) {
          const info = result.content[0]?.text || result.content;
          console.log('\n📄 Dataset Info:');
          console.log(info);
        }
      } catch (error) {
        console.error('Failed to fetch dataset info:', error.message);
      }
      this.showMenu();
    });
  }

  async searchRecords() {
    this.rl.question('\nDataset ID: ', (datasetId) => {
      this.rl.question('Search query: ', async (query) => {
        try {
          console.log('\n🔎 Searching records...');
          const result = await this.client.callTool('search_records', {
            resource_id: datasetId,
            query: query,
            limit: 10
          });

          if (result && result.content) {
            const records = result.content[0]?.text || result.content;
            console.log('\n📋 Records:');
            console.log(records);
          }
        } catch (error) {
          console.error('Search failed:', error.message);
        }
        this.showMenu();
      });
    });
  }

  async exit() {
    console.log('\n👋 Goodbye!\n');
    await this.client.stop();
    this.rl.close();
    process.exit(0);
  }
}

// Main
const cli = new DataGovILCLI();
cli.init().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
