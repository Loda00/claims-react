import React from 'react';
import { connect } from 'react-redux';
import { Button, Icon, Select, Modal, Row } from 'antd';

import { isNullOrUndefined } from 'util';
import { showErrorMessage } from 'util/index';

import UsuarioForm from 'scenes/Administracion/Usuario/components/UsuarioFormItem';
import UsuarioTabla from 'scenes/Administracion/Usuario/components/UsuarioTabla';
import UsuarioAgregar from 'scenes/Administracion/Usuario/components/UsuarioAgregar';
import UsuarioAusencia from 'scenes/Administracion/Usuario/components/UsuarioAusencia';
import UsuarioReemplazo from 'scenes/Administracion/Usuario/components/Reemplazo';

import { getListRoles } from 'scenes/Administracion/data/listarRoles/reducer';
import { getListCargo } from 'scenes/Administracion/data/listarCargo/reducer';
import { getListPersona } from 'scenes/Administracion/data/listarPersona/reducer';
import { getListEquipos } from 'scenes/Administracion/data/listarEquipos/reducer';
import { getListAjustador } from 'scenes/Administracion/data/listarAjustador/reducer';
import { getObtenerPersona } from 'scenes/Administracion/data/obtenerPersona/reducer';
import { getListaAusencia } from 'scenes/Administracion/data/listarAusencias/reducer';
import { getObtenerReemplazo } from 'scenes/Administracion/data/obtenerReemplazos/reducer';
import { getListPosiblesReemplazos } from 'scenes/Administracion/data/listarPosiblesReemplazos/reducer';

import * as listarRolesCreators from 'scenes/Administracion/data/listarRoles/action';
import * as listarCargoCreators from 'scenes/Administracion/data/listarCargo/action';
import * as obtenerJefesCreators from 'scenes/Administracion/data/obtenerJefes/action';
import * as equiposActionCreators from 'scenes/Administracion/data/listarEquipos/action';
import * as listarPersonaCreators from 'scenes/Administracion/data/listarPersona/action';
import * as obtenerPersonaCreators from 'scenes/Administracion/data/obtenerPersona/action';
import * as listarAjustadorCreators from 'scenes/Administracion/data/listarAjustador/action';
import * as listarAusenciasCreators from 'scenes/Administracion/data/listarAusencias/action';
import * as obtenerReemplazosCreators from 'scenes/Administracion/data/obtenerReemplazos/action';
import * as listarPosiblesReemplazosCreators from 'scenes/Administracion/data/listarPosiblesReemplazos/action';

