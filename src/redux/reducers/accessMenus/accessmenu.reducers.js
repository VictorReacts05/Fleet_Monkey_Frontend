import { SET_ACCESSMENU } from "../../action-types";

const initialState = {
  accessMenuData: null,
};

function accessMenusReducer(menuState = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case SET_ACCESSMENU:
      const newMenuState = { ...menuState, accessMenuData: payload };
      return newMenuState;

    default:
      return menuState;
  }
}

export default accessMenusReducer;
