import React from 'react';
import { connect } from 'react-redux';
import Cleave from 'cleave.js/react';
import { Select, Input } from 'antd';
import { getCurrencies } from 'components/PriceInput/data/currencies/reducer';
import * as currenciesActionCreators from 'components/PriceInput/data/currencies/actions';
import { showErrorMessage } from 'util';

class PriceInput extends React.Component {
  static getDerivedStateFromProps(nextProps) {
    // Should be a controlled component.
    if ('value' in nextProps) {
      return {
        ...(nextProps.value || {})
      };
    }
    return null;
  }

  componentDidMount() {
    this.props.dispatch(currenciesActionCreators.fetchCurrencies()).catch(() => {
      showErrorMessage(this.props.currencies.error.message);
    });
  }

  constructor(props) {
    super(props);

    const value = props.value || {};
    this.state = {
      number: value.number,
      currency: value.currency
    };
  }

  handleNumberChange = number => {
    if (!('value' in this.props)) {
      this.setState({ number: number.target.rawValue });
    }
    this.triggerChange({ number: number.target.rawValue });
  };

  handleCurrencyChange = currency => {
    if (!('value' in this.props)) {
      this.setState({ currency });
    }
    this.triggerChange({ currency });
  };

  triggerChange = changedValue => {
    // Should provide an event to pass value to Form.
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(Object.assign({}, this.state, changedValue));
    }
  };

  render() {
    const { currencyDisabled, moneyDisabled, err } = this.props;
    const state = this.state;

    const currencies = this.props.currencies.currencies;
    const currenciesItems = currencies.map(currency => (
      <Select.Option key={currency.valor} value={currency.valor}>
        {currency.valor}
      </Select.Option>
    ));

    return (
      <Input.Group compact>
        <Select
          value={state.currency}
          disabled={currencyDisabled}
          style={{ width: '40%' }}
          onChange={this.handleCurrencyChange}
        >
          {currenciesItems}
        </Select>
        <Cleave
          onChange={e => this.handleNumberChange(e)}
          value={this.state.number}
          disabled={moneyDisabled}
          options={{
            numeral: true,
            numeralIntegerScale: 12,
            numeralDecimalScale: 2,
            numeralDecimalMark: '.',
            numeralThousandsGroupStyle: 'thousand'
          }}
          style={{
            width: '60%',
            position: 'relative',
            height: '32px',
            borderRadius: '4px',
            border: `1px solid ${err ? 'red' : '#d9d9d9'}`,
            paddingRight: '11px',
            paddingLeft: '11px',
            outline: '0px'
          }}
        />
      </Input.Group>
    );
  }
}

function mapStateToProps(state) {
  const currencies = getCurrencies(state);
  return {
    currencies
  };
}

export default connect(mapStateToProps)(PriceInput);
