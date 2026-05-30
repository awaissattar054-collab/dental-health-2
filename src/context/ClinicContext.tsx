import React, { createContext, useContext, useState, useEffect } from 'react';

export type CurrencyType = 'PKR' | 'USD' | 'AED' | 'GBP';
export type MarketModeType = 'Pakistan' | 'International';

interface ClinicContextType {
  clinicName: string;
  practiceName: string;
  currency: CurrencyType;
  marketMode: MarketModeType;
  setClinicName: (name: string) => void;
  setPracticeName: (name: string) => void;
  setCurrency: (currency: CurrencyType) => void;
  setMarketMode: (mode: MarketModeType) => void;
  formatPrice: (amountInUSD: number, specValueKey?: string) => string;
}

// Map key pricing for Pakistani Rupee (PKR), USD, AED, GBP to correspond to realistic values
const SPECIFIC_VALUES: Record<string, Record<CurrencyType, number>> = {
  mtdRevenue: { PKR: 875000, USD: 54200, AED: 199000, GBP: 43500 },
  avgCaseValue: { PKR: 45000, USD: 2850, AED: 10500, GBP: 2300 },
  rootCanal: { PKR: 35000, USD: 1200, AED: 4400, GBP: 950 },
  consultation: { PKR: 1500, USD: 75, AED: 275, GBP: 60 },
  triageValue: { PKR: 15000, USD: 500, AED: 1800, GBP: 400 },
};

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clinicName, setClinicName] = useState<string>(() => {
    return localStorage.getItem('clinic_name') || 'Dr. Saqib Minhas';
  });
  const [practiceName, setPracticeName] = useState<string>(() => {
    return localStorage.getItem('practice_name') || 'Saqib Dental Clinic';
  });
  const [currency, setCurrency] = useState<CurrencyType>(() => {
    return (localStorage.getItem('clinic_currency') as CurrencyType) || 'PKR';
  });
  const [marketMode, setMarketMode] = useState<MarketModeType>(() => {
    return (localStorage.getItem('clinic_market_mode') as MarketModeType) || 'Pakistan';
  });

  // Handle URL parameter sync on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const clinicParam = params.get('clinic');
    const practiceParam = params.get('practice');

    if (clinicParam) {
      const decodedClinic = decodeURIComponent(clinicParam);
      setClinicName(decodedClinic);
      localStorage.setItem('clinic_name', decodedClinic);
    }
    if (practiceParam) {
      const decodedPractice = decodeURIComponent(practiceParam);
      setPracticeName(decodedPractice);
      localStorage.setItem('practice_name', decodedPractice);
    }
  }, []);

  // Sync state helpers to localStorage
  const updateClinicName = (name: string) => {
    setClinicName(name);
    localStorage.setItem('clinic_name', name);
  };

  const updatePracticeName = (name: string) => {
    setPracticeName(name);
    localStorage.setItem('practice_name', name);
  };

  const updateCurrency = (curr: CurrencyType) => {
    setCurrency(curr);
    localStorage.setItem('clinic_currency', curr);
  };

  const updateMarketMode = (mode: MarketModeType) => {
    setMarketMode(mode);
    localStorage.setItem('clinic_market_mode', mode);
  };

  /**
   * Powerful localization helper for formatting prices
   */
  const formatPrice = (amount: number, specValueKey?: string): string => {
    let resolvedAmount = amount;

    // Use mapped localized values for realism if key specified
    if (specValueKey && SPECIFIC_VALUES[specValueKey]) {
      resolvedAmount = SPECIFIC_VALUES[specValueKey][currency];
    } else {
      // Direct scaling conversion if no specific key exists (based roughly on USD standard)
      if (currency === 'PKR') resolvedAmount = amount * 278; // approx PKR rate
      else if (currency === 'AED') resolvedAmount = amount * 3.67; // AED peg
      else if (currency === 'GBP') resolvedAmount = amount * 0.79; // GBP rate
    }

    if (currency === 'PKR') {
      // Pakistani rupee with Lakh/Crore grouping system (₨ 8,75,000)
      const formatter = new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
      return formatter.format(resolvedAmount).replace('PKR', '₨');
    }

    if (currency === 'AED') {
      const formatter = new Intl.NumberFormat('en-AE', {
        style: 'currency',
        currency: 'AED',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
      return formatter.format(resolvedAmount);
    }

    if (currency === 'GBP') {
      const formatter = new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
      return formatter.format(resolvedAmount);
    }

    // Default to USD
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return formatter.format(resolvedAmount);
  };

  return (
    <ClinicContext.Provider
      value={{
        clinicName,
        practiceName,
        currency,
        marketMode,
        setClinicName: updateClinicName,
        setPracticeName: updatePracticeName,
        setCurrency: updateCurrency,
        setMarketMode: updateMarketMode,
        formatPrice,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};
