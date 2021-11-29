import currency from 'currency.js';
import { TASA_CAMBIO_PRECISION } from 'constants/index';
import { esUsuarioAjustador } from 'util/index';

export const actualizaTotalPagosAdicion = (analizarForm, newPago) => {
  const siniestroFormItem = analizarForm.getFieldValue('siniestro') || {};
  const { otrosConceptos: otrosConceptosForm = [] } = siniestroFormItem;

  analizarForm.setFieldsValue({
    siniestro: {
      ...siniestroFormItem,
      otrosConceptos: otrosConceptosForm.map(oc => {
        if (oc.codConcepto === newPago.codConcepto && oc.codRamo === newPago.codRamo) {
          return {
            ...oc,
            mtoTotalPagos: currency(oc.mtoTotalPagos, {
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
        return oc;
      })
    }
  });
};

export const actualizaTotalPagosActualiza = (analizarForm, newPago, selectedPago) => {
  const siniestroFormItem = analizarForm.getFieldValue('siniestro') || {};
  const { otrosConceptos: otrosConceptosForm = [] } = siniestroFormItem;

  // devuelve el monto de pago a la reserva otro conceptos anterior
  analizarForm.setFieldsValue({
    siniestro: {
      ...siniestroFormItem,
      otrosConceptos: otrosConceptosForm.map(oc => {
        if (oc.codConcepto === selectedPago.codConcepto && oc.codRamo === selectedPago.codRamo) {
          return {
            ...oc,
            mtoTotalPagos: currency(oc.mtoTotalPagos, {
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
        return oc;
      })
    }
  });

  // adiciona el monto del nuevo pago a la cobertura correspondiente
  actualizaTotalPagosAdicion(analizarForm, newPago);
};

export const actualizaTotalPagosElimina = (analizarForm, record) => {
  const siniestroFormItem = analizarForm.getFieldValue('siniestro') || {};
  const { otrosConceptos: otrosConceptosForm = [] } = siniestroFormItem;

  analizarForm.setFieldsValue({
    siniestro: {
      ...siniestroFormItem,
      otrosConceptos: otrosConceptosForm.map(oc => {
        if (oc.codConcepto === record.codConcepto && oc.codRamo === record.codRamo) {
          return {
            ...oc,
            mtoTotalPagos: currency(oc.mtoTotalPagos, {
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
        return oc;
      })
    }
  });
};

export const obtieneUsuarioModificacion = userClaims => {
  if (esUsuarioAjustador(userClaims)) return userClaims.emailPadre;
  return userClaims.email;
};
