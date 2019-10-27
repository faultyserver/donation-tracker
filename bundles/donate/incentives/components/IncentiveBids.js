import * as React from 'react';
import classNames from 'classnames';
import {useDispatch, useSelector} from 'react-redux';

import Clickable from '../../../public/uikit/Clickable';
import Header from '../../../public/uikit/Header';
import Text from '../../../public/uikit/Text';
import * as IncentiveActions from '../IncentiveActions';
import * as IncentiveStore from '../IncentiveStore';

import styles from './IncentiveBids.mod.css';

const Bid = (props) => {
  const {
    bid,
    incentive,
    onDelete,
    className,
  } = props;

  return (
    <Clickable
        key={incentive.id}
        className={className}
        onClick={onDelete}>
      <Header size={Header.Sizes.H4} marginless>{incentive.runname}</Header>
      <Text size={Text.Sizes.SIZE_14}>{incentive.parent ? incentive.parent.name : incentive.name}</Text>
      <Text size={Text.Sizes.SIZE_14} marginless>Choice: {bid.customOption || incentive.name}</Text>
      <Text size={Text.Sizes.SIZE_14} marginless>Amount: ${bid.amount}</Text>
    </Clickable>
  );
};

const Bids = (props) => {
  const {
    className
  } = props;

  const dispatch = useDispatch();
  const {bids, incentives} = useSelector((state) => ({
      bids: IncentiveStore.getBids(state),
      incentives: IncentiveStore.getIncentivesById(state),
  }));

  const handleDeleteBid = React.useCallback((incentiveId) => {
    dispatch(IncentiveActions.deleteBid(incentiveId));
  }, [dispatch]);

  return (
    <div className={classNames(styles.container, className)}>
      { bids.map(bid => {
          const incentive = incentives[bid.incentiveId];
          return (
            <Bid
              key={incentive.id}
              bid={bid}
              incentive={incentive}
              className={styles.incentive}
              onDelete={() => handleDeleteBid(bid.incentiveId)}
            />
          );
        })
      }
    </div>
  );
};

export default Bids;
