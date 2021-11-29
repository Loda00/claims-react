import React from 'react';
import { connect } from 'react-redux';
import { showErrorMessage } from 'util/index';
import { Table, Icon, Popconfirm, Tooltip, Divider, Modal, Switch } from 'antd';
import { MANTENIMIENTO_ADMINISTRACION } from 'constants/index';
import * as mantenimientoAjustadorCreator from 'scenes/Administracion/Ajustadores/data/mantenerAjustador/action';

class AjustadorTabla extends React.Component {
  handleDelete = async record => {
    const { dispatch, limpiarForm, listarAjustador } = this.props;

    const operacion = MANTENIMIENTO_ADMINISTRACION.ELIMINAR;
    const idAjustador = record.idAjustador || {};
    const idPersona = record.idPersona || {};
    const codAjustador = record.codigo || {};
    const emailAjustador = record.email || {};
    const nomAjustador = record.ajustador || {};
    const indHabilitado = record.estadoSwitch || {};

    try {
      const response = await dispatch(
        mantenimientoAjustadorCreator.fetchMantenimientoAjustador(
          operacion,
          codAjustador, // null, null, null,
          nomAjustador,
          emailAjustador,
          idAjustador,
          idPersona,
          null,
          indHabilitado,
          null
        )
      );
      const mensaje = response.code === 'CRG-000';
      if (mensaje) {
        Modal.success({
          title: 'Mantenimiento ajustador',
          content: (
            <div>
              <p>{response.message}</p>
            </div>
          )
        });
        limpiarForm();
      } else {
        Modal.error({
          title: 'Mantenimiento ajustador',
          content: (
            <div>
              <p>
                Error al {indHabilitado === 'S' ? 'desactivar' : 'activar'} ajustador{' '}
                <strong>{record.ajustador.toUpperCase()}</strong>
              </p>
            </div>
          )
        });
      }
    } catch (e) {
      showErrorMessage(e);
    }
  };

  render() {
    const {
      modificarModal,
      dataAjustadores,
      loadingListarAjustador,
      tamanioPaginacion,
      loadingMntAjustador,
      seleccionados,
      showScroll
    } = this.props;

    const columns = [
      {
        key: 1,
        title: 'Código',
        dataIndex: 'codigo'
      },
      {
        key: 2,
        title: 'Ajustador',
        dataIndex: 'ajustador'
      },
      {
        key: 3,
        title: 'Email',
        dataIndex: 'email'
      },
      {
        key: 4,
        title: 'Estado',
        dataIndex: 'estado',
        render: (text, record) => (
          <Tooltip
            title={
              record.estadoSwitch === 'S'
                ? 'Se puede asignar a nuevos siniestros.'
                : record.estadoSwitch === 'N'
                ? 'No tiene siniestros en proceso y no podrá ser asignado a nuevos siniestros.'
                : 'Tiene siniestros en proceso.'
            }
            placement={showScroll ? 'bottom' : 'right'}
          >
            <div style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>{text}</div>
          </Tooltip>
        )
      },
      {
        key: 5,
        title: 'Acción',
        dataIndex: 'accion',
        render: (text, record) => (
          <span>
            {record.estadoSwitch === 'S' && (
              <Tooltip title="Editar">
                <Icon
                  type="edit"
                  theme="filled"
                  style={{ color: 'red', fontSize: '18px' }}
                  onClick={() => modificarModal(record, seleccionados)}
                />
              </Tooltip>
            )}
            {record.estadoSwitch !== 'S' && (
              <Icon type="edit" theme="filled" style={{ color: '#BFBFBF', fontSize: '18px', cursor: 'default' }} />
            )}
            <Divider type="vertical" />
            <Popconfirm
              title={record.estadoSwitch === 'S' ? 'Seguro de desactivar ?' : 'Seguro de activar ?'}
              type="primary"
              onConfirm={() => this.handleDelete(record)}
            >
              <Tooltip title={record.estadoSwitch === 'S' ? 'Desactivar' : 'Activar'}>
                <Switch checked={record.estadoSwitch === 'S'} size="small" />
              </Tooltip>
            </Popconfirm>
          </span>
        )
      }
    ];
    return (
      <React.Fragment>
        {showScroll && (
          <Table
            columns={columns}
            dataSource={dataAjustadores}
            loading={loadingListarAjustador || loadingMntAjustador}
            pagination={{ defaultPageSize: tamanioPaginacion }}
            scroll={{ x: '120%' }}
            size="small"
          />
        )}
        {!showScroll && (
          <Table
            columns={columns}
            dataSource={dataAjustadores}
            loading={loadingListarAjustador || loadingMntAjustador}
            pagination={{ defaultPageSize: tamanioPaginacion }}
            // scroll={{ x: '120%' }}
            size="small"
          />
        )}
      </React.Fragment>
    );
  }
}

export default connect()(AjustadorTabla);
