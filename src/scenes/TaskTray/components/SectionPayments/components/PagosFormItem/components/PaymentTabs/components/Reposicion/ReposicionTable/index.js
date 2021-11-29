import React from 'react';
import { Table } from 'antd';
import { isEmpty } from 'lodash';
import { TAREAS } from 'constants/index';
import { construirColumnas } from 'scenes/TaskTray/components/SectionPayments/util';

class ReposicionTable extends React.Component {
  render() {
    const { reposiciones = [], maintainLoading, sendLoading, tamanioPagina, currentTask, clave } = this.props;

    const esConfirmarGestion = [
      TAREAS.REVISAR_PAGO_EJECUTIVO,
      TAREAS.REVISAR_PAGO_AJUSTADOR,
      TAREAS.CONFIRMAR_GESTION,
      TAREAS.ADJUNTAR_CARGO_DE_RECHAZO
    ].includes(currentTask.idTarea);

    let reposicionesFiltradas = reposiciones;
    if (!isEmpty(clave) && esConfirmarGestion) {
      reposicionesFiltradas = reposiciones.filter(ind => ind.flagRevisarPago === 'S');
    }

    const data = reposicionesFiltradas.map(pago => {
      return {
        ...pago,
        codCobertura: pago.codCobertura,
        key: pago.id
      };
    });

    return (
      <React.Fragment>
        <br />
        <Table
          id="tabla_pagos_reposiciones"
          rowClassName={record => {
            if (record.indCreoAjustador === 'S') {
              return 'claims-rrgg-edicion-ajustador';
            }
            return '';
          }}
          columns={construirColumnas('R', this.props)}
          dataSource={data}
          size="small"
          scroll={{ x: 1800 }}
          loading={maintainLoading || sendLoading}
          pagination={{ defaultPageSize: tamanioPagina }}
        />
      </React.Fragment>
    );
  }
}

export default ReposicionTable;
