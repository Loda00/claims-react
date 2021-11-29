import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Form } from 'antd';
import currency from 'currency.js';
import { isEmpty } from 'lodash';
import { getSinisterTypes } from 'scenes/TaskTray/components/SectionDataSinister/data/sinisterTypes/reducer';
import { getListaOtrosConceptos } from 'scenes/TaskTray/components/SectionDataSinister/data/dataSinister/reducer';
import { showErrorMessage } from 'util/index';
import SinisterFormItem from 'scenes/TaskTray/components/SectionDataSinister/components/SinisterFormItem';
import * as conceptsActionCreators from 'scenes/TaskTray/data/concepts/actions';
import * as SinisterTypesActionCreator from 'scenes/TaskTray/components/SectionDataSinister/data/sinisterTypes/actions';
import { TAREAS, ESTADO_SINIESTRO } from 'constants/index';
import { getLstIncoterms } from 'scenes/TaskTray/components/SectionDataSinister/data/incoterms/reducer';
import { getEsTipoUsuarioEjecutivo, getEsTipoUsuarioAjustador } from 'services/users/reducer';
import * as validacionesDataSiniester from 'scenes/TaskTray/components/SectionDataSinister/utils/validate';
import {
  getfechaInicioVidencia,
  getFechaFinVigencia
} from 'scenes/TaskTray/components/SectionDataCertificate/data/dataCertificate/reducer';
import { getParamGeneral } from 'services/types/reducer';

class DataSinisterSections extends Component {
  async componentDidMount() {
    const { dispatch } = this.props;
    try {
      const promises = [];
      promises.push(dispatch(SinisterTypesActionCreator.fetchSinisterTypes('CRG_REG_TIPO_SINIESTRO')));
      promises.push(dispatch(conceptsActionCreators.fetchConcepts('CRG_CPTO_PAGO')));
      await Promise.all(promises);
    } catch (e) {
      showErrorMessage(e);
    }
  }

  async componentWillUnmount() {
    const { dispatch } = this.props;
    try {
      const promises = [];
      promises.push(dispatch(SinisterTypesActionCreator.fetchSinisterTypesReset()));
      promises.push(dispatch(conceptsActionCreators.fetchConceptsReset()));
      await Promise.all(promises);
    } catch (e) {
      showErrorMessage(e);
    }
  }

