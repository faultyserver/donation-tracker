import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import cn from 'classnames';

import Anchor from '../public/uikit/Anchor';
import Button from '../public/uikit/Button';
import Header from '../public/uikit/Header';
import Text from '../public/uikit/Text';
import TextInput from '../public/uikit/TextInput';
import Incentives, {IncentiveProps} from './components/Incentives';
import Prizes from './components/Prizes';


import styles from './Donate.mod.css';


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

    const amountPresets = [25, 50, 75, 100, 250, 500];

    return (
      <form className={styles.donationForm} action={donateUrl} method="post" onSubmit={onSubmit}>
        <input type="hidden" name="csrfmiddlewaretoken" value={csrfToken}/>
        <section className={styles.section}>
          <Header size={Header.Sizes.H1} marginless>Thank You For Your Donation</Header>
          <Text size={Text.Sizes.SIZE_16}>100% of your donation goes directly to {event.receivername}.</Text>

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
                Click <Anchor href='https://gamesdonequick.com/privacy/' external newTab>here</Anchor> for our privacy policy
              </React.Fragment>
            }
            size={TextInput.Sizes.LARGE}
            onChange={this.setValue('requestedemail')}
          />
        </section>

        <section className={styles.section}>
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
        </section>

        <section className={styles.section}>
          <TextInput
            name="amount"
            value={amount}
            label="Amount"
            leader="$"
            placeholder="0.00"
            hint={<React.Fragment>Minimum donation is <strong>${minimumDonation}</strong></React.Fragment>}
            size={TextInput.Sizes.LARGE}
            type={TextInput.Types.NUMBER}
            onChange={this.setValue('amount')}
            step={step}
            min={minimumDonation}
            max={maximumDonation}
          />
          <div className={styles.buttons}>
            {amountPresets.map((amount) => (
              <Button
                  key={amount}
                  look={Button.Looks.OUTLINED}
                  size={Button.Sizes.SMALL}
                  onClick={this.setAmount(amount)}>
                ${amount}
              </Button>
            ))}
          </div>
        </section>

        { prizes.length > 0 &&
          <section className={styles.section}>
            <Prizes prizes={prizes} prizesURL={prizesUrl} rulesURL={rulesUrl} />
          </section>
        }

        <section className={styles.section}>
          <Header size={Header.Sizes.H3}>Leave a Comment?</Header>
          <TextInput
            name="comment"
            value={comment}
            placeholder="Enter Comment Here"
            hint="Please refrain from offensive language or hurtful remarks. All donation comments are screened and will be removed from the website if deemed unacceptable."
            multiline
            onChange={this.setValue('comment')}
            maxLength={5000}
            rows={5}
          />
        </section>

        <div className={styles.incentivesCTA}>
          <Header size={Header.Sizes.H3}>Donation Incentives</Header>
          <Text>Donation incentives can be used to add bonus runs to the schedule or influence choices by runners. Do you wish to put your donation towards an incentive?</Text>

          <div className={styles.incentivesButtons}>
            <Button
                disabled={showIncentives}
                look={Button.Looks.FILLED}
                id='show_incentives'
                onClick={() => this.setState({showIncentives: true})}>
              Yes!
            </Button>
            <Button
                id='skip_incentives'
                look={Button.Looks.FILLED}
                disabled={showIncentives || this.finishDisabled_()}
                type='submit'>
              No, Skip Incentives
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
