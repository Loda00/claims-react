import React from 'react';
import { connect } from 'react-redux';
import { Col, Icon, Modal, Button } from 'antd';

import { showModalError } from 'util/index';
import { CONSTANTS_APP } from 'constants/index';

import { getParamGeneral } from 'services/types/reducer';
import { getBuscarParametros } from 'scenes/Administracion/data/buscarParametros/reducer';
import { crearSubparametroLoading } from 'scenes/Administracion/data/crearSubparametro/reducer';

import ParametrosForm from 'scenes/Administracion/Parametros/components/ParametrosForm';
import ParametrosTabla from 'scenes/Administracion/Parametros/components/ParametrosTabla';
import ParametrosAgregar from 'scenes/Administracion/Parametros/components/ParametrosAgregar';
import ModalAgregarSubTipo from 'scenes/Administracion/Parametros/components/ParametrosAgregarSubTIpo/index';

import * as crearParametrosCreators from 'scenes/Administracion/data/crearParametro/action';
import * as crearSubparametrosCreators from 'scenes/Administracion/data/crearSubparametro/action';
import * as buscarParametrosCreators from 'scenes/Administracion/data/buscarParametros/action';
import * as actualizarUtlParametroCreators from 'scenes/Administracion/data/actualizarUtlParametro/action';

import './style.css';

