import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {RouteComponentProps} from 'react-router';

import {actions} from '../../public/api';
import Spinner from '../../public/spinner';
import authHelper from '../../public/api/helpers/auth';

import SpeedrunTable from './speedrun_table';
import {SpeedrunModel} from '../types';

type ScheduleEditorProps = {
  speedruns: Array<SpeedrunModel>;
  event: string;
  drafts: Array<SpeedrunModel>;
  status: any;
  editable: boolean;
  moveSpeedrun: (source: any, destination?: any, before?: boolean) => any;
  loadModels: (model: string, params?: object, additive?: object) => any;
  saveDraftModels: (models: Array<any>) => any;
  updateDraftModelField: (type: string, pk: any, field: string, value: any) => any;
  newDraftModel: (model: {type: string} & Partial<SpeedrunModel>) => any;
  deleteDraftModel: (model: {type: string} & Partial<SpeedrunModel>) => any;
  saveField: (model: {type: string} & Partial<SpeedrunModel>, field: string, value: any) => any;
} & RouteComponentProps<{event: string}>;

class ScheduleEditor extends React.Component<ScheduleEditorProps> {
  render() {
    const {speedruns, event, drafts, status, moveSpeedrun, editable} = this.props;
    const {saveField_, saveModel_, editModel_, cancelEdit_, newSpeedrun_, updateField_,} = this;
    const loading = (status.speedrun === 'loading' || status.event === 'loading' || status.me === 'loading');
    return (
      <Spinner spinning={loading}>
        {(status.speedrun === 'success' ?
          <SpeedrunTable
            event={event}
            drafts={drafts}
            speedruns={speedruns}
            saveModel={editable ? saveModel_ : null}
            editModel={editable ? editModel_ : null}
            cancelEdit={editable ? cancelEdit_ : null}
            newSpeedrun={editable ? newSpeedrun_ : null}
            moveSpeedrun={editable ? moveSpeedrun : null}
            saveField={editable ? saveField_ : null}
            updateField={editable ? updateField_ : null}/>
          : null)}
      </Spinner>
    );
  }

  componentDidUpdate(newProps: ScheduleEditorProps) {
    if (this.props.match.params.event !== newProps.match.params.event) {
      this.refreshSpeedruns_(newProps.match.params.event);
    }
  }

  componentDidMount() {
    this.refreshSpeedruns_(this.props.match.params.event);
  }

  refreshSpeedruns_(event: string) {
    const {status} = this.props;
    if (status.event !== 'loading' && status.event !== 'success') {
      this.props.loadModels('event');
    }
    if ((status.speedrun !== 'loading' && status.speedrun !== 'success') || event !== this.props.event) {
      this.props.loadModels(
        'speedrun',
        {event: event, all: 1}
      );
    }
  }

  saveModel_ = (pk: any, fields: Array<keyof SpeedrunModel>) => {
    this.props.saveDraftModels([{type: 'speedrun', pk, fields}]);
  }

  editModel_ = (model: SpeedrunModel) => {
    this.props.newDraftModel({type: 'speedrun', ...model});
  }

  cancelEdit_ = (model: SpeedrunModel) => {
    this.props.deleteDraftModel({type: 'speedrun', ...model});
  }

  newSpeedrun_ = () => {
    this.props.newDraftModel({type: 'speedrun'});
  }

  updateField_ = (pk: any, field: string, value: any) => {
    this.props.updateDraftModelField('speedrun', pk, field, value);
  }

  saveField_ = (model: SpeedrunModel, field: string, value: any) => {
    this.props.saveField({type: 'speedrun', ...model}, field, value);
  }
}

function select(state: any, props: ScheduleEditorProps) {
  const {models, drafts, status, singletons} = state;
  const {speedrun: speedruns, event: events = []} = models;
  const event = events.find(e => e.pk === parseInt(props.match.params.event)) || null;
  const {me} = singletons;
  return {
    event,
    speedruns,
    status,
    drafts: drafts.speedrun || {},
    editable: authHelper.hasPermission(me, `${window.APP_NAME}.change_speedrun`) && (!(event && event.locked) || authHelper.hasPermission(me, `${window.APP_NAME}.can_edit_locked_events`)),
  };
}

function dispatch(dispatch: (action: any) => any) {
  return {
    loadModels: (model: string, params?: object, additive?: object) => {
      dispatch(actions.models.loadModels(model, params, additive));
    },
    moveSpeedrun: (source: any, destination: any, before: boolean) => {
      dispatch(actions.models.setInternalModelField('speedrun', source, 'moving', true));
      dispatch(actions.models.setInternalModelField('speedrun', destination, 'moving', true));
      dispatch(actions.models.command({
        type: 'MoveSpeedRun',
        params: {
          moving: source,
          other: destination,
          before: before ? 1 : 0,
        },
        always: () => {
          dispatch(actions.models.setInternalModelField('speedrun', source, 'moving', false));
          dispatch(actions.models.setInternalModelField('speedrun', destination, 'moving', false));
        }
      }));
    },
    saveField: (model: SpeedrunModel, field: string, value: any) => {
      dispatch(actions.models.saveField(model, field, value));
    },
    newDraftModel: (model: Partial<SpeedrunModel>) => {
      dispatch(actions.models.newDraftModel(model));
    },
    deleteDraftModel: (model: Partial<SpeedrunModel>) => {
      dispatch(actions.models.deleteDraftModel(model));
    },
    updateDraftModelField: (type: string, pk: any, field: string, value: any) => {
      dispatch(actions.models.updateDraftModelField(type, pk, field, value));
    },
    saveDraftModels: (models: Array<any>) => {
      dispatch(actions.models.saveDraftModels(models));
    },
  };
}

const ConnectedScheduleEditor = connect(select, dispatch)(ScheduleEditor);

export default ConnectedScheduleEditor;
