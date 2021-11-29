import React, { Component } from 'react';
import { connect } from 'react-redux';
import TaskTraySearchForm from 'scenes/TaskTray/scenes/TaskTrayHome/components/TaskTraySearchForm';
import TaskTrayTable from 'scenes/TaskTray/scenes/TaskTrayHome/components/TaskTrayTable';
import * as taskTableActionCreators from 'scenes/TaskTray/scenes/TaskTrayHome/data/taskTable/actions';
import {
  getTaskTable,
  getFilters,
  getMetaPaginacion
} from 'scenes/TaskTray/scenes/TaskTrayHome/data/taskTable/reducer';
import { getParamGeneral } from 'services/types/reducer';
import { getTaskTypes } from 'scenes/TaskTray/scenes/TaskTrayHome/data/taskTypes/reducer';
import { isEmpty, get } from 'lodash';
import './styles.css';

class TaskTrayHome extends Component {
  async componentDidMount() {
    const { updateFilter } = this.props;
    updateFilter({});
  }

  construirParams = (values, page) => {
    const {
      metaPaginacion: { pageSize }
    } = this.props;
    const {
      fechaDeOcurrencia: [fechaInicioOcc, fechaFinOcc] = [],
      fechaDeRegistro: [fechaInicioReg, fechaFinReg] = [],
      tarea,
      numeroDeCaso,
      numeroDeSiniestro,
      numeroDePoliza,
      sinLider,
      productos
    } = values || {};

    return {
      codExtAsegurado: get(values, 'asegurado.terceroElegido.codExterno', ''),
      fechaInicioOcurrencia: fechaInicioOcc ? fechaInicioOcc.format('YYYY/MM/DD') : undefined,
      fechaFinOcurrencia: fechaFinOcc ? fechaFinOcc.format('YYYY/MM/DD') : undefined,
      fechaInicioRegistro: fechaInicioReg ? fechaInicioReg.format('YYYY/MM/DD') : undefined,
      fechaFinRegistro: fechaFinReg ? fechaFinReg.format('YYYY/MM/DD') : undefined,
      numeroDeCaso,
      numeroDePoliza,
      numeroDeSiniestro,
      idTarea: tarea,
      numPag: page,
      tamPag: pageSize,
      sinLider,
      productos
    };
  };

  handlePagination = (pagination, filters, sorters) => {
    const { current } = pagination;
    const {
      fetchTaskTable,
      formFilters,
      updatePage,
      taskTable: {
        meta: { page },
        sortColumn
      },
      updateSortColumn
    } = this.props;

    if (!isEmpty(sorters) || (isEmpty(sorters) && !isEmpty(sortColumn) && current === 1)) {
      if ((sorters.field === sortColumn.field && sorters.order === sortColumn.order) || sortColumn === 'tarea') {
        fetchTaskTable(this.construirParams(formFilters, current));
        updatePage(current);
      } else {
        updatePage(page);
      }
    } else {
      fetchTaskTable(this.construirParams(formFilters, current));
      updatePage(current);
    }

    updateSortColumn(sorters);
  };

  render() {
    const { fetchTaskTable, taskTable, taskTypes, formFilters, showScroll, tamanioPagina } = this.props || {};

    const pagination = {
      total: taskTable.meta.total,
      current: taskTable.meta.page,
      pageSize: tamanioPagina
    };

    return (
      <div>
        <h1>Bandeja de Tareas</h1>
        <TaskTraySearchForm
          fetchTaskTable={fetchTaskTable}
          construirParams={this.construirParams}
          tamanioPagina={tamanioPagina}
        />
        <TaskTrayTable
          fetchTaskTable={fetchTaskTable}
          taskTable={taskTable}
          taskTypes={taskTypes}
          formFilters={formFilters}
          pagination={pagination}
          showScroll={showScroll}
          tamanioPagina={tamanioPagina}
          handlePagination={this.handlePagination}
        />
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    updatePage: page => dispatch(taskTableActionCreators.updatePage(page)),
    updateSortColumn: sorters => dispatch(taskTableActionCreators.updateSortColumn(sorters)),
    resetTable: sorters => dispatch(taskTableActionCreators.fetchTaskTableReset(sorters)),
    updateFilter: filtro => dispatch(taskTableActionCreators.updateFilter(filtro)),
    fetchTaskTable: params => dispatch(taskTableActionCreators.fetchTaskTable(params))
  };
};

const mapStateToProps = state => {
  const taskTable = getTaskTable(state);
  const taskTypes = getTaskTypes(state);
  const formFilters = getFilters(state);
  const metaPaginacion = getMetaPaginacion(state);
  const tamanioPagina = getParamGeneral(state, 'TAMANIO_TABLA_PAGINA');
  return {
    taskTable,
    taskTypes,
    formFilters,
    metaPaginacion,
    tamanioPagina,
    showScroll: state.services.device.scrollActivated
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TaskTrayHome);
