import React from 'react';
import { connect } from 'react-redux';
import currency from 'currency.js';
import { TITLE_MODAL, CONSTANTS_APP, PAGOS, TASA_CAMBIO_PRECISION } from 'constants/index';
import { Icon, Button, Row } from 'antd';
import OtrosConceptosModal from 'scenes/TaskTray/components/SectionPayments/components/PagosFormItem/components/PaymentTabs/components/OtrosConceptos/OtrosConceptosModal';
import OtrosConceptosTable from 'scenes/TaskTray/components/SectionPayments/components/PagosFormItem/components/PaymentTabs/components/OtrosConceptos/OtrosConceptosTable';
import * as paymentsActionCreators from 'scenes/TaskTray/components/SectionPayments/data/payments/actions';

/* SELECTORS */
import { getCoinTypes } from 'scenes/TaskTray/components/SectionPayments/data/coinTypes/reducer';
import { getChargeTypes } from 'scenes/TaskTray/components/SectionPayments/data/chargeTypes/reducer';
import { getDocTypes } from 'scenes/TaskTray/components/SectionPayments/data/docTypes/reducer';
import {
  getPaymentsMaintainLoading,
  getPaymentsSendLoading
} from 'scenes/TaskTray/components/SectionPayments/data/payments/reducer';
import { getMonedaCertificado } from 'scenes/TaskTray/components/SectionDataCertificate/data/dataCertificate/reducer';
import { getTieneCoaseguro } from 'scenes/TaskTray/components/SectionDataPoliza/data/dataPoliza/reducer';
import { getParamBandeja, getParamGeneral } from 'services/types/reducer';
import { getTasaCambio } from 'services/tasaCambio/reducer';
import { noHabilitaBotonAgregar } from 'scenes/TaskTray/components/SectionPayments/util/index';
import {
  modalConfirmacion,
  mostrarModalSiniestroaPreventivo,
  showErrorMessage,
  esUsuarioAjustador,
  showModalError
} from 'util/index';
import { obtieneUsuarioModificacion } from 'scenes/TaskTray/components/SectionPayments/components/PagosFormItem/components/PaymentTabs/components/util';
import { actualizaTotalPagosAdicion, actualizaTotalPagosActualiza, actualizaTotalPagosElimina } from '../util';

class OtrosConceptos extends React.Component {
  state = {
    modalVisible: false,
    selectedPago: null
  };

