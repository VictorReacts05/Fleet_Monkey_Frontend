import { createStore, applyMiddleware } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import { thunk } from "redux-thunk";
import reducer from "./reducers/index";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "rootData",
  storage: storage,
  whitelist: ["loginReducer","accessMenu"],
  debug: true,
};

const persistedReducer = persistReducer(persistConfig, reducer);
const store = createStore(persistedReducer, applyMiddleware(thunk));
const persistedStore = persistStore(store);

export { persistedStore, store };
