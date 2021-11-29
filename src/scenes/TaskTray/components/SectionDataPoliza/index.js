import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Form } from 'antd';
import PolizaFormItem from 'scenes/TaskTray/components/SectionDataPoliza/components/PolizaFormItem/index';
import { getEsTipoUsuarioEjecutivo, getEsTipoUsuarioAjustador } from 'services/users/reducer';
import { getRamos } from 'scenes/TaskTray/components/SectionDataCobertura/data/coveragesAdjusters/reducer';
import {
  validacionBotonReemplazarCorredor,
  validacionInputEjecutivoCorredor,
  validacionInputEmailCorredor,
  validacionGrillaSeguros,
  validacionInputEmailSeguros,
  validacionBotonEnviarEmails,
  validacionPolizaLider
} from 'scenes/TaskTray/components/SectionDataPoliza/utils/validate';
import { TAREAS } from 'constants/index';
import { getTipoSiniestro } from '../SectionDataSinister/data/dataSinister/reducer';
import './style.css';

class DataPolizaSections extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  checkPoliza = (rule, values, callback) => {
    const {
      tipoFlujo,
      esEjecutivo,
      form: { getFieldValue },
      currentTask: { idTarea }
    } = this.props;

    const cerrarSiniestroValue = getFieldValue('indCerrarSiniestro');

    if (idTarea !== TAREAS.CONFIRMAR_GESTION) {
      const tipoSiniestro = getFieldValue('tipoSiniestro') || tipoFlujo;
      const { indCargaMasiva } = getFieldValue('siniestro') || {};
      const esCMCoaseguro = indCargaMasiva === 'COA';
      const tareasPermitidas = [TAREAS.ANALIZAR_SINIESTRO, TAREAS.REVISAR_INFORME_BASICO, TAREAS.REVISAR_INFORME];
      if (
        !cerrarSiniestroValue &&
        esEjecutivo &&
        tareasPermitidas.includes(idTarea) &&
        values.indNotifReaCoa === 'N' &&
        tipoSiniestro !== 'P' &&
        !esCMCoaseguro &&
        (values.coaseguros.length > 0 || values.reaseguros.length > 0)
      ) {
        callback('No se ha enviado notificacion Coaseguro y/o Reaseguro');
        return;
      }

      if (tipoSiniestro === 'P' && !cerrarSiniestroValue) {
        callback('Debe cerrar el siniestro o pasarlo a Normal');
        return;
      }
    }
    callback();
  };

  render() {
    const {
      dataPoliza,
      disabledGeneral,
      showScroll,
      esEjecutivo,
      esAjustador,
      userClaims,
      idCurrentTask,
      redirectToPath,
      form,
      flagModificar,
      currentTask,
      numSiniestro,
      getCoasegurosYReaseguros,
      ErrorCorreosSegurosHandler,
      form: { getFieldDecorator, getFieldValue }
    } = this.props;
    const esSiniestroPreventivo = getFieldValue('tipoSiniestro') === 'P';
    const { indCargaMasiva } = getFieldValue('siniestro') || {};
    const reaseguros = (dataPoliza && dataPoliza.reaseguros) || [];
    const reasegurosFiltrados = [];
    const ramosSiniestro = [];
    const { ramosCoberturas = [] } = getFieldValue('dataRamosCoberturas') || {};
    ramosCoberturas.forEach(ramo => {
      ramosSiniestro.push(ramo.codRamo);
    });
    reaseguros.forEach(rea => {
      if (ramosSiniestro.includes(rea.codRamo)) {
        reasegurosFiltrados.push(rea);
      }
    });
    const tienePoliza = !!(dataPoliza || {}).numPoliza;
    return (
      <Form.Item help="" validateStatus="">
        {getFieldDecorator('poliza', {
          initialValue: {
            nomContratante: (dataPoliza && dataPoliza.nombreContratante) || '',
            numPoliza: (dataPoliza && dataPoliza.numPoliza) || '',
            polizaLider: (dataPoliza && dataPoliza.polizaLider) || '',
            canal: (dataPoliza && dataPoliza.canal) || '',
            idePol: (dataPoliza && dataPoliza.idePoliza) || '',
            idPoliza: (dataPoliza && dataPoliza.idPoliza) || '',
            licitaciones: (dataPoliza && dataPoliza.indCuentaEstado) || '',
            indNotifReaCoa: (dataPoliza && dataPoliza.indNotifReaCoa) || 'N',
            indNotifCorredor: (dataPoliza && dataPoliza.indNotifCorredor) || '',
            coaseguros: (dataPoliza && dataPoliza.coaseguros) || [],
            reaseguros: reasegurosFiltrados,
            corredor: (dataPoliza && dataPoliza.corredor) || {}
          },
          rules: [{ validator: this.checkPoliza }]
        })(
          <PolizaFormItem
            indCargaMasiva={indCargaMasiva}
            form={form}
            getCoasegurosYReaseguros={getCoasegurosYReaseguros}
            esSiniestroPreventivo={esSiniestroPreventivo}
            idCurrentTask={idCurrentTask}
            tienePoliza={tienePoliza}
            showScroll={showScroll}
            userClaims={userClaims}
            numSiniestro={numSiniestro}
            esAjustador={esAjustador}
            esEjecutivo={esEjecutivo}
            redirectToPath={redirectToPath}
            disabledGeneral={disabledGeneral}
            currentTask={currentTask}
            flagModificar={flagModificar}
            ErrorCorreosSegurosHandler={ErrorCorreosSegurosHandler}
            // Validaciones
            validacionBotonReemplazarCorredor={validacionBotonReemplazarCorredor}
            validacionInputEjecutivoCorredor={validacionInputEjecutivoCorredor}
            validacionInputEmailCorredor={validacionInputEmailCorredor}
            validacionGrillaSeguros={validacionGrillaSeguros}
            validacionInputEmailSeguros={validacionInputEmailSeguros}
            validacionBotonEnviarEmails={validacionBotonEnviarEmails}
            validacionPolizaLider={validacionPolizaLider}
          />
        )}
      </Form.Item>
    );
  }
}

const mapStateToProps = state => {
  const esEjecutivo = getEsTipoUsuarioEjecutivo(state);
  const esAjustador = getEsTipoUsuarioAjustador(state);
  const tipoFlujo = getTipoSiniestro(state);
  const branches = getRamos(state);
  return {
    esEjecutivo,
    esAjustador,
    branches,
    tipoFlujo,
    showScroll: state.services.device.scrollActivated
  };
};

export default connect(mapStateToProps)(DataPolizaSections);
