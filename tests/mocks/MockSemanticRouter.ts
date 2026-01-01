/**
 * MockSemanticRouter - London School Mock Factory
 *
 * Mock implementation for Semantic Routing with vector similarity
 */

import { jest } from '@jest/globals';

export interface SemanticRouterInterface {
  initialize(): Promise<void>;
  addRoute(name: string, pattern: string, handler: string, metadata?: any): Promise<void>;
  route(input: string): Promise<RouteMatch | null>;
  routeBatch(inputs: string[]): Promise<RouteMatch[]>;
  updateRoute(name: string, updates: Partial<Route>): Promise<void>;
  removeRoute(name: string): Promise<void>;
  getRouteStats(name: string): Promise<RouteStats>;
  optimizeRoutes(): Promise<void>;
}

export interface Route {
  name: string;
  pattern: string;
  handler: string;
  embedding: number[];
  metadata?: any;
}

export interface RouteMatch {
  route: Route;
  similarity: number;
  confidence: number;
}

export interface RouteStats {
  totalMatches: number;
  averageConfidence: number;
  lastMatched: Date;
}

/**
 * Creates a mock SemanticRouter instance
 */
export function createMockSemanticRouter(config: Partial<SemanticRouterInterface> = {}): jest.Mocked<SemanticRouterInterface> {
  const mock: jest.Mocked<SemanticRouterInterface> = {
    initialize: jest.fn().mockResolvedValue(undefined),
    addRoute: jest.fn().mockResolvedValue(undefined),
    route: jest.fn().mockResolvedValue(null),
    routeBatch: jest.fn().mockResolvedValue([]),
    updateRoute: jest.fn().mockResolvedValue(undefined),
    removeRoute: jest.fn().mockResolvedValue(undefined),
    getRouteStats: jest.fn().mockResolvedValue({
      totalMatches: 0,
      averageConfidence: 0,
      lastMatched: new Date()
    }),
    optimizeRoutes: jest.fn().mockResolvedValue(undefined)
  };

  Object.assign(mock, config);
  return mock;
}

export const MockSemanticRouterPresets = {
  success: () => createMockSemanticRouter(),

  withMatch: (match: RouteMatch) => createMockSemanticRouter({
    route: jest.fn().mockResolvedValue(match)
  }),

  withBatchMatches: (matches: RouteMatch[]) => createMockSemanticRouter({
    routeBatch: jest.fn().mockResolvedValue(matches)
  }),

  noMatch: () => createMockSemanticRouter({
    route: jest.fn().mockResolvedValue(null),
    routeBatch: jest.fn().mockResolvedValue([])
  }),

  error: (error = new Error('SemanticRouter error')) => createMockSemanticRouter({
    route: jest.fn().mockRejectedValue(error),
    addRoute: jest.fn().mockRejectedValue(error)
  })
};

export const SemanticRouterContract = {
  initialize: 'function',
  addRoute: 'function',
  route: 'function',
  routeBatch: 'function',
  updateRoute: 'function',
  removeRoute: 'function',
  getRouteStats: 'function',
  optimizeRoutes: 'function'
};
