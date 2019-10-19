import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import cn from 'classnames';

import Incentives, {IncentiveProps} from './components/incentives';
import Anchor from '../public/uikit/Anchor';
import Button from '../public/uikit/Button';
import Header from '../public/uikit/Header';
import Text from '../public/uikit/Text';
import TextInput from '../public/uikit/TextInput';

import styles from './donate.css';


class Donate extends React.PureComponent {
  static propTypes = {
    incentives: PropTypes.arrayOf(IncentiveProps.isRequired).isRequired,
    formErrors: PropTypes.shape({
      bidsform: PropTypes.array.isRequired,
      commentform: PropTypes.object.isRequired,
    }).isRequired,
    initialForm: PropTypes.shape({
      requestedalias: PropTypes.string,
      requestedemail: PropTypes.string,
      amount: PropTypes.string,
    }).isRequired,
    initialIncentives: PropTypes.arrayOf(PropTypes.shape({
      bid: PropTypes.number, // will be null if the bid closed while we were filling it out
      amount: PropTypes.string.isRequired,
      customoptionname: PropTypes.string.isRequired,
    }).isRequired).isRequired,
    event: PropTypes.shape({
      receivername: PropTypes.string.isRequired,
    }).isRequired,
    step: PropTypes.number.isRequired,
    minimumDonation: PropTypes.number.isRequired,
    maximumDonation: PropTypes.number.isRequired,
    donateUrl: PropTypes.string.isRequired,
    prizes: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      description: PropTypes.string,
      minimumbid: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }).isRequired).isRequired,
    prizesUrl: PropTypes.string.isRequired,
    rulesUrl: PropTypes.string,
    csrfToken: PropTypes.string,
    onSubmit: PropTypes.func,
  };

  static defaultProps = {
    step: 0.01,
    minimumDonation: 5,
    maximumDonation: 10000,
    initialIncentives: [],
  };

  state = {
    showIncentives: this.props.initialIncentives.length !== 0,
    currentIncentives: this.props.initialIncentives || [],
    requestedalias: this.props.initialForm.requestedalias || '',
    requestedemail: this.props.initialForm.requestedemail || '',
    requestedsolicitemail: this.props.initialForm.requestedsolicitemail || 'CURR',
    comment: this.props.initialForm.comment || '',
    amount: this.props.initialForm.amount || '',
    bidsformmanagement: null,
    prizesform: null,
  };

  setValue = key => {
    return e => {
      this.setState({[key]: e.target.value});
    }
  };

  setAmount = (amount) => {
    return e => {
      this.setState({amount});
      e.preventDefault();
    }
  };

  setEmail = (requestedsolicitemail) => {
    this.setState({requestedsolicitemail});
  };

  addIncentive_ = (incentive) => {
    const {
      currentIncentives,
    } = this.state;
    const existing = currentIncentives.findIndex(ci => ci.bid === incentive.bid);
    let newIncentives;
    if (existing !== -1) {
      incentive.amount += (+currentIncentives[existing].amount);
      newIncentives = currentIncentives.slice(0, existing).concat([incentive]).concat(currentIncentives.slice(existing + 1));
    } else {
      newIncentives = currentIncentives.concat([incentive]);
    }
    this.setState({currentIncentives: newIncentives});
  };

  deleteIncentive_ = (i) => {
    return e => {
      const {
        currentIncentives,
      } = this.state;
      this.setState({currentIncentives: currentIncentives.slice(0, i).concat(currentIncentives.slice(i + 1))});
    }
  };

  sumIncentives_() {
    return this.state.currentIncentives.reduce((sum, ci) => ci.bid ? sum + (+ci.amount) : 0, 0);
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
    if (this.sumIncentives_() > amount) {
      return 'Total bid amount cannot exceed donation amount.';
    }
    if (showIncentives && this.sumIncentives_() < amount) {
      return 'Total donation amount not allocated.';
    }
    if (amount < minimumDonation) {
      return 'Donation amount below minimum.';
    }
    if (currentIncentives.some(ci => {
      const incentive = incentives.find(i => i.id === ci.bid);
      return incentive && incentive.maxlength && ci.customoptionname.length > incentive.maxlength;
    })) {
      return 'Suggestion is too long.';
    }
    return null;
  }

  wrapPrize_(prize, children) {
    return prize.url ? <a href={prize.url}>{children}</a> : children;
  }

  componentDidMount() {
    this.setState({
      bidsformmanagement: Array.from(document.querySelector('table[data-form=bidsform][data-form-type=management]').querySelectorAll('input')).filter(i => i.id),
      prizesform: Array.from(document.querySelector('table[data-form=prizesform]').querySelectorAll('input')).filter(i => i.id),
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
      <form className={styles.donationForm} action={donateUrl} method="post" onSubmit={onSubmit}>
        <input type="hidden" name="csrfmiddlewaretoken" value={csrfToken}/>
        <div className={styles.donation}>
          <Header size={Header.Sizes.H1} marginless>Thank You For Your Donation</Header>
          <Text size={Text.Sizes.SIZE_16}>
            100% of your donation goes directly to {event.receivername}.
          </Text>

          <input type="hidden" name="requestedvisibility" value={requestedalias ? 'ALIAS' : 'ANON'}/>

          <TextInput
            name="requestedalias"
            value={requestedalias}
            label="Preferred Name/Alias"
            hint="Leave blank to donate anonymously"
            size={TextInput.Sizes.LARGE}
            onChange={this.setValue('requestedalias')}
            maxLength={32}
          />
          <TextInput
            name="requestedemail"
            value={requestedemail}
            label="Email Address"
            hint={
              <React.Fragment>
                Click
                <Anchor href='https://gamesdonequick.com/privacy/' external newTab>here</Anchor>
                for our privacy policy
              </React.Fragment>
            }
            size={TextInput.Sizes.LARGE}
            onChange={this.setValue('requestedemail')}
            maxLength={32}
          />

          <Text size={Text.Sizes.SIZE_16} marginless>
            Do you want to receive emails from {event.receivername}?
          </Text>

          <div className={styles.emailButtons}>
            <input type="hidden" name="requestedsolicitemail" value={requestedsolicitemail}/>
            <Button
                id='email_optin'
                look={requestedsolicitemail === 'OPTIN' ? Button.Looks.FILLED : Button.Looks.OUTLINED}
                onClick={() => this.setEmail('OPTIN')}>
              Yes
            </Button>
            <Button
                id='email_optin'
                look={requestedsolicitemail === 'OPTOUT' ? Button.Looks.FILLED : Button.Looks.OUTLINED}
                onClick={() => this.setEmail('OPTOUT')}>
              No
            </Button>
            <Button
                id='email_optin'
                look={requestedsolicitemail === 'CURR' ? Button.Looks.FILLED : Button.Looks.OUTLINED}
                onClick={() => this.setEmail('CURR')}>
              Use Existing Preference (No if not already set)
            </Button>
          </div>

          <div className={styles.donationArea}>
            <div className={styles.donationAmount}>
              <TextInput
                name="amount"
                value={amount}
                label="Amount"
                hint={`Minimum donation is $${minimumDonation}`}
                size={TextInput.Sizes.LARGE}
                type={TextInput.Types.NUMBER}
                onChange={this.setValue('amount')}
                step={step}
                leader="$"
                min={minimumDonation}
                max={maximumDonation}
              />
              <div className={styles.buttons}>
                <Button look={Button.Looks.OUTLINED} onClick={this.setAmount(25)}>$25</Button>
                <Button look={Button.Looks.OUTLINED} onClick={this.setAmount(50)}>$50</Button>
                <Button look={Button.Looks.OUTLINED} onClick={this.setAmount(75)}>$75</Button>
              </div>
              <div className={styles.buttons}>
                <Button look={Button.Looks.OUTLINED} onClick={this.setAmount(100)}>$100</Button>
                <Button look={Button.Looks.OUTLINED} onClick={this.setAmount(250)}>$250</Button>
                <Button look={Button.Looks.OUTLINED} onClick={this.setAmount(500)}>$500</Button>
              </div>
              <Text size={Text.Sizes.SIZE_14}></Text>
            </div>

            { prizes.length
              ? <div className={styles.prizeInfo}>
                  <div className={styles.cta}>Donations can enter you to win prizes!</div>
                  <div className={styles.prizeList}>
                    <Header size={Header.Sizes.H3} marginless>CURRENT PRIZE LIST:</Header>
                    <div className={styles.prizes}>
                      {prizes.map(prize =>
                        <div key={prize.id} className={styles.item}>
                          { this.wrapPrize_(prize,
                              <React.Fragment>
                                <Text size={Text.Sizes.SIZE_16}>{prize.name}</Text>
                                <Text size={Text.Sizes.SIZE_14}>
                                  ${prize.minimumbid} {prize.sumdonations ? 'Total Donations' : 'Minimum Single Donation'}
                                </Text>
                              </React.Fragment>
                            )
                          }
                        </div>
                      )}
                    </div>
                  </div>
                  <p>
                    <Anchor href={prizesUrl} external newTab>Full prize list (New tab)</Anchor>
                  </p>
                  { rulesUrl
                    ? <React.Fragment>
                        <p><Anchor href={rulesUrl} external newTab>Official Rules (New tab)</Anchor></p>
                        <Text size={Text.Sizes.SIZE_12}>No donation necessary for a chance to win. See sweepstakes rules for details and instructions.</Text>
                      </React.Fragment>
                    : null
                  }
                </div>
              : null
            }
          </div>
          <div className={styles.commentArea}>
            <Header size={Header.Sizes.H5} withMargin>(OPTIONAL) LEAVE A COMMENT?</Header>
            <textarea
              className={styles.commentInput}
              placeholder='Enter Comment Here'
              value={comment}
              onChange={this.setValue('comment')}
              name='comment'
              maxLength={5000}
            />
            <label htmlFor='comment'>Please refrain from offensive language or hurtful remarks. All donation comments are screened and will be removed from the website if deemed unacceptable.</label>
          </div>
        </div>

        <div className={styles.incentivesCTA}>
          <Header size={Header.Sizes.H4} withMargin>DONATION INCENTIVES</Header>
          <Text>
            Donation incentives can be used to add bonus runs to the schedule or influence choices by runners. Do you wish to put your donation towards an incentive?
          </Text>

          <div className={styles.incentivesButtons}>
            <Button
              disabled={showIncentives}
              look={Button.Looks.FILLED}
              size={Button.Sizes.LARGE}
              id='show_incentives'
              onClick={() => {
                this.setState({showIncentives: true});
              }}>
              YES!
            </Button>
            <Button
              id='skip_incentives'
              look={Button.Looks.FILLED}
              size={Button.Sizes.LARGE}
              disabled={showIncentives || this.finishDisabled_()}
              type='submit'>
              NO, SKIP INCENTIVES
            </Button>
          </div>
          {!showIncentives && finishDisabled && <label htmlFor='skip' className='error'>{finishDisabled}</label>}
        </div>

        { showIncentives
          ? <React.Fragment>
              <Incentives
                step={step}
                errors={formErrors.bidsform}
                incentives={incentives}
                currentIncentives={currentIncentives}
                deleteIncentive={this.deleteIncentive_}
                addIncentive={this.addIncentive_}
                total={(amount || 0) - this.sumIncentives_()}
              />
              <div className={styles.finishArea}>
                <Button
                  id='finish'
                  disabled={this.finishDisabled_()}
                  type='submit'>
                  FINISH
                </Button>
                {finishDisabled && <label htmlFor='finish' className='error'>{finishDisabled}</label>}
              </div>
            </React.Fragment>
          : null
        }

        {bidsformmanagement && bidsformmanagement.map(i => <input key={i.id} id={i.id} name={i.name}
                                                                  value={i.name.includes('TOTAL_FORMS') ? currentIncentives.filter(ci => !!ci.bid).length : i.value}
                                                                  type='hidden'/>)}

        {prizesform && prizesform.map(i => <input key={i.id} id={i.id} name={i.name} value={i.value} type='hidden'/>)}
      </form>
    );
  }
};

export default Donate;
