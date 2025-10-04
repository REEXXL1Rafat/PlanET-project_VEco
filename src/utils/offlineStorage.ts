import { Product, ScanHistory } from "@/types";

const OFFLINE_SCANS_KEY = 'ecoverify-offline-scans';
const OFFLINE_PRODUCTS_KEY = 'ecoverify-offline-products';

export const offlineStorage = {
  // Save scanned product for offline access
  saveProduct: (product: Product): void => {
    try {
      const products = offlineStorage.getProducts();
      const existingIndex = products.findIndex(p => p.id === product.id);
      
      if (existingIndex >= 0) {
        products[existingIndex] = product;
      } else {
        products.push(product);
      }
      
      localStorage.setItem(OFFLINE_PRODUCTS_KEY, JSON.stringify(products));
    } catch (error) {
      console.error('Failed to save product offline:', error);
    }
  },

  // Get all offline products
  getProducts: (): Product[] => {
    try {
      const data = localStorage.getItem(OFFLINE_PRODUCTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get offline products:', error);
      return [];
    }
  },

  // Get specific product
  getProduct: (id: string): Product | null => {
    const products = offlineStorage.getProducts();
    return products.find(p => p.id === id) || null;
  },

  // Save offline scan (to sync later)
  saveOfflineScan: (scan: Omit<ScanHistory, 'id'>): void => {
    try {
      const scans = offlineStorage.getOfflineScans();
      scans.push({
        ...scan,
        id: `offline-${Date.now()}-${Math.random()}`,
      });
      localStorage.setItem(OFFLINE_SCANS_KEY, JSON.stringify(scans));
    } catch (error) {
      console.error('Failed to save offline scan:', error);
    }
  },

  // Get all offline scans
  getOfflineScans: (): ScanHistory[] => {
    try {
      const data = localStorage.getItem(OFFLINE_SCANS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get offline scans:', error);
      return [];
    }
  },

  // Clear synced scans
  clearOfflineScans: (): void => {
    try {
      localStorage.removeItem(OFFLINE_SCANS_KEY);
    } catch (error) {
      console.error('Failed to clear offline scans:', error);
    }
  },

  // Clear all offline data
  clearAll: (): void => {
    try {
      localStorage.removeItem(OFFLINE_SCANS_KEY);
      localStorage.removeItem(OFFLINE_PRODUCTS_KEY);
    } catch (error) {
      console.error('Failed to clear offline storage:', error);
    }
  },

  // Get storage usage
  getStorageSize: (): number => {
    try {
      let total = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
      return total / 1024; // Return size in KB
    } catch (error) {
      console.error('Failed to calculate storage size:', error);
      return 0;
    }
  },
};
