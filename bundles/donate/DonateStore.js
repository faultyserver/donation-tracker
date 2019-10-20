import {createSelector} from 'reselect';

const getDonateState = (state) => state.donate;
const getBidsState = (state) => state.donate.bids;

export const getBids = createSelector(
  [getBidsState],
  (bidsState) => Object.values(bidsState)
);
