# 📊 CCR Analytics Extension - Plan Detaliat de Implementare

> **Obiectiv:** Crearea unui sistem de analytics complet non-invasiv pentru Claude Code Router, bazat pe monitorizarea logurilor existente.

---

## 🎯 **OVERVIEW**

CCR Analytics Extension este o soluție 100% non-invasivă care monitorizează logurile generate automat de Claude Code Router pentru a oferi:
- Real-time analytics și metrics
- Provider health monitoring  
- Model usage tracking
- Cost analytics și projections
- Performance monitoring
- Error rate analysis

**Key Benefits:**
- ✅ Zero modificări în CCR oficial
- ✅ Update safe - funcționează cu orice versiune CCR
- ✅ Real-time monitoring prin file watchers
- ✅ Rich data extraction din logurile debug existente
- ✅ Standalone dashboard pe port separat

---

## 📋 **FAZA 1: CORE LOG PARSER ENGINE (Ziua 1-2)**

### **1.1 Log File Watcher System**

**Obiectiv:** Monitorizarea în timp real a logurilor CCR

```javascript
// ~/.claude-analytics/core/logWatcher.js
class LogWatcher {
  constructor() {
    this.serverLogsPath = '~/.claude-code-router/logs/'
    this.appLogPath = '~/.claude-code-router/claude-code-router.log'
    this.watchers = new Map()
  }
  
  startWatching() {
    // Monitor toate logurile ccr-*.log pentru JSON events
    // Monitor application log pentru routing decisions
    // Real-time file tailing cu chokidar
  }
}
```

**Tasks:**
- [ ] Setup file watcher pe `~/.claude-code-router/logs/ccr-*.log`
- [ ] Setup file watcher pe `~/.claude-code-router/claude-code-router.log`
- [ ] Handle log rotation (fișiere noi ccr-timestamp.log)
- [ ] Real-time streaming cu `tail -f` equivalent
- [ ] Error handling pentru missing files

### **1.2 JSON Log Parser**

**Obiectiv:** Parsarea și extragerea datelor din logurile pino JSON

```javascript
// ~/.claude-analytics/core/logParser.js
class LogParser {
  parseServerLog(logLine) {
    // Parse pino JSON format
    // Extract: reqId, req, body, responseTime, err
    return {
      timestamp, reqId, method, url, 
      model, messages, tokens, responseTime,
      provider, error, statusCode
    }
  }
  
  parseAppLog(logLine) {
    // Parse text format pentru routing decisions
    // Extract model selection logic
  }
}
```

**Date Extrase din Server Logs:**
- `reqId`: ID unic pentru tracking request-uri
- `req`: HTTP method, URL, remote address
- `body`: Model, messages, system prompts, metadata
- `responseTime`: Performance metrics
- `err`: Error details cu stack traces
- `statusCode`: Success/failure indicators

**Tasks:**
- [ ] JSON parser pentru pino logs
- [ ] Text parser pentru application logs
- [ ] Data normalization și validation
- [ ] Handle malformed log entries
- [ ] Extract request/response pairs prin reqId

### **1.3 Data Storage Engine**

**Obiectiv:** Persistența datelor pentru analytics și historical tracking

```javascript
// ~/.claude-analytics/core/dataStore.js
class DataStore {
  constructor() {
    this.dbPath = '~/.claude-analytics/data/analytics.db'
    // SQLite pentru performance + JSON pentru flexibilitate
  }
}
```

**Database Schema:**
```sql
-- Requests table
CREATE TABLE requests (
  id INTEGER PRIMARY KEY,
  reqId TEXT UNIQUE,
  timestamp DATETIME,
  method TEXT,
  url TEXT,
  model TEXT,
  provider TEXT,
  tokens INTEGER,
  user_id TEXT,
  session_id TEXT
);

-- Responses table  
CREATE TABLE responses (
  id INTEGER PRIMARY KEY,
  reqId TEXT,
  statusCode INTEGER,
  responseTime REAL,
  error TEXT,
  FOREIGN KEY (reqId) REFERENCES requests(reqId)
);

-- Models usage
CREATE TABLE model_usage (
  id INTEGER PRIMARY KEY,
  timestamp DATETIME,
  model TEXT,
  provider TEXT,
  usage_count INTEGER,
  total_tokens INTEGER,
  avg_response_time REAL
);
```

