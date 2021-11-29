import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import * as Utils from 'util/index';
import Info from 'scenes/TaskTray/scenes/SiniestroDuplicado/components/InfoRegistrada';
import { Table } from 'antd';

const TablaCoberturaCore = ({ coberturasSiniestroDuplicado }) => {
  const columns = [
    {
      title: 'Ramo',
      dataIndex: 'ramo',
      key: 'ramo'
    },
    {
      title: 'Cobertura',
      dataIndex: 'cobertura',
      key: 'cobertura'
    },
    {
      title: 'Causa',
      dataIndex: 'causa',
      key: 'causa'
    },
    {
      title: 'Consecuencia',
      dataIndex: 'consecuencia',
      key: 'consecuencia'
    },
    {
      title: 'Monto aprox. reclamado',
      dataIndex: 'monto',
      align: 'right',
      key: 'monto'
    }
  ];

  let data = [];

  if (!isEmpty(coberturasSiniestroDuplicado)) {
    data = coberturasSiniestroDuplicado.map(ramo => {
      return {
        ramo: ramo.codigo,
        cobertura: ramo.coberturas[0].dscCobertura,
        causa: ramo.coberturas[0].causa.dscCausa,
        consecuencia: ramo.coberturas[0].consecuencia.dscConsecuencia,
        monto: Utils.formatAmount(ramo.coberturas[0].montoReserva)
      };
    });
  }

  return (
    <Fragment>
      <Info valor="" />
      <Table
        columns={columns}
        dataSource={data}
        scroll={{ x: '100%' }}
        pagination={{
          defaultPageSize: 5
        }}
        size="small"
      />
    </Fragment>
  );
};

const Main = connect()(TablaCoberturaCore);

export default Main;
