import { validacionObservacion } from 'scenes/TaskTray/components/SectionObservation/utils/validate';
import { ValidationMessage } from 'util/validation';
import { Row, Col, Input, Form } from 'antd';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { esUsuarioAjustador } from 'util/index';
import { getIndRecuperoAnt, getIndSalvamentoAnt } from '../SectionDataSinister/data/dataSinister/reducer';

const ObservacionSection = props => {
  const {
    userClaims,
    indRecuperoAnt,
    indSalvamentoAnt,
    dataSiniestro: { obsTareaBitacora, indReqAjustadorAnt },
    form: { getFieldDecorator, getFieldValue },
    disabledGeneral,
    currentTask: { idTarea },
    esDevolver = false
  } = props;

  const esAjustador = esUsuarioAjustador(userClaims);
  const cerrarSiniestroValue = getFieldValue('indCerrarSiniestro');
  const recupero = getFieldValue('indRecupero');
  const salvamento = getFieldValue('indSalvamento');
  const requiereAjustador = getFieldValue('ajustadorRequerido');
  const { requerirObservacion } = validacionObservacion;
  const boolRequerirObservacion = requerirObservacion({
    idTarea,
    esDevolver,
    esAjustador,
    cerrarSiniestroValue,
    salvamento,
    recupero,
    indRecuperoAnt,
    indSalvamentoAnt,
    requiereAjustador,
    indReqAjustadorAnt: indReqAjustadorAnt || 'N'
  });

  return (
    <Fragment>
      <Row>
        <Col xs={24} sm={24} md={24} lg={24} xl={24} style={{ marginBottom: '10px' }}>
          <Form.Item>
            {getFieldDecorator('observaciones', {
              initialValue: obsTareaBitacora,
              validateTrigger: 'onBlur',
              rules: [
                {
                  type: 'string',
                  whitespace: true,
                  message: ValidationMessage.NOT_VALID
                },
                {
                  required: boolRequerirObservacion,
                  message: ValidationMessage.REQUIRED
                }
              ]
            })(
              <Input.TextArea
                placeholder="Ingresa observaci&oacute;n"
                autosize={{ minRows: 3, maxRows: 12 }}
                maxLength="5000"
                disabled={disabledGeneral || !idTarea}
              />
            )}
          </Form.Item>
        </Col>
      </Row>
    </Fragment>
  );
};

const mapStateToProps = state => ({
  usuario: state.services.user.userClaims,
  indRecuperoAnt: getIndRecuperoAnt(state),
  indSalvamentoAnt: getIndSalvamentoAnt(state)
});

export default connect(mapStateToProps)(ObservacionSection);
