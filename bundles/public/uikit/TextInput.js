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
    multiline=false,
    size=InputWrapper.Sizes.NORMAL,
    type=TextInputTypes.TEXT,
    leader,
    trailer,
    marginless=false,
    className,
    onChange,
    ...extraProps
  } = props;

  const Tag = multiline ? 'textarea' : 'input';

  const maxLength = props.maxLength;
  const usedLength = value.length;
  const invalidLength = usedLength >= maxLength;

  return (
    <InputWrapper
        className={className}
        label={label}
        hint={hint}
        marginless={marginless}
        leader={leader}
        trailer={trailer}
        size={size}>
      <Tag
        className={classNames(styles.input, {[styles.multiline]: multiline})}
        placeholder={placeholder}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        {...extraProps}
      />
      { maxLength != null &&
        <div className={classNames(styles.lengthLimit, {[styles.invalidLength]: invalidLength})}>
          {usedLength} / {maxLength}
        </div>
      }
    </InputWrapper>
  );
};

TextInput.Sizes = InputWrapper.Sizes;
TextInput.Types = TextInputTypes;

export default TextInput;
