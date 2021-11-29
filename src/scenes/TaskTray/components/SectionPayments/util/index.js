import React from 'react';
import { Popconfirm, Icon, Divider, Tooltip } from 'antd';
import currency from 'currency.js';
import { get } from 'lodash';
import { TAREAS, TASA_CAMBIO_PRECISION } from 'constants/index';
import * as Utils from 'util/index';

export const noHabilitaBotonAgregar = params => {
  const {
    currentTask: { idTarea },
    analizarForm: { getFieldValue },
    tipo,
    disabledGeneral,
    coordenadas = [],
    tipoConfirmarGestion,
    esDevolver,
    dataSinister: { indCargaMasiva, indReservaCoasAprobada }
  } = params;

  if (disabledGeneral) {
    return true;
  }

  const {
    CONFIRMAR_GESTION,
    ADJUNTAR_CARGO_DE_RECHAZO,
    REVISAR_PAGO_EJECUTIVO,
    REVISAR_PAGO_AJUSTADOR,
    ANALIZAR_SINIESTRO
  } = TAREAS;
  const { indCerrarSiniestro: seCierraSiniestro } = getFieldValue('siniestro') || {};

  const tipoSiniestro = getFieldValue('tipoSiniestro') || {};
  const ajustadorRequerido = getFieldValue('ajustadorRequerido') || {};

  const tareasDondeNoMuestra = [CONFIRMAR_GESTION, ADJUNTAR_CARGO_DE_RECHAZO, REVISAR_PAGO_AJUSTADOR];
  if (tareasDondeNoMuestra.includes(idTarea)) {
    return true;
  }

  const esSiniestroPreventivo = tipoSiniestro === 'P';
  if (esSiniestroPreventivo) {
    return true;
  }

  if (seCierraSiniestro) {
    return true;
  }

  const esTipoHonorarios = tipo === 'H';
  const noRequiereAjustador = ajustadorRequerido === 'N';

  if (esTipoHonorarios && noRequiereAjustador) {
    return true;
  }

  const esTipoCoordenadas = tipo === 'C';
  const tieneCoordenadaRegistrada = coordenadas.length === 1;
  if (esTipoCoordenadas && tieneCoordenadaRegistrada) {
    return true;
  }

  const esTareaRevisarPagoEjecutivo = idTarea === REVISAR_PAGO_EJECUTIVO;
  const esUnRechazo = tipoConfirmarGestion === 'R';
  const esUnPago = tipoConfirmarGestion === 'A';
  if (esTareaRevisarPagoEjecutivo) {
    if (esUnRechazo) {
      const ramosCoberturasForm = getFieldValue('dataRamosCoberturas');
      const checkSincobertura = get(ramosCoberturasForm, 'ramosCoberturas[0].coberturas[0].indSinCobertura');
      const coberturaRevisarTieneCheckSinCobertura = checkSincobertura === 'S';
      const tiposDondeNoSeMuestra = ['H', 'O', 'A', 'C'];
      if (tiposDondeNoSeMuestra.includes(tipo)) {
        return true;
      }

      if (coberturaRevisarTieneCheckSinCobertura) {
        return true;
      }
      const { indemnizaciones = [], reposiciones = [] } = getFieldValue('pagos');
      const pagosCobertura = [...indemnizaciones, ...reposiciones];
      if (pagosCobertura.length === 1) {
        return true;
      }
    } else if (esUnPago) {
      return true;
    }
  }

  const esIndemnizacion = tipo === 'I';
  const esReposicion = tipo === 'R';
  const esInformeFinal = getFieldValue('informeFinal') === 'S';
  const requiereNuevoAjustador = getFieldValue('nuevoAjustador') === 'S';
  const completarInformeFinal =
    esInformeFinal && !requiereNuevoAjustador && !esDevolver && idTarea === TAREAS.REVISAR_INFORME;
  const liquidaAnalizarSiniestro = idTarea === ANALIZAR_SINIESTRO && noRequiereAjustador;
  const liquidaRevisarInforme = completarInformeFinal;

  const liquida = liquidaAnalizarSiniestro || liquidaRevisarInforme;

  const { indemnizaciones = [], reposiciones = [] } = getFieldValue('pagos');

  if (liquida && esReposicion) {
    if (indemnizaciones.length > 0) {
      return true;
    }
  }

  if (liquida && esIndemnizacion) {
    if (reposiciones.length > 0) {
      return true;
    }
  }

  if (indCargaMasiva === 'COA') {
    if (indReservaCoasAprobada !== 'S') {
      return true;
    }
  }

  return false;
};

