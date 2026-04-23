/**
 * mlPredictor.js — Pure JS time-series predictor (no external ML lib).
 * Runs Model A (Linear Regression) and Model B (RSI momentum).
 */

/** Compute mean of array */
function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/** Compute standard deviation */
function stddev(arr) {
  const m = mean(arr);
  return Math.sqrt(arr.reduce((sum, v) => sum + (v - m) ** 2, 0) / arr.length);
}

/**
 * Model A: Linear regression on recent price closes.
 * @param {number[]} prices - Array of recent prices (oldest first)
 * @returns {{ direction: string, confidence: number, slope: number }}
 */
export function linearRegressionPredict(prices) {
  if (!prices || prices.length < 3) return { direction: "HOLD", confidence: 0, slope: 0 };
  const n = prices.length;
  const xs = Array.from({ length: n }, (_, i) => i);
  const mx = mean(xs);
  const my = mean(prices);
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (prices[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const sd = stddev(prices);
  const threshold = sd * 0.05;
  const rawConf = sd === 0 ? 0 : Math.abs(slope) / sd * 100;
  const confidence = Math.min(99, Math.max(0, Math.round(rawConf)));
  let direction = "HOLD";
  if (slope > threshold) direction = "UP";
  else if (slope < -threshold) direction = "DOWN";
  return { direction, confidence, slope };
}

/**
 * Compute 14-period RSI from price array.
 * @param {number[]} prices
 * @returns {number} RSI value 0-100
 */
export function computeRSI(prices) {
  const period = 14;
  if (!prices || prices.length < period + 1) return 50;
  const deltas = prices.slice(1).map((p, i) => p - prices[i]);
  const gains = deltas.map((d) => (d > 0 ? d : 0));
  const losses = deltas.map((d) => (d < 0 ? -d : 0));
  const recentGains = gains.slice(-period);
  const recentLosses = losses.slice(-period);
  const avgGain = mean(recentGains);
  const avgLoss = mean(recentLosses);
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return Math.round(100 - 100 / (1 + rs));
}

/**
 * Model B: RSI momentum + velocity blend.
 * @param {number[]} prices
 * @returns {{ direction: string, confidence: number, rsi: number }}
 */
export function rsiMomentumPredict(prices) {
  if (!prices || prices.length < 5) return { direction: "HOLD", confidence: 0, rsi: 50 };
  const rsi = computeRSI(prices);
  const last3 = prices.slice(-3);
  const velocity = last3.length >= 2 ? last3[last3.length - 1] - last3[0] : 0;
  let direction = "HOLD";
  let confidence = 0;
  if (rsi > 70) {
    direction = "DOWN";
    confidence = Math.min(99, Math.round((rsi - 70) / 30 * 100));
    if (velocity < 0) confidence = Math.min(99, confidence + 10);
  } else if (rsi < 30) {
    direction = "UP";
    confidence = Math.min(99, Math.round((30 - rsi) / 30 * 100));
    if (velocity > 0) confidence = Math.min(99, confidence + 10);
  } else {
    confidence = Math.round(Math.abs(velocity) / (prices[prices.length - 1] || 1) * 1000);
    confidence = Math.min(60, confidence);
    if (velocity > 0) direction = "UP";
    else if (velocity < 0) direction = "DOWN";
  }
  return { direction, confidence, rsi };
}

/**
 * Run full prediction for a stock given its price history.
 * @param {number[]} history - Price history array (oldest first)
 * @returns {{ modelA: object, modelB: object, shortTerm: string, longTerm: string, combinedConfidence: number, combinedDirection: string }}
 */
export function predictStock(history) {
  if (!history || history.length < 3) {
    return {
      modelA: { direction: "HOLD", confidence: 0, slope: 0 },
      modelB: { direction: "HOLD", confidence: 0, rsi: 50 },
      shortTerm: "HOLD",
      longTerm: "HOLD",
      combinedDirection: "HOLD",
      combinedConfidence: 0,
    };
  }
  const modelA = linearRegressionPredict(history);
  const modelB = rsiMomentumPredict(history);
  // Short-term: driven by RSI/momentum (last few ticks)
  const shortTerm = modelB.direction;
  // Long-term: driven by regression slope (multi-session)
  const longTerm = modelA.direction;
  // Combined: weighted blend (A=40%, B=60% for short-term bias)
  const dirs = { UP: 1, HOLD: 0, DOWN: -1 };
  const blended = dirs[modelA.direction] * 0.4 * modelA.confidence
    + dirs[modelB.direction] * 0.6 * modelB.confidence;
  let combinedDirection = "HOLD";
  if (blended > 10) combinedDirection = "UP";
  else if (blended < -10) combinedDirection = "DOWN";
  const combinedConfidence = Math.min(99, Math.round(Math.abs(blended)));
  return { modelA, modelB, shortTerm, longTerm, combinedDirection, combinedConfidence };
}