**Tasks:**
- [ ] SQLite database setup
- [ ] Tables: requests, responses, errors, sessions, models
- [ ] Indexing pentru performance queries
- [ ] Data retention policy (păstrează X zile)
- [ ] Backup și export functionality

---

## 🔧 **FAZA 2: ANALYTICS ENGINE (Ziua 2-3)**

### **2.1 Real-time Metrics Calculator**

**Obiectiv:** Calcularea metrilor în timp real pentru dashboard

```javascript
// ~/.claude-analytics/engine/metricsEngine.js
class MetricsEngine {
  calculateLiveMetrics() {
    return {
      // Performance metrics
      avgResponseTime: this.getAvgResponseTime(),
      requestsPerMinute: this.getRequestRate(),
      
      // Usage metrics  
      modelDistribution: this.getModelUsage(),
      providerHealthScores: this.getProviderHealth(),
      
      // Quality metrics
      errorRate: this.getErrorRate(),
      successRate: this.getSuccessRate()
    }
  }
}
```

**Metrici Calculate:**
- **Performance**: Response times (avg, p95, p99), throughput
- **Usage**: Model distribution, token consumption patterns
- **Quality**: Success rates, error patterns
- **Providers**: Health scores, availability metrics
- **Sessions**: User activity patterns, session analytics

**Tasks:**
- [ ] Request rate calculations (req/min, req/hour)
- [ ] Response time analytics (avg, p95, p99)
- [ ] Model usage distribution
- [ ] Provider performance comparison
- [ ] Error rate tracking per provider/model
- [ ] Session analytics și user patterns

### **2.2 Provider Health Monitor**

**Obiectiv:** Monitoring sănătății provider-ilor în timp real

```javascript
class ProviderMonitor {
  analyzeProviderHealth(provider) {
    return {
      successRate: percentage,
      avgResponseTime: milliseconds,
      errorPatterns: [types],
      quotaStatus: status,
      lastError: timestamp,
      healthScore: score // 0-100
    }
  }
}
```

**Health Indicators:**
- Success/failure rates
- Response time trends  
- Error pattern detection (quota exceeded, auth failures)
- Availability scoring
- Alert thresholds

**Tasks:**
- [ ] Success/failure rate per provider
- [ ] Response time comparison
- [ ] Error pattern detection (quota, auth, etc.)
- [ ] Provider availability scoring
- [ ] Alert system pentru provider issues

### **2.3 Cost Analytics**

**Obiectiv:** Estimarea și tracking-ul costurilor bazat pe usage

```javascript
class CostAnalyzer {
  calculateCosts() {
    // Estimate costs based pe token usage și provider rates
    return {
      dailyCost, monthlyCost, 
      costPerModel, costPerProvider,
      tokenUsagePatterns,
      projectedMonthlyCost
    }
  }
}
```

**Cost Tracking:**
- Token usage extraction din request logs
- Cost tables per provider/model
- Daily/monthly projections
- Budget alerts și warnings
- Cost optimization suggestions

**Tasks:**
- [ ] Token usage extraction din logs
- [ ] Cost estimation tables per provider/model
- [ ] Daily/monthly cost projections
- [ ] Cost optimization suggestions
- [ ] Budget alerts și warnings

---

## 🎨 **FAZA 3: DASHBOARD UI (Ziua 3-4)**

### **3.1 Core Dashboard Server**

**Obiectiv:** API server pentru dashboard și real-time updates

```javascript
// ~/.claude-analytics/server/dashboardServer.js
const express = require('express')
const WebSocket = require('ws')
const app = express()

// REST API Endpoints
app.get('/api/metrics/live', getLiveMetrics)
app.get('/api/providers/health', getProviderHealth)  
app.get('/api/requests/timeline', getRequestTimeline)
app.get('/api/models/usage', getModelUsage)
app.get('/api/costs/analysis', getCostAnalysis)

// WebSocket pentru real-time updates
const wss = new WebSocket.Server({ port: 3002 })
```

