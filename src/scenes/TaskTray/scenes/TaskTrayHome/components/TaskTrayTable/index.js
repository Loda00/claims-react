import React from 'react';
import { Link } from 'react-router-dom';
import { Table, Tooltip } from 'antd';
import * as Utils from 'util/index';
import { TAREAS, CONSTANTS_APP } from 'constants/index';
import './styles.css';

class TaskTrayTable extends React.Component {
  async componentDidMount() {
    const { fetchTaskTable, tamanioPagina } = this.props;
    try {
      await fetchTaskTable({
        tamPag: tamanioPagina,
        numPag: 1
      });
    } catch (error) {
      Utils.showErrorMessage(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
    }
  }

  returnTarea = ({ idTarea, nrocaso, idCaso }) => {
    switch (idTarea) {
      case TAREAS.COMPLETAR_DATOS:
        return `/tareas/completar/${nrocaso}/${idCaso}`;
      case TAREAS.ANALIZAR_SINIESTRO:
        return `/tareas/analizar/${nrocaso}/${idCaso}`;
      case TAREAS.GENERAR_INFORME_BASICO:
        return `/tareas/generar-informe-basico/${nrocaso}/${idCaso}`;
      case TAREAS.REVISAR_INFORME_BASICO:
        return `/tareas/revisar-informe-basico/${nrocaso}/${idCaso}`;
      case TAREAS.GENERAR_INFORME:
        return `/tareas/generar-informe/${nrocaso}/${idCaso}`;
      case TAREAS.REVISAR_INFORME:
        return `/tareas/revisar-informe/${nrocaso}/${idCaso}`;
      case TAREAS.CONFIRMAR_GESTION:
        return `/tareas/confirmar-gestion/${nrocaso}/${idCaso}`;
      case TAREAS.ADJUNTAR_CARGO_DE_RECHAZO:
        return `/tareas/adjuntar-cargo-rechazo/${nrocaso}/${idCaso}`;
      case TAREAS.REVISAR_PAGO_EJECUTIVO:
        return `/tareas/revisar-pago-ejecutivo/${nrocaso}/${idCaso}`;
      case TAREAS.REVISAR_PAGO_AJUSTADOR:
        return `/tareas/revisar-pago-ajustador/${nrocaso}/${idCaso}`;
      case TAREAS.VALIDAR_SINIESTRO_DUPLICADO:
        return `/tareas/siniestro-duplicado/${nrocaso}/${idCaso}`;
      default:
        return `/`;
    }
  };

  retornaDescripcionTarea = ({ idTarea, indCargaMasiva, indReservaCoasAprobada, tarea }) => {
    if (idTarea === TAREAS.ANALIZAR_SINIESTRO && indCargaMasiva === 'COA') {
      if (indReservaCoasAprobada === 'S') {
        return `${tarea} - PAGOS`;
      }
      return `${tarea} - RESERVAS`;
    }
    return tarea;
  };

  handleClick = () => {};

  returnColor = estado => {
    switch (estado) {
      case 'Overdue':
        return '#FF0000';
      case 'OnRisk':
        return '#FFFF00';
      default:
        return '#01DF01';
    }
  };

  sortEstado = (a, b) => {
    if (a === 'OnTime' && b === 'OnRisk') {
      return 1;
    }

    if (a === 'OnTime' && b === 'Overdue') {
      return 1;
    }

    if (a === 'OnRisk' && b === 'Overdue') {
      return 1;
    }

    if (a === 'OnRisk' && b === 'OnTime') {
      return -1;
    }

    if (a === 'Overdue' && b === 'OnTime') {
      return -1;
    }

    if (a === 'Overdue' && b === 'OnRisk') {
      return -1;
    }

    return 0;
  };

  render() {
    const {
      showScroll,
      pagination,
      taskTable: { taskTable, isLoading },
      handlePagination
    } = this.props;

    const columns = [
      {
        title: 'Tarea',
        dataIndex: 'tarea',
        key: 'tarea',
        className: 'claims-rrgg-table-task',
        render: (text, record) => (
          <Link to={this.returnTarea(record)} onClick={() => this.handleClick(text, record)} className="typeTask">
            {this.retornaDescripcionTarea(record)}
            <span className="estado" style={{ backgroundColor: this.returnColor(record.estado) }} />
          </Link>
        ),
        sorter: (a, b) => this.sortEstado(a.estado, b.estado),
        defaultSortOrder: 'ascend'
      },
      {
        title: 'Nro. siniestro',
        dataIndex: 'nrosiniestro',
        key: 'nrosiniestro',
        sorter: (a, b) => Utils.sortNumbers(a.nrosiniestro, b.nrosiniestro)
      },
      {
        title: 'Siniestro lider',
        dataIndex: 'siniestrolider',
        key: 'siniestrolider',
        sorter: (a, b) => Utils.sortStrings(a.siniestrolider, b.siniestrolider)
      },
      {
        title: 'Producto',
        dataIndex: 'codigoproducto',
        key: 'codigoproducto',
        render: (text, record) => {
          return (
            <Tooltip title={record.producto} placement={showScroll ? 'bottom' : 'right'}>
              <div style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>{text}</div>
            </Tooltip>
          );
        },
        sorter: (a, b) => Utils.sortNumbers(a.codigoproducto, b.codigoproducto)
      },
      {
        title: 'Coasegurador lider',
        dataIndex: 'coaseguradolider',
        key: 'coaseguradolider'
      },
      {
        title: 'Nro. caso',
        dataIndex: 'nrocaso',
        key: 'nrocaso',
        sorter: (a, b) => Utils.sortStrings(a.nrocaso, b.nrocaso)
      },
      {
        title: 'Nro. p\u00f3liza',
        dataIndex: 'numpoliza',
        key: 'numpoliza',
        sorter: (a, b) => Utils.sortStrings(a.numpoliza, b.numpoliza)
      },
      {
        title: 'Fecha ocurrencia',
        key: 'fecocurrencia',
        align: 'center',
        dataIndex: 'fecocurrencia',
        render: text => Utils.formatDateBandeja(text),
        sorter: (a, b) => Utils.sortDates(a.fecocurrencia, b.fecocurrencia, 'YYYY/MM/DD')
      },
      {
        title: 'Fecha registro',
        key: 'fecregistro',
        align: 'center',
        dataIndex: 'fecregistro',
        render: text => Utils.formatDateBandeja(text),
        sorter: (a, b) => Utils.sortDates(a.fecregistro, b.fecregistro, 'YYYY/MM/DD')
      },
      {
        title: 'Descripción',
        key: 'descripcion',
        dataIndex: 'descripcion',
        className: 'colDesc',
        onCell: () => {
          return {
            style: {
              whiteSpace: 'nowrap',
              maxWidth: 180
            }
          };
        },
        render: text => {
          return (
            <Tooltip title={text} placement={showScroll ? 'bottom' : 'right'}>
              <div style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>{text}</div>
            </Tooltip>
          );
        },
        sorter: (a, b) => Utils.sortStrings(a.descripcion, b.descripcion)
      },
      {
        title: 'Ramo',
        key: 'ramo',
        dataIndex: 'ramo',
        sorter: (a, b) => Utils.sortStrings(a.ramo, b.ramo)
      },
      {
        title: 'Asegurado',
        key: 'asegurado',
        dataIndex: 'asegurado',
        sorter: (a, b) => Utils.sortStrings(a.asegurado, b.asegurado)
      },
      {
        title: 'Moneda reserva',
        key: 'codmoneda',
        dataIndex: 'codmoneda',
        sorter: (a, b) => Utils.sortStrings(a.codmoneda, b.codmoneda)
      },
      {
        title: 'Monto reserva',
        key: 'montodelareserva',
        dataIndex: 'montodelareserva',
        align: 'right',
        render: text => Utils.formatAmount(text),
        sorter: (a, b) => Utils.sortNumbers(a.montodelareserva, b.montodelareserva)
      },
      {
        title: 'Corredor',
        key: 'corredor',
        dataIndex: 'corredor',
        sorter: (a, b) => Utils.sortStrings(a.corredor, b.corredor)
      }
    ];

    const data = taskTable.map((taskItem, index) => {
      const tieneValor =
        taskItem.indConfirmarPago &&
        (taskItem.tarea === 'CONFIRMAR GESTIÓN' || taskItem.tarea === 'REVISAR PAGO EJECUTIVO');

      // const tieneValor = taskItem.indConfirmarPago && taskItem.tarea === 'CONFIRMAR GESTIÓN';
      const confirmarPago = tieneValor ? (taskItem.indConfirmarPago === 'R' ? 'RECHAZO' : 'PAGO') : null;

      return {
        key: index,
        tarea: tieneValor ? `${taskItem.tarea} - ${confirmarPago}` : taskItem.tarea,
        codtarea: taskItem.codTarea,
        estado: taskItem.estado,
        nrosiniestro: taskItem.idSiniestro,
        nrocaso: taskItem.numSiniestro,
        fecocurrencia: taskItem.fecOcurrencia,
        fecregistro: taskItem.fecCreacion,
        descripcion: taskItem.descripcion,
        ramo: taskItem.dscRamo,
        asegurado: taskItem.asegurado,
        montodelareserva: taskItem.montoReserva,
        codmoneda: taskItem.codMoneda,
        corredor: taskItem.corredor,
        numpoliza: taskItem.numPoliza,
        idCaso: taskItem.idCaso,
        idTarea: taskItem.idTarea,
        producto: taskItem.dscProducto,
        codigoproducto: taskItem.codPRoducto,
        siniestrolider: taskItem.siniestroLider,
        coaseguradolider: taskItem.coaseguradorLider,
        indCargaMasiva: taskItem.indCargaMasiva,
        indReservaCoasAprobada: taskItem.indReservaCoasAprobada
      };
    });

    return (
      <div className="seccion_claims">
        <Table
          columns={columns}
          dataSource={data}
          loading={isLoading}
          pagination={pagination}
          onChange={handlePagination}
          size="small"
          scroll={{ x: '120%' }}
        />
      </div>
    );
  }
}

export default TaskTrayTable;
