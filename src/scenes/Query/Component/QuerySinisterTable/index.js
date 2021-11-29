import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Table, Tooltip } from 'antd';
import { ESTADO_SINIESTRO } from 'constants/index';
import { connect } from 'react-redux';
import { getSearchSinister } from 'scenes/Query/data/searchSinister/reducer';
import { isEmpty } from 'lodash';
import * as Utils from 'util/index';
import { isNullOrUndefined } from 'util';

class QuerySinisterTable extends React.Component {
  state = {
    selectedRowKeys: []
  };

  componentDidUpdate(prevProps) {
    const { getSiniestros, desabilitarBotonModificar, restablecerValores } = this.props;

    if (!isEmpty(getSiniestros) && !isEmpty(prevProps.data) && prevProps.getSiniestros !== getSiniestros) {
      this.limpiarSiniestroSeleccionada();
      desabilitarBotonModificar();
      restablecerValores();
    }
  }

  limpiarSiniestroSeleccionada = () => {
    this.setState({
      selectedRowKeys: []
    });
  };

  onSelectChange = (selectedRowKeys, selectedRow) => {
    const { setDatosSiniestro, setIndRecupero, setIndSalvamento, setIndReaperturar } = this.props;

    const indRecuperoTable = selectedRow[0].indNotifRecupero;
    const indSalvamentoTable = selectedRow[0].indNotifSalvamento;
    const indReaperturar = selectedRow[0].codEstadoSiniestro;

    setDatosSiniestro(selectedRow[0]);
    setIndRecupero(indRecuperoTable);
    setIndSalvamento(indSalvamentoTable);
    setIndReaperturar(indReaperturar);
  };

  validarBotonModificar = ({ codEstadoSiniestro }) => {
    const { desabilitarBotonModificar, habilitarBotonModificar } = this.props;
    const {
      PENDIENTE_ANALIZAR_SINIESTRO,
      ANALIZAR_SINIESTRO_COMPLETADO,
      PENDIENTE_GENERAR_INFORME_BASICO,
      GENERAR_INFORME_BASICO_COMPLETADO,
      PENDIENTE_REVISAR_INFORME_BASICO,
      REVISAR_INFORME_BASICO_COMPLETADO,
      PENDIENTE_GENERAR_INFORME_DEVUELTO,
      PENDIENTE_GENERAR_INFORME,
      GENERAR_INFORME_COMPLETADO,
      PENDIENTE_REVISAR_INFORME,
      REVISAR_INFORME_COMPLETADO,
      PENDIENTE_GENERAR_INFORME_BASICO_DEVUELTO,
      INFORME_BASICO_APROBADO
    } = ESTADO_SINIESTRO;

    const ESTADOS = [
      PENDIENTE_ANALIZAR_SINIESTRO,
      ANALIZAR_SINIESTRO_COMPLETADO,
      PENDIENTE_GENERAR_INFORME_BASICO,
      GENERAR_INFORME_BASICO_COMPLETADO,
      PENDIENTE_REVISAR_INFORME_BASICO,
      REVISAR_INFORME_BASICO_COMPLETADO,
      PENDIENTE_GENERAR_INFORME_DEVUELTO,
      PENDIENTE_GENERAR_INFORME,
      GENERAR_INFORME_COMPLETADO,
      PENDIENTE_REVISAR_INFORME,
      REVISAR_INFORME_COMPLETADO,
      PENDIENTE_GENERAR_INFORME_BASICO_DEVUELTO,
      INFORME_BASICO_APROBADO
    ];

    if (ESTADOS.includes(codEstadoSiniestro)) {
      habilitarBotonModificar();
    } else {
      desabilitarBotonModificar();
    }
  };

