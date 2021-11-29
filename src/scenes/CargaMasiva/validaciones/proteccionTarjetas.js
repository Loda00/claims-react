import { CABECERAS_CARGA_MASIVA } from 'constants/index';
import { showErrorMessage } from 'util';
import currency from 'currency.js';
import { utils, read } from 'xlsx';
import { isEmpty } from 'lodash';
import { Modal } from 'antd';
import moment from 'moment';
import sha1 from 'sha1';

const formatearMensajeError = (errores, asignarErrores) => {
  let formato = '';
  errores.forEach(error => {
    formato += `*${error.numero === 'Error' ? '' : ` Fila: ${error.numero} =>`}${
      error.campo === 'Error' ? '' : ` Columna: ${error.campo} |`
    } Mensaje: ${error.mensaje} \n`;
  });

  asignarErrores(formato);
};

const getBase64FromFile = file => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = error => reject(error);
  });
};

const warning = limpiarDocumento => {
  Modal.warning({
    title: 'Carga Masiva PT',
    content: 'Se est\u00e1 procesando el registro de los siniestros',
    okText: 'Aceptar',
    onOk: () => {
      limpiarDocumento();
    }
  });
};

const fromExcelToJson = rows => {
  const siniestros = [];
  const objRows = {};
  objRows.arrFila = [];
  objRows.arrAsegurado = [];
  objRows.arrDni = [];
  objRows.arrFecNotificacion = [];
  objRows.arrFecSiniestro = [];
  objRows.arrCodigoReclamo = [];
  objRows.arrMoneda = [];

  const { arrFila, arrAsegurado, arrDni, arrFecNotificacion, arrFecSiniestro, arrCodigoReclamo, arrMoneda } = objRows;

  rows.forEach(row => {
    const { nombreAsegurado, dni, fecNotificacion, fecSiniestro, codigoReclamo, moneda, numero } = row;
    const fila = numero;
    const coberturaAfectada = row.coberturaAfectada.toUpperCase();
    const strAsegurado = nombreAsegurado.toUpperCase();
    const strDni = dni.toString();
    const strCodigoReclamo = codigoReclamo.toString();
    const strFecNotificacion = fecNotificacion.toString();
    const strFecSiniestro = fecSiniestro.toString();
    let hashRow;
    const flagIndexOfAsegurado = arrAsegurado.indexOf(strAsegurado);
    if (flagIndexOfAsegurado === -1) {
      arrFila.push(fila);
      arrAsegurado.push(strAsegurado);
      arrDni.push(strDni);
      arrFecNotificacion.push(fecNotificacion);
      arrFecSiniestro.push(fecSiniestro);
      arrCodigoReclamo.push(strCodigoReclamo);
      arrMoneda.push({
        soles_p: (coberturaAfectada === 'P' && moneda.soles) || null,
        dolares_p: (coberturaAfectada === 'P' && moneda.dolares) || null,
        soles_o: (coberturaAfectada === 'O' && moneda.soles) || null,
        dolares_o: (coberturaAfectada === 'O' && moneda.dolares) || null
      });

      // Crear Hash por Fila
      hashRow = sha1(`${strDni}${strFecNotificacion}${strFecSiniestro}${strCodigoReclamo}${coberturaAfectada}`);

      siniestros.push({
        fila,
        asegurado: strAsegurado,
        dni: strDni,
        fecNotificacion,
        fecSiniestro,
        moneda: {
          soles_p: (coberturaAfectada === 'P' && moneda.soles) || null,
          dolares_p: (coberturaAfectada === 'P' && moneda.dolares) || null,
          soles_o: (coberturaAfectada === 'O' && moneda.soles) || null,
          dolares_o: (coberturaAfectada === 'O' && moneda.dolares) || null
        },
        codigoReclamo: strCodigoReclamo,
        coberturaAfectada,
        hashRow
      });
    } else {
      // Si existe el asegurado se valida que los demás campos no se repitan
      const tempDni = arrDni[flagIndexOfAsegurado];
      const tempCodigoReclamo = arrCodigoReclamo[flagIndexOfAsegurado];
      const tempFecNotificacion = arrFecNotificacion[flagIndexOfAsegurado];
      const tempFecSiniestro = arrFecSiniestro[flagIndexOfAsegurado];

      const dniValidation = strDni === tempDni;
      const codigoReclamoValidation = strCodigoReclamo === tempCodigoReclamo;
      const fecNotificacionValidation = strFecNotificacion === tempFecNotificacion;
      const fecSiniestroValidation = strFecSiniestro === tempFecSiniestro;

      const validation =
        dniValidation && fecNotificacionValidation && fecSiniestroValidation && codigoReclamoValidation;

      if (validation) {
        // Si los demás campos se repiten, Se combinarán ambos registros
        hashRow = sha1(
          `${siniestros[flagIndexOfAsegurado].dni}${siniestros[flagIndexOfAsegurado].fecNotificacion}${siniestros[flagIndexOfAsegurado].fecSiniestro}${siniestros[flagIndexOfAsegurado].codigoReclamo}C`
        );

        // combinando coberturas y añadiendo monedas de la otra cobertura
        if (coberturaAfectada.toUpperCase() === 'P') {
          siniestros[flagIndexOfAsegurado].moneda.soles_p = moneda.soles || null;
          siniestros[flagIndexOfAsegurado].moneda.dolares_p = moneda.dolares || null;
        } else {
          siniestros[flagIndexOfAsegurado].moneda.soles_o = moneda.soles || null;
          siniestros[flagIndexOfAsegurado].moneda.dolares_o = moneda.dolares || null;
        }

        siniestros[flagIndexOfAsegurado].coberturaAfectada = 'C';
        siniestros[flagIndexOfAsegurado].hashRow = hashRow;
      } else {
        // Si al menos un campo no se repite, se añade al array de salida
        arrFila.push(fila);
        arrAsegurado.push(strAsegurado);
        arrDni.push(strDni);
        arrFecNotificacion.push(fecNotificacion);
        arrFecSiniestro.push(fecSiniestro);
        arrCodigoReclamo.push(strCodigoReclamo);
        arrMoneda.push({
          soles_p: (coberturaAfectada === 'P' && moneda.soles) || null,
          dolares_p: (coberturaAfectada === 'P' && moneda.dolares) || null,
          soles_o: (coberturaAfectada === 'O' && moneda.soles) || null,
          dolares_o: (coberturaAfectada === 'O' && moneda.dolares) || null
        });

        hashRow = sha1(`${strDni}${strFecNotificacion}${strFecSiniestro}${strCodigoReclamo}${coberturaAfectada[0]}`);
        siniestros.push({
          fila,
          asegurado: strAsegurado,
          dni: strDni,
          fecNotificacion,
          fecSiniestro,
          moneda: {
            soles_p: (coberturaAfectada === 'P' && moneda.soles) || null,
            dolares_p: (coberturaAfectada === 'P' && moneda.dolares) || null,
            soles_o: (coberturaAfectada === 'O' && moneda.soles) || null,
            dolares_o: (coberturaAfectada === 'O' && moneda.dolares) || null
          },
          codigoReclamo: strCodigoReclamo,
          coberturaAfectada,
          hashRow
        });
      }
    }
  });
  return siniestros;
};

