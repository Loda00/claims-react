import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Prompt } from 'react-router-dom';
import { Form, Row, Col, Input, DatePicker, Button, Modal, Icon, Spin, Radio } from 'antd';
import moment from 'moment';
import { includes, get, find, capitalize, set, isEmpty } from 'lodash';
import * as sinisterActionCreators from 'services/sinister/actions';
import * as completeSinisterActionCreators from 'scenes/TaskTray/scenes/CompleteTaskInfo/data/completeSinister/actions';

import { getEventTypes } from 'scenes/TaskTray/scenes/CompleteTaskInfo/data/eventTypes/reducer';
import * as eventTypesActionCreators from 'scenes/TaskTray/scenes/CompleteTaskInfo/data/eventTypes/actions';

import { getLossTypes, getLossDetails } from 'scenes/TaskTray/scenes/CompleteTaskInfo/data/lossTypes/reducer';
import * as lossTypesActionCreators from 'scenes/TaskTray/scenes/CompleteTaskInfo/data/lossTypes/actions';
import * as policyActionCreators from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/SearchPoliza/data/policies/actions';
import * as certificatesActionCreators from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/SearchCertificado/data/certificates/actions';
import * as adjustersActionCreator from 'scenes/TaskTray/scenes/CompleteTaskInfo/data/adjusters/actions';
import * as taskActionCreators from 'scenes/TaskTray/data/task/actions';
import * as meansOfTransportActionCreators from 'scenes/TaskTray/scenes/CompleteTaskInfo/data/meansOfTransport/actions';
import * as typesActionCreators from 'services/types/actions';

import { getSinister } from 'services/sinister/reducer';
import { getCompleteSinister } from 'scenes/TaskTray/scenes/CompleteTaskInfo/data/completeSinister/reducer';
import { getPolicies } from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/SearchPoliza/data/policies/reducer';
import { getCertificates } from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/SearchCertificado/data/certificates/reducer';
import { getBranches } from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DatosCobertura/data/branches/reducer';
import { TIPO_SINIESTRO, CONSTANTS_APP, MENSAJES_TAREAS } from 'constants/index';
import * as Utils from 'util/index';
import Anular from 'scenes/components/Anular';
import { fetchRG1Reset } from 'scenes/TaskTray/scenes/SiniestroDuplicado/data/consultarRG/action';
import {
  fetchRGDuplicado,
  fetchRGDuplicadoReset
} from 'scenes/TaskTray/scenes/SiniestroDuplicado/data/consultarRGDuplicado/action';
import { getRGClaims } from 'scenes/TaskTray/scenes/SiniestroDuplicado/data/consultarRG/reducer';
// import { getRGDuplicado } from 'scenes/TaskTray/scenes/SiniestroDuplicado/data/consultarRGDuplicado/reducer'
import {
  fetchExistingCertificate,
  fetchCertificatesReset
} from 'scenes/TaskTray/scenes/SiniestroDuplicado/data/certificado/actions';
import { fetchExistingPolicy, fetchPoliciesReset } from 'scenes/TaskTray/scenes/SiniestroDuplicado/data/poliza/actions';
import { getCertificadoDuplicado } from 'scenes/TaskTray/scenes/SiniestroDuplicado/data/certificado/reducer';
import { getPolizaDuplicada } from 'scenes/TaskTray/scenes/SiniestroDuplicado/data/poliza/reducer';
import { ValidationMessage } from 'util/validation';
import { getTakeTask } from 'scenes/TaskTray/data/task/reducer';
import TakeTaskButton from 'scenes/TaskTray/components/TakeTaskButton';
import { getCurrentTask } from 'scenes/TaskTray/scenes/TaskTrayHome/data/taskTable/reducer';
import { getAdjusters } from 'scenes/TaskTray/scenes/CompleteTaskInfo/data/adjusters/reducer';
import { esDireccionCompleta } from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DireccionSiniestro/util';
import CoberturaFormItem from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/CoberturaFormItem';
import DireccionFormItem from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DireccionFormItem';
import PolizaFormItem from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/PolizaFormItem';
import Info from 'scenes/TaskTray/scenes/SiniestroDuplicado/components/InfoRegistrada/index';
import CertificadoFormItem from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/CertificadoFormItem/index';
import { getMeansOfTransport } from 'scenes/TaskTray/scenes/CompleteTaskInfo/data/meansOfTransport/reducer';

import './style.css';

const COD_PRODUCTO_TRANSPORTE = ['3001', '3002', '3003'];
const COD_RAMO_TRANSPORTE = 'TRAN';

class CompleteTaskInfo extends React.Component {
  state = {
    isLoading: true,
    redirectOnComplete: false,
    rgDuplicado: [],
    datosDelSiniestroDuplicado: [],
    direccionSiniestroDuplicado: [],
    coberturasSiniestroDuplicado: [],
    abrirModalAnular: false,
    validarCompletarTarea: true
  };

  async componentDidMount() {
    const {
      dispatch,
      currentTask: { numSiniestroDuplicado }
    } = this.props;

    dispatch(typesActionCreators.fetchParam('CRG_SYN_TAREAS'));
    dispatch(fetchRGDuplicado(numSiniestroDuplicado));
    await this.loadSinister();
    this.setState({ isLoading: false });
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { rgDuplicado, dispatch } = nextProps;

    if (!isEmpty(rgDuplicado) && rgDuplicado !== prevState.rgDuplicado) {
      if (rgDuplicado.poliza.codProducto && rgDuplicado.poliza.numPoliza) {
        dispatch(fetchExistingPolicy(rgDuplicado.poliza.numPoliza, rgDuplicado.poliza.codProducto));
      }

      if (rgDuplicado.poliza.numCertificado) {
        dispatch(
          fetchExistingCertificate(
            rgDuplicado.poliza.idPoliza,
            rgDuplicado.poliza.codProducto,
            rgDuplicado.poliza.numPoliza,
            rgDuplicado.poliza.numCertificado,
            rgDuplicado.siniestro.idDeclaracion
          )
        );
      }

      return {
        rgDuplicado,
        datosDelSiniestroDuplicado: rgDuplicado.siniestro,
        direccionSiniestroDuplicado: rgDuplicado.siniestro.ubicacion,
        coberturasSiniestroDuplicado: rgDuplicado.siniestro.ramos
      };
    }

    return null;
  }

