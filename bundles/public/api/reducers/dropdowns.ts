import _ from 'lodash';

import {DropdownAction} from '../actions/dropdowns';

export type DropdownState = {[dropdown: string]: boolean};


export default function dropdownsReducer(state: DropdownState = {}, action: DropdownAction) {
    switch(action.type) {
      case 'DROPDOWN_TOGGLE':
          return {
              ...state,
              [action.dropdown]: !state[action.dropdown],
          };
      default:
          return state;
    }
}
