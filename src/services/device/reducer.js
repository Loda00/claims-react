import { SHOW_SIDER, SHOW_SCROLL } from 'services/device/actions';

const initialState = {
  siderCollapsed: false,
  scrollActivated: false
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SHOW_SIDER:
      return {
        ...state,
        siderCollapsed: !state.siderCollapsed
      };

    case SHOW_SCROLL:
      return {
        ...state,
        scrollActivated: action.payload
      };
    default:
      return state;
  }
};