  componentDidUpdate() {
    window.onbeforeunload = () => {
      const {
        form: { isFieldsTouched }
      } = this.props;
      const { redirectOnComplete } = this.state;
      if (isFieldsTouched() && !redirectOnComplete) return 'Are you sure to exit?';
      return false;
    };
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch(adjustersActionCreator.fetchAdjustersReset());
    dispatch(lossTypesActionCreators.fetchLossTypesReset());
    dispatch(eventTypesActionCreators.fetchEventTypesReset());
    dispatch(meansOfTransportActionCreators.fetchMeansOfTransportReset());
    dispatch(fetchRG1Reset());
    dispatch(fetchRGDuplicadoReset());
    dispatch(fetchCertificatesReset());
    dispatch(fetchPoliciesReset());
  }

  getDataSinister = () => {
    const {
      dispatch,
      match: { params }
    } = this.props;
    return dispatch(sinisterActionCreators.fetchSinister(params.numSiniestro));
  };

  obtenerPoliza = poliza => {
    const { dispatch } = this.props;
    return dispatch(policyActionCreators.fetchExistingPolicy(poliza.idPoliza, poliza.numCertificado));
  };

  obtenerCertificado = (poliza, siniestro) => {
    const { dispatch } = this.props;
    return dispatch(
      certificatesActionCreators.fetchExistingCertificate(
        poliza.idPoliza,
        poliza.codProducto,
        poliza.numPoliza,
        poliza.numCertificado,
        siniestro.idDeclaracion
      )
    );
  };

  obtenerAjustadores = primerRamo => {
    const { dispatch } = this.props;
    return dispatch(adjustersActionCreator.fetchAdjusters(primerRamo.codigo));
  };

  obtenerDatosPerdida = () => {
    const { dispatch } = this.props;
    return dispatch(lossTypesActionCreators.fetchLossTypes('CRG_TPERDIDA', 2));
  };

  obtenerTipoEvento = () => {
    const { dispatch } = this.props;
    return dispatch(eventTypesActionCreators.fetchEventTypes('CRG_TEVENTO'));
  };

  obtenerMeansOfTransport = () => {
    const { dispatch } = this.props;
    return dispatch(meansOfTransportActionCreators.fetchMeansOfTransport('CRG_TMEDIO_TRANSPORTE'));
  };

  ocultarModalAnular = () => {
    this.setState({
      abrirModalAnular: false
    });
  };

  restablecerValores = () => {
    this.setState({
      abrirModalAnular: false
    });
  };

  loadData = () => {
    const promises = [];
    const {
      sinister: { sinister }
    } = this.props;
    const poliza = get(sinister, 'poliza', {});
    const siniestro = get(sinister, 'siniestro', {});
    const primerRamo = get(sinister, 'siniestro.ramos[0]', {});

    if (poliza.codProducto && poliza.numPoliza) {
      promises.push(this.obtenerPoliza(poliza));
    }

    if (poliza.numCertificado) {
      promises.push(this.obtenerCertificado(poliza, siniestro));
    }

    if (primerRamo.coberturas && primerRamo.codigo) {
      promises.push(this.obtenerAjustadores(primerRamo));
    }

    const esProductoRamoTransporte =
      includes(COD_PRODUCTO_TRANSPORTE, poliza.codProducto) && primerRamo.codigo === COD_RAMO_TRANSPORTE;

    if (esProductoRamoTransporte) {
      promises.push(this.obtenerMeansOfTransport(primerRamo));
    }

    promises.push(this.obtenerDatosPerdida());
    promises.push(this.obtenerTipoEvento());

    return Promise.all(promises);
  };

