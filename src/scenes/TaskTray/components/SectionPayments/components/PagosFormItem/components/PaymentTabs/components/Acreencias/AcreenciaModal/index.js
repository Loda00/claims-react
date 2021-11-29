import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { Form, Row, Col, Modal, Select, Input, DatePicker } from 'antd';
import { ValidationMessage } from 'util/validation';
import { ROLE_TYPE, CONSTANTS_APP } from 'constants/index';
import * as Utils from 'util/index';
import InsuredInput from 'components/InsuredInput';

import PriceInputNoSymbol from 'components/PriceInputNoSymbol';
import currency from 'currency.js';
import { flatten, map, isEmpty } from 'lodash';

class AcreenciaModal extends React.Component {
  checkResponsable = (rule, value, callback) => {
    if (value && value.terceroElegido && typeof value.terceroElegido.codExterno !== 'undefined') {
      callback();
      return;
    }

    callback(ValidationMessage.NOT_VALID);
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

  obtenerCoberturasDeForm = () => {
    const { ramosCoberturasForm } = this.props;
    return flatten(map(ramosCoberturasForm, 'coberturas'));
  };

  render() {
    const {
      form: { getFieldDecorator, getFieldsError, isFieldTouched, getFieldError },
      selectedPago,
      aseguradoPoliza,
      modalVisible,
      maintainLoading,
      onOk,
      titleModal,
      hideModal,
      monedaCertificado,
      coinTypes,
      dataSinister
    } = this.props;
    const responsableError = isFieldTouched('responsable') && getFieldError('responsable');

    const coberturasVisibles = this.obtenerCoberturasDeForm();

    const coberturaError = selectedPago
      ? getFieldError('codCobertura')
      : isFieldTouched('codCobertura') && getFieldError('codCobertura');

    const fecPagoError = selectedPago
      ? getFieldError('fecPago')
      : isFieldTouched('fecPago') && getFieldError('fecPago');
    const dscMotivosError = selectedPago
      ? getFieldError('dscMotivos')
      : isFieldTouched('dscMotivos') && getFieldError('dscMotivos');
    const codMonedaError = selectedPago
      ? getFieldError('codMoneda')
      : isFieldTouched('codMoneda') && getFieldError('codMoneda');

    const mtoSinIgvError = selectedPago
      ? getFieldError('mtoSinIgv')
      : isFieldTouched('mtoSinIgv') && getFieldError('mtoSinIgv');

    const asegurado = aseguradoPoliza;

    const esCoaseguro = !isEmpty(dataSinister) && dataSinister.indCargaMasiva === 'COA';

    const objResponsable = {
      codExterno: esCoaseguro
        ? dataSinister.codCoaseguroLider
        : selectedPago
        ? selectedPago.idResponsable
        : asegurado
        ? asegurado.codExterno
        : undefined,
      nomCompleto: esCoaseguro
        ? dataSinister.coaseguroLider
        : selectedPago
        ? selectedPago.nomResponsable
        : asegurado
        ? asegurado.nomCompleto
        : undefined
    };

    return (
      <div>
        <Row>
          <Modal
            centered
            visible={modalVisible}
            okText="Grabar"
            okButtonProps={{
              id: 'modal_acreencias_grabar',
              disabled: Utils.hasErrors(getFieldsError()),
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
                <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                  <Form.Item
                    label="Responsable de pago"
                    validateStatus={responsableError ? 'error' : ''}
                    help={responsableError || ''}
                  >
                    {getFieldDecorator('responsable', {
                      initialValue: {
                        terceroElegido: objResponsable
                      },
                      rules: [
                        { validator: this.checkResponsable },
                        {
                          required: true,
                          message: ValidationMessage.REQUIRED
                        }
                      ]
                    })(<InsuredInput roleType={ROLE_TYPE.responsable} />)}
                  </Form.Item>
                </Col>
                {!isEmpty(dataSinister) && dataSinister.indCargaMasiva === 'COA' && (
                  <Col>
                    <Row>
                      <Col xs={23} sm={12} md={12} lg={12} xl={12}>
                        <Form.Item label="Nro. Planilla" required>
                          <Input value={dataSinister.numPlanillaCoaseguro} disabled />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>
                )}
                <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                  <Form.Item
                    label="Cobertura"
                    validateStatus={coberturaError ? 'error' : ''}
                    help={coberturaError || ''}
                  >
                    {getFieldDecorator('codCobertura', {
                      initialValue: selectedPago
                        ? selectedPago.codCobertura
                        : coberturasVisibles.length === 1
                        ? coberturasVisibles[0].codCobert
                        : undefined,
                      rules: [{ required: true, message: ValidationMessage.REQUIRED }]
                    })(
                      <Select required placeholder="Seleccione cobertura">
                        {coberturasVisibles.map(coverage => {
                          return (
                            <Select.Option key={coverage.codCobert} value={coverage.codCobert}>
                              {`${coverage.codCobert} - ${coverage.descCobertura}`}
                            </Select.Option>
                          );
                        })}
                      </Select>
                    )}
                  </Form.Item>
                </Col>

                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                  <Form.Item
                    label="Motivo"
                    validateStatus={dscMotivosError ? 'error' : ''}
                    help={dscMotivosError || ''}
                  >
                    {getFieldDecorator('dscMotivos', {
                      initialValue: selectedPago ? selectedPago.dscMotivos : undefined,
                      rules: [{ required: true, message: ValidationMessage.REQUIRED }]
                    })(<Input.TextArea placeholder="Ingrese motivo" maxLength={1000} />)}
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
                      <Select disabled loading={coinTypes.isLoading} placeholder="Seleccione moneda">
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
                    label="Monto sin IGV"
                    required
                    validateStatus={mtoSinIgvError ? 'error' : ''}
                    help={mtoSinIgvError || ''}
                  >
                    {getFieldDecorator('mtoSinIgv', {
                      initialValue: {
                        number: selectedPago ? selectedPago.mtoSinIgv : undefined
                      },
                      rules: [{ validator: this.checkPrice }]
                    })(<PriceInputNoSymbol placeholder="Ingrese monto sin IGV" />)}
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                  <Form.Item label="Fecha" validateStatus={fecPagoError ? 'error' : ''} help={fecPagoError || ''}>
                    {getFieldDecorator('fecPago', {
                      initialValue: selectedPago ? moment.utc(selectedPago.fecPago) : moment(),
                      rules: [
                        {
                          required: true,
                          message: ValidationMessage.REQUIRED
                        }
                      ]
                    })(<DatePicker disabled format={CONSTANTS_APP.FORMAT_DATE} />)}
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

export default connect()(Form.create({ name: 'acreencias_modal' })(AcreenciaModal));
