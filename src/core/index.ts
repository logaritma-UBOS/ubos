/**
 * UBOS Shared Core - Entry Point
 *
 * Re-exports semua engine dari src/core untuk kemudahan import.
 *
 * Penggunaan di Web (existing hooks):
 *   import { buildLogaritmaState, determineLogaritmaAction } from '@/core';
 *
 * Penggunaan di Android (Expo) nantinya:
 *   import { buildLogaritmaState } from '@ubos/core';  (setelah dijadikan package)
 */

// Logaritma Engine
export * from './logaritma';
export type {
  RawTransaction,
  RawProduct,
  LogaritmaConfig,
  DailyMetrics,
  StockMetrics,
  LogaritmaState,
  LogaritmaActionType,
  LogaritmaAction,
} from './logaritma';

// Calculation / HPP Engine
export * from './calculation';
export type {
  TransactionItem,
  CartSummary,
  HPPInput,
  HPPResult,
  FinancialSummary,
} from './calculation';

// Recommendation Engine
export * from './recommendation';
export type {
  BusinessProfile,
  BusinessMetrics,
  RecommendationPriority,
  BusinessRecommendation,
} from './recommendation';
