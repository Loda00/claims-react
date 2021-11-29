/* eslint-disable import/prefer-default-export */

import {
  FETCH_THIRD_PARTY_SUCCEEDED,
  FETCH_THIRD_PARTY_STARTED,
  FETCH_THIRD_PARTY_RESET,
  FETCH_THIRD_PARTY_FAILED
} from 'components/SearchInsured/data/thirdparty/actions';

const initialState = {
  thirdparty: [],
  isLoading: false,
  error: null
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_THIRD_PARTY_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_THIRD_PARTY_SUCCEEDED:
      return {
        ...state,
        isLoading: false,
        thirdparty: action.payload.thirdparty
      };
    case FETCH_THIRD_PARTY_RESET:
      return {
        ...state,
        thirdparty: []
      };
    case FETCH_THIRD_PARTY_FAILED:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    default:
      return state;
  }
};
