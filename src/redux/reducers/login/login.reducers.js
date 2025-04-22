import { SET_LOGIN, SET_LOGOUT } from "../../action-types";

const initialState = {
  loginDetails: null, // Only use this correctly spelled property
};

function loginReducer(loginState = initialState, action) {
  const { type, payload } = action;
  
  // Add debug logs
  console.log("Login Reducer - Action:", type, payload);
  console.log("Login Reducer - Current State:", loginState);
  
  switch (type) {
    case SET_LOGIN:
      const newLoginState = { ...loginState, loginDetails: payload };
      console.log("Login Reducer - New State after LOGIN:", newLoginState);
      return newLoginState;
    case SET_LOGOUT:
      return { ...loginState, loginDetails: null };
    default:
      return loginState;
  }
}

export default loginReducer;
