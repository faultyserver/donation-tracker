import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';

import IncentivesReducer from './IncentivesReducer';

const combinedReducer = combineReducers({
  incentives: IncentivesReducer,
});

export const store = createStore(combinedReducer, applyMiddleware(thunk));
