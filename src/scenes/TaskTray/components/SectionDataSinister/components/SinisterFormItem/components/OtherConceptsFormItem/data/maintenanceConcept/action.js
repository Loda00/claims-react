import * as api from 'scenes/TaskTray/components/SectionDataSinister/components/SinisterFormItem/components/OtherConceptsFormItem/data/maintenanceConcept/api';
import { fetch } from 'services/api/actions';

export const FECTH_MAINTENANCE_CONCEPT_STARTED =
  'scenes/TaskTray/component/SectionDataSinister/components/SinisterFormItem/components/OtherConceptsFormItem/data/MaintenanceConcept/FECTH_MAINTENANCE_CONCEPT_STARTED';
export const FECTH_MAINTENANCE_CONCEPT_FINISHED =
  'scenes/TaskTray/component/SectionDataSinister/components/SinisterFormItem/components/OtherConceptsFormItem/data/MaintenanceConcept/FECTH_MAINTENANCE_CONCEPT_FINISHED';

export function fetchMaintenanceConceptStarted() {
  return {
    type: FECTH_MAINTENANCE_CONCEPT_STARTED
  };
}

export function fetchMaintenanceConceptFinished(data) {
  return {
    type: FECTH_MAINTENANCE_CONCEPT_FINISHED,
    payload: {
      isLoading: false,
      data
    }
  };
}

export const fetchMaintenanceConcept = request => dispatch =>
  new Promise((resolve, reject) => {
    dispatch(fetchMaintenanceConceptStarted());
    dispatch(fetch(api.fetchMaintenanceConcept, request))
      .then(resp => {
        if (resp.code === 'CRG-000') {
          dispatch(fetchMaintenanceConceptFinished(resp.data));
          resolve(resp);
        } else {
          dispatch(fetchMaintenanceConceptFinished([]));
          reject(resp.message);
        }
      })
      .catch(error => {
        dispatch(fetchMaintenanceConceptFinished([]));
        reject(error);
      });
  });
