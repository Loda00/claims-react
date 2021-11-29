import React from 'react';
import { Table, Tooltip, Popconfirm, Icon, Divider, message, Modal } from 'antd';
import { getSaveDocument } from 'scenes/data/documento/reducer';
import { connect } from 'react-redux';
import { DOCUMENTOS } from 'constants/index';
import { esUsuarioAjustador, showErrorMessage } from 'util/index';
import * as saveDocumentoCreators from 'scenes/data/documento/action';
import * as documentSinisterCreator from 'scenes/TaskTray/components/SectionDocumentSinister/data/documents/action';

class CargarDocumentoTabla extends React.Component {
  static getDerivedStateFromProps(nextProps) {
    if ('value' in nextProps) {
      return {
        ...(nextProps.value || {})
      };
    }
    return null;
  }

  constructor(props) {
    super(props);
    this.state = { listaDocumentos: [] };
  }

  triggerChange = changedValue => {
    const { onChange } = this.props;

    const onChanged = onChange;
    if (onChanged) {
      onChange(Object.assign({}, this.state, changedValue));
    }
  };

  handleDelete = key => {
    const {
      disabledGeneral,
      form: { setFieldsValue },
      disabledTipoDocumentoLegal,
      ubicacionPantalla
    } = this.props;

    const { listaDocumentos } = this.state;

    const pantallaLegal = ubicacionPantalla === 'recupero' || ubicacionPantalla === 'salvamento';

    if (!disabledGeneral) {
      const indexItem = listaDocumentos.indexOf(listaDocumentos.filter((item, index) => item.key === key)[0]);
      listaDocumentos.splice(indexItem, 1);

      setFieldsValue({
        documentos: { listaDocumentos: [...listaDocumentos] }
      });

      if (pantallaLegal) {
        disabledTipoDocumentoLegal(false);
      }
    }
  };

  handleEnviar = async record => {
    const { dispatch, numSiniestro, idBitacoraTarea, userClaims } = this.props;

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

    const esAjustador = esUsuarioAjustador(userClaims);

    const {
      form: { getFieldValue },
      dataInforme: { indIdiomaIngles, indIdiomaEspaniol } = {}
    } = this.props;

    const indInformeFinal = getFieldValue('informeFinal');
    const noEsInformeFinal = indInformeFinal !== 'S';

    const datosDocumento = [record];

    const verificarDocumentoFinal = datosDocumento.filter(
      doc => doc.subTipo === SUBTIPO_INFORME_FINAL_INGLES_ID || doc.subTipo === SUBTIPO_INFORME_FINAL_ESPANIOL_ID
    );

    if (noEsInformeFinal && verificarDocumentoFinal.length >= 1) {
      Modal.warning({
        title: 'Subir documento',
        content: (
          <div>
            <p>Para enviar éste documento, debe de indicar que es informe final.</p>
          </div>
        )
      });
      return;
    }

    const esEspaniolDefault = !indIdiomaIngles && !indIdiomaEspaniol;
    const esEspaniol = indIdiomaEspaniol === 'S' || esEspaniolDefault;
    const esIngles = indIdiomaIngles === 'S';

    const checkInformeEspaniol = datosDocumento.filter(doc => doc.subTipo === SUBTIPO_INFORME_FINAL_ESPANIOL_ID);

    if (checkInformeEspaniol.length >= 1 && !esEspaniol && esAjustador) {
      Modal.warning({
        title: 'Subir documento',
        content: (
          <div>
            <p>Para enviar éste documento debería estar marcado en idioma del informe: Español.</p>
          </div>
        )
      });
      return;
    }

    const checkInformeIngles = datosDocumento.filter(doc => doc.subTipo === SUBTIPO_INFORME_FINAL_INGLES_ID);

    if (checkInformeIngles.length >= 1 && !esIngles && esAjustador) {
      Modal.warning({
        title: 'Subir documento',
        content: (
          <div>
            <p>Para enviar éste documento debería estar marcado en idioma del informe: Ingles.</p>
          </div>
        )
      });
      return;
    }

    const documento = datosDocumento.map((item, index) => {
      let documentoInglesEspaniol = false;
      if (!noEsInformeFinal) {
        if (!item.existeInglesEspaniol && verificarDocumentoFinal) {
          documentoInglesEspaniol = true;
        }
      }
      return {
        key: index,
        tipodocumento: item.tipodocumento,
        subtipoDesc: item.subtipoDesc,
        nomDocumento: item.nomDocumento,
        nomArchivo: item.nomArchivo,
        image: item.image,
        subTipo: item.subTipo,
        indNotificacion: documentoInglesEspaniol
      };
    });

    try {
      const validar = 'U';
      const response = await dispatch(
        saveDocumentoCreators.fetchSaveDocument(validar, numSiniestro, idBitacoraTarea, documento)
      );
      if (response.code === 'CRG-000') {
        message.success('Se subió el documento');
        this.handleDelete(record.key);
        try {
          const subTipoDoc = null;
          dispatch(documentSinisterCreator.fetchDocuments(numSiniestro, subTipoDoc));
        } catch (e) {
          showErrorMessage(e);
        }
      }
    } catch (e) {
      showErrorMessage(e);
    }
  };

