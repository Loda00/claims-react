import React from 'react';
import { Table, Popconfirm, Icon } from 'antd';
import * as Utils from 'util/index';

class CargarSalvamentoTable extends React.Component {
  handleDelete = key => {
    const { datosSalvamentoState, datosSalvamentoDelModal, datosSalvamentoDisabled } = this.props;
    const salvamentos = datosSalvamentoState.filter(salvamentoElegido => salvamentoElegido.key !== key);
    datosSalvamentoDelModal(salvamentos);
    datosSalvamentoDisabled(salvamentos);
  };

  render() {
    const {
      loadingSaveSalvamento,
      loadingListSalvamento,
      datosSalvamentoState,
      tamanioPaginacion,
      showScroll
    } = this.props;

    const columns = [
      {
        title: 'Fecha Venta',
        dataIndex: 'fecVenta',
        key: 'fecVenta',
        render: text => Utils.formatDateBandeja(text),
        align: 'right'
      },
      {
        title: 'Comprador',
        key: 'comprador',
        dataIndex: 'comprador'
      },
      {
        title: 'DNI/RUC Comprador',
        key: 'dniRucComprador',
        dataIndex: 'dniRucComprador'
      },
      {
        title: 'Nro. Liquidación',
        key: 'nroLiquidacion',
        dataIndex: 'nroLiquidacion'
      },
      {
        title: 'Monto Venta USD',
        key: 'mtoVentaDolares',
        dataIndex: 'mtoVentaDolares',
        align: 'right',
        render: text => Utils.formatAmount(text)
      },
      {
        title: 'Precio Base USD',
        key: 'mtoPrecioDolares',
        dataIndex: 'mtoPrecioDolares',
        align: 'right',
        render: text => Utils.formatAmount(text)
      },
      {
        title: 'Vendedor',
        key: 'vendedor',
        dataIndex: 'vendedor'
      },
      {
        title: 'Ejecutivo Legal',
        key: 'ejecutivolegal',
        dataIndex: 'ejecutivolegal'
      },
      {
        title: 'Salvamento Desistido',
        key: 'salvDesistido',
        dataIndex: 'salvDesistido'
      },
      {
        title: 'Observación',
        key: 'obervacion',
        dataIndex: 'obervacion'
      },
      {
        title: 'Acci\u00f3n',
        dataIndex: 'accion',
        key: 'accion',
        render: (text, record) =>
          datosSalvamentoState[record.key].accion === 'n' ? (
            <Popconfirm title="Seguro de eliminar?" type="primary" onConfirm={() => this.handleDelete(record.key)}>
              <Icon type="delete" theme="filled" style={{ color: 'red', fontSize: '18px' }} />
            </Popconfirm>
          ) : (
            <Icon type="delete" theme="filled" style={{ color: '#9C9998', fontSize: '18px' }} />
          )
      }
    ];

    return (
      <React.Fragment>
        {showScroll && (
          <Table
            columns={columns}
            loading={loadingSaveSalvamento ? true : loadingListSalvamento}
            dataSource={datosSalvamentoState}
            pagination={{ defaultPageSize: tamanioPaginacion }}
            size="small"
            scroll={{ x: '100%' }}
          />
        )}
        {!showScroll && (
          <Table
            columns={columns}
            loading={loadingSaveSalvamento ? true : loadingListSalvamento}
            dataSource={datosSalvamentoState}
            pagination={{ defaultPageSize: tamanioPaginacion }}
            size="small"
          />
        )}
      </React.Fragment>
    );
  }
}
export default CargarSalvamentoTable;