**API Endpoints:**
- `/api/metrics/live` - Live metrics (response times, rates)
- `/api/providers/health` - Provider health status
- `/api/requests/timeline` - Request timeline data
- `/api/models/usage` - Model usage statistics
- `/api/costs/analysis` - Cost analytics data
- `/api/errors/analysis` - Error rate analytics
- `/api/sessions/analytics` - Session și user data

**Tasks:**
- [ ] Express server pe port 3001
- [ ] REST API endpoints pentru toate metrics
- [ ] WebSocket pentru real-time updates
- [ ] CORS setup pentru local development
- [ ] Static file serving pentru UI

### **3.2 Frontend Dashboard**

**Obiectiv:** Modern, responsive dashboard pentru analytics visualization

```html
<!-- ~/.claude-analytics/ui/index.html -->
<!DOCTYPE html>
<html>
<head>
  <title>CCR Analytics Dashboard</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  
  <!-- CSS Libraries -->
  <link rel="stylesheet" href="https://unpkg.com/tailwindcss@3/dist/tailwind.min.css">
  
  <!-- JS Libraries -->
  <script src="https://unpkg.com/chart.js@4/dist/chart.min.js"></script>
  <script src="https://unpkg.com/axios@1/dist/axios.min.js"></script>
  
  <style>
    /* Custom dashboard styling */
    .metric-card {
      @apply bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg;
    }
    
    .health-indicator {
      @apply w-3 h-3 rounded-full inline-block mr-2;
    }
    
    .health-good { @apply bg-green-500; }
    .health-warning { @apply bg-yellow-500; }
    .health-error { @apply bg-red-500; }
  </style>
</head>
<body class="bg-gray-100 min-h-screen">
  <!-- Header -->
  <header class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 py-4">
      <h1 class="text-2xl font-bold text-gray-900">CCR Analytics Dashboard</h1>
      <p class="text-gray-600">Real-time monitoring și analytics pentru Claude Code Router</p>
    </div>
  </header>

  <!-- Main Dashboard -->
  <main class="max-w-7xl mx-auto px-4 py-8">
    <!-- Live Metrics Cards Row -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="metric-card">
        <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide">Requests/Min</h3>
        <div class="mt-2 flex items-baseline">
          <p class="text-3xl font-semibold text-gray-900" id="requestsPerMin">-</p>
          <span class="ml-2 text-sm text-gray-600">live</span>
        </div>
      </div>
      
      <div class="metric-card">
        <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide">Avg Response</h3>
        <div class="mt-2 flex items-baseline">
          <p class="text-3xl font-semibold text-gray-900" id="avgResponse">-</p>
          <span class="ml-2 text-sm text-gray-600">ms</span>
        </div>
      </div>
      
      <div class="metric-card">
        <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide">Success Rate</h3>
        <div class="mt-2 flex items-baseline">
          <p class="text-3xl font-semibold text-gray-900" id="successRate">-</p>
          <span class="ml-2 text-sm text-gray-600">%</span>
        </div>
      </div>
      
      <div class="metric-card">
        <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide">Active Providers</h3>
        <div class="mt-2 flex items-baseline">
          <p class="text-3xl font-semibold text-gray-900" id="activeProviders">-</p>
          <span class="ml-2 text-sm text-gray-600">healthy</span>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- Request Timeline Chart -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Request Timeline</h3>
        <canvas id="requestTimelineChart" width="400" height="200"></canvas>
      </div>
      
      <!-- Model Usage Distribution -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Model Usage</h3>
        <canvas id="modelUsageChart" width="400" height="200"></canvas>
      </div>
    </div>

    <!-- Provider Health Table -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden mb-8">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Provider Health Status</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Response</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Error</th>
            </tr>
          </thead>
          <tbody id="providerHealthTable" class="bg-white divide-y divide-gray-200">
            <!-- Dynamic content -->
          </tbody>
        </table>
      </div>
    </div>

    <!-- Recent Errors -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Recent Errors</h3>
      </div>
      <div class="px-6 py-4">
        <div id="recentErrors" class="space-y-3">
          <!-- Dynamic error list -->
        </div>
      </div>
    </div>
  </main>

  <!-- Dashboard JavaScript -->
  <script>
    // Dashboard initialization și real-time updates
    class CCRDashboard {
      constructor() {
        this.ws = null
        this.charts = {}
        this.init()
      }
      
      async init() {
        await this.initCharts()
        await this.loadInitialData()
        this.connectWebSocket()
        this.startPeriodicUpdates()
      }
      
      async initCharts() {
        // Request timeline chart
        const timelineCtx = document.getElementById('requestTimelineChart').getContext('2d')
        this.charts.timeline = new Chart(timelineCtx, {
          type: 'line',
          data: {
            labels: [],
            datasets: [{
              label: 'Requests per minute',
              data: [],
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)'
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        })
        
        // Model usage pie chart
        const usageCtx = document.getElementById('modelUsageChart').getContext('2d')
        this.charts.usage = new Chart(usageCtx, {
          type: 'doughnut',
          data: {
            labels: [],
            datasets: [{
              data: [],
              backgroundColor: [
                'rgb(59, 130, 246)',
                'rgb(16, 185, 129)', 
                'rgb(245, 101, 101)',
                'rgb(251, 191, 36)',
                'rgb(139, 92, 246)'
              ]
            }]
          },
          options: {
            responsive: true
          }
        })
      }
      
      async loadInitialData() {
        try {
          // Load live metrics
          const metrics = await axios.get('/api/metrics/live')
          this.updateMetrics(metrics.data)
          
          // Load provider health
          const health = await axios.get('/api/providers/health')
          this.updateProviderHealth(health.data)
          
          // Load timeline data
          const timeline = await axios.get('/api/requests/timeline')
          this.updateTimeline(timeline.data)
          
          // Load model usage
          const usage = await axios.get('/api/models/usage')
          this.updateModelUsage(usage.data)
          
        } catch (error) {
          console.error('Failed to load dashboard data:', error)
        }
      }
      
      updateMetrics(data) {
        document.getElementById('requestsPerMin').textContent = data.requestsPerMin || '0'
        document.getElementById('avgResponse').textContent = Math.round(data.avgResponseTime || 0)
        document.getElementById('successRate').textContent = Math.round(data.successRate || 0)
        document.getElementById('activeProviders').textContent = data.activeProviders || '0'
      }
      
      updateProviderHealth(providers) {
        const tbody = document.getElementById('providerHealthTable')
        tbody.innerHTML = providers.map(provider => `
          <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              ${provider.name}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span class="health-indicator health-${provider.status}"></span>
              ${provider.status}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              ${Math.round(provider.successRate)}%
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              ${Math.round(provider.avgResponseTime)}ms
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              ${provider.lastError || 'None'}
            </td>
          </tr>
        `).join('')
      }
      
      connectWebSocket() {
        this.ws = new WebSocket('ws://localhost:3002')
        
        this.ws.onmessage = (event) => {
          const data = JSON.parse(event.data)
          
          switch (data.type) {
            case 'metrics_update':
              this.updateMetrics(data.payload)
              break
            case 'provider_health':
              this.updateProviderHealth(data.payload)
              break
            case 'new_request':
              this.handleNewRequest(data.payload)
              break
          }
        }
        
        this.ws.onclose = () => {
          console.log('WebSocket disconnected, attempting reconnect...')
          setTimeout(() => this.connectWebSocket(), 5000)
        }
      }
      
      startPeriodicUpdates() {
        // Update charts every 30 seconds
        setInterval(async () => {
          try {
            const timeline = await axios.get('/api/requests/timeline')
            this.updateTimeline(timeline.data)
            
            const usage = await axios.get('/api/models/usage')
            this.updateModelUsage(usage.data)
          } catch (error) {
            console.error('Failed to update charts:', error)
          }
        }, 30000)
      }
    }
    
    // Initialize dashboard când DOM e ready
    document.addEventListener('DOMContentLoaded', () => {
      new CCRDashboard()
    })
  </script>
</body>
</html>
```

