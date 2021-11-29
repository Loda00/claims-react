import React from 'react';
import { connect } from 'react-redux';
import { TITLE_MODAL, PAGOS, TASA_CAMBIO_PRECISION, TAREAS, ESTADO_SINIESTRO } from 'constants/index';
import { Icon, Button, Row } from 'antd';
import { isEmpty } from 'lodash';
import currency from 'currency.js';
import IndemnizacionModal from 'scenes/TaskTray/components/SectionPayments/components/PagosFormItem/components/PaymentTabs/components/Indemnizacion/components/IndemnizacionModal';
import * as paymentsActionCreators from 'scenes/TaskTray/components/SectionPayments/data/payments/actions';
import * as paymentTypesActionCreators from 'scenes/TaskTray/components/SectionPayments/data/paymentTypes/actions';
import * as coinTypesActionCreators from 'scenes/TaskTray/components/SectionPayments/data/coinTypes/actions';
import * as chargeTypesActionCreators from 'scenes/TaskTray/components/SectionPayments/data/chargeTypes/actions';

/* SELECTORS */
// import { getCoverages } from "scenes/TaskTray/components/SectionPayments/data/coverages/reducer";
import { getPaymentTypes } from 'scenes/TaskTray/components/SectionPayments/data/paymentTypes/reducer';
import { getCoinTypes } from 'scenes/TaskTray/components/SectionPayments/data/coinTypes/reducer';
import { getChargeTypes } from 'scenes/TaskTray/components/SectionPayments/data/chargeTypes/reducer';
import {
  getPaymentsMaintainLoading,
  getPaymentsSendLoading
  // getPaymentStates
} from 'scenes/TaskTray/components/SectionPayments/data/payments/reducer';
import { getDataPoliza, getTieneCoaseguro } from 'scenes/TaskTray/components/SectionDataPoliza/data/dataPoliza/reducer';
import {
  getAseguradoPoliza,
  getMonedaCertificado
} from 'scenes/TaskTray/components/SectionDataCertificate/data/dataCertificate/reducer';
import { getParamBandeja, getParamGeneral } from 'services/types/reducer';
import {
  mostrarModalSiniestroaPreventivo,
  showErrorMessage,
  modalConfirmacion,
  esUsuarioAjustador,
  showModalError
} from 'util/index';

import { getTasaCambio } from 'services/tasaCambio/reducer';

import { noHabilitaBotonAgregar } from 'scenes/TaskTray/components/SectionPayments/util/index';
import { obtieneUsuarioModificacion } from 'scenes/TaskTray/components/SectionPayments/components/PagosFormItem/components/PaymentTabs/components/util';

import IndemnizacionTable from './components/IndemnizacionTable';
import { actualizaTotalPagosAdicion, actualizaTotalPagosActualiza, actualizaTotalPagosElimina } from './util';

class Indemnizacion extends React.Component {
  state = {
    modalVisible: false,
    selectedPago: null
  };

  hideModal = () => {
    this.setState({ modalVisible: false, selectedPago: null });
  };

  /* INICIO Manejo de modal */
  showModal = () => {
    const {
      analizarForm: { getFieldValue }
    } = this.props;
    const { codTipoSiniestro: codTipoSiniestroBack } = getFieldValue('siniestro') || {};
    const tipoSiniestroForm = getFieldValue('tipoSiniestro');
    const pasoPreventivoANormal = codTipoSiniestroBack === 'P' && tipoSiniestroForm === 'N';

    if (pasoPreventivoANormal) {
      mostrarModalSiniestroaPreventivo();
    } else {
      this.setState({ modalVisible: true }, () => this.validateFields());
    }
  };

  setModalVisibleEdit = selectedPago => {
    this.setState({ modalVisible: true, selectedPago }, () => this.validateFields());
  };

  saveFormRef = formRef => {
    this.formRef = formRef;
  };

