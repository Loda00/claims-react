import { cloneDeep } from 'lodash';
import { getAddresses } from '../reducer';
import addresses from '../__fixtures__/addresses';

let state;
beforeEach(() => {
  state = {
    scenes: {
      taskTray: {
        completeTaskInfo: {
          components: {
            direccionSiniestro: {
              data: {
                addresses: {
                  addresses: cloneDeep(addresses),
                  searchTerm: '',
                  isLoading: false,
                  error: null
                }
              }
            }
          }
        }
      }
    }
  };
});

it('should filter addresses based on searchTerm empty', () => {
  state.scenes.taskTray.completeTaskInfo.components.direccionSiniestro.data.addresses.searchTerm = '';

  const filteredAddresses = getAddresses(state);
  expect(filteredAddresses.addresses.length).toBe(3);
});

it('should filter addresses based on searchTerm CIRCUNVALACION', () => {
  state.scenes.taskTray.completeTaskInfo.components.direccionSiniestro.data.addresses.searchTerm = 'CIRCUNVALACION';

  const filteredAddresses = getAddresses(state);
  expect(filteredAddresses.addresses.length).toBe(2);
});

it('should filter addresses based on searchTerm luis', () => {
  state.scenes.taskTray.completeTaskInfo.components.direccionSiniestro.data.addresses.searchTerm = 'luis';

  const filteredAddresses = getAddresses(state);
  expect(filteredAddresses.addresses.length).toBe(1);
  expect(filteredAddresses.addresses[0].ideDirec).toBe(9477);
});
