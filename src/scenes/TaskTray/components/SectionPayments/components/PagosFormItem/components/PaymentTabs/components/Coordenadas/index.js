import React from 'react';
import { connect } from 'react-redux';
import { TITLE_MODAL } from 'constants/index';
import { Icon, Button, Row } from 'antd';
import { get, last } from 'lodash';
import CoordenadasModal from 'scenes/TaskTray/components/SectionPayments/components/PagosFormItem/components/PaymentTabs/components/Coordenadas/CoordenadaModal';
import CoordenadasTable from 'scenes/TaskTray/components/SectionPayments/components/PagosFormItem/components/PaymentTabs/components/Coordenadas/CoordenadaTable';
import * as coordenadasActionCreators from 'scenes/TaskTray/components/SectionPayments/components/PagosFormItem/components/PaymentTabs/components/Coordenadas/data/coordenadas/actions';

/* SELECTORS */
import { getParamBandeja, getParamGeneral } from 'services/types/reducer';
import { getCoinTypes } from 'scenes/TaskTray/components/SectionPayments/data/coinTypes/reducer';
import { getAccountTypes } from 'scenes/TaskTray/components/SectionPayments/data/accountTypes/reducer';
import { getEntidades } from 'scenes/TaskTray/components/SectionPayments/data/entidades/reducer';
import {
  getCoordenadasMaintainLoading,
  getCoordenadaCoreResponse,
  getCoordenadaSendLoading
} from 'scenes/TaskTray/components/SectionPayments/components/PagosFormItem/components/PaymentTabs/components/Coordenadas/data/coordenadas/reducer';
import { noHabilitaBotonAgregar } from 'scenes/TaskTray/components/SectionPayments/util/index';
import { getMonedaCertificado } from 'scenes/TaskTray/components/SectionDataCertificate/data/dataCertificate/reducer';
import {
  mostrarModalSiniestroaPreventivo,
  showErrorMessage,
  esUsuarioAjustador,
  isEmpty,
  showModalError
} from 'util/index';
import { obtieneUsuarioModificacion } from 'scenes/TaskTray/components/SectionPayments/components/PagosFormItem/components/PaymentTabs/components/util';

class Coordenadas extends React.Component {
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

  getDscTipoPago = codTipoPago => {
    const { dscTipoPagoCheque, dscTipoPagoAbono } = this.props;
    if (codTipoPago === 'C') return dscTipoPagoCheque;
    if (codTipoPago === 'A') return dscTipoPagoAbono;
    return '-';
  };

  onOkForm = async () => {
    const {
      dscEstadoPE,
      entidades,
      accountTypes,
      userClaims,
      numSiniestro,
      dispatch,
      coordenadas,
      setCoordenadas,
      flagModificar
    } = this.props;
    let values;

    const { selectedPago } = this.state;

    try {
      values = await this.validateFields();
    } catch (error) {
      return;
    }

    const selectedEntidad = entidades.entidades.find(entidad => entidad.codigo === values.codEntidadFinanciera) || {};
    const selectedAccountType = accountTypes.accountTypes.find(type => type.valor === values.codTipoCuenta) || {};

    // obtiene email -- si es ajustador se obtiene emailPadre
    const usuarioModificacion = obtieneUsuarioModificacion(userClaims);

    // extrae valores
    const newCoordenada = {
      ...values,
      dscEntidadFinanciera: selectedEntidad.descr,
      indAprobado: 'N',
      id: numSiniestro,
      usuarioModificacion,
      indModificoAjustador: esUsuarioAjustador(userClaims) ? 'S' : 'N',
      indCreaEnModificar: flagModificar ? 'S' : 'N'
    };

    // guarda en servidor

    try {
      if (selectedPago) {
        await dispatch(coordenadasActionCreators.maintainCoordenada('U', newCoordenada));

        // actualiza front
        const newData = coordenadas.map(coordenada => {
          if (coordenada.id === newCoordenada.id) {
            return {
              ...newCoordenada,
              dscTipoPago: this.getDscTipoPago(values.codTipoPago),
              dscEntidadFinanciera: selectedEntidad.descr,
              dscTipoCuenta: selectedAccountType.descripcion,
              dscEstado: dscEstadoPE,
              indAprobado: selectedPago.indAprobado === 'S' || selectedPago.indAprobado === 'P' ? 'P' : 'N'
            };
          }
          return coordenada;
        });

        // actualiza front
        setCoordenadas(newData);
      } else {
        newCoordenada.indCreoAjustador = esUsuarioAjustador(userClaims) ? 'S' : 'N';
        await dispatch(coordenadasActionCreators.maintainCoordenada('C', newCoordenada));

        // actualiza front
        setCoordenadas([
          ...coordenadas,
          {
            ...newCoordenada,
            dscTipoPago: this.getDscTipoPago(values.codTipoPago),
            dscEntidadFinanciera: selectedEntidad.descr,
            dscTipoCuenta: selectedAccountType.descripcion,
            dscEstado: dscEstadoPE
          }
        ]);
      }
      this.hideModal();
    } catch (error) {
      showErrorMessage(error);
    }
  };

  handleDelete = async record => {
    const { dispatch, setCoordenadas, coordenadas } = this.props;
    try {
      await dispatch(coordenadasActionCreators.maintainCoordenada('D', { id: record.key }));
    } catch (error) {
      showErrorMessage(error);
      return;
    }
    setCoordenadas(coordenadas.filter(coordenada => coordenada.id !== record.key));
  };

