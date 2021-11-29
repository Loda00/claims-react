import React from 'react';
import { Table, Form } from 'antd';
import currency from 'currency.js';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { getParamGeneral } from 'services/types/reducer';
import { mostrarModalSiniestroaPreventivo, modalInformacion } from 'util/index';
import { TAREAS, ROLES_USUARIOS, ESTADO, TASA_CAMBIO_PRECISION } from 'constants/index';

class CoberturaTable extends React.Component {
  state = {
    selectedRowKeys: [],
    cleanRadio: false
  };

  componentDidUpdate(prevProps, prevState) {
    const { ramos } = this.props;

    if (!isEmpty(ramos) && prevProps.ramos !== ramos) {
      this.limpiarCoberturaSeleccionada();
    }
  }

  limpiarCoberturaSeleccionada = () => {
    this.setState({
      selectedRowKeys: []
    });
  };

  calcularTotalPagoPorCobertura = cobertura => {
    const {
      analizarForm: { getFieldValue }
    } = this.props;
    const { indemnizaciones = [], reposiciones = [] } = getFieldValue('pagos') || {};

    const indemnizacionNormalizado = indemnizaciones.map(indemnizacion => {
      return {
        ...indemnizacion,
        mtoImporte: indemnizacion.mtoIndemnizacionBruta
      };
    });

    const pagosUnificados = [...indemnizacionNormalizado, ...reposiciones];

    const result = pagosUnificados
      .filter(({ codCobertura, codRamo }) => codCobertura === cobertura.codCobert && codRamo === cobertura.codRamo)
      .reduce(
        (total, record) =>
          currency(total, { precision: TASA_CAMBIO_PRECISION }).add(record.mtoImporte, {
            precision: TASA_CAMBIO_PRECISION
          }),
        0
      );

    if (result && result.value) return result;
    return currency(0);
  };

  calcularTotalIndemnizacionPorCobertura = cobertura => {
    const {
      analizarForm: { getFieldValue }
    } = this.props;
    const { indemnizaciones = [] } = getFieldValue('pagos') || {};

    const result = indemnizaciones
      .filter(({ codCobertura, codRamo }) => codCobertura === cobertura.codCobert && codRamo === cobertura.codRamo)
      .reduce(
        (total, record) =>
          currency(total, { precision: TASA_CAMBIO_PRECISION }).add(record.mtoIndemnizacionBruta, {
            precision: TASA_CAMBIO_PRECISION
          }),
        0
      );

    if (result && result.value) return result.format();
    return currency(0).format();
  };

  modalExistenPagos = () => {
    const obj = {
      cb: () => {
        this.setState({
          selectedRowKeys: [],
          cleanRadio: false
        });
      },
      title: 'Anular cobertura',
      content: (
        <div>
          <p>Ud. No puede anular la cobertura porque tiene pagos.</p>
        </div>
      )
    };
    modalInformacion(obj);
  };

  modalExistenRamo = () => {
    const obj = {
      cb: () => {
        this.setState({
          selectedRowKeys: [],
          cleanRadio: false
        });
      },
      title: 'Anular cobertura',
      content: (
        <div>
          <p>Ud. No puede rechazar la cobertura porque existe en Otros Conceptos.</p>
        </div>
      )
    };
    modalInformacion(obj);
  };

  modalCoberturaRechaza = () => {
    const obj = {
      cb: () => {
        this.setState({
          selectedRowKeys: [],
          cleanRadio: false
        });
      },
      title: 'Anular cobertura',
      content: (
        <div>
          <p>Ud. No puede anular esta cobertura porque está rechazada.</p>
        </div>
      )
    };
    modalInformacion(obj);
  };

  validarRadioCobertura = () => {
    const {
      analizarForm: { getFieldValue }
    } = this.props;

    const { indemnizaciones = [], reposiciones = [] } = getFieldValue('pagos') || {};

    const pagos = [...reposiciones, ...indemnizaciones];

    let habilitar = false;

    pagos.forEach(({ flagRevisarPago }) => {
      if (flagRevisarPago === 'S') {
        habilitar = true;
      }
    });

    return habilitar;
  };

