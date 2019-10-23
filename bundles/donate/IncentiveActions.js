export function createBid(bid) {
  return {
    type: 'donate/CREATE_INCENTIVE_BID',
    data: {
      bid
    }
  };
};

export function deleteBid(bidId) {
  return {
    type: 'donate/DELETE_INCENTIVE_BID',
    data: {
      bidId
    }
  };
};
