import React from 'react';
import { connect } from 'react-redux';
import { Form, Row, Col, Input, Button, DatePicker, Select } from 'antd';
import { ROLE_TYPE, CONSTANTS_APP } from 'constants/index';
import { showErrorMessage, hasErrors, hasValues } from 'util/index';
import SearchAndInput from 'components/InsuredInput/index';

import * as taskTypeActionCreators from 'scenes/TaskTray/scenes/TaskTrayHome/data/taskTypes/actions';
import * as taskTableActionCreators from 'scenes/TaskTray/scenes/TaskTrayHome/data/taskTable/actions';
import * as productoActionCreators from 'scenes/data/productos/action';
import { getTaskTypes } from 'scenes/TaskTray/scenes/TaskTrayHome/data/taskTypes/reducer';
import { ValidationMessage } from 'util/validation';
import './styles.css';

class TaskTraySearchForm extends React.Component {
  componentDidMount() {
    const {
      dispatch,
      errorProducto,
      taskTypes,
      form: { validateFields }
    } = this.props;

    dispatch(taskTypeActionCreators.fetchTaskTypes()).finally(resp => {
      if (taskTypes.error) {
        showErrorMessage(taskTypes.error.message);
      } else {
        validateFields();
      }
    });

    dispatch(productoActionCreators.fetchProducts()).finally(resp => {
      if (errorProducto) {
        showErrorMessage(errorProducto.message);
      }
    });
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        const params = this.props.construirParams(values, 1);
        this.props.dispatch(taskTableActionCreators.updateFilter(values));
        this.props.dispatch(taskTableActionCreators.updatePage(1));
        try {
          await this.props.fetchTaskTable(params);
        } catch (error) {
          showErrorMessage(error);
        }
      }
    });
  };

  handleButton = (touched, hasErrors, values) => {
    if (!values || (touched && hasErrors)) {
      return true;
    }

    return false;
  };

  handleReset = async () => {
    const { tamanioPagina } = this.props;
    this.props.form.resetFields();
    this.props.dispatch(taskTableActionCreators.updateFilter({}));
    try {
      await this.props.fetchTaskTable({
        tamPag: tamanioPagina,
        numPag: 1
      });
    } catch (error) {
      showErrorMessage(error);
    }
  };

  render() {
    const {
      form: { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched, isFieldsTouched, getFieldsValue },
      producto,
      loadingProducto
    } = this.props;
    const numberSinisterError = isFieldTouched('numeroDeSiniestro') && getFieldError('numeroDeSiniestro');
    const numeroDeCasoError = isFieldTouched('numeroDeCaso') && getFieldError('numeroDeCaso');
    const numeroDePolizaError = isFieldTouched('numeroDePoliza') && getFieldError('numeroDePoliza');
    const fechaDeOcurrenciaError = isFieldTouched('fechaDeOcurrencia') && getFieldError('fechaDeOcurrencia');
    const fechaDeRegistroError = isFieldTouched('fechaDeRegistro') && getFieldError('fechaDeRegistro');
    const tareaError = isFieldTouched('tarea') && getFieldError('tarea');
    const sinLiderError = isFieldTouched('sinLider') && getFieldError('sinLider');
    const productosError = isFieldTouched('productos') && getFieldError('productos');

    const taskTypes = this.props.taskTypes.taskTypes;
    const optionItems = taskTypes.map(taskType => (
      <Select.Option key={taskType.idTarea} value={taskType.idTarea}>
        {taskType.descripcion}
      </Select.Option>
    ));

    const productoItems = producto.map(item => (
      <Select.Option key={item.codProd} value={item.codProd}>{`${item.codProd} - ${item.dscProd}`}</Select.Option>
    ));

    return (
      <div className="seccion_claims">
        <Form id="task-tray-search-form" onSubmit={this.handleSubmit}>
          <Row gutter={24}>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <Form.Item
                label="Número de siniestro"
                validateStatus={numberSinisterError ? 'error' : ''}
                help={numberSinisterError || ''}
              >
                {getFieldDecorator('numeroDeSiniestro', {
                  rules: [
                    {
                      type: 'string',
                      message: 'No válido / mínimo 4 digitos',
                      pattern: /^\d{4,}$/
                    }
                  ]
                })(<Input type="text" id="num" placeholder="Ingrese número" maxLength={1000} />)}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <Form.Item
                label="Número de caso"
                validateStatus={numeroDeCasoError ? 'error' : ''}
                help={numeroDeCasoError || ''}
              >
                {getFieldDecorator('numeroDeCaso', {
                  rules: [
                    {
                      type: 'string',
                      message: ValidationMessage.NOT_VALID,
                      pattern: /^[a-zA-Z0-9]*$/
                    }
                  ]
                })(<Input placeholder="Ingrese número" maxLength={1000} />)}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <Form.Item
                label="Número de póliza"
                validateStatus={numeroDePolizaError ? 'error' : ''}
                help={numeroDePolizaError || ''}
              >
                {getFieldDecorator('numeroDePoliza', {
                  rules: [
                    {
                      type: 'string',
                      message: 'No válido / mínimo 4 digitos',
                      pattern: /^\d{4,}$/
                    }
                  ]
                })(<Input placeholder="Ingrese número" maxLength={1000} />)}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <Form.Item label="Asegurado">
                {getFieldDecorator('asegurado', {
                  initialValue: {
                    terceroElegido: null,
                    terceroSeleccionado: null,
                    modalVisible: false,
                    saveButtonDisabled: true
                  }
                })(<SearchAndInput roleType={ROLE_TYPE.ASEGURADO} />)}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <Form.Item
                label="Fecha de ocurrencia"
                validateStatus={fechaDeOcurrenciaError ? 'error' : ''}
                help={fechaDeOcurrenciaError || ''}
              >
                {getFieldDecorator('fechaDeOcurrencia')(<DatePicker.RangePicker format={CONSTANTS_APP.FORMAT_DATE} />)}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <Form.Item
                label="Fecha de registro"
                validateStatus={fechaDeRegistroError ? 'error' : ''}
                help={fechaDeRegistroError || ''}
              >
                {getFieldDecorator('fechaDeRegistro')(<DatePicker.RangePicker format={CONSTANTS_APP.FORMAT_DATE} />)}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <Form.Item label="Tarea" validateStatus={tareaError ? 'error' : ''} help={tareaError || ''}>
                {getFieldDecorator('tarea')(
                  <Select loading={this.props.taskTypes.isLoading} placeholder="Seleccione tarea">
                    {optionItems}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <Form.Item
                label="N&uacute;mero siniestro l&iacute;der"
                validateStatus={sinLiderError ? 'error' : ''}
                help={sinLiderError || ''}
              >
                {getFieldDecorator('sinLider', {
                  rules: [{ type: 'string', message: 'No válido / mínimo 4 dígitos', pattern: /^\d{4,}$/ }]
                })(<Input placeholder="Ingrese n&uacute;mero de siniestro l&iacute;der" maxLength={30} />)}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <Form.Item label="Producto" validateStatus={productosError ? 'error' : ''} help={productosError || ''}>
                {getFieldDecorator('productos')(
                  <Select
                    showSearch
                    loading={loadingProducto}
                    placeholder="Ingrese c&oacute;digo - producto"
                    optionFilterProp="children"
                    filterOption={(inputValue, option) =>
                      option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                    }
                  >
                    {productoItems}
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Col span={24} style={{ textAlign: 'right', marginBottom: '15px' }}>
              <Button
                form="task-tray-search-form"
                key="submit"
                type="primary"
                htmlType="submit"
                disabled={this.handleButton(
                  isFieldsTouched(),
                  hasErrors(getFieldsError()),
                  hasValues(getFieldsValue())
                )}
              >
                Buscar
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>
                Limpiar
              </Button>
            </Col>
          </Form.Item>
        </Form>
      </div>
    );
  }
}

const mapStateToProps = state => {
  const taskTypes = getTaskTypes(state);
  const producto = state.scenes.data.producto;
  return {
    taskTypes,
    producto: producto.producto,
    loadingProducto: producto.isLoading,
    errorProducto: producto.error
  };
};

export default connect(mapStateToProps)(Form.create({ name: 'task-tray-search-form' })(TaskTraySearchForm));