**Dashboard Features:**
- **Live Metrics Cards**: Requests/min, avg response time, success rate
- **Real-time Charts**: Request timeline, model usage distribution  
- **Provider Health Table**: Status indicators, success rates, errors
- **Recent Errors Panel**: Latest error messages și patterns
- **Responsive Design**: Mobile-friendly layout
- **WebSocket Updates**: Real-time data streaming

**Tasks:**
- [ ] Single-page dashboard cu Chart.js
- [ ] Real-time metrics cards
- [ ] Provider health indicator lights  
- [ ] Request timeline cu interactive charts
- [ ] Model usage pie charts
- [ ] Error rate trend lines
- [ ] Responsive design pentru mobile

### **3.3 Advanced Analytics Views**

**Obiectiv:** Views specializate pentru analize avansate

**Additional Dashboard Pages:**
- **Cost Analytics**: `/analytics/costs`
- **Session Analysis**: `/analytics/sessions`
- **Provider Comparison**: `/analytics/providers`
- **Historical Trends**: `/analytics/trends`

**Tasks:**
- [ ] Session analysis view
- [ ] Cost analytics dashboard
- [ ] Provider comparison matrix
- [ ] Historical trends și patterns
- [ ] Export functionality (CSV, JSON)

---

## ⚙️ **FAZA 4: INTEGRATION & DEPLOYMENT (Ziua 4-5)**

