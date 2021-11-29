import React from 'react';
import { Table, Icon, Popconfirm, Tooltip, Divider, Modal } from 'antd';
import { showErrorMessage } from 'util/index';
import { connect } from 'react-redux';
import { MANTENIMIENTO_ADMINISTRACION } from 'constants/index';
import { getMantenimientoRamo } from 'scenes/Administracion/Ramo/data/mantenerRamo/reducer';
import * as mantenimientoRamoCreators from 'scenes/Administracion/Ramo/data/mantenerRamo/action';

class RamoTabla extends React.Component {
  handleDelete = async record => {
    const { dispatch, limpiarForm } = this.props;

    const accion = MANTENIMIENTO_ADMINISTRACION.ELIMINAR;
    const codMtrRamo = record.codigo || {};
    const dscMtrRamo = record.ramo || {};

    try {
      const response = await dispatch(mantenimientoRamoCreators.fetchMantenimientoRamo(accion, codMtrRamo, null));
      const mensaje = response.code === 'CRG-000';
      if (mensaje) {
        Modal.success({
          title: 'Eliminar ramo',
          content: (
            <div>
              <p>
                {response.message}{' '}
                <strong>
                  {codMtrRamo}
                  <strong> - </strong>
                  {dscMtrRamo}
                </strong>
              </p>
            </div>
          )
        });
        limpiarForm();
      } else {
        Modal.error({
          title: 'Eliminar ramo',
          content: (
            <div>
              <p>
                Error al eliminar ramo{' '}
                <strong>
                  {codMtrRamo}
                  <strong> - </strong>
                  {dscMtrRamo}
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
    const { dataRamos, modificarModal, loadingListarRamo, tamanioPaginacion, showScroll } = this.props;

    const columns = [
      {
        key: 1,
        title: 'Código',
        dataIndex: 'codigo'
      },
      {
        key: 2,
        title: 'Ramo',
        dataIndex: 'ramo'
      },
      {
        key: 5,
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
            dataSource={dataRamos}
            loading={loadingListarRamo}
            pagination={{ defaultPageSize: tamanioPaginacion }}
            size="small"
            scroll={{ x: '120%' }}
          />
        )}
        {!showScroll && (
          <Table
            columns={columns}
            dataSource={dataRamos}
            loading={loadingListarRamo}
            pagination={{ defaultPageSize: tamanioPaginacion }}
            size="small"
          />
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  const mantenimientoRamo = getMantenimientoRamo(state);

  return {
    mantenimientoRamo,
    loadingMantenerRamo: mantenimientoRamo.isLoading
  };
};
export default connect(mapStateToProps)(RamoTabla);
