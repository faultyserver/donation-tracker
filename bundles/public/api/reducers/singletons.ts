import {Action} from 'redux';

import {SingletonAction} from '../actions/singletons';
import {MeModel} from '../models';

export type SingletonState = {
  me?: MeModel
};

function loadMe(state: SingletonState, action: SingletonAction) {
    return {...state, me: action.me};
}

const singletonFunctions = {
    LOAD_ME: loadMe,
};

export default function models(state: SingletonState = {}, action: SingletonAction) {
    if (singletonFunctions[action.type]) {
        return singletonFunctions[action.type](state, action);
    } else {
        return state;
    }
}
