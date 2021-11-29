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
import { isEmpty } from 'lodash';

const COD_DOCTYPE_RECIBOHONORARIOS = '02';
class ReposicionModal extends React.Component {
  state = {
    selectedTipoCobro: this.props.selectedPago ? this.props.selectedPago.codTipoCobro || undefined : undefined,
    selectedDocType: this.props.selectedPago ? this.props.selectedPago.codTipoDocumento || undefined : undefined,
    selectedMoneda: this.props.selectedPago
      ? this.props.selectedPago.codMoneda || undefined
      : this.props.monedaCertificado,
    checkIgv: this.props.selectedPago ? !Number(this.props.selectedPago.mtoIgv) || false : false,
    checkRetencion4ta: this.props.selectedPago ? !Number(this.props.selectedPago.mtoRetencionCuarta) || false : false
  };

  async componentDidMount() {
    const promises = [];
    promises.push(this.props.dispatch(docTypesActionCreators.fetchDocTypes('CRG_TDOC_PAGO')));
    promises.push(this.props.dispatch(coinTypesActionCreators.fetchCoinTypes('CRG_TMONEDA')));
    promises.push(this.props.dispatch(chargeTypesActionCreators.fetchChargeTypes('CRG_TCOBRO')));
    try {
      await Promise.all(promises);

      const mtoImporte = (this.props.form.getFieldValue('mtoImporte') || {}).number;

      if (this.props.selectedPago && this.props.selectedPago.mtoIgv > 0) {
        this.setState({ checkIgv: false }, () => {
          this.props.form.setFieldsValue({
            mtoIgv: {
              number: String(currency(mtoImporte).multiply(this.props.igv).value)
            }
          });
        });
      }

      if (this.props.selectedPago && this.props.selectedPago.mtoRetencionCuarta > 0) {
        this.setState({ checkRetencion4ta: false }, () => {
          this.props.form.setFieldsValue({
            mtoRetencionCuarta: {
              number: String(currency(mtoImporte).multiply(this.props.retencion4ta).value)
            }
          });
        });
      }

      this.props.form.validateFields();
    } catch (e) {
      showErrorMessage(e);
    }
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

  handleDocumentTypeChange = value => {
    this.setState(
      {
        selectedDocType: value
      },
      () => {
        this.props.form.validateFields(['numDocumento'], { force: true });
        this.onChangeImporte(this.props.form.getFieldValue('mtoImporte'));
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
    }

    if (currency(value.number).value > 0) {
      const {
        coberturasForm,
        form: { getFieldValue },
        selectedPago,
        tasaCambio,
        monedaCertificado
      } = this.props;
      const { selectedMoneda } = this.state;

      const { saldoPendienteCobertura } =
        coberturasForm.find(cob => cob.codCobert === getFieldValue('cobertura')) || {};

      const mtoTasaCambioReserva =
        selectedMoneda && selectedMoneda !== monedaCertificado && tasaCambio[`${monedaCertificado}-${selectedMoneda}`]
          ? tasaCambio[`${monedaCertificado}-${selectedMoneda}`].tasa
          : 1;

      let saldo = currency(saldoPendienteCobertura, {
        precision: TASA_CAMBIO_PRECISION
      }).multiply(mtoTasaCambioReserva, {
        precision: TASA_CAMBIO_PRECISION
      }).value;

      const { codCobertura, mtoImporte, codMoneda } = selectedPago || {};

      if (codCobertura === getFieldValue('cobertura')) {
        const mtoTasaCambioMontoSeleccionado =
          selectedMoneda && codMoneda && selectedMoneda !== codMoneda && tasaCambio[`${codMoneda}-${selectedMoneda}`]
            ? tasaCambio[`${codMoneda}-${selectedMoneda}`].tasa
            : 1;

        const mtoImporteConvertido = currency(mtoImporte, {
          precision: TASA_CAMBIO_PRECISION
        }).multiply(mtoTasaCambioMontoSeleccionado, {
          precision: TASA_CAMBIO_PRECISION
        }).value;

        saldo = currency(saldoPendienteCobertura, {
          precision: TASA_CAMBIO_PRECISION
        })
          .multiply(mtoTasaCambioReserva, { precision: TASA_CAMBIO_PRECISION })
          .add(mtoImporteConvertido).value;
      }

      if (currency(value.number).value > currency(saldo).value) {
        callback('No debe ser mayor al saldo pendiente');
      }
    }

    callback();
  };

  checkProveedor = (rule, value, callback) => {
    if (value && value.terceroElegido && typeof value.terceroElegido.codExterno !== 'undefined') {
      callback();
      return;
    }

    callback(ValidationMessage.NOT_VALID);
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
    if (typeof (fieldValue || {}).number === 'undefined') {
      return;
    }

    const valueImporte = typeof value !== 'undefined' ? value : (fieldValue || {}).number;

    const numberIgv = currency(valueImporte).multiply(this.props.igv).value;
    if (
      !this.state.checkIgv &&
      (typeof this.state.selectedDocType === 'undefined' || this.state.selectedDocType === '01')
    ) {
      this.props.form.setFieldsValue({
        mtoIgv: { number: String(numberIgv) },
        mtoTotal: {
          number: String(currency(valueImporte).add(numberIgv).value)
        }
      });
    }

    const numberRetencionCuarta = currency(valueImporte).multiply(this.props.retencion4ta).value;

    if (!this.state.checkRetencion4ta && this.state.selectedDocType === '02') {
      this.props.form.setFieldsValue({
        mtoRetencionCuarta: { number: String(numberRetencionCuarta) },
        mtoTotal: {
          number: String(currency(valueImporte).subtract(numberRetencionCuarta).value)
        }
      });
    }

    if (this.state.checkIgv && this.state.selectedDocType !== '02') {
      this.props.form.setFieldsValue({
        mtoTotal: { number: String(currency(valueImporte).value) }
      });
    }

    if (
      this.state.checkRetencion4ta &&
      this.state.selectedDocType !== '01' &&
      typeof this.state.selectedDocType !== 'undefined'
    ) {
      this.props.form.setFieldsValue({
        mtoTotal: { number: String(currency(valueImporte).value) }
      });
    }

    this.props.form.validateFields(['mtoImporte', 'mtoTotal', 'mtoIgv', 'mtoRetencionCuarta'], { force: true });
  };

  onChangeIgv = value => {
    const mtoImporte = (this.props.form.getFieldValue('mtoImporte') || {}).number;
    this.props.form.setFieldsValue({
      mtoTotal: { number: String(currency(mtoImporte).add(value.number).value) }
    });

    this.props.form.validateFields({ force: true });
  };

  onChangeRetencionCuarta = value => {
    const mtoImporte = (this.props.form.getFieldValue('mtoImporte') || {}).number;
    this.props.form.setFieldsValue({
      mtoTotal: {
        number: String(currency(mtoImporte).subtract(value.number).value)
      }
    });

    this.props.form.validateFields({ force: true });
  };

  checkCobertura = (rule, value, callback) => {
    const { coberturasForm } = this.props;
    const coberturasVisibles = coberturasForm;
    if (isEmpty(coberturasVisibles)) {
      callback('No existen reservas');
      return;
    }
    if (value) {
      callback();
      return;
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

  render() {
    const {
      form: { getFieldDecorator, getFieldsError, isFieldTouched, getFieldError, getFieldValue },
      coberturasForm,
      selectedPago,
      monedaCertificado,
      tasaCambio,
      tipoConfirmarGestion
    } = this.props;
    const proveedorError = selectedPago
      ? getFieldError('proveedor')
      : isFieldTouched('proveedor') && getFieldError('proveedor');

    const coberturasVisibles = coberturasForm;

    let coberturaError;
    if (selectedPago || isEmpty(coberturasVisibles)) {
      coberturaError = getFieldError('cobertura');
    } else {
      coberturaError = isFieldTouched('cobertura') && getFieldError('cobertura');
    }

    const codTipoDocumentoError = selectedPago
      ? getFieldError('codTipoDocumento')
      : isFieldTouched('codTipoDocumento') && getFieldError('codTipoDocumento');
    const numSerieError = selectedPago
      ? getFieldError('numSerie')
      : isFieldTouched('numSerie') && getFieldError('numSerie');
    const numDocumentoError = selectedPago
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
    if (selectedPago || ((getFieldValue('mtoImporte') || {}).number > 0 && getFieldValue('cobertura'))) {
      mtoImporteError = getFieldError('mtoImporte');
    } else {
      mtoImporteError = isFieldTouched('mtoImporte') && getFieldError('mtoImporte');
    }

    const { saldoPendienteCobertura } = coberturasForm.find(cob => cob.codCobert === getFieldValue('cobertura')) || {};

    const selectedMoneda = getFieldValue('codMoneda');
    const mtoTasaCambioReserva =
      selectedMoneda && selectedMoneda !== monedaCertificado && tasaCambio[`${monedaCertificado}-${selectedMoneda}`]
        ? tasaCambio[`${monedaCertificado}-${selectedMoneda}`].tasa
        : 1;

    let saldo = currency(saldoPendienteCobertura, {
      precision: TASA_CAMBIO_PRECISION
    }).multiply(mtoTasaCambioReserva, {
      precision: TASA_CAMBIO_PRECISION
    }).value;

    const { codCobertura, mtoImporte, codMoneda } = selectedPago || {};

    if (codCobertura === getFieldValue('cobertura')) {
      const mtoTasaCambioMontoSeleccionado =
        selectedMoneda && codMoneda && selectedMoneda !== codMoneda && tasaCambio[`${codMoneda}-${selectedMoneda}`]
          ? tasaCambio[`${codMoneda}-${selectedMoneda}`].tasa
          : 1;

      const mtoImporteConvertido = currency(mtoImporte, {
        precision: TASA_CAMBIO_PRECISION
      }).multiply(mtoTasaCambioMontoSeleccionado, {
        precision: TASA_CAMBIO_PRECISION
      }).value;

      saldo = currency(saldoPendienteCobertura, {
        precision: TASA_CAMBIO_PRECISION
      })
        .multiply(mtoTasaCambioReserva, { precision: TASA_CAMBIO_PRECISION })
        .add(mtoImporteConvertido).value;
    }

    return (
      <div>
        <Row>
          <Modal
            centered
            visible={this.props.modalVisible}
            okText="Grabar"
            okButtonProps={{
              id: 'modal_reposiciones_grabar',
              disabled: hasErrors(getFieldsError()),
              loading: this.props.maintainLoading
            }}
            cancelText="Cancelar"
            onOk={this.props.onOk}
            onCancel={this.props.hideModal}
            destroyOnClose
            width="600px"
          >
            <Form>
              <h2>{this.props.titleModal}</h2>
              <Row gutter={24}>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                  <Form.Item
                    label="Proveedor"
                    validateStatus={proveedorError ? 'error' : ''}
                    help={proveedorError || ''}
                  >
                    {getFieldDecorator('proveedor', {
                      initialValue: {
                        terceroElegido: {
                          codExterno: this.props.selectedPago ? this.props.selectedPago.idProveedor : undefined,
                          nomCompleto: this.props.selectedPago ? this.props.selectedPago.nomProveedor : undefined
                        }
                      },
                      rules: [
                        { validator: this.checkProveedor },
                        {
                          required: true,
                          message: ValidationMessage.REQUIRED
                        }
                      ]
                    })(<InsuredInput roleType={ROLE_TYPE.PROVEEDOR} />)}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                  <Form.Item
                    label="Cobertura"
                    required
                    validateStatus={coberturaError ? 'error' : ''}
                    help={coberturaError || ''}
                    extra={
                      getFieldValue('cobertura') ? (
                        <div>
                          Saldo pendiente: {getFieldValue('codMoneda')}{' '}
                          <span data-cy="saldo_pendiente">{currency(saldo).format()}</span>
                        </div>
                      ) : (
                        ''
                      )
                    }
                    className="ant-item-with-extra"
                  >
                    {getFieldDecorator('cobertura', {
                      initialValue:
                        coberturasVisibles.length === 1
                          ? coberturasVisibles[0].codCobert
                          : this.props.selectedPago
                          ? this.props.selectedPago.codCobertura
                          : undefined,
                      rules: [{ validator: this.checkCobertura }]
                    })(
                      <Select disabled={tipoConfirmarGestion === 'A'} placeholder="Seleccione cobertura">
                        {coberturasVisibles.map(coverage => {
                          return (
                            <Select.Option key={coverage.codCobert} value={coverage.codCobert}>
                              {`${coverage.codCobert} - ${coverage.dscCobertura}`}
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
                      initialValue: this.props.selectedPago ? this.props.selectedPago.codTipoDocumento : undefined,
                      rules: [
                        {
                          required: true,
                          message: ValidationMessage.REQUIRED
                        }
                      ]
                    })(
                      <Select
                        onChange={this.handleDocumentTypeChange}
                        loading={this.props.docTypes.isLoading}
                        placeholder="Seleccione tipo documento"
                      >
                        {this.props.docTypes.docTypes.map(docType => {
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
                  <Form.Item label="Serie" validateStatus={numSerieError ? 'error' : ''} help={numSerieError || ''}>
                    {getFieldDecorator('numSerie', {
                      initialValue: this.props.selectedPago ? this.props.selectedPago.numSerie : undefined,
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
                    validateStatus={numDocumentoError ? 'error' : ''}
                    help={numDocumentoError || ''}
                  >
                    {getFieldDecorator('numDocumento', {
                      initialValue: this.props.selectedPago ? this.props.selectedPago.numDocumento : undefined,
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
                      initialValue: this.props.selectedPago ? this.props.selectedPago.codMoneda : monedaCertificado,
                      rules: [
                        {
                          required: true,
                          message: ValidationMessage.REQUIRED
                        }
                      ]
                    })(
                      <Select
                        onChange={this.onChangeMoneda}
                        loading={this.props.coinTypes.isLoading}
                        placeholder="Seleccione moneda"
                      >
                        {this.props.coinTypes.coinTypes.map(coinType => {
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
                      initialValue: this.props.selectedPago ? moment.utc(this.props.selectedPago.fecEmision) : moment(),
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
                    required
                    validateStatus={mtoImporteError ? 'error' : ''}
                    help={mtoImporteError || ''}
                  >
                    {getFieldDecorator('mtoImporte', {
                      initialValue: {
                        number: this.props.selectedPago ? this.props.selectedPago.mtoImporte : undefined
                      },
                      rules: [{ validator: this.checkPriceImporte }]
                    })(<PriceInputNoSymbol onChange={this.onChangeImporte} placeholder="ingrese importe" />)}
                  </Form.Item>
                </Col>

                {this.props.tieneCoaseguro && (
                  <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                    <Form.Item
                      label="Tipo cobro"
                      validateStatus={codTipoCobroError ? 'error' : ''}
                      help={codTipoCobroError || ''}
                    >
                      {getFieldDecorator('codTipoCobro', {
                        initialValue: this.props.selectedPago ? this.props.selectedPago.codTipoCobro : undefined,
                        rules: [
                          {
                            required: true,
                            message: ValidationMessage.REQUIRED
                          }
                        ]
                      })(
                        <Select
                          onChange={this.onChangeTipoCobro}
                          loading={this.props.chargeTypes.isLoading}
                          placeholder="Seleccione tipo cobro"
                        >
                          {this.props.chargeTypes.chargeTypes.map(chargeType => {
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

                {this.state.selectedTipoCobro === '3' && (
                  <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                    <Form.Item
                      label="Monto coaseguro"
                      required
                      validateStatus={mtoCoaseguroError ? 'error' : ''}
                      help={mtoCoaseguroError || ''}
                    >
                      {getFieldDecorator('mtoCoaseguro', {
                        initialValue: {
                          number: this.props.selectedPago ? this.props.selectedPago.mtoCoaseguro : undefined
                        },
                        rules: [{ validator: this.checkPrice }]
                      })(<PriceInputNoSymbol placeholder="Ingrese monto coaseguro" />)}
                    </Form.Item>
                  </Col>
                )}

                {this.state.selectedDocType !== COD_DOCTYPE_RECIBOHONORARIOS && (
                  <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                    <Form.Item label="Exonerado de IGV">
                      <Checkbox checked={this.state.checkIgv} onChange={this.handleChangeCheckIgv} />
                    </Form.Item>
                  </Col>
                )}

                {this.state.selectedDocType !== COD_DOCTYPE_RECIBOHONORARIOS && !this.state.checkIgv && (
                  <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                    <Form.Item
                      label="IGV"
                      required
                      validateStatus={mtoIgvError ? 'error' : ''}
                      help={mtoIgvError || ''}
                    >
                      {getFieldDecorator('mtoIgv', {
                        initialValue: {
                          number: this.props.selectedPago ? this.props.selectedPago.mtoIgv : undefined
                        },
                        rules: [{ validator: this.checkPrice }]
                      })(<PriceInputNoSymbol disabled onChange={this.onChangeIgv} placeholder="IGV" />)}
                    </Form.Item>
                  </Col>
                )}
                {this.state.selectedDocType === COD_DOCTYPE_RECIBOHONORARIOS && (
                  <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                    <Form.Item label="Exonerado de Retencion 4ta">
                      <Checkbox checked={this.state.checkRetencion4ta} onChange={this.handleChangeCheckRetencion4ta} />
                    </Form.Item>
                  </Col>
                )}

                {this.state.selectedDocType === COD_DOCTYPE_RECIBOHONORARIOS && !this.state.checkRetencion4ta && (
                  <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                    <Form.Item
                      label="Retenci&oacute;n 4ta"
                      validateStatus={mtoRetencionCuartaError ? 'error' : ''}
                      help={mtoRetencionCuartaError || ''}
                    >
                      {getFieldDecorator('mtoRetencionCuarta', {
                        initialValue: {
                          number: this.props.selectedPago ? this.props.selectedPago.mtoRetencionCuarta : undefined
                        },
                        rules: [{ validator: this.checkPrice }]
                      })(
                        <PriceInputNoSymbol
                          disabled
                          onChange={this.onChangeRetencionCuarta}
                          placeholder="Retención 4ta"
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
                        number: this.props.selectedPago ? this.props.selectedPago.mtoTotal : undefined
                      },
                      rules: [{ validator: this.checkPrice }]
                    })(<PriceInputNoSymbol disabled placeholder="Total" />)}
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

export default connect()(Form.create({ name: 'reposiciones_modal' })(ReposicionModal));
