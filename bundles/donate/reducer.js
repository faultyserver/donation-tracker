import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';

import DonateReducer from './DonateReducer';

const combinedReducer = combineReducers({
  donate: DonateReducer,
});

export const store = createStore(combinedReducer, applyMiddleware(thunk));
