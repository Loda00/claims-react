import React from 'react';
import { connect } from 'react-redux';
import { TITLE_MODAL, CONSTANTS_APP, TAREAS } from 'constants/index';
import { Icon, Button, Row, Modal } from 'antd';
import { flatten, map, isEmpty } from 'lodash';
import AcreenciaModal from 'scenes/TaskTray/components/SectionPayments/components/PagosFormItem/components/PaymentTabs/components/Acreencias/AcreenciaModal';
import AcreenciaTable from 'scenes/TaskTray/components/SectionPayments/components/PagosFormItem/components/PaymentTabs/components/Acreencias/AcreenciaTable';
import * as paymentsActionCreators from 'scenes/TaskTray/components/SectionPayments/data/payments/actions';

import * as coinTypesActionCreators from 'scenes/TaskTray/components/SectionPayments/data/coinTypes/actions';

/* SELECTORS */
import { getParamBandeja, getParamGeneral } from 'services/types/reducer';
import { getCoinTypes } from 'scenes/TaskTray/components/SectionPayments/data/coinTypes/reducer';
import {
  getMonedaCertificado,
  getAseguradoPoliza
} from 'scenes/TaskTray/components/SectionDataCertificate/data/dataCertificate/reducer';

import {
  getPaymentsMaintainLoading,
  getPaymentsSendLoading
} from 'scenes/TaskTray/components/SectionPayments/data/payments/reducer';

import { noHabilitaBotonAgregar } from 'scenes/TaskTray/components/SectionPayments/util/index';
import { mostrarModalSiniestroaPreventivo, showErrorMessage, esUsuarioAjustador } from 'util/index';
import { obtieneUsuarioModificacion } from 'scenes/TaskTray/components/SectionPayments/components/PagosFormItem/components/PaymentTabs/components/util';
import {
  getNumPlanillaCoaseguro,
  getTipoCargaMasiva
} from 'scenes/TaskTray/components/SectionDataSinister/data/dataSinister/reducer';

class Acreencias extends React.Component {
  state = {
    modalVisible: false,
    selectedPago: null
  };

