import * as Utils from 'util/index';

export function esDireccionCompleta(direccion) {
  return (
    direccion &&
    (Utils.isNotEmpty(direccion.continente) &&
      Utils.isNotEmpty(direccion.codPais) &&
      Utils.isNotEmpty(direccion.codCiudad) &&
      Utils.isNotEmpty(direccion.descCiudad) &&
      Utils.isNotEmpty(direccion.codEstado) &&
      Utils.isNotEmpty(direccion.descEstado) &&
      Utils.isNotEmpty(direccion.codMunicipio) &&
      Utils.isNotEmpty(direccion.descMunicipio) &&
      Utils.isNotEmpty(direccion.direc))
  );
}
