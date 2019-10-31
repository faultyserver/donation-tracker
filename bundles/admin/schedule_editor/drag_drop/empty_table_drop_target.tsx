import * as React from 'react';
import { DropTarget, DropTargetMonitor } from 'react-dnd';

type EmptyTableDropTargetProps = {
  isOver: boolean;
  canDrop: boolean;
  elementType?: 'span';
  connectDropTarget: (target: any) => any;
  moveSpeedrun: (source: any, destination?: any, before?: boolean) => any;
};

class EmptyTableDropTarget extends React.Component<EmptyTableDropTargetProps> {
    render() {
        const {
          isOver,
          canDrop,
          elementType: Tag = 'span',
          connectDropTarget
        } = this.props;
        return connectDropTarget(
            <Tag
                style={{
                    backgroundColor: isOver && canDrop ? 'green' : 'inherit',
                }}
                >
                {this.props.children}
            </Tag>
        );
    }
}

const emptyTableDropTarget = {
    drop: function(props: EmptyTableDropTargetProps) {
        return {action: function(pk: any) {
            props.moveSpeedrun(pk);
        }};
    },

    canDrop: function(props: EmptyTableDropTargetProps, monitor: DropTargetMonitor) {
        return true;
    }
};

const ConnectedEmptyTableDropTarget = DropTarget('Speedrun', emptyTableDropTarget, function (connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
    };
})(EmptyTableDropTarget);

export default ConnectedEmptyTableDropTarget;
