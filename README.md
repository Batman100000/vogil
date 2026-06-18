# VOGIL - Israel Government Data Explorer

**VOGIL** provides two powerful ways to explore Israel's government data portal (data.gov.il):

1. **Interactive CLI** - Command-line tool for terminal-based exploration
2. **Web Dashboard** - Modern web interface with real-time data browsing

## 🚀 Quick Start

### Installation

```bash
npm install
```

## 📋 Option 1: Interactive CLI Tool

Perfect for developers, data analysts, and power users who prefer command-line interfaces.

### Usage

```bash
npm run cli
```

### Features

- 🔍 **Search Datasets** - Find datasets by keyword (Hebrew or English)
- 📋 **List Organizations** - Browse government ministries and agencies
- 🏷️ **Browse Tags** - Filter datasets by topic
- 📥 **Get Dataset Info** - View complete metadata and resources
- 🔎 **Search Records** - Query data within datasets

### Example Workflow

```
1. Search for "דיור" (housing)
2. View dataset information
3. Search specific records
4. Export results as JSON/CSV
```

---

## 🌐 Option 2: Web Dashboard

Modern, interactive dashboard for real-time data exploration with beautiful visualizations.

### Usage

```bash
npm run server
```

Then open **http://localhost:3000** in your browser.

### Features

- 📊 **Real-time Dashboard** - Statistics and analytics overview
- 🔍 **Search Interface** - Fast dataset discovery
- 🏢 **Organization Browser** - Browse by government ministry
- 🏷️ **Tag Navigation** - Filter by topic
- 📋 **Record Viewer** - Query and display raw data
- 🎨 **Modern UI** - Responsive design with Hebrew support

### Dashboard Tabs

| Tab | Description |
|-----|-------------|
| **סקירה** (Overview) | Statistics and metrics |
| **ערכות נתונים** (Datasets) | Browse all available datasets |
| **תגים** (Tags) | Filter by topic/category |
| **רשומות** (Records) | Search and view raw records |

---

## 📊 Available Datasets

VOGIL connects to 1000+ government datasets including:

### By Category

- **🏠 Housing & Real Estate** - דיור ציבורי, נדלן
- **🚗 Transportation** - טיסות, רכב, חנייה
- **🏗️ Construction** - אתרי בנייה, הנדסה
- **💼 Labor** - דיני עבודה, קורסים
- **🏥 Health** - חיסונים, תרופות
- **⚖️ Legal** - עזבונות, פטנטים
- **🌱 Environment** - איכות אוויר, קיימות
- **💰 Finance** - תקציבים, הוצאות
- **📊 Statistics** - סטטיסטיקה, סקרים

---

## 🔧 Configuration

### Environment Variables (`.env`)

```env
# Transport mode (stdio for local use)
TRANSPORT=stdio

# API Settings
CKAN_BASE_URL=https://data.gov.il/api/3/action
CKAN_TIMEOUT_MS=10000
CACHE_TTL_MS=300000

# Optional Features
MCP_ENABLE_ELICITATION=false    # Interactive clarification
MCP_ENABLE_SAMPLING=false        # Dataset summaries
```

### MCP Server Configuration (`.claude/mcp.json`)

The project is pre-configured for Claude Code with local stdio mode:

```json
{
  "mcpServers": {
    "data-gov-il": {
      "command": "npx",
      "args": ["-y", "data-gov-il-mcp"]
    }
  }
}
```

---

## 📚 Available Tools

Both interfaces use these MCP tools:

- `find_datasets(query)` - Search datasets
- `list_organizations()` - Browse organizations
- `list_available_tags()` - Browse topics
- `get_dataset_info(dataset_id)` - Get metadata
- `search_records(resource_id, query)` - Query data
- `list_all_datasets(org)` - Browse by organization

---

## 🎯 Use Cases

### CLI Use Cases
- Automated data extraction scripts
- Integration with pipelines
- Batch processing
- Quick terminal lookups

### Web Dashboard Use Cases
- Team collaboration
- Real-time monitoring
- Data exploration workshops
- Government transparency reports
- Public sharing and embedding

---

## 🛠️ Development

### Available Commands

```bash
npm run cli          # Start interactive CLI
npm run server       # Start web server (localhost:3000)
npm start            # Same as 'server'
npm run dev          # Development mode
```

### Project Structure

```
VOGIL/
├── cli.js              # Interactive CLI tool
├── server.js           # Express web server
├── public/
│   └── index.html      # Web dashboard UI
├── .claude/
│   └── mcp.json        # MCP configuration
├── .env                # Environment variables
├── package.json        # Dependencies
└── README.md          # This file
```

---

## 📖 Examples

### CLI: Search for Housing Data

```
> Enter choice: 1
> Search term: דיור
> Results: Display matching datasets
```

### Web: View All Organizations

```
Click "🏢 ארגונים" → "טען ארגונים"
→ Browse ministries and agencies
```

### API Endpoint (for programmatic use)

```bash
curl http://localhost:3000/api/search?query=דיור
curl http://localhost:3000/api/organizations
curl http://localhost:3000/api/records?resourceId=xyz&query=דיור
```

---

## 🇮🇱 Hebrew Support

Both CLI and web dashboard provide full Hebrew language support:
- Hebrew search queries
- Right-to-left (RTL) layout
- Hebrew UI labels and navigation
- Hebrew dataset names and descriptions

---

## 📜 License

MIT

## 👤 Author

cypel (asafapelbaum@gmail.com)

---

**Built with ❤️ for government transparency and open data**
