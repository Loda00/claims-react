import React, { Component, Fragment } from 'react';
import { Row, Input, Col, Card, Form } from 'antd';
import { ROLE_TYPE } from 'constants/index';
import ReplaceBrokerModal from 'components/Search';
import { ValidationMessage } from 'util/validation';

class CorredorFormItem extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.reinicioCampos = this.reinicioCampos.bind(this);
  }

  reinicioCampos() {
    const {
      form: { setFieldsValue }
    } = this.props;
    setFieldsValue({ ejecutivoCorredor: '', emailCorredorPoliza: '' });
  }

  render() {
    const {
      indCargaMasiva,
      corredor,
      indNotifCorredor,
      form: { getFieldDecorator, getFieldValue, getFieldError },
      currentTask,
      currentTask: { idTarea },
      disabledGeneral,
      cerrarSiniestroValue,
      esSiniestroPreventivo,
      flagModificar,
      tienePoliza,
      validacionBotonReemplazarCorredor: { habilitarBotonReemplazarCorredor, mostrarBotonReemplazarCorredor },
      validacionInputEjecutivoCorredor: { habilitarInputEjecutivoCorredor },
      validacionInputEmailCorredor: {
        requerirInputEmailCorredor,
        habilitarInputEmailCorredor,
        mostrarInputEmailCorredor
      }
    } = this.props;

    const nuevoCorredor =
      (getFieldValue('nuevoCorredor') && getFieldValue('nuevoCorredor').terceroElegido) || undefined;
    const boolHabilitarBotonReemplazarCorredor = habilitarBotonReemplazarCorredor({
      esSiniestroPreventivo,
      cerrarSiniestroValue
    });
    const boolMostraBotonReemplazarCorredor = mostrarBotonReemplazarCorredor({
      idTarea,
      flagModificar,
      tienePoliza
    });
    const boolHabilitarInputEjecutivoCorredor = habilitarInputEjecutivoCorredor({
      idTarea,
      esSiniestroPreventivo,
      cerrarSiniestroValue
    });

    const boolRequerirInputEmailCorredor = requerirInputEmailCorredor({
      idTarea,
      cerrarSiniestroValue,
      flagModificar,
      // klrojas cambio ---->
      indCargaMasiva
    });

    const boolHabilitarInputEmailCorredor = habilitarInputEmailCorredor({
      idTarea,
      esSiniestroPreventivo,
      flagModificar,
      cerrarSiniestroValue
    });
    const boolMostrarInputEmailCorredor = mostrarInputEmailCorredor({
      indNotifCorredor,
      idTarea,
      nuevoCorredor,
      flagModificar,
      emailCorredor: corredor.email
    });

    const tieneErrorEjecutivoCorredor = getFieldError(`ejecutivoCorredor`);
    return (
      <Fragment>
        <h3>Corredor</h3>
        <Card
          title={
            (boolMostraBotonReemplazarCorredor && (
              <Form.Item help="" validateStatus="">
                {getFieldDecorator('nuevoCorredor', {})(
                  <ReplaceBrokerModal
                    roleType={ROLE_TYPE.CORREDOR}
                    currentTask={currentTask}
                    disabledGeneral={disabledGeneral || !boolHabilitarBotonReemplazarCorredor}
                    cerrarSiniestroValue={cerrarSiniestroValue}
                    reinicioCampos={this.reinicioCampos}
                  />
                )}
              </Form.Item>
            )) ||
            ''
          }
        >
          <Row gutter={24}>
            <Col xs={24} sm={12} md={12} lg={12} xl={6}>
              <Form.Item label="C&oacute;digo de corredor">
                <span>{(nuevoCorredor && nuevoCorredor.codExterno) || corredor.codCorredor}</span>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={12} xl={6}>
              <Form.Item label="Corredor">
                <span>{(nuevoCorredor && nuevoCorredor.nomCompleto) || corredor.nombreCorredor}</span>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={12} xl={6}>
              <Form.Item
                help={tieneErrorEjecutivoCorredor ? ValidationMessage.NOT_VALID : ''}
                validateStatus={tieneErrorEjecutivoCorredor ? 'error' : ''}
                label="Ejecutivo corredor"
              >
                {getFieldDecorator('ejecutivoCorredor', {
                  validateTrigger: 'onBlur',
                  initialValue: (nuevoCorredor && '') || corredor.ejecutivoCorredor,
                  rules: [
                    {
                      type: 'string',
                      whitespace: true
                    }
                  ]
                })(<Input maxLength={100} disabled={disabledGeneral || !boolHabilitarInputEjecutivoCorredor} />)}
              </Form.Item>
            </Col>
            {boolMostrarInputEmailCorredor && (
              <Col xs={24} sm={12} md={12} lg={12} xl={6}>
                <Form.Item label="E-mail" required={boolRequerirInputEmailCorredor}>
                  {getFieldDecorator('emailCorredorPoliza', {
                    initialValue: (nuevoCorredor && '') || corredor.email,
                    rules: [
                      {
                        type: cerrarSiniestroValue ? 'string' : 'email',
                        message: ValidationMessage.NOT_VALID
                      },
                      {
                        required: boolRequerirInputEmailCorredor,
                        message: ValidationMessage.REQUIRED
                      }
                    ]
                  })(<Input disabled={disabledGeneral || !boolHabilitarInputEmailCorredor} />)}
                </Form.Item>
              </Col>
            )}
          </Row>
        </Card>
      </Fragment>
    );
  }
}

export default CorredorFormItem;
