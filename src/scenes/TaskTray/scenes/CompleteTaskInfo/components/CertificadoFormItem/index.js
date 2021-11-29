import React from 'react';
import SearchCertificado from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/SearchCertificado';

const initialState = {
  numCert: '',
  dscCert: '',
  codMonSumAseg: '',
  planilla: '',
  aplicacion: '',
  prima: 0,
  sumAseg: '',
  stsCert: '',
  ideDec: 0,
  fecIng: null,
  fecFin: null
};

class CertificadoFormItem extends React.Component {
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

  setCertificadoElegido = values => {
    this.setState({ ...values });
    this.triggerChange({ ...values });
  };

  resetCertificadoElegido = () => {
    this.setState(initialState);
    this.triggerChange(initialState);
  };

  triggerChange = changedValue => {
    // Should provide an event to pass value to Form.

    const onChange = this.props.onChange;
    if (onChange) {
      onChange(Object.assign({}, this.state, changedValue));
    }
  };

  render() {
    const {
      branches,
      indCargaMasiva,
      siniestroInicial,
      setValidarCoberturasFin,
      setValidarCoberturasInicio
    } = this.props;
    return (
      <SearchCertificado
        poliza={this.props.poliza}
        certificates={this.props.certificates}
        datosCertificadoElegido={this.state}
        setCertificadoElegido={this.setCertificadoElegido}
        resetCertificadoElegido={this.resetCertificadoElegido}
        form={this.props.form}
        currentTask={this.props.currentTask}
        siniestroInicial={siniestroInicial}
        indCargaMasiva={indCargaMasiva}
        branches={branches}
        setValidarCoberturasFin={setValidarCoberturasFin}
        setValidarCoberturasInicio={setValidarCoberturasInicio}
      />
    );
  }
}

export default CertificadoFormItem;
