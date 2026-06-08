'use client';

import React from 'react';

export function Providers({ children }) {
  // You can add global providers here later (e.g., ThemeProvider, QueryClientProvider)
  return <>{children}</>;
}