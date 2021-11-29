import React from 'react';
import DireccionSiniestro from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DireccionSiniestro';

const initialState = {
  ideDirec: undefined,
  continente: undefined,
  pais: undefined,
  codCiudad: undefined,
  descCiudad: undefined,
  codEstado: undefined,
  descEstado: undefined,
  codMunicipio: undefined,
  descMunicipio: undefined,
  direc: undefined
};

class DireccionFormItem extends React.Component {
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

    const { siniestroInicial = {} } = this.props;
    const { indCargaMasiva } = siniestroInicial;
    if (indCargaMasiva === 'COA') {
      this.state = initialState;
    } else {
      this.state = {
        ideDirec: undefined
      };
    }
  }

  setDireccionElegida = values => {
    const { cambioFlagUbicacionModificada = false } = this.props;
    if (cambioFlagUbicacionModificada) {
      cambioFlagUbicacionModificada(true);
    }
    this.setState({ ...values });
    this.triggerChange({ ...values });
  };

  resetDireccionElegida = () => {
    this.setState(initialState);
    this.triggerChange(initialState);
  };

  triggerChange = changedValue => {
    // Should provide an event to pass value to Form.
    const { onChange } = this.props;
    if (onChange) {
      onChange(Object.assign({}, this.state, changedValue));
    }
  };

  render() {
    const { poliza, currentTask, disabledGeneral, onFocusHandler, direccionSiniestroDuplicado } = this.props;
    return (
      <DireccionSiniestro
        poliza={poliza}
        datosDireccionElegida={this.state}
        resetDireccionElegida={this.resetDireccionElegida}
        setDireccionElegida={this.setDireccionElegida}
        currentTask={currentTask}
        disabledGeneral={disabledGeneral}
        onFocusHandler={onFocusHandler}
        direccionSiniestroDuplicado={direccionSiniestroDuplicado}
      />
    );
  }
}

export default DireccionFormItem;