  validateFields = () => {
    const {
      props: {
        form: { validateFields }
      }
    } = this.formRef;
    return new Promise(function(resolve, reject) {
      validateFields((err, values) => {
        if (err) {
          reject(err);
        } else {
          resolve(values);
        }
      });
    });
  };
  /* FIN Manejo de modal */

  onOkForm = async () => {
    const {
      coberturasForm,
      paymentTypes,
      chargeTypes,
      monedaCertificado,
      tasaCambio,
      indemnizaciones,
      setIndemnizaciones,
      maintainPayment,
      analizarForm,
      userClaims,
      dscEstadoPE,
      flagModificar,
      currentTask: { idTarea, idTareaBitacora, numSiniestro },
      tipoConfirmarGestion
    } = this.props;

    const { selectedPago } = this.state;

    let values;
    try {
      values = await this.validateFields();
    } catch (error) {
      return;
    }

    const selectedCobertura = coberturasForm.find(coberturaForm => coberturaForm.codCobert === values.cobertura) || {};
    const selectedTipoPago = paymentTypes.paymentTypes.find(type => type.valor === values.tipoPago) || {};
    const selectedTipoCobro = chargeTypes.chargeTypes.find(type => type.valor === values.tipoCobro) || {};

    // obtiene email -- si es ajustador se obtiene emailPadre
    const usuarioModificacion = obtieneUsuarioModificacion(userClaims);

    // extrae valores
    const newPago = {
      id: selectedPago ? selectedPago.key : undefined,
      idBeneficiario: values.beneficiario.terceroElegido.codExterno,
      nomBeneficiario: values.beneficiario.terceroElegido.nomCompleto,
      idCobertura: selectedCobertura.secCobertura,
      codCobertura: values.cobertura,
      codRamo: selectedCobertura.ramo,
      codTipoPago: values.tipoPago,
      codMonedaPago: values.monedaPago,
      mtoIndemnizacionBruta: values.indemnizacionBruta.number,
      mtoDeducible: values.deducible.number,
      codTipoCobro: values.tipoCobro,
      mtoCoaseguro: (values.montoCoaseguro || {}).number || 0,
      mtoIndemnizacionNeta: currency(values.indemnizacionBruta.number)
        .subtract(values.deducible.number)
        .subtract((values.montoCoaseguro || {}).number || 0).value,
      mtoTasaCambio:
        values.monedaPago !== monedaCertificado ? tasaCambio[`${values.monedaPago}-${monedaCertificado}`].tasa : 1,
      usuarioModificacion,
      tipoPago: 'I',
      indModificoAjustador: esUsuarioAjustador(userClaims) ? 'S' : 'N',
      indCreaEnModificar: flagModificar ? 'S' : 'N',
      idTareaBitacora:
        idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO && tipoConfirmarGestion === 'R' ? idTareaBitacora : undefined,
      numSiniestro
    };

    const coberturaSeleccionada = coberturasForm.find(cob => cob.codCobert === newPago.codCobertura) || {};

    let resultInsert = {};

    try {
      if (selectedPago) {
        const mtoTotalpagosOriginal = currency(coberturaSeleccionada.totalPagosAprobados, {
          precision: TASA_CAMBIO_PRECISION
        }).subtract(
          currency(selectedPago.mtoIndemnizacionBruta, {
            precision: TASA_CAMBIO_PRECISION
          }).multiply(selectedPago.mtoTasaCambioRegistro, {
            precision: TASA_CAMBIO_PRECISION
          })
        ).value;

        const nuevoMtoTotalPagos = currency(mtoTotalpagosOriginal, {
          precision: TASA_CAMBIO_PRECISION
        }).add(
          currency(newPago.mtoIndemnizacionBruta, {
            precision: TASA_CAMBIO_PRECISION
          }).multiply(newPago.mtoTasaCambio, {
            precision: TASA_CAMBIO_PRECISION
          })
        ).value;

        const nuevoSaldoPendiente = currency(coberturaSeleccionada.mtoReserva, {
          precision: TASA_CAMBIO_PRECISION
        }).subtract(nuevoMtoTotalPagos, {
          precision: TASA_CAMBIO_PRECISION
        }).value;
        if (nuevoSaldoPendiente < 0) {
          showModalError(
            'El saldo pendiente será negativo, por favor elegir un monto menor o trabajar con la moneda del certificado.'
          );
          return;
        }

        resultInsert = await maintainPayment('I', 'U', newPago);

        // actualiza front
        const newData = indemnizaciones.map(pago => {
          if (pago.id === newPago.id) {
            return {
              ...pago,
              ...newPago,
              dscTipoPago: selectedTipoPago.descripcion,
              dscTipoCobro: selectedTipoCobro.descripcion,
              dscCobertura: selectedCobertura.dscCobertura,
              dscEstado: dscEstadoPE,
              codEstado: PAGOS.ESTADO.PENDIENTE,
              mtoTasaCambioRegistro: newPago.mtoTasaCambio,
              indCreoAjustador: selectedPago.indCreoAjustador
            };
          }
          return pago;
        });

        // actualiza front
        setIndemnizaciones(newData);

        actualizaTotalPagosActualiza(analizarForm, newPago, selectedPago);
      } else {
        const nuevoMtoTotalPagos = currency(coberturaSeleccionada.totalPagosAprobados, {
          precision: TASA_CAMBIO_PRECISION
        }).add(
          currency(newPago.mtoIndemnizacionBruta, {
            precision: TASA_CAMBIO_PRECISION
          }).multiply(newPago.mtoTasaCambio, {
            precision: TASA_CAMBIO_PRECISION
          })
        ).value;

        const nuevoSaldoPendiente = currency(coberturaSeleccionada.mtoReserva, {
          precision: TASA_CAMBIO_PRECISION
        }).subtract(nuevoMtoTotalPagos, {
          precision: TASA_CAMBIO_PRECISION
        }).value;

        if (nuevoSaldoPendiente < 0) {
          showModalError(
            'El saldo pendiente será negativo, por favor elegir un monto menor o trabajar con la moneda del certificado.'
          );
          return;
        }

        newPago.indCreoAjustador = esUsuarioAjustador(userClaims) ? 'S' : 'N';
        resultInsert = await maintainPayment('I', 'C', newPago);

        // actualiza front
        setIndemnizaciones([
          ...indemnizaciones,
          {
            ...newPago,
            id: resultInsert.data.idPago,
            dscTipoPago: selectedTipoPago.descripcion,
            dscTipoCobro: selectedTipoCobro.descripcion,
            dscCobertura: selectedCobertura.dscCobertura,
            dscEstado: dscEstadoPE,
            codEstado: PAGOS.ESTADO.PENDIENTE,
            mtoTasaCambioRegistro: newPago.mtoTasaCambio,
            flagRevisarPago: idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO ? 'S' : undefined
          }
        ]);

        actualizaTotalPagosAdicion(analizarForm, newPago);
      }

      this.hideModal();
    } catch (error) {
      showErrorMessage('Ocurrió un error al guardar el pago');
    }
  };

