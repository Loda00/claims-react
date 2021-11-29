import { combineReducers } from 'redux';

import { reducer as dataSinisterReducer } from 'scenes/TaskTray/components/SectionDataSinister/data/dataSinister/reducer';
import { reducer as sinisterTypesReducer } from 'scenes/TaskTray/components/SectionDataSinister/data/sinisterTypes/reducer';
import { reducer as shipmentNaturesReducer } from 'scenes/TaskTray/components/SectionDataSinister/data/shipmentNatures/reducer';
import { reducer as incotermsReducer } from 'scenes/TaskTray/components/SectionDataSinister/data/incoterms/reducer';
import { reducer as closingReasonsReducer } from 'scenes/TaskTray/components/SectionDataSinister/data/closingReasons/reducer';

export const reducer = combineReducers({
  dataSinister: dataSinisterReducer,
  sinisterTypes: sinisterTypesReducer,
  shipmentNatures: shipmentNaturesReducer,
  incoterms: incotermsReducer,
  closingReasons: closingReasonsReducer
});
