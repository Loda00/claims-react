import React from 'react';
import { connect } from 'react-redux';
import { Form, Col, Row, Input, Button, Modal, Select, Icon, Tooltip } from 'antd';

import { showModalError } from 'util/index';
import { CONSTANTS_APP } from 'constants/index';
import { ValidationMessage } from 'util/validation';

import * as crearParametrosCreators from 'scenes/Administracion/data/crearParametro/action';

import { getBuscarParametros } from 'scenes/Administracion/data/buscarParametros/reducer';
import { crearParametroLoading } from 'scenes/Administracion/data/crearParametro/reducer';

const alOkDeModalAgregarOEditarParametro = async (
  validateFields,
  crearParametro,
  alCancelarAgregarOEditarParametro,
  onOkAgregar
) => {
  try {
    const values = await validateFields();
    const response = await crearParametro(values);

    if (response.code === 'CRG-000') {
      Modal.success({
        title: 'Se creó el parámetro',
        content: response.message,
        centered: true,
        okText: 'Aceptar'
      });
      onOkAgregar();
      alCancelarAgregarOEditarParametro();
    } else showModalError(response.message);
  } catch (err) {
    showModalError(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
  }
};

const ParametrosAgregar = props => {
  const {
    idRutas,
    loading,
    form: { getFieldDecorator, isFieldTouched, getFieldError, validateFields, getFieldValue, getFieldsError },
    tituloParametroModal,
    modalParametroVisible,
    setearEstadoModalParametroVisibleATrueEnAgregar,
    alCancelarAgregarOEditarParametro,
    onOkAgregar,
    crearParamLoading,
    crearParametro
  } = props;

  const opciones = [...new Set(idRutas.map(param => param.idRuta.slice(0, param.idRuta.indexOf('.'))))].map(opcion => (
    <Select.Option key={opcion} value={opcion}>
      {opcion}
    </Select.Option>
  ));

  opciones.sort((a, b) => {
    if (a.props.value < b.props.value) {
      return -1;
    }
    if (a.props.value > b.props.value) {
      return 1;
    }
    return 0;
  });

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

  const habilitarBotonAgregar = fieldsError => {
    const errors = Object.keys(fieldsError).some(field => fieldsError[field]);
    let inputsParamsEmpty = true;

    if (
      getFieldValue('idRuta') &&
      getFieldValue('codParametro') &&
      getFieldValue('dscParametro') &&
      getFieldValue('codTipo')
    )
      inputsParamsEmpty = false;

    if (!errors && !inputsParamsEmpty) return false;
    return true;
  };

  return (
    <React.Fragment>
      <Button
        type="primary"
        style={{ textAlign: 'right', marginRight: '10px' }}
        onClick={() => setearEstadoModalParametroVisibleATrueEnAgregar()}
      >
        Crear
        <Icon type="plus-circle" />
      </Button>
      <Modal
        visible={modalParametroVisible}
        cancelText="Cancelar"
        onCancel={alCancelarAgregarOEditarParametro}
        okText={tituloParametroModal === 'A' ? 'Agregar' : 'Guardar'}
        onOk={() =>
          alOkDeModalAgregarOEditarParametro(
            validateFields,
            crearParametro,
            alCancelarAgregarOEditarParametro,
            onOkAgregar,
            getFieldValue
          )
        }
        okButtonProps={{
          disabled: habilitarBotonAgregar(getFieldsError()) || crearParamLoading || loading,
          loading: crearParamLoading || loading
        }}
        width="900px"
        destroyOnClose
      >
        <Form>
          <h2>Crear parámetro</h2>
          <Row gutter={24}>
            <Col xs={24} sm={12} md={12} lg={12} xl={12}>
              <Form.Item label="Nombre de ruta/ IdBase" validateStatus={validateStatus('idRuta')} help={help('idRuta')}>
                {getFieldDecorator('idRuta', {
                  rules: [{ required: true, message: ValidationMessage.REQUIRED }]
                })(
                  <Select
                    showSearch
                    loading={loading}
                    disabled={loading || crearParamLoading}
                    optionFilterProp="children"
                    placeholder="Nombre de ruta/IdBase"
                    filterOption={(input, option) =>
                      option.props.children.toUpperCase().indexOf(input.toUpperCase()) !== -1
                    }
                  >
                    {opciones}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={12} xl={12}>
              <Form.Item
                label="Código de parámetro"
                validateStatus={validateStatus('codParametro')}
                help={help('codParametro')}
              >
                {getFieldDecorator('codParametro', {
                  initialValue: '',
                  rules: [{ required: true, message: ValidationMessage.REQUIRED }]
                })(<Input maxLength={100} disabled={crearParamLoading} placeholder="Ingrese código de parámetro" />)}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col xs={24} sm={12} md={12} lg={12} xl={12}>
              <Form.Item
                label="Descripción de parámetro"
                validateStatus={validateStatus('dscParametro')}
                help={help('dscParametro')}
              >
                {getFieldDecorator('dscParametro', {
                  initialValue: '',
                  rules: [{ required: true, message: ValidationMessage.REQUIRED }]
                })(
                  <Input.TextArea
                    maxLength={1000}
                    disabled={crearParamLoading}
                    placeholder="Ingrese descripción de parámetro"
                  />
                )}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={12} xl={12}>
              <Form.Item label="Número de orden" validateStatus={validateStatus('numOrden')} help={help('numOrden')}>
                {getFieldDecorator('numOrden', {
                  initialValue: '',
                  rules: [{ pattern: /^[0-9]+$/, message: ValidationMessage.NOT_VALID }]
                })(<Input maxLength={5} disabled={crearParamLoading} placeholder="Ingrese número de orden" />)}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col xs={24} sm={12} md={12} lg={12} xl={12}>
              <Form.Item
                label="Descripción tooltip"
                validateStatus={validateStatus('dscTooltip')}
                help={help('dscTooltip')}
              >
                {getFieldDecorator('dscTooltip', {
                  initialValue: ''
                })(<Input maxLength={100} disabled={crearParamLoading} placeholder="Ingrese descripción tooltip" />)}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={12} xl={12}>
              <Form.Item
                label={<Tooltip title="0: Parámetro en Claims, 1: Parámetro en Acsel X">Código de tipo</Tooltip>}
                validateStatus={validateStatus('codTipo')}
                help={help('codTipo')}
              >
                {getFieldDecorator('codTipo', {
                  initialValue: '0',
                  rules: [{ required: true, message: ValidationMessage.REQUIRED }]
                })(
                  <Select maxLength={1} disabled={crearParamLoading} placeholder="Ingrese código tipo">
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
    </React.Fragment>
  );
};

const mapStateToProps = state => {
  const buscarParametros = getBuscarParametros(state);

  return {
    buscarParametros,
    loadingBuscarParametros: buscarParametros.isLoading,

    crearParamLoading: crearParametroLoading(state)
  };
};

const mapDispatchToProps = dispatch => ({
  crearParametro: values => dispatch(crearParametrosCreators.fetchCrearParametro(values))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Form.create()(ParametrosAgregar));
