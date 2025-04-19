import { SET_LOGIN, SET_LOGOUT } from "../../action-types";

export const setLoginDetails = (data) => async (dispatch) => {
  try {
    dispatch({
      type: SET_LOGIN,
      payload: data,
    });
  } catch (err) {}
};

export const setLogoutNull = () => async (dispatch) => {
  try {
    dispatch({
      type: SET_LOGOUT,
      payload: undefined,
    });
  } catch (err) {}
};