### **4.1 Startup și Management**

**Obiectiv:** CLI management și process orchestration

```bash
#!/bin/bash
# ~/.claude-analytics/bin/analytics

ANALYTICS_DIR="$HOME/.claude-analytics"
PID_FILE="$ANALYTICS_DIR/analytics.pid"

case "$1" in
  start)
    echo "Starting CCR Analytics Extension..."
    cd "$ANALYTICS_DIR"
    nohup node main.js > logs/analytics.log 2>&1 &
    echo $! > "$PID_FILE"
    echo "Analytics started. Dashboard available at http://localhost:3001"
    ;;
    
  stop)
    if [ -f "$PID_FILE" ]; then
      kill $(cat "$PID_FILE") 2>/dev/null
      rm "$PID_FILE"
      echo "Analytics stopped."
    else
      echo "Analytics not running."
    fi
    ;;
    
  restart)
    $0 stop
    sleep 2
    $0 start
    ;;
    
  status)
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
      echo "Analytics is running (PID: $(cat $PID_FILE))"
    else
      echo "Analytics is not running"
    fi
    ;;
    
  ui)
    if command -v open >/dev/null 2>&1; then
      open http://localhost:3001
    elif command -v xdg-open >/dev/null 2>&1; then
      xdg-open http://localhost:3001
    else
      echo "Dashboard available at: http://localhost:3001"
    fi
    ;;
    
  logs)
    tail -f "$ANALYTICS_DIR/logs/analytics.log"
    ;;
    
  *)
    echo "Usage: $0 {start|stop|restart|status|ui|logs}"
    exit 1
    ;;
esac
```

**Quick Start Commands:**
```bash
# Install dependencies
cd ~/.claude-analytics && npm install

# Start analytics
./bin/analytics start

# Open dashboard
./bin/analytics ui

# Check status
./bin/analytics status

# View logs
./bin/analytics logs
```

**Tasks:**
- [ ] CLI management script
- [ ] Systemd service file pentru auto-start
- [ ] Process management (start/stop/restart)
- [ ] Health check endpoints
- [ ] Automatic CCR detection

### **4.2 Configuration Management**

**Obiectiv:** Flexible configuration system

```json
// ~/.claude-analytics/config.json
{
  "version": "1.0.0",
  "logPaths": {
    "serverLogs": "~/.claude-code-router/logs/",
    "appLog": "~/.claude-code-router/claude-code-router.log",
    "configFile": "~/.claude-code-router/config.json"
  },
  "dashboard": {
    "port": 3001,
    "wsPort": 3002,
    "refreshInterval": 5000,
    "title": "CCR Analytics Dashboard"
  },
  "storage": {
    "retentionDays": 30,
    "maxLogSize": "100MB",
    "dbPath": "~/.claude-analytics/data/analytics.db"
  },
  "monitoring": {
    "logWatchInterval": 1000,
    "healthCheckInterval": 30000,
    "alertThresholds": {
      "errorRate": 10,
      "responseTime": 5000,
      "successRate": 90
    }
  },
  "alerts": {
    "enabled": true,
    "email": {
      "enabled": false,
      "smtp": {
        "host": "",
        "port": 587,
        "user": "",
        "pass": ""
      },
      "to": ""
    },
    "webhook": {
      "enabled": false,
      "url": ""
    }
  },
  "costs": {
    "currency": "USD",
    "providers": {
      "openrouter": {
        "inputTokenPrice": 0.000003,
        "outputTokenPrice": 0.000015
      },
      "deepseek": {
        "inputTokenPrice": 0.00000014,
        "outputTokenPrice": 0.00000028
      }
    }
  }
}
```

