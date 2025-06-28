import { combineReducers } from "redux";
import loginReducer from "./login/login.reducers";
import customerReducer from "./customer/customer.slice";
import accessMenusReducer from "./accessMenus/accessmenu.reducers";

export default combineReducers({
  loginReducer,
  accessMenu: accessMenusReducer,
  customer: customerReducer,
});