  /* INICIO Manejo de modal */
  hideModal = () => {
    this.setState({ modalVisible: false, selectedPago: null });
  };

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
      analizarForm,
      docTypes,
      chargeTypes,
      monedaCertificado,
      tasaCambio,
      dispatch,
      setOtrosConceptos,
      otrosConceptos,
      userClaims,
      otrosConceptosForm,
      dscEstadoPE,
      flagModificar,
      currentTask: { numSiniestro }
    } = this.props;

    const { selectedPago } = this.state;

    let values;
    try {
      values = await this.validateFields();
    } catch (error) {
      return;
    }

    const selectedConcept = otrosConceptosForm.find(type => type.codConcepto === values.codConcepto) || {};
    const selectedDocType = docTypes.docTypes.find(type => type.valor === values.codTipoDocumento) || {};
    const selectedTipoCobro = chargeTypes.chargeTypes.find(type => type.valor === values.codTipoCobro) || {};

    // obtiene email -- si es ajustador se obtiene emailPadre
    const usuarioModificacion = obtieneUsuarioModificacion(userClaims);

    // extrae valores
    const newPago = {
      ...values,
      mtoImporte: values.mtoImporte.number,
      mtoCoaseguro: (values.mtoCoaseguro || {}).number || 0,
      mtoIgv: (values.mtoIgv || {}).number || 0,
      mtoRetencionCuarta: (values.mtoRetencionCuarta || {}).number || 0,
      mtoTotal: values.mtoTotal.number,
      idProveedor: values.proveedor.terceroElegido.codExterno,
      nomProveedor: values.proveedor.terceroElegido.nomCompleto,
      fecEmision: values.fecEmision.format('YYYY-MM-DD'),
      id: selectedPago ? selectedPago.key : undefined,
      mtoTasaCambio:
        values.codMoneda !== monedaCertificado ? tasaCambio[`${values.codMoneda}-${monedaCertificado}`].tasa : 1,
      codRamo: selectedConcept.codRamo,
      usuarioModificacion,
      tipoPago: 'O',
      indModificoAjustador: esUsuarioAjustador(userClaims) ? 'S' : 'N',
      indCreaEnModificar: flagModificar ? 'S' : 'N',
      numSiniestro
    };

    delete newPago.proveedor;

    const otroConceptoSeleccionado = otrosConceptosForm.find(
      oc => oc.codConcepto === values.codConcepto && oc.codRamo === selectedConcept.codRamo
    );

    // guarda en servidor
    let resultInsert = {};

    try {
      if (selectedPago) {
        const mtoTotalpagosOriginal = currency(otroConceptoSeleccionado.mtoTotalPagos, {
          precision: TASA_CAMBIO_PRECISION
        }).subtract(
          currency(selectedPago.mtoImporte, {
            precision: TASA_CAMBIO_PRECISION
          }).multiply(selectedPago.mtoTasaCambioRegistro, {
            precision: TASA_CAMBIO_PRECISION
          })
        ).value;

        const nuevoMtoTotalPagos = currency(mtoTotalpagosOriginal, {
          precision: TASA_CAMBIO_PRECISION
        }).add(
          currency(newPago.mtoImporte, {
            precision: TASA_CAMBIO_PRECISION
          }).multiply(newPago.mtoTasaCambio, {
            precision: TASA_CAMBIO_PRECISION
          })
        ).value;

        const nuevoSaldoPendiente = currency(otroConceptoSeleccionado.mtoReserva, {
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

        const updatedPago = newPago;
        resultInsert = await dispatch(paymentsActionCreators.maintainPayment('O', 'U', updatedPago));

        // actualiza front
        const newData = otrosConceptos.map(pago => {
          if (pago.id === newPago.id) {
            return {
              ...pago,
              ...newPago,
              dscTipoDocumento: selectedDocType.descripcion,
              dscTipoCobro: selectedTipoCobro.descripcion,
              dscConcepto: selectedConcept.dscConcepto,
              dscEstado: dscEstadoPE,
              codEstado: PAGOS.ESTADO.PENDIENTE,
              mtoTasaCambioRegistro: newPago.mtoTasaCambio,
              indCreoAjustador: selectedPago.indCreoAjustador
            };
          }
          return pago;
        });

        // actualiza front
        setOtrosConceptos(newData);
        actualizaTotalPagosActualiza(analizarForm, newPago, selectedPago);
      } else {
        // verifica si sera negativo el saldo pendiente
        const nuevoMtoTotalPagos = currency(otroConceptoSeleccionado.mtoTotalPagos, {
          precision: TASA_CAMBIO_PRECISION
        }).add(
          currency(newPago.mtoImporte, {
            precision: TASA_CAMBIO_PRECISION
          }).multiply(newPago.mtoTasaCambio, {
            precision: TASA_CAMBIO_PRECISION
          })
        ).value;

        const nuevoSaldoPendiente = currency(otroConceptoSeleccionado.mtoReserva, {
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
        resultInsert = await dispatch(paymentsActionCreators.maintainPayment('O', 'C', newPago));

        // actualiza front
        setOtrosConceptos([
          ...otrosConceptos,
          {
            ...newPago,
            id: resultInsert.data.idPago,
            fecEmision: values.fecEmision.format(CONSTANTS_APP.FORMAT_DATE_OUTPUT_SYN),
            dscTipoDocumento: selectedDocType.descripcion,
            dscTipoCobro: selectedTipoCobro.descripcion,
            dscConcepto: selectedConcept.dscConcepto,
            dscEstado: dscEstadoPE,
            codEstado: PAGOS.ESTADO.PENDIENTE,
            mtoTasaCambioRegistro: newPago.mtoTasaCambio
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
    const { dispatch, setOtrosConceptos, otrosConceptos, analizarForm } = this.props;
    try {
      await dispatch(
        paymentsActionCreators.maintainPayment('O', 'D', {
          id: record.key,
          codConcepto: record.codConcepto,
          idRamo: record.idRamo
        })
      );
    } catch (error) {
      showErrorMessage(error);
      return;
    }
    setOtrosConceptos(otrosConceptos.filter(pago => pago.id !== record.key));
    actualizaTotalPagosElimina(analizarForm, record);
  };

  handleEnviar = async record => {
    // validar concepto ajustador si esta pendiente
    const { otrosConceptosForm } = this.props;
    const codConceptoRecord = record.codConcepto;
    const codRamoRecord = record.codRamo;
    const conceptoEsPendiente = otrosConceptosForm.some(
      otroConceptoForm =>
        otroConceptoForm.codRamo === codRamoRecord &&
        otroConceptoForm.codConcepto === codConceptoRecord &&
        (otroConceptoForm.estado === 'P' || otroConceptoForm.estado === 'O')
    );

    if (conceptoEsPendiente) {
      showModalError(
        'La reserva otros conceptos correspondiente está pendiente. Primero debe editar y grabar la reserva para poder enviar el pago.'
      );
      return;
    }

    const { tasaCambio, monedaCertificado } = this.props;

    if (record.codMoneda === 'USD' && monedaCertificado === 'USD') {
      this.enConfirmarEnviar({ record, numberMtoTasaCambio: 1 });
    } else if (record.codMoneda === 'SOL' && monedaCertificado === 'SOL') {
      this.enConfirmarEnviar({
        record,
        numberMtoTasaCambio: tasaCambio[`${'SOL'}-${'USD'}`].tasa
      });
    } else if (record.codMoneda === 'SOL' && monedaCertificado === 'USD') {
      const mtoTasaCambio = record.codMoneda !== 'USD' ? tasaCambio[`${record.codMoneda}-${'USD'}`].tasa : 1;

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
                  {currency(record.mtoImporte)
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

  enConfirmarEnviar = async args => {
    const { record, numberMtoTasaCambio } = args;
    const {
      numSiniestro,
      dataSinister: { tipoFlujo, ajustador: { idUsuarioBPM, emailAjustadorBPM } = {} } = {},
      setOtrosConceptos,
      otrosConceptos,
      dispatch,
      userClaims: { idCargoBpm },
      dscEstadoEN
    } = this.props;

    const numberMtoTasaCambioRegistro = currency(record.mtoTasaCambioRegistro, {
      precision: TASA_CAMBIO_PRECISION
    });
    const tasaElegida = numberMtoTasaCambio || numberMtoTasaCambioRegistro;

    const params = {
      numCaso: numSiniestro,
      tipoProceso: tipoFlujo,
      flagAprobarRechazar: 'A',
      montoPagar: currency(record.mtoImporte).multiply(tasaElegida, {
        precision: TASA_CAMBIO_PRECISION
      }),
      id: record.key,
      paymentType: 'O',
      idAjustador: idUsuarioBPM,
      emailAjustadorBPM,
      idCargoSolicitante: idCargoBpm
    };

    try {
      await dispatch(paymentsActionCreators.sendPayment(params));
    } catch (error) {
      showErrorMessage(error);
      return;
    }
    setOtrosConceptos(
      otrosConceptos.map(pago => {
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

  render() {
    const {
      disabledGeneral,
      concepts,
      coinTypes,
      chargeTypes,
      docTypes,
      monedaCertificado,
      igv,
      retencion4ta,
      tieneCoaseguro,
      maintainLoading,
      analizarForm,
      otrosConceptos,
      numSiniestro,
      otrosConceptosForm,
      sendLoading,
      tasaCambio,
      userClaims,
      currentTask,
      tipoConfirmarGestion,
      tamanioPagina,
      flagModificar,
      dataSinister,
      clave
    } = this.props;

    const { modalVisible, selectedPago } = this.state;

    return (
      <React.Fragment>
        <Button
          data-cy="boton_agregar_otros_conceptos"
          disabled={noHabilitaBotonAgregar({
            tipo: 'O',
            disabledGeneral,
            analizarForm,
            currentTask,
            tipoConfirmarGestion,
            dataSinister
          })}
          onClick={this.showModal}
        >
          Agregar otros conceptos <Icon type="plus-circle" style={{ fontSize: '15px' }} />
        </Button>
        {modalVisible && (
          <OtrosConceptosModal
            wrappedComponentRef={this.saveFormRef}
            concepts={concepts}
            coinTypes={coinTypes}
            chargeTypes={chargeTypes}
            docTypes={docTypes}
            monedaCertificado={monedaCertificado}
            tasaCambio={tasaCambio}
            igv={igv}
            retencion4ta={retencion4ta}
            tieneCoaseguro={tieneCoaseguro}
            hideModal={this.hideModal}
            onOk={this.onOkForm}
            modalVisible={modalVisible}
            maintainLoading={maintainLoading}
            selectedPago={selectedPago}
            disabledGeneral={disabledGeneral}
            titleModal={TITLE_MODAL.PAGOOTROS}
            numSiniestro={numSiniestro}
            otrosConceptosForm={otrosConceptosForm}
            analizarForm={analizarForm}
            tipoConfirmarGestion={tipoConfirmarGestion}
          />
        )}
        <Row>
          <OtrosConceptosTable
            disabledGeneral={disabledGeneral}
            otrosConceptos={otrosConceptos}
            handleDelete={this.handleDelete}
            setModalVisibleEdit={this.setModalVisibleEdit}
            enviar={this.handleEnviar}
            maintainLoading={maintainLoading}
            sendLoading={sendLoading}
            currentTask={currentTask}
            tieneCoaseguro={tieneCoaseguro}
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

const mapStateToProps = state => {
  const coinTypes = getCoinTypes(state);
  const docTypes = getDocTypes(state);
  const chargeTypes = getChargeTypes(state);
  const maintainLoading = getPaymentsMaintainLoading(state);
  const monedaCertificado = getMonedaCertificado(state);
  const tieneCoaseguro = getTieneCoaseguro(state);

  const igv = getParamBandeja(state, 'IGV');
  const retencion4ta = getParamBandeja(state, '4TA');
  const dscEstadoPE = getParamBandeja(state, 'PAGOS_DSC_EST_PE');
  const dscEstadoEN = getParamBandeja(state, 'PAGOS_DSC_EST_EN');
  const tamanioPagina = getParamGeneral(state, 'TAMANIO_TABLA_PAGINA');
  const tasaCambio = getTasaCambio(state);

  const sendLoading = getPaymentsSendLoading(state);

  return {
    coinTypes,
    docTypes,
    chargeTypes,
    igv,
    retencion4ta,
    tieneCoaseguro,
    maintainLoading,
    sendLoading,
    monedaCertificado,
    tasaCambio,
    dscEstadoPE,
    dscEstadoEN,
    tamanioPagina,
    userClaims: state.services.user.userClaims
  };
};

export default connect(mapStateToProps)(OtrosConceptos);
