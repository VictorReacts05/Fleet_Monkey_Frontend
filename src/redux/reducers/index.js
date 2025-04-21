import { combineReducers } from "redux";
import loginReducer from "./login/login.reducers";
import customerReducer from "./customer/customer.slice";

export default combineReducers({
  loginReducer,
  customer: customerReducer
});