  checkSiniestro = (rule, value, callback) => {
    const {
      esDevolver = false,
      form: { getFieldValue },
      currentTask: { idTarea } = {}
    } = this.props;
    const {
      otrosConceptos,
      codTipoSiniestro,
      indCerrarSiniestro: seCierraSiniestro,
      codEstadoSiniestro,
      indCargaMasiva,
      indReservaCoasAprobada
    } = value;
    const requiereAjustador = getFieldValue('ajustadorRequerido') === 'S';
    // si es preventivo no aplica validaciones
    const esTipoPreventivo = codTipoSiniestro === 'P';

    const tieneSaldosPendienteOtrosConceptos = otrosConceptos.some(oc => {
      return currency(oc.mtoReserva).subtract(oc.mtoTotalPagos).value !== 0;
    });

    const tieneEstadoPendienteOtrosConceptos = otrosConceptos.some(oc => ['P', 'O'].includes(oc.estado));

    const esInformeFinal = getFieldValue('informeFinal') === 'S';
    const requiereNuevoAjustador = getFieldValue('nuevoAjustador') === 'S';
    const completarInformeFinal =
      esInformeFinal && !requiereNuevoAjustador && !esDevolver && idTarea === TAREAS.REVISAR_INFORME;

    const esCMCoaseguro = indCargaMasiva === 'COA';
    const liquidaAnalizarSiniestroCMCoaseguroPagos =
      (idTarea === TAREAS.ANALIZAR_SINIESTRO ||
        codEstadoSiniestro === ESTADO_SINIESTRO.ANALIZAR_SINIESTRO_COMPLETADO) &&
      esCMCoaseguro &&
      indReservaCoasAprobada === 'S';

    if (esTipoPreventivo) {
      if (!seCierraSiniestro) {
        callback('Debe cerrar un siniestro preventivo o convertirlo a normal');
        return;
      }

      if (requiereAjustador) {
        callback('Debe marcar en no requiere ajustador para cerrar el siniestro');
        return;
      }
    }

    if (seCierraSiniestro) {
      const tareasValidacionPendientesOtrosConceptos = [
        TAREAS.ANALIZAR_SINIESTRO,
        TAREAS.REVISAR_INFORME_BASICO,
        TAREAS.REVISAR_INFORME
      ];

      if (tareasValidacionPendientesOtrosConceptos.includes(idTarea)) {
        if (tieneEstadoPendienteOtrosConceptos) {
          // Si se cierra un siniestro con una reserva u honorario en estado pendiente,
          // se debe de registrar un pago para regularizar el registro en el core.
          callback('No debe tener otros conceptos en estado pendiente.');
          return;
        }

        if (tieneSaldosPendienteOtrosConceptos) {
          // Si se cierra un siniestro con saldo pendiente en otros conceptos
          // se debe de registrar un pago para regularizar el registro en el core.
          callback('No debe haber saldo pendiente en otros conceptos para poder completar la tarea');
          return;
        }
      }
      callback();
      return;
    }

    if (idTarea === TAREAS.REVISAR_INFORME_BASICO) {
      if (!esDevolver) {
        if (tieneEstadoPendienteOtrosConceptos) {
          callback(`No debe haber otros conceptos en estado pendiente si se quiere aprobar la tarea`);
          return;
        }
      }
    }

    if (idTarea === TAREAS.REVISAR_INFORME) {
      if (!esDevolver) {
        if (tieneEstadoPendienteOtrosConceptos) {
          callback(`No debe haber otros conceptos en estado pendiente si se quiere aprobar la tarea`);
          return;
        }
      }
    }

    if (
      idTarea === TAREAS.ANALIZAR_SINIESTRO ||
      idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO ||
      completarInformeFinal ||
      liquidaAnalizarSiniestroCMCoaseguroPagos
    ) {
      const { ramosCoberturas: ramosCoberturasForm = [] } = getFieldValue('dataRamosCoberturas') || {};

      const coberturasValidas = [];
      ramosCoberturasForm.forEach(ramo =>
        ramo.coberturas.forEach(cob => {
          if (cob.indSinCobertura === 'N') {
            coberturasValidas.push({
              codRamo: ramo.codRamo,
              ...cob
            });
          }
        })
      );

      if (
        !requiereAjustador ||
        isEmpty(coberturasValidas) ||
        completarInformeFinal ||
        liquidaAnalizarSiniestroCMCoaseguroPagos
      ) {
        if (tieneSaldosPendienteOtrosConceptos) {
          if (isEmpty(coberturasValidas)) {
            callback(
              `No debe haber saldo pendiente en otros conceptos cuando se de "sin cobertura" a todas las coberturas`
            );
            return;
          }
          if (!requiereAjustador || liquidaAnalizarSiniestroCMCoaseguroPagos) {
            callback(`No debe haber saldo pendiente en otros conceptos para poder completar la tarea`);
            return;
          }
          if (completarInformeFinal) {
            callback(`No debe haber saldo pendiente en otros conceptos si se quiere aprobar el informe final`);
            return;
          }
        }
      }

      if (idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO) {
        if (tieneSaldosPendienteOtrosConceptos) {
          const liquidaRevisarInforme = codEstadoSiniestro === 'IA' && !esDevolver;
          if (liquidaRevisarInforme) {
            callback(`No debe haber saldo pendiente en otros conceptos para poder completar la tarea`);
            return;
          }
        }
      }
    }

    callback();
  };

