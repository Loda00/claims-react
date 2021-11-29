import React from 'react';
import { connect } from 'react-redux';
import { Row, Col, Modal, Input, Form, Select, Spin } from 'antd';
import * as locationsActionCreator from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DireccionSiniestro/data/locations/actions';
import { hasErrors, showErrorMessage, isNotEmpty } from 'util/index';
import { ValidationMessage } from 'util/validation';

class AddDireccionModalForm extends React.Component {
  componentDidMount() {
    this.props.form.validateFields();
  }

  componentWillUnmount() {
    this.props.dispatch(locationsActionCreator.fetchLocationsReset());
  }

  handle = texto => {
    if (texto.length > 2) {
      this.props.dispatch(locationsActionCreator.fetchLocations(texto)).finally(resp => {
        if (this.props.errorLocations) {
          showErrorMessage(this.props.errorLocations.message);
        }
      });
    }
  };

  render() {
    const { visible, onCancel, onOk, form, loadingLocations } = this.props;

    const { getFieldDecorator, getFieldsError, isFieldTouched, getFieldError } = form;
    const departamentoProvinciaDistritoError =
      isFieldTouched('departamentoProvinciaDistrito') && getFieldError('departamentoProvinciaDistrito');
    const calleError = isFieldTouched('calle') && getFieldError('calle');

    const locations = this.props.locations;

    const dataSource = locations.map(address => {
      const dataItem = {
        value: `${address.codDepar}/${address.dscDepar}/${address.codProvincia}/${address.dscProvincia}/${address.codDistrito}/${address.dscDistrito}`,
        text: `${address.dscDepar}/${address.dscProvincia}/${address.dscDistrito}`
      };

      return dataItem;
    });

    const options = dataSource.map(d => <Select.Option key={d.value}>{d.text}</Select.Option>);

    const { codEstado, descEstado, codCiudad, descCiudad, codMunicipio, descMunicipio, direc } =
      this.props.direccionElegida || {};
    const tieneDepProvDist =
      isNotEmpty(codEstado) &&
      isNotEmpty(descEstado) &&
      isNotEmpty(codCiudad) &&
      isNotEmpty(descCiudad) &&
      isNotEmpty(codMunicipio) &&
      isNotEmpty(descMunicipio);

    const selectedOption = (
      <Select.Option
        key={`${codEstado}/${descEstado}/${codCiudad}/${descCiudad}/${codMunicipio}/${descMunicipio}`}
      >{`${descEstado}/${descCiudad}/${descMunicipio}`}</Select.Option>
    );

    return (
      <Modal
        centered
        okButtonProps={{ disabled: hasErrors(getFieldsError()) }}
        visible={visible}
        okText={this.props.isDireccionNotEmpty ? 'Modificar' : 'Agregar'}
        onOk={onOk}
        onCancel={onCancel}
        destroyOnClose
        maskClosable={false}
        width={700}
        afterClose={this.props.forceUpdateHandler}
      >
        <h2>{this.props.isDireccionNotEmpty ? 'Modificar Direcci\u00f3n' : 'Agregar Direcci\u00f3n'}</h2>
        <Form>
          <Row gutter={24}>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Form.Item
                label="Departamento/Provincia/Distrito"
                validateStatus={departamentoProvinciaDistritoError ? 'error' : ''}
                help={departamentoProvinciaDistritoError || ''}
              >
                {getFieldDecorator('departamentoProvinciaDistrito', {
                  initialValue: tieneDepProvDist
                    ? `${codEstado}/${descEstado}/${codCiudad}/${descCiudad}/${codMunicipio}/${descMunicipio}`
                    : undefined,
                  rules: [{ required: true, message: ValidationMessage.REQUIRED }]
                })(
                  <Select
                    showSearch
                    showArrow={false}
                    filterOption={false}
                    onSearch={this.handle}
                    placeholder="Ingresar distrito"
                    notFoundContent={loadingLocations ? <Spin size="small" /> : null}
                    maxLength={60}
                  >
                    {options.length > 0 ? options : tieneDepProvDist ? selectedOption : undefined}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Form.Item label="Dirección" validateStatus={calleError ? 'error' : ''} help={calleError || ''}>
                {getFieldDecorator('calle', {
                  initialValue: isNotEmpty(direc) ? direc : undefined,
                  rules: [{ required: true, whitespace: true, message: ValidationMessage.REQUIRED }]
                })(<Input placeholder="Ingrese dirección" maxLength={90} />)}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  const locations = state.scenes.taskTray.completeTaskInfo.components.direccionSiniestro.data.locations;
  return {
    locations: locations.locations,
    loadingLocations: locations.isLoading,
    errorLocations: locations.error,
    showScroll: state.services.device.scrollActivated
  };
}
export default connect(mapStateToProps)(Form.create({ name: 'form_in_modal' })(AddDireccionModalForm));
