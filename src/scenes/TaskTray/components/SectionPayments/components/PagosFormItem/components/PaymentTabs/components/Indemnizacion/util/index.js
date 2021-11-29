import currency from 'currency.js';
import { TASA_CAMBIO_PRECISION } from 'constants/index';

export const calculateIndemnizacionNeta = (indemnizacionBruta, deducible, montoCoaseguro) => {
  return currency(indemnizacionBruta)
    .subtract(deducible)
    .subtract(montoCoaseguro)
    .format();
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
                    currency(newPago.mtoIndemnizacionBruta, {
                      precision: TASA_CAMBIO_PRECISION
                    }).multiply(newPago.mtoTasaCambio, {
                      precision: TASA_CAMBIO_PRECISION
                    })
                  ).value,
                  indemnizacion: currency(cobertura.indemnizacion, {
                    precision: TASA_CAMBIO_PRECISION
                  }).add(
                    currency(newPago.mtoIndemnizacionBruta, {
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
                    currency(selectedPago.mtoIndemnizacionBruta, {
                      precision: TASA_CAMBIO_PRECISION
                    }).multiply(selectedPago.mtoTasaCambioRegistro, {
                      precision: TASA_CAMBIO_PRECISION
                    })
                  ).value,
                  indemnizacion: currency(cobertura.indemnizacion, {
                    precision: TASA_CAMBIO_PRECISION
                  }).subtract(
                    currency(selectedPago.mtoIndemnizacionBruta, {
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
                    currency(record.mtoIndemnizacionBruta, {
                      precision: TASA_CAMBIO_PRECISION
                    }).multiply(record.mtoTasaCambioRegistro, {
                      precision: TASA_CAMBIO_PRECISION
                    })
                  ).value,
                  indemnizacion: currency(cobertura.indemnizacion, {
                    precision: TASA_CAMBIO_PRECISION
                  }).subtract(
                    currency(record.mtoIndemnizacionBruta, {
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
