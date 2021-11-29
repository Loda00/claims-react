import React from 'react';
import { Input, Col, Button, Icon, Row } from 'antd';
import SearchModal from 'components/SearchInsured';
import _ from 'lodash';
import { ROLE_TYPE } from 'constants/index';

const initialState = {
  terceroElegido: null,
  terceroSeleccionado: null,
  modalVisible: false,
  saveButtonDisabled: true
};
class InsuredInputSearch extends React.Component {
  // ? --->
  static getDerivedStateFromProps(nextProps) {
    // Should be a controlled component.
    if ('value' in nextProps) {
      return {
        ...(nextProps.value || {})
      };
    }
    return null;
  }
  // <---

  constructor(props) {
    super(props);

    this.state = initialState;
  }

  // ?/--->
  triggerChange = changedValue => {
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(Object.assign({}, this.state, changedValue));
    }
  };

  // <---
  clearTercero = () => {
    this.setState({ terceroElegido: null });
    this.triggerChange({ terceroElegido: null });
  };

  returnRoleTypeDescription = roleType => {
    switch (roleType) {
      case ROLE_TYPE.ASEGURADO:
        return 'Asegurado';
      case ROLE_TYPE.CONTRATANTE:
        return 'Contratante';
      case ROLE_TYPE.CORREDOR:
        return 'Corredor';
      case ROLE_TYPE.BENEFICIARIO:
        return 'Beneficiario';
      case ROLE_TYPE.PROVEEDOR:
        return 'Proveedor';
      case ROLE_TYPE.AJUSTADOR:
        return 'Ajustador';
      case ROLE_TYPE.RESPONSABLE:
        return 'Responsable';
      default:
        return 'Tercero';
    }
  };

  handleModalVisible = () => {
    this.setState({ modalVisible: true });
    this.triggerChange({ modalVisible: true });
  };

  onCancel = () => {
    this.setState({ terceroSeleccionado: null, modalVisible: false });
    this.triggerChange({ terceroSeleccionado: null, modalVisible: false });
  };

  onOk = () => {
    this.setState({ terceroElegido: this.state.terceroSeleccionado, modalVisible: false });
    this.triggerChange({ terceroElegido: this.state.terceroSeleccionado, modalVisible: false });
  };

  setDatosTercero = terceroSeleccionado => {
    this.setState({ saveButtonDisabled: false, terceroSeleccionado });
    this.triggerChange({ saveButtonDisabled: false, terceroSeleccionado });
  };

  render() {
    const roleTypeDesc = this.returnRoleTypeDescription(this.props.roleType);
    const { nomCompleto } = this.state.terceroElegido || {};
    const suffix =
      this.state.terceroElegido && this.state.terceroElegido.codExterno ? (
        <Icon type="close-circle" style={{ color: 'rgba(0,0,0,.45)' }} onClick={this.clearTercero} />
      ) : null;
    return (
      <Row>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Input.Search
            disabled
            placeholder={`Busque ${_.toLower(roleTypeDesc)}`}
            value={nomCompleto}
            suffix={suffix}
            onSearch={this.handleModalVisible}
            enterButton={
              <Button
                id="modal_tercero_input_boton_buscar"
                type="primary"
                icon="search"
                onClick={this.handleModalVisible}
              />
            }
            maxLength={1000}
          />
        </Col>
        <SearchModal
          modalVisible={this.state.modalVisible}
          saveButtonDisabled={this.state.saveButtonDisabled}
          onCancel={this.onCancel}
          onOk={this.onOk}
          roleType={roleTypeDesc}
          setDatosTercero={this.setDatosTercero}
        />
      </Row>
    );
  }
}
export default InsuredInputSearch;
