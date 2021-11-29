import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Form } from 'antd';
import { isEmpty } from 'lodash';
import PagosFormItem from 'scenes/TaskTray/components/SectionPayments/components/PagosFormItem';
import { PAGOS, TAREAS, ESTADO_SINIESTRO } from 'constants/index';
import { getDataSinister } from 'scenes/TaskTray/components/SectionDataSinister/data/dataSinister/reducer';
import { getDataCertificate } from 'scenes/TaskTray/components/SectionDataCertificate/data/dataCertificate/reducer';
import { esUsuarioEjecutivo } from 'util/index';
import { getDataPoliza } from 'scenes/TaskTray/components/SectionDataPoliza/data/dataPoliza/reducer';
import { getParamFRS } from 'services/types/reducer';
import currency from 'currency.js';

class RegistryPaymentSections extends Component {
  checkPagos = (rule, value, callback) => {
    const {
      analizarForm: { getFieldValue },
      currentTask: { idTarea } = {},
      esDevolver = false,
      userClaims,
      flagModificar
    } = this.props;
    const {
      codEstadoSiniestro,
      indCerrarSiniestro: seCierraSiniestro,
      codTipoSiniestro,
      indCargaMasiva,
      numPlanillaCoaseguro,
      indReservaCoasAprobada
    } = getFieldValue('siniestro') || {};

    const dtaRamosCoberturas = getFieldValue('dataRamosCoberturas') || {};
    const { ramosCoberturas: ramosCoberturasForm = [] } = dtaRamosCoberturas;
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

    const ajustadorRequerido = getFieldValue('ajustadorRequerido');
    // si es preventivo no aplica validaciones
    const esTipoPreventivo = codTipoSiniestro === 'P';

    const {
      ESTADO: { ENVIADO, OB_GENERADA, PENDIENTE_GENERAR_OB, PENDIENTE, OBSERVADO }
    } = PAGOS;
    const estadosPagoEnProceso = [ENVIADO, OB_GENERADA, PENDIENTE_GENERAR_OB, OBSERVADO];

    const tieneIndemnizacionEnProceso = value.indemnizaciones.some(
      ind => estadosPagoEnProceso.includes(ind.codEstado) || (ind.codEstado === 'PE' && ind.codProceso)
    );
    const tieneReposicionEnProceso = value.reposiciones.some(
      repo => estadosPagoEnProceso.includes(repo.codEstado) || (repo.codEstado === 'PE' && repo.codProceso)
    );
    const tieneReservasEnPendiente = value.otrosConceptos.some(ind => ind.codEstado === PENDIENTE && !ind.codProceso);
    const tieneHonorariosEnPendiente = value.honorarios.some(ho => ho.codEstado === PENDIENTE && !ho.codProceso);
    const tienePagosAprobados = tieneIndemnizacionEnProceso || tieneReposicionEnProceso;

    const tienePagosHonorariosOReservasEnPendiente = tieneReservasEnPendiente || tieneHonorariosEnPendiente;

    const tareasValidarCierreSiniestro = [
      TAREAS.ANALIZAR_SINIESTRO,
      TAREAS.REVISAR_INFORME_BASICO,
      TAREAS.REVISAR_INFORME
    ];

    const esInformeFinal = getFieldValue('informeFinal') === 'S';
    const requiereNuevoAjustador = getFieldValue('nuevoAjustador') === 'S';
    const validarPagosIndemnizacionReposicion = esInformeFinal && !requiereNuevoAjustador && !esDevolver;

    const esCMCoaseguro = indCargaMasiva === 'COA';

    const liquidaAnalizarSiniestroFlujoSimple = ajustadorRequerido === 'N' && !seCierraSiniestro;
    const liquidaAnalizarSiniestroCMCoaseguroPagos = esCMCoaseguro && indReservaCoasAprobada === 'S';
    const liquidaAnalizarSiniestro = liquidaAnalizarSiniestroFlujoSimple || liquidaAnalizarSiniestroCMCoaseguroPagos;

    if (esTipoPreventivo) {
      callback();
      return;
    }

    // Validacion cuando se marca el checkbox 'cerrar siniestro'
    if (seCierraSiniestro && tareasValidarCierreSiniestro.includes(idTarea)) {
      if (tienePagosAprobados) {
        callback('No puede cerrar el siniestro si tiene pagos de indemnizacion y/o' + ' reposición en pendiente');
        return;
      }

      if (tienePagosHonorariosOReservasEnPendiente) {
        callback('No puede cerrar el siniestro si tiene pagos en pendiente de enviar');
        return;
      }
      callback();
      return;
    }

    if (esUsuarioEjecutivo(userClaims) && idTarea !== TAREAS.REVISAR_PAGO_EJECUTIVO && !esDevolver && !flagModificar) {
      if (value.indemnizaciones.some(ind => ind.codEstado === PENDIENTE && !ind.codProceso)) {
        callback('No debe tener pagos de indemnización en estado pendiente');
        return;
      }
      if (value.honorarios.some(hono => hono.codEstado === PENDIENTE && !hono.codProceso)) {
        callback('No debe tener pagos de honorarios en estado pendiente');
        return;
      }
      if (value.otrosConceptos.some(oc => oc.codEstado === PENDIENTE && !oc.codProceso)) {
        callback('No debe tener pagos de otros conceptos en estado pendiente');
        return;
      }
      if (value.reposiciones.some(repo => repo.codEstado === PENDIENTE && !repo.codProceso)) {
        callback('No debe tener pagos de reposiciones en estado pendiente');
        return;
      }
      if (value.acreencias.some(ac => ac.indAprobado === 'N')) {
        callback('No debe tener pagos de acreencias en estado pendiente');
        return;
      }
      if (value.coordenadas.some(coord => coord.indAprobado === 'N' || coord.indAprobado === 'P')) {
        callback('No debe tener la modalidad de pagos en estado pendiente');
        return;
      }
    }

    if (!esDevolver && [TAREAS.REVISAR_PAGO_EJECUTIVO, TAREAS.REVISAR_PAGO_AJUSTADOR].includes(idTarea)) {
      const indemnizacionesFiltradas = value.indemnizaciones.filter(pago => pago.flagRevisarPago === 'S');
      const honoFiltradas = value.honorarios.filter(pago => pago.flagRevisarPago === 'S');
      const ocFiltradas = value.otrosConceptos.filter(pago => pago.flagRevisarPago === 'S');
      const repoFiltradas = value.reposiciones.filter(pago => pago.flagRevisarPago === 'S');

      if (indemnizacionesFiltradas.some(ind => ind.codEstado === OBSERVADO)) {
        callback('No debe tener pagos de indemnización en estado observado');
        return;
      }
      if (honoFiltradas.some(hono => hono.codEstado === OBSERVADO)) {
        callback('No debe tener pagos de honorarios en estado observado');
        return;
      }
      if (ocFiltradas.some(oc => oc.codEstado === OBSERVADO)) {
        callback('No debe tener pagos de otros conceptos en estado observado');
        return;
      }
      if (repoFiltradas.some(repo => repo.codEstado === OBSERVADO)) {
        callback('No debe tener pagos de reposiciones en estado observado');
        return;
      }

      if (TAREAS.REVISAR_PAGO_EJECUTIVO === idTarea) {
        const liquidacionFlujoSimple =
          ESTADO_SINIESTRO.ANALIZAR_SINIESTRO_COMPLETADO === codEstadoSiniestro && liquidaAnalizarSiniestro;
        const liquidacionFlujoComplejo = ESTADO_SINIESTRO.INFORME_APROBADO === codEstadoSiniestro && esInformeFinal;
        if (liquidacionFlujoSimple || liquidacionFlujoComplejo) {
          if (coberturasValidas.length > 0) {
            const tieneIndenizacion = value.indemnizaciones.length > 0;
            const tieneReposicion = value.reposiciones.length > 0;
            if (!tieneIndenizacion && !tieneReposicion) {
              callback('Debe tener por lo menos un pago de indemnización o reposición');
              return;
            }
          }
        }
      }
    }

    if (idTarea === TAREAS.REVISAR_INFORME) {
      if (!isEmpty(coberturasValidas)) {
        if (validarPagosIndemnizacionReposicion) {
          const noTienePagosAprobados = !tieneIndemnizacionEnProceso && !tieneReposicionEnProceso;
          if (noTienePagosAprobados) {
            callback('Debe enviar aprobar un pago de indemnización o reposición');
            return;
          }
        }
      }
    }

    if (idTarea === TAREAS.ANALIZAR_SINIESTRO) {
      if (isEmpty(coberturasValidas) && ajustadorRequerido === 'N') {
        callback();
        return;
      }

      if (liquidaAnalizarSiniestro) {
        const noTienePagosAprobados = !tieneIndemnizacionEnProceso && !tieneReposicionEnProceso;
        if (noTienePagosAprobados) {
          callback(`Debe enviar aprobar un pago de indemnización${(!esCMCoaseguro && ` o reposición`) || ``}.`);
          return;
        }
      }
    }

    if (flagModificar) {
      if (value.indemnizaciones.some(ind => ind.codEstado === PENDIENTE && ind.indCreaEnModificar === 'S')) {
        callback('No debe tener pagos de indemnización en estado pendiente');
        return;
      }
      if (value.honorarios.some(hono => hono.codEstado === PENDIENTE && hono.indCreaEnModificar === 'S')) {
        callback('No debe tener pagos de honorarios en estado pendiente');
        return;
      }
      if (value.otrosConceptos.some(oc => oc.codEstado === PENDIENTE && oc.indCreaEnModificar === 'S')) {
        callback('No debe tener pagos de otros conceptos en estado pendiente');
        return;
      }
      if (value.reposiciones.some(repo => repo.codEstado === PENDIENTE && repo.indCreaEnModificar === 'S')) {
        callback('No debe tener pagos de reposiciones en estado pendiente');
        return;
      }
      if (value.acreencias.some(ac => ac.indAprobado === 'N' && ac.indCreaEnModificar === 'S')) {
        callback('No debe tener pagos de acreencias en estado pendiente');
        return;
      }
      if (
        value.coordenadas.some(
          coord => (coord.indAprobado === 'N' || coord.indAprobado === 'P') && coord.indCreaEnModificar === 'S'
        )
      ) {
        callback('No debe tener la modalidad de pagos en estado pendiente');
        return;
      }
    }

    if (false /* esCMCoaseguro */) {
      // Control de Cambios - Validacion de pagos observados
      console.log('Es coaseguro.', codEstadoSiniestro);
      if (codEstadoSiniestro === ESTADO_SINIESTRO.PENDIENTE_ANALIZAR_SINIESTRO) {
        console.log('Es analizar siniestro.');
        if (numPlanillaCoaseguro) {
          console.log('Tiene numero de planilla.');
          if (value.pagosObservados.length > 0) {
            console.log('Hay pagos observados.');
            const pagosPorRegistrar = new Set();

            value.pagosObservados.forEach(pagObs => {
              switch (pagObs.tipoPago) {
                case 'I': {
                  console.log('Tiene indemnizacion observados.');

                  const tieneIndemnizacionRegistrados = value.indemnizaciones.some((ind, i) => {
                    console.log({
                      vuelta: i,
                      mtoInde: currency(ind.mtoIndemnizacionBruta).value,
                      obsMto: currency(pagObs.monto).value,
                      mon: ind.codMonedaPago,
                      obsMon: pagObs.moneda
                    });

                    return (
                      currency(ind.mtoIndemnizacionBruta).value === currency(pagObs.monto).value &&
                      ind.codMonedaPago === pagObs.moneda
                    );
                  });

                  if (!tieneIndemnizacionRegistrados) {
                    console.log('No tiene pago indemnizacion registrados.');
                    pagosPorRegistrar.add('indemnizacion');
                  }
                  break;
                }
                case 'H': {
                  console.log('Tiene honorario observados.');
                  const tieneHonorariosRegistrados = value.honorarios.some(hono => {
                    console.log({ cob: coberturasValidas[0] });
                    /*
                      if (sumaAseg >= mtoPagoObs) {
                        return currency(hono.mtoHonorarios).value === currency(pagObs.monto).value &&
                        hono.codMoneda === pagObs.moneda
                      }
                      return currency(hono.mtoHonorarios).value === currency(sumaAseg).value &&
                      hono.codMoneda === pagObs.moneda
                    */
                  });
                  if (!tieneHonorariosRegistrados) {
                    console.log('No tiene pago honorarios registrados.');
                    pagosPorRegistrar.add('honorarios');
                  }
                  break;
                }
                default:
                  break;
              }

              if (pagosPorRegistrar.size > 0) {
                console.log('Faltan pargar registros.', { pagosPorRegistrar });

                const arrPagosPorRegistrar = Array.from(pagosPorRegistrar);

                let msgPagosPorRegostrar = arrPagosPorRegistrar[0];

                if (pagosPorRegistrar.size === 2) {
                  msgPagosPorRegostrar += `y ${arrPagosPorRegistrar[1]}`;
                }

                callback(`Debe ingresar un pago de ${msgPagosPorRegostrar} para poder completar la tarea.`);
              }
            });
          }
        }
      }
    }

    callback();
  };

