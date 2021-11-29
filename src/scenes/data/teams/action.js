import * as api from 'scenes/data/teams/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

export const FETCH_TEAMS_STARTED = 'scenes/data/teams/FETCH_TEAMS_STARTED';
export const FETCH_TEAMS_SUCCEEDED = 'scenes/data/teams/FETCH_TEAMS_SUCCEEDED';
export const FETCH_TEAMS_FAILED = 'scenes/data/teams/FETCH_TEAMS_FAILED';

export function fetchTeamsStarted() {
  return {
    type: FETCH_TEAMS_STARTED
  };
}

export function fetchTeamsSucceeded(teams) {
  return {
    type: FETCH_TEAMS_SUCCEEDED,
    payload: {
      teams
    }
  };
}

export function fetchTeamsFailed(error) {
  return {
    type: FETCH_TEAMS_FAILED,
    payload: error
  };
}

export const fetchTeams = () => dispatch =>
  new Promise(function(resolve, reject) {
    dispatch(fetchTeamsStarted());
    dispatch(fetch(api.fetchTeams, {}))
      .then(resp => {
        if (resp.code === 'CRG-000') {
          dispatch(fetchTeamsSucceeded(resp.data));
          resolve(resp.data);
        } else {
          dispatch(fetchTeamsFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
          reject(resp.message);
        }
      })
      .catch(error => {
        dispatch(fetchTeamsFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
        reject(error);
      });
  });
