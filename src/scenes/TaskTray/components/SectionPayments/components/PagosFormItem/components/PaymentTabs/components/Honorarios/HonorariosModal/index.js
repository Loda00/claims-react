import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { Form, Row, Col, Modal, Select, Input, Icon, DatePicker, Checkbox, Tooltip } from 'antd';
import { ValidationMessage } from 'util/validation';
import { hasErrors, showErrorMessage, esUsuarioAjustador } from 'util/index';

import * as docTypesActionCreators from 'scenes/TaskTray/components/SectionPayments/data/docTypes/actions';
import * as coinTypesActionCreators from 'scenes/TaskTray/components/SectionPayments/data/coinTypes/actions';
import * as adjustersActionCreators from 'scenes/TaskTray/components/SectionPayments/data/adjusters/actions';
import * as chargeTypesActionCreators from 'scenes/TaskTray/components/SectionPayments/data/chargeTypes/actions';
import { CONSTANTS_APP, TASA_CAMBIO_PRECISION } from 'constants/index';

import PriceInputNoSymbol from 'components/PriceInputNoSymbol';
import currency from 'currency.js';
import { isEmpty, filter, find } from 'lodash';

const COD_DOCTYPE_RECIBOHONORARIOS = '02';
class PagosHonorariosModal extends React.Component {
  constructor(props) {
    super(props);
    const { selectedPago, monedaCertificado } = this.props;
    let initialValueRamo;

    const ramosVisibles = this.obtenerRamosVisibles();

    if (selectedPago) {
      initialValueRamo = selectedPago.idRamo;
    } else if (ramosVisibles.length === 1) {
      initialValueRamo = ramosVisibles[0].idRamo;
    } else {
      initialValueRamo = undefined;
    }

    this.state = {
      selectedTipoCobro: selectedPago ? selectedPago.codTipoCobro || undefined : undefined,
      selectedDocType: selectedPago ? selectedPago.codTipoDocumento || undefined : undefined,
      selectedIdRamo: initialValueRamo,
      selectedMoneda: selectedPago ? selectedPago.codMoneda || undefined : monedaCertificado,
      checkIgv: selectedPago ? !Number(selectedPago.mtoIgv) || false : false,
      checkRetencion4ta: selectedPago ? !Number(selectedPago.mtoRetencionCuarta) || false : false
    };
  }

