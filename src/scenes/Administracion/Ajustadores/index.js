import React from 'react';
import AjustadorTabla from 'scenes/Administracion/Ajustadores/components/AjustadorTabla/index';
import AjustadorAgregar from 'scenes/Administracion/Ajustadores/components/AjustadorAgregar';
import AjustadorForm from 'scenes/Administracion/Ajustadores/components/AjustadorForm';
import { Button, Icon, Col } from 'antd';
import { showErrorMessage } from 'util/index';
import { connect } from 'react-redux';
import { getListAjustador } from 'scenes/Administracion/data/listarAjustador/reducer';
import * as listarAjustadorCreators from 'scenes/Administracion/data/listarAjustador/action';
import * as listarRamoCreators from 'scenes/Administracion/data/listarRamo/action';
import { getListRamo } from 'scenes/Administracion/data/listarRamo/reducer';
import { isNullOrUndefined } from 'util';
import { getParamGeneral } from 'services/types/reducer';
import { getMantenimientoAjustador } from 'scenes/Administracion/Ajustadores/data/mantenerAjustador/reducer';
import './style.css';

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

// Objeto usado en onDrop
const categoriasParaDragDrop = {
  posibles: 'items',
  seleccionados: 'selected',
  candidatos: 'posiblesReemplazos',
  reemplazosElegidos: 'reemplazosSeleccionados'
};

