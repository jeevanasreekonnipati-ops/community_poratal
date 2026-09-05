// Performance Scoring System for Admins & Optimizers
// Scoring: Resolution Rate (60%) + Response Time (40%)

export type PerformanceScore = {
  id: string;
  officialId: string;
  officialRole: 'admin' | 'optimizer';
  officialName: string;
  location: string; // village for admin, district for optimizer
  month: string; // "June 2026"
  
  // Metrics
  totalSubmissions: number;
  resolvedCount: number;
  pendingCount: number;
  inProgressCount: number;
  
  // Calculations
  resolutionRate: number; // percentage (0-100)
  avgResponseTimeHours: number;
  
  // Scoring
  resolutionScore: number; // 0-60
  timelinessScore: number; // 0-40
  totalScore: number; // 0-100
  
  // Flag status
  flagged: boolean;
  flagReason?: string; // "resolution_rate < 60%" | "response_time > 72h"
  
  createdAt?: Date;
};

// Calculate performance score for an admin/optimizer
export function calculatePerformanceScore(
  officialId: string,
  officialRole: 'admin' | 'optimizer',
  officialName: string,
  location: string,
  month: string,
  metrics: {
    totalSubmissions: number;
    resolvedCount: number;
    pendingCount: number;
    inProgressCount: number;
    avgResponseTimeHours: number;
  }
): PerformanceScore {
  const {
    totalSubmissions,
    resolvedCount,
    pendingCount,
    inProgressCount,
    avgResponseTimeHours,
  } = metrics;

  // Calculate resolution rate (percentage)
  const resolutionRate =
    totalSubmissions === 0 ? 0 : Math.round((resolvedCount / totalSubmissions) * 100);

  // Calculate resolution score (60% weight)
  // ✅ 100% resolution = 60 points
  // ⚠️ < 60% resolution = starts losing points faster
  const resolutionScore = Math.min(
    60,
    Math.max(0, (resolutionRate / 100) * 60)
  );

  // Calculate timeliness score (40% weight)
  // Target: < 24 hours = 40 points
  // Warning: > 72 hours = significant point loss
  let timelinessScore = 40;
  if (avgResponseTimeHours > 72) {
    timelinessScore = Math.max(0, 40 - (avgResponseTimeHours - 72) * 0.2);
  } else if (avgResponseTimeHours > 24) {
    timelinessScore = 40 - ((avgResponseTimeHours - 24) / 48) * 10;
  }
  timelinessScore = Math.round(timelinessScore);

  // Total score
  const totalScore = Math.round(resolutionScore + timelinessScore);

  // Determine if flagged
  let flagged = false;
  let flagReason: string | undefined;

  if (resolutionRate < 60) {
    flagged = true;
    flagReason = `Resolution rate ${resolutionRate}% is below 60% threshold`;
  } else if (avgResponseTimeHours > 72) {
    flagged = true;
    flagReason = `Average response time ${avgResponseTimeHours}h exceeds 72h SLA`;
  }

  return {
    id: `perf-${officialId}-${month}`,
    officialId,
    officialRole,
    officialName,
    location,
    month,
    totalSubmissions,
    resolvedCount,
    pendingCount,
    inProgressCount,
    resolutionRate,
    avgResponseTimeHours,
    resolutionScore: Math.round(resolutionScore),
    timelinessScore,
    totalScore,
    flagged,
    flagReason,
    createdAt: new Date(),
  };
}

// Determine performance tier based on score
export function getPerformanceTier(score: number): 'excellent' | 'good' | 'satisfactory' | 'poor' {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 60) return 'satisfactory';
  return 'poor';
}

// Get performance tier color for UI
export function getPerformanceTierColor(score: number): string {
  const tier = getPerformanceTier(score);
  switch (tier) {
    case 'excellent':
      return '#10b981'; // Green
    case 'good':
      return '#3b82f6'; // Blue
    case 'satisfactory':
      return '#f59e0b'; // Amber
    case 'poor':
      return '#ef4444'; // Red
  }
}

// Get performance tier emoji for UI
export function getPerformanceTierEmoji(score: number): string {
  const tier = getPerformanceTier(score);
  switch (tier) {
    case 'excellent':
      return '🟢';
    case 'good':
      return '🔵';
    case 'satisfactory':
      return '🟡';
    case 'poor':
      return '🔴';
  }
}

// Get flag emoji
export function getFlagStatus(flagged: boolean): string {
  return flagged ? '⚠️' : '—';
}

// Calculate aggregate performance from multiple officials
export function aggregatePerformanceScores(
  scores: PerformanceScore[]
): {
  avgScore: number;
  avgResolutionRate: number;
  avgResponseTime: number;
  flaggedCount: number;
  excellentCount: number;
  goodCount: number;
  satisfactoryCount: number;
  poorCount: number;
} {
  if (scores.length === 0) {
    return {
      avgScore: 0,
      avgResolutionRate: 0,
      avgResponseTime: 0,
      flaggedCount: 0,
      excellentCount: 0,
      goodCount: 0,
      satisfactoryCount: 0,
      poorCount: 0,
    };
  }

  const avgScore = Math.round(
    scores.reduce((sum, s) => sum + s.totalScore, 0) / scores.length
  );
  const avgResolutionRate = Math.round(
    scores.reduce((sum, s) => sum + s.resolutionRate, 0) / scores.length
  );
  const avgResponseTime = Math.round(
    scores.reduce((sum, s) => sum + s.avgResponseTimeHours, 0) / scores.length
  );
  const flaggedCount = scores.filter(s => s.flagged).length;
  const excellentCount = scores.filter(s => getPerformanceTier(s.totalScore) === 'excellent').length;
  const goodCount = scores.filter(s => getPerformanceTier(s.totalScore) === 'good').length;
  const satisfactoryCount = scores.filter(s => getPerformanceTier(s.totalScore) === 'satisfactory').length;
  const poorCount = scores.filter(s => getPerformanceTier(s.totalScore) === 'poor').length;

  return {
    avgScore,
    avgResolutionRate,
    avgResponseTime,
    flaggedCount,
    excellentCount,
    goodCount,
    satisfactoryCount,
    poorCount,
  };
}
