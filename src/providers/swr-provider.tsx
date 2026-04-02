"use client";

import { SWRConfig } from "swr";
import type { ReactNode } from "react";

interface SwrProviderProps {
  children: ReactNode;
}

export default function SwrProvider({ children }: SwrProviderProps) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 5000,
        errorRetryCount: 2,
      }}
    >
      {children}
    </SWRConfig>
  );
}
