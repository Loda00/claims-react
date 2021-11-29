import React from 'react';
import { connect } from 'react-redux';
import { showErrorMessage } from 'util/index';
import { Table, Icon, Popconfirm, Tooltip, Divider, Modal, Switch } from 'antd';
import { MANTENIMIENTO_ADMINISTRACION } from 'constants/index';
import { getMantenimientoConsecuencia } from 'scenes/Administracion/Consecuencias/data/mantenerConsecuencia/reducer';
import * as mantenimientoConsecuenciaCreators from 'scenes/Administracion/Consecuencias/data/mantenerConsecuencia/action';

class ConsecuenciasTabla extends React.Component {
  handleDelete = async record => {
    const { dispatch, limpiarForm } = this.props;

    const accion = MANTENIMIENTO_ADMINISTRACION.ELIMINAR;
    const idMtrConsecuencia = record.idConsecuencia || null;
    const codConsecuencia = record.codigo || null;
    const consecuencia = record.consecuencia || null;
    try {
      const response = await dispatch(
        mantenimientoConsecuenciaCreators.fetchMantenimientoConsecuencia(accion, idMtrConsecuencia, null, null, null)
      );
      const mensaje = response.code === 'CRG-000';
      if (mensaje) {
        Modal.success({
          title: 'Eliminar consecuencia',
          content: (
            <div>
              <p>
                {response.message}{' '}
                <strong>
                  {codConsecuencia.toUpperCase()}
                  <strong> - </strong>
                  {consecuencia.toUpperCase()}
                </strong>
              </p>
            </div>
          )
        });
        limpiarForm();
      } else {
        Modal.error({
          title: 'Eliminar consecuencia',
          content: (
            <div>
              <p>
                Error al eliminar consecuencia{' '}
                <strong>
                  {codConsecuencia.toUpperCase()}
                  <strong> - </strong>
                  {consecuencia.toUpperCase()}
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
    const {
      dataConsecuencia,
      modificarModal,
      tamanioPaginacion,
      loadingListarConsecuencia,
      loadingMantenerConsecuencia,
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
        title: 'Consecuencia',
        dataIndex: 'consecuencia'
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
            dataSource={dataConsecuencia}
            pagination={{ defaultPageSize: tamanioPaginacion }}
            loading={loadingListarConsecuencia || loadingMantenerConsecuencia}
            size="small"
            scroll={{ x: '150%' }}
          />
        )}
        {!showScroll && (
          <Table
            columns={columns}
            dataSource={dataConsecuencia}
            pagination={{ defaultPageSize: tamanioPaginacion }}
            loading={loadingListarConsecuencia || loadingMantenerConsecuencia}
            size="small"
          />
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  const mantenimientoConsecuencia = getMantenimientoConsecuencia(state);

  return {
    mantenimientoConsecuencia,
    loadingMantenerConsecuencia: mantenimientoConsecuencia.isLoading
  };
};

export default connect(mapStateToProps)(ConsecuenciasTabla);
