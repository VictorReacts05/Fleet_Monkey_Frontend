import { SET_ACCESSMENU } from "../../action-types";

export const setAccessMenuDetails = (data) => async (dispatch) => {
  try {
    dispatch({
      type: SET_ACCESSMENU,
      payload: data,
    });
  } catch (err) {}
};
