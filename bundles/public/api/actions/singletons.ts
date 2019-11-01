import {Dispatch} from 'redux';

import HTTPUtil from '../../util/http';
import {onModelStatusError, onModelStatusLoad, onModelStatusSuccess} from './models';

import {MeModel} from '../models';

export type SingletonAction =
  | {type: 'LOAD_ME', me?: MeModel};

function onLoadMe(me?: MeModel): SingletonAction {
    return {
        type: 'LOAD_ME',
        me
    };
}

export function fetchMe() {
    return (dispatch: Dispatch) => {
        dispatch(onModelStatusLoad('me'));
        return HTTPUtil.get(`${window.API_ROOT}me`)
            .then((me) => {
                dispatch(onModelStatusSuccess('me'));
                dispatch(onLoadMe(me));
            }).catch((error) => {
                dispatch(onModelStatusError('me'));
                dispatch(onLoadMe()); // anonymous user
            });
    };
}

export default {
    fetchMe,
};
