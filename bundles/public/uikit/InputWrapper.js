import * as React from 'react';
import classNames from 'classnames';

import Text from './Text';

import styles from './InputWrapper.mod.css';

const InputWrapperSizes = {
  NORMAL: styles.sizeNormal,
  LARGE: styles.sizeLarge,
};

const InputWrapper = (props) => {
  const {
    label,
    name,
    hint,
    leader,
    trailer,
    size=InputWrapperSizes.NORMAL,
    marginless=false,
    children,
    className,
  } = props;

  return (
    <div className={classNames(styles.container, size, className)}>
      { label != null &&
        <label className={styles.label} htmlFor={name}>
          {label}
        </label>
      }
      <div className={styles.input}>
        {leader != null && <div className={styles.leader}>{leader}</div>}
        {children}
        {trailer != null && <div className={styles.trailer}>{trailer}</div>}
      </div>
      { hint != null &&
        <Text
            className={styles.hint}
            color={Text.Colors.MUTED}
            size={Text.Sizes.SIZE_14}
            marginless>
          {hint}
        </Text>
      }
    </div>
  );
};

InputWrapper.Sizes = InputWrapperSizes;

export default InputWrapper;
