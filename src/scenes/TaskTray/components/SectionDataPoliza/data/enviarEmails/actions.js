import * as api from 'scenes/TaskTray/components/SectionDataPoliza/data/enviarEmails/api';
import { fetch } from 'services/api/actions';

export const ENVIAR_EMAILS_STARTED = 'SectionDataPoliza/data/dataPoliza/ENVIAR_EMAILS_STARTED';
export const ENVIAR_EMAILS_FINISHED = 'SectionDataPoliza/data/dataPoliza/ENVIAR_EMAILS_FINISHED';
export const ENVIAR_EMAILS_RESET = 'SectionDataPoliza/data/dataPoliza/ENVIAR_EMAILS_RESET';

export function enviarEmailsStarted() {
  return {
    type: ENVIAR_EMAILS_STARTED
  };
}

export function enviarEmailsFinished(data) {
  return {
    type: ENVIAR_EMAILS_FINISHED,
    payload: {
      isLoading: false,
      data
    }
  };
}

export function fetchPolizaReset() {
  return {
    type: ENVIAR_EMAILS_RESET
  };
}

export const enviarEmails = request => dispatch =>
  new Promise((resolve, reject) => {
    dispatch(enviarEmailsStarted());
    dispatch(fetch(api.enviarEmails, request))
      .then(resp => {
        if (resp.code === 'CRG-000') {
          dispatch(enviarEmailsFinished(resp.data));
          resolve(resp);
        } else {
          dispatch(enviarEmailsFinished([]));
          reject(resp.message);
        }
      })
      .catch(error => {
        dispatch(enviarEmailsFinished([]));
        reject(error);
      });
  });
