import _ from 'lodash';

const defaultState = {
  availableIncentives: {},
  bids: {},
};

const actions = {
  'incentives/LOAD_INCENTIVES': (state, {data}) => {
    const {incentives} = data;
    const incentivesById = _.keyBy(incentives, 'id');

    return {
      ...state,
      availableIncentives: incentivesById,
    };
  },

  'donate/CREATE_INCENTIVE_BID': (state, {data}) => {
    const {bid} = data;
    const newId = _.uniqueId('newBid');

    return {
      ...state,
      bids: {
        ...state.bids,
        [newId]: bid,
      },
    };
  },

  'donate/DELETE_INCENTIVE_BID': (state, {data}) => {
    const {bidId} = data;
    const {
      [bidId]: _removedBid,
      ...filteredBids,
    } = state;

    return {
      ...state,
      bids: filteredBids,
    };
  },
};



export default function reducer(state = defaultState, action) {
  const func = actions[action.type];
  const newState = func ? func(state, action) : state;
  return newState;
}