  handleDelete = async record => {
    const {
      maintainPayment,
      setIndemnizaciones,
      indemnizaciones,
      analizarForm,
      analizarForm: { getFieldValue },
      currentTask: { idTarea }
    } = this.props;

    const { tipoFlujo, codEstadoSiniestro } = getFieldValue('siniestro') || {};

    const pagos = getFieldValue('pagos');
    const ajustadorRequerido = getFieldValue('ajustadorRequerido');

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
    const esInformeFinal = getFieldValue('informeFinal') === 'S';
    const esSimpleSinAjustador = tipoFlujo === 'S' && ajustadorRequerido !== 'S';

    const esComplejoSinAjustador = tipoFlujo === 'C' && ajustadorRequerido !== 'S';

    const liquidaAnalizarSiniestro = esSimpleSinAjustador || esComplejoSinAjustador;
    if (TAREAS.REVISAR_PAGO_EJECUTIVO === idTarea) {
      const liquidacionFlujoSimple =
        ESTADO_SINIESTRO.ANALIZAR_SINIESTRO_COMPLETADO === codEstadoSiniestro && liquidaAnalizarSiniestro;
      const liquidacionFlujoComplejo = ESTADO_SINIESTRO.INFORME_APROBADO === codEstadoSiniestro && esInformeFinal;
      if (liquidacionFlujoSimple || liquidacionFlujoComplejo) {
        if (coberturasValidas.length > 0) {
          const tieneIndenizacion = pagos.indemnizaciones.length - 1 > 0;
          const tieneReposicion = pagos.reposiciones.length > 0;
          if (!tieneIndenizacion && !tieneReposicion) {
            showModalError('Debe tener por lo menos un pago de indemnización o reposición');
            return;
          }
        }
      }
    }

    try {
      await maintainPayment('I', 'D', {
        id: record.key,
        idCobertura: record.idCobertura
      });
    } catch (error) {
      showErrorMessage(error);
      return;
    }
    setIndemnizaciones(indemnizaciones.filter(pago => pago.id !== record.key));

    actualizaTotalPagosElimina(analizarForm, record);
  };