export const actualizaTotalPagosAdicion = (analizarForm, newPago) => {
  const dataRamosCoberturasFormItem = analizarForm.getFieldValue('dataRamosCoberturas') || {};
  const { ramosCoberturas = [] } = dataRamosCoberturasFormItem;

  analizarForm.setFieldsValue({
    dataRamosCoberturas: {
      ...dataRamosCoberturasFormItem,
      ramosCoberturas: ramosCoberturas.map(ramoCo => {
        if (ramoCo.codRamo === newPago.codRamo) {
          return {
            ...ramoCo,
            coberturas: ramoCo.coberturas.map(cobertura => {
              if (cobertura.codCobert === newPago.codCobertura) {
                return {
                  ...cobertura,
                  totalPagosAprobados: currency(cobertura.totalPagosAprobados, {
                    precision: TASA_CAMBIO_PRECISION
                  }).add(
                    currency(newPago.mtoImporte, {
                      precision: TASA_CAMBIO_PRECISION
                    }).multiply(newPago.mtoTasaCambio, {
                      precision: TASA_CAMBIO_PRECISION
                    })
                  ).value
                };
              }
              return cobertura;
            })
          };
        }
        return ramoCo;
      })
    }
  });
};

export const actualizaTotalPagosActualiza = (analizarForm, newPago, selectedPago) => {
  const dataRamosCoberturasFormItem = analizarForm.getFieldValue('dataRamosCoberturas') || {};
  const { ramosCoberturas = [] } = dataRamosCoberturasFormItem;

  // devuelve el monto de pago a la cobertura anterior
  analizarForm.setFieldsValue({
    dataRamosCoberturas: {
      ...dataRamosCoberturasFormItem,
      ramosCoberturas: ramosCoberturas.map(ramoCo => {
        if (ramoCo.codRamo === selectedPago.codRamo) {
          return {
            ...ramoCo,
            coberturas: ramoCo.coberturas.map(cobertura => {
              if (cobertura.codCobert === selectedPago.codCobertura) {
                return {
                  ...cobertura,
                  totalPagosAprobados: currency(cobertura.totalPagosAprobados, {
                    precision: TASA_CAMBIO_PRECISION
                  }).subtract(
                    currency(selectedPago.mtoImporte, {
                      precision: TASA_CAMBIO_PRECISION
                    }).multiply(selectedPago.mtoTasaCambioRegistro, {
                      precision: TASA_CAMBIO_PRECISION
                    })
                  ).value
                };
              }
              return cobertura;
            })
          };
        }
        return ramoCo;
      })
    }
  });

  // adiciona el monto del nuevo pago a la cobertura correspondiente
  actualizaTotalPagosAdicion(analizarForm, newPago);
};

export const actualizaTotalPagosElimina = (analizarForm, record) => {
  const dataRamosCoberturasFormItem = analizarForm.getFieldValue('dataRamosCoberturas') || {};
  const { ramosCoberturas = [] } = dataRamosCoberturasFormItem;

  analizarForm.setFieldsValue({
    dataRamosCoberturas: {
      ...dataRamosCoberturasFormItem,
      ramosCoberturas: ramosCoberturas.map(ramoCo => {
        if (ramoCo.codRamo === record.codRamo) {
          return {
            ...ramoCo,
            coberturas: ramoCo.coberturas.map(cobertura => {
              if (cobertura.codCobert === record.codCobertura) {
                return {
                  ...cobertura,
                  totalPagosAprobados: currency(cobertura.totalPagosAprobados, {
                    precision: TASA_CAMBIO_PRECISION
                  }).subtract(
                    currency(record.mtoImporte, {
                      precision: TASA_CAMBIO_PRECISION
                    }).multiply(record.mtoTasaCambioRegistro, {
                      precision: TASA_CAMBIO_PRECISION
                    })
                  ).value
                };
              }
              return cobertura;
            })
          };
        }
        return ramoCo;
      })
    }
  });
};

