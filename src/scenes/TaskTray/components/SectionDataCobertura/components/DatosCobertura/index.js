import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Card, Divider, Button, Checkbox, Form, message } from 'antd';
import { isEmpty, cloneDeep } from 'lodash';
import { withRouter } from 'react-router-dom';
import {
  getCoverages,
  getBranches,
  getErrorBranches
} from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DatosCobertura/data/branches/reducer';
import { getCauses } from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DatosCobertura/data/causes/reducer';
import { getConsequences } from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DatosCobertura/data/consequences/reducer';
import {
  getIndFronting,
  getIndFacultativo,
  getDescProducto
} from 'scenes/TaskTray/components/SectionDataCobertura/data/coveragesAdjusters/reducer';
import { getDataSinister } from 'scenes/TaskTray/components/SectionDataSinister/data/dataSinister/reducer';
import { getDataPoliza } from 'scenes/TaskTray/components/SectionDataPoliza/data/dataPoliza/reducer';
import {
  getDataCertificate,
  getCertificado
} from 'scenes/TaskTray/components/SectionDataCertificate/data/dataCertificate/reducer';
import { fetchCausesReset } from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DatosCobertura/data/causes/actions';
import { fetchConsequencesReset } from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DatosCobertura/data/consequences/actions';
import { fetchCrearCobertura } from 'scenes/TaskTray/components/SectionDataCobertura/data/crearCobertura/action';
import {
  fetchCoveragesAdjustersFinished,
  fetchCoveragesAdjusters
} from 'scenes/TaskTray/components/SectionDataCobertura/data/coveragesAdjusters/actions';
import { getCoberturaLoading } from 'scenes/TaskTray/components/SectionDataCobertura/data/crearCobertura/reducer';
import { fetchEditarCobertura } from 'scenes/TaskTray/components/SectionDataCobertura/data/editarCobertura/action';
import {
  fetchBranches,
  fetchBranchesReset
} from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DatosCobertura/data/branches/actions';
import { fetchAnularCobertura } from 'scenes/TaskTray/components/SectionDataCobertura/data/anularCobertura/action';
import { loading as getLoadingAnular } from 'scenes/TaskTray/components/SectionDataCobertura/data/anularCobertura/reducer';
import { fecthHistorialReserva } from 'scenes/TaskTray/components/SectionHistoryChange/data/historialReserva/action';
import { fetchObtenerReaseguros } from 'scenes/TaskTray/components/SectionDataPoliza/data/obtenerReaseguros/actions';
import { eliminarReasegurosTerminado } from 'scenes/TaskTray/components/SectionDataPoliza/data/eliminarReaseguros/actions';
import { mostrarModalSiniestroaPreventivo, modalConfirmacion, modalConfirmacionReintentar } from 'util/index';
import ModalEditar from 'scenes/TaskTray/components/SectionDataCobertura/components/DatosCobertura/componentes/modalEditar';
import { CONSTANTS_APP, ROLES_USUARIOS, TAREAS, ESTADO } from 'constants/index';
import AgregarCoberturaModalForm from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DatosCobertura/components/AddCoberturaModalForm';
import HistorialAjustadores from 'scenes/TaskTray/components/SectionDataCobertura/components/DatosCobertura/componentes/HistorialAjustadores';
import CoberturaTable from 'scenes/TaskTray/components/SectionDataCobertura/components/DatosCobertura/componentes/CoberturaTable';

import '../../style.css';

class DatosCobertura extends React.Component {
  state = {
    modalVisible: false,
    modalEditarVisible: false,
    selectedCobertura: null,
    ramos: [],
    existeSiniestro: false,
    listaBranches: [],
    reCargaRamosCoberturas: false
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (
      !isEmpty(nextProps.siniestro) &&
      !isEmpty(nextProps.certificadoDec) &&
      isEmpty(nextProps.branches.branches) &&
      !prevState.existeSiniestro
    ) {
      let declaracion;
      if (nextProps.siniestro.codProducto === '3001') {
        declaracion = nextProps.certificadoDec.idDeclaracion;
      }
      nextProps.obtenerRamos(nextProps.siniestro.idePoliza, nextProps.siniestro.numCertificado, declaracion);
      return {
        existeSiniestro: true
      };
    }

    if (!isEmpty(nextProps.branches.branches) && nextProps.branches.branches !== prevState.listaBranches) {
      return {
        listaBranches: nextProps.branches.branches
      };
    }

    if (!isEmpty(nextProps.errorBranch) && nextProps.errorBranch !== prevState.errorBranch) {
      message.error('No se cargó correctamente los ramos coberturas, vuelva a ingresar a la tarea', 10);
      return {
        errorBranch: nextProps.errorBranch
      };
    }

    if (!isEmpty(nextProps.ramos) && nextProps.ramo !== prevState.ramos) {
      return {
        ramo: nextProps.ramo[0].listCoberturas
      };
    }

    return null;
  }

