/**
 * Clinical Alert Rules Engine
 * Implements SIRS, EWS, and custom clinical decision support rules
 */

import { VitalSign } from '../types';

export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertType = 'vital' | 'sirs' | 'ews' | 'custom';

export interface AlertRule {
  id: string;
  name: string;
  type: AlertType;
  severity: AlertSeverity;
  description: string;
  enabled: boolean;
  evaluate: (vitals: VitalSign[]) => boolean;
  message: (vitals: VitalSign[]) => string;
}

export interface Alert {
  id: string;
  patientId: string;
  ruleId: string;
  ruleName: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  notes?: string;
}

// Get the latest vital reading by field name
const getLatestVital = (vitals: VitalSign[], field: keyof VitalSign): number | undefined => {
  // Sort by timestamp descending
  const sorted = vitals
    .filter((v) => v[field] !== undefined)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (sorted.length === 0) return undefined;
  return sorted[0][field] as number;
};

// Check if vital is within time window (minutes)
const isRecentVital = (vital: VitalSign, windowMinutes: number = 60): boolean => {
  const now = new Date();
  const vitalTime = new Date(vital.timestamp);
  const diffMinutes = (now.getTime() - vitalTime.getTime()) / (1000 * 60);
  return diffMinutes <= windowMinutes;
};

// Get recent vitals within time window
const getRecentVitals = (vitals: VitalSign[], windowMinutes: number = 60): VitalSign[] => {
  return vitals.filter((v) => isRecentVital(v, windowMinutes));
};

/**
 * SIRS (Systemic Inflammatory Response Syndrome) Criteria
 * 2 or more of:
 * - Temperature >38°C or <36°C
 * - Heart rate >90 bpm
 * - Respiratory rate >20 breaths/min
 * - WBC >12,000 or <4,000 cells/mm³ (not implemented in vitals)
 */
const evaluateSIRS = (vitals: VitalSign[]): boolean => {
  const recentVitals = getRecentVitals(vitals, 60);
  let criteriaCount = 0;

  const temp = getLatestVital(recentVitals, 'temperature');
  if (temp !== undefined && (temp > 38 || temp < 36)) criteriaCount++;

  const hr = getLatestVital(recentVitals, 'heartRate');
  if (hr !== undefined && hr > 90) criteriaCount++;

  const rr = getLatestVital(recentVitals, 'respiratoryRate');
  if (rr !== undefined && rr > 20) criteriaCount++;

  return criteriaCount >= 2;
};

/**
 * EWS (Early Warning Score) - Simplified version
 * Score based on vital sign deviations:
 * - HR: <40 or >130 = 3 points, 40-50 or 110-130 = 1 point
 * - RR: <8 or >25 = 3 points, 8-11 or 21-24 = 1 point
 * - Temp: <35 or >39 = 3 points, 35-36 or 38-39 = 1 point
 * - SpO2: <90 = 3 points, 90-93 = 2 points, 93-95 = 1 point
 * - SBP: <90 or >220 = 3 points, 90-100 or 200-220 = 2 points
 * 
 * Trigger: Score >= 5
 */
const calculateEWS = (vitals: VitalSign[]): number => {
  const recentVitals = getRecentVitals(vitals, 60);
  let score = 0;

  const hr = getLatestVital(recentVitals, 'heartRate');
  if (hr !== undefined) {
    if (hr < 40 || hr > 130) score += 3;
    else if ((hr >= 40 && hr < 50) || (hr >= 110 && hr <= 130)) score += 1;
  }

  const rr = getLatestVital(recentVitals, 'respiratoryRate');
  if (rr !== undefined) {
    if (rr < 8 || rr > 25) score += 3;
    else if ((rr >= 8 && rr < 12) || (rr >= 21 && rr <= 24)) score += 1;
  }

  const temp = getLatestVital(recentVitals, 'temperature');
  if (temp !== undefined) {
    if (temp < 35 || temp > 39) score += 3;
    else if ((temp >= 35 && temp < 36) || (temp >= 38 && temp <= 39)) score += 1;
  }

  const spo2 = getLatestVital(recentVitals, 'spO2');
  if (spo2 !== undefined) {
    if (spo2 < 90) score += 3;
    else if (spo2 >= 90 && spo2 < 93) score += 2;
    else if (spo2 >= 93 && spo2 < 95) score += 1;
  }

  const sbp = getLatestVital(recentVitals, 'systolicBP');
  if (sbp !== undefined) {
    if (sbp < 90 || sbp > 220) score += 3;
    else if ((sbp >= 90 && sbp < 100) || (sbp >= 200 && sbp <= 220)) score += 2;
  }

  return score;
};

