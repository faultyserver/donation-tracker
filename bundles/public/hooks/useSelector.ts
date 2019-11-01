import {useSelector as reduxUseSelector, TypedUseSelectorHook} from 'react-redux';

import {ReducerState} from '../api/reducers/index';

export const useSelector: TypedUseSelectorHook<ReducerState> = reduxUseSelector;
