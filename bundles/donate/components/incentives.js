import React from 'react';
import {useSelector} from 'react-redux';
import _ from 'lodash';
import classNames from 'classnames';

import Button from '../../public/uikit/Button';
import Checkbox from '../../public/uikit/Checkbox';
import Clickable from '../../public/uikit/Clickable';
import Header from '../../public/uikit/Header';
import ProgressBar from '../../public/uikit/ProgressBar';
import Text from '../../public/uikit/Text';
import TextInput from '../../public/uikit/TextInput';
import BidForm from './BidForm';
import Bids from './Bids';
import * as IncentiveStore from '../IncentiveStore';
import * as IncentiveUtils from '../IncentiveUtils';

import styles from './Incentives.mod.css';

const Incentives = (props) => {
  const {
    step,
    total,
    className
  } = props;

  const [search, setSearch] = React.useState("");
  const [selectedIncentiveId, setSelectedIncentiveId] = React.useState(null);
  const incentives = useSelector(IncentiveStore.getTopLevelIncentives);

  const searchResults = IncentiveUtils.searchIncentives(search, incentives);

  return (
    <div className={className}>
      <div className={styles.incentives}>
        <div className={styles.left}>
          <TextInput
            value={search}
            onChange={setSearch}
            placeholder="Filter Results"
            marginless
          />
          <div className={styles.results}>
            { searchResults.map(result =>
                <Clickable
                    className={classNames(styles.result, {
                      [styles.resultSelected]: selectedIncentiveId === result.id
                    })}
                    key={result.id}
                    onClick={() => setSelectedIncentiveId(result.id)}>
                  <Header size={Header.Sizes.H5} marginless oneline>{result.runname}</Header>
                  <Text size={Text.Sizes.SIZE_14} marginless oneline>{result.name}</Text>
                </Clickable>
              )
            }
          </div>
        </div>

        <BidForm
          className={styles.right}
          incentiveId={selectedIncentiveId}
          step={step}
          total={total}
        />
      </div>

      <Header size={Header.Sizes.H4}>Your Incentives</Header>
      <Bids className={styles.bids} />
    </div>
  );
}

export default Incentives;
