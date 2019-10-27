import _ from 'lodash';
// type Donation = {
//   name: ?string,
//   nameVisibility: 'ANON' | 'ALIAS',
//   email: ?string,
//   wantsEmails: 'OPTIN' | 'OPTOUT' | 'CURR';
//   amount: ?number,
//   comment: ?string,
// };

const defaultDonation = {
  name: "",
  nameVisibility: 'ANON',
  email: "",
  wantsEmails: 'CURR',
  amount: null,
  comment: "",
};
const defaultState = {...defaultDonation};

const actions = {
  'donation/UPDATE_DONATION': (state, {data}) => {
    const amount = Number(data.amount);
    return _.merge({...state}, {
      name: data.name,
      nameVisibility: !!data.name ? 'ALIAS' : 'ANON',
      email: data.email,
      wantsEmails: data.wantsEmails,
      amount: data.amount,
      amount: amount === NaN ? null : amount,
      comment: data.comment,
    });
  },
};



export default function reducer(state = defaultState, action) {
  const func = actions[action.type];
  const newState = func ? func(state, action) : state;
  return newState;
}
