export function loadDonation(donation) {
  return {
    type: 'donation/LOAD_DONATION',
    data: {
      name: donation.requestedalias,
      nameVisibility: donation.requestedalias ? 'ALIAS' : 'ANON',
      email: donation.requestedemail,
      wantsEmails: donation.requestedsolicitemail,
      amount: null,
      comment: null,
    }
  }
};

export function updateDonation(fields={}) {
  return {
    type: 'donation/UPDATE_DONATION',
    data: {
      ...fields
    }
  };
};
