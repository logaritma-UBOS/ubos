'use client';
import { createContext, useContext } from 'react';

export const MerchantContext = createContext<{ merchant: any | null }>({ merchant: null });

export const useMerchant = () => useContext(MerchantContext);
