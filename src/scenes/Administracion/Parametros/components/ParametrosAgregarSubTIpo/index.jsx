import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Modal, Row, Form, Col, Input, Select, Tooltip } from 'antd';

import { ValidationMessage } from 'util/validation';

const AgregarSubTipo = props => {
  const {
    abrirModal,
    cerrarModal,
    objetoParametro: { idRuta },
    form: { getFieldValue, getFieldError, validateFields, isFieldTouched, getFieldsError, getFieldDecorator },
    agregarSubParam,
    crearSubparamLoading
  } = props;

  const validateStatus = nombreDeCampo => {
    const campoError = isFieldTouched(nombreDeCampo) && getFieldError(nombreDeCampo);
    const status = campoError ? 'error' : '';
    return status;
  };

  const help = nombreDeCampo => {
    const campoHelp = isFieldTouched(nombreDeCampo) && getFieldError(nombreDeCampo);
    const helpResp = campoHelp || '';
    return helpResp;
  };

  const habilitarAgregarSubParam = fieldsError => {
    const errors = Object.keys(fieldsError).some(field => fieldsError[field]);
    let inputsParamsEmpty = true;

    if (
      getFieldValue('nombreRuta') &&
      getFieldValue('codigoParametro') &&
      getFieldValue('descripcion') &&
      getFieldValue('codigoTipo')
    )
      inputsParamsEmpty = false;

    if (!errors && !inputsParamsEmpty) return false;
    return true;
  };

  return (
    <Fragment>
      <Modal
        width="900px"
        visible={abrirModal}
        cancelText="Cancelar"
        okText="Guardar"
        onCancel={() => cerrarModal()}
        onOk={() => agregarSubParam(validateFields)}
        okButtonProps={{
          disabled: habilitarAgregarSubParam(getFieldsError()) || crearSubparamLoading
        }}
        destroyOnClose
      >
        <Form>
          <h2>Crear subtipo</h2>
          <Row gutter={24}>
            <Col xs={24} sm={12} md={12} lg={12} xl={12}>
              <Form.Item
                label="Nombre de ruta/IdBase"
                validateStatus={validateStatus('nombreRuta')}
                help={help('nombreRuta')}
              >
                {getFieldDecorator('nombreRuta', {
                  initialValue: idRuta
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={12} xl={12}>
              <Form.Item
                label="Código de parámetro"
                validateStatus={validateStatus('codigoParametro')}
                help={help('codigoParametro')}
              >
                {getFieldDecorator('codigoParametro', {
                  initialValue: '',
                  rules: [
                    {
                      required: true,
                      message: ValidationMessage.REQUIRED
                    }
                  ]
                })(<Input maxLength={100} placeholder="Ingrese código de parámetro" />)}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col xs={24} sm={12} md={12} lg={12} xl={12}>
              <Form.Item
                label="Descripción de parámetro"
                validateStatus={validateStatus('descripcion')}
                help={help('descripcion')}
              >
                {getFieldDecorator('descripcion', {
                  initialValue: '',
                  rules: [
                    {
                      required: true,
                      message: ValidationMessage.REQUIRED
                    }
                  ]
                })(<Input.TextArea maxLength={1000} placeholder="Ingrese descripción de parámetro" />)}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={12} xl={12}>
              <Form.Item
                label="Número de orden"
                validateStatus={validateStatus('numeroOrden')}
                help={help('numeroOrden')}
              >
                {getFieldDecorator('numeroOrden', {
                  initialValue: '',
                  rules: [{ pattern: /^[0-9]+$/, message: ValidationMessage.NOT_VALID }]
                })(<Input maxLength={5} placeholder="Ingrese número de orden" />)}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col xs={24} sm={12} md={12} lg={12} xl={12}>
              <Form.Item
                label="Descripción tooltip"
                validateStatus={validateStatus('descripcionTooltip')}
                help={help('descripcionTooltip')}
              >
                {getFieldDecorator('descripcionTooltip', {
                  initialValue: ''
                })(<Input maxLength={100} placeholder="Ingrese descripción tooltip" />)}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={12} xl={12}>
              <Form.Item
                label={<Tooltip title="0: Parámetro en Claims, 1: Parámetro en Acsel X">Código de tipo</Tooltip>}
                validateStatus={validateStatus('codigoTipo')}
                help={help('codigoTipo')}
              >
                {getFieldDecorator('codigoTipo', {
                  initialValue: '0',
                  rules: [{ required: true, message: ValidationMessage.REQUIRED }]
                })(
                  <Select maxLength={1} placeholder="Ingrese código tipo">
                    <Select.Option key="0" value="0">
                      0
                    </Select.Option>
                    <Select.Option key="1" value="1">
                      1
                    </Select.Option>
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </Fragment>
  );
};

const Main = connect(null)(Form.create({ name: 'modalAgregarSubTipo' })(AgregarSubTipo));

export default Main;
