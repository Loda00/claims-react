import React from 'react';
import Cleave from 'cleave.js/react';

class NumeroInput extends React.Component {
  static getDerivedStateFromProps(nextProps) {
    // Should be a controlled component.
    if ('value' in nextProps) {
      return {
        ...(nextProps.value || {})
      };
    }
    return null;
  }

  constructor(props) {
    super(props);

    const value = props.value || {};
    this.state = {
      number: value.number
    };
  }

  handleNumberChange = number => {
    if (!('value' in this.props)) {
      this.setState({ number: number.target.rawValue });
    }
    this.triggerChange({ number: number.target.rawValue });
  };

  triggerChange = changedValue => {
    // Should provide an event to pass value to Form.
    const { onChange } = this.props;
    if (onChange) {
      onChange(Object.assign({}, this.state, changedValue));
    }
  };

  render() {
    const { number } = this.state;
    const { disabled, id, placeholder } = this.props;
    return (
      <Cleave
        options={{
          blocks: [11],
          numericOnly: true
        }}
        disabled={disabled}
        placeholder={placeholder}
        style={{
          width: '100%',
          position: 'relative',
          height: '32px',
          cursor: 'auto',
          borderRadius: '4px',
          border: '1px solid #d9d9d9',
          paddingRight: '11px',
          paddingLeft: '11px',
          outline: '0px'
        }}
        id={id}
        onChange={e => this.handleNumberChange(e)}
        value={number}
      />
    );
  }
}

export default NumeroInput;
