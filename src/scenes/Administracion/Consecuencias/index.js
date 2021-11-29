import React from 'react';
import ConsecuenciasForm from 'scenes/Administracion/Consecuencias/components/ConsecuenciasForm';
import ConsecuenciasTabla from 'scenes/Administracion/Consecuencias/components/ConsecuenciasTabla';
import ConsecuenciasAgregar from 'scenes/Administracion/Consecuencias/components/ConsecuenciasAgregar';
import { Button, Icon, Col, Select } from 'antd';
import { showErrorMessage } from 'util/index';
import { connect } from 'react-redux';
import { getListConsecuencia } from 'scenes/Administracion/data/listarConsecuencia/reducer';
import { getListRamo } from 'scenes/Administracion/data/listarRamo/reducer';
import { getParamGeneral } from 'services/types/reducer';
import * as listarRamoCreators from 'scenes/Administracion/data/listarRamo/action';
import * as listarConsecuenciaCreators from 'scenes/Administracion/data/listarConsecuencia/action';

class Consecuencia extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      datosModal: null,
      titleModalAgregar: null,
      formValues: null
    };
  }

  async componentDidMount() {
    const { dispatch } = this.props;

    const promises = [];
    promises.push(dispatch(listarRamoCreators.fetchListRamos()));
    promises.push(dispatch(listarConsecuenciaCreators.fetchListConsecuencia()));
    try {
      await Promise.all(promises);
    } catch (e) {
      showErrorMessage(e);
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch(listarRamoCreators.fetchListRamosReset());
    dispatch(listarConsecuenciaCreators.fetchListConsecuenciaReset());
  }

  handleCancelar = () => {
    this.setState({
      modalVisible: false
    });
  };

  mostrarModalCrearConsecuencia = () => {
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
    const { listarRamo, loadingListarRamo, listarConsecuencia, loadingListarConsecuencia, showScroll } = this.props;

    const { titleModalAgregar, datosModal, modalVisible } = this.state;

    const Option = Select.Option;

    const dataConsecuencia = listarConsecuencia.listarConsecuencia.map((item, index) => {
      return {
        key: index,
        idConsecuencia: item.idConsecuencia,
        codigo: item.codConsecuencia.toUpperCase(),
        consecuencia: item.dscConsecuencia.toUpperCase(),
        ramo: `${item.codRamo.toUpperCase()} - ${item.dscRamo.toUpperCase()}`,
        codRamo: item.codRamo.toUpperCase()
      };
    });

    const ramosItems = listarRamo.listarRamo.map(items => (
      <Option key={items.codRamo} value={items.codRamo}>
        {`${items.codRamo} - ${items.dscRamo}`}
      </Option>
    ));

    return (
      <React.Fragment>
        <h1>Mantenimiento consecuencias</h1>
        <ConsecuenciasForm
          setFormValues={this.setFormValues}
          ramosItems={ramosItems}
          loadingListarRamo={loadingListarRamo}
          limpiarAlMantener={this.limpiarAlMantener}
        />
        <div className="seccion_claims">
          <ConsecuenciasTabla
            modificarModal={this.modificarModal}
            dataConsecuencia={dataConsecuencia}
            loadingListarConsecuencia={loadingListarConsecuencia}
            limpiarForm={this.limpiarForm}
            showScroll={showScroll}
          />
        </div>
        <Col style={{ textAlign: 'right', marginBottom: '15px' }}>
          <Button
            onClick={this.mostrarModalCrearConsecuencia}
            type="primary"
            style={{ textAlign: 'right', marginRight: '10px' }}
            disabled={loadingListarConsecuencia}
          >
            Crear
          </Button>
          {modalVisible && (
            <ConsecuenciasAgregar
              ramosItems={ramosItems}
              modalVisible={modalVisible}
              titleModalAgregar={titleModalAgregar}
              datosModal={datosModal}
              mostrarModalCrearConsecuencia={this.mostrarModalCrearConsecuencia}
              handleCancelar={this.handleCancelar}
              limpiarForm={this.limpiarForm}
              dataConsecuencia={dataConsecuencia}
              loadingListarRamo={loadingListarRamo}
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
  const listarConsecuencia = getListConsecuencia(state);
  const listarRamo = getListRamo(state);
  const tamanioPaginacion = getParamGeneral(state, 'TAMANIO_TABLA_PAGINA');

  return {
    listarConsecuencia,
    loadingListarConsecuencia: listarConsecuencia.isLoading,

    listarRamo,
    loadingListarRamo: listarRamo.isLoading,

    showScroll: state.services.device.scrollActivated,
    userClaims: state.services.user.userClaims,

    tamanioPaginacion
  };
};

export default connect(mapStateToProps)(Consecuencia);
