'use client';

import { ThemeProvider } from "@emotion/react";
import NextAppDirEmotionCacheProvider from "./EmotionCache";
import { CssBaseline } from "@mui/material";
import theme from "./theme";


export default function ThemeRegistry({children}: {children: React.ReactNode}){

  return(
    <NextAppDirEmotionCacheProvider options={{ key: 'mui' }}>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        {children}
      </ThemeProvider>
    </NextAppDirEmotionCacheProvider>
  );
}