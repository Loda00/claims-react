import {
  FETCH_SHIPMENT_NATURES_STARTED,
  FETCH_SHIPMENT_NATURES_FINISHED
} from 'scenes/TaskTray/components/SectionDataSinister/data/shipmentNatures/actions';

const initialState = {
  shipmentNatures: [],
  isLoading: false
};

export const getShipmentNatures = state =>
  state.scenes.taskTray.taskTrayComponents.sectionDataSinister.data.shipmentNatures;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_SHIPMENT_NATURES_STARTED:
      return {
        ...state,
        isLoading: true
      };
    case FETCH_SHIPMENT_NATURES_FINISHED:
      return {
        ...state,
        isLoading: false,
        shipmentNatures: action.payload.shipmentNatures
      };
    default:
      return state;
  }
};
