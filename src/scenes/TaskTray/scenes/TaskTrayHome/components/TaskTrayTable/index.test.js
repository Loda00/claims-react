import React from 'react';
import { render, waitForElement, fireEvent, cleanup } from 'react-testing-library';
import 'jest-dom/extend-expect';
import { MemoryRouter } from 'react-router-dom';
import { cloneDeep } from 'lodash';
import taskTable from 'util/__fixtures__/taskTable';
import TaskTrayTable from './index';

afterEach(cleanup);

let taskTableMock;
beforeEach(() => {
  taskTableMock = cloneDeep(taskTable);
});

const taskTypes = {
  error: null,
  isLoading: false,
  taskTypes: [
    {
      codigo: '9',
      descripcion: 'COMPLETAR DATOS'
    }
  ]
};

const resolvePromise = () => Promise.resolve();
const rejectPromise = () => Promise.reject(new Error());

it('should render tasks successfully ordered by estado on start', () => {
  const taskTableSuccess = {
    error: null,
    isLoading: false,
    taskTable: taskTableMock
  };

  const { container } = render(
    <MemoryRouter>
      <TaskTrayTable
        fetchTaskTable={resolvePromise}
        taskTable={taskTableSuccess}
        taskTypes={taskTypes}
        siderCollapsed={false}
      />
    </MemoryRouter>
  );

  const table = container.querySelector('tbody');
  const taskRow = table.rows[0];
  expect(table.rows.length).toBe(3);
  expect(taskRow.cells[0]).toHaveTextContent('COMPLETAR DATOS');
  expect(taskRow.cells[2]).toHaveTextContent('RG19000184');
  expect(taskRow.cells[4]).toHaveTextContent('13/02/2014');
});

it('should show error indicator when fetchTasks fails', async () => {
  const taskTableError = {
    error: { message: 'Ocurri\u00F3 un error inesperado' },
    isLoading: false,
    taskTable: []
  };

  const { getByText } = render(
    <TaskTrayTable
      fetchTaskTable={rejectPromise}
      taskTable={taskTableError}
      taskTypes={taskTypes}
      siderCollapsed={false}
    />
  );

  const message = await waitForElement(() => getByText('Ocurri\u00F3 un error inesperado'));
  expect(message).toHaveTextContent('Ocurri\u00F3 un error inesperado');
});

it('should show empty date when no date from service', () => {
  const taskTableNoFeccur = {
    error: null,
    isLoading: false,
    taskTable: taskTableMock
  };

  taskTableNoFeccur.taskTable[0].fecocurrencia = undefined;

  const { container } = render(
    <MemoryRouter>
      <TaskTrayTable
        fetchTaskTable={rejectPromise}
        taskTable={taskTableNoFeccur}
        taskTypes={taskTypes}
        siderCollapsed={false}
      />
    </MemoryRouter>
  );

  const table = container.querySelector('tbody');
  const taskRow = table.rows[0];
  expect(table.rows.length).toBe(3);
  expect(taskRow.cells[4]).toHaveTextContent('');
});

