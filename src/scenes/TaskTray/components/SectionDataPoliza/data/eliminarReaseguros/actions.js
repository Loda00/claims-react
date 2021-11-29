export const ELIMINAR_REASEGUROS_INICIADO = 'ELIMINAR_REASEGUROS_INICIADO';
export const ELIMINAR_REASEGUROS_TERMINADO = 'ELIMINAR_REASEGUROS_TERMINADO';

export function eliminarReasegurosIniciado() {
  return {
    type: ELIMINAR_REASEGUROS_INICIADO
  };
}

export function eliminarReasegurosTerminado(data) {
  return {
    type: ELIMINAR_REASEGUROS_TERMINADO,
    payload: {
      data
    }
  };
}
