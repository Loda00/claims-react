import { FETCH_TEAMS_SUCCEEDED, FETCH_TEAMS_STARTED, FETCH_TEAMS_FAILED } from 'scenes/data/teams/action';

const initialState = {
  teams: [],
  isLoading: false,
  error: null
};

export const getListTeams = state => state.scenes.data.teams;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_TEAMS_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_TEAMS_SUCCEEDED:
      return {
        ...state,
        isLoading: false,
        teams: action.payload.teams
      };
    case FETCH_TEAMS_FAILED:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    default:
      return state;
  }
};
