import { API_NAME_SYN, API_NAME_RIMAC } from 'constants/index';

export default {
  Auth: {
    mandatorySignIn: true,
    identityPoolId: process.env.REACT_APP_IDENTITY_POOL_ID,
    region: process.env.REACT_APP_REGION,
    userPoolId: process.env.REACT_APP_USER_POOL_ID,
    userPoolWebClientId: process.env.REACT_APP_USER_POOL_WEB_CLIENT_ID,
    authenticationFlowType: process.env.REACT_APP_AUTHENTICATION_FLOW_TYPE,
    oauth: {
      domain: process.env.REACT_APP_DOMAIN,
      scope: ['phone', 'email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
      redirectSignIn: process.env.REACT_APP_REDIRECT_SIGN_IN,
      redirectSignOut: process.env.REACT_APP_REDIRECT_SIGN_OUT,
      responseType: 'code'
    }
  },
  API: {
    endpoints: [
      {
        name: API_NAME_SYN,
        endpoint: process.env.REACT_APP_API_ENDPOINT_SYN,
        region: process.env.REACT_APP_REGION
      },
      {
        name: API_NAME_RIMAC,
        endpoint: process.env.REACT_APP_API_ENDPOINT_RIMAC,
        region: process.env.REACT_APP_REGION
      }
    ]
  }
};
