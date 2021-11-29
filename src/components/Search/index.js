import React from 'react';
import { Button, Icon } from 'antd';
import { ROLE_TYPE } from 'constants/index';
import SearchModal from '../SearchInsured/index';

const initialState = {
  terceroElegido: null,
  terceroSeleccionado: null,
  modalVisible: false,
  saveButtonDisabled: true
};

class InsuredInputSearch extends React.Component {
  static getDerivedStateFromProps(nextProps) {
    // Should be a controlled component.
    if ('value' in nextProps) {
      return {
        ...(nextProps.value || {})
      };
    }
    return null;
  }

  constructor(props) {
    super(props);

    this.state = initialState;
    this.resetState = this.resetState.bind(this);
  }

  handleModalVisible = () => {
    this.resetState();
    this.setState({ modalVisible: true });
    this.triggerChange({ modalVisible: true });
  };

  triggerChange = changedValue => {
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(Object.assign({}, this.state, changedValue));
    }
  };

  onCancel = () => {
    this.setState({ terceroSeleccionado: null, modalVisible: false });
    this.triggerChange({ terceroSeleccionado: null, modalVisible: false });
  };

  onOk = async () => {
    const { reinicioCampos } = this.props;

    await this.setState({
      terceroElegido: this.state.terceroSeleccionado,
      modalVisible: false
    });
    await this.triggerChange({
      terceroElegido: this.state.terceroSeleccionado,
      modalVisible: false
    });

    if (reinicioCampos) {
      reinicioCampos();
    }
  };

  setDatosTercero = terceroSeleccionado => {
    this.setState({ saveButtonDisabled: false, terceroSeleccionado });
    this.triggerChange({ saveButtonDisabled: false, terceroSeleccionado });
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
      default:
        return 'Tercero';
    }
  };

  async resetState() {
    const { fromAseguradoFormItem, form } = this.props;
    if (fromAseguradoFormItem) {
      const { setFields } = form;
      setFields({ nuevoAsegurado: { value: undefined } });
    }
  }

  render() {
    const { disabledGeneral, cerrarSiniestroValue } = this.props;
    const roleTypeDesc = this.returnRoleTypeDescription(this.props.roleType);

    return (
      <React.Fragment>
        <Button
          onClick={this.handleModalVisible}
          disabled={disabledGeneral || cerrarSiniestroValue}
          onFocus={this.props.onFocusHandler}
        >
          {' '}
          Reemplazar &nbsp; {roleTypeDesc} <Icon type="search" />
        </Button>
        <SearchModal
          resetState={this.resetState}
          modalVisible={this.state.modalVisible}
          saveButtonDisabled={this.state.saveButtonDisabled}
          onCancel={this.onCancel}
          onOk={this.onOk}
          roleType={roleTypeDesc}
          setDatosTercero={this.setDatosTercero}
        />
      </React.Fragment>
    );
  }
}
export default InsuredInputSearch;
