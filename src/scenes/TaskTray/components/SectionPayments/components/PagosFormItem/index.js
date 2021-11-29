import React from 'react';
import PaymentTabs from 'scenes/TaskTray/components/SectionPayments/components/PagosFormItem/components/PaymentTabs';

const initialState = {
  indemnizaciones: [],
  honorarios: [],
  otrosConceptos: [],
  reposiciones: [],
  acreencias: [],
  coordenadas: [],
  pagosObservados: []
};

class PagosFormItem extends React.Component {
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

  setIndemnizaciones = array => {
    this.setState(prevState => ({
      ...prevState,
      indemnizaciones: array
    }));
    this.triggerChange({
      indemnizaciones: array
    });
  };

  setHonorarios = array => {
    this.setState(prevState => ({
      ...prevState,
      honorarios: array
    }));
    this.triggerChange({
      honorarios: array
    });
  };

  setOtrosConceptos = array => {
    this.setState(prevState => ({
      ...prevState,
      otrosConceptos: array
    }));
    this.triggerChange({
      otrosConceptos: array
    });
  };

  setReposiciones = array => {
    this.setState(prevState => ({
      ...prevState,
      reposiciones: array
    }));
    this.triggerChange({
      reposiciones: array
    });
  };

  setAcreencias = array => {
    this.setState(prevState => ({
      ...prevState,
      acreencias: array
    }));
    this.triggerChange({
      acreencias: array
    });
  };

  setCoordenadas = array => {
    this.setState(prevState => ({
      ...prevState,
      coordenadas: array
    }));
    this.triggerChange({
      coordenadas: array
    });
  };

  triggerChange = changedValue => {
    // Should provide an event to pass value to Form.
    const { onChange } = this.props;
    if (onChange) {
      onChange(Object.assign({}, this.state, changedValue));
    }
  };

  render() {
    const {
      disabledGeneral,
      showScroll,
      numSiniestro,
      currentTask,
      otrosConceptosForm,
      ramosCoberturasForm,
      analizarForm,
      dataSinister,
      dataCertificate,
      dataPoliza,
      clave,
      tipoConfirmarGestion,
      flagModificar,
      userClaims,
      esDevolver,
      indModalidadPago
    } = this.props;
    return (
      <PaymentTabs
        disabledGeneral={disabledGeneral}
        showScroll={showScroll}
        numSiniestro={numSiniestro}
        currentTask={currentTask}
        pagosElegidos={this.state}
        setIndemnizaciones={this.setIndemnizaciones}
        setHonorarios={this.setHonorarios}
        setOtrosConceptos={this.setOtrosConceptos}
        setReposiciones={this.setReposiciones}
        setAcreencias={this.setAcreencias}
        setCoordenadas={this.setCoordenadas}
        otrosConceptosForm={otrosConceptosForm}
        ramosCoberturasForm={ramosCoberturasForm}
        analizarForm={analizarForm}
        dataSinister={dataSinister}
        dataCertificate={dataCertificate}
        dataPoliza={dataPoliza}
        clave={clave}
        tipoConfirmarGestion={tipoConfirmarGestion}
        flagModificar={flagModificar}
        userClaims={userClaims}
        esDevolver={esDevolver}
        indModalidadPago={indModalidadPago}
      />
    );
  }
}

export default PagosFormItem;