  render() {
    const { disabledGeneral, showScroll, tamanioPaginacion, loadingCargarDocumento, ubicacionPantalla } = this.props;

    const { listaDocumentos } = this.state;

    const pantallaLegal = ubicacionPantalla !== 'recupero' && ubicacionPantalla !== 'salvamento';

    const datos = listaDocumentos.map((item, index) => {
      return {
        key: item.key,
        tipodocumento: item.tipodocumento,
        subtipoDesc: item.subtipoDesc,
        nomDocumento: item.nomDocumento,
        nomArchivo: item.nomArchivo,
        image: item.image,
        subTipo: item.subTipo,
        existeInglesEspaniol: item.existeDocumento
      };
    });

    const columns = [
      {
        title: 'Tipo documento',
        dataIndex: 'tipodocumento',
        key: 'tipodocumento'
      },
      {
        title: 'Subtipo',
        dataIndex: 'subtipoDesc',
        key: 'subtipoDesc'
      },
      {
        title: 'Descripción',
        dataIndex: 'nomDocumento',
        key: 'nomDocumento',
        onCell: () => {
          return {
            style: {
              whiteSpace: 'nowrap',
              maxWidth: 180
            }
          };
        },
        render: text => {
          return (
            <Tooltip title={text} placement={showScroll ? 'bottom' : 'right'}>
              <div style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>{text}</div>
            </Tooltip>
          );
        }
      },
      {
        title: 'Documento',
        dataIndex: 'nomArchivo',
        key: 'nomArchivo'
      },
      {
        title: 'Acci\u00f3n',
        dataIndex: 'accion',
        key: 'accion',
        className: disabledGeneral ? 'hide' : 'show',
        render: (text, record) => (
          <React.Fragment>
            <Tooltip title="Eliminar">
              <Popconfirm title="Seguro de eliminar?" type="primary" onConfirm={() => this.handleDelete(record.key)}>
                <Icon type="delete" theme="filled" style={{ color: 'red', fontSize: '17px' }} />
              </Popconfirm>
            </Tooltip>
            {pantallaLegal && <Divider type="vertical" />}
            {pantallaLegal && (
              <Tooltip title="Enviar">
                <Icon
                  type="right"
                  style={{ color: 'red', fontSize: '17px' }}
                  onClick={() => this.handleEnviar(record)}
                />
              </Tooltip>
            )}
          </React.Fragment>
        )
      }
    ];

    return (
      <React.Fragment>
        {showScroll && (
          <Table
            id="tabla_carga_documentos"
            columns={columns}
            dataSource={datos}
            loading={loadingCargarDocumento}
            scroll={{ x: '100%' }}
            size="small"
            style={{ marginBottom: '10px' }}
            pagination={{ defaultPageSize: tamanioPaginacion }}
          />
        )}
        {!showScroll && (
          <Table
            id="tabla_carga_documentos"
            columns={columns}
            dataSource={datos}
            loading={loadingCargarDocumento}
            size="small"
            style={{ marginBottom: '10px' }}
            pagination={{ defaultPageSize: tamanioPaginacion }}
          />
        )}
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  const cargarDocumento = getSaveDocument(state);

  return {
    cargarDocumento,
    loadingCargarDocumento: cargarDocumento.isLoading,

    userClaims: state.services.user.userClaims
  };
}
export default connect(mapStateToProps)(CargarDocumentoTabla);
