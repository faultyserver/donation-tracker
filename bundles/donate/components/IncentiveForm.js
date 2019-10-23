import * as React from 'react';
import classNames from 'classnames';

import Button from '../../public/uikit/Button';
import Checkbox from '../../public/uikit/Checkbox';
import Header from '../../public/uikit/Header';
import ProgressBar from '../../public/uikit/ProgressBar';
import Text from '../../public/uikit/Text';
import TextInput from '../../public/uikit/TextInput';
import * as IncentiveActions from '../IncentiveActions';
import * as IncentiveUtils from '../IncentiveUtils';

import styles from './IncentiveForm.mod.css';

const IncentiveForm = (props) => {
  const {
    selected,
    choices,
    selectedChoice,
    step,
    total,
    className,
  } = props;

  const [allocatedAmount, setAllocatedAmount] = React.useState(total);
  const [selectedChoiceId, setSelectedChoiceId] = React.useState(null);
  const [newChoiceSelected, setNewChoiceSelected] = React.useState(false);
  const [newChoice, setNewChoice] = React.useState("");

  const [incentiveIsValid, incentiveErrorText] = React.useMemo(() => (
    IncentiveUtils.validateBid({
      amount: allocatedAmount,
      total,
      selected,
      choice: selectedChoiceId,
      newChoice,
    })
  ), [allocatedAmount, total, selected, newChoice]);


  const handleAmountChange = React.useCallback((e) => {
    setAllocatedAmount(e.currentTarget.value);
  }, []);

  const handleSelectNewOption = React.useCallback((e) => {
    setSelectedChoiceId(null);
    setNewChoiceSelected(true);
  }, []);

  const handleNewOptionChange = React.useCallback((e) => {
    setNewChoice(e.currentTarget.value);
  }, []);

  const handleSubmitBid = React.useCallback(() => {
    IncentiveActions.createBid({
      incentiveId: selected.id,
      amount: allocatedAmount,
      choiceId: selectedChoiceId,
      newChoice: newChoice,
    });
  }, [selected, allocatedAmount, selectedChoiceId, newChoice]);


  if(selected == null) {
    return (
      <div className={classNames(styles.container, className)}>
        <Text>You have ${total} remaining.</Text>
      </div>
    );
  }

  const selectedAmountFloat = parseFloat(selected.amount);
  const selectedGoalFloat = parseFloat(selected.goal);
  const goalProgress = selectedAmountFloat / selectedGoalFloat * 100;

  return (
    <div className={classNames(styles.container, className)}>
      <Header size={Header.Sizes.H4}>{selected.runname}</Header>
      <Header size={Header.Sizes.H5}>{selected.name}</Header>
      <Text size={Text.Sizes.SIZE_14}>{selected.description}</Text>

      { (+selected.goal) &&
        <React.Fragment>
          <ProgressBar className={styles.progressBar} progress={goalProgress} />
          <Text marginless>Current Raised Amount: <span>${selected.amount} / ${selected.goal}</span></Text>
        </React.Fragment>
      }

      <TextInput
        name="new_amount"
        value={allocatedAmount}
        type={TextInput.Types.NUMBER}
        label="Amount to put towards incentive"
        hint={<React.Fragment>You have <strong>${total}</strong> remaining.</React.Fragment>}
        leader="$"
        onChange={handleAmountChange}
        step={step}
        min={0}
        max={total}
      />

      { choices && choices.length
        ? choices.map(choice => (
            <Checkbox
                key={choice.id}
                name={`choice-${choice.id}`}
                checked={selectedChoiceId === choice.id}
                contentClassName={styles.choiceLabel}
                look={Checkbox.Looks.DENSE}
                onChange={() => setSelectedChoiceId(choice.id)}>
              <Checkbox.Header>{choice.name}</Checkbox.Header>
              <span className={styles.choiceAmount}>${choice.amount}</span>
            </Checkbox>
          ))
        : null
      }

      { selected.custom
        ? <Checkbox
              name="custom"
              label="Nominate a new option!"
              checked={newChoiceSelected}
              look={Checkbox.Looks.NORMAL}
              onChange={handleSelectNewOption}>
            <TextInput
              value={newChoice}
              disabled={!newChoiceSelected}
              name="newOptionValue"
              placeholder="Enter Option Here"
              onChange={handleNewOptionChange}
              maxLength={selected.maxlength}
            />
          </Checkbox>
        : null
      }

      <Button disabled={!incentiveIsValid} fullwidth onClick={handleSubmitBid}>Add</Button>
      {incentiveErrorText && <Text marginless>{incentiveErrorText}</Text>}
    </div>
  );
};

export default IncentiveForm;
