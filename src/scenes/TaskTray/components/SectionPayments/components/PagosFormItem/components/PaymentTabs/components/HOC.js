import React from 'react';
import { mostrarModalSiniestroaPreventivo } from 'util/index';

// This function takes a component...

export default function withSubscription(WrappedComponent) {
  // ...and returns another component...
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.showModal = this.showModal.bind(this);
      this.setModalVisibleEdit = this.setModalVisibleEdit.bind(this);
      this.hideModal = this.hideModal.bind(this);
      this.validateFields = this.validateFields.bind(this);
      this.saveFormRef = this.saveFormRef.bind(this);
    }

    setModalVisibleEdit(selectedPago) {
      this.setState({ modalVisible: true, selectedPago }, () => this.validateFields());
    }

    hideModal() {
      this.setState({ modalVisible: false, selectedPago: null });
    }

    showModal() {
      const {
        analizarForm: { getFieldValue },
        dataSinister: { codTipoSiniestro: codTipoSiniestroRedux } = {}
      } = this.props;
      const { codTipoSiniestro: codTipoSiniestroActual } = getFieldValue('siniestro') || {};
      const pasoPreventivoANormal = codTipoSiniestroRedux === 'P' && codTipoSiniestroActual === 'N';

      if (pasoPreventivoANormal) {
        mostrarModalSiniestroaPreventivo();
      } else {
        this.setState({ modalVisible: true }, () => this.validateFields());
      }
    }

    validateFields() {
      const {
        props: {
          form: { validateFields }
        }
      } = this.formRef;
      return new Promise(function(resolve, reject) {
        validateFields((err, values) => {
          if (err) {
            reject(err);
          } else {
            resolve(values);
          }
        });
      });
    }

    saveFormRef(formRef) {
      this.formRef = formRef;
    }

    render() {
      // ... and renders the wrapped component with the fresh data!
      // Notice that we pass through any additional props
      const { modalVisible, selectedPago } = this.props;
      return (
        <WrappedComponent
          modalVisible={modalVisible}
          setModalVisibleEdit={this.setModalVisibleEdit}
          selectedPago={selectedPago}
          validateFields={this.validateFields}
          saveFormRef={this.saveFormRef}
          showModal={this.showModal}
          hideModal={this.hideModal}
          {...this.props}
        />
      );
    }
  };
}
