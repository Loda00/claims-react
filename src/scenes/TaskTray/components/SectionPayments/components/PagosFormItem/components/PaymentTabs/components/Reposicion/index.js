import React from 'react';
import { connect } from 'react-redux';
import currency from 'currency.js';
import { TITLE_MODAL, CONSTANTS_APP, PAGOS, TASA_CAMBIO_PRECISION, TAREAS, ESTADO_SINIESTRO } from 'constants/index';
import { Icon, Button, Row } from 'antd';
import ReposicionModal from 'scenes/TaskTray/components/SectionPayments/components/PagosFormItem/components/PaymentTabs/components/Reposicion/ReposicionModal';
import ReposicionTable from 'scenes/TaskTray/components/SectionPayments/components/PagosFormItem/components/PaymentTabs/components/Reposicion/ReposicionTable';
import * as paymentsActionCreators from 'scenes/TaskTray/components/SectionPayments/data/payments/actions';

/* SELECTORS */
import { getCoinTypes } from 'scenes/TaskTray/components/SectionPayments/data/coinTypes/reducer';
import { getChargeTypes } from 'scenes/TaskTray/components/SectionPayments/data/chargeTypes/reducer';
import { getDocTypes } from 'scenes/TaskTray/components/SectionPayments/data/docTypes/reducer';
import {
  getPaymentsMaintainLoading,
  getPaymentsSendLoading
} from 'scenes/TaskTray/components/SectionPayments/data/payments/reducer';

import { getTasaCambio } from 'services/tasaCambio/reducer';
import { getMonedaCertificado } from 'scenes/TaskTray/components/SectionDataCertificate/data/dataCertificate/reducer';
import { getParamBandeja, getParamGeneral } from 'services/types/reducer';
import { getTieneCoaseguro } from 'scenes/TaskTray/components/SectionDataPoliza/data/dataPoliza/reducer';
import {
  noHabilitaBotonAgregar,
  actualizaTotalPagosAdicion,
  actualizaTotalPagosActualiza,
  actualizaTotalPagosElimina
} from 'scenes/TaskTray/components/SectionPayments/util/index';
import { obtieneUsuarioModificacion } from 'scenes/TaskTray/components/SectionPayments/components/PagosFormItem/components/PaymentTabs/components/util';
import {
  mostrarModalSiniestroaPreventivo,
  showErrorMessage,
  modalConfirmacion,
  esUsuarioAjustador,
  showModalError
} from 'util/index';

class Reposicion extends React.Component {
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

    const selectedCobertura = this.props.coberturasForm.find(coverage => coverage.codCobert === values.cobertura) || {};
    const selectedDocType = this.props.docTypes.docTypes.find(type => type.valor === values.codTipoDocumento) || {};
    const selectedTipoCobro = this.props.chargeTypes.chargeTypes.find(type => type.valor === values.codTipoCobro) || {};

