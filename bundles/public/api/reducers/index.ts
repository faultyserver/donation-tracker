import { combineReducers } from 'redux';
import { History } from 'history';
import { connectRouter } from 'connected-react-router';

import drafts from './drafts';
import models from './models';
import status, {StatusState} from './status';
import dropdowns, {DropdownState} from './dropdowns';
import singletons, {SingletonState} from './singletons';

export type ReducerState = {
  singletons: SingletonState;
  dropdowns: DropdownState;
  status: StatusState;
};

const createRootReducer = (history: History) => combineReducers({
  router: connectRouter(history),
  drafts,
  models,
  status,
  dropdowns,
  singletons,
});

export default createRootReducer;
