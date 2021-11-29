import React, { Fragment } from 'react';
import { Col, Form, Input, Select, Button, Row, Upload, Icon, Modal } from 'antd';
import { connect } from 'react-redux';
import {
  fetchRegistrarCargaMasiva,
  validacionCargaMasivaIniciado,
  validacionCargaMasivaTerminado
} from 'scenes/CargaMasiva/data/sendCargaMasiva/actions';
import { withRouter } from 'react-router-dom';

import procesarCargaMasiva from 'scenes/CargaMasiva/validaciones/proteccionTarjetas';

import { obtenerIsValidatingCargaMasiva } from 'scenes/CargaMasiva/data/sendCargaMasiva/reducer';

import { isEmpty } from 'lodash';
import sha1 from 'sha1';
import { utils, read } from 'xlsx';
import { fetchRegistrarCatastrofico } from 'scenes/CargaMasiva/data/cargaMasivaCatastrofico/actions';
import { fetchListRamos, fetchListRamosReset } from 'scenes/Administracion/data/listarRamo/action';
import { fetchCoasegurador, fetchCoaseguradorReset } from 'scenes/CargaMasiva/data/coasegurador/action';
import { fetchTipoCarga, fetchTipoCargaReset } from 'scenes/CargaMasiva/data/tipoCarga/action';
import { fetchTipoOperacion, fetchTipoOperacionReset } from 'scenes/CargaMasiva/data/tipoOperacion/action';
import { fetchRegistrarCoaseguro } from 'scenes/CargaMasiva/data/cargaMasivaCoaseguro/actions';
import { obtenerTipoOperacion } from 'scenes/CargaMasiva/data/tipoOperacion/reducer';
import { obtenerTipoCarga } from 'scenes/CargaMasiva/data/tipoCarga/reducer';
import { obtenerCoasegurador } from 'scenes/CargaMasiva/data/coasegurador/reducer';
import { getListRamo } from 'scenes/Administracion/data/listarRamo/reducer';
import { loading as cargandoCatastrofico } from 'scenes/CargaMasiva/data/cargaMasivaCatastrofico/reducer';
import { loading as cargandoCoaseguro } from 'scenes/CargaMasiva/data/cargaMasivaCoaseguro/reducer';
import {
  TIPO_DOCUMENTO_IDENTIDAD,
  TIPO_EVENTO_CATASTROFICO,
  CONSTANTS_APP,
  NUMERO_MES,
  COASEGURO_MONEDA
} from 'constants/index';
import { modalInformacion, modalWarning, showErrorMessage } from 'util/index';
import currency from 'currency.js';
import moment from 'moment';

class CargaMasiva extends React.Component {
  state = {
    file: null,
    document: null,
    textAreaValue: undefined,
    isLoading: false,
    mesAnterior: moment()
      .subtract(1, 'months')
      .month()
  };

  componentDidMount() {
    const { getRamos, getTipoCarga, getTipoOperacion, getCoaseguradores } = this.props;

    getRamos();
    getTipoCarga();
    getTipoOperacion();
    getCoaseguradores();
  }

  componentWillUnmount() {
    const { reset } = this.props;

    reset();
  }

  encargarseDelCambio = () => {
    this.setState({
      textAreaValue: ''
    });
  };

  beforeUpload = chargedFile => {
    this.setState({
      file: chargedFile,
      document: chargedFile.name,
      textAreaValue: ''
    });
    return false;
  };

  limpiarDocumento = () => {
    this.setState({ document: null });
  };

  inicioProceso = () => {
    this.setState({ isLoading: true });
  };

  finProceso = () => {
    this.setState({ isLoading: false });
  };

  asignarErrores = Errores => {
    this.setState({ textAreaValue: Errores });
    this.finProceso();
  };

