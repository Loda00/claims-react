import React from 'react';
import RamoForm from 'scenes/Administracion/Ramo/components/RamoForm';
import RamoTabla from 'scenes/Administracion/Ramo/components/RamoTabla';
import RamoAgregar from 'scenes/Administracion/Ramo/components/RamoAgregar';
import { Button, Icon, Col, Form } from 'antd';
import { showErrorMessage } from 'util/index';
import { connect } from 'react-redux';
import { getListRamo } from 'scenes/Administracion/data/listarRamo/reducer';
import { getParamGeneral } from 'services/types/reducer';
import * as listarRamoCreators from 'scenes/Administracion/data/listarRamo/action';

class Ramo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      titleModalAgregar: '',
      datosModal: null,
      formValues: null
    };
  }

  async componentDidMount() {
    const { dispatch } = this.props;

    const promises = [];
    promises.push(dispatch(listarRamoCreators.fetchListRamos(null, null)));
    try {
      await Promise.all(promises);
    } catch (e) {
      showErrorMessage(e);
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;

    dispatch(listarRamoCreators.fetchListRamosReset());
  }

  handleAgregarOK = () => {
    this.setState({
      modalVisible: false
    });
  };

  handleCancelar = () => {
    const {
      form: { resetFields }
    } = this.props;

    resetFields();
    this.setState({
      modalVisible: false
    });
  };

  mostrarModalCrearRamo = () => {
    const {
      form: { validateFields }
    } = this.props;

    validateFields();

    this.setState({
      datosModal: null,
      modalVisible: true,
      titleModalAgregar: 'Agregar'
    });
  };

  modificarModal = record => {
    this.setState({
      datosModal: record,
      modalVisible: true,
      titleModalAgregar: 'Modificar'
    });
  };

  redirectToTarget = () => {
    const { history } = this.props;

    history.push('/');
  };

  setFormValues = values => {
    this.setState({ formValues: values });
  };

  limpiarAlMantener = limpiarForm => {
    this.limpiarForm = limpiarForm;
  };

  render() {
    const { modalVisible, titleModalAgregar, datosModal } = this.state;

    const { listarRamo, loadingListarRamo, tamanioPaginacion, showScroll } = this.props;

    const dataRamos = listarRamo.listarRamo.map((item, index) => {
      return {
        key: index,
        codigo: item.codRamo.toUpperCase(),
        ramo: item.dscRamo.toUpperCase()
      };
    });

    return (
      <React.Fragment>
        <h1>Mantenimiento ramo</h1>
        <RamoForm limpiarAlMantener={this.limpiarAlMantener} />
        <div className="seccion_claims">
          <RamoTabla
            dataRamos={dataRamos}
            loadingListarRamo={loadingListarRamo}
            modificarModal={this.modificarModal}
            tamanioPaginacion={tamanioPaginacion}
            limpiarForm={this.limpiarForm}
            showScroll={showScroll}
          />
        </div>
        <Col style={{ textAlign: 'right', marginBottom: '15px' }}>
          <Button
            onClick={this.mostrarModalCrearRamo}
            type="primary"
            style={{ textAlign: 'right', marginRight: '10px' }}
            disabled={loadingListarRamo}
          >
            Crear
          </Button>
          {modalVisible && (
            <RamoAgregar
              // mostrarModalCrearRamo={this.mostrarModalCrearRamo}
              datosModal={datosModal}
              modalVisible={modalVisible}
              handleAgregarOK={this.handleAgregarOK}
              handleCancelar={this.handleCancelar}
              dataRamos={dataRamos}
              titleModalAgregar={titleModalAgregar}
              limpiarForm={this.limpiarForm}
            />
          )}
          <Button onClick={this.redirectToTarget}>
            Cancelar
            <Icon type="close-circle" />
          </Button>
        </Col>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  const listarRamo = getListRamo(state);
  const tamanioPaginacion = getParamGeneral(state, 'TAMANIO_TABLA_PAGINA');

  return {
    listarRamo,
    loadingListarRamo: listarRamo.isLoading,

    showScroll: state.services.device.scrollActivated,
    userClaims: state.services.user.userClaims,

    tamanioPaginacion
  };
};
export default connect(mapStateToProps)(Form.create({ name: 'ramo' })(Ramo));