const generarErrorGenerico = (msg, asignarErrores) => {
  const errores = [];
  errores.push({
    numero: 'Error',
    campo: 'Error',
    mensaje: msg
  });
  formatearMensajeError(errores, asignarErrores);
};

const unirErrores = TotalErrores => {
  const errores = [];
  TotalErrores.forEach(erroresPorSerccion => {
    if (erroresPorSerccion.length > 0) {
      erroresPorSerccion.forEach(error => {
        errores.push(error);
      });
    }
  });
  return errores;
};

const validarFecha = fecha => {
  const arrFecha = fecha.split('/');
  if (arrFecha.length === 3) {
    const dia = Number(arrFecha[0]);
    const mes = Number(arrFecha[1]);
    const anio = Number(arrFecha[2]);
    if (!Number.isNaN(dia) && !Number.isNaN(mes) && !Number.isNaN(anio)) {
      const parseParse = moment(fecha, 'DD/MM/YYYY').isValid();
      if (parseParse) {
        return true;
      }
    }
  }
  return false;
};

const validarSchema = rows => {
  const errores = [];
  rows.forEach(row => {
    const {
      numero,
      nombreAsegurado,
      dni,
      fecNotificacion,
      fecSiniestro,
      moneda: { dolares, soles },
      codigoReclamo,
      coberturaAfectada
    } = row;

    const validarFechaNotificacion = validarFecha(fecNotificacion);
    const validarFechaSiniestro = validarFecha(fecSiniestro);
    if (!numero) {
      errores.push({
        numero,
        campo: 'N°',
        mensaje: 'Campo obligatorio.'
      });
    } else {
      const validacionFila = Number.isNaN(parseInt(numero, 10));
      if (validacionFila) {
        errores.push({
          numero,
          campo: 'N°',
          mensaje: `Debe ser numérico "${numero}".`
        });
      }
    }
    if (!nombreAsegurado) {
      errores.push({
        numero,
        campo: 'NOMBRE DEL ASEGURADO',
        mensaje: 'Campo obligatorio.'
      });
    }
    if (!dni) {
      errores.push({
        numero,
        campo: 'DNI',
        mensaje: 'Campo obligatorio.'
      });
    }
    if (!fecNotificacion) {
      errores.push({
        numero,
        campo: 'F. NOTIFICACION',
        mensaje: `Campo obligatorio.`
      });
    } else if (!validarFechaNotificacion) {
      errores.push({
        numero,
        campo: 'F. NOTIFICACION',
        mensaje: `Fecha inválida [dd/mm/aaaa] "${fecNotificacion}".`
      });
    }
    if (!fecSiniestro) {
      errores.push({
        numero,
        campo: 'F. SINIESTRO',
        mensaje: `Campo obligatorio.`
      });
    } else if (!validarFechaSiniestro) {
      errores.push({
        numero,
        campo: 'F. SINIESTRO',
        mensaje: `Fecha inválida  [dd/mm/aaaa] "${fecSiniestro}".`
      });
    }
    if (!dolares && !soles) {
      if (Number.isNaN(soles)) {
        errores.push({
          numero,
          campo: 'SOLES (S/.)',
          mensaje: `Valor no válido ${soles}.`
        });
      } else if (Number.isNaN(dolares)) {
        errores.push({
          numero,
          campo: 'DOLARES (USD)',
          mensaje: `Valor no válido ${dolares}.`
        });
      } else {
        errores.push({
          numero,
          campo: '[SOLES (S/.) - DOLARES (USD)]',
          mensaje: 'Debe ingresar por lo menos un monto [SOL o USD].'
        });
      }
    }

    if (!codigoReclamo) {
      errores.push({
        numero,
        campo: 'CODIGO RECLAMO',
        mensaje: 'Campo obligatorio.'
      });
    }
    if (!coberturaAfectada) {
      errores.push({
        numero,
        campo: 'COBERTURA AFECTADA',
        mensaje: 'Campo obligatorio.'
      });
    }
  });
  return errores;
};

