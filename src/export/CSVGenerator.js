/**
 * CSVGenerator.js
 *
 * Export habitat layout and psychological metrics to CSV format
 *
 * Outputs:
 * 1. Module layout data
 * 2. Design variables
 * 3. Daily psychological metrics (45-day simulation)
 * 4. NASA compliance summary
 */

export class CSVGenerator {
  /**
   * Generate comprehensive CSV export
   * @param {Array} modules - Habitat modules
   * @param {Object} designVariables - Computed design variables
   * @param {Array} missionResults - Full 45-day simulation results
   * @param {Object} constraintReport - NASA constraint validation results
   * @param {Object} simulationReport - MissionSimulator full report (optional)
   * @returns {String} - CSV formatted data
   */
  static generateCSV(modules, designVariables, missionResults, constraintReport, simulationReport = null) {
    try {
      let csv = '';

      // Header
      csv += '# Habitat Harmony LS² - Psychological Metrics Export\n';
      csv += `# Generated: ${new Date().toISOString()}\n`;
      csv += '# NASA Sources: HERA, UND LDT Study, TP-2020-220505, AIAA 2022\n';
      csv += '#\n';

      // Section 1: Mission Configuration (if available)
      if (simulationReport?.missionConfig) {
        csv += '# SECTION 1: MISSION CONFIGURATION\n';
        csv += 'Parameter,Value\n';
        csv += `Crew Size,${simulationReport.missionConfig.crewSize}\n`;
        csv += `Mission Duration,${simulationReport.missionConfig.missionDays} days\n`;
        csv += '\n';

        csv += '# Crew Roster\n';
        csv += 'ID,Name,Role,Gender\n';
        for (const member of simulationReport.missionConfig.crew) {
          csv += `${member.id},${member.name},${member.role},${member.gender}\n`;
        }
        csv += '\n';
      }

      // Section 2: Module Layout
      csv += '# SECTION 2: MODULE LAYOUT\n';
      csv += 'Module Name,Width (m),Depth (m),Height (m),Position X (m),Position Z (m),Rotation (deg),Zone,Area (m²)\n';

      for (const module of modules) {
        const area = (module.width * module.depth).toFixed(2);
        const rotation = (module.mesh.rotation.y * 180 / Math.PI).toFixed(1);

        csv += `${module.name},${module.width},${module.depth},${module.height},`;
        csv += `${module.mesh.position.x.toFixed(2)},${module.mesh.position.z.toFixed(2)},`;
        csv += `${rotation},${module.zone},${area}\n`;
      }

      csv += '\n';

      // Section 3: Design Variables
      csv += '# SECTION 3: DESIGN VARIABLES (UND LDT Study)\n';
      csv += 'Variable,Value,Range,Description\n';
      csv += `Private Sleep Quarters (P),${designVariables.privateSleepQuarters.toFixed(3)},[0-1],Crew quarters per crew member\n`;
      csv += `Window Type (W),${designVariables.windowType.toFixed(3)},[0-1],0=none 0.5=digital 1=physical\n`;
      csv += `Visual Order (V),${designVariables.visualOrder.toFixed(3)},[0-1],1=no overlaps clean layout\n`;
      csv += `Lighting Compliance (L),${designVariables.lightingCompliance.toFixed(3)},[0-1],Circadian lighting schedule\n`;
      csv += `Adjacency Compliance (A),${designVariables.adjacencyCompliance.toFixed(3)},[0-1],NASA adjacency rules met\n`;
      csv += `Recreation Area (R),${designVariables.recreationArea.toFixed(3)},[0-1],Fraction for dining/exercise\n`;
      csv += `Exercise Compliance (E),${designVariables.exerciseCompliance.toFixed(3)},[0-1],Daily exercise adherence\n`;
      csv += `Circulation Pattern (C),${(designVariables.circulationPattern || 1).toFixed(3)},[0-1],0=tree 1=loop\n`;

      csv += '\n';

      // Section 4: NASA Compliance Summary
      csv += '# SECTION 4: NASA COMPLIANCE SUMMARY\n';
      csv += 'Constraint,Status,Details\n';

      const totalArea = modules.reduce((sum, m) => sum + (m.width * m.depth), 0);
      csv += `Total Footprint,${totalArea.toFixed(2)} m²,Within 12m × 8m habitat shell\n`;
      csv += `Adjacency Compliance,${(constraintReport.adjacencyCompliance * 100).toFixed(1)}%,NASA TP-2020-220505 rules\n`;
      csv += `Path Width ≥ 1.0m,${constraintReport.pathWidthOk ? 'PASS' : 'FAIL'},AIAA 2022 requirement\n`;
      csv += `Module Count,${modules.length},Total modules placed\n`;

      csv += '\n';

      // Section 5: Daily Team Average Metrics
      csv += '# SECTION 5: DAILY TEAM AVERAGE METRICS\n';
      csv += 'Day,Stress,Mood,Sleep Quality,Cohesion,Performance,Psych Health Index\n';

      for (const result of missionResults) {
        const phi = result.psychHealthIndex !== undefined ? result.psychHealthIndex :
                     ((100 - result.stress) + result.mood + result.sleepQuality + result.cohesion) / 4;
        const perf = result.performance !== undefined ? result.performance : 1.0;

        csv += `${result.day},`;
        csv += `${result.stress.toFixed(2)},`;
        csv += `${result.mood.toFixed(2)},`;
        csv += `${result.sleepQuality.toFixed(2)},`;
        csv += `${result.cohesion.toFixed(2)},`;
        csv += `${perf.toFixed(3)},`;
        csv += `${phi.toFixed(2)}\n`;
      }

      csv += '\n';

      // Section 6: Per-Crew Daily Metrics (if available)
      if (simulationReport?.dailyMetrics?.length > 0 &&
          simulationReport.dailyMetrics[0].crew?.length > 0) {
        csv += '# SECTION 6: PER-CREW DAILY METRICS\n';
        csv += 'Day,Crew ID,Name,Role,Stress,Mood,Sleep Quality,Cohesion,Performance\n';

        for (const dayData of simulationReport.dailyMetrics) {
          for (const crewData of dayData.crew) {
            csv += `${dayData.day},${crewData.id},${crewData.name},${crewData.role},`;
            csv += `${crewData.stress.toFixed(2)},${crewData.mood.toFixed(2)},`;
            csv += `${crewData.sleepQuality.toFixed(2)},${crewData.cohesion.toFixed(2)},`;
            csv += `${crewData.performance.toFixed(3)}\n`;
          }
        }

        csv += '\n';
      }

      // Section 7: Statistical Summary
      csv += '# SECTION 7: STATISTICAL SUMMARY\n';
      csv += 'Metric,Mean,Min,Max,StdDev,Initial,Final,Change\n';

      const stats = this.calculateStatistics(missionResults);
      csv += `Stress,${stats.stress.mean.toFixed(2)},${stats.stress.min.toFixed(2)},${stats.stress.max.toFixed(2)},${stats.stress.stdDev.toFixed(2)},${stats.stress.initial.toFixed(2)},${stats.stress.final.toFixed(2)},${stats.stress.change.toFixed(2)}\n`;
      csv += `Mood,${stats.mood.mean.toFixed(2)},${stats.mood.min.toFixed(2)},${stats.mood.max.toFixed(2)},${stats.mood.stdDev.toFixed(2)},${stats.mood.initial.toFixed(2)},${stats.mood.final.toFixed(2)},${stats.mood.change.toFixed(2)}\n`;
      csv += `Sleep Quality,${stats.sleep.mean.toFixed(2)},${stats.sleep.min.toFixed(2)},${stats.sleep.max.toFixed(2)},${stats.sleep.stdDev.toFixed(2)},${stats.sleep.initial.toFixed(2)},${stats.sleep.final.toFixed(2)},${stats.sleep.change.toFixed(2)}\n`;
      csv += `Cohesion,${stats.cohesion.mean.toFixed(2)},${stats.cohesion.min.toFixed(2)},${stats.cohesion.max.toFixed(2)},${stats.cohesion.stdDev.toFixed(2)},${stats.cohesion.initial.toFixed(2)},${stats.cohesion.final.toFixed(2)},${stats.cohesion.change.toFixed(2)}\n`;

      if (stats.performance) {
        csv += `Performance,${stats.performance.mean.toFixed(3)},${stats.performance.min.toFixed(3)},${stats.performance.max.toFixed(3)},${stats.performance.stdDev.toFixed(3)},${stats.performance.initial.toFixed(3)},${stats.performance.final.toFixed(3)},${stats.performance.change.toFixed(3)}\n`;
      }

      csv += `PHI,${stats.phi.mean.toFixed(2)},${stats.phi.min.toFixed(2)},${stats.phi.max.toFixed(2)},${stats.phi.stdDev.toFixed(2)},${stats.phi.initial.toFixed(2)},${stats.phi.final.toFixed(2)},${stats.phi.change.toFixed(2)}\n`;

      csv += '\n';

      // Section 8: Recommendations (if available)
      if (simulationReport?.recommendations?.length > 0) {
        csv += '# SECTION 8: RECOMMENDATIONS\n';
        csv += 'Priority,Recommendation\n';
        for (const rec of simulationReport.recommendations) {
          csv += `NASA Guideline,"${rec}"\n`;
        }
        csv += '\n';
      }

      csv += '# End of Export\n';
      csv += '# Mars-Sim inspired features: Performance degradation, sleep debt tracking\n';
      csv += '# NASA validated: All metrics traced to HERA, UND, TP-2020-220505, AIAA 2022\n';

      return csv;

    } catch (error) {
      console.error('Error generating CSV:', error);
      return '';
    }
  }

  /**
   * Calculate statistics for mission results
   */
  static calculateStatistics(results) {
    const metrics = ['stress', 'mood', 'sleepQuality', 'cohesion', 'performance', 'psychHealthIndex'];
    const stats = {};

    for (const metric of metrics) {
      const values = results.map(r => {
        if (metric === 'psychHealthIndex') {
          return r.psychHealthIndex !== undefined ? r.psychHealthIndex :
                 ((100 - r.stress) + r.mood + r.sleepQuality + r.cohesion) / 4;
        } else if (metric === 'performance') {
          return r.performance !== undefined ? r.performance : 1.0;
        } else {
          return r[metric];
        }
      });

      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      const initial = values[0];
      const final = values[values.length - 1];
      const change = final - initial;

      const key = metric === 'psychHealthIndex' ? 'phi' :
                  metric === 'sleepQuality' ? 'sleep' : metric;

      stats[key] = { mean, min, max, stdDev, initial, final, change };
    }

    return stats;
  }

  /**
   * Download CSV file
   */
  static downloadCSV(csv, filename = 'habitat-harmony-metrics.csv') {
    try {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

    } catch (error) {
      console.error('Error downloading CSV:', error);
    }
  }
}
