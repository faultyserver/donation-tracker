import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import classNames from 'classnames';

import Button from '../../public/uikit/Button';
import Checkbox from '../../public/uikit/Checkbox';
import Clickable from '../../public/uikit/Clickable';
import Header from '../../public/uikit/Header';
import ProgressBar from '../../public/uikit/ProgressBar';
import Text from '../../public/uikit/Text';
import TextInput from '../../public/uikit/TextInput';
import IncentiveForm from './IncentiveForm';

import styles from './Incentives.mod.css';

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

  addIncentive = (e) => {
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
      className,
      deleteIncentive,
    } = this.props;
    const amountFloat = parseFloat(amount);
    let slot = -1;

    return (
      <div className={className}>
        <div className={styles.incentives} data-aid='incentives'>
          <div className={styles.left}>
            <TextInput
              value={search}
              onChange={this.setValue('search')}
              placeholder="Filter Results"
              marginless
            />
            <div className={styles.results}>
              { this.matchResults_().map(result =>
                  <Clickable
                      className={classNames(styles.result, {[styles.resultSelected]: selected && selected.id === result.id})}
                      data-aid="result"
                      key={result.id}
                      onClick={this.select(result.id)}>
                    <Header size={Header.Sizes.H5} marginless oneline>{result.run}</Header>
                    <Text size={Text.Sizes.SIZE_14} marginless oneline>{result.name}</Text>
                  </Clickable>
                )
              }
            </div>
          </div>

          <IncentiveForm
            className={styles.right}
            selected={selected}
            choices={choices}
            selectedChoice={selectedChoice}
            amount={amount}
            step={step}
            total={total}
          />
        </div>

        <Header size={Header.Sizes.H4}>Your Incentives</Header>
        <div className={styles.assigned}>
          { currentIncentives.map((ci, k) => {
              const incentive = incentives.find(i => i.id === ci.bid) || {name: errors[k].bid, id: `error-${k}`};
              if (ci.bid) slot++;
              return (
                <div key={incentive.id} onClick={deleteIncentive(k)} className={styles.incentive}>
                  {ci.bid && bidsformempty && bidsformempty.map(i =>
                    <input
                      key={i.name.replace('__prefix__', slot)}
                      id={i.id.replace('__prefix__', slot)}
                      name={i.name.replace('__prefix__', slot)}
                      type='hidden'
                      value={ci[i.name.split('-').slice(-1)[0]] || ''}
                    />
                  )}
                  <Header size={Header.Sizes.H4} marginless>{incentive.runname}</Header>
                  <Text size={Text.Sizes.SIZE_14}>{incentive.parent ? incentive.parent.name : incentive.name}</Text>

                  <Text size={Text.Sizes.SIZE_14} marginless>Choice: {ci.customoptionname || incentive.name}</Text>
                  <Text size={Text.Sizes.SIZE_14} marginless>Amount: ${ci.amount}</Text>

                  <button className={classNames(styles.delete, styles.cubano)} type='button'>Delete</button>
                </div>
              );
            })
          }
        </div>
      </div>
    );
  }
}

export default Incentives;
