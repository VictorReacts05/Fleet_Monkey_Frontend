import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-redux",
      "redux-persist",
      "redux-thunk",
      "react-router-dom",
      "@mui/material",
      "@mui/x-date-pickers/LocalizationProvider",
      "@mui/x-date-pickers/AdapterDateFns",
    ],
  },
});
