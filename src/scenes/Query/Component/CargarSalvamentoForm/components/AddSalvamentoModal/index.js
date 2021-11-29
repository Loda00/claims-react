import React from 'react';
import currency from 'currency.js';
import { Col, Form, Row, Input, Checkbox, Modal, DatePicker } from 'antd';
import { ValidationMessage } from 'util/validation';
import { CONSTANTS_APP } from 'constants/index';
import { hasErrors } from 'util/index';
import PriceInputNoSymbol from 'components/PriceInputNoSymbol';
import NumeroInput from 'components/numeroInput';
import moment from 'moment';
import { isEmpty } from 'lodash';

class AddSalvamentoModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      check: false,
      cargaInicialEdicion: true
    };
  }

  componentDidMount() {
    const {
      form: { validateFields }
    } = this.props;

    validateFields();
  }

  triggerChange = changedValue => {
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(Object.assign({}, this.state, changedValue));
    }
  };

  handleOk = () => {
    const {
      cambiarEstadoModal,
      form: { validateFields },
      datosSalvamentoState,
      datosSalvamentoDisabled,
      datosSalvamentoDelModal
    } = this.props;

    cambiarEstadoModal(false);

    validateFields((err, values) => {
      const salvDesistido =
        values.fecVenta &&
        values.comprador &&
        values.dniRucComprador &&
        values.nroLiquidacion &&
        values.mtoVentaDolares &&
        values.mtoPrecioDolares &&
        values.vendedor &&
        values.ejecutivolegal
          ? 'NO'
          : 'SI';

      if (salvDesistido === 'NO') {
        const salvamentoTable = {
          fecVenta: values.fecVenta ? values.fecVenta : '',
          comprador: values.comprador ? values.comprador : '',
          dniRucComprador: values.dniRucComprador ? values.dniRucComprador.number : '',
          nroLiquidacion: values.nroLiquidacion ? parseInt(values.nroLiquidacion.number) : '',
          mtoVentaDolares: values.mtoVentaDolares ? parseInt(values.mtoVentaDolares.number) : '',
          mtoPrecioDolares: values.mtoPrecioDolares ? parseInt(values.mtoPrecioDolares.number) : '',
          vendedor: values.vendedor ? values.vendedor : '',
          ejecutivoLegal: values.ejecutivolegal ? values.ejecutivolegal : '',
          obervacion: values.observacion ? values.observacion : '',
          salvDesistido,
          accion: 'n',
          key: datosSalvamentoState.length
        };
        datosSalvamentoDisabled([salvamentoTable]);
        const salvamentosNuevos = datosSalvamentoState.slice();
        salvamentosNuevos.push(salvamentoTable);
        datosSalvamentoDelModal(salvamentosNuevos);
      } else if (salvDesistido === 'SI') {
        const salvamentoTable = {
          fecVenta: '',
          comprador: '',
          dniRucComprador: '',
          nroLiquidacion: '',
          mtoVentaDolares: '',
          mtoPrecioDolares: '',
          vendedor: '',
          ejecutivoLegal: '',
          obervacion: values.observacion,
          salvDesistido,
          accion: 'n',
          key: datosSalvamentoState.length
        };
        datosSalvamentoDisabled([salvamentoTable]);
        const salvamentosNuevos = datosSalvamentoState.slice();
        salvamentosNuevos.push(salvamentoTable);
        datosSalvamentoDelModal(salvamentosNuevos);
      }
    });
  };

  handleCancel = () => {
    const { cambiarEstadoModal } = this.props;

    cambiarEstadoModal(false);
  };

  showModal = () => {
    const { cambiarEstadoModal } = this.props;

    cambiarEstadoModal(false);
  };

  afterClose = () => {
    const {
      form: { resetFields }
    } = this.props;

    resetFields();
    this.setState({
      check: false
    });
  };

  handleChange = e => {
    const {
      form: { resetFields, validateFields }
    } = this.props;

    resetFields();
    this.setState({ check: e.target.checked }, () => {
      validateFields(['observacion']);
    });
    if (!e.target.checked) {
      validateFields([
        'fecVenta',
        'comprador',
        'dniRucComprador',
        'nroLiquidacion',
        'mtoVentaDolares',
        'mtoPrecioDolares',
        'vendedor',
        'ejecutivolegal'
      ]);
    }
  };

  onChangeNumLiquidacion = value => {
    this.setState({ cargaInicialEdicion: false });
  };

  checkDocumento = (rule, value, callback) => {
    if (isEmpty(value.number)) {
      callback(ValidationMessage.REQUIRED);
      return;
    }

    if (Number.isNaN(Number(value.number))) {
      callback(ValidationMessage.NOT_VALID);
      return;
    }

    if (value.number.length !== 8 && value.number.length !== 11) {
      callback('DNI/RUC no válido');
      return;
    }

    if (currency(value.number).value <= 0) {
      callback('Documento incorrecto');
      return;
    }

    if (value.number.length === 11) {
      if (
        !value.number.startsWith('10') &&
        !value.number.startsWith('15') &&
        !value.number.startsWith('16') &&
        !value.number.startsWith('17') &&
        !value.number.startsWith('20')
      ) {
        callback('Formato incorrecto de RUC');
        return;
      }
    }
    callback();
  };

  checkLiquidacion = (rule, value, callback) => {
    if (isEmpty(value.number)) {
      callback(ValidationMessage.REQUIRED);
      return;
    }

    if (Number.isNaN(Number(value.number))) {
      callback(ValidationMessage.NOT_VALID);
      return;
    }

    if (currency(value.number).value <= 0) {
      callback('Debe ser mayor que cero');
      return;
    }

    if (value.number.startsWith('0')) {
      callback('No debe empezar con cero');
      return;
    }
    callback();
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

  render() {
    const { form, modalVisible } = this.props;

    const { check } = this.state;

    const { getFieldDecorator, isFieldTouched, getFieldError, getFieldsError } = form;
    const fechaventaError = isFieldTouched('fecVenta') && getFieldError('fecVenta');
    const compradorError = isFieldTouched('comprador') && getFieldError('comprador');
    const dniRucCompradorError = isFieldTouched('dniRucComprador') && getFieldError('dniRucComprador');
    const nLiquidacionError = isFieldTouched('nroLiquidacion') && getFieldError('nroLiquidacion');
    const montoVentaDolaresError = isFieldTouched('mtoVentaDolares') && getFieldError('mtoVentaDolares');
    const precioBaseDolaresError = isFieldTouched('mtoPrecioDolares') && getFieldError('mtoPrecioDolares');
    const vendedorError = isFieldTouched('vendedor') && getFieldError('vendedor');
    const ejecutivoLegalError = isFieldTouched('ejecutivolegal') && getFieldError('ejecutivolegal');
    const observacionError = isFieldTouched('observacion') && getFieldError('observacion');
    return (
      <React.Fragment>
        <Modal
          visible={modalVisible}
          cancelText="Cancelar"
          onCancel={this.handleCancel}
          okText="Agregar"
          onOk={this.handleOk}
          okButtonProps={{ disabled: hasErrors(getFieldsError()) }}
          afterClose={this.afterClose}
          maskClosable={false}
          width="980px"
        >
          <Form>
            <h2>Cargar salvamento</h2>
            <Row gutter={24}>
              <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                <Form.Item
                  label="Fecha venta"
                  validateStatus={fechaventaError ? 'error' : ''}
                  help={fechaventaError || ''}
                >
                  {getFieldDecorator('fecVenta', {
                    initialValue: !check ? moment() : null,
                    rules: [
                      {
                        required: !check,
                        message: ValidationMessage.REQUIRED
                      }
                    ]
                  })(<DatePicker format={CONSTANTS_APP.FORMAT_DATE} disabled={check} />)}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                <Form.Item label="Comprador" validateStatus={compradorError ? 'error' : ''} help={compradorError || ''}>
                  {getFieldDecorator('comprador', {
                    // validateTrigger: 'onBlur',
                    rules: [
                      {
                        required: !check,
                        message: ValidationMessage.REQUIRED
                      },
                      {
                        type: 'string',
                        message: ValidationMessage.NOT_VALID,
                        whitespace: true,
                        pattern: /^[a-za-zñáéíóúäëïöüA-Za-zÑÁÉÍÓÚÄËÏÖÜ0-9-. ]+$/
                      }
                    ]
                  })(<Input placeholder="Ingrese comprador" disabled={check} />)}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                <Form.Item
                  label="DNI/RUC comprador"
                  validateStatus={dniRucCompradorError ? 'error' : ''}
                  help={dniRucCompradorError || ''}
                >
                  {getFieldDecorator('dniRucComprador', {
                    // validateTrigger: 'onBlur',
                    initialValue: {
                      number: ''
                    },
                    rules: [
                      {
                        // required: !check, message: ValidationMessage.REQUIRED,
                        validator: this.checkDocumento,
                        required: !check
                      }
                      /* ,{
                      type: 'string', message: ValidationMessage.NOT_VALID, pattern: /^(\d{8}|\d{11})$/
                    } */
                    ]
                  })(<NumeroInput placeholder="Ingrese DNI/RUC" disabled={check} />)}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                <Form.Item
                  label="N° Liquidaci&oacute;n"
                  validateStatus={nLiquidacionError ? 'error' : ''}
                  help={nLiquidacionError || ''}
                >
                  {getFieldDecorator('nroLiquidacion', {
                    // validateTrigger: 'onBlur',
                    initialValue: {
                      number: ''
                    },
                    rules: [
                      {
                        validator: this.checkLiquidacion,
                        required: !check
                      } /* ,
                    {
                      type: 'string', message: ValidationMessage.NOT_VALID, pattern: /^\d{11}$/
                    } */
                    ]
                  })(
                    <NumeroInput
                      placeholder="Ingrese número liquidación"
                      disabled={check}
                      onChange={this.onChangeNumLiquidacion}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                <Form.Item
                  label="Monto venta en d&oacute;lares"
                  validateStatus={montoVentaDolaresError ? 'error' : ''}
                  help={montoVentaDolaresError || ''}
                >
                  {getFieldDecorator('mtoVentaDolares', {
                    // validateTrigger: 'onBlur',
                    initialValue: {
                      number: ''
                    },
                    rules: [
                      {
                        // required: !check, message: ValidationMessage.REQUIRED,
                        validator: this.checkPrice,
                        required: !check
                      }
                    ]
                  })(<PriceInputNoSymbol disabled={check} placeholder="Ingrese monto" />)}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                <Form.Item
                  label="Precio base en d&oacute;lares"
                  validateStatus={precioBaseDolaresError ? 'error' : ''}
                  help={precioBaseDolaresError || ''}
                >
                  {getFieldDecorator('mtoPrecioDolares', {
                    // validateTrigger: 'onBlur',
                    initialValue: {
                      number: ''
                    },
                    rules: [
                      {
                        // required: !check, message: ValidationMessage.REQUIRED,
                        validator: this.checkPrice,
                        required: !check
                      }
                    ]
                  })(<PriceInputNoSymbol placeholder="Ingrese precio" disabled={check} />)}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                <Form.Item label="Vendedor" validateStatus={vendedorError ? 'error' : ''} help={vendedorError || ''}>
                  {getFieldDecorator('vendedor', {
                    // validateTrigger: 'onBlur',
                    rules: [
                      {
                        required: !check,
                        message: ValidationMessage.REQUIRED
                      },
                      {
                        type: 'string',
                        message: ValidationMessage.NOT_VALID,
                        whitespace: true,
                        pattern: /^[a-za-zñáéíóúäëïöüA-Za-zÑÁÉÍÓÚÄËÏÖÜ0-9-. ]+$/
                      }
                    ]
                  })(<Input placeholder="Ingrese vendedor" disabled={check} />)}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                <Form.Item
                  label="Ejecutivo legal"
                  validateStatus={ejecutivoLegalError ? 'error' : ''}
                  help={ejecutivoLegalError || ''}
                >
                  {getFieldDecorator('ejecutivolegal', {
                    // validateTrigger: 'onBlur',
                    rules: [
                      {
                        required: !check,
                        message: ValidationMessage.REQUIRED
                      },
                      {
                        type: 'string',
                        message: ValidationMessage.NOT_VALID,
                        whitespace: true,
                        pattern: /^[a-za-zñáéíóúäëïöüA-Za-zÑÁÉÍÓÚÄËÏÖÜ0-9. ]+$/
                      }
                    ]
                  })(<Input placeholder="Ingrese ejecutivo legal" disabled={check} />)}
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={8} lg={12} xl={12}>
                <Form.Item
                  label="Observaci&oacute;n"
                  validateStatus={observacionError ? 'error' : ''}
                  help={observacionError || ''}
                >
                  {getFieldDecorator('observacion', {
                    // validateTrigger: 'onBlur',
                    rules: [
                      {
                        required: check,
                        message: ValidationMessage.REQUIRED
                      },
                      {
                        type: 'string',
                        whitespace: true,
                        message: ValidationMessage.NOT_VALID
                      }
                      /* ,{
                      type: 'string', message: ValidationMessage.NOT_VALID, pattern: /^[a-za-zñáéíóúäëïöüA-Za-zÑÁÉÍÓÚÄËÏÖÜ0-9]+$/
                    } */
                    ]
                  })(<Input />)}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                <Form.Item label="Salvamento desistido">
                  <Checkbox checked={check} onChange={this.handleChange} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </React.Fragment>
    );
  }
}

export default Form.create({ name: 'add_salvamento_modal' })(AddSalvamentoModal);
