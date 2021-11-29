/* eslint-disable no-useless-return */
/* eslint-disable no-else-return */
/* eslint-disable radix */
import React, { Component } from 'react';
import CargarDocumentoTabla from 'scenes/components/SectionCargarDocumento/CargarDocumentoTabla';
import { showErrorMessage } from 'util/index';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Row, Col, Form, Button, Select, Upload, Icon, Input, message } from 'antd';
import * as typeDocumentActionCreators from 'scenes/components/SectionCargarDocumento/data/typeDocument/action';
import * as subTypeDocumentActionCreator from 'scenes/components/SectionCargarDocumento/data/subTypeDocument/action';
import { getIndFacultativo } from 'scenes/TaskTray/components/SectionDataCobertura/data/coveragesAdjusters/reducer';
import { getDocuments } from 'scenes/TaskTray/components/SectionDocumentSinister/data/documents/reducer';
import { getDataSinister } from 'scenes/TaskTray/components/SectionDataSinister/data/dataSinister/reducer';
import { getReaseguros } from 'scenes/TaskTray/components/SectionDataPoliza/data/dataPoliza/reducer';
import { obtenerDatoInforme } from 'scenes/TaskTray/components/SectionDataReport/data/datosInforme/reducer';
import { getParamGeneral } from 'services/types/reducer';
import { getSaveDocument } from 'scenes/data/documento/reducer';
import { getBitacora } from 'scenes/TaskTray/components/SectionBitacora/data/bitacora/reducer';

import { TAREAS, DOCUMENTOS, CARGA_DOCUMENTOS } from 'constants/index';

class SectionCargarDocumento extends Component {
  constructor(props) {
    super(props);
    this.state = {
      i: 0,
      idSubTipo: null,
      disabledSubType: true,
      disabledDescription: true,
      disabledButton: true
    };
  }

  componentDidMount = () => {
    const { dispatch, errorTypeDocument } = this.props;

    dispatch(typeDocumentActionCreators.fetchTypeDocument()).finally(() => {
      if (errorTypeDocument) {
        showErrorMessage(errorTypeDocument.message);
      }
    });
  };

  componentWillUnmount() {
    const { dispatch } = this.props;

    dispatch(typeDocumentActionCreators.fetchTypeDocumentReset());
    dispatch(subTypeDocumentActionCreator.fetchSubTypeDocumentReset());
  }

  existeSubtipoDocumento = (idSubTipo, documents) => {
    const { currentTask: { idTareaBitacora, idTarea } = {} } = this.props;

    const documentsDataItem = [];

    documents.map((doc, index) => {
      const { archivos = [], idSubTipoArchivo } = doc;
      archivos.map((arch, indexindex) => {
        const obj = {};
        Object.assign(
          obj,
          { key: index + indexindex },
          { idSubTipo: idSubTipoArchivo },
          { idBitacora: arch.idTareaBitacora }
        );
        documentsDataItem.push(obj);
        return { documentsDataItem };
      });
      return { documentsDataItem };
    });

    const documentosPorTarea = documentsDataItem.filter(
      doc => doc.idSubTipo === idSubTipo && doc.idBitacora === idTareaBitacora
    );

    const documentosUnicos = documentsDataItem.filter(doc => doc.idSubTipo === idSubTipo);

    const yaTieneDoc = documentosPorTarea.length >= 1;

    if (
      idTarea === TAREAS.REVISAR_INFORME_BASICO ||
      idTarea === TAREAS.REVISAR_INFORME ||
      idTarea === TAREAS.ANALIZAR_SINIESTRO
    ) {
      const yaTieneDocUnico = documentosUnicos.length >= 1;
      if (yaTieneDocUnico) {
        return true;
      }
      return false;
    }

    if (yaTieneDoc) {
      return true;
    }
    return false;
  };

  existeSubtipoDocumentoLocalmente = (idSubTipo, listaDocumentos) => {
    const tendraTotalSubTipo =
      listaDocumentos && listaDocumentos != null ? listaDocumentos.filter(doc => doc.subTipo === idSubTipo) : 0;

    const tendraDoc = tendraTotalSubTipo.length >= 1;

    if (tendraDoc) {
      return true;
    }
    return false;
  };

  /**
   * Busca el tipo de documento solicitado en las listas de documentos que se le mande.
   *
   * Si se envían las dos listas, se validará primero los documentos cargados en el front.
   *
   * @param {number} idTipoDocumento - Id del tipo de documento que se desea buscar.
   * @param {array} documentosCargados - Lista de documentos cargados en el front pero no enviados al s3.
   * @param {array} documentosEnviados - lista de documentos enviados al s3.
   * @return {boolean} si encontró el documento en la lista enviada devuelve True, sino False.
   *
   */
  validarDocumentosCoa = (idTipoDocumento, documentosCargados = [], documentosEnviados = []) => {
    const existeDocumentoLocal = documentosCargados.some(doc => doc.subTipo === idTipoDocumento);
    if (existeDocumentoLocal) {
      return true;
    }

    const existeDocumento = documentosEnviados.some(doc => doc.idSubTipoArchivo === idTipoDocumento);
    if (existeDocumento) {
      return true;
    }
    return false;
  };