const validarNombreAsegurado = rows => {
  const errores = [];
  const patron = /^[A-ZÁ-Ú1-9Ñ.,&\s]+$/i;

  rows.forEach(row => {
    const { nombreAsegurado, numero } = row;
    if (nombreAsegurado && numero) {
      if (!patron.exec(nombreAsegurado)) {
        errores.push({
          numero,
          campo: 'ASEGURADO',
          mensaje: `Debe contener solo letras "${nombreAsegurado}".`
        });
      }
    }
  });
  return errores;
};

const validarFormatoCodigoReclamo = rows => {
  const errores = [];
  const patron = /[0-9]{11}/;

  rows.forEach(row => {
    const { codigoReclamo, numero } = row;

    if (codigoReclamo && numero) {
      const strCodigoReclamo = codigoReclamo.toString();
      const codigoReclamoLength = strCodigoReclamo.length;
      if (codigoReclamoLength !== 11) {
        errores.push({
          numero,
          campo: 'CODIGO RECLAMO',
          mensaje: `No cumple con la cantidad de dígitos [11] "${strCodigoReclamo}".`
        });
      } else if (!patron.exec(strCodigoReclamo)) {
        errores.push({
          numero,
          campo: 'CODIGO RECLAMO',
          mensaje: `Debe ser numérico "${strCodigoReclamo}".`
        });
      }
    }
  });
  return errores;
};

const validarFormatoDni = rows => {
  const errores = [];
  const patron = /^[0-9]+$/;

  rows.forEach(row => {
    const { dni, numero } = row;
    if (dni && numero) {
      if (dni.length !== 8 && dni.length !== 11) {
        errores.push({
          numero,
          campo: 'DNI',
          mensaje: `No cumple con la cantidad de dígitos [ DNI:8 - RUC: 11] "${dni}".`
        });
      } else if (!patron.exec(dni)) {
        errores.push({
          numero,
          campo: 'DNI',
          mensaje: `Debe ser numérico "${dni}".`
        });
      }
    }
  });
  return errores;
};

const validarFormatoCoberturaAfectada = rows => {
  const errores = [];
  const patron = /[opOP]{1}/;
  rows.forEach(row => {
    const { coberturaAfectada, numero } = row;
    if (coberturaAfectada && numero) {
      if (coberturaAfectada.length !== 1 || !patron.exec(coberturaAfectada)) {
        errores.push({
          numero,
          campo: 'COBERTURA AFECTADA',
          mensaje: `Dato no válido, diferente de [O-P] "${coberturaAfectada}".`
        });
      }
    }
  });
  return errores;
};

