import { SET_LOGIN, SET_LOGOUT } from "../../action-types";

const initialState = {
  loginDetails: null,
};

function loginReducer(loginState = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case SET_LOGIN:
      const newLoginState = { ...loginState, loginDetails: payload };
      return newLoginState;
    case SET_LOGOUT:
      return { ...loginState, loginDetails: null };
    default:
      return loginState;
  }
}

export default loginReducer;
