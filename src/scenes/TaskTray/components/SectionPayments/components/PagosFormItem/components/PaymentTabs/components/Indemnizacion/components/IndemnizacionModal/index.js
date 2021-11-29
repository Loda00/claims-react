import React from 'react';
import { connect } from 'react-redux';
import { Form, Row, Col, Modal, Select, Input } from 'antd';
import currency from 'currency.js';
import { ROLE_TYPE, TASA_CAMBIO_PRECISION } from 'constants/index';
import SearchBeneficiaryModal from 'components/InsuredInput';
import { ValidationMessage } from 'util/validation';
import { hasErrors, showErrorMessage } from 'util/index';
import Cleave from 'cleave.js/react';
import PriceInputNoSymbol from 'components/PriceInputNoSymbol';
import { isEmpty } from 'lodash';

class IndemnizacionModal extends React.Component {
  state = {
    selectedTipoCobro: this.props.selectedPago ? this.props.selectedPago.codTipoCobro || undefined : undefined,
    selectedMoneda: this.props.selectedPago
      ? this.props.selectedPago.codMonedaPago || undefined
      : this.props.monedaCertificado,
    cargaInicialEdicion: true // para determinar el calculo del campo indemnizacionNeta al cargar el modal
  };

  async componentDidMount() {
    const { fetchPaymentTypes, fetchCoinTypes, fetchChargeTypes } = this.props;
    const promises = [];
    promises.push(fetchPaymentTypes());
    promises.push(fetchCoinTypes());
    promises.push(fetchChargeTypes());
    try {
      await Promise.all(promises);
    } catch (e) {
      showErrorMessage(e);
    }
  }

  checkBeneficiario = (rule, value, callback) => {
    if (value && value.terceroElegido && typeof value.terceroElegido.codExterno !== 'undefined') {
      callback();
      return;
    }

    callback(ValidationMessage.NOT_VALID);
  };

