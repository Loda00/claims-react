import React from 'react';
import { connect } from 'react-redux';
import { showErrorMessage } from 'util/index';
import { Table, Icon, Popconfirm, Tooltip, Divider, Modal, Switch } from 'antd';
import { MANTENIMIENTO_ADMINISTRACION } from 'constants/index';
import { getMantenimientoCausa } from 'scenes/Administracion/Causas/data/mantenerCausa/reducer';
import * as mantenimientoCausaCreators from 'scenes/Administracion/Causas/data/mantenerCausa/action';

class CausasTabla extends React.Component {
  handleDelete = async record => {
    const { dispatch, limpiarForm } = this.props;

    const accion = MANTENIMIENTO_ADMINISTRACION.ELIMINAR;
    const idMtrCausa = record.idCausa || {};
    const codCausa = record.codigo || {};
    const causa = record.causa || {};
    try {
      const response = await dispatch(
        mantenimientoCausaCreators.fetchMantenimientoCausa(accion, idMtrCausa, null, null, null)
      );
      const mensaje = response.code === 'CRG-000';
      if (mensaje) {
        Modal.success({
          title: 'Eliminar causa',
          content: (
            <div>
              <p>
                {response.message}{' '}
                <strong>
                  {codCausa.toUpperCase()}
                  <strong> - </strong>
                  {causa.toUpperCase()}
                </strong>
              </p>
            </div>
          )
        });
        limpiarForm();
      } else {
        Modal.error({
          title: 'Eliminar causa',
          content: (
            <div>
              <p>
                Error al eliminar causa{' '}
                <strong>
                  {codCausa.toUpperCase()}
                  <strong> - </strong>
                  {causa.toUpperCase()}
                </strong>
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
    const { dataCausas, modificarModal, tamanioPaginacion, loadingListarCausa, showScroll } = this.props;

    const columns = [
      {
        key: 1,
        title: 'Código',
        dataIndex: 'codigo'
      },
      {
        key: 2,
        title: 'Causa',
        dataIndex: 'causa'
      },
      {
        key: 3,
        title: 'Ramo',
        dataIndex: 'ramo'
      },
      {
        key: 4,
        title: 'Acción',
        dataIndex: 'accion',
        render: (text, record) => (
          <span>
            {false && (
                <Popconfirm title="Seguro de eliminar?" type="primary" onConfirm={() => this.handleDelete(record)}>
                  <Tooltip title="Eliminar">
                    <Icon type="delete" theme="filled" style={{ color: 'red', fontSize: '18px' }} />
                  </Tooltip>
                </Popconfirm>
              ) && <Divider type="vertical" />}
            <Tooltip title="Editar">
              <Icon
                type="edit"
                theme="filled"
                style={{ color: 'red', fontSize: '18px' }}
                onClick={() => modificarModal(record)}
              />
            </Tooltip>
          </span>
        )
      }
    ];
    return (
      <React.Fragment>
        {showScroll && (
          <Table
            columns={columns}
            dataSource={dataCausas}
            size="small"
            pagination={{ defaultPageSize: tamanioPaginacion }}
            loading={loadingListarCausa}
            scroll={{ x: '120%' }}
          />
        )}
        {!showScroll && (
          <Table
            columns={columns}
            dataSource={dataCausas}
            size="small"
            pagination={{ defaultPageSize: tamanioPaginacion }}
            loading={loadingListarCausa}
          />
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  const mantenimientoCausa = getMantenimientoCausa(state);

  return {
    mantenimientoCausa,
    loadingMantenerCausa: mantenimientoCausa.isLoading
  };
};

export default connect(mapStateToProps)(CausasTabla);
