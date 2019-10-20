export function createBid(bid) {
  return {
    type: 'donate/CREATE_BID',
    data: {
      bid
    }
  };
};

export function deleteBid(bidId) {
  return {
    type: 'donate/DELETE_BID',
    data: {
      bidId
    }
  };
};