export const tablaPagosMostrarEliminar = (tipoPago, props, record) => {
  const { userClaims, currentTask: { idTarea } = {}, flagModificar } = props;
  const { codEstado, indCreoAjustador, indAprobado, codProceso, indCreaEnModificar } = record;

  if (flagModificar && indCreaEnModificar !== 'S') return false;

  const esAjustador = Utils.esUsuarioAjustador(userClaims);
  // el ajustador no puede eliminar si lo creo el ejecutivo
  if (esAjustador && indCreoAjustador === 'N') {
    return false;
  }

  switch (tipoPago) {
    case 'I':
    case 'H':
    case 'O':
    case 'R':
      {
        const esEstadoPendiente = codEstado === 'PE' && !codProceso;

        if (tipoPago === 'I' || tipoPago === 'R') {
          if (esEstadoPendiente) return true;
        }

        if (tipoPago === 'H' || tipoPago === 'O' || tipoPago === 'Z') {
          if (esEstadoPendiente) return true;
        }

        if (idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO) {
          return true;
        }
      }
      break;
    case 'A':
      if (indAprobado === 'N') return true;
      break;
    case 'C':
      {
        const esEstadoPendiente = indAprobado === 'N';
        const esAdjuntarOConfirmarGestion = [TAREAS.ADJUNTAR_CARGO_DE_RECHAZO, TAREAS.CONFIRMAR_GESTION].includes(
          idTarea
        );

        if (esEstadoPendiente && !esAdjuntarOConfirmarGestion) {
          return true;
        }
      }
      break;
    default:
      return false;
  }
  return false;
};

export const tablaPagosMostrarEditar = (tipoPago, props, record) => {
  const { userClaims, currentTask: { idTarea } = {}, flagModificar } = props;
  const { codEstado, indAprobado, indCreaEnModificar } = record;

  if (flagModificar && indCreaEnModificar !== 'S') return false;

  const esAjustador = Utils.esUsuarioAjustador(userClaims);
  // el ajustador no puede eliminar si lo creo el ejecutivo
  if (esAjustador && record.indCreoAjustador === 'N') {
    return false;
  }

  switch (tipoPago) {
    case 'I':
    case 'H':
    case 'O':
    case 'R':
      {
        const esEstadoPendiente = codEstado === 'PE' && !record.codProceso;
        if (esEstadoPendiente) return true;

        if (idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO || idTarea === TAREAS.REVISAR_PAGO_AJUSTADOR) {
          return true;
        }
      }
      break;
    case 'A':
      if (indAprobado === 'N') return true;
      break;
    case 'C':
      {
        const esAdjuntarOConfirmarGestion = [TAREAS.ADJUNTAR_CARGO_DE_RECHAZO, TAREAS.CONFIRMAR_GESTION].includes(
          idTarea
        );
        if (!esAdjuntarOConfirmarGestion) {
          return true;
        }
      }
      break;
    default:
      return false;
  }

  return false;
};

export const tablaPagosMostrarEnviar = (tipoPago, props, record) => {
  const { userClaims, currentTask: { idTarea } = {}, flagModificar } = props;
  const { codEstado, indAprobado, indCreaEnModificar } = record;

  if (flagModificar && indCreaEnModificar !== 'S') return false;

  switch (tipoPago) {
    case 'I':
    case 'H':
    case 'O':
    case 'R':
      {
        const esEstadoPendiente = codEstado === 'PE' && !record.codProceso;

        if (esEstadoPendiente && Utils.esUsuarioEjecutivo(userClaims) && idTarea !== TAREAS.REVISAR_PAGO_EJECUTIVO)
          return true;
      }
      break;
    case 'A':
      if (Utils.esUsuarioEjecutivo(userClaims) && record.indAprobado === 'N') return true;
      break;
    case 'C':
      {
        const esEjecutivo = Utils.esUsuarioEjecutivo(userClaims);
        const esEstadoPendiente = indAprobado === 'N' || indAprobado === 'P';
        const esAdjuntarOConfirmarGestion = [TAREAS.ADJUNTAR_CARGO_DE_RECHAZO, TAREAS.CONFIRMAR_GESTION].includes(
          idTarea
        );

        if (esEstadoPendiente && esEjecutivo && !esAdjuntarOConfirmarGestion) {
          return true;
        }
      }
      break;
    default:
      return false;
  }

  return false;
};

