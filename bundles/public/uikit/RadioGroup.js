import * as React from 'react';
import classNames from 'classnames';

import styles from './RadioGroup.mod.css';

const RadioGroupLooks = {
  INLINE: styles.lookInline,
  VERTICAL: styles.lookVertical,
};

const RadioItem = (props) => {
  const {
    name,
    value,
    selected,
    onSelect
  } = props;

  const handleClick = React.useCallback((e) => {
    e.preventDefault();
    onSelect != null && onSelect(value);
  }, [onSelect]);

  return (
    <button className={classNames(styles.radioItem, {[styles.selectedItem]: selected})} onClick={handleClick}>
      {name}
    </button>
  );
};


const RadioGroup = (props) => {
  const {
    options,
    value,
    look=RadioGroupLooks.INLINE,
    onChange,
    className,
  } = props;

  const handleClick = React.useCallback((value) => {
    onChange != null && onChange(value);
  }, [onChange]);

  return (
    <div className={classNames(styles.container, look, className)}>
      {options.map((option) =>
        <RadioItem
          {...option}
          key={option.value}
          selected={value === option.value}
          onSelect={handleClick}
        />
      )}
    </div>
  );
};

RadioGroup.Looks = RadioGroupLooks;

export default RadioGroup;
