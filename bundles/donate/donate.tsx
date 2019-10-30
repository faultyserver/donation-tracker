import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import cn from 'classnames';

import styles from './donate.css';

type Incentive = {
  id: number;
  parent: {
    id: number;
    name: string;
    custom: boolean;
    maxlength?: number,
    description: string;
  } | undefined;
  name: string;
  runname: string;
  amount: number | string; // TODO: this and goal should be numbers but django seems to be serializing them as strings?
  count?: number;
  goal?: string;
  custom?: boolean;
  maxlength?: number;
  description?: string;
};

type Bid = {
  bidId?: number;
  customoptionname?: string;
  amount: number;
};

type IncentivesProps = {
  step: number;
  total: number;
  incentives: Array<Incentive>;
  currentIncentives: Array<Bid>;
  errors: Array<{bid: number | undefined}>;
  addIncentive: (bid: Bid) => any;
  deleteIncentive: (index: number) => any;
}

type IncentivesState = {
  search: string;
  amount: number;
  bidsformempty: Array<any>;
  newOption: boolean;
  newOptionValue: string;
  choices: Array<Incentive>;
  selectedChoiceId: number | undefined;
  selected: Incentive | undefined;
};

class Incentives extends React.PureComponent<IncentivesProps, IncentivesState> {
  static defaultProps = {
    step: 0.01,
  };

  state: IncentivesState = {
    search: '',
    amount: 0,
    bidsformempty: [],
    newOption: false,
    newOptionValue: '',
    choices: [],
    selectedChoiceId: undefined,
    selected: undefined,
  };

  static getDerivedStateFromProps(props: IncentivesProps, state: IncentivesState) {
    const addedState = {...state};

    if (state.selectedChoiceId) {
      addedState.newOption = false;
      addedState.newOptionValue = '';
    }
    if (state.newOption) {
      addedState.newOption = state.newOption;
      addedState.selectedChoiceId = undefined;
    } else {
      addedState.newOptionValue = '';
    }

    return addedState;
  }

  componentDidMount() {
    const bidsForm = document.querySelector('table[data-form=bidsform][data-form-type=empty]');
    const bidsFormElements = (bidsForm != undefined ? Array.from(bidsForm.querySelectorAll('input')) : []);
    this.setState({bidsformempty: bidsFormElements.filter(i => i.id)});
  }

  matchResults_() {
    const search = this.state.search.toLowerCase();
    const {incentives} = this.props;
    const filteredIncentives = search
      ? incentives.filter(
          i => (i.parent ? i.parent.name : i.name).toLowerCase().includes(search)
          || (i.runname && i.runname.toLowerCase().includes(search))
        )
      : incentives;

    return _.uniqBy(incentives, i => `${i.runname}--${i.name}`);
  }

  addIncentiveDisabled_() {
    const {total} = this.props;
    const {amount, selected, newOption, newOptionValue, selectedChoiceId} = this.state;
    if (amount <= 0) {
      return 'Amount must be greater than 0.';
    } else if (amount > total) {
      return `Amount cannot be greater than $${total}.`;
    } else if (selected && !Number(selected.goal)) {
      if (newOption && !newOptionValue) {
        return 'Must enter new option.';
      } else if (!newOption && !selectedChoiceId) {
        return 'Must pick an option.';
      }
    }
    return undefined;
  }

  addIncentive = (e: React.SyntheticEvent) => {
    const {amount, selected, selectedChoiceId, newOptionValue} = this.state;
    e.preventDefault();
    this.props.addIncentive({
      bidId: (newOptionValue || !selectedChoiceId) ? selected!.id : selectedChoiceId,
      amount: +amount,
      customoptionname: newOptionValue,
    });
    this.setState({selected: undefined});
  };

  setNewOptionChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({newOption: e.target.checked});
  };

  setSearchValue = (e: React.ChangeEvent<HTMLInputElement>) => this.setState({search: e.target.value});
  setNewOptionValue = (e: React.ChangeEvent<HTMLInputElement>) => this.setState({newOptionValue: e.target.value});
  setAmount = (e: React.ChangeEvent<HTMLInputElement>) => this.setState({amount: +e.target.value});

  select = (id: number) => {
    return () => {
      const {
        total,
        incentives,
      } = this.props;
      if (total === 0) {
        return;
      }
      const result = incentives.find(i => i.id === id);
      // This should never get hit. We know `find` should succeed.
      if(result == null) return null;

      this.setState({
        selected: {...(result.parent || result), runname: result.runname},
        choices: result.parent ? incentives.filter(i => i.parent && i.parent.id === result.parent.id) : incentives.filter(i => i.parent && i.parent.id === result.id),
        newOption: false,
        newOptionValue: '',
        selectedChoiceId: null,
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
      selectedChoiceId,
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
            <input className={styles['search']} value={search} onChange={this.setSearchValue}
                   placeholder='Filter Results'/>
            <div className={styles['results']}>
              {
                this.matchResults_().map(result =>
                  <div className={styles['result']} data-aid='result' key={result.id} onClick={this.select(result.id)}>
                    <div className={styles['resultRun']}>{result.runname}</div>
                    <div className={styles['resultName']}>{result.parent ? result.parent.name : result.name}</div>
                  </div>
                )
              }
            </div>
          </div>
          <div className={styles['assigned']}>
            <div className={styles['header']}>YOUR INCENTIVES</div>
            {currentIncentives.map((ci: Bid, index: number) => {
                const incentive = incentives.find(i => i.id === ci.bidId)
                  || {name: errors[index].bid, id: `error-${index}`, runname: null, parent: {name: ''}};
                if (ci.bidId) slot++;

                return (
                  <div key={incentive.id} onClick={deleteIncentive(index)} className={styles['item']}>
                    {ci.bidId && bidsformempty && bidsformempty.map(i =>
                      <input
                        key={i.name.replace('__prefix__', slot)}
                        id={i.id.replace('__prefix__', slot)}
                        name={i.name.replace('__prefix__', slot)}
                        type='hidden'
                        value={(ci as any)[i.name.split('-').last()] || ''}
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
            {Number(selected.goal) ?
              <div className={styles['goal']}>
                <div>Current Raised Amount:</div>
                <div>${selected.amount} / ${selected.goal}</div>
              </div> :
              null}
            {selected.custom ?
              <React.Fragment>
                <div>
                  <input type='checkbox' checked={newOption} onChange={this.setNewOptionChecked} name='custom'/>
                  <label htmlFor='custom'>Nominate a new option!</label>
                </div>
                {selected.maxlength ?
                  <div>({selected.maxlength} character limit)</div> :
                  null}
                <div>
                  <input className={styles['underline']} value={newOptionValue} disabled={!newOption} type='text'
                         name='newOptionValue' maxLength={selected.maxlength}
                         onChange={this.setNewOptionValue} placeholder='Enter Here'/>
                </div>
              </React.Fragment> :
              null}
            {choices.length ?
              <React.Fragment>
                <div>Choose an existing option:</div>
                {choices.map(choice =>
                  (<div key={choice.id} className={styles['choice']}>
                    <input checked={selectedChoiceId === choice.id} type='checkbox'
                           onChange={() => this.setState({selectedChoiceId: choice.id, newOption: false})}
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
                     onChange={this.setAmount} placeholder='Enter Here'/>
              <label htmlFor='new_amount'>You have ${total} remaining.</label>
            </div>
            <div>
              <button className={cn(styles['add'], styles['inverse'])} id='add' disabled={addIncentiveDisabled === undefined}
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


type SolicitEmailOption = 'OPTIN' | 'OPTOUT' | 'CURR';

type Prize = {
  id: number;
  description?: string;
  minimumbid: string;
  name: string;
  url?: string;
  sumdonations?: boolean;
};

type DonateProps = {
  incentives: Array<Incentive>;
  formErrors: {bidform: Array<any>, commentform: object};
  initialForm: {
    requestedalias?: string;
    requestedemail?: string;
    requestedsolicitemail: SolicitEmailOption;
    amount?: string;
    comment?: string;
  };
  initialIncentives: Array<Bid>;
  event: {receivername: string};
  step: number;
  minimumDonation: number;
  maximumDonation: number;
  donateUrl: string,
  rulesUrl?: string,
  prizesUrl?: string;
  prizes: Array<Prize>;
  csrfToken?: string;
  onSubmit: () => any;
};

type DonateState = {
  showIncentives: boolean;
  currentIncentives: Array<Bid>;
  requestedalias: string;
  requestedemail: string;
  requestedsolicitemail: SolicitEmailOption;
  comment: string;
  amount: string;
  bidsformmanagement: Array<HTMLInputElement>;
  prizesform: Array<HTMLInputElement>;
};


class Donate extends React.PureComponent<DonateProps, DonateState> {
  static defaultProps = {
    step: 0.01,
    minimumDonation: 5,
    maximumDonation: 10000,
    initialIncentives: [],
  };

  state: DonateState = {
    showIncentives: this.props.initialIncentives.length !== 0,
    currentIncentives: this.props.initialIncentives || [],
    requestedalias: this.props.initialForm.requestedalias || '',
    requestedemail: this.props.initialForm.requestedemail || '',
    requestedsolicitemail: this.props.initialForm.requestedsolicitemail || 'CURR',
    comment: this.props.initialForm.comment || '',
    amount: this.props.initialForm.amount || '',
    bidsformmanagement: [],
    prizesform: [],
  };

  setRequestedAlias = (e: React.ChangeEvent<HTMLInputElement>) => this.setState({requestedalias: e.target.value});
  setRequestedEmail = (e: React.ChangeEvent<HTMLInputElement>) => this.setState({requestedemail: e.target.value});
  setComment = (e: React.ChangeEvent<HTMLTextAreaElement>) => this.setState({comment: e.target.value});

  setAmount = (amount: string) => {
    return (e: React.MouseEvent) => {
      this.setState({amount});
      e.preventDefault();
    }
  };

  setEmail = (requestedsolicitemail: SolicitEmailOption) => {
    return (e: React.MouseEvent) => {
      this.setState({requestedsolicitemail});
      e.preventDefault();
    }
  };

  addIncentive_ = (incentive: Bid) => {
    const {
      currentIncentives,
    } = this.state;
    const existing = currentIncentives.findIndex(ci => ci.bidId === incentive.bidId);
    let newIncentives;
    if (existing !== -1) {
      incentive.amount += (+currentIncentives[existing].amount);
      newIncentives = currentIncentives.slice(0, existing).concat([incentive]).concat(currentIncentives.slice(existing + 1));
    } else {
      newIncentives = currentIncentives.concat([incentive]);
    }
    this.setState({currentIncentives: newIncentives});
  };

  deleteIncentive_ = (i: number) => {
    return (e: React.SyntheticEvent) => {
      const {
        currentIncentives,
      } = this.state;
      this.setState({currentIncentives: currentIncentives.slice(0, i).concat(currentIncentives.slice(i + 1))});
    }
  };

  sumIncentives_() {
    return this.state.currentIncentives.reduce((sum, ci) => ci.bidId ? sum + (+ci.amount) : 0, 0);
  }

  finishDisabled_() {
    const {
      amount,
      currentIncentives,
      showIncentives,
    } = this.state;
    const {
      minimumDonation,
      incentives,
    } = this.props;
    if (currentIncentives.length > 10) {
      return 'Too many incentives.';
    }
    if (this.sumIncentives_() > Number(amount)) {
      return 'Total bid amount cannot exceed donation amount.';
    }
    if (showIncentives && this.sumIncentives_() < Number(amount)) {
      return 'Total donation amount not allocated.';
    }
    if (Number(amount) < minimumDonation) {
      return 'Donation amount below minimum.';
    }
    const hasInvalidIncentives = currentIncentives.some(ci => {
      const incentive = incentives.find(i => i.id === ci.bidId);
      return incentive && incentive.maxlength && (ci.customoptionname && ci.customoptionname.length > incentive.maxlength);
    });
    if (hasInvalidIncentives) {
      return 'Suggestion is too long.';
    }
    return null;
  }

  wrapPrize_(prize: Prize, children: React.ReactNode) {
    return prize.url ? <a href={prize.url}>{children}</a> : children;
  }

  componentDidMount() {
    const bidsFormManagement = document.querySelector('table[data-form=bidsform][data-form-type=management]');
    const bidsFormManagementElements = bidsFormManagement != null ? Array.from(bidsFormManagement.querySelectorAll('input')) : [];
    const prizesForm = document.querySelector('table[data-form=prizesform]');
    const prizesFormElements = prizesForm != null ? Array.from(prizesForm.querySelectorAll('input')) : [];

    this.setState({
      bidsformmanagement: bidsFormManagementElements.filter(i => i.id),
      prizesform: prizesFormElements.filter(i => i.id),
    });
  }

  render() {
    const {
      showIncentives,
      currentIncentives,
      requestedalias,
      requestedemail,
      requestedsolicitemail,
      comment,
      amount,
      bidsformmanagement,
      prizesform,
    } = this.state;
    const {
      step,
      event,
      prizesUrl,
      rulesUrl,
      minimumDonation,
      maximumDonation,
      formErrors,
      prizes,
      donateUrl,
      incentives,
      csrfToken,
      onSubmit,
    } = this.props;
    // TODO: show more form errors
    const finishDisabled = this.finishDisabled_();
    return (
      <form className={styles['donationForm']} action={donateUrl} method='post' onSubmit={onSubmit}>
        <input type='hidden' name='csrfmiddlewaretoken' value={csrfToken}/>
        <div className={styles['donation']}>
          <div className={cn(styles['cubano'], styles['thankyou'])}>THANK YOU</div>
          <div className={cn(styles['cubano'], styles['fordonation'])}>FOR YOUR DONATION</div>
          <div className={styles['hundred']}>100% of your donation goes directly to {event.receivername}.</div>
          <div className={styles['biginput']}>
            <input type='hidden' name='requestedvisibility' value={requestedalias ? 'ALIAS' : 'ANON'}/>
            <input className={cn(styles['underline'], styles['preferredNameInput'])} placeholder='Preferred Name/Alias'
                   type='text' name='requestedalias' value={requestedalias} onChange={this.setRequestedAlias}
                   maxLength={32} />
            <div>(Leave blank for Anonymous)</div>
          </div>
          <div className={styles['biginput']}>
            <input className={cn(styles['underline'], styles['preferredEmailInput'])} placeholder='Email Address'
                   type='email' name='requestedemail' value={requestedemail} maxLength={128}
                   onChange={this.setRequestedEmail}/>
            <div>(Click <a className={cn('block-external', styles['privacy'])}
                           href='https://gamesdonequick.com/privacy/' target='_blank'
                           rel='noopener noreferrer'>here</a> for our privacy policy)
            </div>
          </div>
          <div className={styles['emailCTA']}>
            Do you want to receive emails from {event.receivername}?
          </div>
          <div className={styles['emailButtons']}>
            <input type='hidden' name='requestedsolicitemail' value={requestedsolicitemail}/>
            <button id='email_optin' className={cn({[styles['selected']]: requestedsolicitemail === 'OPTIN'})}
                    disabled={requestedsolicitemail === 'OPTIN'} onClick={this.setEmail('OPTIN')}>Yes
            </button>
            <button id='email_optout' className={cn({[styles['selected']]: requestedsolicitemail === 'OPTOUT'})}
                    disabled={requestedsolicitemail === 'OPTOUT'} onClick={this.setEmail('OPTOUT')}>No
            </button>
            <button id='email_curr' className={cn({[styles['selected']]: requestedsolicitemail === 'CURR'})}
                    disabled={requestedsolicitemail === 'CURR'} onClick={this.setEmail('CURR')}>Use Existing Preference
              (No if not already set)
            </button>
          </div>
          <div className={styles['donationArea']}>
            <div className={styles['donationAmount']}>
              <input className={cn(styles['underline'], styles['amountInput'])} placeholder='Enter Amount' type='number'
                     name='amount' value={amount} step={step} min={minimumDonation} max={maximumDonation}
                     onChange={(e) => this.setAmount(e.target.value)}/>
              <div className={styles['buttons']}>
                <button onClick={this.setAmount('25')}>$25</button>
                <button onClick={this.setAmount('50')}>$50</button>
                <button onClick={this.setAmount('75')}>$75</button>
              </div>
              <div className={styles['buttons']}>
                <button onClick={this.setAmount('100')}>$100</button>
                <button onClick={this.setAmount('250')}>$250</button>
                <button onClick={this.setAmount('500')}>$500</button>
              </div>
              <div>(Minimum donation is ${minimumDonation})</div>
            </div>
            {prizes.length ?
              <div className={styles['prizeInfo']}>
                <div className={styles['cta']}>Donations can enter you to win prizes!</div>
                <div className={styles['prizeList']}>
                  <div className={styles['header']}>CURRENT PRIZE LIST:</div>
                  <div className={styles['prizes']}>
                    {prizes.map(prize =>
                      <div key={prize.id} className={styles['item']}>
                        {this.wrapPrize_(prize,
                          <React.Fragment>
                            <div className={cn(styles['name'], styles['cubano'])}>
                              {prize.name}
                            </div>
                            <div className={styles['bidinfo']}>
                              ${prize.minimumbid} {prize.sumdonations ? 'Total Donations' : 'Minimum Single Donation'}
                            </div>
                          </React.Fragment>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div><a className='block-external' href={prizesUrl} target='_blank' rel='noopener noreferrer'>Full
                  prize list (New tab)</a></div>
                {rulesUrl ?
                  <React.Fragment>
                    <div><a className='block-external' href={rulesUrl} target='_blank' rel='noopener noreferrer'>Official
                      Rules (New tab)</a></div>
                    <div className={cn(styles['disclaimer'], styles['cta'])}>No donation necessary for a chance to win.
                      See sweepstakes rules for details and instructions.
                    </div>
                  </React.Fragment> : null}
              </div> :
              null}
          </div>
          <div className={styles['commentArea']}>
            <div className={styles['cubano']}>(OPTIONAL) LEAVE A COMMENT?</div>
            <textarea className={styles['commentInput']} placeholder='Enter Comment Here' value={comment}
                      onChange={this.setComment} name='comment' maxLength={5000}/>
            <label htmlFor='comment'>Please refrain from offensive language or hurtful remarks. All donation comments
              are screened and will be removed from the website if deemed unacceptable.</label>
          </div>
        </div>
        <div className={styles['incentivesCTA']}>
          <div className={styles['cubano']}>DONATION INCENTIVES</div>
          <div>Donation incentives can be used to add bonus runs to the schedule or influence choices by runners. Do
            you wish to put your donation towards an incentive?
          </div>
          <div className={styles['incentivesButtons']}>
            <button
              className={styles['inverse']}
              disabled={showIncentives}
              id='show_incentives'
              type='button'
              onClick={() => {
                this.setState({showIncentives: true});
              }}>
              YES!
            </button>
            <button
              id='skip_incentives'
              className={styles['inverse']}
              disabled={showIncentives || this.finishDisabled_() != null}
              type='submit'>
              NO, SKIP INCENTIVES
            </button>
            {!showIncentives && finishDisabled && <label htmlFor='skip' className='error'>{finishDisabled}</label>}
          </div>
        </div>
        {showIncentives ?
          <React.Fragment>
            <Incentives
              step={step}
              errors={formErrors.bidform}
              incentives={incentives}
              currentIncentives={currentIncentives}
              deleteIncentive={this.deleteIncentive_}
              addIncentive={this.addIncentive_}
              total={(Number(amount) || 0) - this.sumIncentives_()}
            />
            <div className={styles['finishArea']}>
              <button
                className={cn(styles['finish'], styles['inverse'], styles['cubano'])}
                id='finish'
                disabled={this.finishDisabled_() != null}
                type='submit'>
                FINISH
              </button>
              {finishDisabled && <label htmlFor='finish' className='error'>{finishDisabled}</label>}
            </div>
          </React.Fragment> :
          null}
        <React.Fragment>
          {bidsformmanagement && bidsformmanagement.map(i => <input key={i.id} id={i.id} name={i.name}
                                                                    value={i.name.includes('TOTAL_FORMS') ? currentIncentives.filter(ci => !!ci.bidId).length : i.value}
                                                                    type='hidden'/>)}
        </React.Fragment>
        <React.Fragment>
          {prizesform && prizesform.map(i => <input key={i.id} id={i.id} name={i.name} value={i.value} type='hidden'/>)}
        </React.Fragment>
      </form>
    );
  }
};

export default Donate;