  checkPrice = (rule, value, callback) => {
    if (isEmpty(value.number)) {
      callback(ValidationMessage.REQUIRED);
      return;
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

  checkPriceDeducible = (rule, value, callback) => {
    const {
      dataSinister: { indCargaMasiva }
    } = this.props;
    const esCMCoaseguro = indCargaMasiva === 'COA';

    if (esCMCoaseguro) {
      callback();
      return;
    }

    if (isEmpty(value.number)) {
      callback(ValidationMessage.REQUIRED);
      return;
    }

    if (Number.isNaN(Number(value.number))) {
      callback(ValidationMessage.NOT_VALID);
      return;
    }

    if (currency(value.number).value < 0) {
      callback('El monto debe ser mayor o igual a cero');
      return;
    }
    callback();
  };

  checkPriceDeducibleCoa = (rule, value, callback) => {
    const {
      form: { validateFields }
    } = this.props;

    if (isEmpty(value.number)) {
      callback(ValidationMessage.REQUIRED);
      return;
    }

    if (Number.isNaN(Number(value.number))) {
      callback(ValidationMessage.NOT_VALID);
      return;
    }

    if (currency(value.number).value < 0) {
      callback('El monto debe ser mayor o igual a cero');
      return;
    }
    validateFields(['']);
    callback();
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

  onChangeIndemnizacionBruta = value => {
    this.setState({ cargaInicialEdicion: false });
  };

  onChangeDeducible = value => {
    this.setState({ cargaInicialEdicion: false });
  };

  onChangeMontoCoaseguro = value => {
    this.setState({ cargaInicialEdicion: false });
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
      form: { setFieldsValue }
    } = this.props;
    const { selectedMoneda } = this.state;
    if (selectedMoneda !== value && !tasaCambio[`${selectedMoneda}-${value}`]) {
      showErrorMessage('No se encuentra una tasa de cambio, por lo tanto no puede cambiar de moneda');
      setTimeout(() => {
        setFieldsValue({ monedaPago: selectedMoneda });
      }, 0);
      return;
    }
    this.setState({ selectedMoneda: value });
  };

  checkIndemnizacionBruta = (rule, value, callback) => {
    const {
      dataSinister: { indCargaMasiva },
      form: { validateFields }
    } = this.props;

    const esCMCoaseguro = indCargaMasiva === 'COA';

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
        form: { getFieldValue },
        coberturasForm,
        monedaCertificado,
        selectedPago,
        tasaCambio
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

      const { codCobertura, mtoIndemnizacionBruta, codMonedaPago } = selectedPago || {};

      if (codCobertura === getFieldValue('cobertura')) {
        const mtoTasaCambioMontoSeleccionado =
          selectedMoneda &&
          codMonedaPago &&
          selectedMoneda !== codMonedaPago &&
          tasaCambio[`${codMonedaPago}-${selectedMoneda}`]
            ? tasaCambio[`${codMonedaPago}-${selectedMoneda}`].tasa
            : 1;

        const mtoTotalConvertido = currency(mtoIndemnizacionBruta, {
          precision: TASA_CAMBIO_PRECISION
        }).multiply(mtoTasaCambioMontoSeleccionado, {
          precision: TASA_CAMBIO_PRECISION
        }).value;

        saldo = currency(saldoPendienteCobertura, {
          precision: TASA_CAMBIO_PRECISION
        })
          .multiply(mtoTasaCambioReserva, { precision: TASA_CAMBIO_PRECISION })
          .add(mtoTotalConvertido).value;
      }

      if (currency(value.number).value > currency(saldo).value) {
        callback('No debe ser mayor al saldo pendiente');
        return;
      }
    }

    if (esCMCoaseguro) {
      validateFields(['deducible']);
    }

    callback();
  };

  seleccionaBeneficiario = () => {
    const {
      dataSinister: { indCargaMasiva },
      dataPoliza: {
        poliza: [primeraPoliza]
      },
      selectedPago,
      aseguradoPoliza,
      aseguradoPoliza: { codExterno: codExtAsegurdo, nomCompleto: nomCompletoAsegurado }
    } = this.props;
    let codExterno;
    let nomCompleto;
    if (selectedPago) {
      codExterno = selectedPago.idBeneficiario;
      nomCompleto = selectedPago.beneficiario;
    } else if (indCargaMasiva === 'PT') {
      codExterno = primeraPoliza.idContratante;
      nomCompleto = primeraPoliza.nombreContratante;
    } else if (aseguradoPoliza) {
      codExterno = codExtAsegurdo;
      nomCompleto = nomCompletoAsegurado;
    } else {
      codExterno = undefined;
      nomCompleto = undefined;
    }

    return {
      codExterno,
      nomCompleto
    };
  };

  render() {
    const {
      form: { getFieldDecorator, getFieldsError, isFieldTouched, isFieldsTouched, getFieldError, getFieldValue },
      coberturasForm,
      monedaCertificado,
      selectedPago,
      tasaCambio,
      tipoConfirmarGestion,
      aseguradoPoliza: asegurado,
      dataSinister
    } = this.props;
    const { selectedMoneda } = this.state;

    const beneficiarioError = this.props.selectedPago
      ? ((getFieldValue('beneficiario') || {}).terceroElegido || {}).codExterno === asegurado.codExterno &&
        getFieldError('beneficiario')
      : (isFieldTouched('beneficiario') ||
          ((getFieldValue('beneficiario') || {}).terceroElegido || {}).codExterno === asegurado.codExterno) &&
        getFieldError('beneficiario');

    const coberturasVisibles = coberturasForm;

    let coberturaError;
    if (selectedPago || isEmpty(coberturasVisibles)) {
      coberturaError = getFieldError('cobertura');
    } else {
      coberturaError = isFieldTouched('cobertura') && getFieldError('cobertura');
    }

    // klrojas coaseguro
    const tipoPagoError = selectedPago
      ? getFieldError('nroPlanilla')
      : isFieldTouched('nroPlanilla') && getFieldError('nroPlanilla');

    const nroPlanillaError = selectedPago
      ? getFieldError('tipoPago')
      : isFieldTouched('tipoPago') && getFieldError('tipoPago');
    const monedaPagoError = selectedPago
      ? getFieldError('monedaPago')
      : isFieldTouched('monedaPago') && getFieldError('monedaPago');
    const indemnizacionBrutaError = selectedPago
      ? getFieldError('indemnizacionBruta')
      : isFieldTouched('indemnizacionBruta') && getFieldError('indemnizacionBruta');
    const deducibleError = selectedPago
      ? getFieldError('deducible')
      : isFieldTouched('deducible') && getFieldError('deducible');
    const tipoCobroError = selectedPago
      ? getFieldError('tipoCobro')
      : isFieldTouched('tipoCobro') && getFieldError('tipoCobro');
    const montoCoaseguroError = selectedPago
      ? getFieldError('montoCoaseguro')
      : isFieldTouched('montoCoaseguro') && getFieldError('montoCoaseguro');

    const currentIndemnizacionBruta = (getFieldValue('indemnizacionBruta') || {}).number;
    const currentDeducible = (getFieldValue('deducible') || {}).number;
    const currentMontoCoaseguro = (getFieldValue('montoCoaseguro') || {}).number;

    let currentIndemnizacionNeta = currency(currentIndemnizacionBruta)
      .subtract(currentDeducible)
      .subtract(currentMontoCoaseguro).value;

    if (
      typeof currentIndemnizacionBruta === 'undefined' &&
      typeof currentDeducible === 'undefined' &&
      typeof currentMontoCoaseguro === 'undefined'
    ) {
      currentIndemnizacionNeta = undefined;
    }

    const indemnizacionNegativa =
      typeof currentIndemnizacionNeta === 'undefined' ? false : currency(currentIndemnizacionNeta).value <= 0;

    const { saldoPendienteCobertura } = coberturasForm.find(cob => cob.codCobert === getFieldValue('cobertura')) || {};

    const mtoTasaCambioReserva =
      selectedMoneda && selectedMoneda !== monedaCertificado && tasaCambio[`${monedaCertificado}-${selectedMoneda}`]
        ? tasaCambio[`${monedaCertificado}-${selectedMoneda}`].tasa
        : 1;

    let saldo = currency(saldoPendienteCobertura, {
      precision: TASA_CAMBIO_PRECISION
    }).multiply(mtoTasaCambioReserva, {
      precision: TASA_CAMBIO_PRECISION
    }).value;

    const { codCobertura, mtoIndemnizacionBruta, codMonedaPago } = selectedPago || {};

    if (codCobertura === getFieldValue('cobertura')) {
      const mtoTasaCambioMontoSeleccionado =
        selectedMoneda &&
        codMonedaPago &&
        selectedMoneda !== codMonedaPago &&
        tasaCambio[`${codMonedaPago}-${selectedMoneda}`]
          ? tasaCambio[`${codMonedaPago}-${selectedMoneda}`].tasa
          : 1;

      const mtoTotalConvertido = currency(mtoIndemnizacionBruta, {
        precision: TASA_CAMBIO_PRECISION
      }).multiply(mtoTasaCambioMontoSeleccionado, {
        precision: TASA_CAMBIO_PRECISION
      }).value;

      saldo = currency(saldoPendienteCobertura, {
        precision: TASA_CAMBIO_PRECISION
      })
        .multiply(mtoTasaCambioReserva, { precision: TASA_CAMBIO_PRECISION })
        .add(mtoTotalConvertido).value;
    }

    let msgErrorIndemnizacion;
    if (indemnizacionNegativa) {
      msgErrorIndemnizacion = 'Debe ser mayor que cero';
    }

    const beneficiarioElegido = this.seleccionaBeneficiario();

    const esCoaseguro = !isEmpty(dataSinister) && dataSinister.indCargaMasiva === 'COA';
    console.log({ errores: getFieldsError(), currentIndemnizacionNeta });

    return (
      <div>
        <Row>
          <Modal
            centered
            visible={this.props.modalVisible}
            okText="Grabar"
            okButtonProps={{
              'data-cy': 'boton_grabar_indemnizacion',
              disabled: hasErrors(getFieldsError()) || indemnizacionNegativa,
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
                    label="Beneficiario"
                    validateStatus={beneficiarioError ? 'error' : ''}
                    help={beneficiarioError || ''}
                  >
                    {getFieldDecorator('beneficiario', {
                      initialValue: {
                        terceroElegido: {
                          codExterno: esCoaseguro ? dataSinister.codCoaseguroLider : beneficiarioElegido.codExterno,
                          nomCompleto: esCoaseguro ? dataSinister.coaseguroLider : beneficiarioElegido.nomCompleto
                        }
                      },
                      rules: [
                        { validator: this.checkBeneficiario },
                        {
                          required: true,
                          message: ValidationMessage.REQUIRED
                        }
                      ]
                    })(<SearchBeneficiaryModal roleType={ROLE_TYPE.BENEFICIARIO} />)}
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
                    required
                    label="Cobertura"
                    validateStatus={coberturaError ? 'error' : ''}
                    help={coberturaError || ''}
                    extra={
                      getFieldValue('cobertura') ? (
                        <div>
                          Saldo pendiente: {selectedMoneda}{' '}
                          <span data-cy="saldo_pendiente">{currency(saldo).format()}</span>
                        </div>
                      ) : (
                        ''
                      )
                    }
                    className={getFieldValue('cobertura') ? 'ant-item-with-extra' : ''}
                  >
                    {getFieldDecorator('cobertura', {
                      initialValue: this.props.selectedPago
                        ? this.props.selectedPago.codCobertura
                        : coberturasVisibles.length === 1
                        ? coberturasVisibles[0].codCobert
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
                  <Form.Item label="Tipo pago" validateStatus={tipoPagoError ? 'error' : ''} help={tipoPagoError || ''}>
                    {getFieldDecorator('tipoPago', {
                      initialValue: this.props.selectedPago ? this.props.selectedPago.codTipoPago : undefined,
                      rules: [
                        {
                          required: true,
                          message: ValidationMessage.REQUIRED
                        }
                      ]
                    })(
                      <Select loading={this.props.paymentTypes.isLoading} placeholder="Seleccione tipo pago">
                        {this.props.paymentTypes.paymentTypes.map(paymentType => {
                          return (
                            <Select.Option key={paymentType.valor} value={paymentType.valor}>
                              {paymentType.descripcion}
                            </Select.Option>
                          );
                        })}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                  <Form.Item
                    label="Moneda pago"
                    validateStatus={monedaPagoError ? 'error' : ''}
                    help={monedaPagoError || ''}
                  >
                    {getFieldDecorator('monedaPago', {
                      initialValue: this.props.selectedPago ? this.props.selectedPago.codMonedaPago : monedaCertificado,
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
                        placeholder="Seleccione moneda pago"
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
                    label="Indemnizaci&oacute;n bruta"
                    required
                    validateStatus={indemnizacionBrutaError ? 'error' : ''}
                    help={indemnizacionBrutaError || ''}
                  >
                    {getFieldDecorator('indemnizacionBruta', {
                      initialValue: {
                        number: this.props.selectedPago ? this.props.selectedPago.mtoIndemnizacionBruta : undefined
                      },
                      rules: [{ validator: this.checkIndemnizacionBruta }]
                    })(
                      <PriceInputNoSymbol
                        onChange={this.onChangeIndemnizacionBruta}
                        placeholder="Ingrese indemnizaci&oacute;n bruta"
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                  <Form.Item
                    label="Deducible"
                    required
                    validateStatus={deducibleError ? 'error' : ''}
                    help={deducibleError || ''}
                  >
                    {getFieldDecorator('deducible', {
                      initialValue: {
                        number: esCoaseguro
                          ? 0
                          : this.props.selectedPago
                          ? this.props.selectedPago.mtoDeducible
                          : undefined
                      },
                      rules: [{ validator: this.checkPriceDeducible }]
                    })(
                      <PriceInputNoSymbol
                        disabled={esCoaseguro}
                        onChange={this.onChangeDeducible}
                        placeholder="Ingrese deducible"
                      />
                    )}
                  </Form.Item>
                </Col>
                {this.props.tieneCoaseguro && (
                  <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                    <Form.Item
                      label="Tipo cobro"
                      validateStatus={tipoCobroError ? 'error' : ''}
                      help={tipoCobroError || ''}
                    >
                      {getFieldDecorator('tipoCobro', {
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
                      validateStatus={montoCoaseguroError ? 'error' : ''}
                      help={montoCoaseguroError || ''}
                    >
                      {getFieldDecorator('montoCoaseguro', {
                        initialValue: {
                          number: this.props.selectedPago ? this.props.selectedPago.mtoCoaseguro : undefined
                        },
                        rules: [{ validator: this.checkPrice }]
                      })(
                        <PriceInputNoSymbol
                          onChange={this.onChangeMontoCoaseguro}
                          placeholder="Ingrese monto coaseguro"
                        />
                      )}
                    </Form.Item>
                  </Col>
                )}
                <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                  <Form.Item
                    label="Indemnización Neta"
                    validateStatus={indemnizacionNegativa ? 'error' : ''}
                    help={indemnizacionNegativa ? msgErrorIndemnizacion : ''}
                  >
                    <Cleave
                      placeholder="Indemnización Neta"
                      options={{
                        numeral: true,
                        numeralDecimalScale: 2,
                        numeralDecimalMark: '.'
                      }}
                      disabled
                      style={{
                        width: '100%',
                        position: 'relative',
                        height: '32px',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        border: '1px solid #d9d9d9',
                        paddingRight: '11px',
                        paddingLeft: '11px'
                      }}
                      value={
                        (this.props.selectedPago || {}).mtoIndemnizacionNeta && this.state.cargaInicialEdicion
                          ? this.props.selectedPago.mtoIndemnizacionNeta
                          : currentIndemnizacionNeta
                      }
                    />
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

export default connect()(Form.create({ name: 'indemnizacion_modal' })(IndemnizacionModal));