it('should allow to order columns', () => {
  const taskTableSuccessr = {
    error: null,
    isLoading: false,
    taskTable: taskTableMock
  };

  const { container } = render(
    <MemoryRouter>
      <TaskTrayTable
        fetchTaskTable={resolvePromise}
        taskTable={taskTableSuccessr}
        taskTypes={taskTypes}
        siderCollapsed={false}
      />
    </MemoryRouter>
  );

  // by estado de tarea (asc by default)
  const overdue = 'background-color: rgb(255, 0, 0);';
  const ontime = 'background-color: rgb(1, 223, 1);';
  expect(container.querySelectorAll('.estado')[0]).toHaveStyle(overdue);
  expect(container.querySelectorAll('.estado')[1]).toHaveStyle(overdue);
  expect(container.querySelectorAll('.estado')[2]).toHaveStyle(ontime);
  fireEvent.click(container.querySelector('.ant-table-column-sorters')); // desc
  expect(container.querySelectorAll('.estado')[0]).toHaveStyle(ontime);
  expect(container.querySelectorAll('.estado')[1]).toHaveStyle(overdue);
  expect(container.querySelectorAll('.estado')[2]).toHaveStyle(overdue);
  fireEvent.click(container.querySelector('.ant-table-column-sorters')); // restore
  expect(container.querySelectorAll('.estado')[0]).toHaveStyle(overdue);
  expect(container.querySelectorAll('.estado')[1]).toHaveStyle(overdue);
  expect(container.querySelectorAll('.estado')[2]).toHaveStyle(ontime);

  // by nro de siniestro
  expect(container.querySelector('tbody').rows[0].cells[1]).toHaveTextContent('');
  expect(container.querySelector('tbody').rows[1].cells[1]).toHaveTextContent('155112');
  expect(container.querySelector('tbody').rows[2].cells[1]).toHaveTextContent('155113');
  fireEvent.click(container.querySelectorAll('.ant-table-column-sorters')[1]); // asc
  expect(container.querySelector('tbody').rows[0].cells[1]).toHaveTextContent('');
  expect(container.querySelector('tbody').rows[1].cells[1]).toHaveTextContent('155112');
  expect(container.querySelector('tbody').rows[2].cells[1]).toHaveTextContent('155113');
  fireEvent.click(container.querySelectorAll('.ant-table-column-sorters')[1]); // desc
  expect(container.querySelector('tbody').rows[0].cells[1]).toHaveTextContent('155113');
  expect(container.querySelector('tbody').rows[1].cells[1]).toHaveTextContent('155112');
  expect(container.querySelector('tbody').rows[2].cells[1]).toHaveTextContent('');
  fireEvent.click(container.querySelectorAll('.ant-table-column-sorters')[1]); // restore

  // nro caso
  expect(container.querySelector('tbody').rows[0].cells[2]).toHaveTextContent('RG19000184');
  expect(container.querySelector('tbody').rows[1].cells[2]).toHaveTextContent('RG19000017');
  expect(container.querySelector('tbody').rows[2].cells[2]).toHaveTextContent('RG19000018');
  fireEvent.click(container.querySelectorAll('.ant-table-column-sorters')[2]); // asc
  expect(container.querySelector('tbody').rows[0].cells[2]).toHaveTextContent('RG19000017');
  expect(container.querySelector('tbody').rows[1].cells[2]).toHaveTextContent('RG19000018');
  expect(container.querySelector('tbody').rows[2].cells[2]).toHaveTextContent('RG19000184');
  fireEvent.click(container.querySelectorAll('.ant-table-column-sorters')[2]); // desc
  expect(container.querySelector('tbody').rows[0].cells[2]).toHaveTextContent('RG19000184');
  expect(container.querySelector('tbody').rows[1].cells[2]).toHaveTextContent('RG19000018');
  expect(container.querySelector('tbody').rows[2].cells[2]).toHaveTextContent('RG19000017');
  fireEvent.click(container.querySelectorAll('.ant-table-column-sorters')[2]); // restore

  // by nro poliza
  expect(container.querySelector('tbody').rows[0].cells[3]).toHaveTextContent('100001');
  expect(container.querySelector('tbody').rows[1].cells[3]).toHaveTextContent('100002');
  expect(container.querySelector('tbody').rows[2].cells[3]).toHaveTextContent('100003');
  fireEvent.click(container.querySelectorAll('.ant-table-column-sorters')[3]); // asc
  expect(container.querySelector('tbody').rows[0].cells[3]).toHaveTextContent('100001');
  expect(container.querySelector('tbody').rows[1].cells[3]).toHaveTextContent('100002');
  expect(container.querySelector('tbody').rows[2].cells[3]).toHaveTextContent('100003');
  fireEvent.click(container.querySelectorAll('.ant-table-column-sorters')[3]); // desc
  expect(container.querySelector('tbody').rows[0].cells[3]).toHaveTextContent('100003');
  expect(container.querySelector('tbody').rows[1].cells[3]).toHaveTextContent('100002');
  expect(container.querySelector('tbody').rows[2].cells[3]).toHaveTextContent('100001');
  fireEvent.click(container.querySelectorAll('.ant-table-column-sorters')[3]); // restore

  // by fec ocurrencia
  expect(container.querySelector('tbody').rows[0].cells[4]).toHaveTextContent('13/02/2014');
  expect(container.querySelector('tbody').rows[1].cells[4]).toHaveTextContent('13/02/2013');
  expect(container.querySelector('tbody').rows[2].cells[4]).toHaveTextContent(''); // handle no date gracefully
  fireEvent.click(container.querySelectorAll('.ant-table-column-sorters')[4]); // asc
  expect(container.querySelector('tbody').rows[0].cells[4]).toHaveTextContent('');
  expect(container.querySelector('tbody').rows[1].cells[4]).toHaveTextContent('13/02/2013');
  expect(container.querySelector('tbody').rows[2].cells[4]).toHaveTextContent('13/02/2014');
  fireEvent.click(container.querySelectorAll('.ant-table-column-sorters')[4]); // desc
  expect(container.querySelector('tbody').rows[0].cells[4]).toHaveTextContent('13/02/2014');
  expect(container.querySelector('tbody').rows[1].cells[4]).toHaveTextContent('13/02/2013');
  expect(container.querySelector('tbody').rows[2].cells[4]).toHaveTextContent('');
  fireEvent.click(container.querySelectorAll('.ant-table-column-sorters')[4]); // restore

  // by fec registro
  expect(container.querySelector('tbody').rows[0].cells[5]).toHaveTextContent('18/02/2019');
  expect(container.querySelector('tbody').rows[1].cells[5]).toHaveTextContent('18/02/2018');
  expect(container.querySelector('tbody').rows[2].cells[5]).toHaveTextContent('18/02/2017');
  fireEvent.click(container.querySelectorAll('.ant-table-column-sorters')[5]); // asc
  expect(container.querySelector('tbody').rows[0].cells[5]).toHaveTextContent('18/02/2017');
  expect(container.querySelector('tbody').rows[1].cells[5]).toHaveTextContent('18/02/2018');
  expect(container.querySelector('tbody').rows[2].cells[5]).toHaveTextContent('18/02/2019');
  fireEvent.click(container.querySelectorAll('.ant-table-column-sorters')[5]); // desc
  expect(container.querySelector('tbody').rows[0].cells[5]).toHaveTextContent('18/02/2019');
  expect(container.querySelector('tbody').rows[1].cells[5]).toHaveTextContent('18/02/2018');
  expect(container.querySelector('tbody').rows[2].cells[5]).toHaveTextContent('18/02/2017');
  fireEvent.click(container.querySelectorAll('.ant-table-column-sorters')[5]); // restore

  // by descripcion
  expect(container.querySelector('tbody').rows[0].cells[6]).toHaveTextContent('ROBO DE CELULARES');
  expect(container.querySelector('tbody').rows[1].cells[6]).toHaveTextContent('EMERGENCIA EN VIVIENDA');
  expect(container.querySelector('tbody').rows[2].cells[6]).toHaveTextContent('EMERGENCIA EN VIVIENDA');
  fireEvent.click(container.querySelectorAll('.ant-table-column-sorters')[6]); // asc
  expect(container.querySelector('tbody').rows[0].cells[6]).toHaveTextContent('EMERGENCIA EN VIVIENDA');
  expect(container.querySelector('tbody').rows[1].cells[6]).toHaveTextContent('EMERGENCIA EN VIVIENDA');
  expect(container.querySelector('tbody').rows[2].cells[6]).toHaveTextContent('ROBO DE CELULARES');
  fireEvent.click(container.querySelectorAll('.ant-table-column-sorters')[6]); // desc
  expect(container.querySelector('tbody').rows[0].cells[6]).toHaveTextContent('ROBO DE CELULARES');
  expect(container.querySelector('tbody').rows[1].cells[6]).toHaveTextContent('EMERGENCIA EN VIVIENDA');
  expect(container.querySelector('tbody').rows[2].cells[6]).toHaveTextContent('EMERGENCIA EN VIVIENDA');
  fireEvent.click(container.querySelectorAll('.ant-table-column-sorters')[6]); // restore

  // by ramo
  expect(container.querySelector('tbody').rows[0].cells[7]).toHaveTextContent('3D CONVENIO III');
  expect(container.querySelector('tbody').rows[1].cells[7]).toHaveTextContent('DOMICILIARIO');
  expect(container.querySelector('tbody').rows[2].cells[7]).toHaveTextContent('DOMICILIARIO');
  fireEvent.click(container.querySelectorAll('.ant-table-column-sorters')[7]); // asc
  expect(container.querySelector('tbody').rows[0].cells[7]).toHaveTextContent('3D CONVENIO III');
  expect(container.querySelector('tbody').rows[1].cells[7]).toHaveTextContent('DOMICILIARIO');
  expect(container.querySelector('tbody').rows[2].cells[7]).toHaveTextContent('DOMICILIARIO');
  fireEvent.click(container.querySelectorAll('.ant-table-column-sorters')[7]); // desc
  expect(container.querySelector('tbody').rows[0].cells[7]).toHaveTextContent('DOMICILIARIO');
  expect(container.querySelector('tbody').rows[1].cells[7]).toHaveTextContent('DOMICILIARIO');
  expect(container.querySelector('tbody').rows[2].cells[7]).toHaveTextContent('3D CONVENIO III');
  fireEvent.click(container.querySelectorAll('.ant-table-column-sorters')[7]); // restore

  // by asegurado
  expect(container.querySelector('tbody').rows[0].cells[8]).toHaveTextContent('');
  expect(container.querySelector('tbody').rows[1].cells[8]).toHaveTextContent('Jorge Ventura');
  expect(container.querySelector('tbody').rows[2].cells[8]).toHaveTextContent('Richard Abanto');
  fireEvent.click(container.querySelectorAll('.ant-table-column-sorters')[8]); // asc
  expect(container.querySelector('tbody').rows[0].cells[8]).toHaveTextContent('');
  expect(container.querySelector('tbody').rows[1].cells[8]).toHaveTextContent('Jorge Ventura');
  expect(container.querySelector('tbody').rows[2].cells[8]).toHaveTextContent('Richard Abanto');
  fireEvent.click(container.querySelectorAll('.ant-table-column-sorters')[8]); // desc
  expect(container.querySelector('tbody').rows[0].cells[8]).toHaveTextContent('Richard Abanto');
  expect(container.querySelector('tbody').rows[1].cells[8]).toHaveTextContent('Jorge Ventura');
  expect(container.querySelector('tbody').rows[2].cells[8]).toHaveTextContent('');
  fireEvent.click(container.querySelectorAll('.ant-table-column-sorters')[8]); // restore

  // by moneda reserva
  expect(container.querySelector('tbody').rows[0].cells[9]).toHaveTextContent('USD');
  expect(container.querySelector('tbody').rows[1].cells[9]).toHaveTextContent('USD');
  expect(container.querySelector('tbody').rows[2].cells[9]).toHaveTextContent('SOL');
  fireEvent.click(container.querySelectorAll('.ant-table-column-sorters')[9]); // asc
  expect(container.querySelector('tbody').rows[0].cells[9]).toHaveTextContent('SOL');
  expect(container.querySelector('tbody').rows[1].cells[9]).toHaveTextContent('USD');
  expect(container.querySelector('tbody').rows[2].cells[9]).toHaveTextContent('USD');
  fireEvent.click(container.querySelectorAll('.ant-table-column-sorters')[9]); // desc
  expect(container.querySelector('tbody').rows[0].cells[9]).toHaveTextContent('USD');
  expect(container.querySelector('tbody').rows[1].cells[9]).toHaveTextContent('USD');
  expect(container.querySelector('tbody').rows[2].cells[9]).toHaveTextContent('SOL');
  fireEvent.click(container.querySelectorAll('.ant-table-column-sorters')[9]); // restore

  // by monto reserva
  expect(container.querySelector('tbody').rows[0].cells[10]).toHaveTextContent('900');
  expect(container.querySelector('tbody').rows[1].cells[10]).toHaveTextContent('500');
  expect(container.querySelector('tbody').rows[2].cells[10]).toHaveTextContent('400');
  fireEvent.click(container.querySelectorAll('.ant-table-column-sorters')[10]); // asc
  expect(container.querySelector('tbody').rows[0].cells[10]).toHaveTextContent('400');
  expect(container.querySelector('tbody').rows[1].cells[10]).toHaveTextContent('500');
  expect(container.querySelector('tbody').rows[2].cells[10]).toHaveTextContent('900');
  fireEvent.click(container.querySelectorAll('.ant-table-column-sorters')[10]); // desc
  expect(container.querySelector('tbody').rows[0].cells[10]).toHaveTextContent('900');
  expect(container.querySelector('tbody').rows[1].cells[10]).toHaveTextContent('500');
  expect(container.querySelector('tbody').rows[2].cells[10]).toHaveTextContent('400');
  fireEvent.click(container.querySelectorAll('.ant-table-column-sorters')[10]); // restore

  // by corredor
  expect(container.querySelector('tbody').rows[0].cells[11]).toHaveTextContent('');
  expect(container.querySelector('tbody').rows[1].cells[11]).toHaveTextContent('');
  expect(container.querySelector('tbody').rows[2].cells[11]).toHaveTextContent('');
  fireEvent.click(container.querySelectorAll('.ant-table-column-sorters')[11]); // asc
  expect(container.querySelector('tbody').rows[0].cells[11]).toHaveTextContent('');
  expect(container.querySelector('tbody').rows[1].cells[11]).toHaveTextContent('');
  expect(container.querySelector('tbody').rows[2].cells[11]).toHaveTextContent('');
  fireEvent.click(container.querySelectorAll('.ant-table-column-sorters')[11]); // desc
  expect(container.querySelector('tbody').rows[0].cells[11]).toHaveTextContent('');
  expect(container.querySelector('tbody').rows[1].cells[11]).toHaveTextContent('');
  expect(container.querySelector('tbody').rows[2].cells[11]).toHaveTextContent('');
  fireEvent.click(container.querySelectorAll('.ant-table-column-sorters')[11]); // restore
});
