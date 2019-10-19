import * as React from 'react';
import classNames from 'classnames';

import InputWrapper from './InputWrapper.js';
import Text from './Text';

import styles from './TextInput.mod.css';

const TextInputTypes = {
  TEXT: 'text',
  EMAIL: 'email',
  NUMBER: 'number',
};

const TextInput = (props) => {
  const {
    name,
    value,
    label,
    hint,
    placeholder,
    size=InputWrapper.Sizes.NORMAL,
    type=TextInputTypes.TEXT,
    leader,
    trailer,
    marginless=false,
    className,
    onChange,
    ...extraProps
  } = props;

  return (
    <InputWrapper
        className={className}
        label={label}
        hint={hint}
        marginless={marginless}
        leader={leader}
        trailer={trailer}
        size={size}>
      <input
        className={classNames(styles.input)}
        placeholder={placeholder}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        {...extraProps}
      />
    </InputWrapper>
  );
};

TextInput.Sizes = InputWrapper.Sizes;
TextInput.Types = TextInputTypes;

export default TextInput;
