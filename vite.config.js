import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      '@mui/icons-material/Add',
      // Add other MUI icons you're using here
    ]
  }
})