    // obtiene email -- si es ajustador se obtiene emailPadre
    const usuarioModificacion = obtieneUsuarioModificacion(this.props.userClaims);

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
      idCobertura: selectedCobertura.secCobertura,
      fecEmision: values.fecEmision.format('YYYY-MM-DD'),
      id: selectedPago ? selectedPago.key : undefined,
      mtoTasaCambio:
        values.codMoneda !== this.props.monedaCertificado
          ? this.props.tasaCambio[`${values.codMoneda}-${this.props.monedaCertificado}`].tasa
          : 1,
      codCobertura: values.cobertura,
      codRamo: selectedCobertura.ramo,
      usuarioModificacion,
      tipoPago: 'R',
      indModificoAjustador: esUsuarioAjustador(this.props.userClaims) ? 'S' : 'N',
      indCreaEnModificar: flagModificar ? 'S' : 'N',
      idTareaBitacora:
        idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO && tipoConfirmarGestion === 'R' ? idTareaBitacora : undefined,
      numSiniestro
    };

    const coberturaSeleccionada = this.props.coberturasForm.find(cob => cob.codCobert === newPago.codCobertura) || {};

    // guarda en servidor
    let resultInsert = {};

    try {
      if (selectedPago) {
        const mtoTotalpagosOriginal = currency(coberturaSeleccionada.totalPagosAprobados, {
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

        resultInsert = await this.props.dispatch(paymentsActionCreators.maintainPayment('R', 'U', newPago));

        // actualiza front
        const newData = this.props.reposiciones.map(pago => {
          if (pago.id === newPago.id) {
            return {
              ...pago,
              ...newPago,
              dscTipoDocumento: selectedDocType.descripcion,
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
        this.props.setReposiciones(newData);
        actualizaTotalPagosActualiza(this.props.analizarForm, newPago, selectedPago);
      } else {
        const nuevoMtoTotalPagos = currency(coberturaSeleccionada.totalPagosAprobados, {
          precision: TASA_CAMBIO_PRECISION
        }).add(
          currency(newPago.mtoImporte, {
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

        newPago.indCreoAjustador = esUsuarioAjustador(this.props.userClaims) ? 'S' : 'N';
        resultInsert = await this.props.dispatch(paymentsActionCreators.maintainPayment('R', 'C', newPago));

        // actualiza front
        this.props.setReposiciones([
          ...this.props.reposiciones,
          {
            ...newPago,
            id: resultInsert.data.idPago,
            fecEmision: values.fecEmision.format(CONSTANTS_APP.FORMAT_DATE_OUTPUT_SYN),
            dscTipoDocumento: selectedDocType.descripcion,
            dscTipoCobro: selectedTipoCobro.descripcion,
            dscCobertura: selectedCobertura.dscCobertura,
            dscEstado: dscEstadoPE,
            codEstado: PAGOS.ESTADO.PENDIENTE,
            mtoTasaCambioRegistro: newPago.mtoTasaCambio,
            flagRevisarPago: idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO ? 'S' : undefined
          }
        ]);
        actualizaTotalPagosAdicion(this.props.analizarForm, newPago);
      }
      this.hideModal();
    } catch (error) {
      showErrorMessage('Ocurrió un error al guardar el pago');
    }
  };

  handleDelete = async record => {
    const {
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
    const esSimpleSinAjustador = tipoFlujo === 'S' && ajustadorRequerido === 'N';

    const esComplejoSinAjustador = tipoFlujo === 'C' && ajustadorRequerido === 'N';

    const liquidaAnalizarSiniestro = esSimpleSinAjustador || esComplejoSinAjustador;
    if (TAREAS.REVISAR_PAGO_EJECUTIVO === idTarea) {
      const liquidacionFlujoSimple =
        ESTADO_SINIESTRO.ANALIZAR_SINIESTRO_COMPLETADO === codEstadoSiniestro && liquidaAnalizarSiniestro;
      const liquidacionFlujoComplejo = ESTADO_SINIESTRO.INFORME_APROBADO === codEstadoSiniestro && esInformeFinal;
      if (liquidacionFlujoSimple || liquidacionFlujoComplejo) {
        if (coberturasValidas.length > 0) {
          const tieneIndenizacion = pagos.indemnizaciones.length > 0;
          const tieneReposicion = pagos.reposiciones.length - 1 > 0;
          if (!tieneIndenizacion && !tieneReposicion) {
            showModalError('Debe tener por lo menos un pago de indemnización o reposición');
            return;
          }
        }
      }
    }

    try {
      await this.props.dispatch(
        paymentsActionCreators.maintainPayment('R', 'D', {
          id: record.key,
          idCobertura: record.idCobertura
        })
      );
    } catch (error) {
      showErrorMessage(error);
    }
    this.props.setReposiciones(this.props.reposiciones.filter(pago => pago.id !== record.key));
    actualizaTotalPagosElimina(this.props.analizarForm, record);
  };

  enConfirmarEnviar = async args => {
    const { record, numberMtoTasaCambio } = args;
    const {
      numSiniestro,
      dataSinister: { tipoFlujo, ajustador: { idUsuarioBPM, emailAjustadorBPM } = {} } = {},
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
      paymentType: 'R',
      idAjustador: idUsuarioBPM,
      idCargoSolicitante: idCargoBpm,
      emailAjustadorBPM
    };

    try {
      await this.props.dispatch(paymentsActionCreators.sendPayment(params));
    } catch (error) {
      showErrorMessage(error);
      return;
    }
    // const estadoEnviado = this.props.estadosPago.find(
    //   estado => estado.codEstado === PAGOS.ESTADO.ENVIADO
    // );
    this.props.setReposiciones(
      this.props.reposiciones.map(pago => {
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

  render() {
    const {
      disabledGeneral,
      analizarForm,
      currentTask,
      dataSinister,
      tipoConfirmarGestion,
      esDevolver,
      flagModificar,
      clave
    } = this.props;

    const { modalVisible, selectedPago } = this.state;

    return (
      <React.Fragment>
        <Button
          data-cy="boton_agregar_reposicion"
          disabled={noHabilitaBotonAgregar({
            tipo: 'R',
            disabledGeneral,
            analizarForm,
            currentTask,
            dataSinister,
            tipoConfirmarGestion,
            esDevolver
          })}
          onClick={this.showModal}
        >
          Agregar reposicion <Icon type="plus-circle" style={{ fontSize: '15px' }} />
        </Button>
        {modalVisible && (
          <ReposicionModal
            wrappedComponentRef={this.saveFormRef}
            coberturasForm={this.props.coberturasForm}
            coinTypes={this.props.coinTypes}
            chargeTypes={this.props.chargeTypes}
            docTypes={this.props.docTypes}
            tasaCambio={this.props.tasaCambio}
            monedaCertificado={this.props.monedaCertificado}
            igv={this.props.igv}
            retencion4ta={this.props.retencion4ta}
            tieneCoaseguro={this.props.tieneCoaseguro}
            numSiniestro={this.props.numSiniestro}
            hideModal={this.hideModal}
            onOk={this.onOkForm}
            modalVisible={modalVisible}
            maintainLoading={this.props.maintainLoading}
            selectedPago={selectedPago}
            disabledGeneral={this.props.disabledGeneral}
            titleModal={TITLE_MODAL.PAGOREPOSICION}
            analizarForm={this.props.analizarForm}
            tipoConfirmarGestion={tipoConfirmarGestion}
          />
        )}
        <Row>
          <ReposicionTable
            disabledGeneral={this.props.disabledGeneral}
            reposiciones={this.props.reposiciones}
            handleDelete={this.handleDelete}
            setModalVisibleEdit={this.setModalVisibleEdit}
            enviar={this.handleEnviar}
            maintainLoading={this.props.maintainLoading}
            sendLoading={this.props.sendLoading}
            currentTask={currentTask}
            tieneCoaseguro={this.props.tieneCoaseguro}
            userClaims={this.props.userClaims}
            tamanioPagina={this.props.tamanioPagina}
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

  const sendLoading = getPaymentsSendLoading(state);
  const monedaCertificado = getMonedaCertificado(state);
  const tasaCambio = getTasaCambio(state);
  const igv = getParamBandeja(state, 'IGV');
  const retencion4ta = getParamBandeja(state, '4TA');
  const dscEstadoPE = getParamBandeja(state, 'PAGOS_DSC_EST_PE');
  const dscEstadoEN = getParamBandeja(state, 'PAGOS_DSC_EST_EN');
  const tamanioPagina = getParamGeneral(state, 'TAMANIO_TABLA_PAGINA');

  const tieneCoaseguro = getTieneCoaseguro(state);

  return {
    coinTypes,
    docTypes,
    chargeTypes,
    maintainLoading,
    monedaCertificado,
    tasaCambio,
    igv,
    retencion4ta,
    sendLoading,
    tieneCoaseguro,
    dscEstadoPE,
    dscEstadoEN,
    tamanioPagina,
    userClaims: state.services.user.userClaims
  };
};

export default connect(mapStateToProps)(Reposicion);