  componentWillUnmount() {
    const { resetBranches, reset } = this.props;
    reset();
    resetBranches();
  }

  resetSelectedCobertura = () => {
    this.setState({ selectedCobertura: null });
  };

  handleModalFormVisible = () => {
    this.setState({
      modalVisible: true
    });
  };

  renombrarEstado = estado => {
    if (estado === 'Pendiente') {
      return ESTADO.PENDIENTE;
    }
    if (estado === 'Registrado') {
      return ESTADO.REGISTRADO;
    }
    return '';
  };

  quitarFormato = value => {
    let resultado;
    if (typeof value === 'string') {
      resultado = value.replace(/,/g, '');
    } else {
      resultado = value;
    }

    return resultado;
  };

  agregarCobertura = () => {
    const {
      props: { form }
    } = this.formRef;

    form.validateFields(async (err, values) => {
      if (err) {
        return;
      }
      const {
        postCrearCobertura,
        refrescarHistorialReserva,
        reset,
        siniestro,
        coverages,
        causes,
        consequences,
        ramosCoberturas,
        setRamosCoberturas,
        numSiniestro,
        analizarForm: { getFieldValue, setFieldsValue },
        obtenerReaseguros,
        arrayUsers
      } = this.props;

      const selectedCoverage = coverages.find(coverage => coverage.ideCobert === values.cobertura);
      const selectedCause = causes.causes.find(cause => cause.codCausa === values.causa);
      const selectedConsequence = consequences.consequences.find(
        coverage => coverage.codConsecuencia === values.consecuencia
      );

      let sumaMontoReserva = 0;

      ramosCoberturas.forEach(({ codRamo, coberturas }) => {
        if (codRamo === values.ramo) {
          coberturas.forEach(item => {
            const reserva = this.quitarFormato(item.montoReserva);
            sumaMontoReserva += Number(reserva || item.mtoResMo);
          });
        }
      });

      const coberturaTable = {
        ideCase: siniestro.idCase,
        ideSin: siniestro.idSiniestroAX,
        codProd: siniestro.codProducto,
        numSin: siniestro.idSiniestro,
        numeroCaso: numSiniestro,
        roles: arrayUsers,
        indReservaModificada: 'S',
        ramos: [
          {
            codRamo: values.ramo,
            bienAfect: '',
            coberturas: [
              {
                codCausa: selectedCause.codCausa,
                codConsec: selectedConsequence.codConsecuencia,
                dscCausa: selectedCause.dscCausa,
                dscConsec: selectedConsequence.dscConsecuencia,
                ideCobert: selectedCoverage.ideCobert,
                codCobert: selectedCoverage.codCobert,
                dscCobert: selectedCoverage.dscCobert,
                tipoRes: selectedCoverage.tipoRes,
                codCpto: selectedCoverage.codCpto,
                codMoRes: values.montoAproximadoReclamado.currency,
                mtoResMo: values.montoAproximadoReclamado.number,
                codBien: selectedCoverage.codBien,
                dscClaseBien: '',
                mtoSumaAsegurada: selectedCoverage.sumAseg,
                codMotRechSBS: '',
                dscMotRechSBS: '',
                codMotRech: '',
                dscMotRech: '',
                indSinCob: null
              }
            ]
          }
        ],
        operacion: 'N',
        sumaMtoResCob: Number(sumaMontoReserva) + Number(values.montoAproximadoReclamado.number)
      };

      let resultado = null;
      try {
        resultado = await postCrearCobertura(coberturaTable);
      } catch (error) {
        const { response: { status } = {} } = error;
        if (status === 504) {
          modalConfirmacionReintentar();
        } else {
          message.error(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
        }
        return;
      }

      const ramoExiste = ramosCoberturas.find(ramo => ramo.codRamo === values.ramo);

      if (ramoExiste) {
        const nuevaFila = ramosCoberturas.map(ramoCobertura => {
          if (ramoCobertura.codRamo === ramoExiste.codRamo) {
            const obj = {
              ...ramoCobertura,
              coberturas: [
                ...ramoCobertura.coberturas,
                {
                  ...coberturaTable.ramos[0].coberturas[0],
                  idCobertura: Number(coberturaTable.ramos[0].coberturas[0].ideCobert),
                  montoReserva: values.montoAproximadoReclamado.number,
                  saldoPendienteCobertura: values.montoAproximadoReclamado.number,
                  secCobertura: resultado.data[0].pkCobertura,
                  secRamo: resultado.data[0].pkRamo,
                  estado: resultado.data[0].estado,
                  codRamo: values.ramo,
                  descCobertura: selectedCoverage.dscCobert,
                  fechaCreacion: resultado.data[0].fechaCreacion,
                  indSinCobertura: 'N'
                }
              ]
            };
            return obj;
          }
          return ramoCobertura;
        });

        setRamosCoberturas(nuevaFila);
      } else {
        const nuevaCobertura = [
          ...ramosCoberturas,
          {
            codRamo: values.ramo,
            secRamo: resultado.data[0].pkRamo,
            coberturas: [
              {
                ...coberturaTable.ramos[0].coberturas[0],
                idCobertura: Number(coberturaTable.ramos[0].coberturas[0].ideCobert),
                reservaAntesDeducible: coberturaTable.ramos[0].coberturas[0].montoReserva,
                saldoPendienteCobertura: values.montoAproximadoReclamado.number,
                montoReserva: values.montoAproximadoReclamado.number,
                secCobertura: resultado.data[0].pkCobertura,
                secRamo: resultado.data[0].pkRamo,
                estado: resultado.data[0].estado,
                descCobertura: selectedCoverage.dscCobert,
                fechaCreacion: resultado.data[0].fechaCreacion,
                indSinCobertura: 'N'
              }
            ]
          }
        ];
        obtenerReaseguros(resultado.data[0].pkRamo);
        setRamosCoberturas(nuevaCobertura);
      }

      const siniestroFormItem = getFieldValue('siniestro');
      const { otrosConceptos = [] } = siniestroFormItem;

      setFieldsValue({
        siniestro: {
          ...siniestroFormItem,
          otrosConceptos: otrosConceptos.map(concepto => {
            if (concepto.codConcepto === '001' && concepto.codRamo === values.ramo) {
              return {
                ...concepto,
                mtoHonorarioCalculado: resultado.data[0].mtoHonorarioCalculado
              };
            }
            return concepto;
          })
        }
      });

      refrescarHistorialReserva(numSiniestro, null);
      this.setState({ modalVisible: false });

      reset();
    });
    this.setState({ selectedCobertura: null, existeSiniestro: false });
  };

  editarCobertura = () => {
    const {
      props: { form }
    } = this.editarFormRef;

    form.validateFields(async (err, values) => {
      if (err) {
        return;
      }

      const {
        postEditarCobertura,
        refrescarHistorialReserva,
        numSiniestro,
        causes,
        consequences,
        siniestro,
        ramosCoberturas,
        setRamosCoberturas,
        reset,
        analizarForm: { setFieldsValue, getFieldValue },
        arrayUsers,
        postRamosCobertura
      } = this.props;

      const { selectedCobertura, listaBranches } = this.state;

      const {
        pkRamo,
        ramo,
        secCobertura,
        idCobertura,
        codCobert,
        dscCobertura,
        tipoRes,
        monedaIndemnizacion,
        sumaAsegurada,
        reservaAntesDeducible,
        estado,
        totalPagosAprobadosCobertura,
        montoReclamado,
        codCausa,
        codConsecuencia,
        causa,
        consecuencia,
        siniestroSinCobertura,
        fechaCreacion
      } = selectedCobertura;

      const { PENDIENTE } = ESTADO;

      const { EJECUTIVO_DE_SINIESTRO } = ROLES_USUARIOS;

      let arrayCausa = [];
      let arrayConsecuencia = [];
      let data = {};
      let sumaMontoReserva = 0;
      let reservaModificada = false;
      let valueMontoRes = 0;
      let valueMontoRecl = 0;
      let comparacion;
      arrayCausa = causes.causes.find(cause => cause.codCausa === values.causa);

      arrayConsecuencia = consequences.consequences.find(coverage => coverage.codConsecuencia === values.consecuencia);

      listaBranches.forEach(branches => {
        branches.listCoberturas.forEach(item => {
          if (Number(item.ideCobert) === Number(idCobertura)) {
            data = item;
          }
        });
      });

      ramosCoberturas.forEach(({ codRamo, coberturas }) => {
        if (codRamo === ramo) {
          coberturas.forEach(item => {
            if (Number(idCobertura) === Number(item.idCobertura || item.ideCobert)) {
              let monto = 0;

              if (!values.siniestroSinCobertura) {
                monto = Number(values.montoReserva.number.value)
                  ? values.montoReserva.number.value
                  : values.montoReserva.number;
              } else {
                monto = Number.isInteger(Number(reservaAntesDeducible.replace(/,/g, '')))
                  ? Number(reservaAntesDeducible.replace(/,/g, '').split('.')[0])
                  : Number(reservaAntesDeducible.replace(/,/g, ''));
              }
              sumaMontoReserva += Number(monto);
            } else {
              const reserva = this.quitarFormato(item.montoReserva);
              sumaMontoReserva += Number(reserva || item.mtoResMo);
            }
          });
        }
      });

      if (!values.siniestroSinCobertura) {
        comparacion = Number.isInteger(Number(reservaAntesDeducible.replace(/,/g, '')))
          ? Number(reservaAntesDeducible.replace(/,/g, '').split('.')[0])
          : Number(reservaAntesDeducible.replace(/,/g, ''));

        valueMontoRecl = Number(values.montoReclamado.number.value)
          ? values.montoReclamado.number.value
          : values.montoReclamado.number;

        valueMontoRes = Number(values.montoReserva.number.value)
          ? values.montoReserva.number.value
          : values.montoReserva.number;

        if (Number(valueMontoRes) !== Number(comparacion)) {
          reservaModificada = true;
        }
      }

      let indReservaModificada;
      if (reservaModificada) {
        indReservaModificada = 'S';
      } else if (this.renombrarEstado(estado) === PENDIENTE && this.verificarUsuario(EJECUTIVO_DE_SINIESTRO)) {
        indReservaModificada = 'S';
      } else {
        indReservaModificada = 'N';
      }

      let indSinCobAnt = 'N';
      if (siniestroSinCobertura === 'SI' && !values.siniestroSinCobertura) {
        indSinCobAnt = 'S';
      }

      const { idCase, idSiniestroAX, codProducto, idSiniestro, idePoliza, numCertificado } = siniestro;
      const cobertura = {
        ideCase: idCase,
        ideSin: idSiniestroAX,
        codProd: codProducto,
        numSin: idSiniestro,
        numeroCaso: numSiniestro,
        roles: arrayUsers,
        indReservaModificada,
        ramos: [
          {
            pkRamo,
            codRamo: ramo,
            bienAfect: '',
            coberturas: [
              {
                codCausa: arrayCausa ? arrayCausa.codCausa : codCausa,
                codConsec: arrayConsecuencia ? arrayConsecuencia.codConsecuencia : codConsecuencia,
                dscCausa: arrayCausa ? arrayCausa.dscCausa : causa,
                dscConsec: arrayConsecuencia ? arrayConsecuencia.dscConsecuencia : consecuencia,
                pkCobert: secCobertura,
                ideCobert: idCobertura,
                codCobert,
                dscCobert: dscCobertura,
                tipoRes,
                codCpto: data.codCpto,
                codMoRes: monedaIndemnizacion,
                mtoResMo: valueMontoRes || comparacion,
                codBien: data.codBien,
                mtoReclamado: String(valueMontoRecl || montoReclamado).replace(/,/g, ''),
                dscClaseBien: '',
                mtoSumaAsegurada: sumaAsegurada.replace(/,/g, ''),
                codMotRechSBS: values.motivoRechazoSbs,
                dscMotRechSBS: values.detalleMotivoRechazo || '',
                codMotRech: values.motivoRechazo,
                detOtrosCasos: values.detalleMotivoRechazo || '',
                indSinCob: values.siniestroSinCobertura ? 'S' : 'N',
                indSinCobertura: values.siniestroSinCobertura ? 'S' : 'N',
                indSinCobAnt,
                estado: this.renombrarEstado(estado)
              }
            ]
          }
        ],
        operacion: 'U',
        sumaMtoResCob: Number(sumaMontoReserva)
      };

      let resultado = null;
      try {
        resultado = await postEditarCobertura(cobertura);
      } catch (error) {
        const { response: { status } = {} } = error;
        if (status === 504) {
          this.setState({
            reCargaRamosCoberturas: true
          });
          resultado = await postRamosCobertura(numSiniestro, idePoliza, numCertificado, idSiniestro, null);
          setFieldsValue({
            ramosCoberturas: resultado.data[0].ramos
          });
          reset();
          this.setState({
            modalEditarVisible: false,
            existeSiniestro: false,
            selectedCobertura: null,
            reCargaRamosCoberturas: false
          });
        } else {
          message.error(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
        }
        return;
      }

      cobertura.ramos[0].coberturas[0].codConsecuencia = consecuencia.codConsecuencia;
      cobertura.ramos[0].coberturas[0].consecuencia = consecuencia.dscConsecuencia;

      const ramoCoberturaClonado = cloneDeep(ramosCoberturas);
      const nuevoRamosCoberturas = ramoCoberturaClonado.map(ramoCobertura => {
        if (ramoCobertura.codRamo === ramo) {
          const res = {
            ...ramoCobertura,
            coberturas: ramoCobertura.coberturas.map(cobert => {
              if (cobert.codCobert === cobertura.ramos[0].coberturas[0].codCobert) {
                const modificado = {};
                modificado.idCobertura = Number(idCobertura);
                modificado.totalPagosAprobados = String(totalPagosAprobadosCobertura).replace(/,/g, '');
                modificado.montoReclamado = valueMontoRecl || montoReclamado;
                modificado.codConsecuencia = arrayConsecuencia ? arrayConsecuencia.codConsecuencia : codConsecuencia;
                modificado.dscConsecuencia = arrayConsecuencia ? arrayConsecuencia.dscConsecuencia : consecuencia;
                modificado.dscCausa = arrayCausa ? arrayCausa.dscCausa : causa;
                modificado.codCausa = arrayCausa ? arrayCausa.codCausa : codCausa;
                modificado.indSinCobertura = values.siniestroSinCobertura ? 'S' : 'N';
                modificado.estado = resultado.data[0].estado;
                modificado.montoReserva = valueMontoRes || reservaAntesDeducible;
                modificado.descCobertura = dscCobertura;
                modificado.codMotivoRechazo = values.motivoRechazo;
                modificado.codMotivoRechazoSBS = values.motivoRechazoSbs;
                modificado.detOtrosCasos = values.detalleMotivoRechazo;
                modificado.fechaCreacion = fechaCreacion;
                const obj = {
                  ...cobert,
                  ...values,
                  ...modificado
                };
                return obj;
              }
              return cobert;
            })
          };
          return res;
        }
        return ramoCobertura;
      });

      const siniestroFormItem = getFieldValue('siniestro');
      const { otrosConceptos = [] } = siniestroFormItem;

      setFieldsValue({
        siniestro: {
          ...siniestroFormItem,
          otrosConceptos: otrosConceptos.map(concepto => {
            if (concepto.codConcepto === '001' && concepto.codRamo === ramo) {
              return {
                ...concepto,
                mtoHonorarioCalculado: resultado.data[0].mtoHonorarioCalculado
              };
            }
            return concepto;
          })
        }
      });

      setRamosCoberturas(nuevoRamosCoberturas);
      refrescarHistorialReserva(numSiniestro);
      reset();
      this.setState({
        modalEditarVisible: false,
        existeSiniestro: false,
        selectedCobertura: null
      });
    });
  };

  anularCobertura = () => {
    const {
      props: { form }
    } = this.anularFormRef;

    form.validateFields(async err => {
      if (err) {
        return;
      }

      const {
        postAnularCobertura,
        numSiniestro,
        siniestro,
        ramosCoberturas,
        setRamosCoberturas,
        refrescarHistorialReserva,
        analizarForm: { getFieldValue, setFieldsValue },
        eliminarReaseguros,
        arrayUsers
      } = this.props;

      const {
        listaBranches,
        selectedCobertura: {
          pkRamo,
          ramo,
          secCobertura,
          idCobertura,
          codCobert,
          dscCobertura,
          tipoRes,
          monedaIndemnizacion,
          sumaAsegurada,
          codCausa,
          causa,
          codConsecuencia,
          consecuencia,
          reservaAntesDeducible,
          montoReclamado
        }
      } = this.state;

      let data = {};
      let sumaMontoReserva = 0;

      listaBranches.forEach(branches => {
        branches.listCoberturas.forEach(item => {
          if (Number(item.ideCobert) === Number(idCobertura)) {
            data = item;
          }
        });
      });

      ramosCoberturas.forEach(({ codRamo, coberturas }) => {
        if (codRamo === ramo) {
          coberturas.forEach(item => {
            if (Number(idCobertura) === Number(item.idCobertura || item.ideCobert)) {
              sumaMontoReserva += 0;
            } else {
              const reserva = this.quitarFormato(item.montoReserva);
              sumaMontoReserva += Number(reserva || item.mtoResMo);
            }
          });
        }
      });

      const { idCase, idSiniestroAX, codProducto, idSiniestro } = siniestro;
      const cobertura = {
        ideCase: idCase,
        ideSin: idSiniestroAX,
        codProd: codProducto,
        numSin: idSiniestro,
        numeroCaso: numSiniestro,
        roles: arrayUsers,
        indReservaModificada: 'S',
        ramos: [
          {
            pkRamo,
            codRamo: ramo,
            bienAfect: '',
            coberturas: [
              {
                codCausa,
                codConsec: codConsecuencia,
                dscCausa: causa,
                dscConsec: consecuencia,
                pkCobert: secCobertura,
                ideCobert: idCobertura,
                codCobert,
                dscCobert: dscCobertura,
                tipoRes,
                codCpto: data.codCpto,
                codMoRes: monedaIndemnizacion,
                mtoResMo: reservaAntesDeducible,
                codBien: data.codBien,
                mtoReclamado: montoReclamado,
                dscClaseBien: '',
                mtoSumaAsegurada: sumaAsegurada,
                codMotRechSBS: '',
                dscMotRechSBS: '',
                codMotRech: '',
                dscMotRech: '',
                indSinCob: 'N'
              }
            ]
          }
        ],
        operacion: 'D',
        sumaMtoResCob: Number(sumaMontoReserva)
      };

      let resultado = null;
      try {
        resultado = await postAnularCobertura(cobertura);
      } catch (error) {
        const { response: { status } = {} } = error;
        if (status === 504) {
          modalConfirmacionReintentar();
        } else {
          message.error(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
        }
        return;
      }
      const coberturasFiltradas = [];

      const arregloCoberturasClonado = cloneDeep(ramosCoberturas);

      arregloCoberturasClonado.forEach(ramos => {
        if (ramos.codRamo === ramo) {
          const json = {};
          json.codRamo = ramos.codRamo;
          json.secRamo = ramos.secRamo;
          json.coberturas = [];
          ramos.coberturas.forEach(item => {
            if (Number(item.idCobertura || item.ideCobert) !== Number(idCobertura)) {
              json.coberturas.push(item);
            }
          });
          if (!isEmpty(json.coberturas)) {
            coberturasFiltradas.push(json);
          } else {
            eliminarReaseguros(ramo);
          }
        } else {
          coberturasFiltradas.push(ramos);
        }
      });

      const siniestroFormItem = getFieldValue('siniestro');
      const { otrosConceptos = [] } = siniestroFormItem;

      setFieldsValue({
        siniestro: {
          ...siniestroFormItem,
          otrosConceptos: otrosConceptos.map(concepto => {
            if (concepto.codConcepto === '001' && concepto.codRamo === ramo) {
              return {
                ...concepto,
                mtoHonorarioCalculado: resultado.data[0].mtoHonorarioCalculado
              };
            }
            return concepto;
          })
        }
      });

      setRamosCoberturas(coberturasFiltradas);
      refrescarHistorialReserva(numSiniestro);
      this.setState({
        selectedCobertura: null
      });
    });
  };

  confirmarAgregarCobertura = () => {
    const { coberturaLoading } = this.props;
    let entry = true;
    const opciones = {
      title: 'Los datos serán registrados en el Core',
      content: <span>¿Está seguro de grabar?</span>,
      okButtonProps: {
        loading: coberturaLoading,
        disabled: coberturaLoading
      },
      cb: () => {
        if (entry) {
          this.agregarCobertura();
          entry = false;
        }
      }
    };
    modalConfirmacion(opciones);
  };

  confirmarAnulacion = () => {
    const { loadingAnular } = this.props;
    let entry = true;
    const opciones = {
      title: '¿Desea anular la cobertura?',
      okButtonProps: {
        loading: loadingAnular,
        disabled: loadingAnular
      },
      cb: () => {
        if (entry) {
          this.anularCobertura();
          entry = false;
        }
      }
    };

    modalConfirmacion(opciones);
  };

  confirmarSiniestroSinCobertura = () => {
    const opciones = {
      title: '¿Desea rechazar la cobertura?',
      content: '',
      cb: () => {
        this.editarCobertura();
      }
    };

    modalConfirmacion(opciones);
  };

  confirmarEdicion = () => {
    const {
      selectedCobertura: { reservaAntesDeducible }
    } = this.state;
    let entry = true;

    let reservaModificada = false;

    const comparacion = Number.isInteger(Number(reservaAntesDeducible.replace(/,/g, '')))
      ? Number(reservaAntesDeducible.replace(/,/g, '').split('.')[0])
      : Number(reservaAntesDeducible.replace(/,/g, ''));

    const {
      props: { form }
    } = this.editarFormRef;

    form.validateFields(async (err, values) => {
      if (err) {
        return;
      }
      const valueMontoRes = Number(values.montoReserva.number.value)
        ? values.montoReserva.number.value
        : values.montoReserva.number;

      if (valueMontoRes !== comparacion) {
        reservaModificada = true;
      }

      if (this.verificarUsuario(ROLES_USUARIOS.EJECUTIVO_DE_SINIESTRO) && reservaModificada) {
        const opciones = {
          title: 'Los datos serán registrados en el Core',
          content: <span>¿Está seguro de grabar?</span>,
          cb: () => {
            if (entry) {
              this.editarCobertura();
              entry = false;
            }
          }
        };

        modalConfirmacion(opciones);
      } else {
        // eslint-disable-next-line no-lonely-if
        if (entry) {
          this.editarCobertura();
          entry = false;
        }
      }
    });
  };

  onCancel = () => {
    const { reset } = this.props;
    this.setState({ modalVisible: false });
    reset();
  };

  saveFormRef = formRef => {
    this.formRef = formRef;
  };

  saveEditarFormRef = editarFormRef => {
    this.editarFormRef = editarFormRef;
  };

  saveAnularFormRef = anularFormRef => {
    this.anularFormRef = anularFormRef;
  };

  setModalVisibleEdit = selectedCobertura => {
    this.setState({ modalEditarVisible: true, selectedCobertura });
  };

  setAnularCoberturaSeleccionada = selectedCobertura => {
    this.setState({
      selectedCobertura
    });
  };

  onCancelEditar = () => {
    this.setState({ modalEditarVisible: false, selectedCobertura: null });
  };

  verificarUsuario = rol => {
    const { arrayUsers } = this.props;
    const user = arrayUsers.includes(rol);
    return user;
  };

  render() {
    const {
      ramosCoberturas,
      poliza,
      certificado,
      branches,
      coverages,
      causes,
      consequences,
      descProducto,
      currentTask,
      currentTask: { idTarea },
      siniestro,
      numSiniestro,
      analizarForm,
      analizarForm: { getFieldValue },
      coberturaLoading,
      disabledGeneral,
      loadingAnular,
      usuario,
      indFronting,
      indFacultativo,
      rechazoPago,
      idCaso,
      flagModificar,
      arrayUsers,
      dataSiniestro = {}
    } = this.props;
    const { modalVisible, selectedCobertura, modalEditarVisible, reCargaRamosCoberturas } = this.state;
    const { PENDIENTE } = ESTADO;

    const cerrarSiniestro = getFieldValue('indCerrarSiniestro');
    const esPreventivo = getFieldValue('tipoSiniestro') === PENDIENTE;
    const siniestroCambioPreventivo =
      getFieldValue('tipoSiniestro') === 'N' && siniestro.codTipoSiniestro === PENDIENTE;
    const noRequiereAjustador = getFieldValue('ajustadorRequerido') === 'N';
    const requiereAjustador = getFieldValue('ajustadorRequerido');

    const objPoliza = {
      idePol: !isEmpty(poliza.poliza[0]) && poliza.poliza[0].idePoliza
    };

    const objCertificado = {
      numCert: !isEmpty(certificado.certificate[0]) && certificado.certificate[0].numCertificado,
      codMonSumAseg: !isEmpty(certificado.certificate[0]) && certificado.certificate[0].moneda
    };

    let coberturasElegidas = [];
    const desabilitarAnularCobertura = [];
    if (!isEmpty(ramosCoberturas)) {
      ramosCoberturas.forEach(ramo => {
        const row = ramo.coberturas.map(item => ({
          key: item.idCobertura || item.ideCobert
        }));
        desabilitarAnularCobertura.push(...row);
      });

      ramosCoberturas.forEach(ramo => {
        coberturasElegidas = ramo.coberturas.map(item => ({
          idCobertura: item.idCobertura,
          codRamo: item.codRamo,
          delete: false
        }));
      });
    }

    return (
      <div>
        <Card>
          <Row
            gutter={24}
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}
          >
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              {idTarea !== TAREAS.REVISAR_PAGO_AJUSTADOR && (
                <Button
                  icon="plus-circle"
                  style={{
                    marginBottom: '15px'
                  }}
                  onClick={siniestroCambioPreventivo ? mostrarModalSiniestroaPreventivo : this.handleModalFormVisible}
                  disabled={
                    (siniestro && siniestro.tipoFlujo === 'S' && noRequiereAjustador) ||
                    disabledGeneral ||
                    cerrarSiniestro ||
                    esPreventivo ||
                    idTarea === TAREAS.CONFIRMAR_GESTION ||
                    idTarea === TAREAS.ADJUNTAR_CARGO_DE_RECHAZO ||
                    loadingAnular ||
                    !(
                      this.verificarUsuario(ROLES_USUARIOS.EJECUTIVO_DE_SINIESTRO) &&
                      (idTarea === TAREAS.ANALIZAR_SINIESTRO ||
                        idTarea === TAREAS.REVISAR_INFORME_BASICO ||
                        idTarea === TAREAS.REVISAR_INFORME)
                    ) ||
                    idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO ||
                    (this.verificarUsuario(ROLES_USUARIOS.AJUSTADOR) && idTarea === TAREAS.GENERAR_INFORME_BASICO) ||
                    rechazoPago === 'R' ||
                    dataSiniestro.indCargaMasiva === 'COA'
                  }
                >
                  Agregar cobertura
                </Button>
              )}
              {modalVisible && (
                <AgregarCoberturaModalForm
                  wrappedComponentRef={this.saveFormRef}
                  visible={modalVisible}
                  edit={false}
                  onCancel={this.onCancel}
                  onOk={this.confirmarAgregarCobertura}
                  poliza={objPoliza}
                  certificado={objCertificado}
                  branches={branches}
                  coverages={coverages}
                  causes={causes}
                  consequences={consequences}
                  selectedCobertura={selectedCobertura}
                  coberturasElegidas={coberturasElegidas}
                  agregarCobertura
                  ramos={ramosCoberturas}
                  fechaOcurrencia={siniestro.fechaOcurrencia}
                />
              )}
              {modalEditarVisible && (
                <ModalEditar
                  modal={modalEditarVisible}
                  tarea={currentTask}
                  disabledGeneral={disabledGeneral}
                  cerrar={this.onCancelEditar}
                  onOkEditar={this.confirmarEdicion}
                  confirmarSiniestroSinCobertura={this.confirmarSiniestroSinCobertura}
                  selectedCobertura={selectedCobertura}
                  wrappedComponentRef={this.saveEditarFormRef}
                  siniestro={siniestro}
                  analizarForm={analizarForm}
                  branches={branches.branches}
                  numSiniestro={numSiniestro}
                  rechazoPago={rechazoPago}
                  usuario={usuario}
                  flagModificar={flagModificar}
                  arrayUsers={arrayUsers}
                  verificarUsuario={this.verificarUsuario}
                  reCargaRamosCoberturas={reCargaRamosCoberturas}
                />
              )}
            </Col>

            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              {idTarea !== TAREAS.REVISAR_PAGO_AJUSTADOR && (
                <Button
                  icon="stop"
                  style={{
                    transform: 'translateY(-8px)'
                  }}
                  onClick={this.confirmarAnulacion}
                  disabled={
                    disabledGeneral ||
                    desabilitarAnularCobertura.length === 1 ||
                    cerrarSiniestro ||
                    esPreventivo ||
                    idTarea === TAREAS.CONFIRMAR_GESTION ||
                    idTarea === TAREAS.ADJUNTAR_CARGO_DE_RECHAZO ||
                    isEmpty(selectedCobertura) ||
                    loadingAnular ||
                    dataSiniestro.indCargaMasiva === 'COA' ||
                    !(
                      this.verificarUsuario(ROLES_USUARIOS.EJECUTIVO_DE_SINIESTRO) &&
                      (idTarea === TAREAS.ANALIZAR_SINIESTRO ||
                        idTarea === TAREAS.REVISAR_INFORME_BASICO ||
                        idTarea === TAREAS.REVISAR_INFORME ||
                        idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO)
                    )
                  }
                  loading={loadingAnular}
                >
                  Anular cobertura
                </Button>
              )}
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <div className="content-item">
                <Checkbox
                  checked={indFacultativo === 'S'}
                  disabled={
                    true || idTarea === TAREAS.CONFIRMAR_GESTION || idTarea === TAREAS.ADJUNTAR_CARGO_DE_RECHAZO
                  }
                >
                  Facultativo
                </Checkbox>
                <Checkbox
                  checked={indFronting === 'S'}
                  disabled={
                    true || idTarea === TAREAS.CONFIRMAR_GESTION || idTarea === TAREAS.ADJUNTAR_CARGO_DE_RECHAZO
                  }
                >
                  Fronting
                </Checkbox>
              </div>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <div className="content-item">
                <Form.Item label="Producto">
                  <span>{descProducto}</span>
                </Form.Item>
              </div>
            </Col>
          </Row>

          <CoberturaTable
            ramos={ramosCoberturas}
            disabledGeneral={disabledGeneral}
            tarea={currentTask}
            setModalVisibleEdit={this.setModalVisibleEdit}
            setAnularCoberturaSeleccionada={this.setAnularCoberturaSeleccionada}
            analizarForm={analizarForm}
            siniestro={siniestro}
            numSiniestro={numSiniestro}
            coberturaLoading={coberturaLoading}
            wrappedComponentRef={this.saveAnularFormRef}
            disabled={desabilitarAnularCobertura.length === 1 || loadingAnular}
            usuario={usuario}
            loadingAnular={loadingAnular}
            rechazoPago={rechazoPago}
            idCaso={idCaso}
            arrayUsers={arrayUsers}
            verificarUsuario={this.verificarUsuario}
            selectedCobertura={selectedCobertura}
          />
        </Card>
        {(requiereAjustador === 'S' || requiereAjustador === undefined) && dataSiniestro.indCargaMasiva !== 'COA' && (
          <Fragment>
            <Divider style={{ color: '#919191', fontWeight: 'bold' }} orientation="left">
              Historial ajustadores
            </Divider>
            <Row gutter={24}>
              <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <HistorialAjustadores />
              </Col>
            </Row>
          </Fragment>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  coverages: getCoverages(state),
  causes: getCauses(state),
  poliza: getDataPoliza(state),
  certificado: getDataCertificate(state),
  certificadoDec: getCertificado(state),
  consequences: getConsequences(state),
  branches: getBranches(state),
  showScroll: state.services.device.scrollActivated,
  indFronting: getIndFronting(state),
  indFacultativo: getIndFacultativo(state),
  descProducto: getDescProducto(state),
  siniestro: getDataSinister(state),
  coberturaLoading: getCoberturaLoading(state),
  loadingAnular: getLoadingAnular(state),
  usuario: state.services.user.userClaims,
  errorBranch: getErrorBranches(state),
  coberturasAjustadores:
    state.scenes.taskTray.taskTrayComponents.sectionCoverages.data.coveragesAdjusters.coveragesAdjusters[0]
});

const mapDispatchToProps = dispatch => ({
  postRamosCobertura: (p1, p2, p3, p4, p5) => dispatch(fetchCoveragesAdjusters(p1, p2, p3, p4, p5)),
  postCrearCobertura: json => dispatch(fetchCrearCobertura(json)),
  postEditarCobertura: json => dispatch(fetchEditarCobertura(json)),
  postAnularCobertura: json => dispatch(fetchAnularCobertura(json)),
  obtenerRamos: (p1, p2, p3) => dispatch(fetchBranches(p1, p2, p3)),
  actualizarLista: array => dispatch(fetchCoveragesAdjustersFinished(array)),
  refrescarHistorialReserva: id => dispatch(fecthHistorialReserva(id)),
  obtenerReaseguros: id => dispatch(fetchObtenerReaseguros(id)),
  eliminarReaseguros: id => dispatch(eliminarReasegurosTerminado(id)),
  reset: () => {
    dispatch(fetchCausesReset());
    dispatch(fetchConsequencesReset());
  },
  resetBranches: () => dispatch(fetchBranchesReset())
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(DatosCobertura)
);