class Ajustador extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisibleAgregar: false,
      titleModalAgregar: '',
      datosModal: null,
      formValues: {},
      selectedRow: [],
      tituloModal: '',
      editarUsuario: {},
      items: [],
      selected: [],
      actualItem: {
        content: {},
        finalIndexSame: ''
      },
      selectedRowKeys: [],
      isLoading: false,
      rolesCheckbox: []
      //  tipoDocumentoState : 0
    };
    this.modificarModal = this.modificarModal.bind(this);
    this.onDragEnter = this.onDragEnter.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.setearSeleccionadosCheckbox = this.setearSeleccionadosCheckbox.bind(this);
    this.actualizarRamos = this.actualizarRamos.bind(this);
    this.checkboxRoles = this.checkboxRoles.bind(this);
    this.itemsConCampo = this.itemsConCampo.bind(this);
    this.despuesDeCerrar = this.despuesDeCerrar.bind(this);
  }

  async componentDidMount() {
    const { dispatch } = this.props;

    const promises = [];
    promises.push(dispatch(listarAjustadorCreators.fetchListAjustador()));
    promises.push(dispatch(listarRamoCreators.fetchListRamos(null, null)));
    try {
      await Promise.all(promises);
    } catch (e) {
      showErrorMessage(e);
    }
  }

  async componentDidUpdate(prevProps) {
    const { listarRamo } = this.props;
    this.actualizarRamos(prevProps, listarRamo);
  }

  componentWillUnmount() {
    const { dispatch } = this.props;

    dispatch(listarAjustadorCreators.fetchListAjustadorReset());
    // dispatch(listarRamoCreators.fetchListRamosReset());
  }

  actualizarRamos = async (rolesEstadoAnterior, listarRamo) => {
    if (listarRamo !== rolesEstadoAnterior.listarRamo) {
      const itemsWithCampo = listarRamo.map(item => {
        return { ...item, campo: 'posibles' };
      });
      await this.setState({ items: itemsWithCampo });
    }
  };

  onDragStart = (ev, item, index) => {
    const evento = ev;
    ev.dataTransfer.setData('id', item.codRamo);
    ev.dataTransfer.setData('campo', item.campo);
    ev.dataTransfer.setData('initialIndex', index);
    evento.target.style.opacity = '0.8';
  };

  checkboxRoles = async (e, items, selecCheckbox, indicador) => {
    if ((indicador === 'posibles' || indicador === 'seleccionados') && !e.target.checked) {
      const desseleccionado = selecCheckbox.filter(item => item !== e.target.value);
      await this.setState({
        rolesCheckbox: desseleccionado
      });
    }

    if (indicador === 'posibles' && e.target.checked) {
      await this.setState(prevState => {
        const arrayPrevioEstadoCheckbox = [...prevState.rolesCheckbox];
        arrayPrevioEstadoCheckbox.push(e.target.value);
        return {
          rolesCheckbox: arrayPrevioEstadoCheckbox,
          arrayPrevioEstadoCheckbox: []
        };
      });
    }

    if (indicador === 'seleccionados' && e.target.checked) {
      await this.setState(prevState => {
        const arrayCheckbox = [...prevState.rolesCheckbox];
        arrayCheckbox.push(e.target.value);
        return {
          rolesCheckbox: arrayCheckbox,
          arrayCheckbox: []
        };
      });
    }
  };

  setearSeleccionadosCheckbox = async (indicador, rolesCheckbox, items, selected) => {
    const { listarRamo } = this.props;
    if (indicador === 'seleccionados') {
      const seleccionadosCheckbox = listarRamo
        .filter(item => rolesCheckbox.includes(item.codRamo))
        .map(item => {
          return { ...item, campo: 'seleccionados' };
        });
      const itemsCheckbox = items.filter(item => !rolesCheckbox.includes(item.codRamo));
      await this.setState(prevState => {
        const selectedCheckbox = [...prevState.selected];
        const selectedPrevioEstadoYNuevo = selectedCheckbox.concat(seleccionadosCheckbox);
        return {
          selected: selectedPrevioEstadoYNuevo,
          items: itemsCheckbox,
          rolesCheckbox: []
        };
      });
    }
    if (indicador === 'posibles') {
      const itemsCheckbox = listarRamo
        .filter(item => rolesCheckbox.includes(item.codRamo))
        .map(item => {
          return { ...item, campo: 'posibles' };
        });
      const seleccionadosCheckbox = selected.filter(item => !rolesCheckbox.includes(item.codRamo));
      await this.setState(prevState => {
        const itemsPrevioEstadoCheckbox = [...prevState.items];
        const itemsPrevioEstadoYNuevo = itemsPrevioEstadoCheckbox.concat(itemsCheckbox);
        return {
          selected: seleccionadosCheckbox,
          items: itemsPrevioEstadoYNuevo,
          rolesCheckbox: []
        };
      });
    }
  };

  // Evento usado en dragDropRoles
  onDragEnter = (item, index) =>
    this.setState({
      actualItem: {
        finalIndexSame: index,
        content: item
      }
    });

  // Obtiene lista del estado usando objetoid2List
  getList = id => {
    return this.state[categoriasParaDragDrop[id]];
  };

  onDrop = async (ev, cateActual) => {
    const { items, selected, actualItem } = this.state;
    const id = ev.dataTransfer.getData('id');
    const cateAnterior = ev.dataTransfer.getData('campo');
    const onDragStartPosition = ev.dataTransfer.getData('initialIndex');

    if (!cateActual) {
      return;
    }

    if (cateAnterior === cateActual) {
      const rolesUsuario = reorder(this.getList(cateActual), onDragStartPosition, actualItem.finalIndexSame);
      let state = { items };
      if (cateActual === 'seleccionados') {
        state = { selected: rolesUsuario };
      }
      await this.setState({
        state,
        rolesCheckbox: []
      });
    } else if (cateActual === 'seleccionados') {
      const roles = items.filter(rol => {
        const cadaRol = Object.assign(rol);
        if (rol.codRamo === id) {
          cadaRol.campo = cateActual;
        }
        return cadaRol;
      });

      const filtradoPosibles = roles.filter(rol => rol.campo === 'posibles');
      const filtradoSeleccionados = roles.filter(rol => rol.campo === 'seleccionados')[0];

      await this.setState(prevState => {
        const newList = [...prevState.selected, filtradoSeleccionados];
        return {
          items: filtradoPosibles,
          selected: newList,
          rolesCheckbox: []
        };
      });
    } else if (cateActual === 'posibles') {
      const roles = selected.filter(rol => {
        const cadaRol = Object.assign(rol);
        if (rol.codRamo === id) {
          cadaRol.campo = cateActual;
        }
        return rol;
      });

      const filtradoPosibles = roles.filter(rol => rol.campo === 'posibles')[0];
      const filtradoSeleccionados = roles.filter(rol => rol.campo === 'seleccionados');

      await this.setState(prevState => {
        const newList = [...prevState.items, filtradoPosibles];
        return {
          items: newList,
          selected: filtradoSeleccionados,
          rolesCheckbox: []
        };
      });
    }
  };

  itemsConCampo = listarRamo =>
    listarRamo.map(item => {
      return { ...item, campo: 'posibles' };
    });

  despuesDeCerrar = async () => {
    const { listarRamo } = this.props;
    // this.setearEditarUsuarioToNull();
    const { dispatch } = this.props;
    // dispatch(listarAjustadorCreators.fetchListAjustadorReset());
    // dispatch(listarRamoCreators.fetchListRamosReset());
    await this.setState({
      items: this.itemsConCampo(listarRamo),
      selected: [],
      rolesCheckbox: []
      // tipoDocumentoState: 0
    });
  };

  // setearEditarUsuarioToNull = () => this.setState({ editarUsuario: [] });

  handleAgregarOK = () => {
    this.setState({
      editarUsuario: [],
      rolesCheckbox: [],
      selected: [],
      modalVisibleAgregar: false
    });
  };

  mostrarModalCrearAjustador = () => {
    this.despuesDeCerrar();
    this.setState({
      datosModal: null,
      modalVisibleAgregar: true,
      titleModalAgregar: 'Agregar'
    });
  };

  modificarModal = async record => {
    const { listarAjustador } = this.props;
    const { items, selected } = this.state;

    this.setState({
      datosModal: record,
      modalVisibleAgregar: true,
      titleModalAgregar: 'Modificar'
    });

    const obejtoPreselecionados = listarAjustador.listarAjustador.filter(
      item => item.idAjustador === record.idAjustador
    );
    const preSeleccionado = obejtoPreselecionados[0].ramos;
    const noPreselecionados = this.obtenerNoPreseleccionados(preSeleccionado);
    await this.setState({
      selected: preSeleccionado,
      items: noPreselecionados
    });
  };

  obtenerNoPreseleccionados = seleccionados => {
    const { listarRamo } = this.props;
    const elegidos = seleccionados.map(selected => selected.codRamo);
    const itemsNoSeleccionados = listarRamo
      .filter(item => !elegidos.includes(item.codRamo))
      .map(rol => {
        return { ...rol, campo: 'posibles' };
      });
    return itemsNoSeleccionados;
  };

  handleCancelar = () => {
    this.setState({
      modalVisibleAgregar: false,
      rolesCheckbox: [],
      selected: []
    });
  };

  redirectToTarget = () => {
    const { history } = this.props;

    history.push('/');
  };

  setFormValues = values => this.setState({ formValues: values });

  handleDeleteDragDrop = async (e, item) => {
    const { selected, rolesCheckbox } = this.state;

    e.preventDefault();

    await this.setState(prevState => {
      const cadaItem = { ...item };
      cadaItem.campo = 'posibles';
      const newItems = [...prevState.items, cadaItem];
      const filtrarSelected = selected.filter(select => select.codRamo !== item.codRamo);
      const filtrarRolesCheckbox = rolesCheckbox.filter(rol => rol !== item.codRamo);
      return {
        items: newItems,
        selected: filtrarSelected,
        rolesCheckbox: filtrarRolesCheckbox
      };
    });
  };

  onSelectedRowKeysChange = async (selectedRowKeys, selectedRow) => {
    this.setState({
      selectedRowKeys,
      selectedRow
    });
  };

  validateBeforeUpdate = record => {
    if (isNullOrUndefined(record) || record === '') {
      return String('Valor no puede ser vacío');
    }
    return null;
  };

  seteaSelectedRowKeysEmpty = () => {
    this.setState({
      selectedRowKeys: [],
      posiblesReemplazos: [],
      selectedRow: []
    });
  };

  actualizarMargenes = tipoModal => {
    let arrayMargenes = [];
    if (window.innerWidth <= 576) {
      arrayMargenes = ['arrow-down', 'arrow-up'];
      return arrayMargenes;
    }
    arrayMargenes = ['arrow-right', 'arrow-left'];
    return arrayMargenes;
  };

  limpiarAlMantener = limpiarForm => {
    this.limpiarForm = limpiarForm;
  };

  /*
  valorTipoDocumento = value => {
    this.setState({
      tipoDocumentoState : value
    })
  }

  */

  render() {
    const {
      listarAjustador,
      loadingListarAjustador,
      listarRamo,
      tamanioPaginacion,
      loadingMntAjustador,
      showScroll
    } = this.props;

    const {
      modalVisibleAgregar,
      datosModal,
      titleModalAgregar,
      // tipoDocumentoState,

      selectedRow,
      tituloModal,
      editarUsuario,
      valorPersona,
      selected,
      items,
      posiblesReemplazos,
      selectedRowKeys,
      rolesCheckbox
    } = this.state;

    const dataAjustadores = listarAjustador.listarAjustador.map((item, index) => {
      return {
        key: index,
        codigo: item.codAjustador,
        idAjustador: item.idAjustador,
        idPersona: item.idPersona,
        ajustador: item.nombreAjustador,
        email: item.email,
        estadoSwitch: item.indHabilitado,
        estado:
          item.indHabilitado === 'S'
            ? 'Activado'
            : item.indHabilitado === 'P'
            ? 'Desactivado parcialmente'
            : 'Desactivado total',
        idCore: item.idCore
      };
    });

    const seleccionados = selected.length > 0 && selected;

    return (
      <React.Fragment>
        <h1>Mantenimiento ajustadores</h1>
        <AjustadorForm
          setFormValues={this.setFormValues}
          seteaposiblesReemplazosEmpty={this.seteaposiblesReemplazosEmpty}
          selectedRowKeys={selectedRowKeys}
          seteaSelectedRowKeysEmpty={this.seteaSelectedRowKeysEmpty}
          limpiarAlMantener={this.limpiarAlMantener}
        />
        <div className="seccion_claims">
          <AjustadorTabla
            dataAjustadores={dataAjustadores}
            modificarModal={this.modificarModal}
            loadingListarAjustador={loadingListarAjustador}
            tamanioPaginacion={tamanioPaginacion}
            limpiarForm={this.limpiarForm}
            loadingMntAjustador={loadingMntAjustador}
            listarAjustador={listarAjustador}
            showScroll={showScroll}
            editarUsuario={editarUsuario}
            modificarModalYEditarUsuario={this.modificarModalYEditarUsuario}
            seleccionados={seleccionados}
            posiblesReemplazos={posiblesReemplazos}
            onSelectedRowKeysChange={this.onSelectedRowKeysChange}
            selectedRowKeys={selectedRowKeys}
            setearLoadingToFalse={this.setearLoadingToFalse}
          />
        </div>
        <Col style={{ textAlign: 'right', marginBottom: '15px' }}>
          <Button
            onClick={this.mostrarModalCrearAjustador}
            type="primary"
            style={{ textAlign: 'right', marginRight: '10px' }}
          >
            Crear
          </Button>
          {modalVisibleAgregar && (
            <AjustadorAgregar
              modalVisibleAgregar={modalVisibleAgregar}
              datosModal={datosModal}
              handleAgregarOK={this.handleAgregarOK}
              handleCancelar={this.handleCancelar}
              titleModalAgregar={titleModalAgregar}
              limpiarForm={this.limpiarForm}
              loadingMntAjustador={loadingMntAjustador}
              listarAjustador={listarAjustador}
              actualizarRamos={this.actualizarRamos}
              alCancelarAgregarOEditar={this.alCancelarAgregarOEditar}
              modalAgregarUsuario={this.modalAgregarUsuario}
              tituloModal={tituloModal}
              editarUsuario={editarUsuario}
              items={items}
              selected={selected}
              onDragEnter={this.onDragEnter}
              onDrop={this.onDrop}
              manejarSelect={this.manejarSelect}
              despuesDeCerrar={this.despuesDeCerrar}
              valorPersona={valorPersona}
              handleDeleteDragDrop={this.handleDeleteDragDrop}
              onDragOver={this.onDragOver}
              validateBeforeUpdate={this.validateBeforeUpdate}
              onDragStart={this.onDragStart}
              setearLoadingToFalse={this.setearLoadingToFalse}
              checkboxRoles={this.checkboxRoles}
              setearSeleccionadosCheckbox={this.setearSeleccionadosCheckbox}
              rolesCheckbox={rolesCheckbox}
              actualizarMargenes={this.actualizarMargenes}
              listarRamo={listarRamo}
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
  const listarAjustador = getListAjustador(state);
  const listarRamo = getListRamo(state);
  const mntAjustador = getMantenimientoAjustador(state);

  const tamanioPaginacion = getParamGeneral(state, 'TAMANIO_TABLA_PAGINA');
  return {
    mntAjustador,
    loadingMntAjustador: mntAjustador.isLoading,

    listarAjustador,
    loadingListarAjustador: listarAjustador.isLoading,

    listarRamo: listarRamo.listarRamo,
    loadingListarRamo: listarRamo.isLoading,

    showScroll: state.services.device.scrollActivated,
    userClaims: state.services.user.userClaims,

    tamanioPaginacion
  };
};

export default connect(mapStateToProps)(Ajustador);
