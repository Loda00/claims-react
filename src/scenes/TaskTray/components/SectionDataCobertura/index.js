import React, { Component } from 'react';
import { Form, Col } from 'antd';
import currency from 'currency.js';
import { connect } from 'react-redux';
import RamoCoberturasFormItem from 'scenes/TaskTray/components/SectionDataCobertura/components/RamoCoberturasFormItem';
import { TAREAS, ESTADO_SINIESTRO } from 'constants/index';
import { isEmpty } from 'lodash';
import './style.css';

class DataCoberturaSections extends Component {
  state = {
    arrayUsers: []
  };

  componentDidMount() {
    const {
      userClaims: { roles }
    } = this.props;

    const arrayUsers = [];

    roles.forEach(({ codTipo }) => {
      arrayUsers.push(codTipo);
    });

    this.setState({
      arrayUsers
    });
  }

  checkCoberturas = (rule, value, callback) => {
    const {
      form: { getFieldValue },
      currentTask: { idTarea } = {},
      rechazoPago: tipoConfirmarGestion,
      dataSiniestro,
      esDevolver = false
    } = this.props;
    const {
      codTipoSiniestro,
      indCerrarSiniestro: seCierraSiniestro,
      codEstadoSiniestro,
      indCargaMasiva,
      indReservaCoasAprobada
    } = getFieldValue('siniestro') || {};
    const esInformeFinal = getFieldValue('informeFinal') === 'S';
    const requiereAjustador = getFieldValue('ajustadorRequerido') === 'S';
    const requiereNuevoAjustador = getFieldValue('nuevoAjustador') === 'S';
    const esConfirmarGestionRechazo = tipoConfirmarGestion === 'R';
    const { ramosCoberturas } = value;

    const coberturasPendiente = [];
    ramosCoberturas.forEach(ramo => {
      ramo.coberturas.forEach(cob => {
        if (cob.estado === 'P') {
          coberturasPendiente.push(cob);
        }
      });
    });
    const tareasEjecutivo = [TAREAS.ANALIZAR_SINIESTRO, TAREAS.REVISAR_PAGO_EJECUTIVO, TAREAS.REVISAR_INFORME];

    const tieneRechazoCobertura = ramosCoberturas.some(ramo =>
      ramo.coberturas.some(cob => cob.indSinCobertura === 'S')
    );

    const esCMCoaseguro = indCargaMasiva === 'COA';

    // si es preventivo no aplica validaciones
    const esTipoPreventivo = codTipoSiniestro === 'P';
    if (esTipoPreventivo || seCierraSiniestro) {
      callback();
      return;
    }

    if (
      idTarea === TAREAS.REVISAR_INFORME_BASICO ||
      idTarea === TAREAS.REVISAR_INFORME ||
      idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO
    ) {
      if (!esDevolver) {
        if (coberturasPendiente.length > 0) {
          callback('No debe tener coberturas en estado pendiente.');
          return;
        }
      }
    }

    if (tareasEjecutivo.includes(idTarea)) {
      // obtiene coberturas validas sobre las cuales se
      // aplicaran las validaciones
      const coberturasValidas = [];
      value.ramosCoberturas.forEach(ramo =>
        ramo.coberturas.forEach(cob => {
          if (cob.indSinCobertura === 'N') {
            coberturasValidas.push({
              codRamo: ramo.codRamo,
              ...cob
            });
          }
        })
      );

      const tieneSaldoPendiente = coberturasValidas.some(
        co => currency(co.montoReserva).subtract(co.totalPagosAprobados).value !== 0
      );

      if (idTarea === TAREAS.ANALIZAR_SINIESTRO) {
        if (requiereAjustador) {
          if (tieneRechazoCobertura) {
            callback(
              'Para rechazar una cobertura tiene que liquidar el siniestro. Debe marcar que no requiere ajustador'
            );
            return;
          }

          if (isEmpty(coberturasValidas)) {
            callback('Ud ha rechazado todas las coberturas por lo que debe marcar que no requiere ajustador');
            return;
          }
        }

        if (tieneSaldoPendiente) {
          if ((!esCMCoaseguro && !requiereAjustador) || (esCMCoaseguro && indReservaCoasAprobada === 'S')) {
            callback(`No debe haber saldo pendiente en coberturas para poder completar la tarea`);
            return;
          }
        }
      }

      if (idTarea === TAREAS.REVISAR_INFORME) {
        if (tieneRechazoCobertura && !esInformeFinal) {
          callback('Para rechazar una cobertura tiene que liquidar el siniestro.');
          return;
        }

        if (tieneSaldoPendiente) {
          const completaRevisarInformeFinal = !requiereNuevoAjustador && esInformeFinal && !esDevolver;
          if (completaRevisarInformeFinal) {
            callback(`No debe haber saldo pendiente en coberturas para poder completar la tarea`);
            return;
          }
        }
      }

      if (idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO) {
        if (tieneSaldoPendiente) {
          if (esConfirmarGestionRechazo) {
            callback(`No debe haber saldo pendiente en coberturas para el pago de una cobertura previamente rechazada`);
            return;
          }

          const liquidaAnalizarSiniestroFlujoSimple =
            codEstadoSiniestro === ESTADO_SINIESTRO.ANALIZAR_SINIESTRO_COMPLETADO &&
            !esCMCoaseguro &&
            !requiereAjustador &&
            !seCierraSiniestro;
          const liquidaAnalizarSiniestroCMCoaseguroPagos =
            codEstadoSiniestro === ESTADO_SINIESTRO.ANALIZAR_SINIESTRO_COMPLETADO &&
            esCMCoaseguro &&
            indReservaCoasAprobada === 'S';
          const liquidaAnalizarSiniestro =
            liquidaAnalizarSiniestroFlujoSimple || liquidaAnalizarSiniestroCMCoaseguroPagos;
          const liquidaRevisarInforme = codEstadoSiniestro === 'IA' && !esDevolver;
          if (liquidaAnalizarSiniestro || liquidaRevisarInforme) {
            callback(`No debe haber saldo pendiente en coberturas para poder completar la tarea`);
            return;
          }
        }
      }
    }

    callback();
  };

  render() {
    const {
      form,
      form: { getFieldDecorator },
      coveragesAdjusters: { coveragesAdjusters: [{ ramos } = {}] = [{ ramos: [] }] },
      disabledGeneral,
      tarea,
      rechazoPago,
      flagModificar,
      dataSiniestro
    } = this.props;

    const { arrayUsers } = this.state;

    const { numSiniestro, currentTask, idCaso } = this.props;

    return (
      <div>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Form.Item label="Coberturas" required help="">
            {getFieldDecorator('dataRamosCoberturas', {
              initialValue: { ramosCoberturas: ramos },
              rules: [{ validator: this.checkCoberturas }]
            })(
              <RamoCoberturasFormItem
                dataSiniestro={dataSiniestro}
                analizarForm={form}
                disabledGeneral={disabledGeneral}
                currentTask={currentTask}
                numSiniestro={numSiniestro}
                tarea={tarea}
                rechazoPago={rechazoPago}
                idCaso={idCaso}
                flagModificar={flagModificar}
                arrayUsers={arrayUsers}
              />
            )}
          </Form.Item>
        </Col>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  userClaims: state.services.user.userClaims
});

const Main = connect(mapStateToProps)(DataCoberturaSections);

export default Main;
