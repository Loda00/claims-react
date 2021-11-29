import React from 'react';
import { connect } from 'react-redux';
import { Form, Row, Col, Input, Button, Select, DatePicker } from 'antd';
import { CONSTANTS_APP } from 'constants/index';
import { showErrorMessage, hasErrors } from 'util/index';

import * as productActionCreators from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/SearchPoliza/data/products/actions';
import * as policyActionCreators from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/SearchPoliza/data/policies/actions';
import { ValidationMessage } from 'util/validation';

class FormSearchByProductoPoliza extends React.Component {
  componentWillUnmount() {
    this.props.dispatch(productActionCreators.fetchProductsReset());
  }

  componentDidMount() {
    this.props.form.validateFields();
    this.props.dispatch(productActionCreators.fetchProducts()).finally(resp => {
      if (this.props.errorProducts) {
        showErrorMessage(this.props.errorProducts.message);
      }
    });
  }

  handleSearch = e => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.setCurrentValidFormFields(values);
        this.props.dispatch(policyActionCreators.updatePage(1));
        this.props.dispatch(policyActionCreators.fetchPolicies(values)).finally(resp => {
          if (this.props.errorPolicies) {
            showErrorMessage(this.props.errorPolicies.message);
          }
        });
      }
    });
  };

  render() {
    const {
      form: { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched },
      siniestroInicial,
      products: productos,
      loadingExistingPolicy
    } = this.props;
    const productoError = isFieldTouched('producto') && getFieldError('producto');
    const numoDePolizaError = isFieldTouched('numoDePoliza') && getFieldError('numoDePoliza');
    const fechaOcurrenciaError = isFieldTouched('fechaOcurrencia') && getFieldError('fechaOcurrencia');

    const PRODUCTO_PT = '1103';
    let products = productos;

    if (siniestroInicial.indCargaMasiva === 'PT') {
      products = productos.filter(p => p.codProd === PRODUCTO_PT);
    }

    const productItems = products.map(product => (
      <Select.Option key={product.codProd} value={product.codProd}>
        {`${product.codProd} - ${product.dscProd}`}
      </Select.Option>
    ));

    return (
      <Col span={24}>
        <Form>
          <Row gutter={24}>
            <Col xs={24} sm={12} md={12} lg={12} xl={12}>
              <Form.Item label="Producto" validateStatus={productoError ? 'error' : ''} help={productoError || ''}>
                {getFieldDecorator('producto', {
                  initialValue: siniestroInicial.indCargaMasiva === 'PT' ? PRODUCTO_PT : undefined,
                  rules: [
                    {
                      required: true,
                      message: ValidationMessage.REQUIRED
                    }
                  ]
                })(
                  <Select
                    showSearch
                    loading={this.props.loadingProducts}
                    placeholder="Seleccione producto"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.props.children
                        .toString()
                        .toLowerCase()
                        .indexOf(input.toString().toLowerCase()) >= 0
                    }
                  >
                    {productItems}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={12} xl={12}>
              <Form.Item
                label="Número de póliza"
                validateStatus={numoDePolizaError ? 'error' : ''}
                help={numoDePolizaError || ''}
              >
                {getFieldDecorator('numoDePoliza', {
                  rules: [
                    {
                      type: 'string',
                      message: ValidationMessage.NOT_VALID,
                      pattern: /^\d{4,}$/
                    },
                    {
                      required: true,
                      message: ValidationMessage.REQUIRED
                    }
                  ]
                })(<Input placeholder="Ingrese número" onSubmit={this.hS} maxLength={30} />)}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={12} xl={12}>
              <Form.Item
                label="Fecha de ocurrencia"
                validateStatus={fechaOcurrenciaError ? 'error' : ''}
                help={fechaOcurrenciaError || ''}
              >
                {getFieldDecorator('fechaOcurrencia')(<DatePicker.RangePicker format={CONSTANTS_APP.FORMAT_DATE} />)}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Button
                style={{ marginLeft: 8 }}
                type="primary"
                onClick={this.handleSearch}
                disabled={hasErrors(getFieldsError()) || loadingExistingPolicy}
              >
                Buscar
              </Button>
            </Col>
          </Row>
        </Form>
      </Col>
    );
  }
}

function mapStateToProps(state) {
  const products = state.scenes.taskTray.completeTaskInfo.components.searchPoliza.data.products;
  return {
    products: products.products,
    loadingProducts: products.isLoading,
    errorProducts: products.error
  };
}
export default connect(mapStateToProps)(Form.create()(FormSearchByProductoPoliza));
