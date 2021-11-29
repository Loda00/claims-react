import * as api from 'services/users/api';
import { Auth } from 'aws-amplify';
import { fetch } from 'services/api/actions';
import * as uiActionCreators from 'services/ui/actions';
import { CONSTANTS_APP, SERVICES_ERROR_DESC } from 'constants/index';

export const SWITCH_USER_START = 'SWITCH_USER_START';
export const SWITCH_USER_FINISHED = 'SWITCH_USER_FINISHED';

export const FETCH_USER_CLAIMS_START = 'FETCH_USER_CLAIMS_START';
export const FETCH_USER_CLAIMS_SUCCEEDED = 'FETCH_USER_CLAIMS_SUCCEEDED';
export const FETCH_USER_CLAIMS_FAILED = 'FETCH_USER_CLAIMS_FAILED';

export const LOADED_USER_GLOBAL = 'LOADED_USER_GLOBAL';
export const LOAD_USER_GLOBAL = 'LOAD_USER_GLOBAL';

export const SIGNOUT_START = 'SIGNOUT_START';
export const SIGNOUT_FINISH = 'SIGNOUT_FINISH';

// when user sign in / out
export function switchUserStart() {
  return {
    type: SWITCH_USER_START
  };
}

export function switchUserFinished(user) {
  return {
    type: SWITCH_USER_FINISHED,
    user
  };
}

export function loadUserGlobal() {
  return {
    type: LOAD_USER_GLOBAL
  };
}

export function loadedUserGlobal() {
  return {
    type: LOADED_USER_GLOBAL
  };
}

export function fetchUserClaimsStart() {
  return {
    type: FETCH_USER_CLAIMS_START
  };
}

export function fetchUserClaimsSucceeded(user) {
  return {
    type: FETCH_USER_CLAIMS_SUCCEEDED,
    payload: user
  };
}

export function fetchUserClaimsFailed(errorUserClaims) {
  return {
    type: FETCH_USER_CLAIMS_FAILED,
    payload: errorUserClaims
  };
}

export function signOutStart() {
  return {
    type: SIGNOUT_START
  };
}

export function signOutFinish() {
  return {
    type: SIGNOUT_FINISH
  };
}

export const signOut = () => dispatch => {
  dispatch(signOutStart());
  Auth.signOut().finally(() => dispatch(signOutFinish()));
};

export const fetchUserClaims = () => dispatch =>
  new Promise((resolve, reject) => {
    dispatch(fetchUserClaimsStart());
    dispatch(fetch(api.fetchUserClaims, {}))
      .then(resp => {
        switch (resp.code) {
          case 'CRG-000':
            dispatch(fetchUserClaimsSucceeded(resp.data[0]));
            resolve();
            break;
          case 'CRG-001':
            dispatch(fetchUserClaimsFailed({ message: SERVICES_ERROR_DESC.FETCH_USER_CLAIMS_INACTIVO[resp.code] }));
            reject(SERVICES_ERROR_DESC.FETCH_USER_CLAIMS_INACTIVO[resp.code]);
            break;
          case 'CRG-204':
            dispatch(fetchUserClaimsFailed({ message: SERVICES_ERROR_DESC.FETCH_USER_CLAIMS[resp.code] }));
            reject(SERVICES_ERROR_DESC.FETCH_USER_CLAIMS[resp.code]);
            break;
          default:
            dispatch(fetchUserClaimsFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
            dispatch(uiActionCreators.switchLoader());
            reject(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
        }
      })
      .catch(error => {
        dispatch(fetchUserClaimsFailed({ message: CONSTANTS_APP.GENERIC_ERROR_MESSAGE }));
        reject(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
      });
  });