  checkDocumentos = (rule, value, callback) => {
    const {
      documents: { documents = [] } = {},
      currentTask: { idTarea } = {},
      dataSinister: { codTipoSiniestro: tipoSiniestroServicio },
      form: { getFieldValue },
      reaseguros,
      dataInforme: { indIdiomaIngles, indIdiomaEspaniol } = {},
      bitacora: { bitacora } = {},
      esDevolver
    } = this.props;

    const { listaDocumentos } = getFieldValue('documentos');

    const existeAnalizarSiniestro = bitacora.filter(bit => bit.tipoActividad === 'ANALIZAR SINIESTRO');
    const inicioAnalizarSiniestro = existeAnalizarSiniestro.length >= 1;

    const coberturaLista = getFieldValue('dataRamosCoberturas') || {};
    const siniestro = getFieldValue('siniestro') || {};
    let listaRamosCobertura = [];

    (coberturaLista.ramosCoberturas || []).forEach(ramo => {
      listaRamosCobertura = ramo.coberturas;
    });

    const coberturaNoRechazada = listaRamosCobertura.filter(cob => cob.indSinCobertura === 'N');
    const tieneCoberturaNoRechazada = coberturaNoRechazada.length >= 1;

    const esEspaniolDefault = !indIdiomaIngles && !indIdiomaEspaniol;
    const esEspaniol = indIdiomaEspaniol === 'S' || esEspaniolDefault;
    const esIngles = indIdiomaIngles === 'S';
    const tieneReaseguro = reaseguros.length >= 1;
    const indInformeFinal = getFieldValue('informeFinal');
    const esInformeFinal = indInformeFinal === 'S';

    const esCMCoaseguros = siniestro.indCargaMasiva === 'COA';

    const {
      TIPOS: {
        POLIZA: {
          SUBTIPOS: {
            POLIZA: { ID: SUBTIPO_POLIZA_ID }
          }
        },
        CORREO_SUSTENTO: {
          SUBTIPOS: {
            CORREO_SUSTENTO_ASIGNAR_AJUSTADOR: { ID: SUBTIPO_CORREO_ASIGNAR_AJUSTADOR_ID },
            CORREO_SUSTENTO_DESESTIMIENTO: { ID: SUBTIPO_CORREO_DESESTIMIENTO_ID }
          }
        },
        SUSTENTO: {
          SUBTIPOS: {
            SUSTENTO: { ID: SUBTIPO_SUSTENTO_ID }
          }
        },
        INFORMES: {
          SUBTIPOS: {
            INFORME_BASICO_ESPANIOL: { ID: SUBTIPO_INFORME_BASICO_ESPANIOL_ID },
            INFORME_FINAL_ESPANIOL: { ID: SUBTIPO_INFORME_FINAL_ESPANIOL_ID },
            INFORME_PRELIMINAR_O_COMPLEMENTARIO_ESPANIOL: {
              ID: SUBTIPO_INFORME_PRELIMINAR_O_COMPLEMENTARIO_ESPANIOL_ID
            },
            INFORME_BASICO_INGLES: { ID: SUBTIPO_INFORME_BASICO_INGLES_ID },
            INFORME_FINAL_INGLES: { ID: SUBTIPO_INFORME_FINAL_INGLES_ID },
            INFORME_PRELIMINAR_O_COMPLEMENTARIO_INGLES: { ID: SUBTIPO_INFORME_PRELIMINAR_O_COMPLEMENTARIO_INGLES_ID }
          }
        },
        CARGO_DE_RECHAZO: {
          SUBTIPOS: {
            CARGO_DE_RECHAZO: { ID: SUBTIPO_CARGO_RECHAZO_ID }
          }
        },
        CARTAS: {
          SUBTIPOS: {
            CARTA_DE_CIERRE: { ID: SUBTIPO_CARTA_DE_CIERRE_ID }
          }
        }
      }
    } = DOCUMENTOS;

    if (idTarea === TAREAS.ANALIZAR_SINIESTRO) {
      const { codTipoSiniestro, indCerrarSiniestro: seCierraSiniestro, indCargaMasiva } = getFieldValue('siniestro');

      const indReqAjustador = getFieldValue('ajustadorRequerido');

      const seMantienePreventivo = tipoSiniestroServicio === 'P' && codTipoSiniestro === 'P';

      if (esCMCoaseguros) {
        if (esInformeFinal) {
          // VALIDANDO CARGA DE INFORME BASICO FINAL ESPAÑOL O INGLES
          // VALIDANDO DOCUMENTO DE SUSTENTO

          const existeInformeFinalEspaniolEnviado = this.validarDocumentosCoa(
            SUBTIPO_INFORME_FINAL_ESPANIOL_ID,
            undefined,
            documents
          );

          const existeInformeFinalInglesEnviado = this.validarDocumentosCoa(
            SUBTIPO_INFORME_FINAL_INGLES_ID,
            undefined,
            documents
          );

          const existeDocumentoSustentoEnviado = this.validarDocumentosCoa(SUBTIPO_SUSTENTO_ID, undefined, documents);

          if (
            !existeInformeFinalEspaniolEnviado &&
            !existeInformeFinalInglesEnviado &&
            !existeDocumentoSustentoEnviado
          ) {
            const existeInformeFinalEspaniolCargado = this.validarDocumentosCoa(
              SUBTIPO_INFORME_FINAL_ESPANIOL_ID,
              listaDocumentos
            );

            const existeInformeFinalInglesCargado = this.validarDocumentosCoa(
              SUBTIPO_INFORME_FINAL_INGLES_ID,
              listaDocumentos
            );

            const existeDocumentoSustentoCargado = this.validarDocumentosCoa(SUBTIPO_SUSTENTO_ID, listaDocumentos);

            if (
              !existeInformeFinalEspaniolCargado &&
              !existeInformeFinalInglesCargado &&
              !existeDocumentoSustentoCargado
            ) {
              callback(
                'Debe cargar y enviar los documentos: Informe final español, Informe final inglés o Documento de sustento'
              );
              return;
            }
            callback('Debe enviar los documentos: Informe final español, Informe final inglés o Documento de sustento');
            return;
          }
        }

        callback();
        return;
      }

      if (seMantienePreventivo) {
        if (seCierraSiniestro) {
          const existeSubtipoDocumento = this.existeSubtipoDocumento(SUBTIPO_CORREO_DESESTIMIENTO_ID, documents);
          if (!existeSubtipoDocumento) {
            const existeSubTipoLocalmente = this.existeSubtipoDocumentoLocalmente(
              SUBTIPO_CORREO_DESESTIMIENTO_ID,
              listaDocumentos
            );
            if (!existeSubTipoLocalmente) {
              callback(CARGA_DOCUMENTOS.CARGAR_Y_ENVIAR_CORREO_SUSTENTO_DESESTIMIENTO);
              return;
            }
            callback(CARGA_DOCUMENTOS.ENVIAR_CORREO_SUSTENTO_DESESTIMIENTO);
            return;
          }
        }
      }

      if (seCierraSiniestro) {
        const existeSubtipoDocumento = this.existeSubtipoDocumento(SUBTIPO_CARTA_DE_CIERRE_ID, documents);
        if (!existeSubtipoDocumento) {
          const existeSubTipoLocalmente = this.existeSubtipoDocumentoLocalmente(
            SUBTIPO_CARTA_DE_CIERRE_ID,
            listaDocumentos
          );
          if (!existeSubTipoLocalmente) {
            callback(CARGA_DOCUMENTOS.CARGAR_Y_ENVIAR_CARTA_DE_CIERRE);
            return;
          }
          callback(CARGA_DOCUMENTOS.ENVIAR_CARTA_DE_CIERRE);
          return;
        }
      }

      const cambioDePreventivoANormal = tipoSiniestroServicio === 'P' && codTipoSiniestro === 'N';

      const requiereAjustador = indReqAjustador === 'S';

      if (requiereAjustador) {
        if (cambioDePreventivoANormal || tieneReaseguro) {
          const existeSubTipo = this.existeSubtipoDocumento(SUBTIPO_CORREO_ASIGNAR_AJUSTADOR_ID, documents);
          if (!existeSubTipo && !seCierraSiniestro && tieneCoberturaNoRechazada) {
            const existeSubTipoLocalmente = this.existeSubtipoDocumentoLocalmente(
              SUBTIPO_CORREO_ASIGNAR_AJUSTADOR_ID,
              listaDocumentos
            );
            if (!existeSubTipoLocalmente) {
              callback(CARGA_DOCUMENTOS.CARGAR_Y_ENVIAR_CORREO_SUSTENTO_ASIGNAR_AJUSTADOR);
              return;
            }
            callback(CARGA_DOCUMENTOS.ENVIAR_CORREO_SUSTENTO_ASIGNAR_AJUSTADOR);
            return;
          }
        }
      }

      const existeSubTipo = this.existeSubtipoDocumento(SUBTIPO_POLIZA_ID, documents);
      if (!existeSubTipo && indCargaMasiva !== 'PT') {
        if (codTipoSiniestro === 'P') {
          callback();
          return;
        } else {
          const existeSubTipoLocalmente = this.existeSubtipoDocumentoLocalmente(SUBTIPO_POLIZA_ID, listaDocumentos);
          if (!existeSubTipoLocalmente) {
            callback(CARGA_DOCUMENTOS.CARGAR_Y_ENVIAR_POLIZA);
            return;
          }
          callback(CARGA_DOCUMENTOS.ENVIAR_POLIZA);
          return;
        }
      }

      callback();
      return;
    }

    if (idTarea === TAREAS.REVISAR_INFORME) {
      const { codTipoSiniestro, indCerrarSiniestro: seCierraSiniestro } = getFieldValue('siniestro');

      const indReqAjustador = getFieldValue('ajustadorRequerido');

      const requiereAjustador = indReqAjustador === 'S';

      if (esDevolver) {
        if (requiereAjustador) {
          if (tieneReaseguro) {
            const existeSubtipoDocumento = this.existeSubtipoDocumento(SUBTIPO_CORREO_ASIGNAR_AJUSTADOR_ID, documents);
            if (
              !existeSubtipoDocumento &&
              !seCierraSiniestro &&
              !inicioAnalizarSiniestro &&
              tieneCoberturaNoRechazada
            ) {
              const existeSubTipoLocalmente = this.existeSubtipoDocumentoLocalmente(
                SUBTIPO_CORREO_ASIGNAR_AJUSTADOR_ID,
                listaDocumentos
              );
              if (!existeSubTipoLocalmente) {
                callback(CARGA_DOCUMENTOS.CARGAR_Y_ENVIAR_CORREO_SUSTENTO_ASIGNAR_AJUSTADOR);
                return;
              }
              callback(CARGA_DOCUMENTOS.ENVIAR_CORREO_SUSTENTO_ASIGNAR_AJUSTADOR);
              return;
            }
          }
        }
      } else {
        if (requiereAjustador) {
          if (tieneReaseguro) {
            const existeSubtipoDocumento = this.existeSubtipoDocumento(SUBTIPO_CORREO_ASIGNAR_AJUSTADOR_ID, documents);
            if (
              !existeSubtipoDocumento &&
              !seCierraSiniestro &&
              !inicioAnalizarSiniestro &&
              tieneCoberturaNoRechazada
            ) {
              const existeSubTipoLocalmente = this.existeSubtipoDocumentoLocalmente(
                SUBTIPO_CORREO_ASIGNAR_AJUSTADOR_ID,
                listaDocumentos
              );
              if (!existeSubTipoLocalmente) {
                callback(CARGA_DOCUMENTOS.CARGAR_Y_ENVIAR_CORREO_SUSTENTO_ASIGNAR_AJUSTADOR);
                return;
              }
              callback(CARGA_DOCUMENTOS.ENVIAR_CORREO_SUSTENTO_ASIGNAR_AJUSTADOR);
              return;
            }
          }
        }

        if (seCierraSiniestro) {
          const existeSubtipoDocumento = this.existeSubtipoDocumento(SUBTIPO_CARTA_DE_CIERRE_ID, documents);
          if (!existeSubtipoDocumento) {
            const existeSubTipoLocalmente = this.existeSubtipoDocumentoLocalmente(
              SUBTIPO_CARTA_DE_CIERRE_ID,
              listaDocumentos
            );
            if (!existeSubTipoLocalmente) {
              callback(CARGA_DOCUMENTOS.CARGAR_Y_ENVIAR_CARTA_DE_CIERRE);
              return;
            }
            callback(CARGA_DOCUMENTOS.ENVIAR_CARTA_DE_CIERRE);
            return;
          }
        }

        const existeSubTipo = this.existeSubtipoDocumento(SUBTIPO_POLIZA_ID, documents);
        if (!existeSubTipo && !inicioAnalizarSiniestro) {
          if (codTipoSiniestro === 'P') {
            callback();
            return;
          } else {
            const existeSubTipoLocalmente = this.existeSubtipoDocumentoLocalmente(SUBTIPO_POLIZA_ID, listaDocumentos);
            if (!existeSubTipoLocalmente) {
              callback(CARGA_DOCUMENTOS.CARGAR_Y_ENVIAR_POLIZA);
              return;
            }
            callback(CARGA_DOCUMENTOS.ENVIAR_POLIZA);
            return;
          }
        }
      }
      callback();
      return;
    }

    if (idTarea === TAREAS.REVISAR_INFORME_BASICO) {
      const { codTipoSiniestro, indCerrarSiniestro: seCierraSiniestro } = getFieldValue('siniestro');

      const indReqAjustador = getFieldValue('ajustadorRequerido');

      const requiereAjustador = indReqAjustador === 'S';

      if (esDevolver) {
        if (requiereAjustador) {
          if (tieneReaseguro) {
            const existeSubtipoDocumento = this.existeSubtipoDocumento(SUBTIPO_CORREO_ASIGNAR_AJUSTADOR_ID, documents);
            if (
              !existeSubtipoDocumento &&
              !seCierraSiniestro &&
              !inicioAnalizarSiniestro &&
              tieneCoberturaNoRechazada
            ) {
              const existeSubTipoLocalmente = this.existeSubtipoDocumentoLocalmente(
                SUBTIPO_CORREO_ASIGNAR_AJUSTADOR_ID,
                listaDocumentos
              );
              if (!existeSubTipoLocalmente) {
                callback(CARGA_DOCUMENTOS.CARGAR_Y_ENVIAR_CORREO_SUSTENTO_ASIGNAR_AJUSTADOR);
                return;
              }
              callback(CARGA_DOCUMENTOS.ENVIAR_CORREO_SUSTENTO_ASIGNAR_AJUSTADOR);
              return;
            }
          }
        }
      } else {
        if (requiereAjustador) {
          if (tieneReaseguro) {
            const existeSubtipoDocumento = this.existeSubtipoDocumento(SUBTIPO_CORREO_ASIGNAR_AJUSTADOR_ID, documents);
            if (
              !existeSubtipoDocumento &&
              !seCierraSiniestro &&
              !inicioAnalizarSiniestro &&
              tieneCoberturaNoRechazada
            ) {
              const existeSubTipoLocalmente = this.existeSubtipoDocumentoLocalmente(
                SUBTIPO_CORREO_ASIGNAR_AJUSTADOR_ID,
                listaDocumentos
              );
              if (!existeSubTipoLocalmente) {
                callback(CARGA_DOCUMENTOS.CARGAR_Y_ENVIAR_CORREO_SUSTENTO_ASIGNAR_AJUSTADOR);
                return;
              }
              callback(CARGA_DOCUMENTOS.ENVIAR_CORREO_SUSTENTO_ASIGNAR_AJUSTADOR);
              return;
            }
          }
        }

        if (seCierraSiniestro) {
          const existeSubtipoDocumento = this.existeSubtipoDocumento(SUBTIPO_CARTA_DE_CIERRE_ID, documents);
          if (!existeSubtipoDocumento) {
            const existeSubTipoLocalmente = this.existeSubtipoDocumentoLocalmente(
              SUBTIPO_CARTA_DE_CIERRE_ID,
              listaDocumentos
            );
            if (!existeSubTipoLocalmente) {
              callback(CARGA_DOCUMENTOS.CARGAR_Y_ENVIAR_CARTA_DE_CIERRE);
              return;
            }
            callback(CARGA_DOCUMENTOS.ENVIAR_CARTA_DE_CIERRE);
            return;
          }
        }

        const existeSubTipo = this.existeSubtipoDocumento(SUBTIPO_POLIZA_ID, documents);
        if (!existeSubTipo && !inicioAnalizarSiniestro) {
          if (codTipoSiniestro === 'P') {
            callback();
            return;
          } else {
            const existeSubTipoLocalmente = this.existeSubtipoDocumentoLocalmente(SUBTIPO_POLIZA_ID, listaDocumentos);
            if (!existeSubTipoLocalmente) {
              callback(CARGA_DOCUMENTOS.CARGAR_Y_ENVIAR_POLIZA);
              return;
            }
            callback(CARGA_DOCUMENTOS.ENVIAR_POLIZA);
            return;
          }
        }
      }
      callback();
      return;
    }

    if (idTarea === TAREAS.GENERAR_INFORME_BASICO) {
      if (!esInformeFinal) {
        if (esEspaniol) {
          const existeSubTipo = this.existeSubtipoDocumento(SUBTIPO_INFORME_BASICO_ESPANIOL_ID, documents);

          if (!existeSubTipo) {
            const existeSubTipoLocalmente = this.existeSubtipoDocumentoLocalmente(
              SUBTIPO_INFORME_BASICO_ESPANIOL_ID,
              listaDocumentos
            );
            if (!existeSubTipoLocalmente) {
              callback(CARGA_DOCUMENTOS.CARGAR_Y_ENVIAR_INFORME_BASICO_ESPANIOL);
              return;
            }
            callback(CARGA_DOCUMENTOS.ENVIAR_INFORME_BASICO_ESPANIOL);
            return;
          }
        }

        if (esIngles) {
          const existeSubTipo = this.existeSubtipoDocumento(SUBTIPO_INFORME_BASICO_INGLES_ID, documents);
          if (!existeSubTipo) {
            const existeSubTipoLocalmente = this.existeSubtipoDocumentoLocalmente(
              SUBTIPO_INFORME_BASICO_INGLES_ID,
              listaDocumentos
            );
            if (!existeSubTipoLocalmente) {
              callback(CARGA_DOCUMENTOS.CARGAR_Y_ENVIAR_INFORME_BASICO_INGLES);
              return;
            }
            callback(CARGA_DOCUMENTOS.ENVIAR_INFORME_BASICO_INGLES);
            return;
          }
        }
      } else if (esInformeFinal) {
        if (esEspaniol) {
          const existeSubTipo = this.existeSubtipoDocumento(SUBTIPO_INFORME_FINAL_ESPANIOL_ID, documents);
          if (!existeSubTipo) {
            const existeSubTipoLocalmente = this.existeSubtipoDocumentoLocalmente(
              SUBTIPO_INFORME_FINAL_ESPANIOL_ID,
              listaDocumentos
            );
            if (!existeSubTipoLocalmente) {
              callback(CARGA_DOCUMENTOS.CARGAR_Y_ENVIAR_INFORME_FINAL_ESPANIOL);
              return;
            }
            callback(CARGA_DOCUMENTOS.ENVIAR_INFORME_FINAL_ESPANIOL);
            return;
          }
        }

        if (esIngles) {
          const existeSubTipo = this.existeSubtipoDocumento(SUBTIPO_INFORME_FINAL_INGLES_ID, documents);
          if (!existeSubTipo) {
            const existeSubTipoLocalmente = this.existeSubtipoDocumentoLocalmente(
              SUBTIPO_INFORME_FINAL_INGLES_ID,
              listaDocumentos
            );
            if (!existeSubTipoLocalmente) {
              callback(CARGA_DOCUMENTOS.CARGAR_Y_ENVIAR_INFORME_FINAL_INGLES);
              return;
            }
            callback(CARGA_DOCUMENTOS.ENVIAR_INFORME_FINAL_INGLES);
            return;
          }
        }
      }
      callback();
      return;
    }

    if (idTarea === TAREAS.ADJUNTAR_CARGO_DE_RECHAZO) {
      const existeSubTipo = this.existeSubtipoDocumento(SUBTIPO_CARGO_RECHAZO_ID, documents);
      if (!existeSubTipo) {
        const existeSubTipoLocalmente = this.existeSubtipoDocumentoLocalmente(
          SUBTIPO_CARGO_RECHAZO_ID,
          listaDocumentos
        );
        if (!existeSubTipoLocalmente) {
          callback(CARGA_DOCUMENTOS.CARGAR_Y_ENVIAR_CARGO_RECHAZO);
          return;
        }
        callback(CARGA_DOCUMENTOS.ENVIAR_CARGO_RECHAZO);
        return;
      }

      callback();
      return;
    }

    if (idTarea === TAREAS.GENERAR_INFORME) {
      if (!esInformeFinal) {
        if (esEspaniol) {
          const existeSubTipo = this.existeSubtipoDocumento(
            SUBTIPO_INFORME_PRELIMINAR_O_COMPLEMENTARIO_ESPANIOL_ID,
            documents
          );
          if (!existeSubTipo) {
            const existeSubTipoLocalmente = this.existeSubtipoDocumentoLocalmente(
              SUBTIPO_INFORME_PRELIMINAR_O_COMPLEMENTARIO_ESPANIOL_ID,
              listaDocumentos
            );
            if (!existeSubTipoLocalmente) {
              callback(CARGA_DOCUMENTOS.CARGAR_Y_ENVIAR_INFORME_PRELIMINAR_O_COMPLEMENTARIO_ESPANIOL);
              return;
            }
            callback(CARGA_DOCUMENTOS.ENVIAR_INFORME_PRELIMINAR_O_COMPLEMENTARIO_ESPANIOL);
            return;
          }
        }

        if (esIngles) {
          const existeSubTipo = this.existeSubtipoDocumento(
            SUBTIPO_INFORME_PRELIMINAR_O_COMPLEMENTARIO_INGLES_ID,
            documents
          );
          if (!existeSubTipo) {
            const existeSubTipoLocalmente = this.existeSubtipoDocumentoLocalmente(
              SUBTIPO_INFORME_PRELIMINAR_O_COMPLEMENTARIO_INGLES_ID,
              listaDocumentos
            );
            if (!existeSubTipoLocalmente) {
              callback(CARGA_DOCUMENTOS.CARGAR_Y_ENVIAR_INFORME_PRELIMINAR_O_COMPLEMENTARIO_INGLES);
              return;
            }
            callback(CARGA_DOCUMENTOS.ENVIAR_INFORME_PRELIMINAR_O_COMPLEMENTARIO_INGLES);
            return;
          }
        }
      } else if (esInformeFinal) {
        if (esEspaniol) {
          const existeSubTipo = this.existeSubtipoDocumento(SUBTIPO_INFORME_FINAL_ESPANIOL_ID, documents);
          if (!existeSubTipo) {
            const existeSubTipoLocalmente = this.existeSubtipoDocumentoLocalmente(
              SUBTIPO_INFORME_FINAL_ESPANIOL_ID,
              listaDocumentos
            );
            if (!existeSubTipoLocalmente) {
              callback(CARGA_DOCUMENTOS.CARGAR_Y_ENVIAR_INFORME_FINAL_ESPANIOL);
              return;
            }
            callback(CARGA_DOCUMENTOS.ENVIAR_INFORME_FINAL_ESPANIOL);
          }
        }
        if (esIngles) {
          const existeSubTipo = this.existeSubtipoDocumento(SUBTIPO_INFORME_FINAL_INGLES_ID, documents);
          if (!existeSubTipo) {
            const existeSubTipoLocalmente = this.existeSubtipoDocumentoLocalmente(
              SUBTIPO_INFORME_FINAL_INGLES_ID,
              listaDocumentos
            );
            if (!existeSubTipoLocalmente) {
              callback(CARGA_DOCUMENTOS.CARGAR_Y_ENVIAR_INFORME_FINAL_INGLES);
              return;
            }
            callback(CARGA_DOCUMENTOS.ENVIAR_INFORME_FINAL_INGLES);
            return;
          }
        }
      }
    }

    callback();
    return;
  };

