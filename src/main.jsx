import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx';

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistedStore, store } from "./redux/store.js";

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    {/* Removed StrictMode for now to test persistence */}
    <PersistGate loading={null} persistor={persistedStore}>
      <App />
    </PersistGate>
  </Provider>,
)
