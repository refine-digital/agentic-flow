/**
 * HTML Report Generator for Benchmark Results
 */

import fs from 'fs/promises';
import path from 'path';
import { BenchmarkResult, loadBaselineResults } from './benchmark';

interface ReportData {
  timestamp: string;
  version: string;
  benchmarks: BenchmarkResult[];
  baseline?: BenchmarkResult[];
}

/**
 * Generate HTML report
 */
export async function generateHTMLReport(
  currentResults: BenchmarkResult[],
  baselineResults?: BenchmarkResult[]
): Promise<string> {
  const reportData: ReportData = {
    timestamp: new Date().toISOString(),
    version: '2.0.0-alpha',
    benchmarks: currentResults,
    baseline: baselineResults,
  };

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Agentic-Flow v2.0.0-alpha Performance Benchmarks</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #333;
      padding: 20px;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    h1 {
      color: #667eea;
      font-size: 2.5em;
      margin-bottom: 10px;
      text-align: center;
    }
    .subtitle {
      text-align: center;
      color: #666;
      margin-bottom: 40px;
      font-size: 1.1em;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    .metric-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 25px;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    .metric-card h3 {
      font-size: 0.9em;
      opacity: 0.9;
      margin-bottom: 10px;
    }
    .metric-card .value {
      font-size: 2.5em;
      font-weight: bold;
    }
    .metric-card .label {
      font-size: 0.85em;
      opacity: 0.8;
      margin-top: 5px;
    }
    .chart-section {
      margin: 40px 0;
      background: #f8f9fa;
      padding: 30px;
      border-radius: 10px;
    }
    .chart-section h2 {
      color: #667eea;
      margin-bottom: 20px;
    }
    .chart-container {
      position: relative;
      height: 400px;
      margin-bottom: 30px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    th {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px;
      text-align: left;
      font-weight: 600;
    }
    td {
      padding: 12px 15px;
      border-bottom: 1px solid #eee;
    }
    tr:hover {
      background: #f8f9fa;
    }
    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.85em;
      font-weight: 600;
    }
    .status-pass {
      background: #d4edda;
      color: #155724;
    }
    .status-fail {
      background: #f8d7da;
      color: #721c24;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #eee;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 Agentic-Flow v2.0.0-alpha</h1>
    <div class="subtitle">
      Performance Benchmark Report<br>
      Generated: ${new Date(reportData.timestamp).toLocaleString()}
    </div>

    <div class="metrics-grid">
      ${generateMetricCards(reportData)}
    </div>

    <div class="chart-section">
      <h2>📊 Performance Comparison</h2>
      <div class="chart-container">
        <canvas id="latencyChart"></canvas>
      </div>
    </div>

    <div class="chart-section">
      <h2>📈 Latency Distribution (Percentiles)</h2>
      <div class="chart-container">
        <canvas id="percentileChart"></canvas>
      </div>
    </div>

    <div class="chart-section">
      <h2>⚡ Throughput Analysis</h2>
      <div class="chart-container">
        <canvas id="throughputChart"></canvas>
      </div>
    </div>

    ${generateDetailedTable(reportData)}

    ${reportData.baseline ? generateComparisonSection(reportData) : ''}

    <div class="footer">
      <p>Agentic-Flow v2.0.0-alpha Performance Benchmarks</p>
      <p style="margin-top: 10px; font-size: 0.9em;">
        Node: ${process.version} | Platform: ${process.platform} | Arch: ${process.arch}
      </p>
    </div>
  </div>

  <script>
    ${generateChartScripts(reportData)}
  </script>
</body>
</html>
  `;

  return html;
}

/**
 * Generate metric summary cards
 */
function generateMetricCards(data: ReportData): string {
  const benchmarks = data.benchmarks;

  const avgP50 = benchmarks.reduce((sum, b) => sum + b.p50, 0) / benchmarks.length;
  const avgP95 = benchmarks.reduce((sum, b) => sum + b.p95, 0) / benchmarks.length;
  const avgP99 = benchmarks.reduce((sum, b) => sum + b.p99, 0) / benchmarks.length;
  const totalOps = benchmarks.reduce((sum, b) => sum + b.opsPerSecond, 0);

  return `
    <div class="metric-card">
      <h3>Average P50 Latency</h3>
      <div class="value">${avgP50.toFixed(2)}</div>
      <div class="label">milliseconds</div>
    </div>
    <div class="metric-card">
      <h3>Average P95 Latency</h3>
      <div class="value">${avgP95.toFixed(2)}</div>
      <div class="label">milliseconds</div>
    </div>
    <div class="metric-card">
      <h3>Average P99 Latency</h3>
      <div class="value">${avgP99.toFixed(2)}</div>
      <div class="label">milliseconds</div>
    </div>
    <div class="metric-card">
      <h3>Total Throughput</h3>
      <div class="value">${totalOps.toFixed(0)}</div>
      <div class="label">ops/second</div>
    </div>
  `;
}

/**
 * Generate detailed results table
 */
function generateDetailedTable(data: ReportData): string {
  const rows = data.benchmarks.map(b => `
    <tr>
      <td><strong>${b.name}</strong></td>
      <td>${b.iterations.toLocaleString()}</td>
      <td>${b.p50.toFixed(2)}ms</td>
      <td>${b.p95.toFixed(2)}ms</td>
      <td>${b.p99.toFixed(2)}ms</td>
      <td>${b.mean.toFixed(2)}ms</td>
      <td>${b.stdDev.toFixed(2)}ms</td>
      <td>${b.opsPerSecond.toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <div class="chart-section">
      <h2>📋 Detailed Results</h2>
      <table>
        <thead>
          <tr>
            <th>Benchmark</th>
            <th>Iterations</th>
            <th>P50</th>
            <th>P95</th>
            <th>P99</th>
            <th>Mean</th>
            <th>Std Dev</th>
            <th>Throughput</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Generate comparison section if baseline exists
 */
function generateComparisonSection(data: ReportData): string {
  if (!data.baseline) return '';

  const rows = data.benchmarks.map(current => {
    const baseline = data.baseline!.find(b => b.name === current.name);
    if (!baseline) return '';

    const improvement = ((baseline.p50 - current.p50) / baseline.p50) * 100;
    const status = improvement > 0 ? 'status-pass' : 'status-fail';

    return `
      <tr>
        <td><strong>${current.name}</strong></td>
        <td>${baseline.p50.toFixed(2)}ms</td>
        <td>${current.p50.toFixed(2)}ms</td>
        <td>${improvement > 0 ? '+' : ''}${improvement.toFixed(1)}%</td>
        <td><span class="status-badge ${status}">${improvement > 0 ? 'Faster' : 'Slower'}</span></td>
      </tr>
    `;
  }).join('');

  return `
    <div class="chart-section">
      <h2>🔍 v1.0.0 vs v2.0.0-alpha Comparison</h2>
      <table>
        <thead>
          <tr>
            <th>Benchmark</th>
            <th>v1.0.0 P50</th>
            <th>v2.0.0 P50</th>
            <th>Improvement</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Generate Chart.js scripts
 */
function generateChartScripts(data: ReportData): string {
  const benchmarkNames = data.benchmarks.map(b => b.name);
  const p50Values = data.benchmarks.map(b => b.p50);
  const p95Values = data.benchmarks.map(b => b.p95);
  const p99Values = data.benchmarks.map(b => b.p99);
  const throughputValues = data.benchmarks.map(b => b.opsPerSecond);

  return `
    // Latency Comparison Chart
    new Chart(document.getElementById('latencyChart'), {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(benchmarkNames)},
        datasets: [{
          label: 'P50 Latency (ms)',
          data: ${JSON.stringify(p50Values)},
          backgroundColor: 'rgba(102, 126, 234, 0.8)',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Latency (ms)' }
          }
        }
      }
    });

    // Percentile Chart
    new Chart(document.getElementById('percentileChart'), {
      type: 'line',
      data: {
        labels: ${JSON.stringify(benchmarkNames)},
        datasets: [
          {
            label: 'P50',
            data: ${JSON.stringify(p50Values)},
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          },
          {
            label: 'P95',
            data: ${JSON.stringify(p95Values)},
            borderColor: 'rgb(255, 159, 64)',
            tension: 0.1
          },
          {
            label: 'P99',
            data: ${JSON.stringify(p99Values)},
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Latency (ms)' }
          }
        }
      }
    });

    // Throughput Chart
    new Chart(document.getElementById('throughputChart'), {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(benchmarkNames)},
        datasets: [{
          label: 'Operations per Second',
          data: ${JSON.stringify(throughputValues)},
          backgroundColor: 'rgba(118, 75, 162, 0.8)',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'ops/sec' }
          }
        }
      }
    });
  `;
}

/**
 * Main report generation function
 */
async function main() {
  console.log('\n📄 Generating HTML Performance Report...');

  // Load current results
  const currentPath = path.join(__dirname, '../data/results-v2.0.json');
  const currentResults = await loadBaselineResults(currentPath);

  if (currentResults.length === 0) {
    console.error('❌ No benchmark results found. Run benchmarks first:');
    console.log('  npm run benchmark');
    process.exit(1);
  }

  // Load baseline results (optional)
  let baselineResults: BenchmarkResult[] | undefined;
  try {
    const baselinePath = path.join(__dirname, '../data/baseline-v1.0.json');
    baselineResults = await loadBaselineResults(baselinePath);
  } catch (error) {
    console.warn('⚠️  No baseline results found, generating report without comparison');
  }

  // Generate HTML
  const html = await generateHTMLReport(currentResults, baselineResults);

  // Save report
  const reportPath = path.join(__dirname, '../reports/benchmark-report.html');
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, html);

  console.log(`✅ HTML report generated: ${reportPath}`);
  console.log('\n💡 Open in browser:');
  console.log(`   file://${reportPath}`);
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Report generation failed:', error);
    process.exit(1);
  });
}
