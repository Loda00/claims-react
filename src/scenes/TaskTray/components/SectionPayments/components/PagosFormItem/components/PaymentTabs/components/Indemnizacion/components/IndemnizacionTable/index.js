import React from 'react';
import { Table, Row } from 'antd';
import { isEmpty } from 'lodash';
import { construirColumnas } from 'scenes/TaskTray/components/SectionPayments/util';
import { TAREAS } from 'constants/index';
import { calculateIndemnizacionNeta } from '../../util';
import './styles.css';

class RegistryPaymentIndemnizacionTable extends React.Component {
  sizeScroll(countColumnsTable) {
    let size = 1800;
    if (countColumnsTable === 7 || countColumnsTable === 8) size = 1600;
    return { x: size };
  }

  render() {
    const { indemnizaciones = [], maintainLoading, sendLoading, tamanioPagina, currentTask, clave } = this.props;

    let indemnizacionesFiltradas = indemnizaciones;
    const esConfirmarGestion = [
      TAREAS.REVISAR_PAGO_EJECUTIVO,
      TAREAS.REVISAR_PAGO_AJUSTADOR,
      TAREAS.CONFIRMAR_GESTION,
      TAREAS.ADJUNTAR_CARGO_DE_RECHAZO
    ].includes(currentTask.idTarea);
    if (!isEmpty(clave) && esConfirmarGestion) {
      indemnizacionesFiltradas = indemnizaciones.filter(ind => ind.flagRevisarPago === 'S');
    }

    const data = indemnizacionesFiltradas.map(pago => {
      return {
        key: pago.id,
        idBeneficiario: pago.idBeneficiario,
        beneficiario: pago.nomBeneficiario,
        codCobertura: pago.codCobertura,
        codRamo: pago.codRamo,
        cobertura: pago.dscCobertura,
        idCobertura: pago.idCobertura,
        codTipoPago: pago.codTipoPago,
        tipopago: pago.dscTipoPago,
        codMonedaPago: pago.codMonedaPago,
        mtoIndemnizacionBruta: pago.mtoIndemnizacionBruta,
        mtoDeducible: pago.mtoDeducible,
        codTipoCobro: pago.codTipoCobro,
        dscTipoCobro: pago.dscTipoCobro,
        mtoCoaseguro: pago.mtoCoaseguro,
        numPlanilla: pago.numPlanilla,
        mtoIndemnizacionNeta: calculateIndemnizacionNeta(
          pago.mtoIndemnizacionBruta,
          pago.mtoDeducible,
          pago.mtoCoaseguro
        ),
        estado: pago.dscEstado,
        codEstado: pago.codEstado,
        usuarioModificacion: pago.usuarioModificacion,
        indCreoAjustador: pago.indCreoAjustador,
        mtoTasaCambioRegistro: pago.mtoTasaCambioRegistro,
        idTareaBitacora: pago.idTareaBitacora,
        numObligacion: pago.numObligacion,
        indCreaEnModificar: pago.indCreaEnModificar,
        codProceso: pago.codProceso
      };
    });

    return (
      <React.Fragment>
        <Row>
          <br />
          <Table
            id="tabla_pagos_indemnizacion"
            rowClassName={record => {
              if (record.indCreoAjustador === 'S') {
                return 'claims-rrgg-edicion-ajustador';
              }
              return '';
            }}
            columns={construirColumnas('I', this.props)}
            dataSource={data}
            size="small"
            scroll={{ x: 1800 }}
            loading={maintainLoading || sendLoading}
            pagination={{ defaultPageSize: tamanioPagina }}
          />
        </Row>
      </React.Fragment>
    );
  }
}

export default RegistryPaymentIndemnizacionTable;