  handleChangeTipo = (value, key) => {
    const {
      dispatch,
      errorSubTypeDocument,
      form: { resetFields }
    } = this.props;

    if (value && value !== null && value !== '') {
      this.setState(
        {
          disabledSubType: false
        },
        () => resetFields(['subTipoDocumento', 'descripcion']),
        this.setState({
          disabledDescription: true,
          disabledButton: true
        }),

        key.key > 0 &&
          dispatch(subTypeDocumentActionCreator.fetchSubTypeDocument(key.key)).finally(() => {
            if (errorSubTypeDocument) {
              showErrorMessage(errorSubTypeDocument.message);
            }
          })
      );
    } else {
      this.setState({
        disabledSubType: true,
        disabledDescription: true,
        disabledButton: true
      });
    }
  };

  handleChangeSub = (value, key) => {
    const {
      form: { resetFields }
    } = this.props;

    if (value && value !== null && value !== '') {
      this.setState(
        {
          idSubTipo: key.key,
          disabledDescription: false,
          disabledButton: true
        },
        () => resetFields(['descripcion'])
      );
    } else {
      this.setState({
        disabledDescription: true,
        disabledButton: true
      });
    }
  };

  handleChangeDesc = (evt, error) => {
    if (evt.target.value && !error) {
      this.setState({
        disabledButton: false
      });
    } else {
      this.setState({
        disabledButton: true
      });
    }
  };

