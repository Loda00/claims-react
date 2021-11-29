import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Auth } from 'aws-amplify';
import { Form, Icon, Input, Button, notification, Spin } from 'antd';
import logo from 'images/logo.png';
import './styles.css';
import { ValidationMessage } from 'util/validation';
import ReCAPTCHA from 'react-google-recaptcha';
import { Link, withRouter } from 'react-router-dom';

const openNotificationWithIcon = desc => {
  notification.error({
    message: 'Error de Autenticación',
    description: desc
  });
};

class Login extends Component {
  constructor(props) {
    super(props);
    this.signIn = this.signIn.bind(this);
    this.reCaptchaRef = React.createRef();
    this.state = {
      loading: false,
      loadingAD: false,
      captcha: '',
      touchedCaptcha: false,
      isLoadingLogin: true
    };
  }

  handleCaptchaChange = value => {
    this.setState({ captcha: value });
    this.setState({ touchedCaptcha: false });
  };

  resetCaptcha = () => {
    if (this.reCaptchaRef && this.reCaptchaRef.current) this.reCaptchaRef.current.reset();
  };

  handleSubmit = e => {
    const that = this;
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (this.validateEmptyCaptcha() && !err) {
        this.setState({
          loading: true
        });
        // that.signIn(values, this.state.captcha);
        that.signIn(values, this.state.captcha);
      }
    });
  };

  validateEmptyCaptcha = () => {
    if (!this.state.captcha) {
      this.setState({ touchedCaptcha: true });
      return false;
    }
    return true;
  };

  signIn = async (values, captcha) => {
    try {
      const { username, password } = values;
      let user = await Auth.signIn(username.trim(), password);

      if (user.challengeName === 'CUSTOM_CHALLENGE') {
        user = await Auth.sendCustomChallengeAnswer(user, captcha);
        this.signInSuccess(user);
      }
    } catch (err) {
      this.signInError(err);
    }
  };

  signInSuccess = () => {
    //
  };

  federatedLogin = () => {
    this.setState({
      loadingAD: true
    });

    const config = Auth.configure();
    const { domain, redirectSignIn, responseType } = config.oauth;

    const clientId = config.userPoolWebClientId;
    const urlAD = `https://${domain}/oauth2/authorize?redirect_uri=${redirectSignIn}&response_type=${responseType}&client_id=${clientId}&identity_provider=${process.env.REACT_APP_AWS_IDENTITY_PROVIDER_NAME}&scope=aws.cognito.signin.user.admin email openid phone profile`;
    window.location.assign(urlAD);
  };

  asyncScriptOnLoad = () => {
    if (this.reCaptchaRef) {
      setTimeout(() => {
        this.setState({ isLoadingLogin: false });
      }, 2000);
    }
  };

  signInError(err) {
    // si es erro seta loadingUp a false
    this.setState({ loading: false });

    if (err.code) {
      if (err.code === 'UserNotConfirmedException') {
        openNotificationWithIcon('El usuario aún no ha sido confirmado');
      } else if (err.code === 'PasswordResetRequiredException') {
        openNotificationWithIcon('Se requiere resetear el password');
      } else if (err.code === 'NotAuthorizedException') {
        openNotificationWithIcon('El usuario/password es incorrecto');
      } else if (err.code === 'UserNotFoundException') {
        openNotificationWithIcon('El usuario/password es incorrecto');
      } else {
        openNotificationWithIcon('Ocurrió un error inesperado');
      }
    } else {
      openNotificationWithIcon('Ocurrió un error inesperado');
    }
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldError, isFieldTouched },
      user: { isLoadingUserGlobal }
    } = this.props;

    const { REACT_APP_KEY_CAPTCHA } = process.env;

    const userNameError = isFieldTouched('username') && getFieldError('username');
    const passwordError = isFieldTouched('password') && getFieldError('password');

    const { isLoadingLogin } = this.state;

    return (
      <div className="claims-rrgg-user-wrapper">
        <div className="claims-rrgg-user-top">
          <div className="claims-rrgg-user-top-header">
            <img alt="logo" className="claims-rrgg-user-top-logo" src={logo} />
          </div>
          <div className="claims-rrgg-user-top-desc">Sistema de Gestión de Siniestros RRGG</div>
        </div>
        <Spin spinning={isLoadingUserGlobal || isLoadingLogin}>
          <div className="claims-rrgg-user-content">
            <div className="claims-rrgg-user-content-desc">Ingresa tus datos de acceso</div>
            <div className="claims-rrgg-user-login-main">
              {/* al enviar se realiza funcion handleSubmit */}
              <Form onSubmit={this.handleSubmit} className="login-form">
                {/* Valida */}
                <Form.Item validateStatus={userNameError ? 'error' : ''} help={userNameError || ''}>
                  {getFieldDecorator('username', {
                    // Indica mensaje a mostrar
                    rules: [{ required: true, message: ValidationMessage.REQUIRED }]
                  })(
                    <Input
                      size="large"
                      prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                      placeholder="Usuario"
                      autoComplete="username"
                      maxLength={1000}
                    />
                  )}
                </Form.Item>
                <Form.Item validateStatus={passwordError ? 'error' : ''} help={passwordError || ''}>
                  {getFieldDecorator('password', {
                    rules: [{ required: true, message: ValidationMessage.REQUIRED }]
                  })(
                    <Input
                      size="large"
                      prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                      type="password"
                      placeholder="Contraseña"
                      autoComplete="current-password"
                      maxLength={1000}
                    />
                  )}
                </Form.Item>
                <Link to="/forgotPassword">
                  <span className="login-link">Generar nueva contraseña</span>
                </Link>
                <ReCAPTCHA
                  ref={this.reCaptchaRef}
                  sitekey={REACT_APP_KEY_CAPTCHA}
                  className="login-captcha"
                  onChange={this.handleCaptchaChange}
                  asyncScriptOnLoad={this.asyncScriptOnLoad}
                />
                {this.state.touchedCaptcha && <div className="login-error">{ValidationMessage.REQUIRED}</div>}
                <Form.Item>
                  <Button
                    size="large"
                    type="primary"
                    loading={this.state.loading}
                    disabled={this.state.loadingAD}
                    htmlType="submit"
                    className="login-form-button"
                  >
                    Ingresar
                  </Button>
                </Form.Item>
                <Form.Item>
                  <Button
                    size="large"
                    type="primary"
                    loading={this.state.loadingAD}
                    disabled={this.state.loading}
                    onClick={this.federatedLogin}
                    className="login-form-button"
                  >
                    Ingresa con tu cuenta Rimac
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>
        </Spin>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.services.user,
    isLoadingUserGlobal: state.services.user.isLoadingUserGlobal
  };
};

// se crea el form se indica el nombre y el cponenete que le pertenece
const Main = connect(mapStateToProps)(Form.create({ name: 'normal_login' })(Login));
export default withRouter(Main);
