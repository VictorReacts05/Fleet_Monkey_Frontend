import { createStore, applyMiddleware } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import { thunk } from "redux-thunk";
import reducer from "./reducers/index";
import storage from "redux-persist/lib/storage";

// Add debug logs
// console.log("Configuring Redux store with persistence");

const persistConfig = {
  key: "rootData",
  storage: storage,
  whitelist: ['loginReducer'], // Explicitly whitelist the login reducer
  debug: true, // Enable redux-persist debug mode
};

const persistedReducer = persistReducer(persistConfig, reducer);
const store = createStore(persistedReducer, applyMiddleware(thunk));
const persistedStore = persistStore(store);

// Log initial state
// console.log("Initial Redux State:", store.getState());

// Subscribe to state changes
// store.subscribe(() => {
//   console.log("Redux State Updated:", store.getState());
// });

export { persistedStore, store };
