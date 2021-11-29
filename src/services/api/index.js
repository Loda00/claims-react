import { API } from 'aws-amplify';
import { API_NAME_SYN, API_NAME_RIMAC } from 'constants/index';

export function post(endpoint, data) {
  const myInit = {
    body: data
  };
  return API.post(API_NAME_SYN, endpoint, myInit);
}

export function postRimac(endpoint, data) {
  const myInit = {
    body: data
  };
  return API.post(API_NAME_RIMAC, endpoint, myInit);
}
