import React, { Component, Fragment } from 'react';
import { Table, Input, Form } from 'antd';
import reactComponentDebounce from 'react-component-debounce';

const DebounceInput = reactComponentDebounce({
  valuePropName: 'value',
  triggerMs: 250
})(Input);

class ReaseguroTable extends Component {
  obtenerCorreo = (text, record) => {
    const {
      idTarea,
      reaseguros,
      validarCorreo,
      indCargaMasiva,
      disabledGeneral,
      validarEmailSeguros,
      cerrarSiniestroValue,
      esSiniestroPreventivo,
      validacionInputEmailSeguros: { habilitarInputEmailSeguros },
      form: { getFieldDecorator, isFieldTouched, getFieldError }
    } = this.props;

    const formItemLayout = {
      labelCol: {
        span: 1
      },
      wrapperCol: {
        span: 23
      }
    };

    const esCMCoaseguro = indCargaMasiva === 'COA';

    const hayErrorFormato =
      (validarEmailSeguros || isFieldTouched(`reaseguro${record.idReasegurador}`)) &&
      getFieldError(`reaseguro${record.idReasegurador}`);

    const errorValidacion = (getFieldError(`reaseguro${record.idReasegurador}`) || [])[0];

    const emailInicial = (reaseguros.filter(reaseguro => reaseguro.idReasegurador === record.idReasegurador)[0] || {})
      .email;
    // Validacion
    const boolHabilitarInputEmailSeguros = habilitarInputEmailSeguros({
      idTarea,
      esSiniestroPreventivo,
      cerrarSiniestroValue
    });

    // Fin Validacion

    return (
      <Form.Item
        required={!esCMCoaseguro}
        label=" "
        colon={false}
        style={{ margin: '0 auto' }}
        {...formItemLayout}
        help={hayErrorFormato ? errorValidacion : ''}
        validateStatus={hayErrorFormato ? 'error' : ''}
      >
        {getFieldDecorator(`reaseguro${record.idReasegurador}`, {
          initialValue: emailInicial,
          rules: [{ validator: validarCorreo }]
        })(<DebounceInput placeholder="E-mail" disabled={disabledGeneral || !boolHabilitarInputEmailSeguros} />)}
      </Form.Item>
    );
  };

  render() {
    const { reaseguros, indNotifReaCoa, showScroll } = this.props;

    const columns = [
      {
        title: 'Reasegurador',
        dataIndex: 'reasegurador',
        key: 'reasegurador'
      },
      {
        title: 'Corredor de reaseguro',
        dataIndex: 'corredorreaseguro',
        key: 'corredorReaseguro'
      },
      {
        title: 'Participación',
        dataIndex: 'participacion',
        key: 'participacion',
        align: 'right',
        render: text => <span>{text} %</span>
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        align: 'center',
        render: (text, record, index) => this.obtenerCorreo(text, record, index)
      },
      {
        title: 'Estado',
        dataIndex: 'indNotifReaCoa',
        key: 'indNotifReaCoa',
        align: 'center',
        render: () => (indNotifReaCoa === 'S' && 'Enviado') || '-'
      }
    ];
    return (
      <Fragment>
        {showScroll && (
          <Table
            pagination={false}
            rowKey={item => item.idReasegurador}
            columns={columns}
            dataSource={reaseguros}
            size="small"
            scroll={{ x: '180%', y: reaseguros.length > 10 ? 580 : false }}
          />
        )}
        {!showScroll && (
          <Table
            pagination={false}
            rowKey={item => item.idReasegurador}
            columns={columns}
            dataSource={reaseguros}
            size="small"
            scroll={{ y: reaseguros.length > 10 ? 580 : false }}
          />
        )}
      </Fragment>
    );
  }
}
export default ReaseguroTable;
