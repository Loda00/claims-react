import React from 'react';
import { Form, Col, Row, Select } from 'antd';

const ParametrosForm = props => {
  const {
    idRutas,
    manejadorSelectParametros,
    form: { getFieldDecorator },
    loading
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

  return (
    <div className="seccion_claims">
      <Form>
        <Row gutter={24}>
          <Col xs={24} sm={19} md={13} lg={12} xl={11}>
            <Form.Item label="Nombre Ruta/IdBase">
              {getFieldDecorator('idRuta')(
                <Select
                  showSearch
                  loading={loading}
                  disabled={loading}
                  optionFilterProp="children"
                  placeholder="Seleccione una ruta"
                  onChange={value => manejadorSelectParametros(value)}
                  filterOption={(input, option) =>
                    option.props.children.toUpperCase().indexOf(input.toUpperCase()) !== -1
                  }
                >
                  {opciones}
                </Select>
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default Form.create()(ParametrosForm);
