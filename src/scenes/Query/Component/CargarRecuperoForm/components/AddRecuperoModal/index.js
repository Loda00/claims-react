import React from 'react';
import { Modal, Col, Form, Row, Input, Checkbox, DatePicker, notification } from 'antd';
import moment from 'moment';
import { isEmpty } from 'lodash';
import { ValidationMessage } from 'util/validation';
import { CONSTANTS_APP } from 'constants/index';
import { hasErrors } from 'util/index';
import PriceInputNoSymbol from 'components/PriceInputNoSymbol';
import NumeroInput from 'components/numeroInput';
import currency from 'currency.js';

/*
function hasErrors(fieldsError) {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
  }

  */

class AddRecuperoModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      check: false
      // modalVisible: false,
    };
  }

  componentDidMount() {
    const {
      form: { validateFields }
    } = this.props;

    validateFields();
  }

  handleOk = () => {
    const { cambiarEstadoModal } = this.props;

    cambiarEstadoModal(false);
    // this.setState({
    //     modalVisible: false
    // })
    const { form, datosRecuperoState, datosRecuperoDelModal, datosRecuperoDisabled } = this.props;
    form.validateFields((err, values) => {
      const seDesiste =
        !isEmpty(values.fechaingresorecupero) &&
        !isEmpty(values.demandado) &&
        !isEmpty(values.dnirucdemandado) &&
        !isEmpty(values.nLiquidacion) &&
        !isEmpty(values.montorecuperodolares) &&
        !isEmpty(values.juridicoabogado) &&
        !isEmpty(values.ejecutivolegal)
          ? 'NO'
          : 'SI';

      if (seDesiste === 'NO') {
        const recuperoTable = {
          fechaRecupero: values.fechaingresorecupero ? values.fechaingresorecupero : '',
          demandado: values.demandado || '',
          docDemandado: values.dnirucdemandado ? values.dnirucdemandado.number : '',
          numeroLiquidacion: values.nLiquidacion ? parseInt(values.nLiquidacion.number) : '',
          montoDolares: values.montorecuperodolares ? parseInt(values.montorecuperodolares.number) : '',
          estadoJuridico: values.juridicoabogado || '',
          ejecutivoLegal: values.ejecutivolegal || '',
          recuperoDesistido: seDesiste,
          observacion: values.observacion || '',
          accion: 'n',
          key: datosRecuperoState.length
        };

        datosRecuperoDisabled([recuperoTable]);

        const recuperosNuevos = datosRecuperoState.slice();
        recuperosNuevos.push(recuperoTable);
        datosRecuperoDelModal(recuperosNuevos);
      } else if (seDesiste === 'SI') {
        const recuperoTable = {
          fechaRecupero: '',
          demandado: '',
          docDemandado: '',
          numeroLiquidacion: '',
          montoDolares: '',
          estadoJuridico: '',
          ejecutivoLegal: '',
          recuperoDesistido: seDesiste,
          observacion: values.observacion || '',
          accion: 'n',
          key: datosRecuperoState.length
        };

        datosRecuperoDisabled([recuperoTable]);

        const recuperosNuevos = datosRecuperoState.slice();
        recuperosNuevos.push(recuperoTable);
        datosRecuperoDelModal(recuperosNuevos);
      }
    });
  };

  handleCancel = () => {
    const { cambiarEstadoModal } = this.props;

    cambiarEstadoModal(false);
    /* this.setState({
            modalVisible: false
        }) */
  };

  showModal = () => {
    const { cambiarEstadoModal } = this.props;

    cambiarEstadoModal(true);

    /* this.setState({
            modalVisible: true
        }) */
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

  openNotificationRecupero = () => {
    notification.error({
      message: 'Completar campos',
      description: 'Tiene campos obligatorios por completar.'
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
      // this.setState({ check: e.target.checked}, () => {
      validateFields([
        'demandado',
        'dnirucdemandado',
        'nLiquidacion',
        'montorecuperodolares',
        'juridicoabogado',
        'ejecutivolegal'
      ]);
      // });
    }
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

  handleSubmitRecupero = e => {
    const {
      form: { validateFields }
    } = this.props;

    e.preventDefault();
    validateFields((err, values) => {
      if (err) {
        return true;
      }
      return false;
    });
  };

  render() {
    const {
      form,
      modalVisible
      // addRecuperoDisabled,
    } = this.props;

    const { check } = this.state;

    const { getFieldDecorator, getFieldsError, isFieldTouched, getFieldError } = form;
    const fechaingresorecuperoError = isFieldTouched('fechaingresorecupero') && getFieldError('fechaingresorecupero');
    const demandadoError = isFieldTouched('demandado') && getFieldError('demandado');
    const dnirucdemandadoError = isFieldTouched('dnirucdemandado') && getFieldError('dnirucdemandado');
    const nLiquidacionError = isFieldTouched('nLiquidacion') && getFieldError('nLiquidacion');
    const montorecuperodolaresError = isFieldTouched('montorecuperodolares') && getFieldError('montorecuperodolares');
    const juridicoabogadoError = isFieldTouched('juridicoabogado') && getFieldError('juridicoabogado');
    const ejecutivolegalError = isFieldTouched('ejecutivolegal') && getFieldError('ejecutivolegal');
    const observacionError = isFieldTouched('observacion') && getFieldError('observacion');

    return (
      <React.Fragment>
        {/* <Button
                        onClick={this.showModal}
                        disabled={addRecuperoDisabled}
                        style={{marginLeft: "10px"}}
                        type="primary"
                    >
                        Añadir recupero<Icon type="plus-circle" style={{fontSize:"15px"}}/>
                    </Button> */}
        <Modal
          visible={modalVisible}
          cancelText="Cancelar"
          onCancel={this.handleCancel}
          okText="Agregar"
          onOk={this.handleOk}
          okButtonProps={{
            disabled: hasErrors(getFieldsError()),
            htmlType: 'submit'
          }}
          width="980px"
          maskClosable={false}
          afterClose={this.afterClose}
        >
          <Form onSubmit={this.handleSubmitRecupero}>
            <h2>Cargar recupero</h2>
            <Row gutter={24}>
              <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                <Form.Item
                  label="Fecha ingreso recupero"
                  validateStatus={fechaingresorecuperoError ? 'error' : ''}
                  help={fechaingresorecuperoError || ' '}
                >
                  {getFieldDecorator('fechaingresorecupero', {
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
                <Form.Item label="Demandado" validateStatus={demandadoError ? 'error' : ''} help={demandadoError || ''}>
                  {getFieldDecorator('demandado', {
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
                        pattern: /^[a-za-zñáéíóúäëïöüA-Za-zÑÁÉÍÓÚÄËÏÖÜ0-9 ]+$/
                      }
                    ]
                  })(<Input placeholder="Ingrese demandado" disabled={check} maxLength={100} />)}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                <Form.Item
                  label="DNI/RUC demandado"
                  validateStatus={dnirucdemandadoError ? 'error' : ''}
                  help={dnirucdemandadoError || ''}
                >
                  {getFieldDecorator('dnirucdemandado', {
                    // validateTrigger: 'onBlur',
                    initialValue: {
                      number: ''
                    },
                    rules: [
                      {
                        // required: !check, message: ValidationMessage.REQUIRED,
                        validator: this.checkDocumento,
                        required: !check
                      } /* ,
                                  {
                                      type: 'string', message: ValidationMessage.NOT_VALID, pattern: /^(\d{8}|\d{11})$/
                                  } */
                    ]
                  })(<NumeroInput disabled={check} placeholder="Ingrese DNI/RUC" />)}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                <Form.Item
                  label="N° Liquidaci&oacute;n"
                  validateStatus={nLiquidacionError ? 'error' : ''}
                  help={nLiquidacionError || ''}
                >
                  {getFieldDecorator('nLiquidacion', {
                    // validateTrigger: 'onBlur',
                    initialValue: {
                      number: ''
                    },
                    rules: [
                      {
                        // required: !check, message: ValidationMessage.REQUIRED,
                        validator: this.checkLiquidacion,
                        required: !check
                      }
                      /* ,
                                  {
                                  type: 'string', message: ValidationMessage.NOT_VALID, pattern: /^[a-za-zñáéíóúäëïöüA-Za-zÑÁÉÍÓÚÄËÏÖÜ0-9 ]+$/
                                  } */
                    ]
                  })(<NumeroInput placeholder="Ingrese número liquidación" disabled={check} />)}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                <Form.Item
                  label="Monto recupero en d&oacute;lares"
                  validateStatus={montorecuperodolaresError ? 'error' : ''}
                  help={montorecuperodolaresError || ''}
                >
                  {getFieldDecorator('montorecuperodolares', {
                    // validateTrigger: 'onBlur',
                    initialValue: {
                      number: ''
                    },
                    rules: [
                      {
                        // required: !check , message: ValidationMessage.REQUIRED,
                        validator: this.checkPrice,
                        required: !check
                      }
                    ]
                  })(<PriceInputNoSymbol disabled={check} placeholder="Ingrese monto" />)}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                <Form.Item
                  label="Estudio Jur&iacute;dico/Abogado"
                  validateStatus={juridicoabogadoError ? 'error' : ''}
                  help={juridicoabogadoError || ''}
                >
                  {getFieldDecorator('juridicoabogado', {
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
                  })(<Input placeholder="Ingrese estudio Jurídico/Abogado" disabled={check} maxLength={100} />)}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                <Form.Item
                  label="Ejecutivo legal"
                  validateStatus={ejecutivolegalError ? 'error' : ''}
                  help={ejecutivolegalError || ''}
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
                  })(<Input placeholder="Ingrese ejecutivo legal" disabled={check} maxLength={100} />)}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                <Form.Item label="Recupero desistido">
                  <Checkbox checked={check} onChange={this.handleChange} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={12} lg={12} xl={12}>
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
                      /* ,
                                  {
                                      type: 'string', message: ValidationMessage.NOT_VALID, pattern: /^[a-za-zñáéíóúäëïöüA-Za-zÑÁÉÍÓÚÄËÏÖÜ0-9 ]+$/
                                  } */
                    ]
                  })(<Input placeholder="Ingrese observaci&oacute;n" maxLength={100} />)}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </React.Fragment>
    );
  }
}
export default Form.create({ name: 'add_recupero_modal' })(AddRecuperoModal);
