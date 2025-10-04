// Performance monitoring utilities
import React from 'react';

export const performance = {
  // Mark start of an operation
  mark: (name: string) => {
    if ('performance' in window) {
      window.performance.mark(name);
    }
  },

  // Measure duration between two marks
  measure: (name: string, startMark: string, endMark?: string) => {
    if ('performance' in window) {
      try {
        if (endMark) {
          window.performance.measure(name, startMark, endMark);
        } else {
          window.performance.measure(name, startMark);
        }
        
        const measure = window.performance.getEntriesByName(name)[0];
        return measure?.duration || 0;
      } catch (error) {
        console.error('Performance measurement error:', error);
        return 0;
      }
    }
    return 0;
  },

  // Get all performance entries
  getEntries: () => {
    if ('performance' in window) {
      return window.performance.getEntries();
    }
    return [];
  },

  // Clear performance data
  clear: () => {
    if ('performance' in window) {
      window.performance.clearMarks();
      window.performance.clearMeasures();
    }
  },

  // Get web vitals
  getWebVitals: async () => {
    const vitals: Record<string, number> = {};

    // Get navigation timing
    const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      vitals.ttfb = navigation.responseStart - navigation.requestStart; // Time to First Byte
      vitals.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
      vitals.loadComplete = navigation.loadEventEnd - navigation.loadEventStart;
    }

    // Get paint timing
    const paintEntries = window.performance.getEntriesByType('paint');
    paintEntries.forEach((entry) => {
      if (entry.name === 'first-contentful-paint') {
        vitals.fcp = entry.startTime;
      }
      if (entry.name === 'first-paint') {
        vitals.fp = entry.startTime;
      }
    });

    // Get Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        vitals.lcp = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP not supported');
    }

    // Get First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceEventTiming[];
        entries.forEach((entry) => {
          vitals.fid = entry.processingStart - entry.startTime;
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID not supported');
    }

    // Get Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            vitals.cls = clsValue;
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS not supported');
    }

    return vitals;
  },

  // Log performance metrics
  logMetrics: () => {
    if ('performance' in window) {
      const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        console.group('Performance Metrics');
        console.log('DNS Lookup:', navigation.domainLookupEnd - navigation.domainLookupStart, 'ms');
        console.log('TCP Connection:', navigation.connectEnd - navigation.connectStart, 'ms');
        console.log('Request Time:', navigation.responseStart - navigation.requestStart, 'ms');
        console.log('Response Time:', navigation.responseEnd - navigation.responseStart, 'ms');
        console.log('DOM Processing:', navigation.domComplete - navigation.domInteractive, 'ms');
        console.log('Total Load Time:', navigation.loadEventEnd - navigation.fetchStart, 'ms');
        console.groupEnd();
      }
    }
  },
};

// Track component render time (use React.memo for class components)
export function withPerformance<P extends object>(
  Component: React.ComponentType<P>,
  name: string
): React.FC<P> {
  const WrappedComponent: React.FC<P> = (props: P) => {
    performance.mark(`${name}-render-start`);
    const result = React.createElement(Component, props);
    performance.mark(`${name}-render-end`);
    performance.measure(`${name}-render`, `${name}-render-start`, `${name}-render-end`);
    return result;
  };
  return WrappedComponent;
}
