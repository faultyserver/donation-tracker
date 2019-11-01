import _ from 'lodash';

import {ModelAction, ModelCollectionAction, ModelInternalAction, ModelType} from '../actions/models';
import {Model} from '../models';

type ModelState = {
  [type in ModelType]: Array<Model>;
};

function stateModels(state: ModelState, type: ModelType, models: Array<Model>) {
    return {
        ...state,
        [type]: models,
    };
}

function modelCollectionReplace(state: ModelState, action: ModelCollectionAction) {
    return stateModels(state, action.model, [...action.models]);
}

function modelCollectionAdd(state: ModelState, action: ModelCollectionAction) {
    return stateModels(
        state,
        action.model,
        _.values(_.assignIn(_.keyBy((state[action.model] || []).slice(), 'pk'), _.keyBy(action.models, 'pk')))
    );
}

function modelCollectionRemove(state: ModelState, action: ModelCollectionAction) {
    let models = state[action.model] ? state[action.model].slice() : [];
    let pks = _.map(action.models, 'pk');
    models = _.reject(models, (m) => {
        return _.indexOf(pks, m.pk) !== -1;
    });
    return stateModels(state, action.model,  models);
}

function modelSetInternalField(state: ModelState, action: ModelInternalAction) {
    const models = (state[action.model] || []).slice();
    const model = _.find(models, {pk: +action.pk});
    if (!model) {
        return state;
    }
    const _internal = model._internal || {};
    return stateModels(state, action.model, [..._.reject(models, (m) => m.pk === +action.pk), {...model, _internal: {..._internal, [action.field]: action.value}}]);
}

let modelCollectionFunctions = {
    MODEL_COLLECTION_REPLACE: modelCollectionReplace,
    MODEL_COLLECTION_ADD: modelCollectionAdd,
    MODEL_COLLECTION_REMOVE: modelCollectionRemove,
    MODEL_SET_INTERNAL_FIELD: modelSetInternalField,
};

export default function models(state: ModelState, action: ModelAction) {
    if (modelCollectionFunctions[action.type]) {
        return modelCollectionFunctions[action.type](state, action);
    } else {
        return state || {};
    }
}