  validarOtrosPagos = cobertura => {
    const {
      analizarForm: { getFieldValue }
    } = this.props;

    const { codCobert, ramo } = cobertura;

    const { indemnizaciones = [], reposiciones = [] } = getFieldValue('pagos') || {};

    let tieneOtrosPagos = false;

    const pagos = [...reposiciones, ...indemnizaciones];

    pagos.forEach(pago => {
      if (pago.codCobertura === codCobert && pago.codRamo === ramo) {
        tieneOtrosPagos = true;
      }
    });

    return tieneOtrosPagos;
  };

  validarPagos = (cobertura, bool) => {
    const {
      analizarForm: { getFieldValue },
      tarea: { idTarea }
    } = this.props;

    const { indemnizaciones = [], reposiciones = [] } = getFieldValue('pagos') || {};

    let esValido = false;

    const pagos = [...reposiciones, ...indemnizaciones];

    pagos.forEach(({ codCobertura, codRamo, flagRevisarPago }) => {
      if (idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO) {
        if (codCobertura === cobertura.codCobert && codRamo === cobertura.ramo && flagRevisarPago === 'S') {
          esValido = true;
        }
      } else if (codCobertura === cobertura.codCobert && codRamo === cobertura.ramo) {
        esValido = true;
      }
    });

    if (esValido && bool) {
      this.setState({
        cleanRadio: true
      });
    }
    return esValido;
  };

  configurarEstado = estado => {
    if (estado === ESTADO.PENDIENTE) {
      return 'Pendiente';
    }
    if (estado === ESTADO.REGISTRADO) {
      return 'Registrado';
    }
    return '';
  };

  validarRamosDelSiniestro = cobertura => {
    const {
      analizarForm: { getFieldValue },
      ramos
    } = this.props;

    let totalRamos = [];
    ramos.forEach(ramo => {
      if (ramo.codRamo === cobertura.ramo) {
        totalRamos = ramo.coberturas;
      }
    });

    let existeRamo = false;

    if (totalRamos.length === 1) {
      const listaOtrosConceptos = !isEmpty(getFieldValue('siniestro').otrosConceptos)
        ? getFieldValue('siniestro').otrosConceptos
        : [];
      const listaCodRamos = listaOtrosConceptos.map(({ codRamo }) => {
        return codRamo;
      });

      const existe = listaCodRamos.includes(cobertura.ramo);
      if (existe) {
        existeRamo = true;
      }
    }

    return existeRamo;
  };

