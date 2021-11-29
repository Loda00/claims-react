import React from 'react';
import SearchPoliza from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/SearchPoliza';

const initialState = {
  idePol: '',
  dscProd: '',
  numPol: '',
  stsPol: '',
  nomAseg: '',
  fecIniVig: null,
  fecFinVig: null,
  detallePoliza: null,
  numPolLider: ''
};

class PolizaFormItem extends React.Component {
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
  }

  setPolizaElegida = (values, detallePoliza) => {
    this.setState({ ...values, detallePoliza });
    this.triggerChange({ ...values, detallePoliza });
  };

  triggerChange = changedValue => {
    // Should provide an event to pass value to Form.
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(Object.assign({}, this.state, changedValue));
    }
  };

  render() {
    const { policies, currentTask, siniestroInicial, polizaInicial, polizaLider } = this.props;

    return (
      <SearchPoliza
        policies={policies}
        datosPolizaElegida={this.state}
        setPolizaElegida={this.setPolizaElegida}
        currentTask={currentTask}
        siniestroInicial={siniestroInicial}
        polizaInicial={polizaInicial}
        polizaLider={polizaLider}
      />
    );
  }
}

export default PolizaFormItem;
