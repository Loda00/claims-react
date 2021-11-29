/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-fallthrough */
import React, { Fragment } from 'react';
import { Table, Card, Button, Spin, Modal } from 'antd';
import OtherConceptsModal from 'scenes/TaskTray/components/SectionDataSinister/components/SinisterFormItem/components/OtherConceptsFormItem/OtherConceptsModal';
import { getConcepts } from 'scenes/TaskTray/data/concepts/reducer';
import { connect } from 'react-redux';
import { getMonedaCertificado } from 'scenes/TaskTray/components/SectionDataCertificate/data/dataCertificate/reducer';
import {
  getIdCase,
  getCodProducto,
  getIdSiniestroAX,
  getNumSiniestroAX,
  getEsSiniestroPreventivo
} from 'scenes/TaskTray/components/SectionDataSinister/data/dataSinister/reducer';
import {
  getCodigoCausa,
  getCodigoConsecuencia,
  getTotalReservaPorRamo
} from 'scenes/TaskTray/components/SectionDataCobertura/data/coveragesAdjusters/reducer';
import { getIsLoading } from 'scenes/TaskTray/components/SectionDataSinister/components/SinisterFormItem/components/OtherConceptsFormItem/data/maintenanceConcept/reducer';
import * as HistorialReservaActionCreator from 'scenes/TaskTray/components/SectionHistoryChange/data/historialReserva/action';
import * as MaintenanceConceptActionCreator from 'scenes/TaskTray/components/SectionDataSinister/components/SinisterFormItem/components/OtherConceptsFormItem/data/maintenanceConcept/action';
import currency from 'currency.js';
import { CONSTANTS_APP, TAREAS, ROLES_USUARIOS, TASA_CAMBIO_PRECISION } from 'constants/index';
import { showErrorMessage, mostrarModalSiniestroaPreventivo, modalConfirmacionReintentar } from 'util/index';

/** CSS */
import 'App.css';

import { getEsTipoUsuarioAjustador, getEsTipoUsuarioEjecutivo } from 'services/users/reducer';
import {
  obtenerPagosHonorarios,
  obtenerPagosOtrosConceptos
} from 'scenes/TaskTray/components/SectionPayments/data/payments/reducer';

class OtherConceptsTableFormItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      editConcept: null,
      rowSelected: null,
      selectedRowKeys: []
    };
  }

  showModal = () => {
    this.setState({
      visible: true
    });
  };

  showModalAdd = () => {
    this.setState({
      visible: true
    });
    this.setState({ editConcept: null });
  };

  onCancelModalHandler = () => {
    this.setState({
      visible: false
    });
    this.forceUpdate();
  };

  onOkModalHandler = async value => {
    const { esEjecutivo } = this.props;
    let entry = true;
    if (esEjecutivo) {
      Modal.confirm({
        title: 'Los cambios se enviarán directo al core. ¿Desea continuar con la operación?',
        okText: 'Sí',
        cancelText: 'No',
        onOk: () => {
          if (entry) {
            this.mantenerOtrosConceptos(value);
            entry = false;
          }
        }
      });
    } else {
      this.mantenerOtrosConceptos(value);
    }
  };

  mantenerOtrosConceptos = async value => {
    this.setState({ rowSelected: null });
    const {
      dispatch,
      numSiniestro,
      otrosConceptos,
      asignarOtrosConceptos,
      esEjecutivo
      // esAjustador
    } = this.props;
    let dataSource = [...otrosConceptos];
    let params = null;
    let validacion = null;
    const invocarServicio = value.mtoModif === 'S' || (esEjecutivo && (value.estado !== 'R' || value.action === 'D'));
    if (!invocarServicio) {
      // Al no editar el monto de reserva, no se hace ningún llamado al back
      this.setState({ rowSelected: null, visible: false });
    } else {
      try {
        if (value.action === 'N') {
          // Insercion
          validacion = this.validateBeforeInsert(value, dataSource);
          if (validacion === null) {
            params = this.crearParametrosMantenimientoOtrosConceptos(value);
            // Invocar Request
            const response = await dispatch(MaintenanceConceptActionCreator.fetchMaintenanceConcept(params));
            // Validar Response
            if (response.code === 'CRG-000') {
              value.estado = (response.data[0] || {}).estado;
              value.mtoHonorarioCalculado = response.data[0].mtoHonorarioCalculado || undefined;
              value.idOtrosConceptos = response.data[0].idOtrosConceptos;
              dataSource.push(value);
              asignarOtrosConceptos(dataSource);
              this.setState({ visible: false });
            } else {
              showErrorMessage(String('Error al invocar al servicio'));
            }
          } else {
            showErrorMessage(validacion);
          }
        } else if (value.action === 'U') {
          // Actualiza
          // Invocar Request
          params = this.crearParametrosMantenimientoOtrosConceptos(value);
          const response = await await dispatch(MaintenanceConceptActionCreator.fetchMaintenanceConcept(params));
          // Validar Response
          if (response.code === 'CRG-000') {
            value.estado = (response.data[0] || {}).estado;

            dataSource = dataSource.map(item =>
              value.idOtrosConceptos === item.idOtrosConceptos ? { ...value } : item
            );
            asignarOtrosConceptos(dataSource);
            this.setState({ visible: false });
          } else {
            showErrorMessage(String('Error al invocar al servicio'));
          }
        } else if (value.action === 'D') {
          // Invocar Request
          params = this.crearParametrosMantenimientoOtrosConceptos(value);
          const response = await await dispatch(MaintenanceConceptActionCreator.fetchMaintenanceConcept(params));
          // Validar Response
          if (response.code === 'CRG-000') {
            const indexItem = dataSource.indexOf(
              dataSource.filter(item => item.codRamo + item.codConcepto === value.codRamo + value.codConcepto)[0]
            );
            dataSource.splice(indexItem, 1);
            asignarOtrosConceptos(dataSource);
            this.setState({ selectedRowKeys: [] });
          } else {
            showErrorMessage(String('Error al invocar al servicio'));
          }
        }
        dispatch(HistorialReservaActionCreator.fecthHistorialReserva(numSiniestro));
      } catch (error) {
        const { response: { status } = {} } = error;
        if (status === 504) {
          modalConfirmacionReintentar();
          return;
        }

        showErrorMessage(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
      } finally {
        params = null;
        this.setState({ rowSelected: null });
      }
    }
  };

  validateBeforeInsert = (newItemTable, tempDataSource) => {
    // Valida Duplicados en tabla
    /* modular funcion si en caso se requiera hacer validaciones adicionales  */

    const { codRamo } = newItemTable;
    const { codConcepto } = newItemTable;
    const validator = tempDataSource.some(item => item.codRamo + item.codConcepto === codRamo + codConcepto);
    if (validator) return String('Reserva del concepto ya registrada');
    // Fin de Validacion
    return null;
  };

  validateBeforeDelete = itemTable => {
    // Valida TotalPagos sea 0
    if (itemTable.mtoTotalPagos > 0) {
      return String('No se puede eliminar la reserva si tiene pagos aprobados');
    }
    // Fin de Validacion
    return null;
  };

  eliminarConcepto = () => {
    const {
      esEjecutivo,
      esAjustador,
      form: { getFieldValue }
    } = this.props;
    const { rowSelected } = this.state;
    const ramos = ((getFieldValue('dataRamosCoberturas') || {}).ramosCoberturas || []).map(item => {
      return {
        codRamo: item.codRamo,
        idRamo: item.secRamo
      };
    });

    const concepto = rowSelected;
    const ramoSeleccionado = ramos.filter(ramo => ramo.codRamo === concepto.codRamo)[0];
    concepto.idRamo = ramoSeleccionado.idRamo;
    concepto.action = 'D';
    const mensageModal =
      (esEjecutivo &&
        ((concepto.estado === 'P' && '¿Desea eliminar el concepto seleccionado?') ||
          'Los cambios se enviarán directo al core.  ¿Desea continuar con la operación?')) ||
      (esAjustador && '¿Desea eliminar el concepto seleccionado?');
    const validacion = this.validateBeforeDelete(concepto);
    if (validacion === null) {
      let entry = true;
      if (esEjecutivo) {
        Modal.confirm({
          title: `${mensageModal}`,
          okText: 'Sí',
          cancelText: 'No',
          onOk: () => {
            if (entry) {
              this.mantenerOtrosConceptos(concepto);
              entry = false;
            }
          }
        });
      } else {
        this.mantenerOtrosConceptos(concepto);
      }
    } else {
      this.setState({ rowSelected: null, selectedRowKeys: [] });
      Modal.info({
        content: 'No se puede eliminar concepto. Tiene pagos pendientes/registrados'
      });
    }
  };

  afterCloseModalHandler = () => {
    this.setState({ editConcept: null });
  };

  onEditModalHandler = record => {
    this.setState({ editConcept: record }, () => this.showModal());
  };

  // Poblar tabla Otros Conceptos
  setDataSourceToTable = () => {
    // Quita los eliminados
    const { otrosConceptos } = this.props;
    return otrosConceptos.filter(item => item.action !== 'D');
  };

  crearParametrosMantenimientoOtrosConceptos = value => {
    const {
      idCase,
      idSinAX,
      codProducto,
      numSinAX,
      numSiniestro,
      esAjustador,
      esEjecutivo,
      codCausa,
      codConsec,
      moneda
    } = this.props;

    const rol =
      (esAjustador && ROLES_USUARIOS.AJUSTADOR) || (esEjecutivo && ROLES_USUARIOS.EJECUTIVO_DE_SINIESTRO) || null;
    const { mtoModif } = value;
    const { estado } = value;
    const indReservaModificada = mtoModif === 'S' || (esEjecutivo && ['P', 'O'].includes(estado)) ? 'S' : 'N';
    return {
      ideCase: idCase, // BPM
      ideSin: idSinAX, // ideSinAX
      codProd: codProducto,
      numSin: numSinAX, // numSinAX
      numCaso: numSiniestro,
      indReservaModificada,
      rol,
      estado,
      ramos: [
        {
          pkRamo: value.idRamo,
          codRamo: value.codRamo,
          bienAfect: '',
          codCausa,
          codConsec,
          otrosConceptos: [
            {
              idOtrosConceptos: value.idOtrosConceptos,
              codCpto: value.codConcepto,
              dscCpto: value.dscConcepto,
              codMoRes: moneda,
              mtoResMo: value.mtoReserva
            }
          ]
        }
      ],
      operacion: value.action
    };
  };

  setRowClassName = record => {
    const {
      currentTask: { idTarea },
      userClaims: { email }
    } = this.props;
    const tareasValidas = [TAREAS.REVISAR_INFORME_BASICO, TAREAS.REVISAR_INFORME];
    const usuarioActual = email;
    const { usuarioModificado } = record;
    return (
      (tareasValidas.includes(idTarea) &&
        usuarioModificado &&
        usuarioActual !== usuarioModificado &&
        'claims-rrgg-edicion-ajustador') ||
      ''
    );
  };

  getDescEstado = estado => {
    switch (estado) {
      case 'P':
        return 'Pendiente';
      case 'O':
        return 'Pendiente';
      case 'R':
        return 'Registrado';
      default:
        return '-';
    }
  };

  habilitarEdicionConcepto = record => {
    const {
      flagModificar,
      pagosAjustador,
      pagosOtrosConceptos,
      esSiniestroPreventivo,
      currentTask: { idTarea },
      validacionEnlaceModificarConcepto: { habilitarEnlaceModificarConcepto }
    } = this.props;
    const boolHabilitarEnlaceModificarConcepto = habilitarEnlaceModificarConcepto({
      record,
      idTarea,
      flagModificar,
      pagosAjustador,
      pagosOtrosConceptos,
      esSiniestroPreventivo
    });
    return boolHabilitarEnlaceModificarConcepto;
  };

  habilitarRadioFiltroOtrosConceptos = (record, esSiniestroPreventivo) => {
    const {
      codEstadoSiniestro,
      form: { getFieldValue },
      validacionRadioOtrosConceptos: { habilitarRadioOtrosConceptos },
      currentTask: { idTarea },
      pagosAjustador,
      pagosOtrosConceptos
    } = this.props;
    const ajustadorRequerido = getFieldValue('ajustadorRequerido');
    const nuevoAjustador = getFieldValue('nuevoAjustador');
    const informeFinal = getFieldValue('informeFinal');

    const boolHabilitarRadioOtrosConceptos = habilitarRadioOtrosConceptos({
      idTarea,
      esSiniestroPreventivo,
      codEstadoSiniestro,
      ajustadorRequerido,
      nuevoAjustador,
      informeFinal,
      record,
      pagosAjustador,
      pagosOtrosConceptos
    });
    return boolHabilitarRadioOtrosConceptos;
  };

  render() {
    const { selectedRowKeys, rowSelected, visible, editConcept } = this.state;

    const {
      form: { getFieldValue },
      disabledGeneral,
      showScroll,
      currentTask: { idTarea },
      otrosConceptos,
      numSiniestro,
      concepts,
      isLoading,
      esSiniestroPreventivo,
      tamanioTablaPagina,
      moneda,
      // Validaciones
      validacionBotonAgregarConcepto: { habilitarBotonAgregarConcepto, mostrarBotonAgregarConcepto },
      validacionRadioOtrosConceptos: { mostrarRadioOtrosConceptos },
      validacionBotonAnularConcepto: { habilitarBotonAnularConcepto, mostrarBotonAnularConcepto }
    } = this.props;

    const selectTipoSiniestro = getFieldValue('tipoSiniestro');
    // Validacion

    const boolHabilitarBotonAgregarConcepto = habilitarBotonAgregarConcepto({
      idTarea,
      esSiniestroPreventivo: selectTipoSiniestro === 'P'
    });
    const boolMostrarBotonAgregarConcepto = mostrarBotonAgregarConcepto({
      idTarea
    });

    const boolMostrarRadioOtrosConceptos = mostrarRadioOtrosConceptos({
      idTarea
    });

    const boolHabilitarBotonAnularConcepto = habilitarBotonAnularConcepto({
      idTarea,
      esSiniestroPreventivo,
      rowSelected
    });
    const boolMostrarBotonAnularConcepto = mostrarBotonAnularConcepto({
      idTarea
    });

    // Fin Validacion

    const columns = [
      {
        key: 'idramo',
        title: 'Ramo',
        dataIndex: 'codRamo'
      },
      {
        key: 'idconcepto',
        title: 'Concepto',
        dataIndex: 'dscConcepto',
        render: (text, record) => (
          <a
            onClick={() => this.onEditModalHandler(record)}
            disabled={disabledGeneral || !this.habilitarEdicionConcepto(record)}
            href="javascript:;"
          >
            {text}
          </a>
        )
      },
      {
        title: 'Reserva',
        dataIndex: 'mtoReserva',
        key: 'reserva',
        render: text => currency(text).format()
      },
      {
        title: 'Total de pagos',
        dataIndex: 'mtoTotalPagos',
        key: 'totalpagos',
        render: text => currency(text).format()
      },
      {
        title: 'Saldo pendiente',
        dataIndex: 'saldopendiente',
        key: 'saldopendiente',
        render: text => currency(text).format()
      },
      {
        title: 'Estado',
        dataIndex: 'estado',
        key: 'estado',
        align: 'center',
        render: text => this.getDescEstado(text)
      }
    ];

    const rowSelection = {
      type: 'radio',
      onSelect: record => {
        const keys = [];
        keys.push(record.codRamo + record.codConcepto);
        this.setState({ rowSelected: record, selectedRowKeys: keys });
      },
      selectedRowKeys: rowSelected === null ? [] : selectedRowKeys,
      getCheckboxProps: record => {
        return {
          disabled: disabledGeneral || !this.habilitarRadioFiltroOtrosConceptos(record, esSiniestroPreventivo)
        };
      }
    };

    const ramos = ((getFieldValue('dataRamosCoberturas') || {}).ramosCoberturas || []).map(item => {
      return {
        codRamo: item.codRamo,
        idRamo: item.secRamo
      };
    });

    const data = otrosConceptos.map(otroConcepto => {
      const { mtoReserva, mtoTotalPagos, usuarioModificado, codRamo, estado } = otroConcepto;

      return {
        ...otroConcepto,
        // (?)
        idRamo: (ramos.filter(ramo => codRamo === ramo.codRamo)[0] || {}).idRamo || '',
        mtoReserva: currency(mtoReserva).value,
        mtoTotalPagos: currency(mtoTotalPagos, {
          precision: TASA_CAMBIO_PRECISION
        }).value,
        saldopendiente: currency(mtoReserva).subtract(mtoTotalPagos).value,
        usuarioModificado,
        estado
      };
    });

    const ajustadorRequerido = getFieldValue('ajustadorRequerido');

    return (
      <Fragment>
        <Spin spinning={isLoading}>
          <Card
            title={
              <Fragment>
                {boolMostrarBotonAgregarConcepto && (
                  <Button
                    disabled={disabledGeneral || !boolHabilitarBotonAgregarConcepto}
                    onClick={(esSiniestroPreventivo && mostrarModalSiniestroaPreventivo) || this.showModalAdd}
                  >
                    Agregar Concepto
                  </Button>
                )}
                {boolMostrarBotonAnularConcepto && (
                  <Button
                    disabled={disabledGeneral || !boolHabilitarBotonAnularConcepto}
                    style={{ marginLeft: 8 }}
                    onClick={this.eliminarConcepto}
                  >
                    Anular Concepto
                  </Button>
                )}
              </Fragment>
            }
          >
            {showScroll && (
              <Table
                id="tabla_otros_conceptos"
                rowKey={record => record.codRamo + record.codConcepto}
                rowSelection={boolMostrarRadioOtrosConceptos ? rowSelection : null}
                pagination={{ defaultPageSize: tamanioTablaPagina }}
                rowClassName={this.setRowClassName}
                columns={columns}
                dataSource={data}
                size="small"
                scroll={{ x: '160%' }}
              />
            )}
            {!showScroll && (
              <Table
                id="tabla_otros_conceptos"
                rowKey={record => record.codRamo + record.codConcepto}
                rowSelection={boolMostrarRadioOtrosConceptos ? rowSelection : null}
                pagination={{ defaultPageSize: tamanioTablaPagina }}
                rowClassName={this.setRowClassName}
                columns={columns}
                dataSource={data}
                size="small"
              />
            )}
          </Card>

          {visible && (
            <OtherConceptsModal
              ajustadorRequerido={ajustadorRequerido}
              editConcept={editConcept}
              moneda={moneda}
              numSiniestro={numSiniestro}
              modalVisible={visible}
              concepts={concepts}
              branches={ramos}
              isLoading={isLoading}
              onOkModalHadler={this.onOkModalHandler}
              onCancelModalHandler={this.onCancelModalHandler}
              afterCloseModalHandler={this.afterCloseModalHandler}
              confirmarAccion={this.confirmarAccion}
              otrosConceptos={otrosConceptos}
            />
          )}
        </Spin>
      </Fragment>
    );
  }
}

