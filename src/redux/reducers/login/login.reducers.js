import { SET_LOGIN, SET_LOGOUT } from "../../action-types";

const initialState = {
  loginDetials: null,
};

function loginReducer(loginState = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_LOGIN:
      return { ...loginState, loginDetials: payload };
    case SET_LOGOUT:
      return { ...loginState, loginDetials: undefined };
    default:
      return loginState;
  }
}

export default loginReducer;