**Configuration Features:**
- Flexible log paths configuration
- Dashboard customization options
- Data retention policies
- Alert thresholds și notification settings
- Cost calculation parameters
- Monitoring intervals

**Tasks:**
- [ ] Configurație flexibility pentru paths
- [ ] Dashboard customization options
- [ ] Data retention policies
- [ ] Alert thresholds și notifications

### **4.3 Error Handling & Resilience**

**Obiectiv:** Robust error handling și recovery mechanisms

**Error Scenarios Handled:**
- CCR not running or logs not accessible
- Log file rotation și cleanup
- Database corruption sau connection issues
- Network issues pentru dashboard
- Missing dependencies sau permissions

```javascript
// ~/.claude-analytics/core/errorHandler.js
class ErrorHandler {
  constructor() {
    this.retryAttempts = 3
    this.retryDelay = 5000
  }
  
  async handleLogFileError(error, filePath) {
    console.error(`Log file error for ${filePath}:`, error.message)
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`Waiting for log file to be created: ${filePath}`)
      return false
    }
    
    // Check permissions
    try {
      fs.accessSync(filePath, fs.constants.R_OK)
    } catch (permError) {
      console.error(`Permission denied for log file: ${filePath}`)
      return false
    }
    
    return true
  }
  
  async handleDatabaseError(error) {
    console.error('Database error:', error.message)
    
    // Attempt to backup și recreate database
    try {
      await this.backupDatabase()
      await this.recreateDatabase()
      return true
    } catch (dbError) {
      console.error('Failed to recover database:', dbError.message)
      return false
    }
  }
}
```

**Tasks:**
- [ ] Graceful handling când CCR nu rulează
- [ ] Log file rotation handling
- [ ] Database corruption recovery
- [ ] Missing dependency detection
- [ ] Comprehensive error logging

---

## 🚀 **FAZA 5: ADVANCED FEATURES (Ziua 5-6)**

### **5.1 Intelligent Analytics**

**Obiectiv:** AI-powered insights și pattern recognition

```javascript
// ~/.claude-analytics/engine/intelligentAnalyzer.js
class IntelligentAnalyzer {
  detectAnomalies() {
    // Detect unusual patterns în request volumes
    // Identify performance degradation trends
    // Flag suspicious error spikes
  }
  
  generateInsights() {
    // Usage pattern analysis
    // Cost optimization recommendations  
    // Performance improvement suggestions
    // Provider selection optimization
  }
  
  predictTrends() {
    // Forecast usage growth
    // Predict cost increases
    // Anticipate capacity needs
  }
}
```

**Intelligence Features:**
- **Pattern Detection**: Unusual usage patterns, peak hours analysis
- **Anomaly Detection**: Error spikes, performance degradation
- **Trend Prediction**: Usage growth, cost projections
- **Optimization Suggestions**: Model selection, cost reduction
- **Alert Intelligence**: Smart thresholding, noise reduction

**Tasks:**
- [ ] Pattern detection în usage
- [ ] Anomaly detection pentru errors
- [ ] Performance trend predictions
- [ ] Cost optimization recommendations
- [ ] Usage pattern insights

### **5.2 Alerts & Notifications**

**Obiectiv:** Proactive alerting system

