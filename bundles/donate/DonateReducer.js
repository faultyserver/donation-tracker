import _ from 'lodash';

const defaultState = {
  bids: {},
};

const actions = {
  'donate/CREATE_BID': (state, {data}) => {
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

  'donate/DELETE_BID': (state, {data}) => {
    const {bidId} = data;
    const {
      [bidId]: _deletedBid,
      ...filteredBids,
    } = state.bids;

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
