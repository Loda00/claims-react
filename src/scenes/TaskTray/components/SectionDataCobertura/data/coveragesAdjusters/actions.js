import { pcoveragesAdjusters } from 'scenes/TaskTray/components/SectionDataCobertura/data/coveragesAdjusters/api';
import { fetch } from 'services/api/actions';
import { CONSTANTS_APP } from 'constants/index';

// import { getCoveragesAdjusters } from 'scenes/TaskTray/components/SectionDataCobertura/data/coveragesAdjusters/reducer';

export const FETCH_COVERAGES_ADJUSTERS_STARTED = 'FETCH_COVERAGES_ADJUSTERS_STARTED';
export const FETCH_COVERAGES_ADJUSTERS_FINISHED = 'FETCH_COVERAGES_ADJUSTERS_FINISHED';

export function fetchCoveragesAdjustersStarted() {
  return {
    type: FETCH_COVERAGES_ADJUSTERS_STARTED
  };
}

export function fetchCoveragesAdjustersFinished(coveragesAdjusters) {
  return {
    type: FETCH_COVERAGES_ADJUSTERS_FINISHED,
    payload: {
      coveragesAdjusters
    }
  };
}

export function fetchCoveragesAdjusters(numSin, idePol, numCert, ideSin, idCaso) {
  return dispatch =>
    new Promise((resolve, reject) => {
      dispatch(fetchCoveragesAdjustersStarted());
      dispatch(
        fetch(pcoveragesAdjusters, {
          numSin,
          idePol,
          numCert,
          ideSin,
          idCaso: Number(idCaso)
        })
      )
        .then(resp => {
          if (resp.code === 'CRG-000') {
            dispatch(fetchCoveragesAdjustersFinished(resp.data));
            resolve(resp);
          } else {
            dispatch(fetchCoveragesAdjustersFinished([]));
            reject(resp.message);
          }
        })
        .catch(() => {
          dispatch(fetchCoveragesAdjustersFinished([]));
          reject(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
        });
    });
}