class Usuario extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      selected: [],
      tituloModal: '',
      selectedRow: [],
      isLoading: false,
      editarUsuario: {},
      rolesCheckbox: [],
      modalVisible: false,
      selectedRowKeys: [],
      actualItem: {
        content: {},
        finalIndexSame: ''
      },
      modalAusencia: false,
      arrayDeAusencias: [],
      valoresDeBusqueda: '',
      posiblesReemplazos: [],
      reemplazosCheckbox: [],
      dataForFormReemplazo: [],
      modalReplaceVisible: false,
      reemplazosSeleccionados: [],
      checkboxSelected: false,
      checkboxItems: false,
      loadingEliminarReemplazo: false,
      loadingRoles: false,
      listaAjustadores: [],
      loadingAjustadores: false,
      loadingEditar: false,
      loadingAusencia: false,
      loadingReemplazo: false
    };
    this.resetItems = this.resetItems.bind(this);
    this.checkboxRoles = this.checkboxRoles.bind(this);
    this.setearLoadingToFalse = this.setearLoadingToFalse.bind(this);
    this.seteaSelectedRowKeysEmpty = this.seteaSelectedRowKeysEmpty.bind(this);
    this.filtrarRolesInternoExterno = this.filtrarRolesInternoExterno.bind(this);
    this.setearSeleccionadosCheckbox = this.setearSeleccionadosCheckbox.bind(this);
    this.modificarModalYEditarUsuario = this.modificarModalYEditarUsuario.bind(this);
  }

  // Trae data estática
  async componentDidMount() {
    const { listaRoles, errorTeams, listaCargos, listaEquipos, listaPersonas } = this.props;

    const promises = [];

    promises.push(listaCargos());
    promises.push(listaPersonas());
    promises.push(listaRoles());
    promises.push(
      listaEquipos().finally(() => {
        if (errorTeams) {
          showErrorMessage(errorTeams.message);
        }
      })
    );
    try {
      await Promise.all(promises);
    } catch (e) {
      showErrorMessage(e);
    }
    this.actualizarRoles();
  }

  // Desmonta data
  componentWillUnmount() {
    const { reset, resetListaRoles, resetListaAusencias, resetListaAjustadores, resetObtenerReemplazos } = this.props;

    reset();
    resetListaRoles();
    resetListaAusencias();
    resetListaAjustadores();
    resetObtenerReemplazos();
  }

  actualizarRoles = async () => {
    const { listarRoles } = this.props;

    const itemsWithCampo = await listarRoles
      .filter(rol => rol.idTipoUsuario !== 'PRAC' && rol.tipoPerfil === 1)
      .map(item => {
        return { ...item, campo: 'posibles' };
      });
    this.setState({ items: itemsWithCampo });
    return itemsWithCampo;
  };

  setearValoresDeBusqueda = valoresDeBusqueda => this.setState({ valoresDeBusqueda });

  seteaSelectedRowKeysEmpty = () =>
    this.setState({
      selectedRowKeys: [],
      posiblesReemplazos: [],
      selectedRow: []
    });

  setearLoadingToFalse = () => this.setState({ isLoading: false });

  onSelectedRowKeysChange = async (selectedRowKeys, selectedRow) => {
    const { obtenerPersona, obtenerReemplazos } = this.props;

    this.setState({
      selectedRowKeys,
      selectedRow
    });

    try {
      await obtenerPersona(selectedRow[0]);
      const reemplazos = await obtenerReemplazos(selectedRow[0]);
      this.setearReemplazos(reemplazos);
    } catch (e) {
      await showErrorMessage(e);
    }
  };

  obtengoRoles = obtenerPersona => {
    const { listarRoles } = this.props;
    let roles = [];
    if (
      obtenerPersona &&
      obtenerPersona.length > 0 &&
      obtenerPersona[0].tipoUsuario &&
      obtenerPersona[0].tipoUsuario.length > 0
    ) {
      const rolesUsuario = obtenerPersona[0].tipoUsuario.map(rol => rol.idTipo);
      roles = listarRoles.filter(rol => rolesUsuario.includes(rol.idTipoUsuario));
      return roles;
    }
    return roles;
  };

  // Modificar EDITAR
  obtenerPersona = async record => {
    const { obtenerPersona } = this.props;
    const {
      valoresDeBusqueda: { tipoPersonaUsuario }
    } = this.state;

    try {
      await obtenerPersona(record, tipoPersonaUsuario);
    } catch (e) {
      await showErrorMessage(e);
    }
  };

  obtenerNoPreseleccionados = seleccionados => {
    const { listarRoles } = this.props;

    const elegidos = seleccionados.map(selected => selected.idTipoUsuario);
    const itemsNoSeleccionados = listarRoles
      .filter(item => !elegidos.includes(item.idTipoUsuario))
      .map(rol => {
        return { ...rol, campo: 'posibles' };
      });
    return itemsNoSeleccionados;
  };

  // obtenerJefes = async () => {
  //   const { editarUsuario } = this.state;
  //   const { obtenerJefe } = this.props;

  //   try {
  //     await obtenerJefe(editarUsuario.crgCargo, editarUsuario.crgEquipo);
  //   } catch (e) {
  //     showErrorMessage(e);
  //   }
  // }

  // llamadoServicioJefes = () => {
  //   this.setState({
  //     tituloModal: 'E',
  //     modalVisible: true,
  //   });
  // };

  estadoLoadingEditarInicio = () => {
    this.setState(prevState => {
      return {
        ...prevState,
        loadingEditar: true
      };
    });
  };

  estadoLoadingEditarFin = () => {
    this.setState(prevState => {
      return {
        ...prevState,
        loadingEditar: false
      };
    });
  };

  modificarModalYEditarUsuario = async record => {
    const { listaAjustadores, obtenerPersona } = this.props;

    this.setState({
      tituloModal: 'E',
      modalVisible: true
    });
    this.estadoLoadingEditarInicio();
    const promises = [];
    promises.push(obtenerPersona(record));
    try {
      await Promise.all(promises);
    } catch (e) {
      showErrorMessage(e.message);
    }
    const { obtPersona } = this.props;

    const preSeleccionados =
      (this.obtengoRoles(obtPersona).length > 0 &&
        this.obtengoRoles(obtPersona).map(item => {
          return { ...item, campo: 'seleccionados' };
        })) ||
      [];

    const rolesNoPreseleccionados = this.obtenerNoPreseleccionados(preSeleccionados);

    if (preSeleccionados && preSeleccionados.some(rol => rol.tipoPerfil === 2)) {
      if (preSeleccionados.some(rol => rol.idTipoUsuario === 'AJUST')) {
        this.estadoLoadingAjustadoresInicio();
        listaAjustadores({}, 'R').finally(() => {
          const { listarAjustadores } = this.props;
          const ajustadores = listarAjustadores;
          this.setState({ listaAjustadores: ajustadores });
          this.estadoLoadingAjustadoresFin();
          if (!ajustadores || (ajustadores && ajustadores.length <= 0)) {
            Modal.error({
              title: 'Error',
              content: 'Ocurrió un error al cargar los ajustadores'
            });
          }
        });
        await this.setState({
          items: [],
          selected: preSeleccionados,
          editarUsuario: obtPersona[0]
        });
      }
      await this.setState({
        items: [],
        selected: preSeleccionados,
        editarUsuario: obtPersona[0]
      });
    } else if (
      preSeleccionados &&
      preSeleccionados.some(rol => rol.idTipoUsuario === 'LEGAL') &&
      obtPersona[0].crgCargo !== 7
    ) {
      const idTipoUsuarioPreSelec = preSeleccionados.map(rol => rol.idTipoUsuario);
      const rolesPerfil1 = rolesNoPreseleccionados.filter(
        rol =>
          rol.tipoPerfil === 1 &&
          rol.idTipoUsuario !== 'PRAC' &&
          rol.idTipoUsuario !== 'SALVA' &&
          rol.idTipoUsuario !== 'RECUP' &&
          !idTipoUsuarioPreSelec.includes(rol.idTipoUsuario)
      );
      await this.setState({
        items: rolesPerfil1,
        selected: preSeleccionados,
        editarUsuario: obtPersona[0]
      });
    } else if (
      preSeleccionados &&
      preSeleccionados.some(rol => rol.idTipoUsuario === 'SALVA') &&
      obtPersona[0].crgCargo !== 7
    ) {
      const idTipoUsuarioPreSelec = preSeleccionados.map(rol => rol.idTipoUsuario);
      const rolesPerfil1 = rolesNoPreseleccionados.filter(
        rol =>
          rol.tipoPerfil === 1 &&
          rol.idTipoUsuario !== 'PRAC' &&
          rol.idTipoUsuario !== 'LEGAL' &&
          rol.idTipoUsuario !== 'RECUP' &&
          !idTipoUsuarioPreSelec.includes(rol.idTipoUsuario)
      );

      await this.setState({
        items: rolesPerfil1,
        selected: preSeleccionados,
        editarUsuario: obtPersona[0]
      });
    } else if (
      preSeleccionados &&
      preSeleccionados.some(rol => rol.idTipoUsuario === 'RECUP') &&
      obtPersona[0].crgCargo !== 7
    ) {
      const idTipoUsuarioPreSelec = preSeleccionados.map(rol => rol.idTipoUsuario);
      const rolesPerfil1 = rolesNoPreseleccionados.filter(
        rol =>
          rol.tipoPerfil === 1 &&
          rol.idTipoUsuario !== 'PRAC' &&
          rol.idTipoUsuario !== 'LEGAL' &&
          rol.idTipoUsuario !== 'SALVA' &&
          !idTipoUsuarioPreSelec.includes(rol.idTipoUsuario)
      );
      await this.setState({
        items: rolesPerfil1,
        selected: preSeleccionados,
        editarUsuario: obtPersona[0]
      });
    } else if (preSeleccionados && preSeleccionados.some(rol => rol.tipoPerfil === 1) && obtPersona[0].crgCargo !== 7) {
      const idTipoUsuarioPreSelec = preSeleccionados.map(rol => rol.idTipoUsuario);
      const rolesPerfil1 = rolesNoPreseleccionados.filter(
        rol =>
          rol.tipoPerfil === 1 && rol.idTipoUsuario !== 'PRAC' && !idTipoUsuarioPreSelec.includes(rol.idTipoUsuario)
      );
      await this.setState({
        items: rolesPerfil1,
        selected: preSeleccionados,
        editarUsuario: obtPersona[0]
      });
    } else if (obtPersona[0].crgCargo === 7) {
      await this.setState({
        items: [],
        selected: preSeleccionados,
        editarUsuario: obtPersona[0]
      });
    } else if (
      preSeleccionados &&
      preSeleccionados.some(
        rol =>
          rol.tipoPerfil === 1 &&
          rol.idTipoUsuario !== 'LEGAL' &&
          rol.idTipoUsuario !== 'RECUP' &&
          rol.idTipoUsuario !== 'SALVA'
      ) &&
      obtPersona[0].crgCargo !== 7
    ) {
      const idTipoUsuarioPreSelec = preSeleccionados.map(rol => rol.idTipoUsuario);
      const rolesPerfil1 = rolesNoPreseleccionados.filter(
        rol =>
          rol.tipoPerfil === 1 && rol.idTipoUsuario !== 'PRAC' && !idTipoUsuarioPreSelec.includes(rol.idTipoUsuario)
      );
      await this.setState({
        items: rolesPerfil1,
        selected: preSeleccionados,
        editarUsuario: obtPersona[0]
      });
    } else {
      await this.setState({
        selected: preSeleccionados,
        items: rolesNoPreseleccionados,
        editarUsuario: obtPersona[0]
      });
    }
    // this.llamadoServicioJefes();
    this.estadoLoadingEditarFin();
  };

  checkboxRoles = async (e, items, rolesCheckbox, indicador, selected) => {
    const { listarRoles } = this.props;

    if (indicador === 'seleccionados' && !e.target.checked) {
      if (e.target.value === 'AJUST') {
        await this.setState({
          rolesCheckbox: [],
          items: []
        });
      } else if (e.target.value === 'P') {
        await this.setState({
          rolesCheckbox: [],
          items: []
        });
      } else if (e.target.value === 'CEMER') {
        await this.setState({
          rolesCheckbox: [],
          items: []
        });
      } else if (e.target.value === 'LEGAL') {
        const idSelected = selected.map(rol => rol.idTipoUsuario);
        const rolesASelected = rolesCheckbox.filter(item => item !== e.target.value);
        const itemsInternoUnchecked = listarRoles
          .filter(
            rol =>
              rol.tipoPerfil === 1 &&
              rol.idTipoUsuario !== 'PRAC' &&
              rol.idTipoUsuario !== e.target.value &&
              rol.idTipoUsuario !== 'SALVA' &&
              rol.idTipoUsuario !== 'RECUP' &&
              !idSelected.includes(rol.idTipoUsuario)
          )
          .map(rol => {
            return { ...rol, campo: 'seleccionados' };
          });
        await this.setState({
          rolesCheckbox: rolesASelected,
          items: itemsInternoUnchecked
        });
      } else if (e.target.value === 'SALVA') {
        const idSelected = selected.map(rol => rol.idTipoUsuario);
        const itemsInternoUnchecked = listarRoles
          .filter(
            rol =>
              rol.tipoPerfil === 1 &&
              rol.idTipoUsuario !== 'PRAC' &&
              rol.idTipoUsuario !== e.target.value &&
              rol.idTipoUsuario !== 'LEGAL' &&
              rol.idTipoUsuario !== 'RECUP' &&
              !idSelected.includes(rol.idTipoUsuario)
          )
          .map(rol => {
            return { ...rol, campo: 'seleccionados' };
          });
        const rolesASelected = rolesCheckbox.filter(item => item !== e.target.value);
        await this.setState({
          rolesCheckbox: rolesASelected,
          items: itemsInternoUnchecked
        });
      } else if (e.target.value === 'RECUP') {
        const idSelected = selected.map(rol => rol.idTipoUsuario);
        const itemsInternoUnchecked = listarRoles
          .filter(
            rol =>
              rol.tipoPerfil === 1 &&
              rol.idTipoUsuario !== 'PRAC' &&
              rol.idTipoUsuario !== e.target.value &&
              rol.idTipoUsuario !== 'SALVA' &&
              rol.idTipoUsuario !== 'LEGAL' &&
              !idSelected.includes(rol.idTipoUsuario)
          )
          .map(rol => {
            return { ...rol, campo: 'seleccionados' };
          });
        const rolesASelected = rolesCheckbox.filter(item => item !== e.target.value);
        await this.setState({
          rolesCheckbox: rolesASelected,
          items: itemsInternoUnchecked
        });
      } else {
        const rolesASelected = rolesCheckbox.filter(item => item !== e.target.value);
        await this.setState({ rolesCheckbox: rolesASelected });
      }
    }
    if (indicador === 'posibles' && !e.target.checked) {
      if (e.target.value === 'AJUST' || e.target.value === 'P' || e.target.value === 'CEMER') {
        const itemsExternoUnchecked = listarRoles
          .filter(rol => rol.tipoPerfil === 2)
          .map(rol => {
            return { ...rol, campo: 'posibles' };
          });

        await this.setState({
          rolesCheckbox: [],
          items: itemsExternoUnchecked
        });
      } else if (e.target.value === 'LEGAL') {
        const idSelected = selected.map(rol => rol.idTipoUsuario);
        const rolesASelected = rolesCheckbox.filter(item => item !== e.target.value);
        const itemsInternoUnchecked = listarRoles
          .filter(
            rol => rol.tipoPerfil === 1 && rol.idTipoUsuario !== 'PRAC' && !idSelected.includes(rol.idTipoUsuario)
          )
          .map(rol => {
            return { ...rol, campo: 'posibles' };
          });
        await this.setState({
          rolesCheckbox: rolesASelected,
          items: itemsInternoUnchecked
        });
      } else if (e.target.value === 'SALVA') {
        const idSelected = selected.map(rol => rol.idTipoUsuario);
        const itemsInternoUnchecked = listarRoles
          .filter(
            rol => rol.tipoPerfil === 1 && rol.idTipoUsuario !== 'PRAC' && !idSelected.includes(rol.idTipoUsuario)
          )
          .map(rol => {
            return { ...rol, campo: 'posibles' };
          });
        const rolesASelected = rolesCheckbox.filter(item => item !== e.target.value);
        await this.setState({
          rolesCheckbox: rolesASelected,
          items: itemsInternoUnchecked
        });
      } else if (e.target.value === 'RECUP') {
        const idSelected = selected.map(rol => rol.idTipoUsuario);
        const itemsInternoUnchecked = listarRoles
          .filter(
            rol => rol.tipoPerfil === 1 && rol.idTipoUsuario !== 'PRAC' && !idSelected.includes(rol.idTipoUsuario)
          )
          .map(rol => {
            return { ...rol, campo: 'posibles' };
          });
        const rolesASelected = rolesCheckbox.filter(item => item !== e.target.value);
        await this.setState({
          rolesCheckbox: rolesASelected,
          items: itemsInternoUnchecked
        });
      } else {
        const rolesASelected = rolesCheckbox.filter(item => item !== e.target.value);
        await this.setState({ rolesCheckbox: rolesASelected });
      }
    }
    if (indicador === 'posibles' && e.target.checked) {
      if (e.target.value === 'AJUST' || e.target.value === 'P' || e.target.value === 'CEMER') {
        const itemsExternoChecked = items.filter(item => item.idTipoUsuario === e.target.value);
        const rolCheckboxExterno = [itemsExternoChecked[0].idTipoUsuario];
        await this.setState({
          items: itemsExternoChecked,
          rolesCheckbox: rolCheckboxExterno
        });
      } else if (e.target.value === 'SALVA') {
        const itemsExternoChecked = items.filter(
          item => item.idTipoUsuario !== 'RECUP' && item.idTipoUsuario !== 'LEGAL'
        );
        await this.setState(prevState => {
          const arrayPrevioEstadoCheckbox = [...prevState.rolesCheckbox];
          arrayPrevioEstadoCheckbox.push(e.target.value);
          return {
            items: itemsExternoChecked,
            rolesCheckbox: arrayPrevioEstadoCheckbox,
            checkboxItems: true
          };
        });
      } else if (e.target.value === 'RECUP') {
        const itemsExternoChecked = items.filter(
          item => item.idTipoUsuario !== 'SALVA' && item.idTipoUsuario !== 'LEGAL'
        );
        await this.setState(prevState => {
          const arrayPrevioEstadoCheckbox = [...prevState.rolesCheckbox];
          arrayPrevioEstadoCheckbox.push(e.target.value);
          return {
            items: itemsExternoChecked,
            rolesCheckbox: arrayPrevioEstadoCheckbox,
            checkboxItems: true
          };
        });
      } else if (e.target.value === 'LEGAL') {
        const itemsExternoChecked = items.filter(
          item => item.idTipoUsuario !== 'SALVA' && item.idTipoUsuario !== 'RECUP'
        );
        await this.setState(prevState => {
          const arrayPrevioEstadoCheckbox = [...prevState.rolesCheckbox];
          arrayPrevioEstadoCheckbox.push(e.target.value);
          return {
            items: itemsExternoChecked,
            rolesCheckbox: arrayPrevioEstadoCheckbox,
            checkboxItems: true
          };
        });
      } else {
        await this.setState(prevState => {
          const arrayPrevioEstadoCheckbox = [...prevState.rolesCheckbox];
          arrayPrevioEstadoCheckbox.push(e.target.value);
          return {
            rolesCheckbox: arrayPrevioEstadoCheckbox,
            checkboxItems: true
          };
        });
      }
    }
    if (indicador === 'seleccionados' && e.target.checked) {
      await this.setState(prevState => {
        const arrayCheckbox = [...prevState.rolesCheckbox];
        arrayCheckbox.push(e.target.value);
        return {
          rolesCheckbox: arrayCheckbox,
          checkboxSelected: true
        };
      });
    }
  };

  itemsConCampo = (listarRoles, perfil) => {
    const perfilAnumero = parseInt(perfil, 10);
    const roles = listarRoles
      .filter(rol => rol.idTipoUsuario !== 'PRAC' && rol.tipoPerfil === perfilAnumero)
      .map(item => {
        return { ...item, campo: 'posibles' };
      });
    return roles;
  };

  handleAgregarOK = () => {
    const { listaPersonas } = this.props;
    this.setState({
      rolesCheckbox: [],
      editarUsuario: [],
      modalVisible: false
    });
    listaPersonas();
  };

  despuesDeCerrar = async () =>
    this.setState({
      items: [],
      selected: [],
      rolesCheckbox: [],
      editarUsuario: []
    });

  setearItemsRoles = items =>
    this.setState({
      items,
      selected: []
    });

  resetRolesCheckbox = () => this.setState({ rolesCheckbox: [] });

  resetItems = () => this.setState({ items: [] });

  actualizarMargenes = tipoModal => {
    let arrayMargenes = [];

    if (tipoModal === 'Agregar') {
      if (window.innerWidth <= 576) {
        arrayMargenes = ['arrow-down', 'arrow-up'];
        return arrayMargenes;
      }
      arrayMargenes = ['arrow-right', 'arrow-left'];
      return arrayMargenes;
    }
    if (tipoModal === 'Reemplazo') {
      if (window.innerWidth <= 768) {
        arrayMargenes = ['arrow-down', 'arrow-up'];
        return arrayMargenes;
      }
      arrayMargenes = ['arrow-right', 'arrow-left'];
      return arrayMargenes;
    }
    return arrayMargenes;
  };

  modalAgregarUsuario = async () => {
    this.setState({
      tituloModal: 'A',
      modalVisible: true
    });
    this.actualizarRoles();
  };

  handleDeleteDragDrop = async (e, item) => {
    const { listarRoles } = this.props;
    const { selected, rolesCheckbox } = this.state;

    e.preventDefault();

    if (item.idTipoUsuario === 'AJUST' || item.idTipoUsuario === 'P' || item.idTipoUsuario === 'CEMER') {
      const cadaItem = { ...item };
      cadaItem.campo = 'posibles';
      const newItems = listarRoles
        .filter(rol => rol.tipoPerfil === 2)
        .map(eachItem => {
          return { ...eachItem, campo: 'posibles' };
        });
      await this.setState({
        selected: [],
        items: newItems,
        rolesCheckbox: []
      });
    } else if (item.idTipoUsuario === 'LEGAL') {
      const cadaItem = { ...item };
      cadaItem.campo = 'posibles';

      const salvamento = listarRoles
        .filter(rol => rol.idTipoUsuario === 'SALVA')
        .map(rol => {
          return { ...rol, campo: 'posibles' };
        });

      const recupero = listarRoles
        .filter(rol => rol.idTipoUsuario === 'RECUP')
        .map(rol => {
          return { ...rol, campo: 'posibles' };
        });

      const filtrarSelected = selected.filter(select => select.idTipoUsuario !== item.idTipoUsuario);

      const filtrarRolesCheckbox = rolesCheckbox.filter(rol => rol !== item.idTipoUsuario);

      await this.setState(prevState => {
        const newItems = [...prevState.items, cadaItem, salvamento[0], recupero[0]];
        return {
          items: newItems,
          selected: filtrarSelected,
          rolesCheckbox: filtrarRolesCheckbox
        };
      });
    } else if (item.idTipoUsuario === 'SALVA') {
      const cadaItem = { ...item };
      cadaItem.campo = 'posibles';
      const legal = listarRoles
        .filter(rol => rol.idTipoUsuario === 'LEGAL')
        .map(rol => {
          return { ...rol, campo: 'posibles' };
        });

      const recupero = listarRoles
        .filter(rol => rol.idTipoUsuario === 'RECUP')
        .map(rol => {
          return { ...rol, campo: 'posibles' };
        });

      const filtrarSelected = selected.filter(select => select.idTipoUsuario !== item.idTipoUsuario);
      const filtrarRolesCheckbox = rolesCheckbox.filter(rol => rol !== item.idTipoUsuario);
      await this.setState(prevState => {
        const newItems = [...prevState.items, cadaItem, legal[0], recupero[0]];
        return {
          items: newItems,
          selected: filtrarSelected,
          rolesCheckbox: filtrarRolesCheckbox
        };
      });
    } else if (item.idTipoUsuario === 'RECUP') {
      const cadaItem = { ...item };
      cadaItem.campo = 'posibles';
      const salvamento = listarRoles
        .filter(rol => rol.idTipoUsuario === 'SALVA')
        .map(rol => {
          return { ...rol, campo: 'posibles' };
        });

      const legal = listarRoles
        .filter(rol => rol.idTipoUsuario === 'LEGAL')
        .map(rol => {
          return { ...rol, campo: 'posibles' };
        });

      const filtrarSelected = selected.filter(select => select.idTipoUsuario !== item.idTipoUsuario);
      const filtrarRolesCheckbox = rolesCheckbox.filter(rol => rol !== item.idTipoUsuario);
      await this.setState(prevState => {
        const newItems = [...prevState.items, cadaItem, salvamento[0], legal[0]];
        return {
          items: newItems,
          selected: filtrarSelected,
          rolesCheckbox: filtrarRolesCheckbox
        };
      });
    } else {
      await this.setState(prevState => {
        const cadaItem = { ...item };
        cadaItem.campo = 'posibles';
        const newItems = [...prevState.items, cadaItem];
        const filtrarSelected = selected.filter(select => select.idTipoUsuario !== item.idTipoUsuario);
        const filtrarRolesCheckbox = rolesCheckbox.filter(rol => rol !== item.idTipoUsuario);
        return {
          items: newItems,
          selected: filtrarSelected,
          rolesCheckbox: filtrarRolesCheckbox
        };
      });
    }
  };

  validateBeforeUpdate = record =>
    isNullOrUndefined(record) || record === '' ? String('Valor no puede ser vacío') : null;

  setearRolPracticante = value => {
    const { listarRoles } = this.props;

    if (value === 7) {
      const rolPracticante = listarRoles.filter(item => item.idTipoUsuario === 'PRAC');
      this.setState({
        selected: [],
        items: rolPracticante
      });
    }
  };

  alCancelarAgregarOEditar = () => {
    const { resetListaAjustadores } = this.props;

    this.setState({
      items: [],
      selected: [],
      tituloModal: '',
      rolesCheckbox: [],
      modalVisible: false,
      actualItem: {
        content: {},
        finalIndexSame: ''
      }
    });
    resetListaAjustadores();
  };

  filtrarRolesInternoExterno = valor => {
    const { listarRoles } = this.props;

    if (valor === '1') {
      const rolesInternos = listarRoles
        .filter(rol => rol.tipoPerfil === 1 && rol.idTipoUsuario !== 'PRAC')
        .map(item => {
          return { ...item, campo: 'posibles' };
        });
      this.setState({
        items: rolesInternos,
        rolesCheckbox: []
      });
    } else if (valor === '2') {
      const rolesExternos = listarRoles
        .filter(rol => rol.tipoPerfil === 2)
        .map(item => {
          return { ...item, campo: 'posibles' };
        });
      this.setState({
        items: rolesExternos,
        rolesCheckbox: []
      });
    } else {
      const roles = listarRoles.map(item => {
        return { ...item, campo: 'posibles' };
      });
      this.setState({
        items: roles,
        rolesCheckbox: []
      });
    }
    this.setState({
      selected: [],
      rolesCheckbox: []
    });
  };

  estadoLoadingAjustadoresInicio = () =>
    this.setState(prevState => {
      return {
        ...prevState,
        loadingAjustadores: true
      };
    });

  estadoLoadingAjustadoresFin = () =>
    this.setState(prevState => {
      return {
        ...prevState,
        loadingAjustadores: false
      };
    });

  setearSeleccionadosCheckbox = async (indicador, rolesCheckbox, items, selected, perfil) => {
    const { listarRoles, listaAjustadores } = this.props;

    if (indicador === 'seleccionados') {
      if (rolesCheckbox[0] === 'AJUST') {
        this.estadoLoadingAjustadoresInicio();
        listaAjustadores({}, 'R').finally(() => {
          const { listarAjustadores } = this.props;
          const ajustadores = listarAjustadores;
          this.setState({ listaAjustadores: ajustadores });
          this.estadoLoadingAjustadoresFin();
          if (!ajustadores || (ajustadores && ajustadores.length <= 0)) {
            Modal.error({
              title: 'Error',
              content: 'Ocurrió un error al cargar los ajustadores'
            });
          }
        });
        const seleccionadosCheckbox = listarRoles
          .filter(item => rolesCheckbox.includes(item.idTipoUsuario))
          .map(item => {
            return { ...item, campo: 'seleccionados' };
          });
        await this.setState({
          items: [],
          rolesCheckbox: [],
          selected: seleccionadosCheckbox
        });
      } else if (rolesCheckbox.some(rol => rol === 'RECUP')) {
        const itemsCheckbox = items.filter(
          item =>
            !rolesCheckbox.includes(item.idTipoUsuario) &&
            item.idTipoUsuario !== 'SALVA' &&
            item.idTipoUsuario !== 'LEGAL'
        );

        const seleccionadosCheckbox = listarRoles
          .filter(item => rolesCheckbox.includes(item.idTipoUsuario))
          .map(item => {
            return { ...item, campo: 'seleccionados' };
          });
        await this.setState(prevState => {
          const selectedCheckbox = [...prevState.selected];
          const selectedPrevioEstadoYNuevo = selectedCheckbox.concat(seleccionadosCheckbox);
          return {
            rolesCheckbox: [],
            items: itemsCheckbox,
            selected: selectedPrevioEstadoYNuevo,
            checkboxItems: false
          };
        });
      } else if (rolesCheckbox.some(rol => rol === 'SALVA')) {
        const itemsCheckbox = items.filter(
          item =>
            !rolesCheckbox.includes(item.idTipoUsuario) &&
            item.idTipoUsuario !== 'LEGAL' &&
            item.idTipoUsuario !== 'RECUP'
        );

        const seleccionadosCheckbox = listarRoles
          .filter(item => rolesCheckbox.includes(item.idTipoUsuario))
          .map(item => {
            return { ...item, campo: 'seleccionados' };
          });
        await this.setState(prevState => {
          const selectedCheckbox = [...prevState.selected];
          const selectedPrevioEstadoYNuevo = selectedCheckbox.concat(seleccionadosCheckbox);
          return {
            rolesCheckbox: [],
            items: itemsCheckbox,
            selected: selectedPrevioEstadoYNuevo,
            checkboxItems: false
          };
        });
      } else if (rolesCheckbox.some(rol => rol === 'LEGAL')) {
        const itemsCheckbox = items.filter(
          item =>
            !rolesCheckbox.includes(item.idTipoUsuario) &&
            item.idTipoUsuario !== 'SALVA' &&
            item.idTipoUsuario !== 'RECUP'
        );

        const seleccionadosCheckbox = listarRoles
          .filter(item => rolesCheckbox.includes(item.idTipoUsuario))
          .map(item => {
            return { ...item, campo: 'seleccionados' };
          });
        await this.setState(prevState => {
          const selectedCheckbox = [...prevState.selected];
          const selectedPrevioEstadoYNuevo = selectedCheckbox.concat(seleccionadosCheckbox);
          return {
            rolesCheckbox: [],
            items: itemsCheckbox,
            selected: selectedPrevioEstadoYNuevo,
            checkboxItems: false
          };
        });
      } else {
        const itemsCheckbox = items.filter(item => !rolesCheckbox.includes(item.idTipoUsuario));
        const seleccionadosCheckbox = listarRoles
          .filter(item => rolesCheckbox.includes(item.idTipoUsuario))
          .map(item => {
            return { ...item, campo: 'seleccionados' };
          });
        await this.setState(prevState => {
          const selectedCheckbox = [...prevState.selected];
          const selectedPrevioEstadoYNuevo = selectedCheckbox.concat(seleccionadosCheckbox);
          return {
            rolesCheckbox: [],
            items: itemsCheckbox,
            selected: selectedPrevioEstadoYNuevo,
            checkboxItems: false
          };
        });
      }
    }
    if (indicador === 'posibles') {
      if (perfil === '2') {
        const itemsCheckbox = listarRoles
          .filter(rol => rol.tipoPerfil === 2 && !rolesCheckbox.includes(rol.idTipoUsuario))
          .map(item => {
            return { ...item, campo: 'posibles' };
          });
        await this.setState({
          items: itemsCheckbox,
          selected: [],
          rolesCheckbox: []
        });
      }
      if (rolesCheckbox.some(item => item === 'LEGAL')) {
        const seleccionadosCheckbox = selected.filter(item => !rolesCheckbox.includes(item.idTipoUsuario));
        const itemsCheckbox = listarRoles
          .filter(item => rolesCheckbox.includes(item.idTipoUsuario))
          .map(item => {
            return { ...item, campo: 'posibles' };
          });
        const salvamento = listarRoles
          .filter(item => item.idTipoUsuario === 'SALVA')
          .map(item => {
            return { ...item, campo: 'posibles' };
          });
        const recupero = listarRoles
          .filter(item => item.idTipoUsuario === 'RECUP')
          .map(item => {
            return { ...item, campo: 'posibles' };
          });
        await this.setState(prevState => {
          const itemsPrevioEstadoCheckbox = [...prevState.items];
          const itemsPrevioEstadoYNuevo = itemsPrevioEstadoCheckbox.concat(itemsCheckbox, salvamento, recupero);
          return {
            rolesCheckbox: [],
            items: itemsPrevioEstadoYNuevo,
            selected: seleccionadosCheckbox,
            checkboxSelected: false
          };
        });
      } else if (rolesCheckbox.some(item => item === 'SALVA')) {
        const seleccionadosCheckbox = selected.filter(item => !rolesCheckbox.includes(item.idTipoUsuario));
        const itemsCheckbox = listarRoles
          .filter(item => rolesCheckbox.includes(item.idTipoUsuario))
          .map(item => {
            return { ...item, campo: 'posibles' };
          });
        const legal = listarRoles
          .filter(item => item.idTipoUsuario === 'LEGAL')
          .map(item => {
            return { ...item, campo: 'posibles' };
          });
        const recupero = listarRoles
          .filter(item => item.idTipoUsuario === 'RECUP')
          .map(item => {
            return { ...item, campo: 'posibles' };
          });
        await this.setState(prevState => {
          const itemsPrevioEstadoCheckbox = [...prevState.items];
          const itemsPrevioEstadoYNuevo = itemsPrevioEstadoCheckbox.concat(itemsCheckbox, legal, recupero);
          return {
            rolesCheckbox: [],
            items: itemsPrevioEstadoYNuevo,
            selected: seleccionadosCheckbox,
            checkboxSelected: false
          };
        });
      } else if (rolesCheckbox.some(item => item === 'RECUP')) {
        const seleccionadosCheckbox = selected.filter(item => !rolesCheckbox.includes(item.idTipoUsuario));
        const itemsCheckbox = listarRoles
          .filter(item => rolesCheckbox.includes(item.idTipoUsuario))
          .map(item => {
            return { ...item, campo: 'posibles' };
          });
        const legal = listarRoles
          .filter(item => item.idTipoUsuario === 'LEGAL')
          .map(item => {
            return { ...item, campo: 'posibles' };
          });
        const salvamento = listarRoles
          .filter(item => item.idTipoUsuario === 'SALVA')
          .map(item => {
            return { ...item, campo: 'posibles' };
          });
        await this.setState(prevState => {
          const itemsPrevioEstadoCheckbox = [...prevState.items];
          const itemsPrevioEstadoYNuevo = itemsPrevioEstadoCheckbox.concat(itemsCheckbox, legal, salvamento);
          return {
            rolesCheckbox: [],
            items: itemsPrevioEstadoYNuevo,
            selected: seleccionadosCheckbox,
            checkboxSelected: false
          };
        });
      } else {
        const seleccionadosCheckbox = selected.filter(item => !rolesCheckbox.includes(item.idTipoUsuario));
        const itemsCheckbox = listarRoles
          .filter(item => rolesCheckbox.includes(item.idTipoUsuario))
          .map(item => {
            return { ...item, campo: 'posibles' };
          });
        await this.setState(prevState => {
          const itemsPrevioEstadoCheckbox = [...prevState.items];
          const itemsPrevioEstadoYNuevo = itemsPrevioEstadoCheckbox.concat(itemsCheckbox);
          return {
            rolesCheckbox: [],
            items: itemsPrevioEstadoYNuevo,
            selected: seleccionadosCheckbox,
            checkboxSelected: false
          };
        });
      }
    }
  };

  onOkForm = () => this.setState({ modalAusencia: false });

  estadoLoadingAusenciaInicio = () =>
    this.setState(prevState => {
      return {
        ...prevState,
        loadingAusencia: true
      };
    });

  estadoLoadingAusenciaFin = () =>
    this.setState(prevState => {
      return {
        ...prevState,
        loadingAusencia: false
      };
    });

  modalAgregarAusencia = () => {
    const { listaAusencias } = this.props;
    const { selectedRow } = this.state;
    this.setState({ modalAusencia: true });
    this.estadoLoadingAusenciaInicio();
    listaAusencias(selectedRow[0].crgPersona).finally(() => {
      const { listarAusencias } = this.props;
      this.setState({
        arrayDeAusencias: listarAusencias.listarAusencias
      });
      this.estadoLoadingAusenciaFin();
      if (
        !listarAusencias ||
        (listarAusencias && listarAusencias.listarAusencias && listarAusencias.listarAusencias.length < 0)
      ) {
        Modal.error({
          title: 'Error',
          content: 'Ocurrió un error al cargar las ausencias'
        });
      }
    });
  };

  handleCancelarAusencia = () => this.setState({ modalAusencia: false });

  setearDataParaFormReemplazo = persona => this.setState({ dataForFormReemplazo: persona });

  setearReemplazos = reemplazos => {
    const { listarPosiblesReemplazos } = this.props;

    if (reemplazos.data && reemplazos.data.length > 0) {
      const filterObtenerReemplazos = reemplazos.data.map(reemplazo => reemplazo.crgPersona);
      const noRepetidos = listarPosiblesReemplazos.listarReemplazos.filter(
        reemplazo => !filterObtenerReemplazos.includes(reemplazo.crgPersona)
      );

      const reemplazosConCampo = reemplazos.data.map(reemplazo => {
        return { ...reemplazo, campo: 'reemplazosElegidos' };
      });

      this.setState({
        posiblesReemplazos: noRepetidos,
        reemplazosSeleccionados: reemplazosConCampo
      });
    }
  };

  obtenerReemplazos = async () => {
    const { listarPosiblesReemplazos } = this.props;

    const listaPosiblesReemplazosConCampo = listarPosiblesReemplazos.listarReemplazos.map((candidato, index) => {
      const copiaCandidato = Object.assign(candidato);
      copiaCandidato.campo = 'candidatos';
      copiaCandidato.key = index;
      return copiaCandidato;
    });
    await this.setState({ posiblesReemplazos: listaPosiblesReemplazosConCampo });
  };

  estadoLoadingReemplazoInicio = () =>
    this.setState(prevState => {
      return {
        ...prevState,
        loadingReemplazo: true
      };
    });

  estadoLoadingReemplazoFin = () =>
    this.setState(prevState => {
      return {
        ...prevState,
        loadingReemplazo: false
      };
    });

  modalReemplazo = async () => {
    const { selectedRow } = this.state;
    const { obtPersona, listaReemplazos, obtenerReemplazos } = this.props;

    this.setState({
      selectedRow,
      modalReplaceVisible: true
    });
    this.estadoLoadingReemplazoInicio();
    obtenerReemplazos(selectedRow[0]).finally(() => {
      const { obtReemplazos, listarPosiblesReemplazos } = this.props;

      const filterObtenerReemplazos = obtReemplazos.obtenerReemplazos.map(reemplazo => reemplazo.crgPersona);
      const noRepetidos = listarPosiblesReemplazos.listarReemplazos.filter(
        reemplazo => !filterObtenerReemplazos.includes(reemplazo.crgPersona)
      );

      const reemplazosConCampo = obtReemplazos.obtenerReemplazos.map(reemplazo => {
        return { ...reemplazo, campo: 'reemplazosElegidos' };
      });

      this.setState({
        posiblesReemplazos: noRepetidos,
        reemplazosSeleccionados: reemplazosConCampo
      });
    });

    listaReemplazos(selectedRow[0]).finally(() => {
      const { listarPosiblesReemplazos, obtReemplazos } = this.props;
      const pkCandidatos = obtReemplazos.obtenerReemplazos.map(reemplazo => reemplazo.crgPersona);
      const listaPosiblesReemplazosConCampo = listarPosiblesReemplazos.listarReemplazos
        .filter(candidato => !pkCandidatos.includes(candidato.crgPersona))
        .map((candidato, index) => {
          const copiaCandidato = Object.assign(candidato);
          copiaCandidato.campo = 'candidatos';
          copiaCandidato.key = index;
          return copiaCandidato;
        });
      this.setState({ posiblesReemplazos: listaPosiblesReemplazosConCampo });
      this.estadoLoadingReemplazoFin();
      if (
        !listarPosiblesReemplazos ||
        (listarPosiblesReemplazos &&
          listarPosiblesReemplazos.listarReemplazos &&
          listarPosiblesReemplazos.listarReemplazos.length < 0)
      ) {
        Modal.error({
          title: 'Error',
          content: 'Ocurrió un error al cargar los reemplazos'
        });
      }
    });

    this.setearDataParaFormReemplazo(obtPersona[0]);
  };

  handleReemplazoOK = () =>
    this.setState({
      reemplazosCheckbox: [],
      modalReplaceVisible: false
    });

  checkboxReemplazos = async (e, reemplazosCheckbox, indicador) => {
    if ((indicador === 'candidatos' || indicador === 'reemplazosElegidos') && !e.target.checked) {
      const itemsAEstadoReemplazosCheckbox = reemplazosCheckbox.filter(item => item !== e.target.value);
      await this.setState({ reemplazosCheckbox: itemsAEstadoReemplazosCheckbox });
    }
    if ((indicador === 'candidatos' || indicador === 'reemplazosElegidos') && e.target.checked) {
      await this.setState(prevState => {
        const arrayCheckboxReemplazo = [...prevState.reemplazosCheckbox];
        arrayCheckboxReemplazo.push(e.target.value);
        return {
          reemplazosCheckbox: arrayCheckboxReemplazo
        };
      });
    }
  };

  handleCancelarReemplazo = () =>
    this.setState({
      reemplazosCheckbox: [],
      modalReplaceVisible: false,
      reemplazosSeleccionados: []
    });

  despuesDeCerrarReemplazos = async () => {
    const { obtenerPersona, obtenerReemplazos, resetObtenerReemplazos } = this.props;
    const {
      selectedRow,
      valoresDeBusqueda: { tipoPersonaUsuario }
    } = this.state;
    await resetObtenerReemplazos();
    await obtenerPersona(selectedRow[0], tipoPersonaUsuario);
    await obtenerReemplazos(selectedRow[0]);
    this.setState({
      reemplazosCheckbox: [],
      posiblesReemplazos: []
    });
  };

  handleDeleteDragDropReemplazo = async (e, reemplazante) => {
    const { listarPosiblesReemplazos, listaAusencias } = this.props;
    const { reemplazosSeleccionados, reemplazosCheckbox, selectedRow } = this.state;
    e.preventDefault();
    await this.setState({ loadingEliminarReemplazo: true });

    const ausencia = await listaAusencias(selectedRow[0].crgPersona);

    if (reemplazosSeleccionados.length === 1 && ausencia.data.length > 0) {
      Modal.error({
        title: 'Ausencia programada',
        content: (
          <div>
            <p>Usted tiene una ausencia programada, no puede eliminar reemplazo</p>
          </div>
        )
      });
    } else {
      const reemplazoACandidato = listarPosiblesReemplazos.listarReemplazos.filter(
        candidato => candidato.crgPersona === reemplazante.crgPersona
      );
      await this.setState(prevState => {
        const cadaItem = reemplazoACandidato[0];
        cadaItem.campo = 'candidatos';
        const newItems = [...prevState.posiblesReemplazos, cadaItem];
        const filtrarReemplazosCheckbox = reemplazosCheckbox.filter(reemplazo => reemplazo !== reemplazante.crgPersona);
        const filtrarReemplazosSeleccionados = reemplazosSeleccionados.filter(
          reemplazo => reemplazo.crgPersona !== reemplazante.crgPersona
        );
        return {
          posiblesReemplazos: newItems,
          reemplazosCheckbox: filtrarReemplazosCheckbox,
          reemplazosSeleccionados: filtrarReemplazosSeleccionados
        };
      });
    }
    return this.setState({ loadingEliminarReemplazo: false });
  };

  setearSeleccionadosCheckboxReemplazos = async (
    indicador,
    reemplazosCheckbox,
    posiblesReemplazos,
    reemplazosSeleccionados
  ) => {
    const { listarPosiblesReemplazos } = this.props;

    if (indicador === 'reemplazosElegidos') {
      const posiblesReemplazosCheckbox = posiblesReemplazos.filter(
        posible => !reemplazosCheckbox.includes(posible.crgPersona)
      );

      const seleccionadosCheckbox = listarPosiblesReemplazos.listarReemplazos
        .filter(candidato => reemplazosCheckbox.includes(candidato.crgPersona))
        .map(posible => {
          return { ...posible, campo: 'reemplazosElegidos' };
        });

      await this.setState(prevState => {
        const reemplazosSeleccionadosCheckbox = [...prevState.reemplazosSeleccionados];
        const reemplazosSeleccionadosPrevioEstadoYNuevo = reemplazosSeleccionadosCheckbox.concat(seleccionadosCheckbox);
        return {
          reemplazosCheckbox: [],
          posiblesReemplazos: posiblesReemplazosCheckbox,
          reemplazosSeleccionados: reemplazosSeleccionadosPrevioEstadoYNuevo
        };
      });
    }
    if (indicador === 'candidatos') {
      const seleccionadosCheckbox = reemplazosSeleccionados.filter(
        seleccionado => !reemplazosCheckbox.includes(seleccionado.crgPersona)
      );

      const posiblesReemplazosCheckbox = listarPosiblesReemplazos.listarReemplazos
        .filter(posible => reemplazosCheckbox.includes(posible.crgPersona))
        .map(candidato => {
          return { ...candidato, campo: 'candidatos' };
        });

      await this.setState(prevState => {
        const posiblesReemplazosPrevioEstadoCheckbox = [...prevState.posiblesReemplazos];
        const posiblesReemplazosPrevioEstadoYNuevo = posiblesReemplazosPrevioEstadoCheckbox.concat(
          posiblesReemplazosCheckbox
        );
        return {
          reemplazosCheckbox: [],
          reemplazosSeleccionados: seleccionadosCheckbox,
          posiblesReemplazos: posiblesReemplazosPrevioEstadoYNuevo
        };
      });
    }
  };

  afterCloseAusencia = async () => {
    const { resetListaAusencias } = this.props;

    this.setState({
      arrayDeAusencias: []
    });
    await resetListaAusencias();
  };

  // ----->
  afterCloseReemplazo = async () => {
    const { resetObtenerReemplazos } = this.props;

    this.setState({
      arrayDeAusencias: []
    });
    await resetObtenerReemplazos();
  };

  redirectToTarget = () => {
    const { history } = this.props;
    history.push('/');
  };

  render() {
    const {
      items,
      selected,
      checkboxSelected,
      checkboxItems,
      selectedRow,
      tituloModal,
      loadingRoles,
      modalVisible,
      rolesCheckbox,
      editarUsuario,
      modalAusencia,
      loadingEditar,
      loadingAusencia,
      selectedRowKeys,
      arrayDeAusencias,
      loadingReemplazo,
      valoresDeBusqueda,
      habilitarCheckbox,
      reemplazosCheckbox,
      posiblesReemplazos,
      loadingAjustadores,
      modalReplaceVisible,
      dataForFormReemplazo,
      reemplazosSeleccionados,
      loadingEliminarReemplazo
    } = this.state;

    const {
      obtPersona,
      listarRoles,
      listarCargo,
      listarPersona,
      listarEquipos,
      obtReemplazos,
      listarAjustadores,
      loadingListarCargo,
      loadingListarEquipos,
      loadingListarPersona
    } = this.props;

    const teamsItems = listarEquipos.map(team => (
      <Select.Option key={team.idEquipo} value={team.idEquipo}>
        {team.equipo}
      </Select.Option>
    ));

    const cargoItems = listarCargo
      .filter(rol => rol.pkCrgCargo !== 8 && rol.pkCrgCargo !== 9)
      .map(cargo => (
        <Select.Option key={cargo.pkCrgCargo} value={cargo.pkCrgCargo}>
          {cargo.dscCargo}
        </Select.Option>
      ));

    const equipoViceGereSub = item => {
      const cargo = item.dscCargo;
      const equipo = item.dscEquipo;
      if (cargo === 'Vicepresidente' || cargo === 'Gerente' || cargo === 'Subgerente') return 'Todos';
      if (!cargo && !equipo) return '-';
      return equipo;
    };

    const cargoTablaAjustador = item => (item && item.dscCargo) || '-';

    const data = listarPersona.map((item, index) => {
      return {
        key: index,
        email: item.email,
        nombre: item.nombreCompleto,
        crgPersona: item.pkCrgPersona,
        equipo: equipoViceGereSub(item),
        cargo: cargoTablaAjustador(item),
        indActivo: item.indHabilitado
      };
    });

    const seleccionados = selected.length > 0 && selected;

    const ajustadores = listarAjustadores
      .filter(ajustador => ajustador.indHabilitado === 'S')
      .map(ajustador => (
        <Select.Option key={ajustador.codAjustador} value={ajustador.codAjustador}>
          {ajustador.nombreAjustador}
        </Select.Option>
      ));

    return (
      <React.Fragment>
        <h1>Mantenimiento Usuario</h1>
        <UsuarioForm
          teamsItems={teamsItems}
          cargoItems={cargoItems}
          loadingListarCargo={loadingListarCargo}
          loadingListarEquipos={loadingListarEquipos}
          setearValoresDeBusqueda={this.setearValoresDeBusqueda}
          seteaSelectedRowKeysEmpty={this.seteaSelectedRowKeysEmpty}
        />
        <div className="seccion_claims">
          <UsuarioTabla
            data={data}
            listarPersona={listarPersona}
            seleccionados={seleccionados}
            selectedRowKeys={selectedRowKeys}
            valoresDeBusqueda={valoresDeBusqueda}
            loadingListarPersona={loadingListarPersona}
            setearLoadingToFalse={this.setearLoadingToFalse}
            onSelectedRowKeysChange={this.onSelectedRowKeysChange}
            modificarModalYEditarUsuario={this.modificarModalYEditarUsuario}
          />
        </div>
        <Row
          gutter={24}
          style={{
            textAlign: 'right',
            marginBottom: '15px'
          }}
        >
          <UsuarioAgregar
            items={items}
            selected={selected}
            checkbox={checkboxSelected}
            checkboxItems={checkboxItems}
            teamsItems={teamsItems}
            cargoItems={cargoItems}
            listarRoles={listarRoles}
            tituloModal={tituloModal}
            listarCargo={listarCargo}
            ajustadores={ajustadores}
            selectedRow={selectedRow}
            modalVisible={modalVisible}
            loadingRoles={loadingRoles}
            resetItems={this.resetItems}
            editarUsuario={editarUsuario}
            rolesCheckbox={rolesCheckbox}
            loadingEditar={loadingEditar}
            checkboxRoles={this.checkboxRoles}
            itemsConCampo={this.itemsConCampo}
            listaAjustadores={listarAjustadores}
            habilitarCheckbox={habilitarCheckbox}
            handleAgregarOK={this.handleAgregarOK}
            despuesDeCerrar={this.despuesDeCerrar}
            loadingAjustadores={loadingAjustadores}
            setearItemsRoles={this.setearItemsRoles}
            resetRolesCheckbox={this.resetRolesCheckbox}
            actualizarMargenes={this.actualizarMargenes}
            modalAgregarUsuario={this.modalAgregarUsuario}
            handleDeleteDragDrop={this.handleDeleteDragDrop}
            validateBeforeUpdate={this.validateBeforeUpdate}
            setearLoadingToFalse={this.setearLoadingToFalse}
            setearRolPracticante={this.setearRolPracticante}
            alCancelarAgregarOEditar={this.alCancelarAgregarOEditar}
            filtrarRolesInternoExterno={this.filtrarRolesInternoExterno}
            setearSeleccionadosCheckbox={this.setearSeleccionadosCheckbox}
          />
          <UsuarioAusencia
            afterCloseAusencia={this.afterCloseAusencia}
            teamsItems={teamsItems}
            cargoItems={cargoItems}
            onOkForm={this.onOkForm}
            selectedRow={selectedRow}
            modalAusencia={modalAusencia}
            arrayDeAusencias={arrayDeAusencias}
            obtReemplazos={obtReemplazos}
            obtPersona={obtPersona}
            loadingAusencia={loadingAusencia}
            modalAgregarAusencia={this.modalAgregarAusencia}
            setearLoadingToFalse={this.setearLoadingToFalse}
            handleCancelarAusencia={this.handleCancelarAusencia}
          />
          <UsuarioReemplazo
            cargoItems={cargoItems}
            teamsItems={teamsItems}
            listarCargo={listarCargo}
            selectedRow={selectedRow}
            loadingReemplazo={loadingReemplazo}
            modalReemplazo={this.modalReemplazo}
            posiblesReemplazos={posiblesReemplazos}
            reemplazosCheckbox={reemplazosCheckbox}
            modalReplaceVisible={modalReplaceVisible}
            handleReemplazoOK={this.handleReemplazoOK}
            dataForFormReemplazo={dataForFormReemplazo}
            actualizarMargenes={this.actualizarMargenes}
            checkboxReemplazos={this.checkboxReemplazos}
            reemplazosSeleccionados={reemplazosSeleccionados}
            loadingEliminarReemplazo={loadingEliminarReemplazo}
            handleCancelarReemplazo={this.handleCancelarReemplazo}
            despuesDeCerrarReemplazos={this.despuesDeCerrarReemplazos}
            handleDeleteDragDropReemplazo={this.handleDeleteDragDropReemplazo}
            setearSeleccionadosCheckboxReemplazos={this.setearSeleccionadosCheckboxReemplazos}
          />
          <Button
            onClick={this.redirectToTarget}
            style={{
              textAlign: 'right',
              marginBottom: '15px',
              marginTop: '10px',
              marginRight: '10px'
            }}
          >
            Cancelar
            <Icon type="close-circle" />
          </Button>
        </Row>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  const listarRoles = getListRoles(state);
  const listarCargo = getListCargo(state);
  const listarPersona = getListPersona(state);
  const listarEquipos = getListEquipos(state);
  const listarAjustador = getListAjustador(state);
  const obtPersona = getObtenerPersona(state);
  const listarAusencias = getListaAusencia(state);
  const obtReemplazos = getObtenerReemplazo(state);
  const listarPosiblesReemplazos = getListPosiblesReemplazos(state);

  return {
    listarRoles,
    loadingListarRoles: listarRoles.isLoading,

    listarCargo: listarCargo.listarCargo,
    loadingListarCargo: listarCargo.isLoading,

    listarPersona: listarPersona.listarPersona,
    loadingListarPersona: listarPersona.isLoading,

    listarEquipos: listarEquipos.listarEquipos,
    loadingListarEquipos: listarEquipos.isLoading,

    obtPersona: obtPersona.obtenerPersona,
    loadingObtenerPersonao: obtPersona.isLoading,

    listarAusencias,
    loadingListarAusencias: listarAusencias.isLoading,

    listarAjustadores: listarAjustador.listarAjustador,
    loadingListarAjustador: listarAjustador.isLoading,

    obtReemplazos,
    // loadingObtenerReemplazos: obtenerReemplazos.isLoading,

    listarPosiblesReemplazos,
    loadingListarPosiblesReemplazos: listarPosiblesReemplazos.isLoading,

    showScroll: state.services.device.scrollActivated,
    userClaims: state.services.user.userClaims
  };
};

const mapDispatchToProps = dispatch => ({
  listaRoles: () => dispatch(listarRolesCreators.fetchListRoles()),
  listaCargos: () => dispatch(listarCargoCreators.fetchListCargo()),
  listaEquipos: () => dispatch(equiposActionCreators.fetchListEquipos()),
  listaPersonas: () => dispatch(listarPersonaCreators.fetchListPersona()),
  listaAusencias: persona => dispatch(listarAusenciasCreators.fetchListarAusencias(persona)),
  listaAjustadores: (obj, indicador) => dispatch(listarAjustadorCreators.fetchListAjustador(obj, indicador)),
  listaReemplazos: seleccionado => dispatch(listarPosiblesReemplazosCreators.fetchListReemplazos(seleccionado)),

  obtenerReemplazos: seleccionado => dispatch(obtenerReemplazosCreators.fetchObtenerReemplazo(seleccionado)),
  obtenerJefe: (cargo, equipo) => dispatch(obtenerJefesCreators.fetchObtenerJefe(cargo, equipo)),
  obtenerPersona: (record, tipoPersona) => dispatch(obtenerPersonaCreators.fetchObtenerPersona(record, tipoPersona)),

  reset: () => {
    dispatch(listarCargoCreators.fetchListCargoReset());
    dispatch(listarPersonaCreators.fetchListPersonaReset());
    dispatch(obtenerPersonaCreators.fetchObtenerPersonaReset());
    dispatch(listarPosiblesReemplazosCreators.fetchListReemplazosReset());
  },
  resetListaRoles: () => dispatch(listarRolesCreators.fetchListRolesReset()),
  resetListaAjustadores: () => dispatch(listarAjustadorCreators.fetchListAjustadorReset()),
  resetObtenerReemplazos: () => dispatch(obtenerReemplazosCreators.fetchObtenerReemplazoReset()),
  resetListaAusencias: () => dispatch(listarAusenciasCreators.fetchListarAusenciasReset())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Usuario);
