import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Den eneste fil over 500 kB er Shikis GraphQL-grammatik (den indlejrer JS/TS).
    // Den hentes kun, når en GraphQL-kodeblok vises, så den belaster ikke opstart.
    chunkSizeWarningLimit: 600,
    rolldownOptions: {
      output: {
        // Biblioteker og fagindhold i hver sin fil, så ingen enkelt fil bliver tung.
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/ },
            { name: 'motion', test: /node_modules[\\/](motion|framer-motion|motion-dom|motion-utils)[\\/]/ },
            // De store fag får hver deres fil; resten deles om én.
            { name: 'indhold-bad', test: /src[\\/]content[\\/]bad[\\/]/, priority: 2 },
            { name: 'indhold-fed', test: /src[\\/]content[\\/]fed[\\/]/, priority: 2 },
            { name: 'indhold-swt', test: /src[\\/]content[\\/]swt[\\/]/, priority: 2 },
            { name: 'indhold', test: /src[\\/]content[\\/]/, priority: 1 },
          ],
        },
      },
    },
  },
})
