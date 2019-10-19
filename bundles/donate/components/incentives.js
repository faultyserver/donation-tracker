import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import cn from 'classnames';

import styles from '../Donate.mod.css';

export const IncentiveProps = PropTypes.shape({
  id: PropTypes.number.isRequired,
  parent: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    custom: PropTypes.bool.isRequired,
    maxlength: PropTypes.number,
    description: PropTypes.string.isRequired,
  }),
  name: PropTypes.string.isRequired,
  runname: PropTypes.string.isRequired,
  amount: PropTypes.string.isRequired, // TODO: this and goal should be numbers but django seems to be serializing them as strings?
  count: PropTypes.number.isRequired,
  goal: PropTypes.string,
  description: PropTypes.string.isRequired,
});

class Incentives extends React.PureComponent {
  static propTypes = {
    step: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    incentives: PropTypes.arrayOf(IncentiveProps.isRequired).isRequired,
    addIncentive: PropTypes.func.isRequired,
  };

  static defaultProps = {
    step: 0.01,
  };

  state = {
    search: '',
    amount: 0,
    bidsformempty: [],
  };

  static getDerivedStateFromProps(props, state) {
    const addedState = {};
    if (state.selectedChoice) {
      addedState.newOption = false;
      addedState.newOptionValue = '';
    }
    if (state.newOption) {
      addedState.newOption = state.newOption;
      addedState.selectedChoice = null;
    } else {
      addedState.newOptionValue = '';
    }

    return addedState;
  }

  componentDidMount() {
    this.setState({bidsformempty: Array.from(document.querySelector('table[data-form=bidsform][data-form-type=empty]').querySelectorAll('input')).filter(i => i.id)});
  }

  matchResults_() {
    const search = this.state.search.toLowerCase();
    let {incentives} = this.props;
    if (search) {
      incentives = incentives.filter(i => {
        return (i.parent ? i.parent.name : i.name).toLowerCase().includes(search)
          || (i.runname && i.runname.toLowerCase().includes(search));
      });
    }
    incentives = incentives.map(i => ({
      id: i.id,
      run: i.runname,
      name: i.parent ? i.parent.name : i.name
    }));
    return _.uniqBy(incentives, i => `${i.run}--${i.name}`);
  }

  addIncentiveDisabled_() {
    if (this.state.amount <= 0) {
      return 'Amount must be greater than 0.';
    } else if (this.state.amount > this.props.total) {
      return `Amount cannot be greater than $${this.props.total}.`;
    } else if (this.state.selected && !+this.state.selected.goal) {
      if (this.state.newOption && !this.state.newOptionValue) {
        return 'Must enter new option.';
      } else if (!this.state.newOption && !this.state.selectedChoice) {
        return 'Must pick an option.';
      }
    }
    return null;
  }

  addIncentive = (e) => {
    e.preventDefault();
    this.props.addIncentive({
      bid: (this.state.newOptionValue || !this.state.selectedChoice) ? this.state.selected.id : this.state.selectedChoice,
      amount: (+this.state.amount),
      customoptionname: this.state.newOptionValue,
    });
    this.setState({selected: null});
  };

  setChecked = key => {
    return e => {
      this.setState({[key]: e.target.checked});
    };
  };

  setValue = key => {
    return e => {
      this.setState({[key]: e.target.value});
    }
  };

  select = id => {
    return () => {
      const {
        total,
        incentives,
      } = this.props;
      if (total === 0) {
        return;
      }
      const result = incentives.find(i => i.id === id);
      this.setState({
        selected: {...(result.parent || result), runname: result.runname},
        choices: result.parent ? incentives.filter(i => i.parent && i.parent.id === result.parent.id) : incentives.filter(i => i.parent && i.parent.id === result.id),
        newOption: false,
        newOptionValue: '',
        selectedChoice: null,
        amount: total,
      });
    };
  };

