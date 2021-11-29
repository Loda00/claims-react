import React from 'react';
import { TITLE_MODAL } from 'constants';
import { Table, Icon, Popconfirm, Divider, Tooltip } from 'antd';
import CoordenadasModal from 'scenes/TaskTray/scenes/AnalyzeSinisterInfo/Components/Sections/Registry/components/CoordenadasModal';

class RegistryPaymentCoordenadasBancariasTable extends React.Component {
  state = {
    loading: false,
    data: [
      {
        key: '1',
        tipopago: 'tipo pago',
        entidadfinanciera: 'entidad financiera',
        tipocuenta: 'tipo cuenta',
        monedacuenta: 'moneda cuenta',
        nrocuenta: 'nro cuenta',
        estado: 'estado'
      },
      {
        key: '2',
        tipopago: 'tipo pago',
        entidadfinanciera: 'entidad financiera',
        tipocuenta: 'tipo cuenta',
        monedacuenta: 'moneda cuenta',
        nrocuenta: 'nro cuenta',
        estado: 'estado'
      }
    ]
  };

  handleDelete = key => {
    const dataSource = [...this.state.data];
    this.setState({ data: dataSource.filter(item => item.key !== key) });
  };

  render() {
    const columns = [
      {
        title: 'Tipo pago',
        dataIndex: 'tipopago',
        key: 'tipopago'
      },
      {
        title: 'Entidad financiera',
        dataIndex: 'entidadfinanciera',
        key: 'entidadfinanciera'
      },
      {
        title: 'Tipo cuenta',
        dataIndex: 'tipocuenta',
        key: 'tipocuenta'
      },
      {
        title: 'Moneda cuenta',
        dataIndex: 'monedacuenta',
        key: 'monedacuenta'
      },
      {
        title: 'N° Cuenta',
        dataIndex: 'nrocuenta',
        key: 'nrocuenta'
      },
      {
        title: 'Estado',
        dataIndex: 'estado',
        key: 'estado'
      },
      {
        title: 'Accion',
        key: 'accion',
        fixed: 'right',
        dataIndex: 'accion',
        className: this.state.data.length > 1 ? 'show' : 'hide',
        render: (text, record) => (
          // this.state.data.length > 1
          //  ? (
          <span>
            <Popconfirm title="Seguro de eliminar?" type="primary" onConfirm={() => this.handleDelete(record.key)}>
              <Tooltip title="Eliminar">
                <Icon type="delete" theme="filled" style={{ color: 'red', fontSize: '17px' }} />
              </Tooltip>
            </Popconfirm>
            <Divider type="vertical" />
            <Tooltip title="Editar">
              <Icon type="edit" theme="filled" style={{ color: 'red', fontSize: '17px' }} />
            </Tooltip>
            <Divider type="vertical" />
            <Tooltip title="Enviar">
              <Icon type="right" style={{ color: 'red', fontSize: '17px' }} />
            </Tooltip>
          </span>
          // ): null
        )
      }
    ];

    return (
      <React.Fragment>
        <CoordenadasModal disabledGeneral={this.props.disabledGeneral} titleModal={TITLE_MODAL.COORDENADASBANCARIOS} />
        <br />
        {this.props.showScroll && (
          <Table
            columns={columns}
            dataSource={this.state.data}
            loading={this.state.loading}
            onChange={this.handleTableChange}
            size="small"
            scroll={{ x: '100%' }}
          />
        )}
        {!this.props.showScroll && (
          <Table
            columns={columns}
            dataSource={this.state.data}
            loading={this.state.loading}
            onChange={this.handleTableChange}
            size="small"
          />
        )}
      </React.Fragment>
    );
  }
}
export default RegistryPaymentCoordenadasBancariasTable;
