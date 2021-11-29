import React from 'react';
import CausasForm from 'scenes/Administracion/Causas/components/CausasForm';
import CausasTabla from 'scenes/Administracion/Causas/components/CausasTabla';
import CausasAgregar from 'scenes/Administracion/Causas/components/CausasAgregar';
import { Button, Icon, Col, Select } from 'antd';
import { showErrorMessage } from 'util/index';
import { connect } from 'react-redux';
import { getListRamo } from 'scenes/Administracion/data/listarRamo/reducer';
import { getListCausa } from 'scenes/Administracion/data/listarCausa/reducer';
import { getParamGeneral } from 'services/types/reducer';
import * as listarRamoCreators from 'scenes/Administracion/data/listarRamo/action';
import * as listarCausasCreators from 'scenes/Administracion/data/listarCausa/action';

class Causas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      datosModal: null,
      titleModalAgregar: '',
      formValues: null
    };
  }

  async componentDidMount() {
    const { dispatch } = this.props;

    const promises = [];
    promises.push(dispatch(listarRamoCreators.fetchListRamos()));
    promises.push(dispatch(listarCausasCreators.fetchListCausa()));

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

  handleCancelar = () => {
    this.setState({
      modalVisible: false
    });
  };

  mostrarModalCrearCausa = () => {
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

  setFormValues = values => {
    this.setState({ formValues: values });
  };

  redirectToTarget = () => {
    const { history } = this.props;

    history.push('/');
  };

  limpiarAlMantener = limpiarForm => {
    this.limpiarForm = limpiarForm;
  };

  render() {
    const {
      listarRamo,
      loadingListarRamo,
      tamanioPaginacion,
      listarCausa: { listarCausa },
      loadingListarCausa,
      showScroll
    } = this.props;

    const { datosModal, titleModalAgregar, modalVisible } = this.state;

    const Option = Select.Option;

    const dataCausas = listarCausa.map((item, index) => {
      return {
        key: index,
        idCausa: item.idCausa,
        codigo: item.codCausa.toUpperCase(),
        causa: item.dscCausa.toUpperCase(),
        ramo: `${item.codRamo.toUpperCase()} - ${item.dscRamo.toUpperCase()}`,
        codRamo: item.codRamo.toUpperCase(),
        indRamo: item.indRamo,
        indCausa: item.indCausa
      };
    });

    const ramosItems = listarRamo.listarRamo.map(items => (
      <Option key={items.codRamo} value={items.codRamo}>
        {`${items.codRamo} - ${items.dscRamo}`}
      </Option>
    ));

    return (
      <React.Fragment>
        <h1>Mantenimiento causas</h1>
        <CausasForm
          ramosItems={ramosItems}
          setFormValues={this.setFormValues}
          loadingListarRamo={loadingListarRamo}
          limpiarAlMantener={this.limpiarAlMantener}
        />
        <div className="seccion_claims">
          <CausasTabla
            dataCausas={dataCausas}
            modificarModal={this.modificarModal}
            tamanioPaginacion={tamanioPaginacion}
            loadingListarCausa={loadingListarCausa}
            limpiarForm={this.limpiarForm}
            showScroll={showScroll}
          />
        </div>
        <Col style={{ textAlign: 'right', marginBottom: '15px' }}>
          <Button
            onClick={this.mostrarModalCrearCausa}
            type="primary"
            style={{ textAlign: 'right', marginRight: '10px' }}
            disabled={loadingListarCausa}
          >
            Crear
          </Button>
          {modalVisible && (
            <CausasAgregar
              ramosItems={ramosItems}
              datosModal={datosModal}
              mostrarModalCrearCausa={this.mostrarModalCrearCausa}
              titleModalAgregar={titleModalAgregar}
              modalVisible={modalVisible}
              handleCancelar={this.handleCancelar}
              limpiarForm={this.limpiarForm}
              dataCausas={dataCausas}
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
  const listarRamo = getListRamo(state);
  const listarCausa = getListCausa(state);
  const tamanioPaginacion = getParamGeneral(state, 'TAMANIO_TABLA_PAGINA');

  return {
    listarRamo,
    loadingListarRamo: listarRamo.isLoading,

    listarCausa,
    loadingListarCausa: listarCausa.isLoading,

    showScroll: state.services.device.scrollActivated,
    userClaims: state.services.user.userClaims,

    tamanioPaginacion
  };
};
export default connect(mapStateToProps)(Causas);
