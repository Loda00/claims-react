import React from 'react';
import { connect } from 'react-redux';
import { Table, Input, InputNumber, Tooltip, Form, Icon, Divider, Button } from 'antd';

import { isNullOrUndefined } from 'util';
import { ValidationMessage } from 'util/validation';

import { getParamGeneral } from 'services/types/reducer';
import { actUtlParametroLoading } from 'scenes/Administracion/data/actualizarUtlParametro/reducer';

import './style.css';

const ContextoEditable = React.createContext();

class ParametrosTabla extends React.Component {
  validarNumeroOrden = (rules, value, cb) => {
    if (value < 0 || (Number(value) !== 0 && !Number(value)) || value % 1 !== 0) {
      cb(ValidationMessage.NOT_VALID);
      return;
    }
    cb();
  };

  CeldaEditable = props => {
    const { loadingGuardarParametros } = this.props;

    const { title, record, editing, children, dataIndex, inputType, ...restProps } = props;

    const {
      form: { getFieldError }
    } = this.props;

    const errorDscParametro = getFieldError('dscParametro');
    const errorNumOrden = getFieldError('numOrden');
    const errorDscTooltip = getFieldError('dscTooltip');

    const obtenerInput = index => {
      if (inputType === 'number') {
        return <InputNumber disabled={loadingGuardarParametros} maxLength={5} min={0} max={99999} step={1} />;
      }
      if (index === 'dscParametro') {
        return <Input.TextArea disabled={loadingGuardarParametros} maxLength={1000} />;
      }
      return <Input disabled={loadingGuardarParametros} maxLength={100} />;
    };

    const celdaRenderizada = ({ getFieldDecorator }) => {
      return (
        <td {...restProps}>
          {editing ? (
            <Form.Item
              className={
                (dataIndex === 'dscParametro' &&
                (errorDscParametro || errorNumOrden || errorDscTooltip) &&
                !errorDscParametro
                  ? 'parametro-subtipo'
                  : '') ||
                (dataIndex === 'numOrden' && (errorDscParametro || errorNumOrden || errorDscTooltip) && !errorNumOrden
                  ? 'parametro-subtipo'
                  : '') ||
                (dataIndex === 'dscTooltip' &&
                (errorDscParametro || errorNumOrden || errorDscTooltip) &&
                !errorDscTooltip
                  ? 'parametro-subtipo'
                  : '')
              }
              style={{
                margin: 0,
                color: dataIndex === 'numOrden' ? 'green' : ''
              }}
            >
              {getFieldDecorator(dataIndex, {
                rules: [
                  {
                    required: dataIndex === 'dscParametro',
                    message: ValidationMessage.REQUIRED
                  },
                  {
                    validator: dataIndex === 'numOrden' && this.validarNumeroOrden
                  }
                ],
                initialValue: record[dataIndex]
              })(obtenerInput(dataIndex))}
            </Form.Item>
          ) : (
            children
          )}
        </td>
      );
    };
    return <ContextoEditable.Consumer>{celdaRenderizada}</ContextoEditable.Consumer>;
  };

