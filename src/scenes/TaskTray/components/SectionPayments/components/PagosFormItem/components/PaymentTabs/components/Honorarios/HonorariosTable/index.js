import React from 'react';
import { Table } from 'antd';
import { isEmpty } from 'lodash';
import { construirColumnas } from 'scenes/TaskTray/components/SectionPayments/util';
import { TAREAS } from 'constants/index';

class HonorariosTable extends React.Component {
  render() {
    const {
      maintainLoading,
      sendLoading,
      honorarios: pagos = [],
      tamanioPagina,
      dataSinister,
      clave,
      currentTask
    } = this.props;

    let honorariosFiltrados = pagos;
    const esConfirmarGestion = [
      TAREAS.REVISAR_PAGO_EJECUTIVO,
      TAREAS.REVISAR_PAGO_AJUSTADOR,
      TAREAS.CONFIRMAR_GESTION,
      TAREAS.ADJUNTAR_CARGO_DE_RECHAZO
    ].includes(currentTask.idTarea);
    if (!isEmpty(clave) && esConfirmarGestion) {
      honorariosFiltrados = pagos.filter(hono => hono.flagRevisarPago === 'S');
    }

    const esCMCoaseguro = !isEmpty(dataSinister) && dataSinister.indCargaMasiva === 'COA';

    const objCoasegurador = {
      idAjustador: dataSinister.codCoaseguroLider,
      nomAjustador: dataSinister.coaseguroLider
    };

    const data = honorariosFiltrados.map(pago => {
      const dataPagos = {
        ...pago,
        key: pago.id,
        numPlanilla: pago.numPlanilla,
        idOtrosConceptos: pago.idOtrosConceptos
      };

      if (esCMCoaseguro) {
        Object.assign(dataPagos, objCoasegurador);
      }

      return dataPagos;
    });

    return (
      <React.Fragment>
        <br />
        <Table
          id="tabla_pagos_honorarios"
          rowClassName={record => {
            if (record.indCreoAjustador === 'S') {
              return 'claims-rrgg-edicion-ajustador';
            }
            return '';
          }}
          columns={construirColumnas('H', this.props)}
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

export default HonorariosTable;
