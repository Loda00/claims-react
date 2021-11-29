import {
  FETCH_ACCOUNT_TYPES_STARTED,
  FETCH_ACCOUNT_TYPES_FINISHED
} from 'scenes/TaskTray/components/SectionPayments/data/accountTypes/actions';

const initialState = {
  accountTypes: [],
  isLoading: false
};

export const getAccountTypes = state => state.scenes.taskTray.taskTrayComponents.searchRegistry.data.accountTypes;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ACCOUNT_TYPES_STARTED:
      return {
        ...state,
        isLoading: true
      };
    case FETCH_ACCOUNT_TYPES_FINISHED:
      return {
        ...state,
        isLoading: false,
        accountTypes: action.payload.accountTypes
      };
    default:
      return state;
  }
};