class Parametros extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tituloParametroModal: '',
      objetoParametro: [],
      modalParametroVisible: false,
      data: [],
      editingKey: '',
      modalAgregarSubTipo: false,
      actualizarIconLoading: false
    };
    this.edit = this.edit.bind(this);
    this.cancel = this.cancel.bind(this);
    this.alCancelarAgregarOEditarParametro = this.alCancelarAgregarOEditarParametro.bind(this);
    this.actualizarParametro = this.actualizarParametro.bind(this);
  }

  async componentDidMount() {
    const { buscarParametro } = this.props;
    try {
      const response = await buscarParametro(null);
      this.setState({ data: response.data });
    } catch (e) {
      showModalError(e.message);
    }
  }

  actualizarDataDespuesActualizarOCrear = async value => {
    const { buscarParametro } = this.props;
    try {
      const response = await buscarParametro(value);
      this.setState({ data: response.data });
    } catch (e) {
      showModalError(e.message);
    }
  };

  manejadorSelectParametros = async value => {
    const { buscarParametros } = this.props;

    this.setState({ data: [] });
    const filtroParametros = await buscarParametros.buscarParametros.filter(parametro =>
      parametro.idRuta.includes(value.concat('.'))
    );

    this.setState({ data: filtroParametros });
  };

  setearEstadoModalParametroVisibleATrueEnAgregar = () => {
    this.setState({
      modalParametroVisible: true,
      tituloParametroModal: 'A'
    });
  };

  alCancelarAgregarOEditarParametro = async () => {
    await this.setState({
      modalParametroVisible: false,
      objetoParametro: [],
      tituloParametroModal: ''
    });
  };

  eliminarParametros = async record => {
    const { actualizarUtlParametros } = this.props;
    try {
      await actualizarUtlParametros(record, 'D');
    } catch (e) {
      showModalError(e.message);
    }
  };

  onOk = (form, key, row) => {
    const newData = [...this.state.data];
    const index = newData.findIndex(item => key.key === item.idRuta);
    if (index > -1) {
      const item = newData[index];
      newData.splice(index, 1, {
        ...item,
        ...row
      });
      this.setState({ data: newData, editingKey: '' });
    } else {
      newData.push(row);
      this.setState({ data: newData, editingKey: '' });
    }
  };

  edit = key => this.setState({ editingKey: key });

  cancel = () => this.setState({ editingKey: '' });

  abrirModalAgregarSubTipo = parametro => {
    this.setState({
      modalAgregarSubTipo: true,
      objetoParametro: parametro
    });
  };

  cerrarModalAgregarSubTipo = () => {
    this.setState({
      modalAgregarSubTipo: false,
      objetoParametro: []
    });
  };

  actualizarParametro = async (form, key) => {
    const { actualizarUtlParametros } = this.props;
    await this.setState({ actualizarIconLoading: true });

    form.validateFields(async (error, row) => {
      if (error) {
        return this.setState({ actualizarIconLoading: false });
      }
      const resquest = {
        dscParametro: row.dscParametro,
        dscTooltip: row.dscTooltip,
        numOrden: row.numOrden,
        idRuta: key.idRuta,
        codParametro: key.codParametro,
        codTipo: key.codTipo,
        key: key.key,
        indActivo: key.indActivo
      };

      try {
        const response = await actualizarUtlParametros(resquest);

        if (response.code === 'CRG-000') {
          Modal.success({
            title: response.message,
            centered: true,
            okText: 'Aceptar',
            onOk: this.onOk(form, resquest, row)
          });
          return this.setState({ actualizarIconLoading: false });
        }
        Modal.error({
          title: response.message,
          centered: true,
          okText: 'Cerrar'
        });
        return this.setState({ actualizarIconLoading: false });
      } catch (e) {
        showModalError(e.message);
        return this.setState({ actualizarIconLoading: false });
      }
    });
  };

  onOkAgregar = async () => {
    const { buscarParametro } = this.props;
    try {
      const response = await buscarParametro(null);
      this.setState({ data: response.data });
    } catch (e) {
      showModalError(e.message);
    }
  };

  agregarSubParam = async validateFields => {
    const { crearSubparametro } = this.props;

    try {
      await validateFields(async (err, values) => {
        if (!err) {
          const response = await crearSubparametro(values);
          if (response.code === 'CRG-000') {
            Modal.success({
              title: 'Se creó el parámetro',
              content: response.message,
              centered: true,
              okText: 'Aceptar'
            });
            this.onOkAgregar();
            this.cerrarModalAgregarSubTipo();
          } else
            Modal.error({
              title: 'Error',
              content: response.message,
              centered: true,
              okText: 'Aceptar'
            });
        }
      });
    } catch (err) {
      showModalError(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
    }
  };

  render() {
    const {
      history,
      showScroll,
      loadingBuscarParametros,
      buscarParametro,
      crearSubparamLoading,
      buscarParametros: { buscarParametros }
    } = this.props;

    const {
      data,
      editingKey,
      objetoParametro,
      tituloParametroModal,
      modalParametroVisible,
      modalAgregarSubTipo,
      actualizarIconLoading
    } = this.state;

    const dataParaTabla = data.map(parametro => {
      return {
        key: parametro.idRuta,
        idRuta: parametro.idRuta,
        codTipo: parametro.codTipo,
        numOrden: parametro.numOrden,
        indActivo: parametro.indActivo,
        codParametro: parametro.codParametro,
        dscParametro: parametro.dscParametro,
        dscTooltip: parametro.dscTooltip
      };
    });

    const redirectToTarget = () => history.push('/');

    return (
      <React.Fragment>
        <h1>Parámetros</h1>
        <ParametrosForm
          idRutas={buscarParametros}
          loading={loadingBuscarParametros}
          manejadorSelectParametros={this.manejadorSelectParametros}
        />
        <div className="seccion_claims">
          <ParametrosTabla
            data={dataParaTabla}
            edit={this.edit}
            cancel={this.cancel}
            showScroll={showScroll}
            editingKey={editingKey}
            buscarParametros={dataParaTabla}
            actualizarIconLoading={actualizarIconLoading}
            loadingBuscarParametros={loadingBuscarParametros}
            actualizarParametro={this.actualizarParametro}
            abrirModalAgregarSubTipo={this.abrirModalAgregarSubTipo}
          />
        </div>
        <Col
          style={{
            textAlign: 'right',
            marginBottom: '15px'
          }}
        >
          <ParametrosAgregar
            onOkAgregar={this.onOkAgregar}
            idRutas={buscarParametros}
            loading={loadingBuscarParametros}
            buscarParametro={buscarParametro}
            tituloParametroModal={tituloParametroModal}
            modalParametroVisible={modalParametroVisible}
            actualizarDataDespuesActualizar={this.actualizarDataDespuesActualizar}
            alCancelarAgregarOEditarParametro={this.alCancelarAgregarOEditarParametro}
            setearEstadoModalParametroVisibleATrueEnAgregar={this.setearEstadoModalParametroVisibleATrueEnAgregar}
          />

          <ModalAgregarSubTipo
            abrirModal={modalAgregarSubTipo}
            agregarSubParam={this.agregarSubParam}
            objetoParametro={objetoParametro}
            cerrarModal={this.cerrarModalAgregarSubTipo}
            crearSubparamLoading={crearSubparamLoading}
          />
          <Button
            onClick={redirectToTarget}
            style={{
              textAlign: 'right',
              marginBottom: '15px'
            }}
          >
            Cancelar
            <Icon type="close-circle" />
          </Button>
        </Col>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  buscarParametros: getBuscarParametros(state),
  loadingBuscarParametros: getBuscarParametros(state).isLoading,

  crearSubparamLoading: crearSubparametroLoading(state),

  tamanioPaginacion: getParamGeneral(state, 'TAMANIO_TABLA_PAGINA'),

  showScroll: state.services.device.scrollActivated,
  userClaims: state.services.user.userClaims
});

const mapDispatchToProps = dispatch => ({
  buscarParametro: value => dispatch(buscarParametrosCreators.fetchBuscarParametros(value)),

  actualizarUtlParametros: (record, indicador) =>
    dispatch(actualizarUtlParametroCreators.fetchActualizarUtlParametro(record, indicador)),

  crearParametro: values => dispatch(crearParametrosCreators.fetchCrearParametro(values)),

  crearSubparametro: values => dispatch(crearSubparametrosCreators.fetchCrearSubparametro(values))
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Parametros);
