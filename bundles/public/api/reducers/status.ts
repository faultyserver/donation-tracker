import _ from 'lodash';

import {ModelStatusAction} from '../actions/models';

export type StatusState = {
  [model: string]: string;
};

function modelStatusLoading(state: StatusState, action: ModelStatusAction) {
    return {
        ...state,
        [action.model]: 'loading',
    };
}

function modelStatusSuccess(state: StatusState, action: ModelStatusAction) {
    return {
        ...state,
        [action.model]: 'success',
    };
}

function modelStatusError(state: StatusState, action: ModelStatusAction) {
    return {
        ...state,
        [action.model]: 'error',
    };
}

const modelStatusFuctions = {
    MODEL_STATUS_LOADING: modelStatusLoading,
    MODEL_STATUS_SUCCESS: modelStatusSuccess,
    MODEL_STATUS_ERROR: modelStatusError,
};

export default function status(state: StatusState = {}, action: ModelStatusAction) {
    if (modelStatusFuctions[action.type]) {
        return modelStatusFuctions[action.type](state, action);
    } else {
        return state;
    }
}