const escondeColumnaAccion = (tipoPago, props) => {
  const {
    disabledGeneral,
    indemnizaciones = [],
    honorarios = [],
    otrosConceptos = [],
    reposiciones = [],
    acreencias = [],
    coordenadas = []
  } = props;

  if (disabledGeneral) {
    return true;
  }

  let pagos = [];

  switch (tipoPago) {
    case 'I':
      pagos = indemnizaciones;
      break;
    case 'H':
      pagos = honorarios;
      break;
    case 'O':
      pagos = otrosConceptos;
      break;
    case 'R':
      pagos = reposiciones;
      break;
    case 'A':
      pagos = acreencias;
      break;
    case 'C':
      pagos = coordenadas;
      break;
    default:
      throw new Error('No se reconoce tipo pago');
  }

  const muestraOpcion = pagos.some(
    pago =>
      tablaPagosMostrarEditar(tipoPago, props, pago) ||
      tablaPagosMostrarEliminar(tipoPago, props, pago) ||
      tablaPagosMostrarEnviar(tipoPago, props, pago)
  );

  if (!muestraOpcion) {
    return true;
  }

  return false;
};

const construirColumnaAccion = (tipoPago, props) => {
  const { handleDelete, setModalVisibleEdit, enviar } = props;

  return {
    title: 'Accion',
    fixed: 'right',
    dataIndex: 'accion',
    className: `size-column-action ${escondeColumnaAccion(tipoPago, props) ? 'hide' : 'show'}`,
    render: (text, record) => (
      <span>
        {tablaPagosMostrarEliminar(tipoPago, props, record) && (
          <React.Fragment>
            <Popconfirm
              title="Seguro de eliminar?"
              type="primary"
              onConfirm={() => handleDelete(record)}
              id="confirmar-eliminar-pago"
            >
              <Tooltip placement="bottom" title="Eliminar">
                <Icon type="delete" theme="filled" style={{ color: 'red', fontSize: '17px' }} />
              </Tooltip>
            </Popconfirm>
            <Divider type="vertical" />
          </React.Fragment>
        )}
        {tablaPagosMostrarEditar(tipoPago, props, record) && (
          <React.Fragment>
            <Tooltip placement="bottom" title="Editar">
              <Icon
                type="edit"
                theme="filled"
                style={{ color: 'red', fontSize: '17px' }}
                onClick={() => setModalVisibleEdit(record)}
              />
            </Tooltip>
            <Divider type="vertical" />
          </React.Fragment>
        )}
        {tablaPagosMostrarEnviar(tipoPago, props, record) && (
          <React.Fragment>
            <Popconfirm
              title="Seguro de enviar?"
              type="primary"
              onConfirm={() => enviar(record)}
              id="confirmar-enviar-pago"
            >
              <Tooltip placement="bottom" title="Enviar">
                <Icon type="right" style={{ color: 'red', fontSize: '17px' }} />
              </Tooltip>
            </Popconfirm>
          </React.Fragment>
        )}
      </span>
    )
  };
};