```javascript
// ~/.claude-analytics/alerts/alertManager.js
class AlertManager {
  checkThresholds() {
    const metrics = this.metricsEngine.getCurrentMetrics()
    
    // Error rate alerts
    if (metrics.errorRate > this.config.alertThresholds.errorRate) {
      this.sendAlert('high_error_rate', {
        currentRate: metrics.errorRate,
        threshold: this.config.alertThresholds.errorRate
      })
    }
    
    // Response time alerts
    if (metrics.avgResponseTime > this.config.alertThresholds.responseTime) {
      this.sendAlert('slow_response', {
        currentTime: metrics.avgResponseTime,
        threshold: this.config.alertThresholds.responseTime
      })
    }
  }
  
  async sendAlert(type, data) {
    const alert = {
      type,
      timestamp: new Date(),
      data,
      severity: this.getSeverity(type, data)
    }
    
    // Send email notification
    if (this.config.alerts.email.enabled) {
      await this.sendEmailAlert(alert)
    }
    
    // Send webhook notification
    if (this.config.alerts.webhook.enabled) {
      await this.sendWebhookAlert(alert)
    }
    
    // Store alert în database
    await this.storeAlert(alert)
  }
}
```

**Alert Types:**
- **Provider Failures**: Down providers, high error rates
- **Performance Issues**: Slow responses, timeouts
- **Cost Thresholds**: Budget exceeded, unusual spending
- **Usage Anomalies**: Traffic spikes, unusual patterns
- **System Health**: CCR connectivity, log accessibility

**Tasks:**
- [ ] Email alerts pentru provider failures
- [ ] Threshold alerts pentru costs
- [ ] Performance degradation warnings
- [ ] Integration cu webhook notifications

### **5.3 Historical Analysis**

**Obiectiv:** Long-term data analysis și reporting

```javascript
// ~/.claude-analytics/engine/historicalAnalyzer.js
class HistoricalAnalyzer {
  async importExistingLogs() {
    // Scan for existing log files
    // Parse historical data
    // Import into database
  }
  
  generateReports() {
    return {
      monthly: this.generateMonthlyReport(),
      weekly: this.generateWeeklyReport(),
      providerComparison: this.generateProviderReport(),
      costAnalysis: this.generateCostReport()
    }
  }
  
  exportData(format, dateRange) {
    // Export în CSV, JSON, Excel formats
    // Filter by date ranges
    // Include all metrics și details
  }
}
```

**Historical Features:**
- **Log Import**: Parse existing logs pentru historical data
- **Trend Analysis**: Long-term usage patterns
- **Comparative Reports**: Provider performance over time
- **Data Export**: CSV, JSON, Excel formats
- **Custom Date Ranges**: Flexible reporting periods

**Tasks:**
- [ ] Import/parse loguri existente
- [ ] Long-term trend analysis
- [ ] Comparative reports
- [ ] Data export capabilities

---

## 📦 **DELIVERABLES**

### **Final Project Structure:**

```
~/.claude-analytics/
├── bin/
│   └── analytics                    # CLI management script
├── core/
│   ├── logWatcher.js               # File monitoring
│   ├── logParser.js                # Log parsing engine
│   ├── dataStore.js                # SQLite storage
│   └── errorHandler.js             # Error handling
├── engine/
│   ├── metricsEngine.js            # Analytics calculations
│   ├── providerMonitor.js          # Provider health monitoring
│   ├── costAnalyzer.js             # Cost analytics
│   ├── intelligentAnalyzer.js     # AI insights
│   └── historicalAnalyzer.js      # Historical analysis
├── server/
│   ├── dashboardServer.js          # Express API server
│   ├── websocket.js                # Real-time updates
│   └── routes/
│       ├── metrics.js              # Metrics API endpoints
│       ├── providers.js            # Provider API endpoints
│       ├── costs.js                # Cost API endpoints
│       └── analytics.js            # Analytics API endpoints
├── ui/
│   ├── index.html                  # Main dashboard
│   ├── costs.html                  # Cost analytics view
│   ├── sessions.html               # Session analysis view
│   ├── providers.html              # Provider comparison view
│   ├── js/
│   │   ├── dashboard.js            # Dashboard logic
│   │   ├── charts.js               # Chart configurations
│   │   └── websocket.js            # Real-time updates
│   └── css/
│       └── styles.css              # Custom styling
├── alerts/
│   ├── alertManager.js             # Alert system
│   ├── emailNotifier.js            # Email notifications
│   └── webhookNotifier.js          # Webhook notifications
├── data/
│   ├── analytics.db                # SQLite database
│   └── backups/                    # Database backups
├── logs/
│   └── analytics.log               # Extension logs
├── config.json                     # Configuration
├── package.json                    # Dependencies
├── package-lock.json               # Lock file
├── main.js                         # Entry point
└── README.md                       # Documentation
```