  render() {
    const {
      ramos,
      setModalVisibleEdit,
      setAnularCoberturaSeleccionada,
      disabledGeneral,
      tarea: { idTarea },
      disabled,
      loadingAnular,
      analizarForm: { getFieldValue },
      rechazoPago,
      siniestro,
      idCaso,
      numberPagination,
      verificarUsuario
    } = this.props;

    let { selectedRowKeys } = this.state;
    const { cleanRadio } = this.state;

    const cerrarSiniestro = getFieldValue('indCerrarSiniestro');
    const esPreventivo = getFieldValue('tipoSiniestro') === 'P';
    const esRechazo = rechazoPago === 'R';
    const esPago = rechazoPago === 'A';
    const siniestroCambioPreventivo = getFieldValue('tipoSiniestro') === 'N' && siniestro.codTipoSiniestro === 'P';
    const esEjecutivoSiniestro = verificarUsuario(ROLES_USUARIOS.EJECUTIVO_DE_SINIESTRO);
    const esAjustador = verificarUsuario(ROLES_USUARIOS.AJUSTADOR);
    const tienePagosEnElSiniestro = TAREAS.REVISAR_PAGO_EJECUTIVO === idTarea && this.validarRadioCobertura();

    const rowSelection = {
      type: 'radio',
      onChange: this.onSelectChange,
      selectedRowKeys: cleanRadio ? (selectedRowKeys = []) : selectedRowKeys,
      getCheckboxProps: () => ({
        disabled:
          disabled ||
          loadingAnular ||
          cerrarSiniestro ||
          esPreventivo ||
          idTarea === TAREAS.CONFIRMAR_GESTION ||
          idTarea === TAREAS.ADJUNTAR_CARGO_DE_RECHAZO ||
          disabledGeneral ||
          tienePagosEnElSiniestro ||
          !(
            esEjecutivoSiniestro &&
            (idTarea === TAREAS.ANALIZAR_SINIESTRO ||
              idTarea === TAREAS.REVISAR_INFORME_BASICO ||
              idTarea === TAREAS.REVISAR_INFORME ||
              idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO)
          ) ||
          (esAjustador && idTarea === TAREAS.GENERAR_INFORME_BASICO) ||
          esRechazo
      }),
      onSelect: cobertura => {
        selectedRowKeys.pop();
        selectedRowKeys.push(cobertura.idCobertura || cobertura.ideCobert);
        const existenPagos = this.validarPagos(cobertura, true);
        const existeRamo = this.validarRamosDelSiniestro(cobertura);
        const tieneOtrosPagos = TAREAS.REVISAR_PAGO_EJECUTIVO === idTarea && this.validarOtrosPagos(cobertura);

        if (existenPagos) {
          this.modalExistenPagos();
          setAnularCoberturaSeleccionada(null);
        } else if (cobertura.siniestroSinCobertura === 'SI') {
          this.modalCoberturaRechaza();
          setAnularCoberturaSeleccionada(null);
        } else if (existeRamo) {
          this.modalExistenRamo();
          setAnularCoberturaSeleccionada(null);
        } else if (tieneOtrosPagos) {
          setAnularCoberturaSeleccionada(null);
          this.modalExistenPagos();
        } else {
          setAnularCoberturaSeleccionada(cobertura);
        }
      }
    };

    const columns = [
      {
        title: 'Ramo',
        dataIndex: 'ramo',
        key: 'ramo'
      },
      {
        title: 'Cobertura',
        dataIndex: 'codigoYcobertura',
        key: 'codigoYcobertura',
        render: (text, record) => {
          return (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events
            <span
              style={{
                color: 'red',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
              onClick={
                cerrarSiniestro ||
                esPreventivo ||
                siniestroCambioPreventivo ||
                disabledGeneral ||
                idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO ||
                idTarea === undefined
                  ? () => {
                      if (siniestroCambioPreventivo) {
                        mostrarModalSiniestroaPreventivo();
                      }
                      if (
                        (this.validarPagos(record, false) && idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO) ||
                        idTarea === undefined ||
                        esRechazo ||
                        esPago
                      ) {
                        setModalVisibleEdit(record);
                      }
                    }
                  : () => {
                      setModalVisibleEdit(record);
                      this.limpiarCoberturaSeleccionada();
                    }
              }
              role="menu"
              tabIndex={0}
            >
              {text}
            </span>
          );
        }
      },
      {
        key: '1',
        title: 'Monto reclamado',
        dataIndex: 'montoReclamado',
        align: 'right'
      },
      {
        key: '2',
        title: 'Suma asegurada',
        align: 'right',
        dataIndex: 'sumaAsegurada'
      },
      {
        key: '3',
        title: 'Reserva antes de deducible',
        align: 'right',
        dataIndex: 'reservaAntesDeducible'
      },
      {
        key: '4',
        title: 'Saldo pendiente cobertura',
        align: 'right',
        dataIndex: 'saldoPendienteCobertura'
      },
      {
        key: '5',
        title: 'Total pagos',
        align: 'right',
        dataIndex: 'totalPagosAprobadosCobertura',
        render: text => currency(text).format()
      },
      {
        key: '6',
        title: 'Moneda de indemnización',
        dataIndex: 'monedaIndemnizacion'
      },
      {
        key: '7',
        title: 'Indemnización',
        align: 'right',
        dataIndex: 'indemnizacion'
      },
      {
        key: '8',
        title: 'Causa',
        dataIndex: 'causa'
      },
      {
        key: '9',
        title: 'Consecuencia',
        dataIndex: 'consecuencia'
      },
      {
        key: '10',
        title: 'Siniestro sin cobertura',
        dataIndex: 'siniestroSinCobertura'
      },
      {
        key: '11',
        title: 'Estado',
        dataIndex: 'estado',
        fixed: 'right',
        width: 70,
        defaultSortOrder: 'ascend'
      }
    ];

    const data = [];

    if (!isEmpty(ramos)) {
      ramos.forEach(ramo => {
        const row = ramo.coberturas.map(item => ({
          key: item.idCobertura || item.ideCobert,
          ramo: ramo.codRamo,
          pkRamo: ramo.secRamo,
          codigoYcobertura: item.codCobert ? `${item.codCobert} - ${item.descCobertura || item.dscCobert}` : '',
          cobertura: item.descCobertura || item.dscCobert || '',
          montoReclamado: currency(item.montoReclamado || item.mtoResMo || '').format(),
          sumaAsegurada: currency(item.sumaAsegurada || item.mtoSumaAsegurada || '').format(),
          reservaAntesDeducible: currency(item.montoReserva || '').format(),
          totalPagosAprobadosCobertura: currency(
            item.totalPagosAprobados || this.calcularTotalPagoPorCobertura(item).value,
            { precision: TASA_CAMBIO_PRECISION }
          ).format(),
          get saldoPendienteCobertura() {
            return currency(item.montoReserva)
              .subtract(this.totalPagosAprobadosCobertura)
              .format();
          },
          monedaIndemnizacion: item.codMoneda || item.codMoRes || '',
          indemnizacion: currency(item.indemnizacion || this.calcularTotalIndemnizacionPorCobertura(item)).format(),
          causa: item.dscCausa || '',
          consecuencia: item.dscConsecuencia || item.dscConsec || '',
          siniestroSinCobertura: item.indSinCobertura === 'S' ? 'SI' : 'NO',
          codCausa: item.codCausa,
          codCobert: item.codCobert,
          idCobertura: item.idCobertura || item.ideCobert,
          dscCobertura: item.descCobertura || item.dscCobert,
          secCobertura: item.secCobertura,
          codConsecuencia: item.codConsecuencia || item.codConsec,
          tipoRes: item.tipo || item.tipoRes,
          codCpto: item.codCpto,
          delete: false,
          estado: this.configurarEstado(item.estado),
          codMotivoRechazo: item.codMotivoRechazo,
          codMotivoRechazoSBS: item.codMotivoRechazoSBS,
          detOtrosCasos: item.detOtrosCasos,
          codProceso: item.codProceso,
          fechaCreacion: item.fechaCreacion
        }));
        if (!(Number(row[0].montoReclamado) === 0)) {
          data.push(...row);
        }
      });
    }

    const coberturaRechazada = [];
    if (esRechazo && !isEmpty(data) && idCaso && idTarea === TAREAS.ADJUNTAR_CARGO_DE_RECHAZO) {
      data.forEach(item => {
        if (item.codProceso === Number(idCaso)) {
          coberturaRechazada.push(item);
        }
      });
    }

    data.sort((f1, f2) => {
      const a = new Date(f1.fechaCreacion);
      const b = new Date(f2.fechaCreacion);
      // eslint-disable-next-line no-nested-ternary
      return a < b ? -1 : a > b ? 1 : 0;
    });

    return (
      <Table
        id="tabla_coberturas"
        rowClassName={record => {
          if (record.estado === 'Pendiente') {
            return 'claims-rrgg-edicion-ajustador';
          }
          return '';
        }}
        rowSelection={rowSelection}
        columns={columns}
        dataSource={!isEmpty(coberturaRechazada) ? coberturaRechazada : data}
        scroll={{ x: '180%' }}
        pagination={{
          defaultPageSize: numberPagination
        }}
        size="small"
      />
    );
  }
}

const mapStateToProps = state => ({
  numberPagination: getParamGeneral(state, 'TAMANIO_TABLA_PAGINA')
});

const Main = connect(mapStateToProps)(CoberturaTable);

export default Form.create({ name: 'tablaCobertura' })(Main);
