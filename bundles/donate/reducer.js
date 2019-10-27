import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';

import IncentivesReducer from './IncentivesReducer';
import EventDetailsReducer from './EventDetailsReducer';
import DonationReducer from './DonationReducer';

const combinedReducer = combineReducers({
  incentives: IncentivesReducer,
  eventDetails: EventDetailsReducer,
  donation: DonationReducer,
});

export const store = createStore(combinedReducer, applyMiddleware(thunk));
