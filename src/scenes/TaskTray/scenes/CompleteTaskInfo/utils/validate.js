const mostrarPolizaLider = params => {
  const { indCargaMasiva } = params;

  if (indCargaMasiva === 'COA') {
    return true;
  }

  return false;
};

export const validacionDatosPoliza = {
  mostrarPolizaLider
};

const mostrarSiniestroLider = params => {
  const { indCargaMasiva } = params;

  if (indCargaMasiva === 'COA') {
    return true;
  }

  return false;
};

const mostrarRamoTransporte = params => {
  const { indCargaMasiva, esProductoRamoTransporteInicial, esProductoRamoTransporte } = params;

  if (!['CAT', 'COA'].includes(indCargaMasiva)) {
    if (esProductoRamoTransporteInicial || esProductoRamoTransporte) {
      return true;
    }
  }

  return false;
};

const mostrarTercerosAfectados = params => {
  const { indCargaMasiva } = params;

  if (indCargaMasiva !== 'COA') {
    return true;
  }

  return false;
};

const mostrarTipoEventoCatastrofico = params => {
  const { indCargaMasiva } = params;

  if (indCargaMasiva === 'CAT') {
    return true;
  }

  return false;
};

const mostrarRamo3D = params => {
  const { indCargaMasiva, esProductoRamo3DInicial, esProductoRamo3D } = params;

  if (!['CAT', 'COA'].includes(indCargaMasiva)) {
    if (esProductoRamo3DInicial || esProductoRamo3D) {
      return true;
    }
  }

  return false;
};

const mostrarDetalleRamoDomicilio = params => {
  const { indCargaMasiva, esProductoRamoDomiciliarioInicial, esProductoRamoDomiciliario } = params;

  if (!['CAT', 'COA'].includes(indCargaMasiva)) {
    if (esProductoRamoDomiciliarioInicial || esProductoRamoDomiciliario) {
      return true;
    }
  }

  return false;
};

const mostrarPrevencionFraude = params => {
  const { indCargaMasiva } = params;

  if (indCargaMasiva === 'PT') {
    return true;
  }

  return false;
};

export const validacionDatosSiniestro = {
  mostrarSiniestroLider,
  mostrarRamoTransporte,
  mostrarTercerosAfectados,
  mostrarRamo3D,
  mostrarTipoEventoCatastrofico,
  mostrarDetalleRamoDomicilio,
  mostrarPrevencionFraude
};

const habilitarAgregarCobertura = params => {
  const { showCoberturas, tomado, indCargaMasiva, coberturasElegidas: coberturas = [] } = params;

  const coberturasActivas = coberturas.filter(cobertura => cobertura.delete !== true);

  if (tomado && showCoberturas) {
    if (['CAT', 'COA'].includes(indCargaMasiva)) {
      if (coberturasActivas.length === 0) {
        return true;
      }
    } else {
      return true;
    }
  }

  return false;
};

export const validacionDatosCobertura = {
  habilitarAgregarCobertura
};

const mostrarDatosContactos = params => {
  const { indCargaMasiva } = params;

  if (!['PT', 'COA'].includes(indCargaMasiva)) {
    return true;
  }

  return false;
};

const mostrarAjustador = params => {
  const { indCargaMasiva } = params;

  if (indCargaMasiva !== 'COA') {
    return true;
  }

  return false;
};

const habilitarAjustador = params => {
  const { tomado, indCargaMasiva /* , idAjustador */ } = params;

  if (tomado) {
    if (indCargaMasiva !== 'CAT') {
      return true;
    }
    /*
     if (indCargaMasiva === 'CAT') {
       if (!idAjustador) {
         return true;
       }
     } else {
       return true;
     } */
  }

  return false;
};

export const validacionDatosAdicionales = {
  mostrarDatosContactos,
  mostrarAjustador,
  habilitarAjustador
};

const mostrarAnular = params => {
  const { indCargaMasiva } = params;

  if (!['CAT', 'COA'].includes(indCargaMasiva)) {
    return false;
  }

  return true;
};

export const validacionBotonesTarea = {
  mostrarAnular
};
