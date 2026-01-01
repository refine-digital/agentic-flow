/**
 * Visualization Generator
 * Creates ASCII charts and graphs for test results
 */

import * as fs from 'fs/promises';
import * as path from 'path';

interface ChartData {
  labels: string[];
  values: number[];
  title: string;
  unit: string;
}

class VisualizationGenerator {
  private resultsDir: string;

  constructor() {
    this.resultsDir = '/workspaces/agentic-flow/tests/e2b-specialized-agents/results';
  }

  async generate(): Promise<void> {
    console.log('📊 Generating Visualizations...\n');

    const agents = ['backend-dev', 'api-docs', 'ml-developer', 'base-template-generator'];
    let allCharts = '';

    for (const agent of agents) {
      console.log(`  Creating charts for ${agent}...`);
      const results = await this.loadResults(agent);
      const charts = await this.generateAgentCharts(agent, results);
      allCharts += charts + '\n\n';
    }

    // Save visualization report
    const reportPath = path.join(this.resultsDir, 'visualizations.md');
    await fs.writeFile(reportPath, allCharts);
    console.log(`\n✅ Visualizations saved to: ${reportPath}`);
  }

  private async loadResults(agent: string): Promise<any[]> {
    const filePath = path.join(this.resultsDir, `${agent}-results.json`);
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  }

  private async generateAgentCharts(agent: string, results: any[]): Promise<string> {
    let output = `# ${agent} Performance Visualizations\n\n`;

    // Group by scenario
    const scenarios = new Map<string, any[]>();
    results.forEach(r => {
      if (!scenarios.has(r.scenario)) scenarios.set(r.scenario, []);
      scenarios.get(r.scenario)!.push(r);
    });

    for (const [scenario, scenarioResults] of scenarios.entries()) {
      output += `## ${scenario}\n\n`;

      // Execution time trend
      output += this.createLineChart({
        labels: scenarioResults.map((r, i) => `Iter ${i + 1}`),
        values: scenarioResults.map(r => r.metrics.executionTime),
        title: 'Execution Time Trend',
        unit: 'ms'
      });
      output += '\n\n';

      // Pattern learning growth
      output += this.createLineChart({
        labels: scenarioResults.map((r, i) => `Iter ${i + 1}`),
        values: scenarioResults.map(r => r.patterns.totalPatterns),
        title: 'Pattern Library Growth',
        unit: 'patterns'
      });
      output += '\n\n';

      // Memory usage
      output += this.createBarChart({
        labels: scenarioResults.map((r, i) => `Iter ${i + 1}`),
        values: scenarioResults.map(r => r.metrics.memoryUsage),
        title: 'Memory Usage',
        unit: 'MB'
      });
      output += '\n\n';

      // Flash Attention gains (if applicable)
      const flashGains = scenarioResults.map(r => r.metrics.flashAttentionGain);
      if (flashGains.some(g => g > 1.0)) {
        output += this.createBarChart({
          labels: scenarioResults.map((r, i) => `Iter ${i + 1}`),
          values: flashGains,
          title: 'Flash Attention Speedup',
          unit: 'x'
        });
        output += '\n\n';
      }
    }

    return output;
  }

  private createLineChart(data: ChartData): string {
    const maxWidth = 60;
    const maxValue = Math.max(...data.values);
    const minValue = Math.min(...data.values);
    const range = maxValue - minValue || 1;

    let chart = `### ${data.title}\n\n\`\`\`\n`;

    // Y-axis scale
    const steps = 5;
    for (let i = steps; i >= 0; i--) {
      const value = minValue + (range * i / steps);
      const label = value.toFixed(0).padStart(8);
      chart += `${label} ${data.unit} |`;

      // Plot points at this level
      let line = '';
      for (let j = 0; j < data.values.length; j++) {
        const normalized = (data.values[j] - minValue) / range;
        const expectedLevel = i / steps;

        if (Math.abs(normalized - expectedLevel) < 0.1) {
          line += j === 0 ? '●' : '──●';
        } else if (normalized > expectedLevel) {
          line += j === 0 ? ' ' : '   ';
        } else {
          line += j === 0 ? ' ' : '   ';
        }
      }
      chart += line + '\n';
    }

    // X-axis
    chart += '         ' + '+' + '─'.repeat(maxWidth) + '\n';
    chart += '          ' + data.labels.join('  ') + '\n';
    chart += '\`\`\`\n';

    return chart;
  }

  private createBarChart(data: ChartData): string {
    const maxWidth = 50;
    const maxValue = Math.max(...data.values);

    let chart = `### ${data.title}\n\n\`\`\`\n`;

    for (let i = 0; i < data.labels.length; i++) {
      const label = data.labels[i].padEnd(10);
      const value = data.values[i];
      const barLength = Math.max(0, Math.min(maxWidth, Math.round((value / maxValue) * maxWidth)));
      const bar = '█'.repeat(barLength);
      const valueStr = value.toFixed(2);

      chart += `${label} | ${bar} ${valueStr} ${data.unit}\n`;
    }

    chart += '\`\`\`\n';

    return chart;
  }

  async generateComparisonCharts(): Promise<void> {
    console.log('\n📈 Generating Cross-Agent Comparisons...\n');

    const agents = ['backend-dev', 'api-docs', 'ml-developer', 'base-template-generator'];
    const allResults = new Map<string, any[]>();

    for (const agent of agents) {
      allResults.set(agent, await this.loadResults(agent));
    }

    let comparison = '# Cross-Agent Performance Comparison\n\n';

    // Average execution time comparison
    comparison += '## Average Execution Time by Agent\n\n';
    const avgTimes: ChartData = {
      labels: agents,
      values: agents.map(agent => {
        const results = allResults.get(agent)!;
        return results.reduce((sum, r) => sum + r.metrics.executionTime, 0) / results.length;
      }),
      title: 'Average Execution Time',
      unit: 'ms'
    };
    comparison += this.createBarChart(avgTimes) + '\n\n';

    // Pattern learning efficiency
    comparison += '## Pattern Learning Efficiency\n\n';
    const patternEfficiency: ChartData = {
      labels: agents,
      values: agents.map(agent => {
        const results = allResults.get(agent)!;
        return results.reduce((sum, r) => sum + r.patterns.totalPatterns, 0) / results.length;
      }),
      title: 'Average Patterns Learned',
      unit: 'patterns'
    };
    comparison += this.createBarChart(patternEfficiency) + '\n\n';

    // Save comparison charts
    const comparisonPath = path.join(this.resultsDir, 'comparison-charts.md');
    await fs.writeFile(comparisonPath, comparison);
    console.log(`✅ Comparison charts saved to: ${comparisonPath}`);
  }
}

// Main execution
async function main() {
  const generator = new VisualizationGenerator();
  await generator.generate();
  await generator.generateComparisonCharts();
}

main();