  validateFile = async () => {
    this.setState({
      textAreaValue: ''
    });

    const {
      form: { getFieldValue }
    } = this.props;

    const MIMEType = [
      'application/wps-office.xlsx',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    const { file } = this.state;

    const paramsCargaMasiva = {
      inicioProceso: this.inicioProceso,
      finProceso: this.finProceso,
      asignarErrores: this.asignarErrores,
      limpiarDocumento: this.limpiarDocumento,
      props: this.props
    };

    const tipoCarga = getFieldValue('tipoCarga');

    if (MIMEType.includes(file.type)) {
      if (tipoCarga === 'PT') {
        this.setState({ isLoading: true });
        await procesarCargaMasiva(file, paramsCargaMasiva);
        this.setState({ isLoading: false });
      } else if (tipoCarga === 'CAT') {
        this.validacionExcelCatastrofico(file);
      } else if (tipoCarga === 'COA') {
        this.validacionExcelCoaseguro(file);
      }
    } else {
      Modal.error({
        content: 'Formato de documento no válido'
      });
    }
  };

  validacionExcelCoaseguro = xls => {
    let json;
    const reader = new FileReader();
    reader.onload = async evt => {
      const bstr = evt.target.result;
      const wb = read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      json = utils.sheet_to_json(ws, { raw: false, defval: '' });
      const headers = utils.sheet_to_json(ws, { header: 1 })[0];

      const {
        form: { getFieldValue }
      } = this.props;

      let excelCorrecto = false;

      const tipo = getFieldValue('tipoOperacion');

      if (tipo === 'R' && headers.length === 10) {
        excelCorrecto = true;
      } else if (tipo === 'P' && headers.length === 14) {
        excelCorrecto = true;
      }

      if (!excelCorrecto) {
        this.setState({
          textAreaValue: `* Mensaje: Excel subido incorrecto para ${tipo === 'P' ? 'Pago' : 'Reserva'}`
        });
        return;
      }

      if (isEmpty(json)) {
        this.setState({
          textAreaValue: '* Mensaje: No existen registros para procesar'
        });
        return;
      }

      this.setState({
        textAreaValue: ''
      });

      let jsonParaEnviar;
      if (tipo === 'R') {
        jsonParaEnviar = this.coasegurosReservas(json, xls);
      } else if (tipo === 'P') {
        jsonParaEnviar = this.coasegurosPagos(json, xls);
      }

      if (jsonParaEnviar) {
        const respuesta = await this.enviarJsonExcelCoaseguro(xls, jsonParaEnviar);

        if (!isEmpty(respuesta)) {
          this.mostrarRespuesta(respuesta);
        }
      }

      this.setState({
        isLoading: false
      });
    };
    reader.readAsBinaryString(xls);
  };

  validacionCoaseguroRamoSeleccionado = jsonCoaseguro => {
    const {
      form: { getFieldValue },
      listaRamos
    } = this.props;

    let ramoElegido = null;
    const errorRamo = [];
    const idRamo = getFieldValue('ramo');

    listaRamos.forEach(({ codRamo, dscRamo }) => {
      if (idRamo === codRamo) {
        ramoElegido = dscRamo;
      }
    });

    let esValido = true;

    jsonCoaseguro.forEach(({ ramo, fila }) => {
      if (ramo !== ramoElegido) {
        esValido = false;
        errorRamo.push({ ramo, fila });
      }
    });

    return {
      esValido,
      errorRamo
    };
  };

  validarMontos = (value = '') => {
    if (value === '') {
      return value;
    }

    const monto = Number(value.replace(/,/g, ''));

    if (!monto && monto !== 0) {
      return value;
    }

    const decimales =
      String(value)
        .trim()
        .split('.')[1] || '';

    if (decimales.length > 2) {
      return String(value).trim();
    }

    return currency(monto).value;
  };

  coasegurosReservas = (json, xls) => {
    if (isEmpty(json)) {
      this.setState({
        textAreaValue: '* Mensaje: No existen registros para procesar'
      });
      return false;
    }

    let jsonFormateado;
    if (!isEmpty(json)) {
      jsonFormateado = json.map((item, i) => ({
        siniestro: String(item.SINIESTRO).trim(),
        poliza: String(item.POLIZA).trim(),
        asegurado: String(item.ASEGURADO).trim(),
        fechaSiniestro: String(item['FECHA SINIESTRO']).trim(),
        causa: String(item.CAUSA).trim(),
        indemnizacion: String(this.validarMontos(item.INDEMNIZACION)),
        porcentaje: String(this.validarMontos(item['%'])),
        participacion: String(this.validarMontos(item.PARTICIPACION)),
        bienAfectado: item['BIEN AFECTADO'],
        ramo: String(item.RAMO).trim(),
        fila: i + 2
      }));
    }

    const errores = [];

    const errorNombreArchivo = this.validarNombreArchivo(xls);

    if (!errorNombreArchivo) {
      errores.push(`Nombre del archivo no válido, supera los 100 carácteres "${xls.name}"`);
    }

    const { esValido, errorRamo } = this.validacionCoaseguroRamoSeleccionado(jsonFormateado);

    if (!esValido) {
      errorRamo.forEach(({ ramo, fila }) => {
        errores.push(
          `* Fila ${fila} => Columna RAMO | Mensaje: El ramo seleccionado para procesar la RESERVA no es el mismo al del archivo "${ramo}"`
        );
      });
    }

    const erroresReserva = this.validacionCoaseguroReservaTodasLasFilas(jsonFormateado);

    if (!isEmpty(erroresReserva)) {
      erroresReserva.forEach(error => {
        errores.push(error);
      });
    }

    if (!isEmpty(errores)) {
      let mensajes = '';

      errores.forEach(error => {
        mensajes += `${error} \n`;
      });

      this.setState({
        textAreaValue: mensajes,
        isLoading: false
      });
      return false;
    }

    const jsonHash = this.agregarHashCoaseguro(jsonFormateado);

    return jsonHash;
  };

  validacionCoaseguroReservaTodasLasFilas = jsonFormateado => {
    const errores = [];
    const fechaActual = moment();
    // const regRamo = /^[A-Za-zñÑáéíóúÁÉÍÓÚ .,"()&]+$/i No se valida porque el Ramo ya se está validando con el que se escoge en la carga(Se obtiene de la base de datos).
    const regCausas = /^[A-Za-zñÑáéíóúÁÉÍÓÚ .,"()&/-]+$/i;
    const regAlfaNumerico = /^[A-Za-zñÑáéíóúÁÉÍÓÚ0-9 -.&/]+$/i;
    const regAsegurado = /^[A-Za-zñÑáéíóúÁÉÍÓÚ0-9 .&]+$/i;
    const regSiniestro = /^[0-9A-Za-zñÑáéíóúÁÉÍÓÚ ._-]+$/i;
    const regPoliza = /^[0-9A-Za-zñÑáéíóúÁÉÍÓÚ _-]+$/i;

    let msg = '';
    jsonFormateado.forEach((item, i) => {
      if (isEmpty(item.siniestro) || !regSiniestro.exec(item.siniestro)) {
        if (isEmpty(item.siniestro)) {
          msg = 'El siniestro no debe ser vacío';
        } else if (!regSiniestro.exec(item.siniestro)) {
          msg = `El siniestro tiene un formato inválido '${item.siniestro}'`;
        }
        errores.push(`* Fila ${i + 2} => Columna SINIESTRO | Mensaje: ${msg}`);
      }
      if (isEmpty(item.poliza) || !regPoliza.exec(item.poliza)) {
        if (isEmpty(item.poliza)) {
          msg = 'La póliza no debe ser vacía';
        } else if (!regPoliza.exec(item.poliza)) {
          msg = `La póliza tiene un formato inválido '${item.poliza}'`;
        }
        errores.push(`* Fila ${i + 2} => Columna POLIZA | Mensaje: ${msg}`);
      }
      if (isEmpty(item.asegurado) || !regAsegurado.exec(item.asegurado)) {
        if (isEmpty(item.asegurado)) {
          msg = 'El asegurado no debe ser vacío';
        } else if (!regAsegurado.exec(item.asegurado)) {
          msg = `El asegurado tiene un formato inválido '${item.asegurado}'`;
        }
        errores.push(`* Fila ${i + 2} => Columna ASEGURADO | Mensaje: ${msg}`);
      }
      if (
        isEmpty(item.fechaSiniestro) ||
        !isEmpty(this.validarFormatoFecha(item.fechaSiniestro)) ||
        moment(item.fechaSiniestro, 'DD-MM-YYYY').isAfter(fechaActual)
      ) {
        if (isEmpty(item.fechaSiniestro)) {
          msg = 'la fecha no debe ser vacía';
        } else if (!isEmpty(this.validarFormatoFecha(item.fechaSiniestro))) {
          msg = `${this.validarFormatoFecha(item.fechaSiniestro)} '${item.fechaSiniestro}'`;
        } else if (moment(item.fechaSiniestro, 'DD-MM-YYYY').isAfter(fechaActual)) {
          msg = `la fecha no puede ser mayor a la actual '${item.fechaSiniestro}'`;
        }
        errores.push(`* Fila ${i + 2} => Columna FECHA SINIESTRO | Mensaje: ${msg}`);
      }
      if (
        isEmpty(item.causa) ||
        item.causa.length < 2 ||
        this.validarCaracteresEspeciales(item.causa) ||
        !regCausas.exec(item.causa.replace(/['"]+/g, ''))
      ) {
        if (isEmpty(item.causa)) {
          msg = 'La causa no debe ser vacía';
        } else if (item.causa.length < 2) {
          msg = `La causa debe tener más de 1 caracter '${item.causa}'`;
        } else if (!regCausas.exec(item.causa.replace(/['"]+/g, '')) || this.validarCaracteresEspeciales(item.causa)) {
          msg = `La causa tiene un formato inválido '${item.causa}'`;
        }
        errores.push(`* Fila ${i + 2} => Columna CAUSA | Mensaje: ${msg}`);
      }
      if (item.indemnizacion === '' || item.indemnizacion === '0' || !isEmpty(this.validarDinero(item.indemnizacion))) {
        if (item.indemnizacion === '') {
          msg = 'La indemnización no debe ser vacía';
        } else if (item.indemnizacion === '0') {
          msg = 'La indemnización no puede ser "0"';
        } else if (!isEmpty(this.validarDinero(item.indemnizacion))) {
          msg = `La indemnización ${this.validarDinero(item.indemnizacion)} '${item.indemnizacion}'`;
        }
        errores.push(`* Fila ${i + 2} => Columna INDEMNIZACION | Mensaje: ${msg}`);
      }
      if (item.participacion === '' || item.participacion === '0' || !isEmpty(this.validarDinero(item.participacion))) {
        if (item.participacion === '') {
          msg = 'La participación no debe ser vacía';
        } else if (item.participacion === '0') {
          msg = 'La participación no puede ser "0"';
        } else if (!isEmpty(this.validarDinero(item.participacion))) {
          msg = `La participación ${this.validarDinero(item.participacion)} '${item.participacion}'`;
        }
        errores.push(`* Fila ${i + 2} => Columna PARTICIPACION | Mensaje: ${msg}`);
      }
      if (item.porcentaje === '' || item.porcentaje === '0' || !isEmpty(this.validarPorcentaje(item.porcentaje))) {
        if (item.porcentaje === '') {
          msg = 'El porcentaje no debe ser vacío';
        } else if (item.porcentaje === '0') {
          msg = 'El porcentaje no puede ser "0"';
        } else if (!isEmpty(this.validarPorcentaje(item.porcentaje))) {
          msg = `El porcentaje ${this.validarPorcentaje(item.porcentaje)} '${item.porcentaje}'`;
        }
        errores.push(`* Fila ${i + 2} => Columna PORCENTAJE | Mensaje: ${msg}`);
      }
      if (!isEmpty(item.bienAfectado) && !regAlfaNumerico.exec(item.bienAfectado)) {
        if (!regAlfaNumerico.exec(item.bienAfectado)) {
          msg = `El bien afectado tiene un formato inválido '${item.bienAfectado}'`;
        }
        errores.push(`* Fila ${i + 2} => Columna BIEN AFECTADO | Mensaje: ${msg}`);
      }
      if (isEmpty(item.ramo)) {
        if (isEmpty(item.ramo)) {
          msg = 'El ramo no debe ser vacío';
        }
        errores.push(`* Fila ${i + 2} => Columna RAMO | Mensaje: ${msg}`);
      }
    });

    return errores;
  };

  validacionCoaseguroReservaDatosRepetidos = array => {
    const errores = [];

    array.forEach(item => {
      const filasRepetidas = [];
      array.forEach((obj, i) => {
        if (
          item.siniestro === obj.siniestro &&
          item.poliza === obj.poliza &&
          item.asegurado === obj.asegurado &&
          item.fechaSiniestro === obj.fechaSiniestro &&
          item.causa === obj.causa
        ) {
          filasRepetidas.push(`"${i + 2}"`);
        }
      });
      if (filasRepetidas.length > 1) {
        errores.push([...filasRepetidas]);
      }
    });

    return errores;
  };

  agregarHashCoaseguro = array => {
    array.forEach(obj => {
      const { siniestro, poliza, asegurado, fechaSiniestro, causa } = obj;
      const hash = sha1(siniestro + poliza + asegurado + fechaSiniestro + causa);
      Object.assign(obj, { hash });
    });
    return array;
  };

  enviarJsonExcelCoaseguro = async (xls, array) => {
    this.setState({
      textAreaValue: ''
    });

    const xlsCodificado = await this.getBase64FromFile(xls);

    const { name, type } = xls;

    const {
      form: { getFieldValue },
      userClaims: { idCore, idCoreGenerico }
    } = this.props;

    const { mesAnterior } = this.state;

    const { valor, descripcion } = JSON.parse(getFieldValue('coasegurador'));

    const mesActual = moment().month() + 1;

    const data = {
      numIdUsr: !idCore ? Number(idCoreGenerico) : Number(idCore),
      coaseguro: array,
      coasegurador: valor,
      nombreCoasegurador: descripcion,
      ramo: getFieldValue('ramo'),
      operacion: getFieldValue('tipoOperacion'),
      mesAnio: `${mesActual === 1 ? moment().year() - 1 : moment().year()}-${mesAnterior + 1}`,
      archivo: {
        coded: xlsCodificado,
        hash: sha1(xlsCodificado),
        nombre: name,
        tipo: type
      }
    };

    const { registrarCoaseguro } = this.props;

    let respuesta;
    try {
      respuesta = await registrarCoaseguro(data);
    } catch {
      showErrorMessage(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
    }

    return respuesta;
  };

  coasegurosPagos = (json, xls) => {
    let jsonFormateado;
    if (!isEmpty(json)) {
      jsonFormateado = json.map((item, i) => ({
        siniestro: String(item.SINIESTRO).trim(),
        poliza: String(item.POLIZA).trim(),
        asegurado: String(item.ASEGURADO).trim(),
        fechaSiniestro: String(item['FECHA SINIESTRO']).trim(),
        causa: String(item.CAUSA).trim(),
        indemnizacion: String(this.validarMontos(item.INDEMNIZACION)),
        honorarios: String(this.validarMontos(item.HONORARIOS)),
        pagos: String(this.validarMontos(item.PAGOS)),
        porcentaje: String(this.validarMontos(item['%'])),
        participacion: String(item.PARTICIPACION)
          .trim()
          .replace(/,/g, ''),
        departamento: String(item['DPTO.']).trim(),
        tipo: String(item.TIPO).trim(),
        ramo: String(item.RAMO).trim(),
        moneda: String(item.MONEDA).trim(),
        fila: i + 2
      }));
    } else {
      this.setState({
        textAreaValue: '* Mensaje: No existen registros para procesar'
      });
    }

    const errores = [];

    const errorNombreArchivo = this.validarNombreArchivo(xls);

    if (!errorNombreArchivo) {
      errores.push(`Nombre del archivo no válido, supera los 100 carácteres "${xls.name}"`);
    }

    const { esValido, errorRamo } = this.validacionCoaseguroRamoSeleccionado(jsonFormateado);

    if (!esValido) {
      errorRamo.forEach(({ ramo, fila }) => {
        errores.push(
          `* Fila ${fila} => Columna RAMO | Mensaje: El ramo seleccionado para procesar PAGOS no es el mismo al del archivo "${ramo}"`
        );
      });
    }

    const erroresPagos = this.validacionCoaseguroPagosTodasLasFilas(jsonFormateado);

    if (!isEmpty(erroresPagos)) {
      erroresPagos.forEach(error => {
        errores.push(error);
      });
    }

    if (!isEmpty(errores)) {
      let mensaje = '';
      errores.forEach(error => {
        mensaje += `${error} \n`;
      });

      this.setState({
        textAreaValue: mensaje,
        isLoading: false
      });
      return false;
    }

    const jsonHash = this.agregarHashCoaseguro(jsonFormateado);

    let nuevoJson;
    const respuesta = jsonHash.map(item => {
      nuevoJson = {};
      if (item.honorarios === '') {
        nuevoJson.honorarios = 0;
      } else if (item.indemnizacion === '') {
        nuevoJson.indemnizacion = 0;
      }
      return {
        ...item,
        ...nuevoJson
      };
    });

    return respuesta;
  };

  validacionCoaseguroPagosTodasLasFilas = json => {
    const errores = [];
    const fechaActual = moment();
    const regLetras = /^[A-Za-z ñÑáéíóúÁÉÍÓÚ]+$/i;
    const regCausas = /^[A-Za-zñÑáéíóúÁÉÍÓÚ .,"()&/-]+$/i;
    // const regRamo = /^[A-Za-z ñÑáéíóúÁÉÍÓÚ.()&"]+$/i Se valida con el Ramo seleccionado en la carga.
    const regAsegurado = /^[A-Za-zñÑáéíóúÁÉÍÓÚ0-9 .&]+$/i;
    // const regAlfaNumerico = /^[A-Za-zñÑáéíóúÁÉÍÓÚ0-9 &./]+$/i
    const regSiniestro = /^[0-9 A-Za-z ñÑáéíóúÁÉÍÓÚ _ .-]+$/;
    const regPoliza = /^[0-9 A-Za-z ñÑáéíóúÁÉÍÓÚ]+$/i;

    let msg = '';
    let existeMonto;
    json.forEach((item, i) => {
      if (isEmpty(item.siniestro) || !regSiniestro.exec(item.siniestro)) {
        if (isEmpty(item.siniestro)) {
          msg = 'El siniestro no debe ser vacío';
        } else if (!regSiniestro.exec(item.siniestro)) {
          msg = `El siniestro tiene un formato inválido '${item.siniestro}'`;
        }
        errores.push(`* Fila ${i + 2} => Columna SINIESTRO | Mensaje: ${msg}`);
      }
      if (isEmpty(item.poliza) || !regPoliza.exec(item.poliza)) {
        if (isEmpty(item.poliza)) {
          msg = 'La póliza no debe ser vacía';
        } else if (!regPoliza.exec(item.poliza)) {
          msg = `La póliza tiene un formato inválido '${item.poliza}'`;
        }
        errores.push(`* Fila ${i + 2} => Columna POLIZA | Mensaje: ${msg}`);
      }
      if (isEmpty(item.asegurado) || !regAsegurado.exec(item.asegurado)) {
        if (isEmpty(item.asegurado)) {
          msg = 'El asegurado no debe ser vacío';
        } else if (!regAsegurado.exec(item.asegurado)) {
          msg = `El asegurado tiene un formato inválido '${item.asegurado}'`;
        }
        errores.push(`* Fila ${i + 2} => Columna ASEGURADO | Mensaje: ${msg}`);
      }
      if (
        isEmpty(item.fechaSiniestro) ||
        moment(item.fechaSiniestro, 'DD-MM-YYYY').isAfter(fechaActual) ||
        !isEmpty(this.validarFormatoFecha(item.fechaSiniestro))
      ) {
        if (isEmpty(item.fechaSiniestro)) {
          msg = 'La fecha no debe ser vacía';
        } else if (moment(item.fechaSiniestro, 'DD-MM-YYYY').isAfter(fechaActual)) {
          msg = `La fecha no puede ser mayor a la actual '${item.fechaSiniestro}'`;
        } else if (!isEmpty(this.validarFormatoFecha(item.fechaSiniestro))) {
          msg = `${this.validarFormatoFecha(item.fechaSiniestro)} '${item.fechaSiniestro}'`;
        }
        errores.push(`* Fila ${i + 2} => Columna FECHA SINIESTRO | Mensaje: ${msg}`);
      }
      if (
        isEmpty(item.causa) ||
        item.causa.length < 2 ||
        this.validarCaracteresEspeciales(item.causa) ||
        !regCausas.exec(item.causa.replace(/['"]+/g, ''))
      ) {
        if (isEmpty(item.causa)) {
          msg = 'La causa no debe ser vacía';
        } else if (item.causa.length < 2) {
          msg = `La causa debe tener más de 1 caracter '${item.causa}'`;
        } else if (!regCausas.exec(item.causa.replace(/['"]+/g, '')) || this.validarCaracteresEspeciales(item.causa)) {
          msg = `La causa tiene un formato inválido '${item.causa}'`;
        }
        errores.push(`* Fila ${i + 2} => Columna CAUSA | Mensaje: ${msg}`);
      }
      existeMonto = true;
      if (
        isEmpty(item.indemnizacion) ||
        item.indemnizacion === '0' ||
        !isEmpty(this.validarDinero(item.indemnizacion, false))
      ) {
        if (isEmpty(item.indemnizacion)) {
          existeMonto = false;
          msg = 'La indemnización no debe ser vacía';
        } else if (item.indemnizacion === '0') {
          existeMonto = false;
          msg = 'La indemnización no puede ser cero';
        } else if (!isEmpty(this.validarDinero(item.indemnizacion, false))) {
          msg = `La indemnización ${this.validarDinero(item.indemnizacion, false)} '${item.indemnizacion}'`;
        }
        if (existeMonto) {
          errores.push(`* Fila ${i + 2} => Columna INDEMNIZACION | Mensaje: ${msg}`);
        }
      }
      if (
        ((isEmpty(item.honorarios) || item.honorarios === '0') && !existeMonto) ||
        !isEmpty(this.validarDinero(item.honorarios))
      ) {
        if ((isEmpty(item.honorarios) || item.honorarios === '0') && !existeMonto) {
          msg = 'El honorario o indemnizacion necesita al menos un monto';
        } else if (!isEmpty(this.validarDinero(item.honorarios))) {
          msg = `El honorario ${this.validarDinero(item.honorarios)} '${item.honorarios}'`;
        }
        errores.push(`* Fila ${i + 2} => Columna HONORARIOS | Mensaje: ${msg}`);
      }
      if (
        item.pagos === '' ||
        !(currency(item.indemnizacion).add(currency(item.honorarios)).value === currency(item.pagos).value) ||
        !isEmpty(this.validarDinero(item.pagos, false))
      ) {
        if (item.pagos === '') {
          msg = `El pago no puede ser vacío`;
        } else if (
          !(currency(item.indemnizacion).add(currency(item.honorarios)).value === currency(item.pagos).value)
        ) {
          msg = `El pago no es igual a la suma de INDEMNIZACIÓN con HONORARIOS '${item.pagos}'`;
        } else if (!isEmpty(this.validarDinero(item.pagos, false))) {
          msg = `El pago ${this.validarDinero(item.pagos, false)} '${item.pagos}'`;
        }
        errores.push(`* Fila ${i + 2} => Columna PAGOS | Mensaje: ${msg}`);
      }
      if (isEmpty(item.porcentaje) || !isEmpty(this.validarPorcentaje(item.porcentaje))) {
        if (isEmpty(item.porcentaje)) {
          msg = 'El porcentaje no debe ser vacío';
        } else if (!isEmpty(this.validarPorcentaje(item.porcentaje))) {
          msg = `El porcentaje ${this.validarPorcentaje(item.porcentaje)} '${item.porcentaje}'`;
        }
        errores.push(`* Fila ${i + 2} => Columna PORCENTAJE | Mensaje: ${msg}`);
      }
      if (
        isEmpty(item.participacion) ||
        item.participacion === '0' ||
        !isEmpty(this.validarDinero(item.participacion, false)) ||
        (Number(item.indemnizacion) < 0 && Number(item.participacion) > 0)
      ) {
        if (isEmpty(item.participacion)) {
          msg = 'La participación no debe ser vacía';
        } else if (item.participacion === '0') {
          msg = 'La participación no puede ser "0"';
        } else if (!isEmpty(this.validarDinero(item.participacion, false))) {
          msg = `La participación ${this.validarDinero(item.participacion, false)} '${item.participacion}'`;
        } else if (Number(item.indemnizacion) < 0 && Number(item.participacion) > 0) {
          msg = 'La participación debe ser negativa para acreencias';
        }
        errores.push(`* Fila ${i + 2} => Columna PARTICIPACION | Mensaje: ${msg}`);
      }
      if (isEmpty(item.departamento) || !regLetras.exec(item.departamento)) {
        if (isEmpty(item.departamento)) {
          msg = 'El departamento no debe ser vacío';
        } else if (!regLetras.exec(item.departamento)) {
          msg = `El departamento solo puede contener letras '${item.departamento}'`;
        }
        errores.push(`* Fila ${i + 2} => Columna DEPARTAMENTO | Mensaje: ${msg}`);
      }
      if (!isEmpty(item.tipo) && (!['T', 'P'].includes(item.tipo) || item.tipo.length !== 1)) {
        if (!['T', 'P'].includes(item.tipo)) {
          msg = `El tipo solo puede contener las letras P o T '${item.tipo}'`;
        } else if (item.tipo.length !== 1) {
          msg = `El tipo solo puede contener una letra '${item.tipo}'`;
        }
        errores.push(`* Fila ${i + 2} => Columna TIPO | Mensaje: ${msg}`);
      }
      if (isEmpty(item.ramo)) {
        if (isEmpty(item.ramo)) {
          msg = 'El ramo no debe ser vacío';
        }
        errores.push(`* Fila ${i + 2} => Columna RAMO | Mensaje: ${msg}`);
      }
      if (isEmpty(item.moneda) || !Object.values(COASEGURO_MONEDA).includes(item.moneda)) {
        if (isEmpty(item.moneda)) {
          msg = 'La moneda no debe ser vacía';
        } else if (!Object.values(COASEGURO_MONEDA).includes(item.moneda)) {
          msg = `La moneda no es correcta, USD o SOL '${item.moneda}'`;
        }
        errores.push(`* Fila ${i + 2} => Columna MONEDA | Mensaje: ${msg}`);
      }
    });

    return errores;
  };

  validacionExcelCatastrofico = xls => {
    let json;
    const reader = new FileReader();
    reader.onload = async evt => {
      const bstr = evt.target.result;
      const wb = read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      json = utils.sheet_to_json(ws, { raw: false, defval: '' });

      if (isEmpty(json)) {
        this.setState({
          textAreaValue: '* Mensaje: No existen registros para procesar'
        });
        return;
      }

      if (!isEmpty(json)) {
        const jsonFormateado = json.map((item, i) => ({
          tipoDocumento: String(item['TIPO DOC.']).trim(),
          documento: String(item['NRO. DOC']).trim(),
          nombreAsegurado: String(item['NOMBRE ASEGURADO']).trim(),
          correoAsegurado: String(item['EMAIL ASEGURADO']).trim(),
          telefonoAsegurado: String(item['TELEFONO ASEGURADO']).trim(),
          departamento: String(item.DEPARTAMENTO).trim(),
          provincia: String(item.PROVINCIA).trim(),
          distrito: String(item.DISTRITO).trim(),
          direccion: String(item.DIRECCION).trim(),
          fechaOcurrencia: isEmpty(item['FECHA OCURRENCIA'])
            ? ''
            : moment(String(item['FECHA OCURRENCIA']).trim()).format('DD/MM/YYYY'),
          ajustador: String(item.AJUSTADOR).trim(),
          tipoEventoCatastrofico: String(item['TIPO EVENTO CATASTROFICO']).trim(),
          nombreCorredor: String(item['NOMBRE CORREDOR']).trim(),
          correoCorredor: String(item['EMAIL CORREDOR']).trim(),
          telefonoCorredor: String(item['TELEFONO CORREDOR']).trim(),
          poliza: String(item.POLIZA).trim(),
          certificado: String(item.CERTIFICADO).trim(),
          fila: i + 2
        }));

        const errorTipoDoc = this.validacionCatastroficoTipoDocumento(jsonFormateado);
        const errorFilas = this.validacionCatastroficoTodasLasFilas(jsonFormateado);
        const errores = [errorTipoDoc, errorFilas].flat();

        const arregloErrores = [];

        const errorNombreArchivo = this.validarNombreArchivo(xls);

        if (!errorNombreArchivo) {
          arregloErrores.push(`Nombre del archivo no válido, supera los 100 carácteres "${xls.name}"`);
        }

        if (!isEmpty(errores)) {
          errores.forEach(esquema => {
            arregloErrores.push(`${esquema}`);
          });
        }

        const arrayFilasRepetidas = this.validacionCatastroficoDatosRepetidos(jsonFormateado);

        if (!isEmpty(arrayFilasRepetidas)) {
          const arrayErrores = [];
          arrayFilasRepetidas.forEach(error => {
            arrayErrores.push(`* Filas: [${Array.from(error)}] => Mensaje: Filas duplicadas`);
          });

          const erroresNoDuplicados = [...new Set(arrayErrores)];
          erroresNoDuplicados.forEach(esquema => {
            arregloErrores.push(`${esquema}`);
          });
        }

        let mensajes = '';

        if (!isEmpty(arregloErrores)) {
          arregloErrores.forEach(e => {
            mensajes += `${e} \n`;
          });

          this.setState({
            textAreaValue: mensajes,
            isLoading: false
          });
          return;
        }

        const jsonConHash = this.agregarHashCatastrofico(jsonFormateado);

        const respuesta = await this.enviarJsonCatastrofico(xls, jsonConHash);

        this.mostrarRespuesta(respuesta);

        this.setState({
          isLoading: false
        });
      } else {
        this.setState({
          textAreaValue: '* Mensaje: No existen registros para procesar'
        });
      }
    };
    reader.readAsBinaryString(xls);
  };

  getBase64FromFile = file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = error => reject(error);
    });
  };

  enviarJsonCatastrofico = async (xls, array) => {
    this.setState({
      textAreaValue: ''
    });

    const { name, type } = xls;

    const xlsCodificado = await this.getBase64FromFile(xls);

    const data = {
      catastrofico: array,
      archivo: {
        coded: xlsCodificado,
        hash: sha1(xlsCodificado),
        nombre: name,
        tipo: type
      }
    };

    const { registrarCatastrofico } = this.props;

    let respuesta;
    try {
      respuesta = await registrarCatastrofico(data);
    } catch {
      showErrorMessage(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
    }

    return respuesta;
  };

  mostrarRespuesta = ({ statusCode, data }) => {
    const { history } = this.props;

    let objModal;
    let mensaje;
    const ids = [];
    switch (statusCode) {
      case 'CRG-000':
        objModal = {
          cb: () => history.push('/'),
          content: 'La carga masiva se procesará a la hora programada',
          title: 'Carga masiva programada'
        };

        modalInformacion(objModal);
        break;
      case 'CRG-201':
        this.setState({
          textAreaValue: `Archivo cargado previamente en la fecha: ${moment(data)
            .utcOffset(0)
            .format('YYYY/MM/DD HH:mm:ss')}`
        });
        break;
      case 'CRG-202':
        mensaje = '';
        data.forEach(({ fila, fecha }) => {
          if (!ids.includes(fila)) {
            mensaje += `* Fila: ${fila} => ya registrada previamente en la fecha: ${moment(fecha)
              .utcOffset(0)
              .format('YYYY/MM/DD HH:mm:ss')} \n`;
            ids.push(fila);
          }
        });
        this.setState({
          textAreaValue: mensaje
        });
        break;
      default:
        objModal = {
          content: 'Error al realizar la carga masiva',
          title: 'Error carga masiva'
        };

        modalWarning(objModal);
        break;
    }
  };

  validacionCatastroficoTodasLasFilas = json => {
    const errores = [];
    const fechaActual = moment();
    const EVENTOS = Object.values(TIPO_EVENTO_CATASTROFICO);
    const regAsegurado = /^[A-Za-z ñÑáéíóúÁÉÍÓÚ ,.&]+$/i;
    const regEmail = /^(([^<>()[\]\\.,:\s@"]+(\.[^<>()[\]\\.,:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const regNumeros = /^[0-9]+$/;

    let msg = '';
    json.forEach(
      (
        {
          nombreAsegurado,
          correoAsegurado,
          telefonoAsegurado,
          departamento,
          provincia,
          distrito,
          direccion,
          fechaOcurrencia,
          ajustador,
          tipoEventoCatastrofico,
          nombreCorredor,
          correoCorredor,
          telefonoCorredor,
          poliza,
          certificado
        },
        i
      ) => {
        if (
          isEmpty(nombreAsegurado) ||
          !regAsegurado.exec(nombreAsegurado) ||
          this.validarSiIniciaConUnNumero(nombreAsegurado)
        ) {
          if (isEmpty(nombreAsegurado)) {
            msg = 'No puede ser vacío';
          } else if (!regAsegurado.exec(nombreAsegurado)) {
            msg = `El nombre asegurado no tiene formato correcto '${nombreAsegurado}'`;
          } else if (this.validarSiIniciaConUnNumero(nombreAsegurado)) {
            msg = `El nombre asegurado ${this.validarSiIniciaConUnNumero(nombreAsegurado)} '${nombreAsegurado}'`;
          }
          errores.push(`* Fila: ${i + 2} => Columna NOMBRE ASEGURADO | Mensaje: ${msg}`);
        }
        if (correoAsegurado && !regEmail.exec(correoAsegurado)) {
          if (isEmpty(correoAsegurado)) {
            msg = 'No puede ser vacío';
          } else if (!regEmail.exec(correoAsegurado)) {
            msg = `El email asegurado no tiene formato correcto '${correoAsegurado}'`;
          }
          errores.push(`* Fila: ${i + 2} => Columna EMAIL ASEGURADO | Mensaje: ${msg}`);
        }
        if (isEmpty(telefonoAsegurado) || !regNumeros.exec(telefonoAsegurado) || telefonoAsegurado.length > 9) {
          if (isEmpty(telefonoAsegurado)) {
            msg = 'No puede ser vacío';
          } else if (!regNumeros.exec(telefonoAsegurado)) {
            msg = `El teléfono asegurado solo puede ser numérico '${telefonoAsegurado}'`;
          } else if (telefonoAsegurado.length > 9) {
            msg = `El teléfono asegurado no puede tener más de 9 dígitos '${telefonoAsegurado}'`;
          }
          errores.push(`* Fila: ${i + 2} => Columna TELEFONO ASEGURADO | Mensaje: ${msg}`);
        }
        if (isEmpty(departamento) || this.validarSiIniciaConUnNumero(departamento)) {
          if (isEmpty(departamento)) {
            msg = 'No puede ser vacío';
          } else if (this.validarSiIniciaConUnNumero(departamento)) {
            msg = `El departamento ${this.validarSiIniciaConUnNumero(departamento)} '${departamento}'`;
          }
          errores.push(`* Fila: ${i + 2} => Columna DEPARTAMENTO | Mensaje: ${msg}`);
        }
        if (!isEmpty(provincia) && this.validarSiIniciaConUnNumero(provincia)) {
          if (this.validarSiIniciaConUnNumero(provincia)) {
            msg = `La provincia ${this.validarSiIniciaConUnNumero(provincia)} '${provincia}'`;
          }
          errores.push(`* Fila: ${i + 2} => Columna PROVINCIA | Mensaje: ${msg}`);
        }
        if (!isEmpty(distrito) && this.validarSiIniciaConUnNumero(distrito)) {
          if (this.validarSiIniciaConUnNumero(distrito)) {
            msg = `El distrito ${this.validarSiIniciaConUnNumero(distrito)} '${distrito}'`;
          }
          errores.push(`* Fila: ${i + 2} => Columna DISTRITO | Mensaje: ${msg}`);
        }
        if (isEmpty(direccion) || this.validarSiIniciaConUnNumero(direccion)) {
          if (isEmpty(direccion)) {
            msg = 'No puede ser vacía';
          } else if (this.validarSiIniciaConUnNumero(direccion)) {
            msg = `La dirección ${this.validarSiIniciaConUnNumero(direccion)} '${direccion}'`;
          }
          errores.push(`* Fila: ${i + 2} => Columna DIRECCION| Mensaje: ${msg}`);
        }
        if (
          isEmpty(fechaOcurrencia) ||
          moment(fechaOcurrencia) > fechaActual ||
          !isEmpty(this.validarFormatoFecha(fechaOcurrencia))
        ) {
          if (isEmpty(fechaOcurrencia)) {
            msg = 'No puede ser vacía';
          } else if (moment(fechaOcurrencia) > fechaActual) {
            msg = `La fecha ocurrencia puede ser mayor a la actual '${fechaOcurrencia}'`;
          } else if (!isEmpty(this.validarFormatoFecha(fechaOcurrencia))) {
            msg = `${this.validarFormatoFecha(fechaOcurrencia)} '${fechaOcurrencia}'`;
          }
          errores.push(`* Fila: ${i + 2} => Columna FECHA OCURRENCIA | Mensaje: ${msg}`);
        }
        if (isEmpty(ajustador) || this.validarSiIniciaConUnNumero(ajustador)) {
          if (isEmpty(ajustador)) {
            msg = 'No puede ser vacío';
          } else if (this.validarSiIniciaConUnNumero(ajustador)) {
            msg = `El ajustador ${this.validarSiIniciaConUnNumero(ajustador)} '${ajustador}'`;
          }
          errores.push(`* Fila: ${i + 2} => Columna AJUSTADOR | Mensaje: ${msg}`);
        }
        if (isEmpty(tipoEventoCatastrofico) || !EVENTOS.includes(tipoEventoCatastrofico)) {
          if (isEmpty(tipoEventoCatastrofico)) {
            msg = 'No debe ser vacío';
          } else if (!EVENTOS.includes(tipoEventoCatastrofico)) {
            msg = `El tipo evento catastrófico solo puede ser TERREMOTO - INCENDIO - LLUVIA Y/O INUNDACION '${tipoEventoCatastrofico}'`;
          }
          errores.push(`* Fila: ${i + 2} => Columna TIPO EVENTO CATASTROFICO | Mensaje: ${msg}`);
        }
        if (
          !isEmpty(nombreCorredor) &&
          (this.validarSiIniciaConUnNumero(nombreCorredor) || !regAsegurado.exec(nombreCorredor))
        ) {
          if (!regAsegurado.exec(nombreCorredor)) {
            msg = `El nombre corredor no tiene formato correcto '${nombreCorredor}'`;
          } else if (this.validarSiIniciaConUnNumero(nombreCorredor)) {
            msg = `El nombre corredor ${this.validarSiIniciaConUnNumero(nombreCorredor)} '${nombreCorredor}'`;
          }
          errores.push(`* Fila: ${i + 2} => Columna NOMBRE CORREDOR | Mensaje: ${msg}`);
        }
        if (!isEmpty(correoCorredor) && !regEmail.exec(correoCorredor)) {
          errores.push(
            `* Fila: ${i + 2} => Columna EMAIL CORREDOR | Mensaje: No tiene un formato válido '${correoCorredor}'`
          );
        }
        if (
          !isEmpty(telefonoCorredor) &&
          (!regNumeros.exec(telefonoCorredor) ||
            (telefonoCorredor.length > 9 || telefonoCorredor.length < 9) ||
            telefonoCorredor === '123456789' ||
            telefonoCorredor === '987654321')
        ) {
          if (!regNumeros.exec(telefonoCorredor)) {
            msg = `El teléfono corredor solo debe contener números '${telefonoCorredor}'`;
          } else if (telefonoCorredor.length > 9 || telefonoCorredor.length < 9) {
            msg = `El teléfono corredor solo puede tener 9 dígitos '${telefonoCorredor}'`;
          } else if (telefonoCorredor === '123456789' || telefonoCorredor === '987654321') {
            msg = `El teléfono corredor no pueden ser número consecutivos '${telefonoCorredor}'`;
          }
          errores.push(`* Fila: ${i + 2} => Columna TELEFONO CORREDOR | Mensaje: ${msg}`);
        }
        if (!isEmpty(poliza) && (!regNumeros.exec(poliza) || poliza.length < 4)) {
          if (!regNumeros.exec(poliza)) {
            msg = `La póliza solo debe contener números '${poliza}'`;
          } else if (poliza.length < 4) {
            msg = `La póliza debe tener mínimo 4 números '${poliza}'`;
          }
          errores.push(`* Fila: ${i + 2} => Columna POLIZA | Mensaje: ${msg}`);
        }
        if (!isEmpty(certificado) && (!regNumeros.exec(certificado) || Number(certificado) < 1)) {
          if (!regNumeros.exec(certificado)) {
            msg = `El certificado solo debe contener números '${certificado}'`;
          } else if (certificado.length === 1) {
            msg = `El certificado debe tener mínimo un dígito '${certificado}'`;
          }
          errores.push(`* Fila: ${i + 2} => Columna CERTIFICADO | Mensaje: ${msg}`);
        }
      }
    );

    return errores;
  };

  validacionCatastroficoTipoDocumento = json => {
    const { RUC, DNI, CE } = TIPO_DOCUMENTO_IDENTIDAD;
    const errores = [];
    const regCE = /^[A-Za-z 0-9]+$/i;

    let msg = '';
    json.forEach(({ tipoDocumento, documento }, i) => {
      switch (tipoDocumento) {
        case RUC:
          if (documento.length !== 11 || !Number(documento)) {
            if (documento.length !== 11) {
              msg = 'No cumple con la cantidad de dígitos [ RUC:11 ]';
            } else if (!Number(documento)) {
              msg = 'Debe ser numérico';
            }
            errores.push(`* Fila: ${i + 2} => Columna NRO.DOC | Mensaje: ${msg} '${documento}'`);
          }
          break;
        case DNI:
          if (documento.length !== 8 || !Number(documento)) {
            if (documento.length !== 8) {
              msg = 'No cumple con la cantidad de dígitos [ DNI:8 ]';
            } else if (!Number(documento)) {
              msg = 'Debe ser numérico';
            }
            errores.push(`* Fila: ${i + 2} => Columna NRO.DOC | Mensaje: ${msg} '${documento}'`);
          }
          break;
        case CE:
          if (documento.length !== 12 || !regCE.exec(documento)) {
            if (documento.length !== 12) {
              msg = 'No cumple con la cantidad de dígitos [ CE:12 ]';
            } else if (!regCE.exec(documento)) {
              msg = 'Debe ser alfanumérico';
            }
            errores.push(`* Fila: ${i + 2} => Columna NRO.DOC | Mensaje: ${msg} '${documento}'`);
          }
          break;
        default:
          errores.push(`* Fila: ${i + 2} => Columna NRO.DOC | Mensaje: no es un tipo de documento aceptado`);
          break;
      }
    });

    return errores;
  };

  agregarHashCatastrofico = array => {
    array.forEach(obj => {
      const {
        tipoDocumento,
        documento,
        departamento,
        provincia,
        distrito,
        fechaOcurrencia,
        tipoEventoCatastrofico
      } = obj;
      const hash = sha1(
        tipoDocumento + documento + departamento + provincia + distrito + fechaOcurrencia + tipoEventoCatastrofico
      );
      Object.assign(obj, { hash });
    });
    return array;
  };

  validacionCatastroficoDatosRepetidos = array => {
    const errores = [];

    array.forEach(item => {
      const filasRepetidas = [];
      array.forEach((obj, i) => {
        if (
          item.tipoDocumento === obj.tipoDocumento &&
          item.documento === obj.documento &&
          item.departamento === obj.departamento &&
          item.provincia === obj.provincia &&
          item.distrito === obj.distrito &&
          item.fechaOcurrencia === obj.fechaOcurrencia &&
          item.tipoEventoCatastrofico === obj.tipoEventoCatastrofico
        ) {
          filasRepetidas.push(`"${i + 2}"`);
        }
      });
      if (filasRepetidas.length > 1) {
        errores.push([...filasRepetidas]);
      }
    });

    return errores;
  };

  validarSiIniciaConUnNumero = texto => {
    if (Number(texto.charAt(0))) {
      return 'no tiene el formato correcto';
    }
    return false;
  };

  cancelarHandler = () => {
    const { history } = this.props;
    history.push('/');
  };

  validarFormatoFecha = fecha => {
    const regFecha = /^\d{1,2}\/\d{1,2}\/\d{4}$/;

    const anio = Number(fecha.split('/')[2]);
    const mes = Number(fecha.split('/')[1]);
    const dia = Number(fecha.split('/')[0]);

    const diasDelMes = new Date(anio, mes, 0).getDate();

    let msg = '';
    if (!fecha.match(regFecha)) {
      msg = 'Formado de fecha inválida, ejemplo: 01/07/2019';
    } else if (mes > 12 || mes < 1) {
      msg = 'Mes de la fecha fuera de rango';
    } else if (dia < 1 || dia > diasDelMes) {
      msg = 'Dia de la fecha fuera de rango';
    }

    return msg;
  };

  validarDinero = (numero, condicion = true) => {
    let esNumero = '';
    if (!Number(numero) && Number(numero) !== 0) {
      esNumero = 'debe tener solo números';
    }

    if (condicion) {
      if (Number(numero) < 0) {
        esNumero = 'no debe ser menor a 0';
      }
    }

    const numeroSplit = String(numero).split('.');
    const decimales = numeroSplit[1] || '';
    if (decimales.length > 2) {
      esNumero = 'no debe tener más de 2 decimales';
    }

    return esNumero;
  };

  validarPorcentaje = porcentaje => {
    const numero = porcentaje;
    const decimales = String(numero).split('.')[1] || '';
    let msg = '';

    if (!Number(numero)) {
      msg = 'solo puede contener números';
    } else if (Number(numero) > 100 || Number(numero) < 0) {
      msg = 'no puede ser mayor a 100 ni menor a 0';
    } else if (decimales.length > 2) {
      msg = 'no puede tener más de 2 decimales';
    }

    return msg;
  };

  validarNombreArchivo = ({ name }) => {
    let esValido = true;
    if (name.length > 100) {
      esValido = false;
    }
    return esValido;
  };

  encargarseTipoCarga = () => {
    const {
      form: { setFieldsValue }
    } = this.props;

    this.setState({
      document: null,
      textAreaValue: ''
    });

    setTimeout(() => {
      setFieldsValue({
        coasegurador: undefined,
        tipoOperacion: undefined,
        ramo: undefined
      });
    }, 1);
  };

  mostrarMesAnterior = () => {
    const { mesAnterior } = this.state;

    let mes;
    if (mesAnterior === -1) {
      mes = 11;
    } else {
      mes = mesAnterior;
    }

    let nombreMesAnterior;
    Object.keys(NUMERO_MES).forEach(i => {
      if (i === String(mes)) {
        nombreMesAnterior = NUMERO_MES[i];
      }
    });

    return nombreMesAnterior;
  };

  validarCaracteresEspeciales = causa => {
    const caracteresEspeciales = ['#', '(', ')', '-', '_', '&', '/', "'", '?', '.', ',', '@', ';', '{', '}'];
    let contador = 0;
    let condicion = false;
    const letras = causa.substring(0, 2).split('');
    letras.forEach(letra => {
      condicion = caracteresEspeciales.includes(letra);
      if (condicion) {
        contador += 1;
      }
    });

    if (contador === 2) {
      return true;
    }

    return false;
  };

  validarProcesar = () => {
    const {
      form: { getFieldValue }
    } = this.props;

    const { document } = this.state;

    let desabilitar = true;
    if (
      getFieldValue('tipoCarga') === 'COA' &&
      getFieldValue('coasegurador') &&
      getFieldValue('tipoOperacion') &&
      getFieldValue('ramo') &&
      document
    ) {
      desabilitar = false;
    } else if (document && (getFieldValue('tipoCarga') === 'PT' || getFieldValue('tipoCarga') === 'CAT')) {
      desabilitar = false;
    }

    return desabilitar;
  };

  render() {
    const { document, isLoading, textAreaValue } = this.state;

    const {
      isValidatingPT,
      form: { getFieldDecorator, getFieldValue },
      loadingCatastrofico,
      loadingCoaseguro,
      listaRamos,
      listaTipoCarga,
      listaCoaseguradores,
      listaTipoOperacion,
      loadingListaRamos,
      loadingListaCoaseguradores,
      loadingListaTipoCarga,
      loadingListaTipoOperacion
    } = this.props;

    const { Option } = Select;
    const documento = getFieldValue('tipoCarga');

    let optionRamos;
    if (!isEmpty(listaRamos)) {
      optionRamos = listaRamos.map(({ codRamo, dscRamo }) => (
        <Option key={codRamo} value={codRamo}>
          {dscRamo}
        </Option>
      ));
    }

    let optionTipoCarga;
    if (!isEmpty(listaTipoCarga)) {
      optionTipoCarga = listaTipoCarga.map(({ descripcion, valor }) => (
        <Option key={valor} value={valor}>
          {descripcion}
        </Option>
      ));
    }

    let optionTipoOperacion;
    if (!isEmpty(listaTipoOperacion)) {
      optionTipoOperacion = listaTipoOperacion.map(({ descripcion, valor }) => (
        <Option key={valor} value={valor}>
          {descripcion}
        </Option>
      ));
    }

    let optionCoasegurador;
    if (!isEmpty(listaCoaseguradores)) {
      optionCoasegurador = listaCoaseguradores.map(coasegurador => (
        <Option key={coasegurador.valor} value={JSON.stringify(coasegurador)}>
          {coasegurador.descripcion}
        </Option>
      ));
    }

    return (
      <React.Fragment>
        <h1>Carga masiva</h1>
        <form className="seccion_claims">
          <Row gutter={24}>
            <Col xs={24} sm={12} md={12} lg={12} xl={8}>
              <Form.Item label="Tipo carga" required>
                {getFieldDecorator('tipoCarga')(
                  <Select
                    placeholder="Seleccione tipo carga"
                    loading={loadingListaTipoCarga}
                    onChange={this.encargarseTipoCarga}
                  >
                    {optionTipoCarga}
                  </Select>
                )}
              </Form.Item>
            </Col>
            {documento === 'COA' && (
              <Fragment>
                <Col xs={24} sm={12} md={12} lg={12} xl={8}>
                  <Form.Item label="Coasegurador" required>
                    {getFieldDecorator('coasegurador')(
                      <Select
                        placeholder="Seleccione tipo carga"
                        loading={loadingListaCoaseguradores}
                        onChange={this.encargarseDelCambio}
                      >
                        {optionCoasegurador}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={12} xl={8}>
                  <Form.Item label="Tipo operaci&#243;n" required>
                    {getFieldDecorator('tipoOperacion')(
                      <Select
                        placeholder="Seleccione tipo carga"
                        loading={loadingListaTipoOperacion}
                        onChange={this.encargarseDelCambio}
                      >
                        {optionTipoOperacion}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={12} xl={8}>
                  <Form.Item label="Mes carga" required>
                    {getFieldDecorator('mesCarga')(<span>{this.mostrarMesAnterior()}</span>)}
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={12} xl={8}>
                  <Form.Item label="Ramo" required>
                    {getFieldDecorator('ramo')(
                      <Select
                        placeholder="Seleccione tipo carga"
                        loading={loadingListaRamos}
                        onChange={this.encargarseDelCambio}
                        showSearch
                        filterOption={(input, option) =>
                          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {optionRamos}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
              </Fragment>
            )}
            <Col xs={24} sm={12} md={12} lg={12} xl={12}>
              <Form.Item label="Seleccione archivo">
                <Row gutter={8}>
                  <Col xs={18} sm={18} md={18} lg={18} xl={18}>
                    <Input placeholder="Seleccione archivo excel" value={document} disabled />
                  </Col>
                  <Col xs={6} sm={6} md={6} lg={6} xl={6}>
                    <Upload
                      beforeUpload={this.beforeUpload}
                      multiple={false}
                      accept=".xlsx, .xlsm, .xlsb, .xltx, .xltm, .xls, .xlt, .xlam, .xla, .xlw, .xlr"
                      showUploadList={false}
                    >
                      <Button type="primary" disabled={!documento}>
                        Documento <Icon type="file-excel" style={{ fontSize: '17px' }} />
                      </Button>
                    </Upload>
                  </Col>
                </Row>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={24} style={{ textAlign: 'right' }}>
              <Form.Item label=" " colon={false}>
                <Button
                  disabled={
                    isLoading || isValidatingPT || loadingCatastrofico || loadingCoaseguro || this.validarProcesar()
                  }
                  onClick={this.validateFile}
                  loading={isLoading || isValidatingPT || loadingCatastrofico || loadingCoaseguro}
                  type="primary"
                >
                  Procesar <Icon type="upload" style={{ fontSize: '17px' }} />
                </Button>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Form.Item label="Observaci&oacute;n(es)">
                <Input.TextArea
                  placeholder="Observaci&oacute;n(es) de error(es) en el archivo excel. "
                  value={textAreaValue || ''}
                  disabled={false}
                  autosize={{ minRows: 3, maxRows: 10 }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={24} style={{ textAlign: 'right', marginBottom: '10px' }}>
              <Button onClick={this.cancelarHandler}>
                Cancelar <Icon type="close-circle" style={{ fontSize: '17px' }} />{' '}
              </Button>
            </Col>
          </Row>
        </form>
      </React.Fragment>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  registrarCargaMasiva: json => dispatch(fetchRegistrarCargaMasiva(json)),
  validacionIniciado: json => dispatch(validacionCargaMasivaIniciado(json)),
  validacionTerminado: json => dispatch(validacionCargaMasivaTerminado(json)),
  registrarCatastrofico: json => dispatch(fetchRegistrarCatastrofico(json)),
  getRamos: () => dispatch(fetchListRamos()),
  getCoaseguradores: () => dispatch(fetchCoasegurador()),
  getTipoCarga: () => dispatch(fetchTipoCarga()),
  getTipoOperacion: () => dispatch(fetchTipoOperacion()),
  registrarCoaseguro: json => dispatch(fetchRegistrarCoaseguro(json)),
  reset: () => {
    dispatch(fetchListRamosReset());
    dispatch(fetchCoaseguradorReset());
    dispatch(fetchTipoCargaReset());
    dispatch(fetchTipoOperacionReset());
  }
});

const mapStateToProps = state => ({
  loadingCatastrofico: cargandoCatastrofico(state),
  loadingCoaseguro: cargandoCoaseguro(state),

  listaRamos: getListRamo(state).listarRamo,
  loadingListaRamos: getListRamo(state).isLoading,

  listaTipoOperacion: obtenerTipoOperacion(state).tipoOperacion,
  loadingListaTipoOperacion: obtenerTipoOperacion(state).isLoading,

  listaTipoCarga: obtenerTipoCarga(state).tipoCarga,
  loadingListaTipoCarga: obtenerTipoCarga(state).isLoading,

  listaCoaseguradores: obtenerCoasegurador(state).coasegurador,
  loadingListaCoaseguradores: obtenerCoasegurador(state).isLoading,
  isValidatingPT: obtenerIsValidatingCargaMasiva(state),
  userClaims: state.services.user.userClaims
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Form.create({ name: 'carga_masiva' })(CargaMasiva))
);
