import { flatten, map, find } from 'lodash';
import {
  FETCH_COVERAGES_ADJUSTERS_STARTED,
  FETCH_COVERAGES_ADJUSTERS_FINISHED
} from 'scenes/TaskTray/components/SectionDataCobertura/data/coveragesAdjusters/actions';

const initialState = {
  coveragesAdjusters: [],
  isLoading: false
};

export const getCoveragesAdjusters = state =>
  state.scenes.taskTray.taskTrayComponents.sectionCoverages.data.coveragesAdjusters;

export const getRamos = state => {
  const coveragesAdjusters =
    state.scenes.taskTray.taskTrayComponents.sectionCoverages.data.coveragesAdjusters.coveragesAdjusters[0] || {};
  return coveragesAdjusters.ramos;
};

export const getIndFronting = state => {
  const coveragesAdjusters =
    state.scenes.taskTray.taskTrayComponents.sectionCoverages.data.coveragesAdjusters.coveragesAdjusters[0] || [];
  return coveragesAdjusters.indFronting;
};

export const getDescProducto = state => {
  const coveragesAdjusters =
    state.scenes.taskTray.taskTrayComponents.sectionCoverages.data.coveragesAdjusters.coveragesAdjusters[0] || [];
  return coveragesAdjusters.descripcionProducto || '';
};
export const getIndFacultativo = state => {
  const coveragesAdjusters =
    state.scenes.taskTray.taskTrayComponents.sectionCoverages.data.coveragesAdjusters.coveragesAdjusters[0] || [];
  return coveragesAdjusters.indFacultativo;
};
export const getCodigoCausa = state => {
  const coberturas =
    state.scenes.taskTray.taskTrayComponents.sectionCoverages.data.coveragesAdjusters.coveragesAdjusters[0] ||
    undefined;

  return (
    (coberturas &&
      coberturas.ramos[0] &&
      coberturas.ramos[0].coberturas[0] &&
      coberturas.ramos[0].coberturas[0].codCausa) ||
    ''
  );
};

export const getTotalReservaPorRamo = state => {
  const coberturas =
    state.scenes.taskTray.taskTrayComponents.sectionCoverages.data.coveragesAdjusters.coveragesAdjusters[0] ||
    undefined;
  const ramos = (coberturas && coberturas.ramos) || undefined;
  const sumaTotalReservaCoberturaPorRamo =
    (ramos &&
      ramos.map(ramo => {
        let totalReservaCoberturas = 0;
        ramo.coberturas.forEach(cobertura => {
          totalReservaCoberturas += parseFloat(cobertura.montoReserva);
        });
        return {
          codRamo: ramo.codRamo,
          secRamo: ramo.secRamo,
          totalReservaCoberturas
        };
      })) ||
    null;
  return sumaTotalReservaCoberturaPorRamo;
};

export const getCodigoConsecuencia = state => {
  const coberturas =
    state.scenes.taskTray.taskTrayComponents.sectionCoverages.data.coveragesAdjusters.coveragesAdjusters[0] ||
    undefined;
  return (
    (coberturas &&
      coberturas.ramos[0] &&
      coberturas.ramos[0].coberturas[0] &&
      coberturas.ramos[0].coberturas[0].codConsecuencia) ||
    ''
  );
};

export const getIndSinCobertura = (state, codProceso) => {
  const {
    scenes: {
      taskTray: {
        taskTrayComponents: {
          sectionCoverages: {
            data: {
              coveragesAdjusters: {
                coveragesAdjusters: { ramos }
              }
            }
          }
        }
      }
    }
  } = state;
  return find(flatten(map(ramos, 'coberturas')), ['codProceso', codProceso]);
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_COVERAGES_ADJUSTERS_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_COVERAGES_ADJUSTERS_FINISHED:
      return {
        ...state,
        isLoading: false,
        coveragesAdjusters: action.payload.coveragesAdjusters
      };
    default:
      return state;
  }
};
