import _ from 'lodash';
import {Dispatch} from 'redux';
import {Model} from '../models';

import Cookies from '../../util/cookies';
import HTTPUtil from '../../util/http';

export type ModelType = 'speedrun' | 'me';

export type ModelCollectionAction =
  | {type: 'MODEL_COLLECTION_REPLACE', model: ModelType, models: Array<Model>}
  | {type: 'MODEL_COLLECTION_ADD', model: ModelType, models: Array<Model>}
  | {type: 'MODEL_COLLECTION_REMOVE', model: ModelType, models: Array<Model>};

export type ModelDraftAction =
  | {type: 'MODEL_NEW_DRAFT', model: {type: ModelType} & Model}
  | {type: 'MODEL_DELETE_DRAFT', model: Partial<Model>}
  | {type: 'MODEL_SAVE_DRAFT_ERROR', model: Model, error: any, fields: any}
  | {type: 'MODEL_DRAFT_UPDATE_FIELD', model: ModelType, pk: string, field: string, value: any};

export type ModelInternalAction =
  | {type: 'MODEL_SET_INTERNAL_FIELD', model: ModelType, pk: string, field: string, value: any};

export type ModelStatusAction =
  | {type: 'MODEL_STATUS_LOADING', model: ModelType}
  | {type: 'MODEL_STATUS_SUCCESS', model: ModelType}
  | {type: 'MODEL_STATUS_ERROR', model: ModelType};

export type ModelAction =
  | ModelStatusAction
  | ModelInternalAction
  | ModelDraftAction
  | ModelCollectionAction;



export function onModelStatusLoad(model: ModelType) {
    return {
        type: 'MODEL_STATUS_LOADING', model
    };
}

export function onModelStatusSuccess(model: ModelType) {
    return {
        type: 'MODEL_STATUS_SUCCESS', model
    };
}

export function onModelStatusError(model: ModelType) {
    return {
        type: 'MODEL_STATUS_ERROR', model
    };
}

export function onModelCollectionReplace(model: ModelType, models: Array<Model>) {
    return {
        type: 'MODEL_COLLECTION_REPLACE', model, models
    };
}

export function onModelCollectionAdd(model: ModelType, models: Array<Model>) {
    return {
        type: 'MODEL_COLLECTION_ADD', model, models
    };
}

export function onModelCollectionRemove(model: ModelType, models: Array<Model>) {
    return {
        type: 'MODEL_COLLECTION_REMOVE', model, models
    };
}

// TODO: Better solution than this
const modelTypeMap = {
    speedrun: 'run',
    me: 'me',
};

function loadModels(model: ModelType, params?: object, additive?: object) {
  return (dispatch: Dispatch) => {
    dispatch(onModelStatusLoad(model));
    return HTTPUtil.get(`${window.API_ROOT}search`, {
      ...params,
      type: modelTypeMap[model] || model,
    }).then((models) => {
      dispatch(onModelStatusSuccess(model));
      const action = additive ? onModelCollectionAdd : onModelCollectionReplace;
      dispatch(action(model,
        models.reduce((acc: any, v: any) => {
          if (v.model.toLowerCase() === `tracker.${model}`.toLowerCase()) {
            v.fields.pk = v.pk;
            acc.push(v.fields);
          }
          return acc;
        }, [])
      ));
    }).catch((error) => {
      dispatch(onModelStatusError(model));
      if(!additive) {
        dispatch(onModelCollectionReplace(model, []));
      }
    });
  }
}

function onNewDraftModel(model: {type: ModelType} & Model) {
    return {
        type: 'MODEL_NEW_DRAFT', model
    };
}

function newDraftModel(model: {type: ModelType} & Model) {
    return (dispatch: Dispatch) => {
        dispatch(onNewDraftModel(model));
    };
}

function onDeleteDraftModel(model: Partial<Model>) {
    return {
        type: 'MODEL_DELETE_DRAFT', model
    }
}

function deleteDraftModel(model: Partial<Model>) {
    return (dispatch: Dispatch) => {
        dispatch(onDeleteDraftModel(model));
    };
}

function onDraftModelUpdateField(model: ModelType, pk: string, field: string, value: any) {
    return {
        type: 'MODEL_DRAFT_UPDATE_FIELD', model, pk, field, value
    };
}

function updateDraftModelField(model: ModelType, pk: any, field: string, value: any) {
    return (dispatch: Dispatch) => {
        dispatch(onDraftModelUpdateField(model, pk, field, value));
    };
}