  enConfirmarEnviar = async args => {
    const { record, numberMtoTasaCambio } = args;
    const {
      numSiniestro,
      dataSinister: { tipoFlujo, ajustador: { idUsuarioBPM, emailAjustadorBPM } = {} } = {},
      sendPayment,
      dscEstadoEN,
      setIndemnizaciones,
      indemnizaciones,
      userClaims: { idCargoBpm }
    } = this.props;

    const numberMtoTasaCambioRegistro = currency(record.mtoTasaCambioRegistro, {
      precision: TASA_CAMBIO_PRECISION
    }).value;
    const tasaElegida = numberMtoTasaCambio || numberMtoTasaCambioRegistro;

    const params = {
      numCaso: numSiniestro,
      tipoProceso: tipoFlujo,
      flagAprobarRechazar: 'A',
      montoPagar: currency(record.mtoIndemnizacionNeta).multiply(tasaElegida).value,
      id: record.key,
      paymentType: 'I',
      idAjustador: idUsuarioBPM,
      emailAjustadorBPM,
      idCargoSolicitante: idCargoBpm
    };

    try {
      await sendPayment(params);
    } catch (error) {
      showErrorMessage(error);
      return;
    }
    setIndemnizaciones(
      indemnizaciones.map(pago => {
        if (pago.id === record.key) {
          return {
            ...pago,
            dscEstado: dscEstadoEN,
            codEstado: PAGOS.ESTADO.ENVIADO
          };
        }
        return pago;
      })
    );
  };

