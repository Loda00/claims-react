import React from 'react';
import { connect } from 'react-redux';
import { Radio, Form, Row, Col, Modal, Select, Input } from 'antd';
import { ValidationMessage } from 'util/validation';
import { hasErrors, showErrorMessage } from 'util/index';
import * as coinTypesActionCreators from 'scenes/TaskTray/components/SectionPayments/data/coinTypes/actions';
import * as accountTypesActionCreators from 'scenes/TaskTray/components/SectionPayments/data/accountTypes/actions';
import * as entidadesActionCreators from 'scenes/TaskTray/components/SectionPayments/data/entidades/actions';

class CoordenadaModal extends React.Component {
  state = {
    selectedCodTipoPago: this.props.selectedPago ? this.props.selectedPago.codTipoPago || 'A' : 'A',
    selectedCodTipoCuenta: this.props.selectedPago ? this.props.selectedPago.codTipoCuenta || undefined : undefined,
    selectedCodEntidadFinanciera: this.props.selectedPago
      ? this.props.selectedPago.codEntidadFinanciera || undefined
      : undefined
  };

  async componentDidMount() {
    const promises = [];
    promises.push(this.props.dispatch(coinTypesActionCreators.fetchCoinTypes('CRG_TMONEDA')));
    promises.push(this.props.dispatch(accountTypesActionCreators.fetchAccountTypes('CRG_TCTAB')));
    promises.push(this.props.dispatch(entidadesActionCreators.fetchEntidades()));
    try {
      await Promise.all(promises);
    } catch (e) {
      showErrorMessage(e);
    }
  }

  handleCodTipoPago = e => {
    this.setState({ selectedCodTipoPago: e.target.value }, () => this.props.form.validateFields());
  };

  handleEntidadFinanciera = value => {
    this.setState({ selectedCodEntidadFinanciera: value }, () => this.props.form.validateFields(['nroCuenta']));
  };

  handleTipoCuenta = value => {
    this.setState({ selectedCodTipoCuenta: value }, () => this.props.form.validateFields(['nroCuenta']));
  };

  nroCuentaValidator = (rule, value, callback) => {
    if (!value) {
      callback(ValidationMessage.REQUIRED);
      return;
    }

    if (!/^[0-9]+$/.test(value)) {
      callback('Debe ingresar dígitos');
      return;
    }

    const codEntidad = this.state.selectedCodEntidadFinanciera;
    const codTipoCuenta = this.state.selectedCodTipoCuenta;

    // banco continental
    if (codEntidad === '000256' && value.length !== 20) {
      callback('El Nro. de Cuenta Ahorros/Corriente debe tener 20 dígitos');
      return;
    }
    /* banco de credito */ if (codEntidad === '000251' && codTipoCuenta === 'C' && value.length !== 13) {
      callback('El Nro. de Cuenta Corriente debe tener 13 dígitos');
      return;
    }
    if (codEntidad === '000251' && codTipoCuenta === 'A' && value.length !== 14) {
      callback('El Nro. de Cuenta de Ahorros debe tener 14 dígitos');
      return;
    }
    /* banco scotia */ if (codEntidad === '000255' && value.length !== 10) {
      callback('El Nro. de Cuenta Ahorros/Corriente debe tener 10 dígitos');
      return;
    }
    /* banco interbank */ if (codEntidad === '000252' && value.length !== 13) {
      callback('El Nro. de Cuenta Ahorros/Corriente debe tener 13 dígitos');
      return;
    }

    callback();
  };

