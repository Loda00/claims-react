import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { Table, Icon, Tooltip, Switch, Modal, Form, Divider, Popconfirm } from 'antd';

import { showErrorMessage } from 'util/index';
import { CONSTANTS_APP } from 'constants/index';

import { getParamGeneral } from 'services/types/reducer';
import { getObtenerPersona } from 'scenes/Administracion/data/obtenerPersona/reducer';

import * as listarPersonaCreators from 'scenes/Administracion/data/listarPersona/action';
import * as crearAusenciaCreators from 'scenes/Administracion/data/crearAusencia/action';
import * as obtenerPersonaCreators from 'scenes/Administracion/data/obtenerPersona/action';
import * as listarAusenciasCreators from 'scenes/Administracion/data/listarAusencias/action';
import * as eliminarPersonaCreators from 'scenes/Administracion/data/eliminarPersona/action';
import * as eliminarAusenciaCreators from 'scenes/Administracion/data/eliminarAusencia/action';
import * as reactivarPersonaCreators from 'scenes/Administracion/data/reactivarPersona/action';
import * as obtenerReemplazosCreators from 'scenes/Administracion/data/obtenerReemplazos/action';

class UsuarioTabla extends React.Component {
  eliminarPersona = async (modalError, modalSuccess) => {
    const {
      eliminaPersona,
      setearLoadingToFalse,
      obtenerPersona: { obtenerPersona }
    } = this.props;

    try {
      const response = await eliminaPersona(obtenerPersona[0]);
      if (response.code === 'CRG-000') {
        modalSuccess('Se ha desactivado el usuario satisfactoriamente', response.message);
      } else {
        modalError('Error', response.message, 'Aceptar');
      }
    } catch (err) {
      showErrorMessage(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
    } finally {
      setearLoadingToFalse();
    }
  };

  obtenerDatos = async (record, modalError, modalSuccess) => {
    const { obtenerDatosPersona } = this.props;

    try {
      await obtenerDatosPersona(record);
    } catch (e) {
      await showErrorMessage(e);
      return;
    }
    this.eliminarPersona(modalError, modalSuccess);
  };

  confirmarDeshabilitar = async (record, modalError, modalSuccess) => {
    const { obtenerReemplazos, crearAusencia, obtenerDatosPersona } = this.props;

    try {
      const respDatosPersona = await obtenerDatosPersona(record);
      if (
        respDatosPersona &&
        respDatosPersona.data &&
        respDatosPersona.data.length > 0 &&
        respDatosPersona.data[0] &&
        respDatosPersona.data[0].tipoUsuario &&
        respDatosPersona.data[0].tipoUsuario.length > 0 &&
        respDatosPersona.data[0].tipoUsuario.some(rol => rol.idTipo === 'ES' || rol.idTipo === 'APROB')
      ) {
        const reemplazos = await obtenerReemplazos(record);
        if (reemplazos && reemplazos.data && reemplazos.data.length > 0) {
          const tomorrow = moment(new Date()).add(1, 'days');

          const objAusencia = {
            fechaInicio: tomorrow.format(CONSTANTS_APP.FORMAT_DATE_INPUT_DB),
            fechaFin: null
          };

          const persona = [
            {
              pkPersona: record.crgPersona,
              habilita: 'S'
            }
          ];

          const indIndefinido = 'S';

          const ausencia = await crearAusencia(objAusencia, persona, indIndefinido);

          if (ausencia && ausencia.code === 'CRG-000') {
            await this.obtenerDatos(record, modalError, modalSuccess);
          }
        } else {
          Modal.info({
            title: 'Programación de reemplazo(s)',
            content: 'Debe asignar reemplazo(s) antes de desactivar al usuario',
            okText: 'Cerrar'
          });
        }
      } else {
        await this.obtenerDatos(record, modalError, modalSuccess);
      }
    } catch (err) {
      modalError('Error al deshabilitar usuario', err.message, 'Cerrar');
    }
  };

  confirmarHabilitar = async (record, modalError, modalSuccess) => {
    const { obtenerAusencias, eliminarAusencia, obtenerDatosPersona, reactivarPersona } = this.props;
    try {
      const respDatosPersona = await obtenerDatosPersona(record);
      if (
        respDatosPersona &&
        respDatosPersona.data &&
        respDatosPersona.data.length > 0 &&
        respDatosPersona.data[0] &&
        respDatosPersona.data[0].tipoUsuario &&
        respDatosPersona.data[0].tipoUsuario.length > 0 &&
        respDatosPersona.data[0].tipoUsuario.some(rol => rol.idTipo === 'ES' || rol.idTipo === 'APROB')
      ) {
        const ausencias = await obtenerAusencias(record.crgPersona);
        if (ausencias && ausencias.data && ausencias.data.length > 0 && ausencias.data[0].pkCrgPersonaAusencia) {
          const ausenciaEliminada = await eliminarAusencia(ausencias.data[0].pkCrgPersonaAusencia);
          if (ausenciaEliminada && ausenciaEliminada.code === 'CRG-000') {
            const datos = await obtenerDatosPersona(record);
            if (datos && datos.data && datos.data.length > 0) {
              const respReactivacion = await reactivarPersona(datos.data[0]);
              if (respReactivacion && respReactivacion.code === 'CRG-000') {
                modalSuccess('Se ha activado el usuario satisfactoriamente', respReactivacion.message);
              } else {
                modalError('Error', respReactivacion.message, 'Aceptar');
              }
            } else {
              modalError('Error', 'Ocurrió un error al activar el usuario', 'Aceptar');
            }
          } else {
            modalError('Error', 'Ocurrió un error al activar el usuario', 'Aceptar');
          }
        } else {
          modalError('Error', 'Ocurrió un error al activar el usuario', 'Aceptar');
        }
      } else if (
        respDatosPersona &&
        respDatosPersona.data &&
        respDatosPersona.data.length > 0 &&
        respDatosPersona.data[0]
      ) {
        const respReactivacion = await reactivarPersona(respDatosPersona.data[0]);
        if (respReactivacion && respReactivacion.code === 'CRG-000') {
          modalSuccess('Se ha activado el usuario satisfactoriamente', respReactivacion.message);
        } else {
          modalError('Error', respReactivacion.message, 'Aceptar');
        }
      } else {
        modalError('Error', 'Ocurrió un error al activar el usuario', 'Aceptar');
      }
    } catch (err) {
      modalError('Error al habilitar usuario', err.message, 'Cerrar');
    }
  };

  render() {
    const {
      data,
      showScroll,
      seleccionados,
      selectedRowKeys,
      tamanioPaginacion,
      loadingListarPersona,
      onSelectedRowKeysChange,
      modificarModalYEditarUsuario,
      listarPersona,
      valoresDeBusqueda
    } = this.props;

    const rowSelection = {
      type: 'radio',
      selectedRowKeys,
      onChange: onSelectedRowKeysChange
    };

    const modalError = (title, content, okText) =>
      Modal.error({
        title,
        content,
        okText,
        centered: true
      });

    const modalSuccess = (title, content) =>
      Modal.success({
        title,
        content,
        okText: 'Aceptar',
        onOk: () => listarPersona(valoresDeBusqueda)
      });

    const columns = [
      {
        key: 1,
        title: 'Nombre(s)',
        dataIndex: 'nombre'
      },
      {
        key: 2,
        title: 'E-Mail',
        dataIndex: 'email'
      },
      {
        key: 3,
        title: 'Cargo',
        dataIndex: 'cargo'
      },
      {
        key: 4,
        title: 'Equipo',
        dataIndex: 'equipo'
      },
      {
        key: 5,
        title: 'Estado',
        dataIndex: 'indActivo',
        editable: false,
        render: (text, record) => (
          <div style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {record && record.indActivo && record.indActivo === 'S' ? 'Activado' : 'Desactivado'}
          </div>
        )
      },
      {
        key: 6,
        title: 'Acción',
        dataIndex: 'accion',
        render: (text, record) => (
          <span>
            <Tooltip title="Editar">
              <Icon
                type="edit"
                theme="filled"
                onClick={record.indActivo === 'S' ? () => modificarModalYEditarUsuario(record, seleccionados) : ''}
                style={{ color: record.indActivo === 'N' ? '#BFBFBF' : 'red', fontSize: '18px' }}
              />
            </Tooltip>
            <Divider type="vertical" />
            <Popconfirm
              title={record.indActivo === 'S' ? '¿Seguro de desactivar?' : '¿Seguro de activar?'}
              type="primary"
              onConfirm={
                record.indActivo === 'S'
                  ? () => this.confirmarDeshabilitar(record, modalError, modalSuccess)
                  : () => this.confirmarHabilitar(record, modalError, modalSuccess)
              }
            >
              <Tooltip title={record.indActivo === 'S' ? 'Desactivar' : 'Activar'}>
                <Switch size="small" checked={record.indActivo === 'S' || false} />
              </Tooltip>
            </Popconfirm>
          </span>
        )
      }
    ];

    return (
      <React.Fragment>
        {showScroll ? (
          <Table
            size="small"
            columns={columns}
            dataSource={data}
            scroll={{ x: '120%' }}
            rowSelection={rowSelection}
            loading={loadingListarPersona}
            pagination={{ defaultPageSize: tamanioPaginacion }}
          />
        ) : (
          <Table
            size="small"
            columns={columns}
            dataSource={data}
            rowSelection={rowSelection}
            loading={loadingListarPersona}
            pagination={{ defaultPageSize: tamanioPaginacion }}
          />
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  const obtenerPersona = getObtenerPersona(state);
  const tamanioPaginacion = getParamGeneral(state, 'TAMANIO_TABLA_PAGINA');
  return {
    obtenerPersona,
    loadingObtenerPersonao: obtenerPersona.isLoading,
    tamanioPaginacion,
    showScroll: state.services.device.scrollActivated,
    userClaims: state.services.user.userClaims
  };
};

const mapDispatchToProps = dispatch => ({
  obtenerDatosPersona: record => dispatch(obtenerPersonaCreators.fetchObtenerPersona(record)),

  listarPersona: valoresDeBusqueda => dispatch(listarPersonaCreators.fetchListPersona(valoresDeBusqueda)),

  eliminaPersona: values => dispatch(eliminarPersonaCreators.fetchEliminarPersona(values)),

  obtenerReemplazos: seleccionado => dispatch(obtenerReemplazosCreators.fetchObtenerReemplazo(seleccionado)),

  obtenerAusencias: persona => dispatch(listarAusenciasCreators.fetchListarAusencias(persona)),

  crearAusencia: (obj, persona, indIndefinido) =>
    dispatch(crearAusenciaCreators.fetchCrearAusencia(obj, persona, indIndefinido)),

  eliminarAusencia: pkAusencia => dispatch(eliminarAusenciaCreators.fetchEliminarAusencia(pkAusencia)),

  reactivarPersona: values => dispatch(reactivarPersonaCreators.fetchReactivarPersona(values))
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Form.create({ name: 'tabla-usuario' })(UsuarioTabla));
