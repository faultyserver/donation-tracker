import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import {DragSource, DragSourceMonitor} from 'react-dnd';
import moment from 'moment';

import Spinner from '../../public/spinner';
import OrderTarget from '../../public/order_target';
import FormField from '../../public/form_field';
import ErrorList from '../../public/error_list';

import SpeedrunDropTarget from './drag_drop/speedrun_drop_target';

import {SpeedrunModel, Model} from '../types';

type SpeedrunProps = {
  speedrun: SpeedrunModel;
  draft: Partial<SpeedrunModel>;
  isDragging: boolean;
  moveSpeedrun?: (source: any, destination?: any, before?: boolean) => any;
  connectDragSource: (element: React.ReactElement) => any;
  connectDragPreview: (element: React.ReactElement) => any;
  saveField?: (model: SpeedrunModel, field: string, value: any) => any;
  updateField?: (pk: number, field: string, value: any) => any;
  cancelEdit?: (draft: Partial<SpeedrunModel>) => any;
  editModel?: (model: SpeedrunModel) => any;
  saveModel?: (pk: number, fields: Partial<SpeedrunModel>) => any;
};

class Speedrun extends React.Component<SpeedrunProps> {
  shouldComponentUpdate(nextProps: SpeedrunProps) {
    return !_.isEqual(nextProps, this.props);
  }

  line() {
    const {
      speedrun,
      draft,
      connectDragPreview,
      editModel,
    } = this.props;
    const fieldErrors = draft ? (draft._fields || {}) : {};
    const {
      cancelEdit_,
      editModel_,
      updateField_,
      save_,
    } = this;
    return draft ? (
        <React.Fragment>
          <td>
            {connectDragPreview(<div><FormField name='name' value={draft.name} modify={updateField_}/></div>)}
            <ErrorList errors={fieldErrors.name}/>
          </td>
          <td>
            <input name='runners' value={speedrun.runners} readOnly={true}/>
          </td>
          <td>
            <FormField name='console' value={draft.console} modify={updateField_}/>
            <ErrorList errors={fieldErrors.console}/>
          </td>
          <td>
            <FormField name='run_time' value={draft.run_time} modify={updateField_}/>
            <ErrorList errors={fieldErrors.run_time}/>
          </td>
          <td>
            <FormField name='setup_time' value={draft.setup_time} modify={updateField_}/>
            <ErrorList errors={fieldErrors.setup_time}/>
          </td>
          <td>
            <FormField name='description' value={draft.description} modify={updateField_}/>
            <ErrorList errors={fieldErrors.description}/>
          </td>
          <td>
            <FormField name='commentators' value={draft.commentators} modify={updateField_}/>
            <ErrorList errors={fieldErrors.commentators}/>
          </td>
          <td>
            <Spinner spinning={!!(speedrun._internal && speedrun._internal.saving)}>
              <button type='button' value='Cancel' onClick={cancelEdit_}>Cancel</button>
              <button type='button' value='Save' onClick={save_}>Save</button>
            </Spinner>
          </td>
        </React.Fragment>) :
      (<React.Fragment>
        <td>
          {connectDragPreview(<input name='name' value={speedrun.name} readOnly={true}/>)}
        </td>
        <td>
          <input name='runners' value={speedrun.runners} readOnly={true} placeholder='runners'/>
        </td>
        <td>
          <input name='console' value={speedrun.console} readOnly={true} placeholder='console'/>
        </td>
        <td>
          <input name='run_time' value={speedrun.run_time} readOnly={true} placeholder='run time'/>
        </td>
        <td>
          <input name='setup_time' value={speedrun.setup_time} readOnly={true} placeholder='setup time'/>
        </td>
        <td>
          <input name='description' value={speedrun.description} readOnly={true} placeholder='description'/>
        </td>
        <td>
          <input name='commentators' value={speedrun.commentators} readOnly={true} placeholder='commentators'/>
        </td>
        {editModel ?
          <td>
            <button type='button' value='Edit' onClick={editModel_}>Edit</button>
          </td> :
          null}
      </React.Fragment>);
  }

  render() {
    const {
      speedrun,
      isDragging,
      moveSpeedrun,
      connectDragSource,
      saveField,
    } = this.props;
    const {
      legalMove_,
      nullOrder_,
    } = this;
    const starttime = (speedrun && speedrun.order !== null && speedrun.starttime !== null) ? moment(speedrun.starttime).format("dddd, MMMM Do, h:mm a") : 'Unscheduled';
    const spinning = !!(speedrun._internal && (speedrun._internal.moving || speedrun._internal.saving));
    return (
      <tr style={{opacity: isDragging ? 0.5 : 1}}>
        <td className='small'>
          {starttime}
        </td>
        <td style={{textAlign: 'center'}}>
          {moveSpeedrun ?
            <OrderTarget
              spinning={spinning}
              connectDragSource={connectDragSource}
              nullOrder={saveField && nullOrder_}
              target={!!speedrun.order}
              targetType={SpeedrunDropTarget}
              targetProps={{
                pk: speedrun.pk,
                legalMove: legalMove_,
                moveSpeedrun: moveSpeedrun,
              }}
            /> :
            null}
        </td>
        {this.line()}
      </tr>
    );
  }

  getChanges() {
    return _.pick(
      _.pickBy(this.props.draft, (value, key: keyof SpeedrunModel) => {
        return value !== (this.props.speedrun ? this.props.speedrun[key] : '');
      }),
      ['name', 'deprecated_runners', 'console', 'run_time', 'setup_time', 'description', 'commentators']
    );
  }

  legalMove_ = (source_pk: any) => {
    return source_pk && this.props.speedrun.pk !== source_pk;
  }

  editModel_ = () => {
    this.props.editModel && this.props.editModel(this.props.speedrun);
  }

  updateField_ = (field: string, value: any) => {
    this.props.updateField && this.props.updateField(this.props.speedrun.pk, field, value);
  }

  nullOrder_ = () => {
    this.props.saveField && this.props.saveField(this.props.speedrun, 'order', null);
  }

  cancelEdit_ = () => {
    this.props.cancelEdit && this.props.cancelEdit(this.props.draft);
  }

  save_ = () => {
    const params = this.getChanges();
    if (Object.keys(params).length) {
      this.props.saveModel && this.props.saveModel(this.props.speedrun.pk, params);
    }
  }
}


const speedrunSource = {
    beginDrag: function (props: SpeedrunProps) {
      return {source_pk: props.speedrun.pk};
    },

    endDrag: function (props: SpeedrunProps, monitor: DragSourceMonitor) {
      const result = monitor.getDropResult();
      if (result && result.action) {
        result.action(props.speedrun.pk);
      }
    },
  };

const ConnectedSpeedrun = DragSource('Speedrun', speedrunSource, function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  }
})(Speedrun);

export default ConnectedSpeedrun;