  render() {
    const {
      amount,
      bidsformempty,
      choices,
      search,
      selected,
      newOption,
      newOptionValue,
      selectedChoice,
    } = this.state;
    const {
      step,
      total,
      currentIncentives,
      errors,
      incentives,
      deleteIncentive,
    } = this.props;
    const addIncentiveDisabled = this.addIncentiveDisabled_();
    let slot = -1;
    return (
      <div className={styles['incentives']} data-aid='incentives'>
        <div className={styles['left']}>
          <div className={styles['searches']}>
            <input className={styles['search']} value={search} onChange={this.setValue('search')}
                   placeholder='Filter Results'/>
            <div className={styles['results']}>
              {
                this.matchResults_().map(result =>
                  <div className={styles['result']} data-aid='result' key={result.id} onClick={this.select(result.id)}>
                    <div className={styles['resultRun']}>{result.run}</div>
                    <div className={styles['resultName']}>{result.name}</div>
                  </div>
                )
              }
            </div>
          </div>
          <div className={styles['assigned']}>
            <div className={styles['header']}>YOUR INCENTIVES</div>
            {currentIncentives.map((ci, k) => {
                const incentive = incentives.find(i => i.id === ci.bid) || {name: errors[k].bid, id: `error-${k}`};
                if (ci.bid) {
                  slot++;
                }
                return (
                  <div key={incentive.id} onClick={deleteIncentive(k)} className={styles['item']}>
                    {ci.bid && bidsformempty && bidsformempty.map(i =>
                      <input
                        key={i.name.replace('__prefix__', slot)}
                        id={i.id.replace('__prefix__', slot)}
                        name={i.name.replace('__prefix__', slot)}
                        type='hidden'
                        value={ci[i.name.split('-').slice(-1)[0]] || ''}
                      />
                    )}
                    <div className={cn(styles['runname'], styles['cubano'])}>{incentive.runname}</div>
                    <div>{incentive.parent ? incentive.parent.name : incentive.name}</div>
                    <div>Choice: {ci.customoptionname || incentive.name}</div>
                    <div>Amount: ${ci.amount}</div>
                    <button className={cn(styles['delete'], styles['cubano'])} type='button'>DELETE</button>
                  </div>
                );
              }
            )}

          </div>
        </div>
        {selected ?
          <div className={styles['right']}>
            <div className={cn(styles['runname'], styles['cubano'])}>{selected.runname}</div>
            <div className={styles['name']}>{selected.name}</div>
            <div className={styles['description']}>{selected.description}</div>
            {(+selected.goal) ?
              <div className={styles['goal']}>
                <div>Current Raised Amount:</div>
                <div>${selected.amount} / ${selected.goal}</div>
              </div> :
              null}
            {selected.custom ?
              <React.Fragment>
                <div>
                  <input type='checkbox' checked={newOption} onChange={this.setChecked('newOption')} name='custom'/>
                  <label htmlFor='custom'>Nominate a new option!</label>
                </div>
                {selected.maxlength ?
                  <div>({selected.maxlength} character limit)</div> :
                  null}
                <div>
                  <input className={styles['underline']} value={newOptionValue} disabled={!newOption} type='text'
                         name='newOptionValue' maxLength={selected.maxlength}
                         onChange={this.setValue('newOptionValue')} placeholder='Enter Here'/>
                </div>
              </React.Fragment> :
              null}
            {choices.length ?
              <React.Fragment>
                <div>Choose an existing option:</div>
                {choices.map(choice =>
                  (<div key={choice.id} className={styles['choice']}>
                    <input checked={selectedChoice === choice.id} type='checkbox'
                           onChange={() => this.setState({selectedChoice: choice.id, newOption: false})}
                           name={`choice-${choice.id}`}/>
                    <label htmlFor={`choice-${choice.id}`}>{choice.name}</label>
                    <span>${choice.amount}</span>
                  </div>)
                )}
              </React.Fragment> :
              null}
            <div className={styles['amountCTA']}>Amount to put towards incentive:</div>
            <div className={styles['amount']}>
              <input className={styles['underline']} value={amount} name='new_amount' type='number' step={step} min={0}
                     max={total}
                     onChange={this.setValue('amount')} placeholder='Enter Here'/>
              <label htmlFor='new_amount'>You have ${total} remaining.</label>
            </div>
            <div>
              <button className={cn(styles['add'], styles['inverse'])} id='add' disabled={addIncentiveDisabled}
                      onClick={this.addIncentive}>ADD
              </button>
              {addIncentiveDisabled && <label htmlFor='add' className='error'>{addIncentiveDisabled}</label>}
            </div>
          </div> :
          <div className={styles['right']}>You have ${total} remaining.</div>}
      </div>
    );
  }
}

export default Incentives;
