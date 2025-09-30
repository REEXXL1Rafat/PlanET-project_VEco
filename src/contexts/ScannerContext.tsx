import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ScannerContextType {
  isScanning: boolean;
  setIsScanning: (value: boolean) => void;
  scannedCode: string | null;
  setScannedCode: (value: string | null) => void;
  lastScanTime: Date | null;
  setLastScanTime: (value: Date | null) => void;
}

const ScannerContext = createContext<ScannerContextType | undefined>(undefined);

export const ScannerProvider = ({ children }: { children: ReactNode }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);

  return (
    <ScannerContext.Provider
      value={{
        isScanning,
        setIsScanning,
        scannedCode,
        setScannedCode,
        lastScanTime,
        setLastScanTime,
      }}
    >
      {children}
    </ScannerContext.Provider>
  );
};

export const useScanner = () => {
  const context = useContext(ScannerContext);
  if (!context) {
    throw new Error('useScanner must be used within a ScannerProvider');
  }
  return context;
};