const evaluateEWS = (vitals: VitalSign[]): boolean => {
  return calculateEWS(vitals) >= 5;
};

// Predefined clinical alert rules
export const defaultAlertRules: AlertRule[] = [
  // Critical Vital Signs
  {
    id: 'critical-hr',
    name: 'Critical Heart Rate',
    type: 'vital',
    severity: 'critical',
    description: 'Heart rate below 40 or above 140 bpm',
    enabled: true,
    evaluate: (vitals) => {
      const hr = getLatestVital(getRecentVitals(vitals, 30), 'heartRate');
      return hr !== undefined && (hr < 40 || hr > 140);
    },
    message: (vitals) => {
      const hr = getLatestVital(getRecentVitals(vitals, 30), 'heartRate');
      return `Critical heart rate: ${hr} bpm`;
    },
  },
  {
    id: 'critical-spo2',
    name: 'Critical Oxygen Saturation',
    type: 'vital',
    severity: 'critical',
    description: 'SpO2 below 90%',
    enabled: true,
    evaluate: (vitals) => {
      const spo2 = getLatestVital(getRecentVitals(vitals, 30), 'spO2');
      return spo2 !== undefined && spo2 < 90;
    },
    message: (vitals) => {
      const spo2 = getLatestVital(getRecentVitals(vitals, 30), 'spO2');
      return `Critical oxygen saturation: ${spo2}%`;
    },
  },
  {
    id: 'critical-bp',
    name: 'Critical Blood Pressure',
    type: 'vital',
    severity: 'critical',
    description: 'Systolic BP below 80 or above 180 mmHg',
    enabled: true,
    evaluate: (vitals) => {
      const sbp = getLatestVital(getRecentVitals(vitals, 30), 'systolicBP');
      return sbp !== undefined && (sbp < 80 || sbp > 180);
    },
    message: (vitals) => {
      const sbp = getLatestVital(getRecentVitals(vitals, 30), 'systolicBP');
      const dbp = getLatestVital(getRecentVitals(vitals, 30), 'diastolicBP');
      return `Critical blood pressure: ${sbp}/${dbp} mmHg`;
    },
  },
  {
    id: 'critical-temp',
    name: 'Critical Temperature',
    type: 'vital',
    severity: 'critical',
    description: 'Temperature below 35°C or above 40°C',
    enabled: true,
    evaluate: (vitals) => {
      const temp = getLatestVital(getRecentVitals(vitals, 30), 'temperature');
      return temp !== undefined && (temp < 35 || temp > 40);
    },
    message: (vitals) => {
      const temp = getLatestVital(getRecentVitals(vitals, 30), 'temperature');
      return `Critical temperature: ${temp?.toFixed(1)}°C`;
    },
  },
  {
    id: 'critical-rr',
    name: 'Critical Respiratory Rate',
    type: 'vital',
    severity: 'critical',
    description: 'Respiratory rate below 8 or above 30 breaths/min',
    enabled: true,
    evaluate: (vitals) => {
      const rr = getLatestVital(getRecentVitals(vitals, 30), 'respiratoryRate');
      return rr !== undefined && (rr < 8 || rr > 30);
    },
    message: (vitals) => {
      const rr = getLatestVital(getRecentVitals(vitals, 30), 'respiratoryRate');
      return `Critical respiratory rate: ${rr} breaths/min`;
    },
  },

  // Warning Vital Signs
  {
    id: 'warning-hr',
    name: 'Abnormal Heart Rate',
    type: 'vital',
    severity: 'warning',
    description: 'Heart rate below 50 or above 120 bpm',
    enabled: true,
    evaluate: (vitals) => {
      const hr = getLatestVital(getRecentVitals(vitals, 30), 'heartRate');
      return hr !== undefined && (hr < 50 || hr > 120) && !(hr < 40 || hr > 140);
    },
    message: (vitals) => {
      const hr = getLatestVital(getRecentVitals(vitals, 30), 'heartRate');
      return `Abnormal heart rate: ${hr} bpm`;
    },
  },
  {
    id: 'warning-spo2',
    name: 'Low Oxygen Saturation',
    type: 'vital',
    severity: 'warning',
    description: 'SpO2 below 94%',
    enabled: true,
    evaluate: (vitals) => {
      const spo2 = getLatestVital(getRecentVitals(vitals, 30), 'spO2');
      return spo2 !== undefined && spo2 >= 90 && spo2 < 94;
    },
    message: (vitals) => {
      const spo2 = getLatestVital(getRecentVitals(vitals, 30), 'spO2');
      return `Low oxygen saturation: ${spo2}%`;
    },
  },

  // Clinical Decision Support Rules
  {
    id: 'sirs-criteria',
    name: 'SIRS Criteria Met',
    type: 'sirs',
    severity: 'critical',
    description: 'Systemic Inflammatory Response Syndrome criteria met (≥2 criteria)',
    enabled: true,
    evaluate: evaluateSIRS,
    message: () => 'SIRS criteria met - potential sepsis risk. Immediate assessment required.',
  },
  {
    id: 'ews-high',
    name: 'High Early Warning Score',
    type: 'ews',
    severity: 'critical',
    description: 'Early Warning Score ≥5',
    enabled: true,
    evaluate: evaluateEWS,
    message: (vitals) => {
      const score = calculateEWS(vitals);
      return `High Early Warning Score: ${score} - Immediate clinical review required.`;
    },
  },

  // Trend-based alerts
  {
    id: 'declining-spo2',
    name: 'Declining SpO2 Trend',
    type: 'custom',
    severity: 'warning',
    description: 'SpO2 declining >3% in last hour',
    enabled: true,
    evaluate: (vitals) => {
      const recentVitals = getRecentVitals(vitals, 60).filter((v) => v.spO2 !== undefined);
      if (recentVitals.length < 2) return false;

      const sorted = recentVitals.sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      const first = sorted[0].spO2!;
      const last = sorted[sorted.length - 1].spO2!;

      return first - last > 3;
    },
    message: () => 'SpO2 showing declining trend - monitor closely.',
  },
  {
    id: 'rising-hr',
    name: 'Rising Heart Rate Trend',
    type: 'custom',
    severity: 'warning',
    description: 'Heart rate increasing >20 bpm in last hour',
    enabled: true,
    evaluate: (vitals) => {
      const recentVitals = getRecentVitals(vitals, 60).filter((v) => v.heartRate !== undefined);
      if (recentVitals.length < 2) return false;

      const sorted = recentVitals.sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      const first = sorted[0].heartRate!;
      const last = sorted[sorted.length - 1].heartRate!;

      return last - first > 20;
    },
    message: () => 'Heart rate showing rising trend - assess patient status.',
  },
];

