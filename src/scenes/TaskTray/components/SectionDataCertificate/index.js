import {
  validacionBotonReemplazarAsegurado,
  validacionInputEmailAsegurado,
  validacionAplicacion
} from 'scenes/TaskTray/components/SectionDataCertificate/utils/validate';
import CertificateFormItem from 'scenes/TaskTray/components/SectionDataCertificate/components/CertificateFormItem';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Form } from 'antd';
import { getEsTipoUsuarioEjecutivo, getEsTipoUsuarioAjustador } from 'services/users/reducer';

class DataCertificateSections extends Component {
  constructor(props) {
    super(props);
    this.state = null;
  }

  render() {
    const {
      dataCertificado,
      esAjustador,
      esEjecutivo,
      flagModificar,
      form,
      userClaims,
      disabledGeneral,
      currentTask: { idTarea },
      form: { getFieldDecorator, getFieldValue }
    } = this.props;
    const esSiniestroPreventivo = getFieldValue('tipoSiniestro') === 'P';
    const esCargaMasiva = (getFieldValue('siniestro') || {}).indCargaMasiva === 'PT';
    const tieneCertificado = !!(dataCertificado || {}).numCertificado;

    // klrojas coaseguro ---->
    const esCMCoaseguro = (getFieldValue('siniestro') || {}).indCargaMasiva === 'COA';

    return (
      <Form.Item>
        {getFieldDecorator('certificado', {
          initialValue: {
            apeMaterno: dataCertificado ? dataCertificado.apeMaterno : '',
            apePaterno: dataCertificado ? dataCertificado.apePaterno : '',
            codProducto: dataCertificado ? dataCertificado.codProducto : '',
            descripcionProducto: dataCertificado ? dataCertificado.descripcionProducto : '',
            direccion: dataCertificado ? dataCertificado.direccion : '',
            fechaFinVigencia: (dataCertificado && dataCertificado.fechaFinVigencia) || '',
            fechaInicioVidencia: (dataCertificado && dataCertificado.fechaInicioVidencia) || '',
            fechaViaje: (dataCertificado && dataCertificado.fechaViaje) || '',
            moneda: dataCertificado ? dataCertificado.moneda : '',
            montoPrima: dataCertificado ? dataCertificado.montoPrima : '',
            nombreAsegurado: dataCertificado ? dataCertificado.nombreAsegurado : '',
            nombres: dataCertificado ? dataCertificado.nombres : '',
            numAplicacion: dataCertificado ? dataCertificado.numAplicacion : '',
            numCertificado: (dataCertificado && dataCertificado.numCertificado) || '',
            numDocumento: dataCertificado ? dataCertificado.numDocumento : '',
            numId: dataCertificado ? dataCertificado.numId : '',
            numPlanilla: dataCertificado ? dataCertificado.numPlanilla : '',
            email: dataCertificado ? dataCertificado.email : '',
            sumaAsegurada: dataCertificado ? dataCertificado.sumaAsegurada : '',
            tipoDocumento: dataCertificado ? dataCertificado.tipoDocumento : '',
            dscTipoDocumento: dataCertificado ? dataCertificado.dscTipoDocumento : ''
          }
        })(
          <CertificateFormItem
            form={form}
            esEjecutivo={esEjecutivo}
            esAjustador={esAjustador}
            userClaims={userClaims}
            idTarea={idTarea}
            disabledGeneral={disabledGeneral}
            esSiniestroPreventivo={esSiniestroPreventivo}
            flagModificar={flagModificar}
            esCargaMasiva={esCargaMasiva}
            tieneCertificado={tieneCertificado}
            // Validaciones
            validacionBotonReemplazarAsegurado={validacionBotonReemplazarAsegurado}
            validacionInputEmailAsegurado={validacionInputEmailAsegurado}
            validacionAplicacion={validacionAplicacion}
            // klrojas coaseguro ---->
            esCMCoaseguro={esCMCoaseguro}
          />
        )}
      </Form.Item>
    );
  }
}

const mapStateToProps = state => {
  const esEjecutivo = getEsTipoUsuarioEjecutivo(state);
  const esAjustador = getEsTipoUsuarioAjustador(state);
  return {
    esEjecutivo,
    esAjustador,
    showScroll: state.services.device.scrollActivated
  };
};

export default connect(mapStateToProps)(DataCertificateSections);