  handleEnviar = async record => {
    // validar cobertura si esta pendiente
    const { coberturasForm } = this.props;
    const codCoberturaRecord = record.codCobertura;
    const codRamoRecord = record.codRamo;
    const coberturaEsPendiente = coberturasForm.some(
      coberturaForm =>
        coberturaForm.ramo === codRamoRecord &&
        coberturaForm.codCobert === codCoberturaRecord &&
        coberturaForm.estado === 'P'
    );

    if (coberturaEsPendiente) {
      showModalError(
        'La cobertura correspondiente está pendiente. Primero debe editar y grabar la cobertura para poder enviar el pago.'
      );
      return;
    }

    const { tasaCambio, monedaCertificado } = this.props;

    if (record.codMonedaPago === 'USD' && monedaCertificado === 'USD') {
      this.enConfirmarEnviar({ record, numberMtoTasaCambio: 1 });
    } else if (record.codMonedaPago === 'SOL' && monedaCertificado === 'SOL') {
      this.enConfirmarEnviar({
        record,
        numberMtoTasaCambio: tasaCambio[`${'SOL'}-${'USD'}`].tasa
      });
    } else if (record.codMonedaPago === 'SOL' && monedaCertificado === 'USD') {
      const mtoTasaCambio = record.codMonedaPago !== 'USD' ? tasaCambio[`${record.codMonedaPago}-${'USD'}`].tasa : 1;

      const numberMtoTasaCambio = currency(mtoTasaCambio, {
        precision: TASA_CAMBIO_PRECISION
      }).value;

      const numberMtoTasaCambioRegistro = currency(record.mtoTasaCambioRegistro, {
        precision: TASA_CAMBIO_PRECISION
      }).value;

      if (numberMtoTasaCambio !== numberMtoTasaCambioRegistro) {
        const opciones = {
          content: (
            <div>
              <div>
                La tasa de cambio del día{' '}
                <span
                  style={{
                    color: 'red',
                    fontweight: 'bold'
                  }}
                >
                  {numberMtoTasaCambio}
                </span>{' '}
                es diferente a la tasa de cambio con la que se registró el pago:{' '}
                <span
                  style={{
                    color: 'red',
                    fontweight: 'bold'
                  }}
                >
                  {numberMtoTasaCambioRegistro}.
                </span>
              </div>
              <br />
              <div>
                Considerando la tasa de cambio con la que se registro el pago{' '}
                <span
                  style={{
                    color: 'red',
                    fontweight: 'bold'
                  }}
                >
                  {numberMtoTasaCambioRegistro}
                </span>
                , el monto a enviar será:{' '}
                <span
                  style={{
                    color: 'red',
                    fontweight: 'bold'
                  }}
                >
                  USD{' '}
                  {currency(record.mtoIndemnizacionNeta)
                    .multiply(numberMtoTasaCambioRegistro, {
                      precision: TASA_CAMBIO_PRECISION
                    })
                    .format()}
                </span>
              </div>
              <br />
              <div>Desea enviar el pago?</div>
            </div>
          ),
          cb: () => {
            this.enConfirmarEnviar({ record });
          }
        };
        modalConfirmacion(opciones);
      } else {
        this.enConfirmarEnviar({ record, numberMtoTasaCambio });
      }
    } else {
      this.enConfirmarEnviar({ record, numberMtoTasaCambio: 1 });
    }
  };