const asignarHashPorFila = rows => {
  rows.forEach(row => {
    let hash = '';
    const { dni, fecNotificacion, fecSiniestro, codigoReclamo, coberturaAfectada } = row;
    hash = sha1(
      dni.toUpperCase() +
        fecNotificacion.toUpperCase() +
        fecSiniestro.toUpperCase() +
        codigoReclamo.toUpperCase() +
        coberturaAfectada.toUpperCase()
    );
    Object.assign(row, { hash });
  });
};

const validarRegistrosDuplicados = rows => {
  const errores = [];
  let filasDuplicadasTotales = [];

  rows.forEach(rowi => {
    const filasDuplicadas = [];
    rows.forEach(rowj => {
      if (rowi.hash === rowj.hash) {
        filasDuplicadas.push(rowj.numero);
      }
    });
    if (filasDuplicadas.length > 1) {
      filasDuplicadasTotales.push(JSON.stringify([...filasDuplicadas]));
    }
  });
  filasDuplicadasTotales = new Set(filasDuplicadasTotales);
  filasDuplicadasTotales = Array.from(filasDuplicadasTotales);

  filasDuplicadasTotales.forEach(fila => {
    errores.push({
      numero: fila,
      campo: 'Error',
      mensaje: 'Filas duplicadas.' // mensaje: 'Datos duplicados en las filas mencionadas.'
    });
  });
  return errores;
};

const sendRequest = async (file, rows, props) => {
  const { registrarCargaMasiva } = props;
  const request = {};
  request.file = {};
  const archivoCodificado = await getBase64FromFile(file).then(data => {
    return data;
  });
  const dataJson = fromExcelToJson(rows);
  request.siniestros = dataJson;
  request.file.codedFile = archivoCodificado;
  request.file.fileSHA1 = sha1(archivoCodificado);
  request.file.nombreArchivo = file.name;
  request.file.tipoArchivo = file.type;
  const response = await registrarCargaMasiva(request);
  return response;
};

const onSuccessLocalValidation = async (file, rows, props, asignarErrores, limpiarDocumento) => {
  const errores = [];
  const response = await sendRequest(file, rows, props);
  if (response.statusCode === 'CRG-201') {
    const filasRepetida = response.data.duplicatedRow;
    filasRepetida.forEach(fila => {
      const fechaCargada = fila.fechaCreacion;
      const formatoFecha = new Date(fechaCargada.slice(0, -1)).toLocaleString('es-PE');
      errores.push({
        numero: fila.fila,
        campo: 'Error',
        mensaje: `Fila ya registrada previamente en la fecha: ${formatoFecha}.`
      });
    });

    formatearMensajeError(errores, asignarErrores);
  } else if (response.statusCode === 'CRG-202') {
    const fechaCargada = response.data.fechaCreacion;
    const formatoFecha = new Date(fechaCargada.slice(0, -1)).toLocaleString('es-PE');

    errores.push({
      numero: 'Error',
      campo: 'Error',
      mensaje: `Archivo cargado previamente en la fecha: ${formatoFecha}.`
    });
    formatearMensajeError(errores, asignarErrores);
  } else if (response.statusCode === 'CRG-000') {
    warning(limpiarDocumento);
  }
};

const leerCargaMasiva = file => {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onerror = () => {
      reader.abort();
      reject(new Error('Error al procesar el archivo'));
    };
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsBinaryString(file);
  });
};

const validarCabecera = header => {
  const erroresCabecera = [];
  const {
    PROTECCION_TARJETAS: {
      FILA,
      ASEGURADO,
      DOCUMENTO,
      F_NOTIFICACION,
      F_SINIESTRO,
      COD_RECLAMO,
      SOLES,
      DOLARES,
      COB_AFECTADA
    }
  } = CABECERAS_CARGA_MASIVA;

  if (!header.includes(FILA)) {
    erroresCabecera.push({
      numero: 'Error',
      campo: 'Error',
      mensaje: `Cabecera no encontrada "${FILA}".`
    });
  }
  if (!header.includes(ASEGURADO)) {
    erroresCabecera.push({
      numero: 'Error',
      campo: 'Error',
      mensaje: `Cabecera no encontrada "${ASEGURADO}".`
    });
  }
  if (!header.includes(DOCUMENTO)) {
    erroresCabecera.push({
      numero: 'Error',
      campo: 'Error',
      mensaje: `Cabecera no encontrada "${DOCUMENTO}".`
    });
  }
  if (!header.includes(F_NOTIFICACION)) {
    erroresCabecera.push({
      numero: 'Error',
      campo: 'Error',
      mensaje: `Cabecera no encontrada "${F_NOTIFICACION}".`
    });
  }
  if (!header.includes(F_SINIESTRO)) {
    erroresCabecera.push({
      numero: 'Error',
      campo: 'Error',
      mensaje: `Cabecera no encontrada "${F_SINIESTRO}".`
    });
  }
  if (!header.includes(COD_RECLAMO)) {
    erroresCabecera.push({
      numero: 'Error',
      campo: 'Error',
      mensaje: `Cabecera no encontrada "${COD_RECLAMO}".`
    });
  }
  if (!header.includes(SOLES)) {
    erroresCabecera.push({
      numero: 'Error',
      campo: 'Error',
      mensaje: `Cabecera no encontrada "${SOLES}".`
    });
  }
  if (!header.includes(DOLARES)) {
    erroresCabecera.push({
      numero: 'Error',
      campo: 'Error',
      mensaje: `Cabecera no encontrada "${DOLARES}".`
    });
  }
  if (!header.includes(COB_AFECTADA)) {
    erroresCabecera.push({
      numero: 'Error',
      campo: 'Error',
      mensaje: `Cabecera no encontrada "${COB_AFECTADA}".`
    });
  }

  return erroresCabecera;
};

