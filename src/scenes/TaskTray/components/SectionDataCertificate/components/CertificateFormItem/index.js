import React, { Component, Fragment } from 'react';
import { Row, Col, Divider, Form } from 'antd';
import AseguradoFormItem from 'scenes/TaskTray/components/SectionDataCertificate/components/CertificateFormItem/components/AseguradoFormItem';
import moment from 'moment';
import currency from 'currency.js';

const initialValue = {
  apeMaterno: '',
  apePaterno: '',
  codProducto: '',
  descripcionProducto: '',
  direccion: '',
  email: '',
  fechaFinVigencia: '',
  fechaInicioVidencia: '',
  fechaViaje: '',
  moneda: '',
  montoPrima: '',
  nombreAsegurado: '',
  nombres: '',
  numAplicacion: '',
  numCertificado: '',
  numDocumento: '',
  numId: '',
  numPlanilla: '',
  sumaAsegurada: '',
  tipoDocumento: '',
  dscTipoDocumento: ''
};

class CertificateFormItem extends Component {
  static getDerivedStateFromProps(nextProps) {
    // Should be a controlled component.
    if ('value' in nextProps) {
      return {
        ...(nextProps.value || {})
      };
    }
    return null;
  }

  constructor(props) {
    super(props);
    this.state = initialValue;
  }

  render() {
    const {
      apeMaterno,
      apePaterno,
      codProducto,
      descripcionProducto,
      direccion,
      email,
      fechaFinVigencia,
      fechaInicioVidencia,
      fechaViaje,
      moneda,
      montoPrima,
      nombreAsegurado,
      nombres,
      numAplicacion,
      numCertificado,
      numDocumento,
      numId,
      numPlanilla,
      sumaAsegurada,
      tipoDocumento,
      dscTipoDocumento
    } = this.state;
    const {
      // klrojas coaseguro ---->
      esCMCoaseguro,
      userClaims,
      form,
      esAjustador,
      esEjecutivo,
      idCurrentTask,
      forceUpdateHandler,
      disabledGeneral,
      form: { getFieldDecorator },
      idTarea,
      flagModificar,
      esCargaMasiva,
      tieneCertificado,
      esSiniestroPreventivo,
      validacionBotonReemplazarAsegurado,
      validacionInputEmailAsegurado,
      validacionAplicacion: { mostrarAplicacion }
    } = this.props;

    // Validacion
    const boolMostrarAplicacion = mostrarAplicacion({
      codProducto,
      idTarea,
      flagModificar,
      esAjustador
    });

    // Fin validacion
    return (
      <Fragment>
        <Divider style={{ color: '#919191', fontWeight: 'bold' }} orientation="left">
          Certificado
        </Divider>
        <Fragment>
          <Row gutter={24}>
            <Col xs={24} sm={12} md={8} lg={6} xl={6}>
              <div className="claims-rrgg-description-list-index-term">Nombre asegurado</div>
              <div className="claims-rrgg-description-list-index-detail">
                <span>{nombreAsegurado}</span>
              </div>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xl={6}>
              <div className="claims-rrgg-description-list-index-term">Producto</div>
              <div className="claims-rrgg-description-list-index-detail">
                <span>{`${codProducto} - ${descripcionProducto}`}</span>
              </div>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xl={6}>
              <div className="claims-rrgg-description-list-index-term">Nro. Certificado</div>
              <div className="claims-rrgg-description-list-index-detail">
                <span>{numCertificado}</span>
              </div>
            </Col>
            {codProducto === '3001' && (
              <Fragment>
                <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                  <div className="claims-rrgg-description-list-index-term">Planilla</div>
                  <div className="claims-rrgg-description-list-index-detail">
                    <span>{numPlanilla}</span>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                  <div className="claims-rrgg-description-list-index-term">Aplicaci&oacute;n</div>
                  <div className="claims-rrgg-description-list-index-detail">
                    <span>{numAplicacion}</span>
                  </div>
                </Col>
              </Fragment>
            )}
            <Col xs={24} sm={12} md={8} lg={6} xl={6}>
              <div className="claims-rrgg-description-list-index-term">Moneda</div>
              <div className="claims-rrgg-description-list-index-detail">
                <span>{moneda}</span>
              </div>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6} xl={6}>
              <div className="claims-rrgg-description-list-index-term">Suma asegurada</div>
              <div className="claims-rrgg-description-list-index-detail">
                <span>{currency(sumaAsegurada).format()}</span>
              </div>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xl={6}>
              <div className="claims-rrgg-description-list-index-term">Inicio vigencia</div>
              <div className="claims-rrgg-description-list-index-detail">
                {(fechaInicioVidencia && moment.utc(fechaInicioVidencia).format('L')) || ''}
              </div>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xl={6}>
              <div className="claims-rrgg-description-list-index-term">Fin vigencia</div>
              <div className="claims-rrgg-description-list-index-detail">
                {(fechaFinVigencia && moment.utc(fechaFinVigencia).format('L')) || ''}
              </div>
            </Col>
          </Row>
        </Fragment>
        {boolMostrarAplicacion && (
          <Fragment>
            <Divider style={{ color: '#919191', fontWeight: 'bold' }} orientation="left">
              Aplicaci&oacute;n
            </Divider>
            <Fragment>
              <Row gutter={24}>
                <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                  <div className="claims-rrgg-description-list-index-term">Aplicaci&oacute;n</div>
                  <div className="claims-rrgg-description-list-index-detail">
                    <span>{numAplicacion}</span>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                  <div className="claims-rrgg-description-list-index-term">Fecha viaje</div>
                  <div className="claims-rrgg-description-list-index-detail">
                    <span>
                      {String(fechaViaje) === '1899-11-30T00:00:00.000Z'
                        ? ''
                        : (fechaViaje && moment.utc(fechaViaje).format('L')) || ''}
                    </span>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                  <div className="claims-rrgg-description-list-index-term">Suma asegurada</div>
                  <div className="claims-rrgg-description-list-index-detail">
                    <span>{currency(sumaAsegurada).format()}</span>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                  <div className="claims-rrgg-description-list-index-term">Monto prima</div>
                  <div className="claims-rrgg-description-list-index-detail">
                    <span>{currency(montoPrima).format()}</span>
                  </div>
                </Col>
              </Row>
            </Fragment>
          </Fragment>
        )}
        {
          // Agregar Condifion de Tarea para mostrar - DBC
          <Form.Item>
            {getFieldDecorator('asegurado')(
              <AseguradoFormItem
                esEjecutivo={esEjecutivo}
                form={form}
                numId={numId}
                flagModificar={flagModificar}
                tipoDocumento={tipoDocumento}
                tieneCertificado={tieneCertificado}
                dscTipoDocumento={dscTipoDocumento}
                numDocumento={numDocumento}
                apePaterno={apePaterno}
                apeMaterno={apeMaterno}
                direccion={direccion}
                esCargaMasiva={esCargaMasiva}
                nombres={nombres}
                email={email}
                razonSocial={nombres}
                userClaims={userClaims}
                idCurrentTask={idCurrentTask}
                forceUpdateHandler={forceUpdateHandler}
                disabledGeneral={disabledGeneral}
                idTarea={idTarea}
                esSiniestroPreventivo={esSiniestroPreventivo}
                // Validacion
                validacionBotonReemplazarAsegurado={validacionBotonReemplazarAsegurado}
                validacionInputEmailAsegurado={validacionInputEmailAsegurado}
                // klrojas coaseguro ---->
                esCMCoaseguro={esCMCoaseguro}
              />
            )}
          </Form.Item>
        }
      </Fragment>
    );
  }
}

export default CertificateFormItem;