  render() {
    const {
      dataSiniestro,
      listaOtrosConceptos,
      userClaims,
      disabledGeneral,
      showScroll,
      numSiniestro,
      sinisterTypes,
      incoterms,
      shipmentNatures,
      closingReasons,
      form,
      flagModificar,
      esEjecutivo,
      tamanioTablaPagina,
      esAjustador,
      currentTask,
      currentTask: { idTarea },
      fechaFinVigenciaCertificado,
      fechaInicioVigenciaCertificado,
      form: { getFieldDecorator, getFieldValue }
    } = this.props;

    const esSiniestroPreventivo = getFieldValue('tipoSiniestro') === 'P';

    return (
      <Form.Item help="" validateStatus="">
        {getFieldDecorator('siniestro', {
          initialValue: {
            tipoFlujo: dataSiniestro ? dataSiniestro.tipoFlujo : '',
            canal: dataSiniestro ? dataSiniestro.canal : '',
            descripcionTipoSiniestro: dataSiniestro ? dataSiniestro.descripcionTipoSiniestro : '',
            idSiniestro: dataSiniestro ? dataSiniestro.idSiniestro : '',
            estadoSiniestro: dataSiniestro ? dataSiniestro.estadoSiniestro : '',
            nombresEjecutivo: dataSiniestro ? dataSiniestro.nombresEjecutivo : '',
            codProducto: dataSiniestro ? dataSiniestro.codProducto : '',
            descripcionProducto: dataSiniestro ? dataSiniestro.descripcionProducto : '',
            numPoliza: dataSiniestro ? dataSiniestro.numPoliza : '',
            idePoliza: dataSiniestro ? dataSiniestro.idePoliza : '',
            numCertificado: dataSiniestro ? dataSiniestro.numCertificado : '',
            fechaOcurrencia: dataSiniestro ? dataSiniestro.fechaOcurrencia : '',
            fechaAviso: dataSiniestro ? dataSiniestro.fechaAviso : '',
            indTercerAfectado: dataSiniestro ? dataSiniestro.indTercerAfectado : '',
            codReclamoBanco: dataSiniestro ? dataSiniestro.codReclamoBanco : '',
            indPrevencionFraude: dataSiniestro ? dataSiniestro.indPrevencionFraude : '',
            ubicacion: (dataSiniestro && dataSiniestro.ubicacion) || {},
            indCerrarSiniestro: dataSiniestro && dataSiniestro.indCerrarSiniestro === 'S',
            codMotivoCierre: dataSiniestro ? dataSiniestro.codMotivoCierre : false,
            aviacion: dataSiniestro ? dataSiniestro.aviacion : null,
            cascoMaritimo: dataSiniestro ? dataSiniestro.cascoMaritimo : null,
            transporte: (dataSiniestro && dataSiniestro.transporte) || undefined,
            otrosConceptos: listaOtrosConceptos || [],
            bienAfectado: dataSiniestro ? dataSiniestro.bienAfectado : '',
            indBurningCost: dataSiniestro ? dataSiniestro.indBurningCost : '',
            indRecupero: dataSiniestro ? dataSiniestro.indRecupero : '',
            indRecuperoAnt: dataSiniestro ? dataSiniestro.indRecuperoAnt : '',
            indSalvamento: dataSiniestro ? dataSiniestro.indSalvamento : '',
            indSalvamentoAnt: dataSiniestro ? dataSiniestro.indSalvamentoAnt : '',
            codTipoSiniestro: dataSiniestro ? dataSiniestro.codTipoSiniestro : '',
            indCargaMasiva: dataSiniestro ? dataSiniestro.indCargaMasiva : '',
            dscCanal: dataSiniestro ? dataSiniestro.dscCanal : '',
            codEstadoSiniestro: dataSiniestro ? dataSiniestro.codEstadoSiniestro : '',
            ubicacionModificada: false,
            siniestroLider: dataSiniestro ? dataSiniestro.siniestroLider : '',
            numPlanillaCoaseguro: dataSiniestro ? dataSiniestro.numPlanillaCoaseguro : '',
            codCoaseguroLider: dataSiniestro ? dataSiniestro.codCoaseguroLider : '',
            coaseguroLider: dataSiniestro ? dataSiniestro.coaseguroLider : '',
            indInformeFinalCoa: dataSiniestro ? dataSiniestro.indInformeFinalCoa : '',
            indReservaCoasAprobada: dataSiniestro ? dataSiniestro.indReservaCoasAprobada : ''
          },
          rules: [{ validator: this.checkSiniestro }]
        })(
          <SinisterFormItem
            form={form}
            incoterms={incoterms}
            userClaims={userClaims}
            showScroll={showScroll}
            idCurrentTask={idTarea}
            currentTask={currentTask}
            esEjecutivo={esEjecutivo}
            esAjustador={esAjustador}
            esSiniestroPreventivo={esSiniestroPreventivo}
            numSiniestro={numSiniestro}
            sinisterTypes={sinisterTypes}
            flagModificar={flagModificar}
            closingReasons={closingReasons}
            shipmentNatures={shipmentNatures}
            disabledGeneral={disabledGeneral}
            tamanioTablaPagina={tamanioTablaPagina}
            fechaInicioVigenciaCertificado={fechaInicioVigenciaCertificado}
            fechaFinVigenciaCertificado={fechaFinVigenciaCertificado}
            // Validaciones
            validacionesDataSiniester={validacionesDataSiniester}
          />
        )}
      </Form.Item>
    );
  }
}

const mapStateToProps = state => {
  const incoterms = getLstIncoterms(state);
  const esEjecutivo = getEsTipoUsuarioEjecutivo(state);
  const esAjustador = getEsTipoUsuarioAjustador(state);
  const tamanioTablaPagina = getParamGeneral(state, 'TAMANIO_TABLA_PAGINA');
  const fechaInicioVigenciaCertificado = getfechaInicioVidencia(state);
  const fechaFinVigenciaCertificado = getFechaFinVigencia(state);
  return {
    showScroll: state.services.device.scrollActivated,
    sinisterTypes: getSinisterTypes(state),
    listaOtrosConceptos: getListaOtrosConceptos(state),
    incoterms,
    esEjecutivo,
    esAjustador,
    tamanioTablaPagina,
    fechaInicioVigenciaCertificado,
    fechaFinVigenciaCertificado
  };
};

const WrappedSinisterForm = Form.create({ name: 'dataSinister' })(DataSinisterSections);
export default connect(mapStateToProps)(WrappedSinisterForm);