  render() {
    const {
      disabledGeneral,
      coberturasForm,
      paymentTypes,
      coinTypes,
      chargeTypes,
      tieneCoaseguro,
      aseguradoPoliza,
      numSiniestro,
      monedaCertificado,
      maintainLoading,
      indemnizaciones,
      sendLoading,
      analizarForm,
      tasaCambio,
      userClaims,
      currentTask,
      fetchPaymentTypes,
      fetchCoinTypes,
      fetchChargeTypes,
      tipoConfirmarGestion,
      tamanioPagina,
      esDevolver,
      flagModificar,
      dataPoliza,
      dataSinister,
      clave,
      pagosObservados
    } = this.props;

    const { selectedPago, modalVisible } = this.state;
    const esAnalizarSiniestro = currentTask.idTarea === TAREAS.ANALIZAR_SINIESTRO;
    const esConsultaSiniestro = currentTask.idTarea === undefined;

    return (
      <React.Fragment>
        <Button
          data-cy="boton_agregar_indemnizaciones"
          disabled={noHabilitaBotonAgregar({
            tipo: 'I',
            disabledGeneral,
            analizarForm,
            currentTask,
            tipoConfirmarGestion,
            esDevolver,
            dataSinister,
            pagosObservados
          })}
          onClick={this.showModal}
        >
          Agregar indemnizaci&oacute;n
          <Icon type="plus-circle" style={{ fontSize: '15px' }} />
        </Button>

        {modalVisible && (
          <IndemnizacionModal
            wrappedComponentRef={this.saveFormRef}
            coberturasForm={coberturasForm}
            paymentTypes={paymentTypes}
            coinTypes={coinTypes}
            chargeTypes={chargeTypes}
            tieneCoaseguro={tieneCoaseguro}
            aseguradoPoliza={aseguradoPoliza}
            numSiniestro={numSiniestro}
            monedaCertificado={monedaCertificado}
            hideModal={this.hideModal}
            onOk={this.onOkForm}
            modalVisible={modalVisible}
            maintainLoading={maintainLoading}
            selectedPago={selectedPago}
            disabledGeneral={disabledGeneral}
            titleModal={TITLE_MODAL.INDEMNIZACION}
            analizarForm={analizarForm}
            tasaCambio={tasaCambio}
            fetchPaymentTypes={fetchPaymentTypes}
            fetchCoinTypes={fetchCoinTypes}
            fetchChargeTypes={fetchChargeTypes}
            tipoConfirmarGestion={tipoConfirmarGestion}
            dataPoliza={dataPoliza}
            dataSinister={dataSinister}
          />
        )}
        {dataSinister &&
          dataSinister.indCargaMasiva === 'COA' &&
          dataSinister.numPlanillaCoaseguro &&
          (!isEmpty(indemnizaciones) && (esAnalizarSiniestro || esConsultaSiniestro)) && (
            <div style={{ display: 'inline-block' }}>
              <div
                style={{
                  display: 'inline-block',
                  marginTop: '7px',
                  marginLeft: '10px'
                }}
                className="claims-rrgg-description-list-index-term"
              >
                Nro. Planilla
              </div>
              <div style={{ display: 'inline-block' }}>{dataSinister.numPlanillaCoaseguro}</div>
            </div>
          )}
        <Row>
          <IndemnizacionTable
            disabledGeneral={disabledGeneral}
            indemnizaciones={indemnizaciones}
            handleDelete={this.handleDelete}
            setModalVisibleEdit={this.setModalVisibleEdit}
            enviar={this.handleEnviar}
            maintainLoading={maintainLoading}
            sendLoading={sendLoading}
            currentTask={currentTask}
            tieneCoaseguro={tieneCoaseguro}
            tipoConfirmarGestion={tipoConfirmarGestion}
            userClaims={userClaims}
            tamanioPagina={tamanioPagina}
            flagModificar={flagModificar}
            clave={clave}
          />
        </Row>
      </React.Fragment>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    maintainPayment: (tipoPago, accion, data) =>
      dispatch(paymentsActionCreators.maintainPayment(tipoPago, accion, data)),
    sendPayment: params => dispatch(paymentsActionCreators.sendPayment(params)),
    fetchPaymentTypes: () => dispatch(paymentTypesActionCreators.fetchPaymentTypes('CRG_TPAGO')),
    fetchCoinTypes: () => dispatch(coinTypesActionCreators.fetchCoinTypes('CRG_TMONEDA')),
    fetchChargeTypes: () => dispatch(chargeTypesActionCreators.fetchChargeTypes('CRG_TCOBRO'))
  };
};

const mapStateToProps = state => {
  const paymentTypes = getPaymentTypes(state);
  const coinTypes = getCoinTypes(state);
  const chargeTypes = getChargeTypes(state);
  const maintainLoading = getPaymentsMaintainLoading(state);

  const tieneCoaseguro = getTieneCoaseguro(state);
  const aseguradoPoliza = getAseguradoPoliza(state);
  const dataPoliza = getDataPoliza(state);

  const tasaCambio = getTasaCambio(state);
  const monedaCertificado = getMonedaCertificado(state);
  const sendLoading = getPaymentsSendLoading(state);

  const dscEstadoPE = getParamBandeja(state, 'PAGOS_DSC_EST_PE');
  const dscEstadoEN = getParamBandeja(state, 'PAGOS_DSC_EST_EN');
  const tamanioPagina = getParamGeneral(state, 'TAMANIO_TABLA_PAGINA');

  return {
    paymentTypes,
    coinTypes,
    chargeTypes,
    maintainLoading,
    tieneCoaseguro,
    aseguradoPoliza,
    tasaCambio,
    monedaCertificado,
    sendLoading,
    dscEstadoPE,
    dscEstadoEN,
    tamanioPagina,
    dataPoliza,
    userClaims: state.services.user.userClaims
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Indemnizacion);
