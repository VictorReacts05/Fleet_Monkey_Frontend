import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-redux",
      "redux",
      "redux-thunk",
      "redux-persist",
      "redux-persist/integration/react",
      "react-router-dom",
      "@mui/material",
      "@mui/x-date-pickers/LocalizationProvider",
      "@mui/x-date-pickers/AdapterDateFns",
    ],
  },
});
