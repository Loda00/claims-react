import React from 'react';
import DatosCobertura from 'scenes/TaskTray/components/SectionDataCobertura/components/DatosCobertura/index';

class RamosCoberturasFormItem extends React.Component {
  state = {
    ramosCoberturas: []
  };

  static getDerivedStateFromProps(nextProps) {
    if ('value' in nextProps) {
      return {
        ...(nextProps.value || {})
      };
    }
    return null;
  }

  setRamosCoberturas = array => {
    this.setState(prevState => ({
      ...prevState,
      ramosCoberturas: array
    }));
    this.triggerChange({
      ramosCoberturas: array
    });
  };

  triggerChange = changedValue => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(Object.assign({}, this.state, changedValue));
    }
  };

  render() {
    const {
      analizarForm,
      disabledGeneral,
      currentTask,
      numSiniestro,
      tarea,
      rechazoPago,
      idCaso,
      flagModificar,
      arrayUsers,
      dataSiniestro
    } = this.props;
    const { ramosCoberturas } = this.state;
    return (
      <DatosCobertura
        analizarForm={analizarForm}
        disabledGeneral={disabledGeneral}
        currentTask={currentTask}
        numSiniestro={numSiniestro}
        ramosCoberturas={ramosCoberturas || []}
        setRamosCoberturas={this.setRamosCoberturas}
        tarea={tarea}
        rechazoPago={rechazoPago}
        idCaso={idCaso}
        flagModificar={flagModificar}
        arrayUsers={arrayUsers}
        dataSiniestro={dataSiniestro}
      />
    );
  }
}

export default RamosCoberturasFormItem;
