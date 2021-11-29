import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from 'store';
import { HashRouter as Router } from 'react-router-dom';
import App from 'App';
import { LocaleProvider } from 'antd';
import es_ES from 'antd/lib/locale-provider/es_ES';
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <LocaleProvider locale={es_ES}>
        <App />
      </LocaleProvider>
    </Router>
  </Provider>,
  document.getElementById('root')
);
