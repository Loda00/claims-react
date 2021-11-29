import React from 'react';
import { isEmpty } from 'lodash';
import { Table } from 'antd';
import { construirColumnas } from 'scenes/TaskTray/components/SectionPayments/util';
import { TAREAS } from 'constants/index';

class OtrosConceptosTable extends React.Component {
  render() {
    const { otrosConceptos: pagos = [], maintainLoading, sendLoading, tamanioPagina, currentTask, clave } = this.props;

    let ocFiltrados = pagos;
    const esConfirmarGestion = [
      TAREAS.REVISAR_PAGO_EJECUTIVO,
      TAREAS.REVISAR_PAGO_AJUSTADOR,
      TAREAS.CONFIRMAR_GESTION,
      TAREAS.ADJUNTAR_CARGO_DE_RECHAZO
    ].includes(currentTask.idTarea);
    if (!isEmpty(clave) && esConfirmarGestion) {
      ocFiltrados = pagos.filter(oc => oc.flagRevisarPago === 'S');
    }

    const data = ocFiltrados.map(pago => {
      return {
        ...pago,
        key: pago.id,
        idOtrosConceptos: pago.idOtrosConceptos
      };
    });

    return (
      <React.Fragment>
        <br />
        <Table
          id="tabla_pagos_otros_conceptos"
          rowClassName={record => {
            if (record.indCreoAjustador === 'S') {
              return 'claims-rrgg-edicion-ajustador';
            }
            return '';
          }}
          columns={construirColumnas('O', this.props)}
          dataSource={data}
          size="small"
          scroll={{ x: 1700 }}
          loading={maintainLoading || sendLoading}
          pagination={{ defaultPageSize: tamanioPagina }}
        />
      </React.Fragment>
    );
  }
}

export default OtrosConceptosTable;
