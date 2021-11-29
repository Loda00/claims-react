import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect, Link } from 'react-router-dom';
import { Form, Input, Icon, Button, Alert, Spin } from 'antd';
import { Auth } from 'aws-amplify';
import '../../styles.css';
import logo from 'images/logo.png';
import check from 'images/icon-check-circle.svg';

class GeneratePassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sectionEmail: true,
      valuePassword: '',
      showAlert: false,
      error: '',
      typeAlert: 'info',
      sectionNewPassword: false,
      confirmDirty: false,
      sectionFinal: false,
      valueEmail: '',
      isLoadingGlobal: false
    };
  }

  handleConfirmBlur = e => {
    const { value } = e.target;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  handleSubmit = e => action => e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        action(values);
      }
    });
  };

  handleSendCode = async values => {
    const { email } = values;
    this.setState({
      showAlert: false,
      error: '',
      typeAlert: 'info'
    });

    try {
      await Auth.forgotPassword(email.trim());
      this.loaderView();
      setTimeout(() => {
        this.setState({
          sectionEmail: false,
          sectionNewPassword: true,
          valueEmail: email.trim()
        });
      }, 1000);
    } catch (err) {
      this.setState({
        showAlert: true,
        error: err.message,
        typeAlert: 'error'
      });
    }
  };

  handleChangePassword = async values => {
    const { code, password } = values;
    const { valueEmail } = this.state;
    this.setState({
      showAlert: false,
      error: '',
      typeAlert: 'info'
    });

    try {
      await Auth.forgotPasswordSubmit(valueEmail, code.trim(), password.trim());
      this.loaderView();
      setTimeout(() => {
        this.setState({ sectionNewPassword: false, sectionFinal: true });
      }, 1000);
    } catch (err) {
      setTimeout(() => {
        this.setState({
          showAlert: true,
          error: err.message,
          typeAlert: 'error'
        });
      }, 1000);
    }
  };

  validateEqualsPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('password')) {
      callback([new Error('Contraseñas no coinciden')]);
    } else {
      callback();
    }
  };

  validateToNextPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirmPassword'], { force: true });
    }
    callback();
  };

  renderFormEmail() {
    const { showAlert, error, typeAlert } = this.state;
    const { getFieldDecorator } = this.props.form;

    return (
      <div className="generate-login-container-email">
        <p className="claims-rrgg-user-content-desc">
          Ingresa tu correo electrónico abajo y te enviaremos un mensaje para cambiar tu contraseña
        </p>
        {showAlert && <Alert className="" message={error} type={typeAlert} showIcon />}
        <Form className="change-password-form" onSubmit={this.handleSubmit()(this.handleSendCode)}>
          <Form.Item>
            {getFieldDecorator('email', {
              rules: [
                { type: 'email', message: 'Correo Electrónico no válido' },
                { required: true, message: 'Campo obligatorio' }
              ]
            })(
              <Input
                size="large"
                placeholder="Correo electrónico"
                autoComplete="email"
                className="generate-password-input"
                prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />}
              />
            )}
          </Form.Item>
          <Form.Item>
            <Button size="large" className="generate-password-button" htmlType="submit" type="primary">
              Enviar
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  }

  renderChangePassword() {
    const { getFieldDecorator } = this.props.form;
    const { showAlert, error, typeAlert, valueEmail } = this.state;

    return (
      <div className="generate-login-container-change-password">
        <Form className="confirm-password-form" onSubmit={this.handleSubmit()(this.handleChangePassword)}>
          {showAlert && <Alert className="" message={error} type={typeAlert} showIcon />}
          <Form.Item>
            {getFieldDecorator('code', {
              rules: [{ required: true, message: 'Campo obligatorio' }]
            })(<Input size="large" placeholder="Código de confirmación" autoComplete="code" />)}
          </Form.Item>
          <p className="text">Por favor revisa tu email ({valueEmail}) por el código de confirmación</p>
          <Form.Item>
            {getFieldDecorator('password', {
              rules: [{ required: true, message: 'Campo obligatorio' }, { validator: this.validateToNextPassword }]
            })(<Input size="large" placeholder="Contraseña" type="password" autoComplete="new-password" />)}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('confirmPassword', {
              rules: [{ required: true, message: 'Campo obligatorio' }, { validator: this.validateEqualsPassword }]
            })(
              <Input
                size="large"
                placeholder="Confirmar contraseña"
                type="password"
                autoComplete="confirm-password"
                onBlur={this.handleConfirmBlur}
              />
            )}
          </Form.Item>
          <Form.Item>
            <Button size="large" className="generate-password-button" htmlType="submit" type="primary">
              Confirmar
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  }

  renderFinalMessage() {
    return (
      <div className="generate-login-container-final">
        <img src={check} alt="icono de check" className="generate-login-icon" />
        <p className="text">Tu contraseña ha sido restablecida</p>
        <Link to="/login">
          <span className="login-link">Click para inicar sesión con tus nuevas credenciales.</span>
        </Link>
      </div>
    );
  }

  loaderView() {
    this.setState({ isLoadingGlobal: true });
    const timeLoadingGlobal = 1000;

    setTimeout(() => {
      this.setState({ isLoadingGlobal: false });
    }, timeLoadingGlobal);
  }

  componentDidMount() {
    this.loaderView();
  }

  render() {
    const { user } = this.props.user;
    const { sectionEmail, sectionNewPassword, sectionFinal, isLoadingGlobal } = this.state;

    return user ? (
      <Redirect to="/" />
    ) : (
      <div className="claims-rrgg-user-wrapper generate-password">
        <div className="claims-rrgg-user-top">
          <div className="claims-rrgg-user-top-header">
            <img alt="logo" className="claims-rrgg-user-top-logo" src={logo} />
          </div>
          <div className="claims-rrgg-user-top-desc">Sistema de Gestión de Siniestros RRGG</div>
        </div>
        <Spin spinning={isLoadingGlobal}>
          <div className="claims-rrgg-user-content">
            {sectionEmail && this.renderFormEmail()}
            {sectionNewPassword && this.renderChangePassword()}
            {sectionFinal && this.renderFinalMessage()}
          </div>
        </Spin>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.services.user
  };
};

export default connect(mapStateToProps)(Form.create({ name: 'normal_changue_password' })(GeneratePassword));
