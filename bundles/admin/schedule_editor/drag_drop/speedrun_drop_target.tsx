import * as React from 'react';
import { DropTarget, DropTargetMonitor } from 'react-dnd';

type SpeedrunDropTargetProps = {
  before: boolean;
  pk: number;
  isOver: boolean;
  canDrop: boolean;
  elementType?: 'span';
  connectDropTarget: (target: any) => any;
  moveSpeedrun: (source: any, destination?: any, before?: boolean) => any;
  legalMove: (pk: number) => boolean;
};

class SpeedrunDropTarget extends React.Component<SpeedrunDropTargetProps> {
    render() {
        const { before, isOver, canDrop, connectDropTarget } = this.props;
        return connectDropTarget(
            <span
                style={{
                    width: '50%',
                    backgroundColor: isOver && canDrop ? 'green' : 'inherit',
                    float: before ? 'left' : 'right'
                }}>
                <img src={window.STATIC_URL + (before ? 'prev.png' : 'next.png')} />
            </span>
        );
    }
}

const speedrunTarget = {
    drop: function(props: SpeedrunDropTargetProps, monitor: DropTargetMonitor) {
        return {
            action: function(source_pk: number) {
                props.moveSpeedrun(source_pk, props.pk, props.before);
            }
        };
    },

    canDrop: function(props: SpeedrunDropTargetProps, monitor: DropTargetMonitor) {
        return props.legalMove(monitor.getItem() ? monitor.getItem().source_pk : null);
    },
};

const ConnectedSpeedrunDropTarget = DropTarget('Speedrun', speedrunTarget, function collect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
    };
})(SpeedrunDropTarget);

export default ConnectedSpeedrunDropTarget;