  loadSinister = () =>
    new Promise((resolve, reject) => {
      const {
        sinister: { sinister },
        dispatch,
        form: { resetFields, validateFields }
      } = this.props;
      this.getDataSinister()
        .then(this.loadData)
        .then(() => {
          const perdida = get(sinister, 'siniestro.ramos[0].perdida', {});
          dispatch(lossTypesActionCreators.updateSelectedLossType(perdida.tipoPerdida));
          resetFields('detallePerdida');
        })
        .then(() => {
          validateFields().finally(() => {
            resolve();
          });
        })
        .catch(() => {
          reject();
          Utils.showErrorMessage(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
        });
    });

  checkPoliza = (rule, value, callback) => {
    if (value && value.idePol) {
      callback();
      return;
    }

    callback(ValidationMessage.REQUIRED);
  };

  checkCertificado = (rule, value, callback) => {
    const {
      form: { validateFields }
    } = this.props;

    validateFields(['fechadeocurrencia']);

    if (value && value.numCert) {
      callback();
      return;
    }

    callback(ValidationMessage.REQUIRED);
  };

  checkDireccionSiniestro = (rule, value, callback) => {
    if (esDireccionCompleta(value)) {
      callback();
      return;
    }

    callback(ValidationMessage.REQUIRED);
  };

  checkCobertura = (rule, value, callback) => {
    const coberturasMostradas = value.coberturas.filter(item => item.delete !== true);

    if (typeof coberturasMostradas === 'undefined' || coberturasMostradas.length === 0) {
      callback('Ingrese por lo menos una cobertura');
      return;
    }
    if (
      coberturasMostradas.some(cobert =>
        Utils.isArgumentsEmpty(
          cobert.codCausa,
          cobert.descCausa,
          cobert.codConsecuencia,
          cobert.descConsecuencia,
          cobert.codCobertura,
          cobert.codRamo,
          cobert.dscCobertura,
          cobert.idCobertura,
          cobert.montoAproximadoReclamado
        )
      )
    ) {
      callback('Algunas coberturas no tienen datos completos');
      return;
    }

    callback();
  };

  checkFechaOcurrencia = (rule, value, callback) => {
    if (!value) {
      callback(ValidationMessage.REQUIRED);
      return;
    }

    const {
      form: { getFieldValue }
    } = this.props;

    const certificado = getFieldValue('certificado');
    if (certificado) {
      const fecIniVig = moment(certificado.fecIng, CONSTANTS_APP.FORMAT_DATE_OUTPUT_CORE);
      const fecFinVig = moment(certificado.fecFin, CONSTANTS_APP.FORMAT_DATE_OUTPUT_CORE);
      if (!value.isBetween(fecIniVig, fecFinVig, 'day', '[]')) {
        callback('Fecha no v\u00e1lida para el certificado');
      }
    }

    callback();
  };

  handleLossTypeChange = selectedLossType => {
    const {
      dispatch,
      form: { resetFields }
    } = this.props;
    dispatch(lossTypesActionCreators.updateSelectedLossType(selectedLossType));
    resetFields('detallePerdida');
  };

  handleChangeCobertura = coberturas => {
    const {
      dispatch,
      adjusters,
      meansOfTransport,
      form: { setFieldsValue, getFieldValue, validateFields }
    } = this.props;

    const coberturasMostradas = coberturas.coberturas.filter(item => item.delete !== true);

    if (coberturasMostradas.length === 0) {
      // dispatch(adjustersActionCreator.fetchAdjustersReset());
      setFieldsValue({ ajustador: undefined });
    } else {
      const coberturasMostradasPrev = getFieldValue('coberturas').coberturas.filter(item => item.delete !== true);
      if (
        coberturasMostradasPrev.length === 0 ||
        (coberturasMostradasPrev.length > 0 && coberturasMostradasPrev[0].codRamo !== coberturasMostradas[0].codRamo)
      ) {
        dispatch(adjustersActionCreator.fetchAdjusters(coberturasMostradas[0].codRamo)).finally(() => {
          if (adjusters.error) {
            Utils.showErrorMessage(adjusters.error.message);
          }
          setFieldsValue({ ajustador: undefined });
          validateFields(['ajustador']);
        });

        dispatch(meansOfTransportActionCreators.fetchMeansOfTransport('CRG_TMEDIO_TRANSPORTE')).finally(() => {
          if (meansOfTransport.error) {
            Utils.showErrorMessage(meansOfTransport.error.message);
          }
          validateFields(['medioTransporte']);
        });
      }
    }
  };

  handleChangeAjustador = () => {
    const {
      form: { validateFields }
    } = this.props;
    validateFields();
  };

  createServiceData = values => {
    const {
      sinister: { sinister }
    } = this.props;
    const polizaInicial = get(sinister, 'poliza', {});
    const polizaFinal = values.poliza;

    const certificadoFinal = values.certificado;
    const siniestroInicial = get(sinister, 'siniestro', {});

    const ubicacionInicial = get(sinister, 'siniestro.ubicacion', {});

    const totalCoberturas = [];
    const codsCoberturas = [];
    if (!isEmpty(sinister.siniestro.ramos)) {
      sinister.siniestro.ramos.forEach(coberturas => {
        coberturas.coberturas.forEach(item => {
          totalCoberturas.push(item);
          codsCoberturas.push(item.codCobertura);
        });
      });
    }

    const direccionFinal = values.direccion || {};

    const poliza = {
      secPoliza: polizaInicial.secPoliza ? polizaInicial.secPoliza : 0,
      idPoliza: polizaFinal.idePol,
      numPoliza: polizaFinal.numPol,
      estadoPoliza: polizaFinal.stsPol,
      nombreCompleto: '',
      fecInicioVigencia: polizaFinal.fecIniVig
        ? moment(polizaFinal.fecIniVig, CONSTANTS_APP.FORMAT_DATE_OUTPUT_CORE).format(
            CONSTANTS_APP.FORMAT_DATE_OUTPUT_CORE
          )
        : '',
      fecFinVigencia: polizaFinal.fecFinVig
        ? moment(polizaFinal.fecFinVig, CONSTANTS_APP.FORMAT_DATE_OUTPUT_CORE).format(
            CONSTANTS_APP.FORMAT_DATE_OUTPUT_CORE
          )
        : '',
      secProducto: polizaInicial.secProducto,
      codProducto: polizaFinal.codProd,
      dscProducto: polizaFinal.dscProd,
      certificado: {
        secCertificado: polizaInicial.secCertificado ? polizaInicial.secCertificado : 0,
        numCertificado: certificadoFinal.numCert,
        descripcion: certificadoFinal.dscCert,
        moneda: certificadoFinal.codMonSumAseg,
        idDeclaracion: certificadoFinal.ideDec,
        sumaAsegurada: certificadoFinal.sumAseg,
        estado: certificadoFinal.stsCert,
        fecIniVigencia: certificadoFinal.fecIng
          ? moment(certificadoFinal.fecIng, CONSTANTS_APP.FORMAT_DATE_OUTPUT_CORE).format('DD/MM/YYYY')
          : '',
        fecFinVigencia: certificadoFinal.fecFin
          ? moment(certificadoFinal.fecFin, CONSTANTS_APP.FORMAT_DATE_OUTPUT_CORE).format('DD/MM/YYYY')
          : ''
      }
    };

    // carga ramos
    const ramos = [];
    // eslint-disable-next-line
    values.coberturas &&
      values.coberturas.coberturas &&
      values.coberturas.coberturas.forEach(coberturaRamo => {
        if (ramos.some(ramo => ramo.codigo === coberturaRamo.codRamo)) {
          return;
        }

        const coberturas = [];
        let deleteRamo = true;
        values.coberturas.coberturas.forEach(cobertura => {
          if (coberturaRamo.codRamo === cobertura.codRamo) {
            deleteRamo = deleteRamo && cobertura.delete;

            let indReservaModificada;

            if (codsCoberturas.includes(cobertura.codCobertura)) {
              const obj = totalCoberturas.find(item => item.codCobertura === cobertura.codCobertura);

              if (Number(cobertura.montoAproximadoReclamado) === Number(obj.montoReserva)) {
                indReservaModificada = 'N';
              } else {
                indReservaModificada = 'S';
              }
            } else {
              indReservaModificada = 'S';
            }

            coberturas.push({
              delete: cobertura.delete ? cobertura.delete : false,
              secCobertura: cobertura.secCobertura,
              indReservaModificada,
              secRamo: cobertura.secRamo,
              secPerdida: cobertura.secPerdida,
              idCobertura: cobertura.idCobertura,
              codCobertura: cobertura.codCobertura,
              tipo: cobertura.tipo,
              dscCobertura: cobertura.dscCobertura,
              codMoneda: certificadoFinal.codMonSumAseg,
              mtoReservado: cobertura.montoAproximadoReclamado,
              mtoSumaAsegurada: cobertura.mtoSumaAsegurada,
              causa: {
                secCausa: cobertura.secCausa,
                dscCausa: cobertura.descCausa,
                codCausa: cobertura.codCausa
              },
              consecuencia: {
                secConsecuencia: cobertura.secConsecuencia,
                dscConsecuencia: cobertura.descConsecuencia,
                codConsecuencia: cobertura.codConsecuencia
              }
            });
          }
        });

        ramos.push({
          secRamo: coberturaRamo.secRamo,
          delete: deleteRamo || false,
          codigo: coberturaRamo.codRamo,
          coberturas
        });
      });

    const primerRamo = get(sinister, 'siniestro.ramos[0]', {});
    const inspeccionInicial = get(sinister, 'siniestro.inspeccion[0]', {});

    const secPerd = values.tipoPerdida || values.detallePerdida ? 0 : '';

    const {
      sinister: {
        sinister: {
          siniestro: { idAjustador }
        }
      }
    } = this.props;

    const siniestro = {
      numSiniestro: siniestroInicial.numSiniestro,
      tipo: siniestroInicial.tipo,
      descOcurrencia: values.descripcionSiniestro,
      fechaOcurrencia: moment(values.fechadeocurrencia).format('DD/MM/YYYY'),
      horaOcurrencia: moment(values.fechadeocurrencia).format('HH:mm:ss'),
      fechaNotificacion: siniestroInicial.fechaNotificacion
        ? moment(siniestroInicial.fechaNotificacion, CONSTANTS_APP.FORMAT_DATE_OUTPUT_CORE).format('DD/MM/YYYY')
        : '',
      horaNotificacion: siniestroInicial.horaNotificacion,
      indTercerosAfectados: siniestroInicial.indTercerAfectado,
      idAjustador,
      indCuentaEstado: siniestroInicial.indCuentaEstado,
      indFacultativo: siniestroInicial.indFacultativo,
      indPrevencionFraude: values.prevencionFraude,
      codReclamo: siniestroInicial.codReclamo,
      transporte: {
        secInspeccion: inspeccionInicial.secInspeccion,
        empresaTransporte: values.empresaTransporte ? values.empresaTransporte : '',
        nombreConductor: values.nombreConductor ? values.nombreConductor : '',
        placa: values.placa ? values.placa : '',
        medioTransporte: values.medioTransporte ? values.medioTransporte : ''
      },
      perdida: {
        secPerdida: primerRamo.perdida && primerRamo.perdida.secPerdida ? primerRamo.perdida.secPerdida : secPerd,
        tipo: values.tipoPerdida ? values.tipoPerdida : '',
        detalle: values.detallePerdida ? values.detallePerdida : ''
      },
      tipoEvento: values.tipoEvento ? values.tipoEvento : '',
      ubicacion: {
        secUbicacion: ubicacionInicial.secUbicacion ? ubicacionInicial.secUbicacion : direccionFinal.secDireccion,
        continente: direccionFinal.continente ? direccionFinal.continente : '',
        pais: direccionFinal.codPais ? direccionFinal.codPais : '',
        codDepartamento: direccionFinal.codCiudad ? direccionFinal.codCiudad : '',
        desDepartamento: direccionFinal.descCiudad ? direccionFinal.descCiudad : '',
        codProvincia: direccionFinal.codEstado ? direccionFinal.codEstado : '',
        desProvincia: direccionFinal.descEstado ? direccionFinal.descEstado : '',
        codDistrito: direccionFinal.codMunicipio ? direccionFinal.codMunicipio : '',
        desDistrito: direccionFinal.descMunicipio ? direccionFinal.descMunicipio : '',
        idDireccionRiesgo: direccionFinal.ideDirec ? direccionFinal.ideDirec : '',
        direccion: direccionFinal.direc ? direccionFinal.direc : ''
      },
      ramos
    };

    const listaContactos = get(sinister, 'contactos', {});
    const asegurado = find(listaContactos, contacto => contacto.tipo === 'A') || {};
    const corredor = find(listaContactos, contacto => contacto.tipo === 'C') || {};
    const preventor = find(listaContactos, contacto => contacto.tipo === 'P') || {};

    const contactos = [
      {
        secContacto: asegurado.secContacto ? asegurado.secContacto : 0,
        nombres: values.nombreCompleto ? values.nombreCompleto : '',
        telefono: values.telefono ? values.telefono : '',
        email: values.correoElectronico ? values.correoElectronico : '',
        tipo: 'A'
      }
    ];

    const preventorNuevo = {
      secContacto: preventor.secContacto ? preventor.secContacto : 0,
      delete: !!(
        Utils.isEmpty(values.nombreCompleto2) &&
        Utils.isEmpty(values.telefono2) &&
        Utils.isEmpty(values.correoElectronico2) &&
        preventor.secContacto
      ),
      nombres: values.nombreCompleto2 ? values.nombreCompleto2 : '',
      telefono: values.telefono2 ? values.telefono2 : '',
      email: values.correoElectronico2 ? values.correoElectronico2 : '',
      tipo: 'P'
    };

    const corredorNuevo = {
      secContacto: corredor.secContacto ? corredor.secContacto : 0,
      delete: !!(
        Utils.isEmpty(values.nombreCompleto1) &&
        Utils.isEmpty(values.telefono1) &&
        Utils.isEmpty(values.correoElectronico1) &&
        corredor.secContacto
      ),
      nombres: values.nombreCompleto1 ? values.nombreCompleto1 : '',
      telefono: values.telefono1 ? values.telefono1 : '',
      email: values.correoElectronico1 ? values.correoElectronico1 : '',
      tipo: 'C'
    };

    if (
      !(
        preventorNuevo.secContacto === 0 &&
        Utils.isEmpty(values.nombreCompleto2) &&
        Utils.isEmpty(values.telefono2) &&
        Utils.isEmpty(values.correoElectronico2)
      )
    ) {
      contactos.push(preventorNuevo);
    }

    if (
      !(
        corredorNuevo.secContacto === 0 &&
        Utils.isEmpty(values.nombreCompleto1) &&
        Utils.isEmpty(values.telefono1) &&
        Utils.isEmpty(values.correoElectronico1)
      )
    ) {
      contactos.push(corredorNuevo);
    }

    return {
      poliza,
      detallePoliza: polizaFinal.detallePoliza,
      siniestro,
      contactos: siniestroInicial.indCargaMasiva !== 'PT' ? contactos : undefined
    };
  };

  saveSinister = () => {
    const {
      dispatch,
      sinister,
      form: { validateFields, resetFields }
    } = this.props;
    validateFields((errors, values) => {
      const hasError =
        errors &&
        Object.keys(errors).some(err => values[err] && Object(values[err]) !== values[err] && values[err].length > 0);

      if (hasError) {
        Utils.showWarningMessage('Existen campos no v\u00e1lidos, por favor corregirlos para guardar');
      } else {
        const serviceData = this.createServiceData(values);
        delete serviceData.detallePoliza;
        dispatch(sinisterActionCreators.saveSinister(serviceData))
          .then(() => {
            return this.loadSinister();
          })
          .then(() => {
            resetFields();
            validateFields();
            Utils.showSuccessMessage('El siniestro se guard\u00f3 exitosamente');
          })
          .catch(() => {
            if (sinister.errorSave) {
              Utils.showErrorMessage(sinister.errorSave.message);
            }
          });
      }
    });
  };

  completeTask = async values => {
    const {
      currentTask: { idCaso, codTarea, nomTarea },
      dispatch,
      history
    } = this.props;

    const serviceData = this.createServiceData(values);
    set(serviceData, 'idCaso', idCaso);
    set(serviceData, 'codTarea', codTarea);
    set(serviceData, 'nomTarea', nomTarea);

    try {
      await dispatch(completeSinisterActionCreators.completeSinister(serviceData));

      this.setState(
        {
          redirectOnComplete: true,
          validarCompletarTarea: false
        },
        () => {
          Modal.success({
            title: 'Completar Siniestro',
            content: 'El siniestro se complet\u00f3 exitosamente',
            onOk: () => {
              history.push('/tareas');
            }
          });
        }
      );
    } catch (error) {
      this.setState({ redirectOnComplete: true });
      const { response: { status } = {} } = error;
      if (status === 504) {
        Utils.modalConfirmacionReintentar();
        return;
      }

      Utils.showErrorMessage(MENSAJES_TAREAS.ERROR_COMPLETAR);
    }
  };

  showConfirm = () => {
    const {
      form: { validateFields }
    } = this.props;
    Modal.confirm({
      title: 'Desea continuar con la atenci\u00f3n del siniestro ?',
      centered: true,
      okText: 'Si',
      cancelText: 'No',
      onOk: () => {
        validateFields((err, values) => {
          if (!err) {
            this.completeTask(values);
          }
        });
      }
    });
  };

  takeTask = () => {
    const { userClaims, currentTask, dispatch, takeTask } = this.props;
    const username = `${capitalize(userClaims.nombres)} ${capitalize(userClaims.apePaterno)}`;
    dispatch(taskActionCreators.takeTask(username, currentTask, userClaims)).finally(() => {
      if (takeTask.error) {
        Utils.showErrorMessage(takeTask.error.message);
      } else {
        Utils.showSuccessMessage('Se tom\u00f3 la tarea con \u00e9xito');
      }
    });
  };

  redirectToTarget = () => {
    const { history } = this.props;
    history.push('/tareas');
  };

  obtenerValorTercerosAfectados = (esCargaMasivaCatastrofico, indTercerAfectado) => {
    let val = '';
    if (esCargaMasivaCatastrofico) {
      val = 'No';
    } else if (indTercerAfectado === 'S') {
      val = 'Si';
    } else {
      val = 'No';
    }
    return val;
  };

  showConfirmAnular = () => {
    Modal.confirm({
      title: '¿Desea anular el siniestro?',
      okText: 'Si',
      cancelText: 'No',
      onOk: () => {
        this.setState({
          abrirModalAnular: true
        });
      },
      onCancel() {}
    });
  };

  // DBC
  redirectToHome = () => {
    this.setState({
      redirectOnComplete: true
    });
  };

  render() {
    // const { abrirModalAnular } = this.state;

    const {
      // rgDuplicado,
      datosDelSiniestroDuplicado: { tipo, descripcionOcurrencia, fechaOcurrencia, fechaCreacion, indTercerAfectado },
      direccionSiniestroDuplicado,
      coberturasSiniestroDuplicado,
      abrirModalAnular,
      validarCompletarTarea
    } = this.state;

    const {
      form,
      history,
      branches,
      policies,
      // adjusters,
      currentTask,
      certificates,
      // meansOfTransport,
      currentTask: { tomado, numSiniestro, tarea, numSiniestroDuplicado },
      takeTask: { isLoading: isLoadingTakeTask },
      certificates: { existingCertificate, loadingExistingCertificate },
      policies: { existingPolicy, loadingExistingPolicy },
      sinister: { sinister, isLoading: isLoadingSinister },
      form: { getFieldDecorator, getFieldsError, getFieldError, getFieldValue, isFieldsTouched }
    } = this.props;
    const { isLoading: isLoadingState } = this.state;
    const siniestroInicial = get(sinister, 'siniestro', {});
    const polizaInicial = get(sinister, 'poliza', {});
    const ramosIniciales = get(sinister, 'siniestro.ramos', {});
    const coberturas = getFieldValue('coberturas') || {};
    const coberturasMostradas =
      coberturas.coberturas &&
      coberturas.coberturas.length > 0 &&
      coberturas.coberturas.filter(item => item.delete !== true);
    const primerRamoMostradoCodigoMod =
      coberturasMostradas && coberturasMostradas.length > 0 ? coberturasMostradas[0].codRamo : undefined;
    const esCargaMasivaCatastrofico = siniestroInicial.indCargaMasiva === 'CAT';

    // coberturas inicial
    const ramoCoberturaInicial = [];

    if (!isEmpty(ramosIniciales)) {
      ramosIniciales.forEach(ramo => {
        ramo.coberturas.forEach(cobertura => {
          const item = {
            secCobertura: cobertura.secCobertura,
            codRamo: ramo.codigo,
            secRamo: ramo.secRamo,
            secPerdida: ramo.perdida.secPerdida,
            codCobertura: cobertura.codCobertura,
            dscCobertura: cobertura.dscCobertura,
            secCausa: cobertura.causa && cobertura.causa.secCausa,
            codCausa: cobertura.causa && cobertura.causa.codCausa,
            descCausa: cobertura.causa && cobertura.causa.dscCausa,
            secConsecuencia: cobertura.consecuencia && cobertura.consecuencia.secConsecuencia,
            codConsecuencia: cobertura.consecuencia && cobertura.consecuencia.codConsecuencia,
            descConsecuencia: cobertura.consecuencia && cobertura.consecuencia.dscConsecuencia,
            montoAproximadoReclamado: cobertura.montoReserva,
            idCobertura: cobertura.idCobertura,
            tipo: cobertura.tipo,
            key: cobertura.secCobertura
          };
          ramoCoberturaInicial.push(item);
        });
      });
    }

    const ubicacionInicial = get(sinister, 'siniestro.ubicacion', {});

    const listaContactosInicial = get(sinister, 'contactos', {});
    const aseguradoInicial = find(listaContactosInicial, contacto => contacto.tipo === 'A') || {};
    const corredorInicial = find(listaContactosInicial, contacto => contacto.tipo === 'C') || {};
    const preventorInicial = find(listaContactosInicial, contacto => contacto.tipo === 'P') || {};

    const polizaError = tomado && getFieldError('poliza');
    const certificadoError = tomado && getFieldError('certificado');
    const direccionError = tomado && getFieldError('direccion');
    const coberturasError = tomado && getFieldError('coberturas');
    const nombreCompletoError = tomado && getFieldError('nombreCompleto');
    const correoElectronicoError = tomado && getFieldError('correoElectronico');
    const telefonoError = tomado && getFieldError('telefono');
    const nombreCompleto1Error = tomado && getFieldError('nombreCompleto1');
    const correoElectronico1Error = tomado && getFieldError('correoElectronico1');
    const telefono1Error = tomado && getFieldError('telefono1');
    const nombreCompleto2Error = tomado && getFieldError('nombreCompleto2');
    const correoElectronico2Error = tomado && getFieldError('correoElectronico2');
    const telefono2Error = tomado && getFieldError('telefono2');

    const extPolicy = existingPolicy || {};
    const extCertificate = existingCertificate || {};

    return (
      <div>
        <Prompt
          when={isFieldsTouched() && validarCompletarTarea}
          message="Esta seguro de salir? Puede que los cambios que haya realizado no se hayan guardado"
        />
        <Spin spinning={isLoadingSinister}>
          <Form>
            <h1>{tarea}</h1>
            <h3>N&uacute;mero de caso nuevo: {numSiniestro}</h3>
            <h3 className="duplicado-rg-existente">N&uacute;mero de caso existente: {numSiniestroDuplicado}</h3>
            {!tomado && <TakeTaskButton takeTask={this.takeTask} isLoading={isLoadingTakeTask} />}
            <div className="seccion_claims">
              <Row gutter={24}>
                <h2>Datos de p&oacute;liza y certificado</h2>
                <Spin spinning={loadingExistingPolicy}>
                  <Col span={24} style={{ marginBottom: '20px' }}>
                    <Form.Item
                      label="Poliza"
                      required
                      validateStatus={polizaError ? 'error' : ''}
                      help={polizaError || ''}
                    >
                      {getFieldDecorator('poliza', {
                        initialValue: {
                          idePol: polizaInicial.idPoliza,
                          codProd: polizaInicial.codProducto,
                          dscProd: polizaInicial.nomProducto,
                          numPol: polizaInicial.numPoliza,
                          stsPol: polizaInicial.estadoPoliza,
                          nomAseg: polizaInicial.nomAseg,
                          fecIniVig: polizaInicial.fecInicioVigencia,
                          fecFinVig: polizaInicial.fecFinVigencia,
                          detallePoliza: extPolicy
                        },
                        rules: [{ validator: this.checkPoliza }]
                      })(
                        <PolizaFormItem
                          policies={policies}
                          currentTask={currentTask}
                          siniestroInicial={siniestroInicial}
                          form={form}
                        />
                      )}
                    </Form.Item>
                  </Col>
                </Spin>
                <Spin spinning={loadingExistingCertificate}>
                  <Col span={24} style={{ marginBottom: '20px' }}>
                    <Form.Item
                      label="Certificado"
                      required
                      validateStatus={certificadoError ? 'error' : ''}
                      help={certificadoError || ''}
                    >
                      {getFieldDecorator('certificado', {
                        initialValue: {
                          numCert: extCertificate.numCert,
                          dscCert: extCertificate.dscCert,
                          codMonSumAseg: extCertificate.codMonSumAseg,
                          sumAseg: extCertificate.sumAseg,
                          planilla: extCertificate.planilla,
                          prima: extCertificate.prima,
                          aplicacion: extCertificate.aplicacion,
                          stsCert: extCertificate.stsCert,
                          fecIng: extCertificate.fecIng,
                          fecFin: extCertificate.fecFin
                        },
                        rules: [{ validator: this.checkCertificado }]
                      })(
                        <CertificadoFormItem
                          poliza={getFieldValue('poliza')}
                          certificates={certificates}
                          currentTask={currentTask}
                          form={form}
                        />
                      )}
                    </Form.Item>
                  </Col>
                </Spin>
              </Row>
            </div>
            <div className="seccion_claims">
              <h2>Datos del Siniestro</h2>
              <Row gutter={24}>
                <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                  <div className="claims-rrgg-description-list-index-term">Tipo de Siniestro</div>
                  <div className="claims-rrgg-description-list-index-detail">
                    {TIPO_SINIESTRO[siniestroInicial.tipo]}
                  </div>
                  <Info valor={TIPO_SINIESTRO[tipo]} />
                </Col>
                <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                  <Form.Item
                    label="Fecha de ocurrencia"
                    extra={
                      <Info
                        valor={moment(fechaOcurrencia, CONSTANTS_APP.FORMAT_DATE_OUTPUT_CORE).format(
                          CONSTANTS_APP.FORMAT_DATE
                        )}
                      />
                    }
                  >
                    {getFieldDecorator('fechadeocurrencia', {
                      initialValue: siniestroInicial.fechaOcurrencia
                        ? moment(siniestroInicial.fechaOcurrencia, CONSTANTS_APP.FORMAT_DATE_OUTPUT_SYN)
                        : undefined,
                      rules: [{ validator: this.checkFechaOcurrencia }]
                    })(
                      <DatePicker
                        format={CONSTANTS_APP.FORMAT_DATE}
                        disabled={primerRamoMostradoCodigoMod !== COD_RAMO_TRANSPORTE || !tomado}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                  <div className="claims-rrgg-description-list-index-term">Fecha de aviso</div>
                  <div className="claims-rrgg-description-list-index-detail">
                    {moment(siniestroInicial.fechaNotificacion, CONSTANTS_APP.FORMAT_DATE_OUTPUT_CORE).format(
                      CONSTANTS_APP.FORMAT_DATE
                    )}
                  </div>
                  <Info
                    valor={moment(fechaCreacion, CONSTANTS_APP.FORMAT_DATE_OUTPUT_CORE).format(
                      CONSTANTS_APP.FORMAT_DATE
                    )}
                  />
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                  <Form.Item
                    label="Descripcion del siniestro"
                    // validateStatus={descripcionSiniestroError ? 'error' : ''}
                    // help={descripcionSiniestroError || ''}
                    extra={<Info valor={descripcionOcurrencia} />}
                  >
                    {getFieldDecorator('descripcionSiniestro', {
                      initialValue: siniestroInicial.descripcionOcurrencia
                      //   rules: [
                      //     { required: true, message: ValidationMessage.REQUIRED }
                      //   ]
                    })(
                      <Input.TextArea
                        placeholder="Ingrese descripción del siniestro / bienes afectados"
                        maxLength={200}
                        disabled={!tomado}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                  <div className="claims-rrgg-description-list-index-term">Terceros Afectados</div>
                  <div className="claims-rrgg-description-list-index-detail">
                    {this.obtenerValorTercerosAfectados(esCargaMasivaCatastrofico, siniestroInicial.indTercerAfectado)}
                  </div>
                  <Info valor={indTercerAfectado === 'S' ? 'Si' : 'No'} />
                </Col>
                {esCargaMasivaCatastrofico && (
                  <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <div className="claims-rrgg-description-list-index-term">Tipo evento catastrófico</div>
                    <div className="claims-rrgg-description-list-index-detail">
                      {!isEmpty(sinister.siniestro) && sinister.siniestro.tipoEventoCatastrofico}
                    </div>
                  </Col>
                )}
                {siniestroInicial.indCargaMasiva === 'PT' && (
                  <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                    <Form.Item label="Prevención Fraude">
                      {getFieldDecorator('prevencionFraude', {
                        initialValue: siniestroInicial.indPrevencionFraude
                          ? siniestroInicial.indPrevencionFraude
                          : undefined
                      })(
                        <Radio.Group disabled={!tomado}>
                          <Radio value="S">Si</Radio>
                          <Radio value="N">No</Radio>
                        </Radio.Group>
                      )}
                    </Form.Item>
                  </Col>
                )}
              </Row>
            </div>

            <div className="seccion_claims">
              <Row gutter={24}>
                <Col>
                  <h2>Dirección del Siniestro</h2>
                </Col>
                <Col span={24} style={{ marginBottom: '20px' }}>
                  <Form.Item
                    label="Dirección"
                    required
                    validateStatus={direccionError ? 'error' : ''}
                    help={direccionError || ''}
                  >
                    {getFieldDecorator('direccion', {
                      initialValue: {
                        secUbicacion: ubicacionInicial.secUbicacion,
                        ideDirec: ubicacionInicial.idDireccionRiesgo,
                        continente: ubicacionInicial.continente,
                        codPais: ubicacionInicial.pais,
                        codCiudad: ubicacionInicial.codDepartamento,
                        descCiudad: ubicacionInicial.dscDepartamento,
                        codEstado: ubicacionInicial.codProvincia,
                        descEstado: ubicacionInicial.dscProvincia,
                        codMunicipio: ubicacionInicial.codDistrito,
                        descMunicipio: ubicacionInicial.dscDistrito,
                        direc: ubicacionInicial.direccion
                      },
                      rules: [{ validator: this.checkDireccionSiniestro }]
                    })(
                      <DireccionFormItem
                        poliza={getFieldValue('poliza')}
                        currentTask={currentTask}
                        form={form}
                        direccionSiniestroDuplicado={direccionSiniestroDuplicado}
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <div className="seccion_claims">
              <Row gutter={24}>
                <Col>
                  <h2>Datos de Cobertura</h2>
                </Col>
                <Col span={24} style={{ marginBottom: '20px' }}>
                  <Form.Item
                    label="Coberturas"
                    required
                    validateStatus={coberturasError ? 'error' : ''}
                    help={coberturasError || ''}
                  >
                    {getFieldDecorator('coberturas', {
                      initialValue: { coberturas: ramoCoberturaInicial },
                      rules: [{ validator: this.checkCobertura }],
                      onChange: this.handleChangeCobertura
                    })(
                      <CoberturaFormItem
                        esCargaMasivaCatastrofico={esCargaMasivaCatastrofico}
                        esCargaInicial={isLoadingState}
                        poliza={getFieldValue('poliza')}
                        certificado={getFieldValue('certificado')}
                        branches={branches}
                        currentTask={currentTask}
                        form={form}
                        coberturasSiniestroDuplicado={coberturasSiniestroDuplicado}
                        siniestroInicial={siniestroInicial}
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </div>
            {siniestroInicial.indCargaMasiva !== 'PT' && (
              <div className="seccion_claims">
                <Row gutter={24}>
                  <Col>
                    <h2>Datos Adicionales</h2>
                    <h3>Datos de contacto para las notificaciones</h3>
                    <Row gutter={24} align="bottom">
                      <Col
                        xs={24}
                        sm={24}
                        md={24}
                        lg={3}
                        xl={3}
                        style={{
                          textAlign: 'center',
                          fontWeight: 'bold',
                          color: 'rgba(0, 0, 0, 0.85)'
                        }}
                      >
                        <p style={{ marginBottom: '25px' }}>Asegurado</p>
                      </Col>
                      <Col xs={24} sm={24} md={10} lg={7} xl={7}>
                        <Form.Item
                          label="Nombre completo"
                          validateStatus={nombreCompletoError ? 'error' : ''}
                          help={nombreCompletoError || ''}
                        >
                          {getFieldDecorator('nombreCompleto', {
                            initialValue: aseguradoInicial.nombres,
                            rules: [
                              {
                                type: 'string',
                                message: ValidationMessage.NOT_VALID,
                                pattern: /^[^0-9]+$/
                              },
                              {
                                required: true,
                                message: ValidationMessage.REQUIRED
                              }
                            ]
                          })(<Input placeholder="Ingrese nombre" maxLength={1000} disabled={!tomado} />)}
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={24} md={10} lg={7} xl={7}>
                        <Form.Item
                          label="Correo electrónico"
                          validateStatus={correoElectronicoError ? 'error' : ''}
                          help={correoElectronicoError || ''}
                        >
                          {getFieldDecorator('correoElectronico', {
                            initialValue: aseguradoInicial.email,
                            rules: [
                              {
                                type: 'email',
                                message: ValidationMessage.NOT_VALID
                              }
                            ]
                          })(<Input placeholder="Ingrese correo" maxLength={1000} disabled={!tomado} />)}
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={24} md={4} lg={7} xl={7}>
                        <Form.Item
                          label="Teléfono"
                          validateStatus={telefonoError ? 'error' : ''}
                          help={telefonoError || ''}
                        >
                          {getFieldDecorator('telefono', {
                            initialValue: aseguradoInicial.telefono,
                            rules: [
                              {
                                type: 'string',
                                message: ValidationMessage.NOT_VALID,
                                pattern: CONSTANTS_APP.REGEX.TELEFONO
                              },
                              {
                                required: true,
                                message: ValidationMessage.REQUIRED
                              }
                            ]
                          })(<Input placeholder="Ingrese teléfono" maxLength={9} disabled={!tomado} />)}
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={24} align="bottom">
                      <Col
                        xs={24}
                        sm={24}
                        md={24}
                        lg={3}
                        xl={3}
                        style={{
                          textAlign: 'center',
                          fontWeight: 'bold',
                          color: 'rgba(0, 0, 0, 0.85)'
                        }}
                      >
                        <p style={{ marginBottom: '25px' }}>Corredor</p>
                      </Col>
                      <Col xs={24} sm={24} md={10} lg={7} xl={7}>
                        <Form.Item
                          label="Nombre completo"
                          validateStatus={nombreCompleto1Error ? 'error' : ''}
                          help={nombreCompleto1Error || ''}
                        >
                          {getFieldDecorator('nombreCompleto1', {
                            initialValue: corredorInicial.nombres,
                            rules: [
                              {
                                type: 'string',
                                message: ValidationMessage.NOT_VALID,
                                pattern: /^[^0-9]+$/
                              },
                              {
                                required: true,
                                message: ValidationMessage.REQUIRED
                              }
                            ]
                          })(<Input placeholder="Ingrese nombre" maxLength={1000} disabled={!tomado} />)}
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={24} md={10} lg={7} xl={7}>
                        <Form.Item
                          label="Correo electrónico"
                          validateStatus={correoElectronico1Error ? 'error' : ''}
                          help={correoElectronico1Error || ''}
                        >
                          {getFieldDecorator('correoElectronico1', {
                            initialValue: corredorInicial.email,
                            rules: [
                              {
                                type: 'email',
                                message: ValidationMessage.NOT_VALID
                              }
                            ]
                          })(<Input placeholder="Ingrese correo" maxLength={1000} disabled={!tomado} />)}
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={24} md={4} lg={7} xl={7}>
                        <Form.Item
                          label="Teléfono"
                          validateStatus={telefono1Error ? 'error' : ''}
                          help={telefono1Error || ''}
                        >
                          {getFieldDecorator('telefono1', {
                            initialValue: corredorInicial.telefono,
                            rules: [
                              {
                                type: 'string',
                                message: ValidationMessage.NOT_VALID,
                                pattern: CONSTANTS_APP.REGEX.TELEFONO
                              },
                              {
                                required: true,
                                message: ValidationMessage.REQUIRED
                              }
                            ]
                          })(<Input placeholder="Ingrese teléfono" maxLength={9} disabled={!tomado} />)}
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={24} align="bottom">
                      <Col
                        xs={24}
                        sm={24}
                        md={24}
                        lg={3}
                        xl={3}
                        style={{
                          textAlign: 'center',
                          fontWeight: 'bold',
                          color: 'rgba(0, 0, 0, 0.85)'
                        }}
                      >
                        <p style={{ marginBottom: '25px' }}>Preventor</p>
                      </Col>
                      <Col xs={24} sm={24} md={10} lg={7} xl={7}>
                        <Form.Item
                          label="Nombre completo"
                          validateStatus={nombreCompleto2Error ? 'error' : ''}
                          help={nombreCompleto2Error || ''}
                        >
                          {getFieldDecorator('nombreCompleto2', {
                            initialValue: preventorInicial.nombres,
                            rules: [
                              {
                                type: 'string',
                                message: ValidationMessage.NOT_VALID,
                                pattern: /^[^0-9]+$/
                              }
                            ]
                          })(<Input placeholder="Ingrese nombre" maxLength={1000} disabled={!tomado} />)}
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={24} md={10} lg={7} xl={7}>
                        <Form.Item
                          label="Correo electrónico"
                          validateStatus={correoElectronico2Error ? 'error' : ''}
                          help={correoElectronico2Error || ''}
                        >
                          {getFieldDecorator('correoElectronico2', {
                            initialValue: preventorInicial.email,
                            rules: [
                              {
                                type: 'email',
                                message: 'La entrada no es válida'
                              }
                            ]
                          })(<Input placeholder="Ingrese correo" maxLength={100} disabled={!tomado} />)}
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={24} md={4} lg={7} xl={7}>
                        <Form.Item
                          label="Teléfono"
                          validateStatus={telefono2Error ? 'error' : ''}
                          help={telefono2Error || ''}
                        >
                          {getFieldDecorator('telefono2', {
                            initialValue: preventorInicial.telefono,
                            rules: [
                              {
                                type: 'string',
                                message: ValidationMessage.NOT_VALID,
                                pattern: CONSTANTS_APP.REGEX.TELEFONO
                              }
                            ]
                          })(<Input placeholder="Ingrese teléfono" maxLength={9} disabled={!tomado} />)}
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>

                  <Col>
                    <h3> Ajustador</h3>
                  </Col>
                  <Col xs={24} sm={24} md={12} lg={8} xl={10}>
                    <label className="duplicado-ajustador">
                      {!isEmpty(sinister.siniestro) && sinister.siniestro.nombreAjustador}
                    </label>
                  </Col>
                </Row>
              </div>
            )}
            <Row style={{ marginBottom: '20px', paddingBottom: '20px' }}>
              <Col span={24} style={{ textAlign: 'right' }}>
                <Button type="secondary" onClick={this.redirectToTarget}>
                  Cancelar
                  <Icon type="close-circle" />
                </Button>
                <Button type="secondary" style={{ marginLeft: 8 }} onClick={this.saveSinister} disabled={!tomado}>
                  Guardar
                  <Icon type="save" />
                </Button>
                <Button
                  icon="close-circle"
                  onClick={this.showConfirmAnular}
                  style={{ marginLeft: 8 }}
                  disabled={!tomado}
                >
                  Anular
                </Button>

                <Button
                  type="primary"
                  style={{ marginLeft: 8 }}
                  onClick={this.showConfirm}
                  disabled={Utils.hasErrors(getFieldsError()) || !tomado}
                >
                  Completar
                  <Icon type="check-circle" />
                </Button>
              </Col>
            </Row>
          </Form>
          {abrirModalAnular && (
            <Anular
              redirectToHome={this.redirectToHome}
              modalVisibleAnular={abrirModalAnular}
              handleCancel={this.ocultarModalAnular}
              restablecerValores={this.restablecerValores}
              datosSiniestroSeleccionado={{ nrocaso: numSiniestro }}
              history={history}
            />
          )}
        </Spin>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { match } = ownProps;

  const lossTypes = getLossTypes(state);
  const meansOfTransport = getMeansOfTransport(state);
  const lossDetails = getLossDetails(state);
  const eventTypes = getEventTypes(state);
  const sinister = getSinister(state);
  const completeSinister = getCompleteSinister(state);
  const policies = getPolicies(state);
  const certificates = getCertificates(state);
  const branches = getBranches(state);
  const adjusters = getAdjusters(state);
  const currentTask = getCurrentTask(state, match);
  currentTask.duplicado = true;
  const takeTask = getTakeTask(state);
  return {
    sinister,
    completeSinister,
    lossTypes,
    meansOfTransport,
    lossDetails,
    eventTypes,
    policies,
    certificates,
    branches,
    adjusters,
    takeTask,
    currentTask,
    userClaims: state.services.user.userClaims,
    showScroll: state.services.device.scrollActivated,
    rgDuplicado: state.scenes.taskTray.completeTaskInfo.duplicados.consultarRGDuplicado.duplicado,
    rgClaims: getRGClaims(state),
    rgPolizaDuplicada: getPolizaDuplicada(state),
    rgCertificadoDuplicado: getCertificadoDuplicado(state)
  };
};

export default withRouter(connect(mapStateToProps)(Form.create({ name: 'complete_task' })(CompleteTaskInfo)));