  render() {
    const {
      data,
      edit,
      cancel,
      showScroll,
      editingKey,
      tamanioPaginacion,
      actualizarParametro,
      actualizarIconLoading,
      loadingBuscarParametros,
      abrirModalAgregarSubTipo,
      form: { getFieldValue, getFieldsError, isFieldsTouched }
    } = this.props;

    const componentes = {
      body: {
        cell: this.CeldaEditable
      }
    };

    const editando = record => record.key === editingKey;

    const validarBotonGuardar = (fieldsError, fieldsTouched, record) => {
      const errors = Object.keys(fieldsError).some(field => fieldsError[field]);
      let inputsFieldsCambio = true;
      const valorDscParametro = getFieldValue('dscParametro');
      const valorNumOrden = getFieldValue('numOrden');
      const dscTooltip = getFieldValue('dscTooltip');

      if (
        (valorDscParametro && valorDscParametro !== record.dscParametro) ||
        (!isNullOrUndefined(valorNumOrden) && valorNumOrden !== record.numOrden) ||
        (!isNullOrUndefined(dscTooltip) && dscTooltip !== record.dscTooltip)
      )
        inputsFieldsCambio = false;

      if (fieldsTouched && !errors && !inputsFieldsCambio) return false;
      return true;
    };

    const columnas = [
      {
        key: 1,
        title: 'Nombre IdRuta/IdBase',
        dataIndex: 'idRuta',
        editable: false,
        width: '20%'
      },
      {
        key: 2,
        title: 'Código de parámetro',
        dataIndex: 'codParametro',
        editable: false,
        width: '10%'
      },
      {
        key: 3,
        title: 'Descripción',
        dataIndex: 'dscParametro',
        editable: true,
        width: '25%'
      },
      {
        key: 4,
        title: 'Número de orden',
        dataIndex: 'numOrden',
        editable: true,
        width: '10%'
      },
      {
        key: 5,
        title: 'Descripción tooltip',
        dataIndex: 'dscTooltip',
        editable: true,
        width: '15%'
      },
      {
        key: 6,
        title: 'Código de tipo',
        dataIndex: 'codTipo',
        editable: false,
        width: '10%'
      },
      // {
      //  key: 7,
      //  title: 'Indicador activo',
      //  dataIndex: 'indActivo',
      //  editable: false,
      //  render: (text, record) => {
      //    const editable = editando(record);
      //    return (
      //      <Form.Item>
      //        {getFieldDecorator('indActivo')(
      //        <Switch
      //          checkedChildren = 'ON'
      //          unCheckedChildren = 'OFF'
      //          defaultChecked = { record.indActivo === 1 || false }
      //          disabled = {!editable}
      //        />
      //        )}
      //      </Form.Item>
      //    )
      //  }
      // },
      {
        key: 8,
        title: 'Acción',
        dataIndex: 'accion',
        render: (text, record) => {
          const editable = editando(record);
          if (editable) {
            return (
              <span>
                <ContextoEditable.Consumer>
                  {form => (
                    <Tooltip title="Guardar">
                      <Button
                        loading={actualizarIconLoading}
                        disabled={validarBotonGuardar(getFieldsError(), isFieldsTouched(), record)}
                        ghost
                        onClick={() => actualizarParametro(form, record)}
                      >
                        <Icon
                          type="save"
                          theme="filled"
                          style={{
                            color: validarBotonGuardar(getFieldsError(), isFieldsTouched(), record) ? '#bdbdbd' : 'red',
                            fontSize: '18px'
                          }}
                        />
                      </Button>
                    </Tooltip>
                  )}
                </ContextoEditable.Consumer>
                <Divider type="vertical" />
                <Tooltip title="Cancelar">
                  <Icon
                    theme="filled"
                    type="close-circle"
                    onClick={() => cancel(record.key)}
                    style={{ color: 'red', fontSize: '18px' }}
                  />
                </Tooltip>
              </span>
            );
          }
          return (
            <span>
              <Tooltip title="Editar">
                <Icon
                  type="edit"
                  theme="filled"
                  disabled={editingKey !== ''}
                  onClick={() => edit(record.key)}
                  style={{ color: 'red', fontSize: '18px' }}
                />
              </Tooltip>
              <Divider type="vertical" />
              <Tooltip title="Agregar subtipo">
                <Icon
                  type="plus-circle"
                  theme="filled"
                  disabled={editingKey !== ''}
                  onClick={() => abrirModalAgregarSubTipo(record)}
                  style={{ color: 'red', fontSize: '18px' }}
                />
              </Tooltip>
              {/*
                <Divider type = 'vertical' />
                <Tooltip title = "Eliminar">
                  <Icon
                    type = 'delete'
                    theme = 'filled'
                    disabled = {editingKey !== ''}
                    onClick = {() => edit(record.key)}
                    style = {{ color: 'red', fontSize: '18px' }}
                  />
                  </Tooltip>
                */}
            </span>
          );
        }
      }
    ];

    const columnasEditables = columnas.map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          inputType: col.dataIndex === 'numOrden' ? 'number' : 'text',
          dataIndex: col.dataIndex,
          title: col.title,
          editing: editando(record)
        })
      };
    });

    return (
      <ContextoEditable.Provider value={this.props.form}>
        {showScroll && (
          <Table
            components={componentes}
            bordered
            size="small"
            dataSource={data}
            scroll={{ x: '120%' }}
            rowClassName="editable-row"
            columns={columnasEditables}
            loading={loadingBuscarParametros}
            pagination={{ defaultPageSize: tamanioPaginacion }}
          />
        )}
        {!showScroll && (
          <Table
            components={componentes}
            bordered
            size="small"
            dataSource={data}
            columns={columnasEditables}
            rowClassName="editable-row"
            loading={loadingBuscarParametros}
            pagination={{ defaultPageSize: tamanioPaginacion }}
          />
        )}
      </ContextoEditable.Provider>
    );
  }
}

const mapStateToProps = state => ({
  loadingGuardarParametros: actUtlParametroLoading(state),
  numberPagination: getParamGeneral(state, 'TAMANIO_TABLA_PAGINA')
});

const Main = connect(mapStateToProps)(ParametrosTabla);

export default Form.create()(Main);