export const construirColumnas = (tipoPago, props) => {
  const { tieneCoaseguro } = props;
  const columns = [];

  const columnaDscTipoCobro = {
    title: 'Tipo cobro',
    dataIndex: 'dscTipoCobro',
    sorter: (a, b) => Utils.sortStrings(a.dscTipoCobro, b.dscTipoCobro),
    className: `size-column-md ${!tieneCoaseguro ? 'hide' : 'show'}`
  };

  const columnaMontoCoaseguro = {
    title: 'Monto coaseguro',
    dataIndex: 'mtoCoaseguro',
    render: text => Utils.formatAmount(text),
    sorter: (a, b) => Utils.sortNumbers(a.mtoCoaseguro, b.mtoCoaseguro),
    className: `size-column-sm ${!tieneCoaseguro ? 'hide' : 'show'}`
  };

  const columnaCodRamo = {
    title: 'Ramo',
    dataIndex: 'codRamo',
    className: 'size-column-xs',
    sorter: (a, b) => Utils.sortStrings(a.codRamo, b.codRamo)
  };

  const columnaTipoDocumento = {
    title: 'Tipo documento',
    dataIndex: 'dscTipoDocumento',
    className: 'size-column-md',
    sorter: (a, b) => Utils.sortStrings(a.dscTipoDocumento, b.dscTipoDocumento)
  };

  const columnaCodMoneda = {
    title: 'Moneda',
    dataIndex: 'codMoneda',
    className: 'size-column-xs',
    sorter: (a, b) => Utils.sortStrings(a.codMoneda, b.codMoneda)
  };

  const columnaFecEmision = {
    title: 'Fecha emisión',
    dataIndex: 'fecEmision',
    className: 'size-column-xs',
    render: text => Utils.formatDateBandeja(text),
    sorter: (a, b) => Utils.sortDates(a.fecEmision, b.fecEmision, 'YYYY/MM/DD')
  };

  const columnaMtoImporte = {
    title: 'Importe',
    dataIndex: 'mtoImporte',
    className: 'size-column-xs',
    render: text => Utils.formatAmount(text),
    sorter: (a, b) => Utils.sortStrings(a.mtoImporte, b.mtoImporte)
  };

  const columnaMtoIgv = {
    title: 'IGV',
    dataIndex: 'mtoIgv',
    className: 'size-column-xs',
    render: text => Utils.formatAmount(text),
    sorter: (a, b) => Utils.sortStrings(a.mtoIgv, b.mtoIgv)
  };

  const columnaMtoRetencionCuarta = {
    title: 'Retención 4ta',
    dataIndex: 'mtoRetencionCuarta',
    className: 'size-column-sm',
    render: text => Utils.formatAmount(text),
    sorter: (a, b) => Utils.sortStrings(a.mtoRetencionCuarta, b.mtoRetencionCuarta)
  };

  const columnaMtoTotal = {
    title: 'Total',
    dataIndex: 'mtoTotal',
    className: 'size-column-xs',
    render: text => Utils.formatAmount(text),
    sorter: (a, b) => Utils.sortStrings(a.mtoTotal, b.mtoTotal)
  };

  const columnaDscEstadoNumObligacion = {
    title: 'Estado',
    fixed: 'right',
    dataIndex: 'dscEstado',
    className: 'size-column-state',
    sorter: (a, b) => Utils.sortStrings(a.dscEstado, b.dscEstado),
    render: (text, record) => {
      if (record.codEstado === 'AP') {
        return <Tooltip title={record.numObligacion}>{text}</Tooltip>;
      }
      return text;
    }
  };

  const columnaDscTipoDocumento = {
    title: 'Tipo documento',
    dataIndex: 'dscTipoDocumento',
    className: 'size-column-sm',
    sorter: (a, b) => Utils.sortStrings(a.dscTipoDocumento, b.dscTipoDocumento)
  };

  const columnaNomProveedor = {
    title: 'Proveedor',
    dataIndex: 'nomProveedor',
    className: 'size-column-xl',
    sorter: (a, b) => Utils.sortStrings(a.nomProveedor, b.nomProveedor)
  };

  const columnaNumSerie = {
    title: 'Serie',
    dataIndex: 'numSerie',
    className: 'size-column-xs',
    sorter: (a, b) => Utils.sortStrings(a.numSerie, b.numSerie)
  };

  const columnaNumDocumento = {
    title: 'Número',
    dataIndex: 'numDocumento',
    className: 'size-column-xs',
    sorter: (a, b) => Utils.sortStrings(a.numDocumento, b.numDocumento)
  };

  const columnaDscCobertura = {
    title: 'Cobertura',
    dataIndex: 'dscCobertura',
    className: 'size-column-xl',
    sorter: (a, b) => Utils.sortStrings(a.dscCobertura, b.dscCobertura)
  };

  const columnaDscEstado = {
    title: 'Estado',
    fixed: 'right',
    dataIndex: 'dscEstado',
    className: 'size-column-state',
    sorter: (a, b) => Utils.sortStrings(a.dscEstado, b.dscEstado)
  };

  switch (tipoPago) {
    case 'I':
      columns.push({
        title: 'Beneficiario',
        dataIndex: 'beneficiario',
        className: 'size-column-xl',
        sorter: (a, b) => Utils.sortStrings(a.beneficiario, b.beneficiario)
      });

      columns.push({
        title: 'Cobertura',
        dataIndex: 'cobertura',
        className: 'size-column-xl',
        sorter: (a, b) => Utils.sortStrings(a.cobertura, b.cobertura)
      });

      columns.push({
        title: 'Tipo pago',
        dataIndex: 'tipopago',
        className: 'size-column-xs',
        sorter: (a, b) => Utils.sortStrings(a.tipopago, b.tipopago)
      });

      columns.push({
        title: 'Moneda pago',
        dataIndex: 'codMonedaPago',
        className: 'size-column-xs',
        sorter: (a, b) => Utils.sortStrings(a.codMonedaPago, b.codMonedaPago)
      });

      columns.push({
        title: 'Indemnización bruta',
        dataIndex: 'mtoIndemnizacionBruta',
        className: 'size-column-sm',
        render: text => Utils.formatAmount(text),
        sorter: (a, b) => Utils.sortNumbers(a.mtoIndemnizacionBruta, b.mtoIndemnizacionBruta)
      });

      columns.push({
        title: 'Deducible',
        dataIndex: 'mtoDeducible',
        className: 'size-column-xs',
        render: text => Utils.formatAmount(text),
        sorter: (a, b) => Utils.sortNumbers(a.mtoDeducible, b.mtoDeducible)
      });

      columns.push(columnaDscTipoCobro);
      columns.push(columnaMontoCoaseguro);
      columns.push({
        title: 'Indemnización neta',
        dataIndex: 'mtoIndemnizacionNeta',
        className: 'size-column-sm',
        sorter: (a, b) => Utils.sortNumbers(a.mtoIndemnizacionNeta, b.mtoIndemnizacionNeta)
      });
      columns.push({
        title: 'Estado',
        fixed: 'right',
        className: 'size-column-state',
        dataIndex: 'estado',
        sorter: (a, b) => Utils.sortStrings(a.estado, b.estado),
        defaultSortOrder: 'ascend',
        render: (text, record) => {
          if (record.codEstado === 'AP') {
            return <Tooltip title={record.numObligacion}>{text}</Tooltip>;
          }
          return text;
        }
      });

      break;
    case 'H':
      columns.push({
        title: 'Ajustador',
        dataIndex: 'nomAjustador',
        className: 'size-column-lg',
        sorter: (a, b) => Utils.sortStrings(a.nomAjustador, b.nomAjustador)
      });
      columns.push(columnaCodRamo);
      columns.push(columnaTipoDocumento);
      columns.push({
        title: 'Serie',
        dataIndex: 'codSerie',
        className: 'size-column-xs',
        sorter: (a, b) => Utils.sortStrings(a.codSerie, b.codSerie)
      });
      columns.push({
        title: 'Número',
        dataIndex: 'numComprobante',
        className: 'size-column-xs',
        sorter: (a, b) => Utils.sortStrings(a.numComprobante, b.numComprobante)
      });
      columns.push(columnaCodMoneda);
      columns.push(columnaFecEmision);
      columns.push({
        title: 'Gastos',
        dataIndex: 'mtoGastos',
        className: 'size-column-xs',
        render: text => Utils.formatAmount(text),
        sorter: (a, b) => Utils.sortStrings(a.mtoGastos, b.mtoGastos)
      });
      columns.push({
        title: 'Honorarios',
        dataIndex: 'mtoHonorarios',
        className: 'size-column-xs',
        render: text => Utils.formatAmount(text),
        sorter: (a, b) => Utils.sortStrings(a.mtoHonorarios, b.mtoHonorarios)
      });
      columns.push(columnaMtoImporte);
      columns.push(columnaDscTipoCobro);
      columns.push(columnaMontoCoaseguro);
      columns.push(columnaMtoIgv);
      columns.push(columnaMtoRetencionCuarta);
      columns.push(columnaMtoTotal);
      columns.push(columnaDscEstadoNumObligacion);

      break;
    case 'O':
      columns.push(columnaNomProveedor);
      columns.push(columnaCodRamo);
      columns.push({
        title: 'Concepto',
        dataIndex: 'dscConcepto',
        className: 'size-column-sm',
        sorter: (a, b) => Utils.sortStrings(a.dscConcepto, b.dscConcepto)
      });
      columns.push(columnaDscTipoDocumento);
      columns.push(columnaNumSerie);
      columns.push(columnaNumDocumento);
      columns.push(columnaCodMoneda);
      columns.push(columnaFecEmision);
      columns.push(columnaMtoImporte);
      columns.push(columnaDscTipoCobro);
      columns.push(columnaMontoCoaseguro);
      columns.push(columnaMtoIgv);
      columns.push(columnaMtoRetencionCuarta);
      columns.push(columnaMtoTotal);
      columns.push(columnaDscEstadoNumObligacion);

      break;
    case 'R':
      columns.push(columnaNomProveedor);
      columns.push(columnaDscCobertura);
      columns.push(columnaDscTipoDocumento);
      columns.push(columnaNumSerie);
      columns.push(columnaNumDocumento);
      columns.push(columnaCodMoneda);
      columns.push(columnaFecEmision);
      columns.push(columnaMtoImporte);
      columns.push(columnaDscTipoCobro);
      columns.push(columnaMontoCoaseguro);
      columns.push(columnaMtoIgv);
      columns.push(columnaMtoRetencionCuarta);
      columns.push(columnaMtoTotal);
      columns.push(columnaDscEstadoNumObligacion);

      break;
    case 'A':
      columns.push({
        title: 'Responsable de pago',
        dataIndex: 'nomResponsable',
        className: 'size-column-xl',
        sorter: (a, b) => Utils.sortStrings(a.nomResponsable, b.nomResponsable)
      });
      columns.push(columnaDscCobertura);
      columns.push({
        title: 'Motivo',
        className: 'size-column-lg',
        dataIndex: 'dscMotivos',
        sorter: (a, b) => Utils.sortStrings(a.dscMotivos, b.dscMotivos)
      });
      columns.push(columnaCodMoneda);
      columns.push({
        title: 'Monto sin IGV',
        className: 'size-column-sm',
        dataIndex: 'mtoSinIgv',
        render: text => Utils.formatAmount(text),
        sorter: (a, b) => Utils.sortStrings(a.mtoSinIgv, b.mtoSinIgv)
      });
      columns.push({
        title: 'Fecha',
        dataIndex: 'fecPago',
        className: 'size-column-xs',
        render: text => Utils.formatDateBandeja(text),
        sorter: (a, b) => Utils.sortDates(a.fecPago, b.fecPago, 'YYYY/MM/DD')
      });
      columns.push(columnaDscEstado);

      break;
    case 'C':
      columns.push({
        title: 'Tipo pago',
        dataIndex: 'dscTipoPago',
        className: 'size-column-xs',
        sorter: (a, b) => Utils.sortStrings(a.dscTipoPago, b.dscTipoPago)
      });
      columns.push({
        title: 'Entidad Financiera',
        dataIndex: 'dscEntidadFinanciera',
        className: 'size-column-lg',
        sorter: (a, b) => Utils.sortStrings(a.dscEntidadFinanciera, b.dscEntidadFinanciera)
      });
      columns.push({
        title: 'Tipo cuenta',
        dataIndex: 'dscTipoCuenta',
        className: 'size-column-lg',
        sorter: (a, b) => Utils.sortStrings(a.dscTipoCuenta, b.dscTipoCuenta)
      });
      columns.push(columnaCodMoneda);
      columns.push({
        title: 'Nro Cuenta',
        dataIndex: 'nroCuenta',
        className: 'size-column-lg',
        sorter: (a, b) => Utils.sortStrings(a.nroCuenta, b.nroCuenta)
      });
      columns.push(columnaDscEstado);

      break;
    default:
      Error('No se reconoce tipo pago');
  }

  columns.push(construirColumnaAccion(tipoPago, props));

  return columns;
};

export const countColumns = (tipoPago, props) => {
  const { tieneCoaseguro } = props;
  let countColumnsTotal = construirColumnas(tipoPago, props).length;
  if (!tieneCoaseguro) countColumnsTotal -= 2; // columnaDscTipoCobro y columnaMontoCoaseguro
  if (escondeColumnaAccion(tipoPago, props)) countColumnsTotal -= 1; // Accion
  return countColumnsTotal;
};
