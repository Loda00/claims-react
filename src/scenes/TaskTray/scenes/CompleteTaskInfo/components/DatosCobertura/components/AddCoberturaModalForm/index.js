import React from 'react';
import { Form } from 'antd';
import ModalForm from '../ModalForm';

class AddCoberturaModalForm extends React.Component {
  render() {
    return (
      <React.Fragment>
        {this.props.visible && (
          <ModalForm
            visible={this.props.visible}
            edit={this.props.edit}
            onCancel={this.props.onCancel}
            onOk={this.props.onOk}
            form={this.props.form}
            poliza={this.props.poliza}
            certificado={this.props.certificado}
            branches={this.props.branches}
            coverages={this.props.coverages}
            causes={this.props.causes}
            consequences={this.props.consequences}
            selectedCobertura={this.props.selectedCobertura}
            coberturasElegidas={this.props.coberturasElegidas}
            agregarCobertura={this.props.agregarCobertura}
            ramos={this.props.ramos}
            fechaOcurrencia={this.props.fechaOcurrencia}
            loadingGuardar={this.props.loadingGuardar || false}
            indCargaMasiva={this.props.indCargaMasiva}
          />
        )}
      </React.Fragment>
    );
  }
}

export default Form.create({ name: 'formcobertura_in_modal' })(AddCoberturaModalForm);