  async componentDidMount() {
    const {
      dispatch,
      form: { resetFields, validateFields },
      selectedPago,
      dataSinister: { indCargaMasiva, ajustador: ajustadorSiniestro = {} } = {}
    } = this.props;
    const promises = [];

    promises.push(dispatch(docTypesActionCreators.fetchDocTypes('CRG_TDOC_PAGO')));
    promises.push(dispatch(coinTypesActionCreators.fetchCoinTypes('CRG_TMONEDA')));
    promises.push(dispatch(chargeTypesActionCreators.fetchChargeTypes('CRG_TCOBRO')));

    try {
      await Promise.all(promises);
      const ramosVisibles = this.obtenerRamosVisibles();

      if (selectedPago !== null || ramosVisibles.length === 1 || indCargaMasiva === 'CAT') {
        if (indCargaMasiva !== 'CAT') {
          const params = {
            codRamo: selectedPago ? selectedPago.codRamo : ramosVisibles[0].codRamo
          };
          await dispatch(adjustersActionCreators.fetchAdjusters(params));
          dispatch(
            adjustersActionCreators.setCodRamo(
              selectedPago ? selectedPago.codRamo : ramosVisibles[0].codRamo,
              ajustadorSiniestro.idAjustador
            )
          );
        } else {
          const params = {
            codRamo: 'ALL',
            indCargaMasiva
          };
          await dispatch(adjustersActionCreators.fetchAdjusters(params));
          dispatch(adjustersActionCreators.setCodRamo('ALL', ajustadorSiniestro.idAjustador));
        }
      }
      resetFields();
      validateFields();
    } catch (e) {
      showErrorMessage(e);
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch(adjustersActionCreators.fetchAdjustersReset());
  }

  onChangeTipoCobro = value => {
    const {
      form: { validateFields }
    } = this.props;
    this.setState({ selectedTipoCobro: value }, () => {
      this.forceUpdate();
      validateFields();
    });
  };

  obtenerRamosVisibles = () => {
    const { otrosConceptosForm } = this.props;
    const ramosConConcepto = filter(otrosConceptosForm, ['codConcepto', '001']);
    return ramosConConcepto;
  };

  onChangeRamo = async value => {
    const {
      dispatch,
      dataSinister: { indCargaMasiva, ajustador: ajustadorSiniestro = {} } = {},
      form: { resetFields },
      otrosConceptosForm
    } = this.props;

    this.setState({ selectedIdRamo: value });

    if (indCargaMasiva === 'CAT') {
      return;
    }

    const selectedRamo = otrosConceptosForm.find(b => b.idRamo === value) || {};
    const params = {
      codRamo: selectedRamo.codRamo
    };
    await dispatch(adjustersActionCreators.fetchAdjusters(params));
    dispatch(adjustersActionCreators.setCodRamo(selectedRamo.codRamo, ajustadorSiniestro.idAjustador));
    resetFields('idAjustador');
  };

  handleDocumentTypeChange = value => {
    const {
      form: { validateFields, getFieldValue }
    } = this.props;

    this.setState(
      {
        selectedDocType: value
      },
      () => {
        validateFields(['numComprobante'], { force: true });
        this.onChangeImporte(getFieldValue('mtoImporte'));
      }
    );
  };

  handleChangeCheckIgv = e => {
    const {
      form: { getFieldValue }
    } = this.props;
    const value = e.target.checked;
    this.setState(
      {
        checkIgv: value
      },
      () => {
        this.onChangeImporte(getFieldValue('mtoImporte'));
      }
    );
  };

  handleChangeCheckRetencion4ta = e => {
    const {
      form: { getFieldValue }
    } = this.props;
    const value = e.target.checked;
    this.setState(
      {
        checkRetencion4ta: value
      },
      () => {
        this.onChangeImporte(getFieldValue('mtoImporte'));
      }
    );
  };

  checkPricePositivo = (rule, value, callback) => {
    if (isEmpty(value.number)) {
      callback(ValidationMessage.REQUIRED);
    }

    if (Number.isNaN(Number(value.number))) {
      callback(ValidationMessage.NOT_VALID);
      return;
    }

    if (currency(value.number).value <= 0) {
      callback('El monto debe ser mayor que cero');
      return;
    }
    callback();
  };

  checkPriceMayorIgualCero = (rule, value, callback) => {
    if (isEmpty(value.number)) {
      callback(ValidationMessage.REQUIRED);
    }

    if (Number.isNaN(Number(value.number))) {
      callback(ValidationMessage.NOT_VALID);
      return;
    }

    if (isEmpty(value.number).value < 0) {
      callback('El monto debe ser mayor o igual a cero');
      return;
    }
    callback();
  };

  checkPriceImporte = (rule, value, callback) => {
    if (isEmpty(value.number)) {
      callback(ValidationMessage.REQUIRED);
    }

    if (Number.isNaN(Number(value.number))) {
      callback(ValidationMessage.NOT_VALID);
      return;
    }

    if (currency(value.number).value <= 0) {
      callback('El monto debe ser mayor que cero');
      return;
    }

    if (currency(value.number).value > 0) {
      const { tasaCambio, otrosConceptosForm, selectedPago, monedaCertificado } = this.props;
      const { selectedIdRamo, selectedMoneda } = this.state;

      const selectedRamo = otrosConceptosForm.find(b => b.idRamo === selectedIdRamo) || {};

      const { mtoReserva, mtoTotalPagos } =
        otrosConceptosForm.find(oc => oc.codConcepto === '001' && oc.codRamo === selectedRamo.codRamo) || {};

      const { mtoImporte, codMoneda: monedaPagoSeleccionado } = selectedPago || {};

      const mtoTasaCambioReserva =
        selectedMoneda && selectedMoneda !== monedaCertificado
          ? tasaCambio[`${monedaCertificado}-${selectedMoneda}`].tasa
          : 1;

      const mtoTasaCambioMontoSeleccionado =
        selectedMoneda && monedaPagoSeleccionado && selectedMoneda !== monedaPagoSeleccionado
          ? tasaCambio[`${monedaPagoSeleccionado}-${selectedMoneda}`].tasa
          : 1;

      const mtoImporteConvertido = currency(mtoImporte, {
        precision: TASA_CAMBIO_PRECISION
      }).multiply(mtoTasaCambioMontoSeleccionado, {
        precision: TASA_CAMBIO_PRECISION
      }).value;
      const saldo = currency(mtoReserva, { precision: TASA_CAMBIO_PRECISION })
        .subtract(mtoTotalPagos, { precision: TASA_CAMBIO_PRECISION })
        .multiply(mtoTasaCambioReserva, { precision: TASA_CAMBIO_PRECISION })
        .add(mtoImporteConvertido).value;

      if (currency(value.number).value > currency(saldo).value) {
        callback('No debe ser mayor al saldo pendiente');
        return;
      }
    }

    callback();
  };

  checkNumeroDocumento = (rule, value, callback) => {
    if (isEmpty(value)) {
      callback(ValidationMessage.REQUIRED);
      return;
    }

    if (!/^[0-9]+$/.test(value)) {
      callback(ValidationMessage.NOT_VALID);
      return;
    }

    if (/^0*$/.test(value)) {
      callback(ValidationMessage.NOT_VALID);
      return;
    }

    const { selectedDocType } = this.state;

    const tipoDocumento = selectedDocType;
    if (tipoDocumento === '01') {
      if (/^[0-9]{1,8}$/.test(value)) {
        callback();
      } else {
        callback(ValidationMessage.NOT_VALID);
      }
    } else if (tipoDocumento === '02') {
      if (/^[0-9]{1,7}$/.test(value)) {
        callback();
      } else {
        callback(ValidationMessage.NOT_VALID);
      }
    }
  };

  onChangeGastos = value => {
    const {
      form: { getFieldValue, setFieldsValue }
    } = this.props;
    const mtoGastos = value.number;
    const mtoHonorarios = (getFieldValue('mtoHonorarios') || {}).number;

    const numberImporte = currency(mtoGastos).add(mtoHonorarios).value;

    setFieldsValue({
      mtoImporte: { number: String(numberImporte) }
    });

    this.onChangeImporte(null, numberImporte);
  };

  onChangeHonorarios = value => {
    const {
      form: { getFieldValue, setFieldsValue }
    } = this.props;
    const mtoGastos = (getFieldValue('mtoGastos') || {}).number;
    const mtoHonorarios = value.number;

    const numberImporte = currency(mtoGastos).add(mtoHonorarios).value;

    setFieldsValue({
      mtoImporte: { number: String(numberImporte) }
    });

    this.onChangeImporte(null, numberImporte);
  };

  onChangeImporte = (fieldValue, value) => {
    const { checkIgv, selectedDocType, checkRetencion4ta } = this.state;
    const {
      igv,
      retencion4ta,
      form: { setFieldsValue, validateFields },
      dataSinister = {}
    } = this.props;

    const valueImporte = typeof value !== 'undefined' ? value : fieldValue.number;

    if (typeof valueImporte === 'undefined') return;

    const esCMCoaseguro = dataSinister.indCargaMasiva === 'COA';
    const numberIgv = !esCMCoaseguro ? currency(valueImporte).multiply(igv).value : 0;

    if (!checkIgv && (typeof selectedDocType === 'undefined' || selectedDocType === '01')) {
      setFieldsValue({
        mtoIgv: { number: String(numberIgv) },
        mtoTotal: {
          number: String(currency(valueImporte).add(numberIgv).value)
        }
      });
    }

    const numberRetencionCuarta = currency(valueImporte).multiply(retencion4ta).value;

    if (!checkRetencion4ta && selectedDocType === '02') {
      setFieldsValue({
        mtoRetencionCuarta: { number: String(numberRetencionCuarta) },
        mtoTotal: {
          number: String(currency(valueImporte).subtract(numberRetencionCuarta).value)
        }
      });
    }

    if (checkIgv && selectedDocType !== '02') {
      setFieldsValue({
        mtoTotal: { number: String(currency(valueImporte).value) }
      });
    }

    if (checkRetencion4ta && selectedDocType !== '01' && typeof selectedDocType !== 'undefined') {
      setFieldsValue({
        mtoTotal: { number: String(currency(valueImporte).value) }
      });
    }

    validateFields(['mtoImporte', 'mtoTotal', 'mtoIgv', 'mtoRetencionCuarta'], {
      force: true
    });
  };

  onChangeIgv = value => {
    const {
      form: { getFieldValue, setFieldsValue, validateFields }
    } = this.props;
    const mtoImporte = (getFieldValue('mtoImporte') || {}).number;
    setFieldsValue({
      mtoTotal: { number: String(currency(mtoImporte).add(value.number).value) }
    });

    validateFields(['mtoImporte', 'mtoTotal'], { force: true });
  };

  onChangeRetencionCuarta = value => {
    const {
      form: { getFieldValue, setFieldsValue, validateFields }
    } = this.props;
    const mtoImporte = (getFieldValue('mtoImporte') || {}).number;
    setFieldsValue({
      mtoTotal: {
        number: String(currency(mtoImporte).subtract(value.number).value)
      }
    });

    validateFields(['mtoImporte', 'mtoTotal'], { force: true });
  };

  muestraTooltip = mtoHonorarioCalculado => {
    const {
      form: { getFieldValue },
      userClaims
    } = this.props;
    const { selectedIdRamo } = this.state;
    const honorarioCalculadoPositivo = mtoHonorarioCalculado && currency(mtoHonorarioCalculado).value > 0;
    const honorarioCalculadoDiferenteAHonorario =
      currency(mtoHonorarioCalculado).value !== currency((getFieldValue('mtoHonorarios') || {}).number).value;
    return (
      userClaims.roles.find(r => r.codTipo === 'ES') &&
      selectedIdRamo &&
      honorarioCalculadoPositivo &&
      honorarioCalculadoDiferenteAHonorario
    );
  };

  onChangeMoneda = value => {
    const {
      tasaCambio,
      form: { setFieldsValue, validateFields }
    } = this.props;
    const { selectedMoneda } = this.state;
    if (selectedMoneda !== value && !tasaCambio[`${selectedMoneda}-${value}`]) {
      showErrorMessage('No se encuentra una tasa de cambio, por lo tanto no puede cambiar de moneda');
      setTimeout(() => {
        setFieldsValue({ codMoneda: selectedMoneda });
      }, 0);
      return;
    }
    this.setState({ selectedMoneda: value }, () => validateFields(['mtoImporte', 'mtoTotal'], { force: true }));
  };

  obtenerMontoConvertido = (montoBpm, monedaOrigen, monedaDestino) => {
    const { tasaCambio } = this.props;
    const key = `${monedaOrigen}-${monedaDestino}`;
    const tasa = tasaCambio[key] ? tasaCambio[key].tasa : 1;

    return currency(montoBpm, {
      precision: TASA_CAMBIO_PRECISION
    }).multiply(tasa, {
      precision: TASA_CAMBIO_PRECISION
    }).value;
  };

  checkRamo = (rule, value, callback) => {
    const { otrosConceptosForm } = this.props;
    if (!find(otrosConceptosForm, ['codConcepto', '001'])) {
      callback('No existe reserva para el concepto ajustador');
    }

    if (value > 0) {
      callback();
    }

    callback(ValidationMessage.REQUIRED);
  };

  render() {
    const {
      form: { getFieldDecorator, getFieldsError, isFieldTouched, getFieldError, getFieldValue },
      selectedPago,
      monedaCertificado,
      modalVisible,
      maintainLoading,
      onOk,
      hideModal,
      titleModal,
      adjusters,
      docTypes,
      coinTypes,
      tieneCoaseguro,
      chargeTypes,
      adjusterSinister = {},
      otrosConceptosForm,
      tipoConfirmarGestion,
      tasaCambio,
      userClaims,
      dataSinister: { indCargaMasiva },
      dataSinister
    } = this.props;
    const {
      selectedMoneda,
      selectedIdRamo,
      selectedTipoCobro,
      selectedDocType,
      checkIgv,
      checkRetencion4ta
    } = this.state;

    let idAjustadorError;
    if (selectedPago) {
      idAjustadorError = getFieldError('idAjustador');
    } else {
      idAjustadorError = isFieldTouched('idAjustador') && getFieldError('idAjustador');
    }

    let idRamoError;
    if (selectedPago || isEmpty(otrosConceptosForm.filter(oc => oc.codConcepto === '001'))) {
      idRamoError = getFieldError('idRamo');
    } else {
      idRamoError = isFieldTouched('idRamo') && getFieldError('idRamo');
    }

    const nroPlanillaError = selectedPago
      ? getFieldError('nroPlanilla')
      : isFieldTouched('nroPlanilla') && getFieldError('nroPlanilla');
    const codTipoDocumentoError = selectedPago
      ? getFieldError('codTipoDocumento')
      : isFieldTouched('codTipoDocumento') && getFieldError('codTipoDocumento');
    const codSerieError = selectedPago
      ? getFieldError('codSerie')
      : isFieldTouched('codSerie') && getFieldError('codSerie');
    const numComprobanteError = selectedPago
      ? getFieldError('numComprobante')
      : isFieldTouched('numComprobante') && getFieldError('numComprobante');
    const codMonedaError = selectedPago
      ? getFieldError('codMoneda')
      : isFieldTouched('codMoneda') && getFieldError('codMoneda');
    const fecEmisionError = selectedPago
      ? getFieldError('fecEmision')
      : isFieldTouched('fecEmision') && getFieldError('fecEmision');
    const mtoGastosError = selectedPago
      ? getFieldError('mtoGastos')
      : isFieldTouched('mtoGastos') && getFieldError('mtoGastos');
    const mtoHonorariosError = selectedPago
      ? getFieldError('mtoHonorarios')
      : isFieldTouched('mtoHonorarios') && getFieldError('mtoHonorarios');
    const mtoTotalError = selectedPago
      ? getFieldError('mtoTotal')
      : isFieldTouched('mtoTotal') && getFieldError('mtoTotal');
    const codTipoCobroError = selectedPago
      ? getFieldError('codTipoCobro')
      : isFieldTouched('codTipoCobro') && getFieldError('codTipoCobro');
    const mtoIgvError = selectedPago
      ? getFieldError('mtoIgv')
      : (isFieldTouched('mtoIgv') ||
          isFieldTouched('mtoImporte') ||
          isFieldTouched('mtoHonorarios') ||
          isFieldTouched('mtoGastos')) &&
        getFieldError('mtoIgv');
    const mtoRetencionCuartaError = selectedPago
      ? getFieldError('mtoRetencionCuarta')
      : (isFieldTouched('mtoRetencionCuarta') ||
          isFieldTouched('mtoImporte') ||
          isFieldTouched('mtoHonorarios') ||
          isFieldTouched('mtoGastos')) &&
        getFieldError('mtoRetencionCuarta');
    const mtoCoaseguroError = selectedPago
      ? getFieldError('mtoCoaseguro')
      : isFieldTouched('mtoCoaseguro') && getFieldError('mtoCoaseguro');

    let mtoImporteError;
    if (selectedPago || ((getFieldValue('mtoImporte') || {}).number > 0 && getFieldValue('idRamo'))) {
      mtoImporteError = getFieldError('mtoImporte');
    } else {
      mtoImporteError = isFieldTouched('mtoImporte') && getFieldError('mtoImporte');
    }

    const selectedRamo = otrosConceptosForm.find(b => b.idRamo === selectedIdRamo) || {};
    const montoBpm = (
      otrosConceptosForm.find(oc => oc.codConcepto === '001' && oc.codRamo === selectedRamo.codRamo) || {}
    ).mtoHonorarioCalculado;

    let mtoHonorarioCalculado;

    if (selectedMoneda === monedaCertificado) {
      mtoHonorarioCalculado = montoBpm;
    } else {
      mtoHonorarioCalculado = this.obtenerMontoConvertido(montoBpm, monedaCertificado, selectedMoneda);
    }

    let initialValueAjustador;
    let initialValueRamo;

    if (selectedPago) {
      initialValueAjustador = selectedPago.idAjustador;
    } else {
      initialValueAjustador = adjusterSinister.idAjustador || undefined;
    }

    const ramosVisibles = this.obtenerRamosVisibles();

    if (selectedPago) {
      initialValueRamo = selectedPago.idRamo;
    } else if (ramosVisibles.length === 1) {
      initialValueRamo = ramosVisibles[0].idRamo;
    }

    const { mtoReserva, mtoTotalPagos } =
      otrosConceptosForm.find(oc => oc.codConcepto === '001' && oc.codRamo === selectedRamo.codRamo) || {};

    const { mtoImporte, codMoneda: monedaPagoSeleccionado } = selectedPago || {};

    const mtoTasaCambioReserva =
      selectedMoneda && selectedMoneda !== monedaCertificado && tasaCambio[`${monedaCertificado}-${selectedMoneda}`]
        ? tasaCambio[`${monedaCertificado}-${selectedMoneda}`].tasa
        : 1;

    const mtoTasaCambioMontoSeleccionado =
      selectedMoneda &&
      monedaPagoSeleccionado &&
      selectedMoneda !== monedaPagoSeleccionado &&
      tasaCambio[`${monedaPagoSeleccionado}-${selectedMoneda}`]
        ? tasaCambio[`${monedaPagoSeleccionado}-${selectedMoneda}`].tasa
        : 1;

    const mtoImporteConvertido = currency(mtoImporte, {
      precision: TASA_CAMBIO_PRECISION
    }).multiply(mtoTasaCambioMontoSeleccionado, {
      precision: TASA_CAMBIO_PRECISION
    }).value;
    const saldo = currency(mtoReserva, { precision: TASA_CAMBIO_PRECISION })
      .subtract(mtoTotalPagos, { precision: TASA_CAMBIO_PRECISION })
      .multiply(mtoTasaCambioReserva, { precision: TASA_CAMBIO_PRECISION })
      .add(mtoImporteConvertido).value;

    const esCoaseguro = !isEmpty(dataSinister) && dataSinister.indCargaMasiva === 'COA';

    const objCoasegurador = [
      {
        idAjustador: dataSinister.codCoaseguroLider,
        nomAjustador: dataSinister.coaseguroLider
      }
    ];

    return (
      <div>
        <Row>
          <Modal
            centered
            visible={modalVisible}
            okText="Grabar"
            okButtonProps={{
              'data-cy': 'boton_grabar_honorarios',
              disabled: hasErrors(getFieldsError()),
              loading: maintainLoading
            }}
            cancelText="Cancelar"
            onOk={onOk}
            onCancel={hideModal}
            destroyOnClose
            width="600px"
          >
            <Form>
              <h2>{titleModal}</h2>
              <Row gutter={24}>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                  <Form.Item
                    label="Ramo"
                    validateStatus={idRamoError ? 'error' : ''}
                    help={idRamoError || ''}
                    extra={
                      getFieldValue('idRamo') ? (
                        <div>
                          Saldo pendiente: {getFieldValue('codMoneda')}{' '}
                          <span data-cy="saldo_pendiente">{currency(saldo).format()}</span>
                        </div>
                      ) : (
                        ''
                      )
                    }
                    className={getFieldValue('idRamo') ? 'ant-item-with-extra' : ''}
                  >
                    {getFieldDecorator('idRamo', {
                      initialValue: initialValueRamo,
                      rules: [{ validator: this.checkRamo }]
                    })(
                      <Select
                        onChange={this.onChangeRamo}
                        disabled={
                          tipoConfirmarGestion === 'A' ||
                          (!isEmpty(dataSinister) && dataSinister.indCargaMasiva === 'COA')
                        }
                        placeholder="Seleccione ramo"
                      >
                        {ramosVisibles.map(branch => {
                          return (
                            <Select.Option key={branch.idRamo} value={branch.idRamo}>
                              {branch.codRamo}
                            </Select.Option>
                          );
                        })}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
              </Row>
              {!isEmpty(dataSinister) && dataSinister.indCargaMasiva === 'COA' && (
                <Row>
                  <Col xs={23} sm={12} md={12} lg={12} xl={12}>
                    <Form.Item label="Nro. Planilla" required>
                      <Input value={dataSinister.numPlanillaCoaseguro} disabled />
                    </Form.Item>
                  </Col>
                </Row>
              )}
              <Row gutter={24}>
                <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                  <Form.Item
                    label="Ajustador"
                    validateStatus={idAjustadorError ? 'error' : ''}
                    help={idAjustadorError || ''}
                  >
                    {getFieldDecorator('idAjustador', {
                      initialValue: esCoaseguro ? dataSinister.codCoaseguroLider : initialValueAjustador,
                      rules: [
                        {
                          required: true,
                          message: ValidationMessage.REQUIRED
                        }
                      ]
                    })(
                      <Select
                        disabled={esUsuarioAjustador(userClaims)}
                        showSearch
                        loading={adjusters.isLoading}
                        placeholder="Seleccione ajustador"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option.props.children
                            .toString()
                            .toLowerCase()
                            .indexOf(input.toString().toLowerCase()) >= 0
                        }
                      >
                        {!isEmpty(dataSinister) && dataSinister.indCargaMasiva === 'COA'
                          ? objCoasegurador.map(obj => (
                              <Select.Option key={obj.idAjustador} value={obj.idAjustador}>
                                {obj.nomAjustador}
                              </Select.Option>
                            ))
                          : (adjusters.adjusters[indCargaMasiva !== 'CAT' ? selectedRamo.codRamo : 'ALL'] || []).map(
                              adjuster => {
                                return (
                                  <Select.Option key={adjuster.idAjustador} value={adjuster.idAjustador}>
                                    {adjuster.nomAjustador}
                                  </Select.Option>
                                );
                              }
                            )}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
                {!esCoaseguro && (
                  <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                    <Form.Item
                      label="Tipo documento"
                      validateStatus={codTipoDocumentoError ? 'error' : ''}
                      help={codTipoDocumentoError || ''}
                    >
                      {getFieldDecorator('codTipoDocumento', {
                        initialValue: selectedPago ? selectedPago.codTipoDocumento : undefined,
                        rules: [
                          {
                            required: true,
                            message: ValidationMessage.REQUIRED
                          }
                        ]
                      })(
                        <Select
                          onChange={this.handleDocumentTypeChange}
                          loading={docTypes.isLoading}
                          placeholder="Seleccione tipo documento"
                        >
                          {docTypes.docTypes.map(docType => {
                            return (
                              <Select.Option key={docType.valor} value={docType.valor}>
                                {docType.descripcion}
                              </Select.Option>
                            );
                          })}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                )}
                {!esCoaseguro && (
                  <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                    <Form.Item label="Serie" validateStatus={codSerieError ? 'error' : ''} help={codSerieError || ''}>
                      {getFieldDecorator('codSerie', {
                        initialValue: selectedPago ? selectedPago.codSerie : undefined,
                        rules: [
                          {
                            required: true,
                            message: ValidationMessage.REQUIRED
                          },
                          {
                            type: 'string',
                            message: ValidationMessage.NOT_VALID,
                            pattern: /^[a-z0-9]{0,4}$/i
                          }
                        ]
                      })(<Input placeholder="Ingrese serie" maxLength={4} />)}
                    </Form.Item>
                  </Col>
                )}
                {!esCoaseguro && (
                  <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                    <Form.Item
                      label="Nro. Documento"
                      required
                      validateStatus={numComprobanteError ? 'error' : ''}
                      help={numComprobanteError || ''}
                    >
                      {getFieldDecorator('numComprobante', {
                        initialValue: selectedPago ? selectedPago.numComprobante : undefined,
                        rules: [
                          {
                            validator: this.checkNumeroDocumento
                          }
                        ]
                      })(<Input placeholder="Ingrese n&uacute;mero" maxLength={8} />)}
                    </Form.Item>
                  </Col>
                )}
                <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                  <Form.Item label="Moneda" validateStatus={codMonedaError ? 'error' : ''} help={codMonedaError || ''}>
                    {getFieldDecorator('codMoneda', {
                      initialValue: selectedPago ? selectedPago.codMoneda : monedaCertificado,
                      rules: [
                        {
                          required: true,
                          message: ValidationMessage.REQUIRED
                        }
                      ]
                    })(
                      <Select
                        onChange={this.onChangeMoneda}
                        loading={coinTypes.isLoading}
                        placeholder="Seleccione moneda"
                      >
                        {coinTypes.coinTypes.map(coinType => {
                          return (
                            <Select.Option key={coinType.valor} value={coinType.valor}>
                              {coinType.descripcion}
                            </Select.Option>
                          );
                        })}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                  <Form.Item
                    label="Fecha emisi&oacute;n"
                    validateStatus={fecEmisionError ? 'error' : ''}
                    help={fecEmisionError || ''}
                  >
                    {getFieldDecorator('fecEmision', {
                      initialValue: selectedPago ? moment.utc(selectedPago.fecEmision) : moment(),
                      rules: [
                        {
                          required: true,
                          message: ValidationMessage.REQUIRED
                        }
                      ]
                    })(<DatePicker format={CONSTANTS_APP.FORMAT_DATE} />)}
                  </Form.Item>
                </Col>
                {!esCoaseguro && (
                  <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                    <Form.Item
                      label="Gastos"
                      required
                      validateStatus={mtoGastosError ? 'error' : ''}
                      help={mtoGastosError || ''}
                    >
                      {getFieldDecorator('mtoGastos', {
                        initialValue: {
                          number: selectedPago ? selectedPago.mtoGastos : undefined
                        },
                        rules: [{ validator: this.checkPriceMayorIgualCero }]
                      })(<PriceInputNoSymbol onChange={this.onChangeGastos} placeholder="Ingrese gastos" />)}
                    </Form.Item>
                  </Col>
                )}
                <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                  <Row gutter={8}>
                    <Col xs={20} sm={20} md={20} lg={20} xl={20}>
                      <Form.Item
                        label="Honorarios"
                        required
                        validateStatus={mtoHonorariosError ? 'error' : ''}
                        help={mtoHonorariosError || ''}
                      >
                        {getFieldDecorator('mtoHonorarios', {
                          initialValue: {
                            number: selectedPago ? selectedPago.mtoHonorarios : undefined
                          },
                          rules: [{ validator: esCoaseguro ? this.checkPriceImporte : this.checkPriceMayorIgualCero }]
                        })(<PriceInputNoSymbol onChange={this.onChangeHonorarios} placeholder="Ingrese honorarios" />)}
                      </Form.Item>
                    </Col>
                    {this.muestraTooltip(mtoHonorarioCalculado) ? (
                      <Col xs={4} sm={4} md={4} lg={4} xl={4}>
                        <Form.Item label=" " colon={false}>
                          <Tooltip
                            id="honorarios_segun_tarifario"
                            title={
                              <div>
                                Honorarios según tarifario: {selectedMoneda === 'USD' ? 'USD' : 'SOL'}{' '}
                                <span data-cy="honorarios_segun_tarifario_monto">
                                  {currency(mtoHonorarioCalculado).format()}
                                </span>
                              </div>
                            }
                          >
                            <Icon type="exclamation-circle" style={{ fontSize: '20px', color: '#E33E1B' }} />
                          </Tooltip>
                        </Form.Item>
                      </Col>
                    ) : null}
                  </Row>
                </Col>
                {!esCoaseguro && (
                  <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                    <Form.Item
                      label="Importe documento"
                      required
                      validateStatus={mtoImporteError ? 'error' : ''}
                      help={mtoImporteError || ''}
                    >
                      {getFieldDecorator('mtoImporte', {
                        initialValue: {
                          number: selectedPago ? selectedPago.mtoImporte : undefined
                        },
                        rules: [{ validator: this.checkPriceImporte }]
                      })(<PriceInputNoSymbol onChange={this.onChangeImporte} placeholder="Ingrese importe" />)}
                    </Form.Item>
                  </Col>
                )}
                {tieneCoaseguro && (
                  <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                    <Form.Item
                      label="Tipo cobro"
                      validateStatus={codTipoCobroError ? 'error' : ''}
                      help={codTipoCobroError || ''}
                    >
                      {getFieldDecorator('codTipoCobro', {
                        initialValue: selectedPago ? selectedPago.codTipoCobro : undefined,
                        rules: [
                          {
                            required: true,
                            message: ValidationMessage.REQUIRED
                          }
                        ]
                      })(
                        <Select
                          onChange={this.onChangeTipoCobro}
                          loading={chargeTypes.isLoading}
                          placeholder="Seleccione tipo cobro"
                        >
                          {chargeTypes.chargeTypes.map(chargeType => {
                            return (
                              <Select.Option key={chargeType.valor} value={chargeType.valor}>
                                {chargeType.descripcion}
                              </Select.Option>
                            );
                          })}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                )}
                {selectedTipoCobro === '3' && (
                  <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                    <Form.Item
                      label="Monto coaseguro"
                      required
                      validateStatus={mtoCoaseguroError ? 'error' : ''}
                      help={mtoCoaseguroError || ''}
                    >
                      {getFieldDecorator('mtoCoaseguro', {
                        initialValue: {
                          number: selectedPago ? selectedPago.mtoCoaseguro : undefined
                        },
                        rules: [{ validator: this.checkPricePositivo }]
                      })(<PriceInputNoSymbol placeholder="Ingrese monto coaseguro" />)}
                    </Form.Item>
                  </Col>
                )}

                {!esCoaseguro && selectedDocType !== COD_DOCTYPE_RECIBOHONORARIOS && (
                  <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                    <Form.Item label="Exonerado de IGV">
                      <Checkbox checked={checkIgv} onChange={this.handleChangeCheckIgv} />
                    </Form.Item>
                  </Col>
                )}
                {!esCoaseguro && selectedDocType !== COD_DOCTYPE_RECIBOHONORARIOS && !checkIgv && (
                  <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                    <Form.Item
                      label="IGV"
                      required
                      validateStatus={mtoIgvError ? 'error' : ''}
                      help={mtoIgvError || ''}
                    >
                      {getFieldDecorator('mtoIgv', {
                        initialValue: {
                          number: selectedPago ? selectedPago.mtoIgv : undefined
                        },
                        rules: [{ validator: this.checkPricePositivo }]
                      })(<PriceInputNoSymbol disabled onChange={this.onChangeIgv} placeholder="IGV" />)}
                    </Form.Item>
                  </Col>
                )}
                {!esCoaseguro && selectedDocType === COD_DOCTYPE_RECIBOHONORARIOS && (
                  <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                    <Form.Item label="Exonerado de Retencion 4ta">
                      <Checkbox checked={checkRetencion4ta} onChange={this.handleChangeCheckRetencion4ta} />
                    </Form.Item>
                  </Col>
                )}
                {!esCoaseguro && selectedDocType === COD_DOCTYPE_RECIBOHONORARIOS && !checkRetencion4ta && (
                  <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                    <Form.Item
                      label="Retenci&oacute;n 4ta"
                      required
                      validateStatus={mtoRetencionCuartaError ? 'error' : ''}
                      help={mtoRetencionCuartaError || ''}
                    >
                      {getFieldDecorator('mtoRetencionCuarta', {
                        initialValue: {
                          number: selectedPago ? selectedPago.mtoRetencionCuarta : undefined
                        },
                        rules: [{ validator: this.checkPricePositivo }]
                      })(
                        <PriceInputNoSymbol
                          disabled
                          onChange={this.onChangeRetencionCuarta}
                          placeholder="Retencion 4ta"
                        />
                      )}
                    </Form.Item>
                  </Col>
                )}
                <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                  <Form.Item
                    label="Total"
                    required
                    validateStatus={mtoTotalError ? 'error' : ''}
                    help={mtoTotalError || ''}
                  >
                    {getFieldDecorator('mtoTotal', {
                      initialValue: {
                        number: selectedPago ? selectedPago.mtoTotal : undefined
                      },
                      rules: [{ validator: this.checkPricePositivo }]
                    })(<PriceInputNoSymbol disabled placeholder="Ingrese total" />)}
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Modal>
        </Row>
      </div>
    );
  }
}

export default connect()(Form.create({ name: 'honorarios_modal' })(PagosHonorariosModal));
