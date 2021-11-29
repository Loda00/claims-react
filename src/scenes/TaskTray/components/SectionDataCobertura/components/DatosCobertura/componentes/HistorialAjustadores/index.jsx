import React, { Component } from 'react';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { Table } from 'antd';
import { CONSTANTS_APP } from 'constants/index';
import moment from 'moment';

class HistorialAjustadores extends Component {
  state = {
    historialAjustadores: []
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!isEmpty(nextProps.historialAjustadores) && nextProps.historialAjustadores !== prevState.historialAjustadores) {
      return {
        historialAjustadores: nextProps.historialAjustadores[0].ajustadores || []
      };
    }

    return null;
  }

  formatoOpinion = key => {
    let opinion = '';
    if (key === 1) {
      opinion = 'Primera';
    } else if (key === 2) {
      opinion = 'Segunda';
    }

    return opinion;
  };

  render() {
    const { historialAjustadores } = this.state;

    const columns = [
      {
        title: 'Ajustador',
        dataIndex: 'ajustador',
        key: 'ajustador'
      },
      {
        title: 'Ajustador encargado',
        dataIndex: 'ajustadorEncargado',
        key: 'ajustadorEncargado'
      },
      {
        title: 'Fecha asignación',
        dataIndex: 'fechaAsignacion',
        key: 'fechaAsignacion'
      },
      {
        title: 'Fecha cancelación',
        key: 'fechaCancelacion',
        dataIndex: 'fechaCancelacion'
      },
      {
        title: 'Opinión',
        key: 'numOpinion',
        dataIndex: 'numOpinion'
      }
    ];

    let dataSource = [];

    if (!isEmpty(historialAjustadores)) {
      dataSource = historialAjustadores.map((item, i) => ({
        key: i,
        ajustador: item.ajustadorEmpresa,
        ajustadorEncargado: item.ajustadorEncargado,
        fechaAsignacion: item.fechaAsignacion ? moment(item.fechaAsignacion).format(CONSTANTS_APP.FORMAT_DATE) : '',
        fechaCancelacion: item.fechaCancelacion ? moment(item.fechaCancelacion).format(CONSTANTS_APP.FORMAT_DATE) : '',
        numOpinion: this.formatoOpinion(item.numOpinion)
      }));
    }
    return <Table columns={columns} dataSource={dataSource} size="small" />;
  }
}

const mapStateToProps = state => ({
  historialAjustadores:
    state.scenes.taskTray.taskTrayComponents.sectionCoverages.data.coveragesAdjusters.coveragesAdjusters
});

export default connect(mapStateToProps)(HistorialAjustadores);