  async componentDidMount() {
    const { dispatch } = this.props;
    const promises = [];
    promises.push(dispatch(coinTypesActionCreators.fetchCoinTypes('CRG_TMONEDA')));
    try {
      await Promise.all(promises);
    } catch (e) {
      showErrorMessage(e);
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
  }

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

  obtenerCoberturasDeForm = () => {
    const { ramosCoberturasForm } = this.props;
    return flatten(map(ramosCoberturasForm, 'coberturas'));
  };

  onOkForm = async () => {
    const { dispatch, userClaims, acreencias, setAcreencias, dscEstadoPE, flagModificar } = this.props;

    const { selectedPago } = this.state;

    let values;
    try {
      values = await this.validateFields();
    } catch (error) {
      return;
    }

    const coberturasVisibles = this.obtenerCoberturasDeForm();

    const selectedCobertura = coberturasVisibles.find(coverage => coverage.codCobert === values.codCobertura) || {};

    // obtiene email -- si es ajustador se obtiene emailPadre
    const usuarioModificacion = obtieneUsuarioModificacion(userClaims);

    // extrae valores
    const newPago = {
      ...values,
      mtoSinIgv: values.mtoSinIgv.number,
      idResponsable: values.responsable.terceroElegido.codExterno,
      nomResponsable: values.responsable.terceroElegido.nomCompleto,
      idCobertura: selectedCobertura.secCobertura,
      fecPago: values.fecPago.format('YYYY-MM-DD'),
      id: selectedPago ? selectedPago.key : undefined,
      codCobertura: values.codCobertura,
      codRamo: selectedCobertura.codRamo,
      usuarioModificacion,
      tipoPago: 'A',
      indModificoAjustador: esUsuarioAjustador(userClaims) ? 'S' : 'N',
      indCreaEnModificar: flagModificar ? 'S' : 'N'
    };

    // guarda en servidor
    let resultInsert = {};

    try {
      if (selectedPago) {
        resultInsert = await dispatch(paymentsActionCreators.maintainPayment('A', 'U', newPago));

        // actualiza front
        const newData = acreencias.map(pago => {
          if (pago.id === newPago.id) {
            return {
              ...newPago,
              dscCobertura: selectedCobertura.descCobertura,
              dscEstado: dscEstadoPE,
              indAprobado: 'N'
            };
          }
          return pago;
        });

        // actualiza front
        setAcreencias(newData);
      } else {
        newPago.indCreoAjustador = esUsuarioAjustador(userClaims) ? 'S' : 'N';
        resultInsert = await dispatch(paymentsActionCreators.maintainPayment('A', 'C', newPago));

        // actualiza front
        setAcreencias([
          ...acreencias,
          {
            ...newPago,
            id: resultInsert.data.idPago,
            fecPago: values.fecPago.format(CONSTANTS_APP.FORMAT_DATE_OUTPUT_SYN),
            dscCobertura: selectedCobertura.descCobertura,
            dscEstado: dscEstadoPE,
            indAprobado: 'N'
          }
        ]);
      }
      this.hideModal();
    } catch (error) {
      showErrorMessage('Ocurrió un error al guardar el pago');
    }
  };

  handleDelete = async record => {
    const { dispatch, setAcreencias, acreencias } = this.props;
    try {
      await dispatch(
        paymentsActionCreators.maintainPayment('A', 'D', {
          id: record.key,
          idCobertura: record.idCobertura
        })
      );
    } catch (error) {
      showErrorMessage(error);
      return;
    }
    setAcreencias(acreencias.filter(pago => pago.id !== record.key));
  };

  handleEnviar = async record => {
    const {
      dispatch,
      dataSinister: { codProducto, idSiniestroAX } = {},
      userClaims: { idCore, idCoreGenerico },
      setAcreencias,
      acreencias,
      numSiniestro,
      dscEstadoAP,
      numPlanillaCoaseguro,
      indCargaMasiva
    } = this.props;
    const coberturasVisibles = this.obtenerCoberturasDeForm();
    const selectedCobertura = coberturasVisibles.find(coverage => coverage.codCobert === record.codCobertura) || {};

    // validar motivo de
    if (!record.dscMotivos) {
      Modal.error({
        content: 'Debe de ingresar un motivo para envíar la acreencia.'
      });
      return;
    }

    const params = {
      numSiniestro,
      paymentType: 'A',
      id: record.key,
      usuario: record.idResponsable,
      codRamo: selectedCobertura.codRamo,
      codProd: codProducto,
      ideSin: idSiniestroAX,
      mtoDed: record.mtoSinIgv,
      ideCobert: selectedCobertura.idCobertura,
      numIdUsr: !idCore ? Number(idCoreGenerico) : Number(idCore),
      indCreoAjustador: record.indCreoAjustador,
      indModificoAjustador: 'N',
      numPlanilla: numPlanillaCoaseguro,
      esCMCoaseguro: indCargaMasiva === 'COA'
    };

    try {
      await dispatch(paymentsActionCreators.sendPayment(params));
    } catch (error) {
      showErrorMessage(error);
      return;
    }

    setAcreencias(
      acreencias.map(pago => {
        if (pago.id === record.key) {
          return {
            ...pago,
            dscEstado: dscEstadoAP,
            indAprobado: 'S'
          };
        }
        return pago;
      })
    );
  };

  render() {
    const {
      dataSinister,
      analizarForm,
      currentTask,
      disabledGeneral,
      ramosCoberturasForm,
      coinTypes,
      monedaCertificado,
      aseguradoPoliza,
      maintainLoading,
      acreencias,
      sendLoading,
      userClaims,
      tipoConfirmarGestion,
      tamanioPagina,
      flagModificar
    } = this.props;

    const { modalVisible, selectedPago } = this.state;
    const esAnalizarSiniestro = currentTask.idTarea === TAREAS.ANALIZAR_SINIESTRO;
    const esConsultaSiniestro = currentTask.idTarea === undefined;

    return (
      <React.Fragment>
        <Button
          data-cy="boton_agregar_acreencias"
          disabled={noHabilitaBotonAgregar({
            tipo: 'A',
            disabledGeneral,
            analizarForm,
            currentTask,
            tipoConfirmarGestion,
            dataSinister
          })}
          onClick={this.showModal}
        >
          Agregar acreencia <Icon type="plus-circle" style={{ fontSize: '15px' }} />
        </Button>
        {modalVisible && (
          <AcreenciaModal
            wrappedComponentRef={this.saveFormRef}
            ramosCoberturasForm={ramosCoberturasForm}
            coinTypes={coinTypes}
            monedaCertificado={monedaCertificado}
            aseguradoPoliza={aseguradoPoliza}
            hideModal={this.hideModal}
            onOk={this.onOkForm}
            modalVisible={modalVisible}
            maintainLoading={maintainLoading}
            selectedPago={selectedPago}
            disabledGeneral={disabledGeneral}
            titleModal={TITLE_MODAL.ACREENCIA}
            analizarForm={analizarForm}
            dataSinister={dataSinister}
          />
        )}
        {dataSinister &&
          dataSinister.indCargaMasiva === 'COA' &&
          dataSinister.numPlanillaCoaseguro &&
          (!isEmpty(acreencias) && (esAnalizarSiniestro || esConsultaSiniestro)) && (
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
          <AcreenciaTable
            disabledGeneral={disabledGeneral}
            acreencias={acreencias}
            handleDelete={this.handleDelete}
            enviar={this.handleEnviar}
            setModalVisibleEdit={this.setModalVisibleEdit}
            maintainLoading={maintainLoading}
            sendLoading={sendLoading}
            userClaims={userClaims}
            tamanioPagina={tamanioPagina}
            flagModificar={flagModificar}
          />
        </Row>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  const coinTypes = getCoinTypes(state);
  const maintainLoading = getPaymentsMaintainLoading(state);
  const monedaCertificado = getMonedaCertificado(state);
  const aseguradoPoliza = getAseguradoPoliza(state);
  const sendLoading = getPaymentsSendLoading(state);
  const dscEstadoPE = getParamBandeja(state, 'DSC_ACR_IND_APRO_N');
  const dscEstadoAP = getParamBandeja(state, 'DSC_ACR_IND_APRO_S');
  const tamanioPagina = getParamGeneral(state, 'TAMANIO_TABLA_PAGINA');
  const numPlanillaCoaseguro = getNumPlanillaCoaseguro(state);
  const indCargaMasiva = getTipoCargaMasiva(state);

  return {
    coinTypes,
    maintainLoading,
    monedaCertificado,
    aseguradoPoliza,
    sendLoading,
    userClaims: state.services.user.userClaims,
    dscEstadoPE,
    dscEstadoAP,
    tamanioPagina,
    numPlanillaCoaseguro,
    indCargaMasiva
  };
};

export default connect(mapStateToProps)(Acreencias);