const mapStateToProps = state => {
  const concepts = getConcepts(state);
  const moneda = getMonedaCertificado(state);
  const idSinAX = getIdSiniestroAX(state);
  const idCase = getIdCase(state);
  const numSinAX = getNumSiniestroAX(state);
  const codProducto = getCodProducto(state);
  const codCausa = getCodigoCausa(state);
  const codConsec = getCodigoConsecuencia(state);
  const isLoading = getIsLoading(state);
  const totalReservaPorRamo = getTotalReservaPorRamo(state);
  const esEjecutivo = getEsTipoUsuarioEjecutivo(state);
  const esAjustador = getEsTipoUsuarioAjustador(state);
  const esSiniestroPreventivo = getEsSiniestroPreventivo(state);
  const pagosAjustador = obtenerPagosHonorarios(state);
  const pagosOtrosConceptos = obtenerPagosOtrosConceptos(state);
  return {
    isLoading,
    concepts,
    moneda,
    esEjecutivo,
    esAjustador,
    esSiniestroPreventivo,
    idSinAX: String(idSinAX),
    idCase: String(idCase),
    numSinAX: String(numSinAX),
    codProducto: String(codProducto),
    codCausa: String(codCausa),
    codConsec: String(codConsec),
    totalReservaPorRamo,
    pagosAjustador,
    pagosOtrosConceptos
  };
};

export default connect(mapStateToProps)(OtherConceptsTableFormItem);
