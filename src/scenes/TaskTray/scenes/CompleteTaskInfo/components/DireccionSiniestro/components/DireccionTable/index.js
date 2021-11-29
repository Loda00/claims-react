import React from 'react';
import { connect } from 'react-redux';
import { Table, Input, Form } from 'antd';
import * as addressesActionCreator from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DireccionSiniestro/data/addresses/actions';
import { showErrorMessage } from 'util/index';
import { getAddresses } from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DireccionSiniestro/data/addresses/reducer';
import { getParam, getParamGeneral } from 'services/types/reducer';

class DireccionTable extends React.Component {
  componentWillUnmount() {
    this.props.dispatch(addressesActionCreator.fetchAddressesReset());
  }

  componentDidMount() {
    this.props.dispatch(addressesActionCreator.fetchAddresses(this.props.idePol)).finally(resp => {
      if (this.props.errorAddresses) {
        showErrorMessage(this.props.errorAddresses.message);
      }
    });
  }

  onSelectChange = (selectedRowKeys, selectedRow) => {
    this.props.setDatosDireccion(selectedRow[0]);
  };

  handleChangeDireccion = e => {
    this.props.dispatch(addressesActionCreator.updateSearchTerm(e.target.value));
  };

  render() {
    const { tamanioPagina } = this.props;

    const rowSelection = {
      type: 'radio',
      onChange: this.onSelectChange,
      hideDefaultSelections: true
    };

    const columns = [
      {
        title: 'Departamento',
        dataIndex: 'descEstado',
        sorter: (a, b) => (a.descEstado || '').localeCompare(b.descEstado)
      },
      {
        title: 'Provincia',
        dataIndex: 'descCiudad',
        sorter: (a, b) => (a.descCiudad || '').localeCompare(b.descCiudad)
      },
      {
        title: 'Distrito',
        dataIndex: 'descMunicipio',
        sorter: (a, b) => (a.descMunicipio || '').localeCompare(b.descMunicipio)
      },
      {
        title: 'Dirección',
        dataIndex: 'direc',
        sorter: (a, b) => (a.direc || '').localeCompare(b.direc)
      }
    ];

    const addresses = this.props.addresses;
    const data = addresses.map((address, index) => {
      const dataItem = {
        ...address,
        codPais: this.props.codPais,
        continente: this.props.codContinente,
        secUbicacion: 0,
        key: index
      };
      return dataItem;
    });

    return (
      <React.Fragment>
        <Form.Item label="Direcci&oacute;n">
          <Input onChange={this.handleChangeDireccion} />
        </Form.Item>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: tamanioPagina }}
          loading={this.props.loadingAddresses}
          size="small"
          scroll={{ x: '100%' }}
        />
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  const addresses = getAddresses(state);
  const codPais = getParam(state, 'CRG_SYN_TAREAS', 'CODPAIS');
  const codContinente = getParam(state, 'CRG_SYN_TAREAS', 'CODCONTINENTE');
  const tamanioPagina = getParamGeneral(state, 'TAMANIO_TABLA_PAGINA');
  return {
    addresses: addresses.addresses,
    loadingAddresses: addresses.isLoading,
    errorAddresses: addresses.error,
    showScroll: state.services.device.scrollActivated,
    codPais,
    codContinente,
    tamanioPagina
  };
}
export default connect(mapStateToProps)(DireccionTable);
