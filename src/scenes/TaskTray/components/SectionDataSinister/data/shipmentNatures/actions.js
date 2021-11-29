import * as api from 'services/types/api';
import { fetch } from 'services/api/actions';

export const FETCH_SHIPMENT_NATURES_STARTED = 'SectionDataSinister/data/shipmentNatures/FETCH_SHIPMENT_NATURES_STARTED';
export const FETCH_SHIPMENT_NATURES_FINISHED =
  'SectionDataSinister/data/shipmentNatures/FETCH_SHIPMENT_NATURES_FINISHED';

export function fetchShipmentNaturesStarted() {
  return {
    type: FETCH_SHIPMENT_NATURES_STARTED
  };
}

export function fetchShipmentNaturesFinished(data) {
  return {
    type: FETCH_SHIPMENT_NATURES_FINISHED,
    payload: {
      isLoading: false,
      shipmentNatures: data
    }
  };
}

export const fetchShipmentNatures = ruta => dispatch =>
  new Promise((resolve, reject) => {
    dispatch(fetchShipmentNaturesStarted());
    dispatch(fetch(api.fetchTypes, { ruta }))
      .then(resp => {
        if (resp.code === 'CRG-000') {
          dispatch(fetchShipmentNaturesFinished(resp.data));
          resolve(resp);
        } else {
          dispatch(fetchShipmentNaturesFinished([]));
          reject(resp.message);
        }
      })
      .catch(error => {
        dispatch(fetchShipmentNaturesFinished([]));
        reject(error);
      });
  });