function onSetInternalModelField(model: ModelType, pk: any, field: string, value: any) {
    return {
        type: 'MODEL_SET_INTERNAL_FIELD', model, pk, field, value
    };
}

function setInternalModelField(model: ModelType, pk: any, field: string, value: any) {
    return (dispatch: Dispatch) => {
        dispatch(onSetInternalModelField(model, pk, field, value));
    };
}

function onSaveDraftModelError(model: Partial<Model>, error: any, fields: any) {
    return {
        type: 'MODEL_SAVE_DRAFT_ERROR', model, error, fields
    };
}

function saveDraftModels(models: Array<Partial<Model>>) {
    return (dispatch: Dispatch) => {
        _.each(models, (model) => {
            dispatch(setInternalModelField(model.type, model.pk, 'saving', true));
            const url = model.pk < 0 ? `${window.API_ROOT}add/` : `${window.API_ROOT}edit/`;

            HTTPUtil.post(url, {
                type: modelTypeMap[model.type] || model.type,
                id: model.pk,
                ..._.omit(model.fields, (v, k) => k.startsWith('_'))
            }, {
                encoder: HTTPUtil.Encoders.QUERY,
            }).then((savedModels) => {
                const models = savedModels.reduce((acc, v) => {
                    if (v.model.toLowerCase() === `tracker.${model.type}`.toLowerCase()) {
                        v.fields.pk = v.pk;
                        acc.push(v.fields);
                    } else {
                        console.warn('unexpected model', v);
                    }
                    return acc;
                }, []);
                dispatch(onModelCollectionAdd(model.type, models));
                dispatch(onDeleteDraftModel(model));
            }).catch((response) => {
                const json = response.json();
                dispatch(onSaveDraftModelError(model, json ? json.error : response.body(), json ? json.fields : {}));
            }).finally(() => {
                dispatch(setInternalModelField(model.type, model.pk, 'saving', false));
            });
        });
    }
}

function saveField(model: Partial<Model>, field?: string, value?: any) {
    return (dispatch: Dispatch) => {
        if (model.pk) {
            dispatch(setInternalModelField(model.type, model.pk, 'saving', true));
            if (value === undefined || value === null) {
                value = 'None';
            }
            HTTPUtil.post(`${window.API_ROOT}edit/`, {
                type: modelTypeMap[model.type] || model.type,
                id: model.pk,
                [field]: value
            }, {
              encoder: HTTPUtil.Encoders.QUERY
            }).then((savedModels) => {
                dispatch(onModelCollectionAdd(model.type,
                    savedModels.reduce((o, v) => {
                        if (v.model.toLowerCase() === `tracker.${model.type}`.toLowerCase()) {
                            v.fields.pk = v.pk;
                            o.push(v.fields);
                        } else {
                            console.warn('unexpected model', v);
                        }
                        return o;
                    }, [])
                ));
            }).catch((response) => {
                const json = response.json();
                dispatch(onSaveDraftModelError(model, json ? json.error : response.body(), json ? json.fields : {}));
            }).finally(() => {
                dispatch(setInternalModelField(model.type, model.pk, 'saving', false));
            });
        }
    }
}

function command(command) {
    return (dispatch: Dispatch) => {
        return HTTPUtil.post(`${window.API_ROOT}command/`, {
            data: JSON.stringify({
                command: command.type,
                ...command.params,
            }),
        }, {
          encoder: HTTPUtil.Encoders.QUERY,
        }).then((models) => {
            const m = models[0];
            if (!m) return;

            const type = m.model.split('.')[1];
            dispatch(onModelCollectionAdd(type,
                models.reduce((acc, v) => {
                    if (v.model.toLowerCase() === `tracker.${type}`.toLowerCase()) {
                        v.fields.pk = v.pk;
                        acc.push(v.fields);
                    } else {
                        console.warn('unexpected model', v);
                    }
                    return acc;
                }, [])
            ));
            if (typeof command.done === 'function') {
                command.done();
            }
        }).catch(() => {
            if (typeof command.fail === 'function') {
                command.fail();
            }
        }).finally(() => {
            if (typeof command.always === 'function') {
                command.always();
            }
        });
    }
}

export default {
    loadModels,
    newDraftModel,
    deleteDraftModel,
    updateDraftModelField,
    setInternalModelField,
    saveDraftModels,
    saveField,
    command,
};