  render() {
    const {
      analizarForm,
      analizarForm: { getFieldDecorator, getFieldValue },
      payments: {
        indemnizaciones = [],
        honorarios = [],
        otrosConceptos = [],
        reposiciones = [],
        acreencias = [],
        pagosObservados = [],
        clave = 'indemnizacion'
      } = {},
      coordenadas = [],
      numSiniestro,
      currentTask = {},
      disabledGeneral,
      showScroll,
      dataSinister,
      dataCertificate,
      dataPoliza,
      tipoConfirmarGestion,
      flagModificar,
      userClaims,
      esDevolver,
      indModalidadPago
    } = this.props;

    const { ramosCoberturas: ramosCoberturasForm = [] } = getFieldValue('dataRamosCoberturas') || {};
    const { otrosConceptos: otrosConceptosForm = [] } = getFieldValue('siniestro') || {};

    return (
      <div>
        <Row gutter={24}>
          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            <Form.Item label="Pagos" required help="">
              {getFieldDecorator('pagos', {
                initialValue: {
                  indemnizaciones,
                  honorarios,
                  otrosConceptos,
                  reposiciones,
                  acreencias,
                  coordenadas,
                  pagosObservados
                },
                rules: [{ validator: this.checkPagos }]
              })(
                <PagosFormItem
                  numSiniestro={numSiniestro}
                  otrosConceptosForm={otrosConceptosForm}
                  ramosCoberturasForm={ramosCoberturasForm}
                  currentTask={currentTask}
                  analizarForm={analizarForm}
                  disabledGeneral={disabledGeneral}
                  showScroll={showScroll}
                  dataSinister={dataSinister}
                  dataCertificate={dataCertificate}
                  dataPoliza={dataPoliza}
                  clave={clave}
                  tipoConfirmarGestion={tipoConfirmarGestion}
                  flagModificar={flagModificar}
                  userClaims={userClaims}
                  esDevolver={esDevolver}
                  indModalidadPago={indModalidadPago}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = state => {
  const dataSinister = getDataSinister(state);
  const dataCertificate = getDataCertificate(state);
  const dataPoliza = getDataPoliza(state);
  const indModalidadPago = getParamFRS(state, 'CRG_CFG_FRONT');
  return {
    dataSinister,
    dataCertificate,
    dataPoliza,
    userClaims: state.services.user.userClaims,
    indModalidadPago
  };
};

export default connect(mapStateToProps)(RegistryPaymentSections);
