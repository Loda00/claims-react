import { SWITCH_LOADER } from 'services/ui/actions';

const initialState = {
  isLoadingGlobal: false
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SWITCH_LOADER:
      return {
        ...state,
        isLoadingGlobal: !state.isLoadingGlobal
      };
    default:
      return state;
  }
};