/**
 * Evaluate all enabled rules for a patient's vitals
 */
export const evaluateAlertRules = (
  patientId: string,
  vitals: VitalSign[],
  rules: AlertRule[] = defaultAlertRules
): Alert[] => {
  const alerts: Alert[] = [];
  const enabledRules = rules.filter((rule) => rule.enabled);

  for (const rule of enabledRules) {
    if (rule.evaluate(vitals)) {
      alerts.push({
        id: `${patientId}-${rule.id}-${Date.now()}`,
        patientId,
        ruleId: rule.id,
        ruleName: rule.name,
        type: rule.type,
        severity: rule.severity,
        message: rule.message(vitals),
        timestamp: new Date().toISOString(),
        status: 'active',
      });
    }
  }

  return alerts;
};

/**
 * Get alert statistics
 */
export const getAlertStats = (alerts: Alert[]) => {
  return {
    total: alerts.length,
    active: alerts.filter((a) => a.status === 'active').length,
    acknowledged: alerts.filter((a) => a.status === 'acknowledged').length,
    resolved: alerts.filter((a) => a.status === 'resolved').length,
    critical: alerts.filter((a) => a.severity === 'critical').length,
    warning: alerts.filter((a) => a.severity === 'warning').length,
    info: alerts.filter((a) => a.severity === 'info').length,
  };
};
