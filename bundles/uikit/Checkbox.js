import * as React from 'react';
import classNames from 'classnames';

import styles from './Checkbox.mod.css';

const CheckboxLooks = {
  NORMAL: styles.lookNormal,
  DENSE: styles.lookDense,
};

const CheckboxHeader = (props) => {
  const {
    children,
    className,
    ...headerProps
  } = props;

  return (
    <div className={classNames(styles.header, className)} {...headerProps}>
      {props.children}
    </div>
  );
};

const Checkbox = (props) => {
  const {
    name,
    checked,
    label=null,
    disabled=false,
    look=CheckboxLooks.NORMAL,
    children,
    className,
    contentClassName,
    onChange,
  } = props;

  return (
    <label className={classNames(styles.container, look, className, {[styles.disabled]: disabled})}>
      <input
        className={styles.check}
        type="checkbox"
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
      <div className={classNames(styles.content, contentClassName)}>
        {label && <CheckboxHeader>{label}</CheckboxHeader>}
        {children}
      </div>
    </label>
  );
};

Checkbox.Header = CheckboxHeader;
Checkbox.Looks = CheckboxLooks;

export default Checkbox;
