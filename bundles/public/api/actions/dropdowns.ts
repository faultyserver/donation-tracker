import {Dispatch} from 'redux';

export type DropdownAction =
  | {type: 'DROPDOWN_TOGGLE', dropdown: string};


function toggleDropdown(dropdown: string) {
    return (dispatch: Dispatch) => {
        dispatch({
            type: 'DROPDOWN_TOGGLE',
            dropdown
        });
    };
}

export default {
    toggleDropdown,
};