  handleEnviar = async record => {
    const {
      dscEstadoAP,
      dataSinister,
      dataCertificate,
      dataPoliza,
      dispatch,
      setCoordenadas,
      coordenadas,
      indemnizaciones
    } = this.props;

    if (isEmpty(get(dataCertificate, 'certificate[0].email'))) {
      showModalError('El cliente no tiene un email registrado.');
      return;
    }

    try {
      let codMoneda = get(record, 'codMoneda');
      if (!codMoneda) {
        if (isEmpty(indemnizaciones)) {
          codMoneda = get(dataCertificate, 'certificate[0].moneda', '');
        } else {
          codMoneda = last(indemnizaciones).codMonedaPago;
        }
      }
      const paramsCoordenada = {
        ideSin: get(dataSinister, 'idSiniestroAX', ''),
        numId: get(dataCertificate, 'certificate[0].numId', ''),
        codProd: get(dataSinister, 'codProducto', ''),
        codRamo: '',
        codCobert: '',
        indForPago: record.codTipoPago || '',
        codEntFinan: record.codEntidadFinanciera || '',
        tipoCuenta: record.codTipoCuenta || '',
        nroCuenta: record.nroCuenta || '',
        codMoneda,
        emailCliente: get(dataCertificate, 'certificate[0].email', ''),
        emailBroker: get(dataPoliza, 'poliza[0].corredor.email', '')
      };

      await dispatch(coordenadasActionCreators.sendCoordenadaCore(paramsCoordenada));

      const params = {
        id: record.key
      };
      await dispatch(coordenadasActionCreators.maintainCoordenada('S', params));
    } catch (error) {
      showErrorMessage('ocurrio un error al enviar la modalidad de pago');
      return;
    }

    setCoordenadas(
      coordenadas.map(pago => {
        if (pago.id === record.key) {
          return {
            ...pago,
            indAprobado: 'S',
            dscEstado: dscEstadoAP
          };
        }
        return pago;
      })
    );
  };

  render() {
    const {
      dataSinister,
      coordenadas,
      analizarForm,
      currentTask,
      disabledGeneral,
      tipoConfirmarGestion,
      coinTypes,
      accountTypes,
      entidades,
      maintainLoading,
      monedaCertificado,
      coordenadaSendLoading,
      userClaims,
      tamanioPagina,
      flagModificar
    } = this.props;

    const { modalVisible, selectedPago } = this.state;

    return (
      <React.Fragment>
        <Button
          data-cy="boton_agregar_coordenadas"
          disabled={noHabilitaBotonAgregar({
            tipo: 'C',
            coordenadas,
            disabledGeneral,
            analizarForm,
            currentTask,
            tipoConfirmarGestion,
            dataSinister
          })}
          onClick={this.showModal}
        >
          Agregar modalidad pago <Icon type="plus-circle" style={{ fontSize: '15px' }} />
        </Button>
        {modalVisible && (
          <CoordenadasModal
            wrappedComponentRef={this.saveFormRef}
            coinTypes={coinTypes}
            accountTypes={accountTypes}
            entidades={entidades}
            hideModal={this.hideModal}
            onOk={this.onOkForm}
            modalVisible={modalVisible}
            maintainLoading={maintainLoading}
            selectedPago={selectedPago}
            monedaCertificado={monedaCertificado}
            disabledGeneral={disabledGeneral}
            titleModal={TITLE_MODAL.COORDENADASBANCARIOS}
            dataSinister={dataSinister}
          />
        )}
        <Row>
          <CoordenadasTable
            disabledGeneral={disabledGeneral}
            coordenadas={coordenadas}
            handleDelete={this.handleDelete}
            enviar={this.handleEnviar}
            setModalVisibleEdit={this.setModalVisibleEdit}
            maintainLoading={maintainLoading}
            coordenadaLoading={coordenadaSendLoading}
            userClaims={userClaims}
            currentTask={currentTask}
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
  const accountTypes = getAccountTypes(state);
  const entidades = getEntidades(state);
  const maintainLoading = getCoordenadasMaintainLoading(state);
  const coordenadaCoreResponse = getCoordenadaCoreResponse(state);
  const coordenadaSendLoading = getCoordenadaSendLoading(state);
  const monedaCertificado = getMonedaCertificado(state);
  const dscTipoPagoCheque = getParamBandeja(state, 'DSC_COOR_IND_TPAGO_C');
  const dscTipoPagoAbono = getParamBandeja(state, 'DSC_COOR_IND_TPAGO_A');
  const dscEstadoPE = getParamBandeja(state, 'DSC_COOR_IND_APRO_N');
  const dscEstadoAP = getParamBandeja(state, 'DSC_COOR_IND_APRO_S');
  const tamanioPagina = getParamGeneral(state, 'TAMANIO_TABLA_PAGINA');

  return {
    coinTypes,
    accountTypes,
    entidades,
    monedaCertificado,
    maintainLoading,
    coordenadaCoreResponse,
    coordenadaSendLoading,
    userClaims: state.services.user.userClaims,
    dscEstadoPE,
    dscEstadoAP,
    dscTipoPagoCheque,
    dscTipoPagoAbono,
    tamanioPagina
  };
};

export default connect(mapStateToProps)(Coordenadas);