const procesarCargaMasiva = async (file, params) => {
  const {
    asignarErrores,
    limpiarDocumento,
    props,
    props: { validacionTerminado }
  } = params;

  let data;

  try {
    const archivo = await leerCargaMasiva(file, params);
    const bstr = archivo;
    const workbook = read(bstr, {
      type: 'binary'
    });

    const woorksheetName = workbook.SheetNames[0];
    const ws = workbook.Sheets[woorksheetName];
    data = utils.sheet_to_json(ws, { header: 1 });

    if (!isEmpty(data)) {
      const erroresCabecera = validarCabecera(data[0]);

      if (erroresCabecera.length > 0) {
        if (erroresCabecera.length === 9) {
          generarErrorGenerico('No existen registros para procesar', asignarErrores);
          return;
        }
        formatearMensajeError(erroresCabecera, asignarErrores);
        return;
      }

      data = utils.sheet_to_json(ws, {
        raw: false,
        defval: ''
      });

      if (isEmpty(data)) {
        generarErrorGenerico('No existen registros para procesar', asignarErrores);
        return;
      }

      const jsonDesdeExcel = data.map(item => {
        const nombreAsegurado = String(item['NOMBRE DEL ASEGURADO']).trim();
        const numero = String(item['N°']).trim() || '';
        const dni = String(item.DNI).trim() || '';
        const codigoReclamo = String(item['CODIGO RECLAMO']).trim();
        const coberturaAfectada = String(item['COBERTURA AFECTADA']).trim();
        const soles = currency(item['SOLES (S/.)'] || 0).value;
        const dolares = currency(item['DOLARES (USD)'] || 0).value;
        const fecNotificacion = String(item['F. NOTIFICACION']).trim();
        const fecSiniestro = String(item['F. SINIESTRO']).trim();
        return {
          nombreAsegurado,
          numero,
          dni,
          codigoReclamo,
          coberturaAfectada,
          fecNotificacion,
          fecSiniestro,
          moneda: {
            soles,
            dolares
          }
        };
      });
      const erroresFormatoSchema = validarSchema(jsonDesdeExcel);
      const erroresNombreAsegurado = validarNombreAsegurado(jsonDesdeExcel);
      const erroresDni = validarFormatoDni(jsonDesdeExcel);
      const erroresCodigoReclamo = validarFormatoCodigoReclamo(jsonDesdeExcel);
      const erroresCoberturaAfectada = validarFormatoCoberturaAfectada(jsonDesdeExcel);

      const erroresGenerales = unirErrores([
        erroresFormatoSchema,
        erroresDni,
        erroresCodigoReclamo,
        erroresCoberturaAfectada,
        erroresNombreAsegurado
      ]);

      asignarHashPorFila(jsonDesdeExcel);
      const erroresDuplicidad = validarRegistrosDuplicados(jsonDesdeExcel);
      const erroresTotales = erroresDuplicidad.concat(erroresGenerales);
      if (erroresTotales.length === 0) {
        await onSuccessLocalValidation(file, jsonDesdeExcel, props, asignarErrores, limpiarDocumento);
      } else {
        formatearMensajeError(erroresTotales, asignarErrores);
      }
    } else {
      generarErrorGenerico('No existen registros para procesar', asignarErrores);
    }
  } catch (err) {
    showErrorMessage(String('Ocurrió un error en carga masiva'));
  } finally {
    validacionTerminado();
  }
};

export default procesarCargaMasiva;