  render() {
    const { getFieldDecorator, getFieldsError, isFieldTouched, getFieldError } = this.props.form;
    const tipoPagoError = this.props.selectedPago
      ? getFieldError('codTipoPago')
      : isFieldTouched('codTipoPago') && getFieldError('codTipoPago');
    const codEntidadFinancieraError = this.props.selectedPago
      ? getFieldError('codEntidadFinanciera')
      : isFieldTouched('codEntidadFinanciera') && getFieldError('codEntidadFinanciera');
    const codTipoCuentaError = this.props.selectedPago
      ? getFieldError('codTipoCuenta')
      : isFieldTouched('codTipoCuenta') && getFieldError('codTipoCuenta');
    const codMonedaError = this.props.selectedPago
      ? getFieldError('codMoneda')
      : isFieldTouched('codMoneda') && getFieldError('codMoneda');
    const nroCuentaError = this.props.selectedPago
      ? getFieldError('nroCuenta')
      : isFieldTouched('nroCuenta') && getFieldError('nroCuenta');

    return (
      <div>
        <Row>
          <Modal
            centered
            visible={this.props.modalVisible}
            okText="Grabar"
            okButtonProps={{
              id: 'modal_coordenadas_grabar',
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
                <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                  <Form.Item
                    label="Tipo de Pago"
                    validateStatus={tipoPagoError ? 'error' : ''}
                    help={tipoPagoError || ''}
                  >
                    {getFieldDecorator('codTipoPago', {
                      initialValue: this.props.selectedPago ? this.props.selectedPago.codTipoPago || 'A' : 'A',
                      rules: [{ required: true, message: ValidationMessage.REQUIRED }]
                    })(
                      <Radio.Group onChange={this.handleCodTipoPago}>
                        <Radio value="C">Cheque</Radio>
                        <Radio value="A">Abono</Radio>
                      </Radio.Group>
                    )}
                  </Form.Item>
                </Col>
                {this.state.selectedCodTipoPago === 'A' && (
                  <React.Fragment>
                    <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                      <Form.Item
                        label="Entidad financiera"
                        validateStatus={codEntidadFinancieraError ? 'error' : ''}
                        help={codEntidadFinancieraError || ''}
                      >
                        {getFieldDecorator('codEntidadFinanciera', {
                          initialValue:
                            this.props.selectedPago && this.props.selectedPago.codEntidadFinanciera
                              ? this.props.selectedPago.codEntidadFinanciera || undefined
                              : undefined,
                          rules: [
                            {
                              required: true,
                              message: ValidationMessage.REQUIRED
                            }
                          ]
                        })(
                          <Select
                            onChange={this.handleEntidadFinanciera}
                            loading={this.props.entidades.isLoading}
                            placeholder="Seleccione entidad financiera"
                          >
                            {this.props.entidades.entidades.map(entidad => {
                              return (
                                <Select.Option key={entidad.codigo} value={entidad.codigo}>
                                  {entidad.descr}
                                </Select.Option>
                              );
                            })}
                          </Select>
                        )}
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                      <Form.Item
                        label="Tipo cuenta"
                        validateStatus={codTipoCuentaError ? 'error' : ''}
                        help={codTipoCuentaError || ''}
                      >
                        {getFieldDecorator('codTipoCuenta', {
                          initialValue:
                            this.props.selectedPago && this.props.selectedPago.codTipoCuenta
                              ? this.props.selectedPago.codTipoCuenta || undefined
                              : undefined,
                          rules: [
                            {
                              required: true,
                              message: ValidationMessage.REQUIRED
                            }
                          ]
                        })(
                          <Select
                            onChange={this.handleTipoCuenta}
                            loading={this.props.accountTypes.isLoading}
                            placeholder="Seleccione tipo cuenta"
                          >
                            {this.props.accountTypes.accountTypes.map(accountType => {
                              return (
                                <Select.Option key={accountType.valor} value={accountType.valor}>
                                  {accountType.descripcion}
                                </Select.Option>
                              );
                            })}
                          </Select>
                        )}
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                      <Form.Item
                        label="Moneda"
                        validateStatus={codMonedaError ? 'error' : ''}
                        help={codMonedaError || ''}
                      >
                        {getFieldDecorator('codMoneda', {
                          initialValue:
                            this.props.selectedPago && this.props.selectedPago.codMoneda
                              ? this.props.selectedPago.codMoneda
                              : this.props.monedaCertificado,
                          rules: [
                            {
                              required: true,
                              message: ValidationMessage.REQUIRED
                            }
                          ]
                        })(
                          <Select loading={this.props.coinTypes.isLoading} placeholder="Seleccione moneda">
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
                        label="Nro Cuenta"
                        required
                        validateStatus={nroCuentaError ? 'error' : ''}
                        help={nroCuentaError || ''}
                      >
                        {getFieldDecorator('nroCuenta', {
                          initialValue:
                            this.props.selectedPago && this.props.selectedPago.nroCuenta
                              ? this.props.selectedPago.nroCuenta || undefined
                              : undefined,
                          rules: [
                            {
                              validator: this.nroCuentaValidator
                            }
                          ]
                        })(<Input placeholder="Ingrese nro cuenta" />)}
                      </Form.Item>
                    </Col>
                  </React.Fragment>
                )}
              </Row>
            </Form>
          </Modal>
        </Row>
      </div>
    );
  }
}

export default connect()(Form.create({ name: 'coordenadas_modal' })(CoordenadaModal));
