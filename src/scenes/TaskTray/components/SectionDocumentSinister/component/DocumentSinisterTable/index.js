import React from 'react';
import { connect } from 'react-redux';
import { Table, Tooltip, Button } from 'antd';
import * as Utils from 'util/index';
import { TAREAS } from 'constants/index';

class DocumentSinistersTable extends React.Component {
  state = {
    loading: null
  };

  render() {
    const {
      currentTask: { idTarea } = {},
      disabledGeneral,
      showScroll,
      documentsDataItem,
      loadingDocuments,
      tamanioPaginacion
    } = this.props;

    const columns = [
      {
        title: 'Tipo documento',
        dataIndex: 'tipodocumento',
        key: 'tipodocumento'
      },
      {
        title: 'Subtipo',
        dataIndex: 'subtipo',
        key: 'subtipo'
      },
      {
        title: 'Descripci\u00f3n',
        dataIndex: 'descripcion',
        key: 'descripcion',
        onCell: () => {
          return {
            style: {
              whiteSpace: 'nowrap',
              maxWidth: 200
            }
          };
        },
        render: text => {
          return (
            <Tooltip title={text} placement={showScroll ? 'bottom' : 'right'}>
              <div style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>{text}</div>
            </Tooltip>
          );
        }
      },
      {
        title: 'Documento',
        dataIndex: 'documento',
        key: 'documento',
        render: (text, record) =>
          disabledGeneral && idTarea === TAREAS.ANALIZAR_SINIESTRO ? (
            <span>{text}</span>
          ) : (
            <Button onClick={() => Utils.descargarDocumento(this.props, record.idDocMetadata)} type="link">
              {text}
            </Button>
          )
      },
      {
        title: 'Usuario',
        dataIndex: 'usuario',
        key: 'usuario'
      },
      {
        title: 'Fecha carga',
        dataIndex: 'fechacarga',
        key: 'fechacarga',
        render: text => Utils.formatDateBandeja(text)
      }
    ];

    return (
      <React.Fragment>
        {showScroll && (
          <Table
            columns={columns}
            dataSource={documentsDataItem}
            loading={loadingDocuments}
            pagination={{ defaultPageSize: tamanioPaginacion }}
            size="small"
            scroll={{ x: '140%' }}
          />
        )}
        {!showScroll && (
          <Table
            columns={columns}
            dataSource={documentsDataItem}
            loading={loadingDocuments}
            pagination={{ defaultPageSize: tamanioPaginacion }}
            size="small"
          />
        )}
      </React.Fragment>
    );
  }
}
export default connect()(DocumentSinistersTable);