  getBase64 = file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // const encoded = reader.result.replace(/^data:(.*;base64,)?/, '');
        const encoded = reader.result;
        resolve(encoded);
      };
      reader.onerror = error => reject(error);
    });
  };

  beforeUpload = file => {
    const isFormatValid =
      file.type === 'image/jpeg' ||
      file.type === 'image/jpg' ||
      file.type === 'image/png' ||
      file.type === 'application/pdf' ||
      file.type === 'application/vnd.ms-excel' ||
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'application/msword' ||
      file.type === 'application/wps-office.xlsx' ||
      file.type === 'application/wps-office.xls' ||
      file.type === 'application/wps-office.docx' ||
      file.type === 'application/wps-office.doc' ||
      file.type === 'text/html';

    const isSizeValid = file.size / 1024 / 1024 < 5;

    if (!isFormatValid) {
      message.error('Formato no permitido!');
    } else if (!isSizeValid) {
      message.error('Tamaño del archivo no debe ser mayor a 5MB!');
    } else {
      this.crearObjeto(file);
    }
    return false;
  };

  crearObjeto = async file => {
    const {
      ubicacionPantalla,
      disabledTipoDocumentoLegal,
      form: { getFieldValue, setFieldsValue, resetFields },
      documents: { documents = [] } = {}
    } = this.props;

    const { idSubTipo, i } = this.state;

    const {
      TIPOS: {
        INFORMES: {
          SUBTIPOS: {
            INFORME_FINAL_ESPANIOL: { ID: SUBTIPO_INFORME_FINAL_ESPANIOL_ID },
            INFORME_FINAL_INGLES: { ID: SUBTIPO_INFORME_FINAL_INGLES_ID }
          }
        }
      }
    } = DOCUMENTOS;

    const tipoDocumento = getFieldValue('tipoDocumento');
    const subTipoDocumento = getFieldValue('subTipoDocumento');
    const descripcion = getFieldValue('descripcion');

    const archivoCodificado = await this.getBase64(file).then(data => {
      return data;
    });

    const existeIngles = this.existeSubtipoDocumento(SUBTIPO_INFORME_FINAL_INGLES_ID, documents);

    const existeEspaniol = this.existeSubtipoDocumento(SUBTIPO_INFORME_FINAL_ESPANIOL_ID, documents);

    const docInglesEspaniol = existeIngles === true || existeEspaniol === true;

    const item = {
      key: i,
      tipodocumento: tipoDocumento,
      subtipoDesc: subTipoDocumento,
      nomArchivo: file.name,
      nomDocumento: descripcion,
      subTipo: idSubTipo ? parseInt(idSubTipo) : null,
      image: archivoCodificado,
      tamanioArchivo: file.size,
      existeDocumento: docInglesEspaniol
    };

    if (file.name) {
      this.setState({
        i: item.key + 1
      });
    }
    const valoresDocumento = getFieldValue('documentos') || { listaDocumentos: [] };

    setFieldsValue({
      documentos: { listaDocumentos: [...valoresDocumento.listaDocumentos, item] }
    });

    const pantallaLegal = ubicacionPantalla === 'recupero' || ubicacionPantalla === 'salvamento';

    if (pantallaLegal) {
      disabledTipoDocumentoLegal(true);
      this.setState({
        disabledSubType: true,
        disabledDescription: true,
        disabledButton: true
      });
    } else {
      this.setState({
        disabledSubType: true,
        disabledDescription: true,
        disabledButton: true
      });
    }

    resetFields(['tipoDocumento', 'subTipoDocumento', 'descripcion']);

    return false;
  };

  render() {
    const {
      disabledGeneral,
      showScroll,
      loadingTypeDocument,
      loadingSubTypeDocument,
      typeDocument,
      subTypeDocument,
      form,
      form: { getFieldDecorator },
      tamanioPaginacion,
      match: {
        params: { numSiniestro }
      },
      currentTask: { idTareaBitacora } = {},
      dataInforme,
      ubicacionPantalla,
      tipoDocumentoState,
      disabledTipoDocumentoLegal
    } = this.props;
    const { disabledSubType, disabledDescription, disabledButton } = this.state;

    // const tipoDocumentoError = isFieldTouched('tipoDocumento') && getFieldError('tipoDocumento');
    // const subTipoDocumentoError = isFieldTouched('subTipoDocumento') && getFieldError('subTipoDocumento');
    // const descripcionError = isFieldTouched('descripcion') && getFieldError('descripcion');

    const pantallaLegal = ubicacionPantalla === 'recupero' || ubicacionPantalla === 'salvamento';

    let typeDocumentItems = null;
    let tipoLegal = null;

    if (!pantallaLegal) {
      typeDocumentItems = typeDocument.map(item => (
        <Select.Option key={item.id} value={item.nombreTipo}>
          {item.nombreTipo}
        </Select.Option>
      ));
    } else {
      const obtenerTipoLegal = typeDocument.filter(legal => legal.id === 4);

      tipoLegal = obtenerTipoLegal.map(item => (
        <Select.Option key={item.id} value={item.nombreTipo}>
          {item.nombreTipo}
        </Select.Option>
      ));
    }

    let subTypeDocumentItems = null;
    let tipoRecupero = null;

    if (!pantallaLegal) {
      subTypeDocumentItems = subTypeDocument.map(item => (
        <Select.Option key={item.id} value={item.nombreSubTipo}>
          {item.nombreSubTipo}
        </Select.Option>
      ));
    } else if (ubicacionPantalla === 'recupero') {
      const obtenerTipoRecupero = subTypeDocument.filter(legal => legal.id === 8);
      tipoRecupero = obtenerTipoRecupero.map(item => (
        <Select.Option key={item.id} value={item.nombreSubTipo}>
          {item.nombreSubTipo}
        </Select.Option>
      ));
    } else if (ubicacionPantalla === 'salvamento') {
      const obtenerTipoRecupero = subTypeDocument.filter(legal => legal.id === 7);
      tipoRecupero = obtenerTipoRecupero.map(item => (
        <Select.Option key={item.id} value={item.nombreSubTipo}>
          {item.nombreSubTipo}
        </Select.Option>
      ));
    }

    return (
      <div>
        <Row gutter={24}>
          <Col xs={24} sm={12} md={12} lg={6} xl={4}>
            <Form.Item label="Tipo documento">
              {getFieldDecorator('tipoDocumento')(
                <Select
                  placeholder="Seleccione tipo"
                  onChange={this.handleChangeTipo}
                  disabled={disabledGeneral || tipoDocumentoState}
                  loading={loadingTypeDocument}
                >
                  {pantallaLegal ? tipoLegal : typeDocumentItems}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={12} lg={6} xl={7}>
            <Form.Item label="Subtipo">
              {getFieldDecorator('subTipoDocumento')(
                <Select
                  placeholder="Seleccione subtipo"
                  onChange={this.handleChangeSub}
                  loading={loadingSubTypeDocument}
                  disabled={disabledGeneral || disabledSubType}
                >
                  {pantallaLegal ? tipoRecupero : subTypeDocumentItems}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={24} lg={12} xl={10}>
            <Form.Item label="Descripci&oacute;n">
              {getFieldDecorator('descripcion')(
                <Input
                  placeholder="Descripción del documento"
                  maxLength={200}
                  onChange={this.handleChangeDesc}
                  disabled={disabledGeneral || disabledDescription}
                />
              )}
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={24} lg={4} xl={3} style={{ textAlign: 'right' }}>
            <Form.Item label=" " colon={false}>
              <Upload
                id="cargar-archivo"
                multiple={false}
                accept=".pdf,.jpg,.png,.jpeg,.doc,.docx,.xls,.xlsx,.html"
                showUploadList={false}
                beforeUpload={this.beforeUpload}
              >
                <Button type="primary" disabled={disabledGeneral || disabledButton}>
                  Documento <Icon type="file-add" />
                </Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            <Form.Item help="">
              {getFieldDecorator('documentos', {
                initialValue: {
                  listaDocumentos: []
                },
                rules: [{ validator: this.checkDocumentos }]
              })(
                <CargarDocumentoTabla
                  disabledGeneral={disabledGeneral}
                  showScroll={showScroll}
                  form={form}
                  tamanioPaginacion={tamanioPaginacion}
                  idBitacoraTarea={idTareaBitacora}
                  numSiniestro={numSiniestro}
                  dataInforme={dataInforme}
                  ubicacionPantalla={ubicacionPantalla}
                  disabledTipoDocumentoLegal={disabledTipoDocumentoLegal}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const {
    scenes: {
      components: {
        sectionCargarDocumento: {
          data: { typeDocument, subTypeDocument }
        }
      }
    }
  } = state;
  const documents = getDocuments(state);
  const dataSinister = getDataSinister(state);
  const reaseguros = getReaseguros(state);
  const dataInforme = obtenerDatoInforme(state);
  const tamanioPaginacion = getParamGeneral(state, 'TAMANIO_TABLA_PAGINA');
  const cargarDocumento = getSaveDocument(state);
  const bitacora = getBitacora(state);
  const indFacultativo = getIndFacultativo(state);
  return {
    typeDocument: typeDocument.typeDocument,
    loadingTypeDocument: typeDocument.isLoading,
    errorTypeDocument: typeDocument.error,
    subTypeDocument: subTypeDocument.subTypeDocument,
    loadingSubTypeDocument: subTypeDocument.isLoading,
    errorSubTypeDocument: subTypeDocument.error,
    cargarDocumento,
    loadingCargarDocumento: cargarDocumento.isLoading,
    documents,
    dataSinister,
    reaseguros,
    dataInforme,
    tamanioPaginacion,
    bitacora,
    indFacultativo
  };
}

export default withRouter(connect(mapStateToProps)(SectionCargarDocumento));
