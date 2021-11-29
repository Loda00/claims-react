import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import currency from 'currency.js';
import { Form, Row, Col, Modal, Select, Input, DatePicker, Checkbox } from 'antd';
import { ValidationMessage } from 'util/validation';
import { ROLE_TYPE, CONSTANTS_APP, TASA_CAMBIO_PRECISION } from 'constants/index';
import { hasErrors, showErrorMessage } from 'util/index';
import InsuredInput from 'components/InsuredInput';

import * as docTypesActionCreators from 'scenes/TaskTray/components/SectionPayments/data/docTypes/actions';
import * as coinTypesActionCreators from 'scenes/TaskTray/components/SectionPayments/data/coinTypes/actions';
import * as chargeTypesActionCreators from 'scenes/TaskTray/components/SectionPayments/data/chargeTypes/actions';

import PriceInputNoSymbol from 'components/PriceInputNoSymbol';
import { uniqBy, filter, isEmpty } from 'lodash';

const COD_DOCTYPE_RECIBOHONORARIOS = '02';
class OtrosConceptosModal extends React.Component {
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
      selectedPago,
      form: { getFieldValue, setFieldsValue, validateFields },
      igv,
      retencion4ta
    } = this.props;
    const promises = [];
    promises.push(dispatch(docTypesActionCreators.fetchDocTypes('CRG_TDOC_PAGO')));
    promises.push(dispatch(coinTypesActionCreators.fetchCoinTypes('CRG_TMONEDA')));
    promises.push(dispatch(chargeTypesActionCreators.fetchChargeTypes('CRG_TCOBRO')));

    try {
      await Promise.all(promises);

      const mtoImporte = (getFieldValue('mtoImporte') || {}).number;
      if (selectedPago && selectedPago.mtoIgv > 0) {
        this.setState({ checkIgv: false }, () => {
          setFieldsValue({
            mtoIgv: {
              number: String(currency(mtoImporte).multiply(igv).value)
            }
          });
        });
      }

      if (selectedPago && selectedPago.mtoRetencionCuarta > 0) {
        this.setState({ checkRetencion4ta: false }, () => {
          setFieldsValue({
            mtoRetencionCuarta: {
              number: String(currency(mtoImporte).multiply(retencion4ta).value)
            }
          });
        });
      }

      validateFields();
    } catch (e) {
      showErrorMessage(e);
    }
  }

  obtenerRamosVisibles = () => {
    const { otrosConceptosForm } = this.props;

    return uniqBy(filter(otrosConceptosForm, oc => oc.codConcepto !== '001'), 'codRamo');
  };

  obtenerOtrosConceptosVisibles = () => {
    const { otrosConceptosForm } = this.props;

    return uniqBy(filter(otrosConceptosForm, o => o.codConcepto !== '001'), 'codConcepto');
  };

  onChangeTipoCobro = value => {
    const {
      form: { validateFields }
    } = this.props;
    this.setState({ selectedTipoCobro: value }, () => {
      this.forceUpdate();
      validateFields();
    });
  };

  onChangeRamo = value => {
    this.setState({ selectedIdRamo: value });
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
        validateFields(['numDocumento'], { force: true });
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

  checkPrice = (rule, value, callback) => {
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
      const {
        otrosConceptosForm,
        form: { getFieldValue },
        selectedPago,
        monedaCertificado,
        tasaCambio
      } = this.props;
      const { selectedIdRamo, selectedMoneda } = this.state;

      const selectedRamo = otrosConceptosForm.find(b => b.idRamo === selectedIdRamo);
      const { mtoReserva, mtoTotalPagos } =
        otrosConceptosForm.find(
          oc => oc.codConcepto === getFieldValue('codConcepto') && oc.codRamo === selectedRamo.codRamo
        ) || {};

      const { codConcepto, mtoImporte, codMoneda: monedaPagoSeleccionado } = selectedPago || {};

      const mtoTasaCambioReserva =
        selectedMoneda && selectedMoneda !== monedaCertificado && tasaCambio[`${monedaCertificado}-${selectedMoneda}`]
          ? tasaCambio[`${monedaCertificado}-${selectedMoneda}`].tasa
          : 1;

      let saldo = currency(mtoReserva, { precision: TASA_CAMBIO_PRECISION })
        .subtract(mtoTotalPagos, { precision: TASA_CAMBIO_PRECISION })
        .multiply(mtoTasaCambioReserva, { precision: TASA_CAMBIO_PRECISION }).value;

      if (codConcepto === getFieldValue('codConcepto')) {
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
        saldo = currency(mtoReserva, { precision: TASA_CAMBIO_PRECISION })
          .subtract(mtoTotalPagos, { precision: TASA_CAMBIO_PRECISION })
          .multiply(mtoTasaCambioReserva, { precision: TASA_CAMBIO_PRECISION })
          .add(mtoImporteConvertido).value;
      }

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

  onChangeImporte = (fieldValue, value) => {
    const { checkIgv, selectedDocType, checkRetencion4ta } = this.state;
    const {
      igv,
      retencion4ta,
      form: { setFieldsValue, validateFields }
    } = this.props;

    const valueImporte = typeof value !== 'undefined' ? value : fieldValue.number;

    if (typeof valueImporte === 'undefined') return;

    const numberIgv = currency(valueImporte).multiply(igv).value;
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

  checkProveedor = (rule, value, callback) => {
    if (!this.tieneReservaOtrosConceptos()) {
      callback('No existe reserva para otros conceptos');
    }

    if (value && value.terceroElegido && typeof value.terceroElegido.codExterno !== 'undefined') {
      callback();
    }

    callback(ValidationMessage.NOT_VALID);
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

  tieneReservaOtrosConceptos = () => {
    const { otrosConceptosForm } = this.props;
    return otrosConceptosForm.find(oc => oc.codConcepto !== '001');
  };

  render() {
    const {
      form: { getFieldDecorator, getFieldsError, isFieldTouched, getFieldError, getFieldValue },
      otrosConceptosForm,
      selectedPago,
      monedaCertificado,
      modalVisible,
      maintainLoading,
      onOk,
      hideModal,
      titleModal,
      docTypes,
      coinTypes,
      tieneCoaseguro,
      chargeTypes,
      tasaCambio,
      tipoConfirmarGestion
    } = this.props;

    const {
      selectedIdRamo,
      selectedTipoCobro,
      selectedDocType,
      checkIgv,
      checkRetencion4ta,
      selectedMoneda
    } = this.state;

    let proveedorError;
    if (selectedPago || !this.tieneReservaOtrosConceptos()) {
      proveedorError = getFieldError('proveedor');
    } else {
      proveedorError = isFieldTouched('proveedor') && getFieldError('proveedor');
    }

    let codConceptoError;
    if (selectedPago) {
      codConceptoError = getFieldError('codConcepto');
    } else {
      codConceptoError = isFieldTouched('codConcepto') && getFieldError('codConcepto');
    }

    const ramosVisibles = this.obtenerRamosVisibles();
    const otrosConceptosVisibles = this.obtenerOtrosConceptosVisibles();

    const idRamoError = selectedPago ? getFieldError('idRamo') : isFieldTouched('idRamo') && getFieldError('idRamo');
    const codTipoDocumentoError = selectedPago
      ? getFieldError('codTipoDocumento')
      : isFieldTouched('codTipoDocumento') && getFieldError('codTipoDocumento');
    const codSerieError = selectedPago
      ? getFieldError('numSerie')
      : isFieldTouched('numSerie') && getFieldError('numSerie');
    const numComprobanteError = selectedPago
      ? getFieldError('numDocumento')
      : isFieldTouched('numDocumento') && getFieldError('numDocumento');
    const codMonedaError = selectedPago
      ? getFieldError('codMoneda')
      : isFieldTouched('codMoneda') && getFieldError('codMoneda');
    const fecEmisionError = selectedPago
      ? getFieldError('fecEmision')
      : isFieldTouched('fecEmision') && getFieldError('fecEmision');
    const mtoTotalError = selectedPago
      ? getFieldError('mtoTotal')
      : isFieldTouched('mtoTotal') && getFieldError('mtoTotal');
    const codTipoCobroError = selectedPago
      ? getFieldError('codTipoCobro')
      : isFieldTouched('codTipoCobro') && getFieldError('codTipoCobro');
    const mtoIgvError = selectedPago
      ? getFieldError('mtoIgv')
      : (isFieldTouched('mtoIgv') || isFieldTouched('mtoImporte')) && getFieldError('mtoIgv');
    const mtoRetencionCuartaError = selectedPago
      ? getFieldError('mtoRetencionCuarta')
      : (isFieldTouched('mtoRetencionCuarta') || isFieldTouched('mtoImporte')) && getFieldError('mtoRetencionCuarta');
    const mtoCoaseguroError = selectedPago
      ? getFieldError('mtoCoaseguro')
      : isFieldTouched('mtoCoaseguro') && getFieldError('mtoCoaseguro');

    let mtoImporteError;
    if (selectedPago || ((getFieldValue('mtoImporte') || {}).number > 0 && getFieldValue('codConcepto'))) {
      mtoImporteError = getFieldError('mtoImporte');
    } else {
      mtoImporteError = isFieldTouched('mtoImporte') && getFieldError('mtoImporte');
    }

    const selectedRamo = ramosVisibles.find(b => b.idRamo === selectedIdRamo);

    const { mtoReserva, mtoTotalPagos } =
      otrosConceptosForm.find(
        oc => oc.codConcepto === getFieldValue('codConcepto') && oc.codRamo === selectedRamo.codRamo
      ) || {};

    const { codConcepto, mtoImporte, codMoneda: monedaPagoSeleccionado } = selectedPago || {};

    const mtoTasaCambioReserva =
      selectedMoneda && selectedMoneda !== monedaCertificado && tasaCambio[`${monedaCertificado}-${selectedMoneda}`]
        ? tasaCambio[`${monedaCertificado}-${selectedMoneda}`].tasa
        : 1;

    let saldo = currency(mtoReserva, { precision: TASA_CAMBIO_PRECISION })
      .subtract(mtoTotalPagos, { precision: TASA_CAMBIO_PRECISION })
      .multiply(mtoTasaCambioReserva, { precision: TASA_CAMBIO_PRECISION }).value;

    if (codConcepto === getFieldValue('codConcepto')) {
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
      saldo = currency(mtoReserva, { precision: TASA_CAMBIO_PRECISION })
        .subtract(mtoTotalPagos, { precision: TASA_CAMBIO_PRECISION })
        .multiply(mtoTasaCambioReserva, { precision: TASA_CAMBIO_PRECISION })
        .add(mtoImporteConvertido).value;
    }

    return (
      <div>
        <Row>
          <Modal
            centered
            visible={modalVisible}
            okText="Grabar"
            okButtonProps={{
              id: 'modal_otros_conceptos_grabar',
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
                    required
                    label="Proveedor"
                    validateStatus={proveedorError ? 'error' : ''}
                    help={proveedorError || ''}
                  >
                    {getFieldDecorator('proveedor', {
                      initialValue: {
                        terceroElegido: {
                          codExterno: selectedPago ? selectedPago.idProveedor : undefined,
                          nomCompleto: selectedPago ? selectedPago.nomProveedor : undefined
                        }
                      },
                      rules: [{ validator: this.checkProveedor }]
                    })(<InsuredInput roleType={ROLE_TYPE.PROVEEDOR} />)}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                  <Form.Item label="Ramo" validateStatus={idRamoError ? 'error' : ''} help={idRamoError || ''}>
                    {getFieldDecorator('idRamo', {
                      initialValue: selectedPago
                        ? selectedPago.idRamo
                        : ramosVisibles.length === 1
                        ? ramosVisibles[0].idRamo
                        : undefined,
                      rules: [
                        {
                          required: true,
                          message: ValidationMessage.REQUIRED
                        }
                      ]
                    })(
                      <Select
                        onChange={this.onChangeRamo}
                        disabled={tipoConfirmarGestion === 'A'}
                        // loading={this.props.branches.isLoading}
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
                <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                  <Form.Item
                    label="Concepto"
                    required
                    validateStatus={codConceptoError ? 'error' : ''}
                    help={codConceptoError || ''}
                    extra={
                      getFieldValue('codConcepto') ? (
                        <div>
                          Saldo pendiente: {getFieldValue('codMoneda')}{' '}
                          <span data-cy="saldo_pendiente">{currency(saldo).format()}</span>
                        </div>
                      ) : (
                        ''
                      )
                    }
                  >
                    {getFieldDecorator('codConcepto', {
                      initialValue: selectedPago ? selectedPago.codConcepto : undefined,
                      rules: [
                        {
                          required: true,
                          message: ValidationMessage.REQUIRED
                        }
                      ]
                    })(
                      <Select
                        disabled={tipoConfirmarGestion === 'A'}
                        // loading={this.props.concepts.isLoading}
                        placeholder="Seleccione concepto"
                      >
                        {otrosConceptosVisibles.map(concept => {
                          return (
                            <Select.Option key={concept.codConcepto} value={concept.codConcepto}>
                              {concept.dscConcepto}
                            </Select.Option>
                          );
                        })}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
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
                <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                  <Form.Item label="Serie" validateStatus={codSerieError ? 'error' : ''} help={codSerieError || ''}>
                    {getFieldDecorator('numSerie', {
                      initialValue: selectedPago ? selectedPago.numSerie : undefined,
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
                <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                  <Form.Item
                    label="N&uacute;mero"
                    required
                    validateStatus={numComprobanteError ? 'error' : ''}
                    help={numComprobanteError || ''}
                  >
                    {getFieldDecorator('numDocumento', {
                      initialValue: selectedPago ? selectedPago.numDocumento : undefined,
                      rules: [
                        {
                          validator: this.checkNumeroDocumento
                        }
                      ]
                    })(<Input placeholder="Ingrese n&uacute;mero" maxLength={8} />)}
                  </Form.Item>
                </Col>
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
                <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                  <Form.Item
                    label="Importe"
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
                      validateStatus={mtoCoaseguroError ? 'error' : ''}
                      help={mtoCoaseguroError || ''}
                    >
                      {getFieldDecorator('mtoCoaseguro', {
                        initialValue: {
                          number: selectedPago ? selectedPago.mtoCoaseguro : undefined
                        },
                        rules: [{ validator: this.checkPrice }]
                      })(<PriceInputNoSymbol placeholder="Ingrese monto coaseguro" />)}
                    </Form.Item>
                  </Col>
                )}

                {selectedDocType !== COD_DOCTYPE_RECIBOHONORARIOS && (
                  <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                    <Form.Item label="Exonerado de IGV">
                      <Checkbox checked={checkIgv} onChange={this.handleChangeCheckIgv} />
                    </Form.Item>
                  </Col>
                )}
                {selectedDocType !== COD_DOCTYPE_RECIBOHONORARIOS && !checkIgv && (
                  <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                    <Form.Item label="IGV" validateStatus={mtoIgvError ? 'error' : ''} help={mtoIgvError || ''}>
                      {getFieldDecorator('mtoIgv', {
                        initialValue: {
                          number: selectedPago ? selectedPago.mtoIgv : undefined
                        },
                        rules: [{ validator: this.checkPrice }]
                      })(<PriceInputNoSymbol disabled onChange={this.onChangeIgv} placeholder="Ingrese IGV" />)}
                    </Form.Item>
                  </Col>
                )}
                {selectedDocType === COD_DOCTYPE_RECIBOHONORARIOS && (
                  <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                    <Form.Item label="Exonerado de Retencion 4ta">
                      <Checkbox checked={checkRetencion4ta} onChange={this.handleChangeCheckRetencion4ta} />
                    </Form.Item>
                  </Col>
                )}
                {selectedDocType === COD_DOCTYPE_RECIBOHONORARIOS && !checkRetencion4ta && (
                  <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                    <Form.Item
                      label="Retenci&oacute;n 4ta"
                      validateStatus={mtoRetencionCuartaError ? 'error' : ''}
                      help={mtoRetencionCuartaError || ''}
                    >
                      {getFieldDecorator('mtoRetencionCuarta', {
                        initialValue: {
                          number: selectedPago ? selectedPago.mtoRetencionCuarta : undefined
                        },
                        rules: [{ validator: this.checkPrice }]
                      })(
                        <PriceInputNoSymbol
                          disabled
                          onChange={this.onChangeRetencionCuarta}
                          placeholder="Ingrese retencion 4ta"
                        />
                      )}
                    </Form.Item>
                  </Col>
                )}
                <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                  <Form.Item label="Total" validateStatus={mtoTotalError ? 'error' : ''} help={mtoTotalError || ''}>
                    {getFieldDecorator('mtoTotal', {
                      initialValue: {
                        number: selectedPago ? selectedPago.mtoTotal : undefined
                      },
                      rules: [{ validator: this.checkPrice }]
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

export default connect()(Form.create({ name: 'OtrosConceptosModal_modal' })(OtrosConceptosModal));
