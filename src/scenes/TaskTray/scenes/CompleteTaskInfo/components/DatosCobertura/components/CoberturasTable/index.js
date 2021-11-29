import React, { Fragment } from 'react';
import { Table, Popconfirm, Icon, Divider } from 'antd';
import * as Utils from 'util/index';

class CoberturasTable extends React.Component {
  handleDelete = key => {
    const coberturas = this.props.coberturasElegidas.map(coberturaElegida => {
      if (coberturaElegida.key === key) {
        return {
          ...coberturaElegida,
          delete: true
        };
      }
      return coberturaElegida;
    });

    const nuevasCoberturas = coberturas.filter(item => !(item.delete && item.secCobertura === 0));
    this.props.setCoberturas(nuevasCoberturas);
  };

  render() {
    const { tamanioPagina, duplicado, esCMCoaseguro } = this.props;

    const { codMonSumAseg } = this.props.certificado || {};
    const dataSource =
      this.props.coberturasElegidas && this.props.coberturasElegidas.filter(item => item.delete !== true);
    const columns = [
      {
        title: 'Ramo',
        dataIndex: 'codRamo',
        sorter: (a, b) => Utils.sortStrings(a.codRamo, b.codRamo)
      },
      {
        title: 'Cobertura',
        dataIndex: 'dscCobertura',
        sorter: (a, b) => Utils.sortStrings(a.dscCobertura, b.dscCobertura)
      },
      {
        title: 'Causa',
        dataIndex: 'descCausa',
        sorter: (a, b) => Utils.sortStrings(a.descCausa, b.descCausa)
      },
      {
        title: 'Consecuencia',
        dataIndex: 'descConsecuencia',
        sorter: (a, b) => Utils.sortStrings(a.descConsecuencia, b.descConsecuencia)
      },
      {
        title: `Monto aprox. reclamado ${codMonSumAseg ? `(${codMonSumAseg})` : ''}`,
        dataIndex: 'montoAproximadoReclamado',
        align: 'right',
        render: text => Utils.formatAmount(text),
        sorter: (a, b) => Utils.sortNumbers(a.montoAproximadoReclamado, b.montoAproximadoReclamado)
      },
      {
        title: 'Acción',
        key: 'accion',
        dataIndex: 'accion',
        width: 100,
        className: this.props.currentTask.tomado ? 'show' : 'hide',
        render: (text, record) => (
          <span>
            <Icon
              type="edit"
              title="Editar"
              theme="filled"
              style={{ color: '#E6281E', fontSize: '18px', paddingLeft: duplicado ? '15px' : '0px' }}
              onClick={() => this.props.handleModalFormVisible(record, true)}
            />
            {!duplicado && !esCMCoaseguro && (
              <Fragment>
                <Divider type="vertical" />
                <Popconfirm title="Seguro de eliminar?" onConfirm={() => this.handleDelete(record.key)}>
                  <Icon type="delete" theme="filled" title="Eliminar" style={{ color: '#E6281E', fontSize: '18px' }} />
                </Popconfirm>
              </Fragment>
            )}
          </span>
        )
      }
    ];

    return (
      <Table
        id="table-coverage"
        columns={columns}
        dataSource={dataSource}
        pagination={{ pageSize: tamanioPagina }}
        scroll={{ x: '100%' }}
        size="small"
      />
    );
  }
}
export default CoberturasTable;