### **Installation & Quick Start:**

```bash
# 1. Clone or download extension
mkdir ~/.claude-analytics
cd ~/.claude-analytics

# 2. Install dependencies
npm install

# 3. Initialize database
npm run init-db

# 4. Start analytics
./bin/analytics start

# 5. Open dashboard
./bin/analytics ui
# Dashboard available at: http://localhost:3001

# 6. Check status
./bin/analytics status

# 7. View logs
./bin/analytics logs
```

### **Package.json Dependencies:**

```json
{
  "name": "ccr-analytics-extension",
  "version": "1.0.0",
  "description": "Non-invasive analytics extension for Claude Code Router",
  "main": "main.js",
  "scripts": {
    "start": "node main.js",
    "init-db": "node scripts/init-database.js",
    "test": "npm run test-parser && npm run test-metrics",
    "test-parser": "node tests/test-parser.js",
    "test-metrics": "node tests/test-metrics.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "ws": "^8.13.0",
    "sqlite3": "^5.1.6",
    "chokidar": "^3.5.3",
    "axios": "^1.4.0",
    "nodemailer": "^6.9.4",
    "fs-extra": "^11.1.1",
    "moment": "^2.29.4",
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "mocha": "^10.2.0",
    "chai": "^4.3.7"
  },
  "keywords": [
    "claude-code-router",
    "analytics",
    "monitoring",
    "dashboard",
    "llm"
  ],
  "author": "CCR Analytics Team",
  "license": "MIT"
}
```

---

## ✅ **REZULTATE FINALE**

### **🎯 Dashboard Features:**
- **Real-time Monitoring**: Live request tracking, response times
- **Provider Health**: Status indicators, error rates, availability
- **Model Analytics**: Usage distribution, performance comparison
- **Cost Tracking**: Token usage, cost projections, budget alerts
- **Error Analysis**: Error patterns, failure rates, root cause analysis
- **Session Analytics**: User activity, session patterns
- **Historical Trends**: Long-term analysis, comparative reports

### **🔧 Technical Benefits:**
- **100% Non-invasive**: Zero modifications to CCR oficial
- **Real-time Processing**: File watchers pentru instant updates
- **High Performance**: SQLite storage, optimized queries
- **Scalable Architecture**: Modular design, easy extensions
- **Comprehensive Logging**: All analytics activities logged
- **Error Resilience**: Graceful handling of edge cases

### **⚡ Key Capabilities:**
- **Live Metrics**: Requests/min, response times, success rates
- **Provider Monitoring**: Health scores, error tracking, performance
- **Cost Analytics**: Usage-based cost calculations și projections  
- **Alert System**: Email, webhook notifications for issues
- **Data Export**: CSV, JSON export pentru external analysis
- **Historical Analysis**: Long-term trends, comparative reports

### **🚀 Quick Commands:**
```bash
# Start the analytics extension
./bin/analytics start

# Open dashboard în browser
./bin/analytics ui

# Check system status
./bin/analytics status

# View live logs
./bin/analytics logs

# Stop analytics
./bin/analytics stop
```

---

## 🎉 **CONCLUSION**

CCR Analytics Extension oferă o soluție completă, non-invasivă pentru monitoring și analytics al Claude Code Router. Prin monitorizarea logurilor existente, extensia provide insights detaliate despre performance, usage patterns, provider health, și costs fără a modifica codul oficial CCR.

**Această arhitectură permite:**
- Update-uri CCR fără impact asupra analytics
- Rich data extraction din logurile debug existente
- Real-time monitoring și alerting
- Comprehensive cost tracking și optimization
- Historical analysis și trend prediction

**Perfect pentru utilizatorii care vor analytics avansate păstrând compatibilitatea cu versiunile oficiale CCR!** 🚀