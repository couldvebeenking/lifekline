import { KLinePoint } from '../types';

const numericFields = ['age', 'year', 'open', 'close', 'high', 'low', 'score'] as const;
const textFields = ['ganZhi', 'reason'] as const;

export const validateChartPoints = (chartPoints: unknown): KLinePoint[] => {
  if (!Array.isArray(chartPoints)) {
    throw new Error('Invalid data: chartPoints must be an array.');
  }

  if (chartPoints.length !== 100) {
    throw new Error(`Incomplete data: chartPoints must contain exactly 100 entries, received ${chartPoints.length}.`);
  }

  chartPoints.forEach((point, index) => {
    if (!point || typeof point !== 'object') {
      throw new Error(`Invalid chartPoints[${index}]: expected an object.`);
    }

    const record = point as Record<string, unknown>;
    const missingNumericFields = numericFields.filter(
      field => typeof record[field] !== 'number' || !Number.isFinite(record[field])
    );
    const missingTextFields = textFields.filter(
      field => typeof record[field] !== 'string' || record[field].trim() === ''
    );
    const missingFields = [...missingNumericFields, ...missingTextFields];

    if (missingFields.length > 0) {
      const age = typeof record.age === 'number' ? `age ${record.age}` : `entry ${index + 1}`;
      throw new Error(
        `Invalid ${age}: missing or invalid fields: ${missingFields.join(', ')}. ` +
        'Each chart point needs age, year, ganZhi, open, close, high, low, score, and reason.'
      );
    }

    const { open, close, high, low } = record as unknown as KLinePoint;
    if (high < Math.max(open, close) || low > Math.min(open, close) || high < low) {
      throw new Error(
        `Invalid age ${record.age}: expected high >= open/close and low <= open/close.`
      );
    }
  });

  return chartPoints as KLinePoint[];
};
