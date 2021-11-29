import React from 'react';
import DatosCobertura from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DatosCobertura';

const initialState = {
  coberturas: []
};

class CoberturaFormItem extends React.Component {
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

  setCoberturas = coberturasNuevas => {
    this.setState({ coberturas: coberturasNuevas });
    this.triggerChange({ coberturas: coberturasNuevas });
  };

  resetCoberturas = () => {
    const coberturasReseteadas = this.state.coberturas.map(cobertura => {
      return {
        ...cobertura,
        delete: true
      };
    });
    this.setState({ coberturas: coberturasReseteadas });
    this.triggerChange({ coberturas: coberturasReseteadas });
  };

  triggerChange = changedValue => {
    // Should provide an event to pass value to Form.
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(Object.assign({}, this.state, changedValue));
    }
  };

  render() {
    const { indCargaMasiva, form } = this.props;
    return (
      <DatosCobertura
        indCargaMasiva={indCargaMasiva}
        esCargaInicial={this.props.esCargaInicial}
        poliza={this.props.poliza}
        certificado={this.props.certificado}
        coberturasElegidas={this.state.coberturas}
        resetCoberturas={this.resetCoberturas}
        setCoberturas={this.setCoberturas}
        branches={this.props.branches}
        currentTask={this.props.currentTask}
        siniestroInicial={this.props.siniestroInicial}
        coberturasSiniestroDuplicado={this.props.coberturasSiniestroDuplicado}
        form={form}
      />
    );
  }
}

export default CoberturaFormItem;