  render() {
    const { data, pagination, loadingSearchSinister, showScroll, handlePagination } = this.props;

    const { selectedRowKeys } = this.state;

    const rowSelection = {
      type: 'radio',
      onChange: this.onSelectChange,
      selectedRowKeys,
      hideDefaultSelections: true,
      onSelect: siniestro => {
        this.validarBotonModificar(siniestro);
        selectedRowKeys.pop();
        selectedRowKeys.push(siniestro.key);
      }
    };

    const columns = [
      {
        title: 'Nro. siniestro',
        dataIndex: 'nrosiniestro',
        key: 'nrosiniestro',
        sorter: (a, b) => Utils.sortNumbers(a.nrosiniestro, b.nrosiniestro)
      },
      {
        title: 'Siniestro lider',
        dataIndex: 'nrosiniestrolider',
        key: 'nrosiniestrolider',
        sorter: (a, b) => Utils.sortStrings(a.nrosiniestrolider, b.nrosiniestrolider)
      },
      {
        title: 'Nro. planilla',
        dataIndex: 'numplanilla',
        key: 'numplanilla',
        sorter: (a, b) => Utils.sortStrings(a.numplanilla, b.numplanilla)
      },
      {
        title: 'Nro. caso',
        dataIndex: 'nrocaso',
        key: 'nrocaso',
        sorter: (a, b) => Utils.sortStrings(a.nrocaso, b.nrocaso),
        render: (text, record, index) =>
          !isNullOrUndefined(data[index].nroCasoReapertura) ? (
            <Tooltip title={data[index].nroCasoReapertura} placement={showScroll ? 'bottom' : 'right'}>
              <Link to={`/consultar-siniestro/${text}`}>
                <span className="anticon">{text}</span>
              </Link>
            </Tooltip>
          ) : (
            <Link to={`/consultar-siniestro/${text}`}>
              <span className="anticon">{text}</span>
            </Link>
          )
      },
      {
        title: 'Fecha ocurrencia',
        key: 'fecocurrencia',
        dataIndex: 'fecocurrencia',
        align: 'center',
        render: text => Utils.formatDateBandeja(text),
        sorter: (a, b) => Utils.sortDates(a.fecocurrencia, b.fecocurrencia, 'YYYY/MM/DD')
      },
      {
        title: 'Ramo',
        key: 'ramo',
        dataIndex: 'ramo',
        sorter: (a, b) => Utils.sortStrings(a.ramo, b.ramo)
      },
      {
        title: 'Nro. p\u00f3liza',
        dataIndex: 'numpoliza',
        key: 'numpoliza',
        sorter: (a, b) => Utils.sortStrings(a.numpoliza, b.numpoliza)
      },
      {
        title: 'Certificado',
        dataIndex: 'certificado',
        key: 'certificado',
        sorter: (a, b) => Utils.sortNumbers(a.certificado, b.certificado)
      },
      {
        title: 'Cobertura',
        dataIndex: 'cobertura',
        key: 'cobertura',
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
        sorter: (a, b) => Utils.sortStrings(a.cobertura, b.cobertura)
      },
      {
        title: 'Asegurado',
        key: 'asegurado',
        dataIndex: 'asegurado',
        sorter: (a, b) => Utils.sortStrings(a.asegurado, b.asegurado)
      },
      {
        title: 'Estado siniestro',
        key: 'estadosiniestro',
        dataIndex: 'estadosiniestro',
        render: (text, record, index) => {
          return (
            <Tooltip
              title={text === 'Pendiente registrar siniestro en el core' ? data[index].mensajeError : null}
              placement={showScroll ? 'bottom' : 'right'}
            >
              <div style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>{text}</div>
            </Tooltip>
          );
        },
        sorter: (a, b) => Utils.sortStrings(a.estadosiniestro, b.estadosiniestro)
      },
      {
        title: 'Ejecutivo asignado',
        key: 'ejecutivoasignado',
        dataIndex: 'ejecutivoasignado',
        sorter: (a, b) => Utils.sortStrings(a.ejecutivoasignado, b.ejecutivoasignado)
      },
      {
        title: 'Ajustador asignado',
        key: 'ajustadorasignado',
        dataIndex: 'ajustadorasignado',
        sorter: (a, b) => Utils.sortStrings(a.ajustadorasignado, b.ajustadorasignado)
      },
      {
        title: 'Equipo',
        key: 'equipo',
        dataIndex: 'equipo',
        sorter: (a, b) => Utils.sortStrings(a.equipo, b.equipo)
      }
    ];

    return (
      <React.Fragment>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={data}
          loading={loadingSearchSinister}
          pagination={pagination}
          onChange={handlePagination}
          size="small"
          scroll={{ x: '140%' }}
          style={{ paddingBottom: '10px' }}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  getSiniestros: getSearchSinister(state)
});

const Main = connect(mapStateToProps)(QuerySinisterTable);

export default withRouter(Main);
