import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '@/types';

interface ProductContextType {
  cachedProducts: Map<string, Product>;
  cacheProduct: (product: Product) => void;
  getProduct: (id: string) => Product | undefined;
  clearCache: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [cachedProducts, setCachedProducts] = useState<Map<string, Product>>(new Map());

  const cacheProduct = (product: Product) => {
    setCachedProducts((prev) => {
      const newMap = new Map(prev);
      newMap.set(product.id, product);
      return newMap;
    });
  };

  const getProduct = (id: string): Product | undefined => {
    return cachedProducts.get(id);
  };

  const clearCache = () => {
    setCachedProducts(new Map());
  };

  return (
    <ProductContext.Provider
      value={{
        cachedProducts,
        cacheProduct,
        getProduct,
        clearCache,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};
