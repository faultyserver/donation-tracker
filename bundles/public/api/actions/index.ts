import models, {ModelAction} from './models';
import dropdowns, {DropdownAction} from './dropdowns';
import singletons, {SingletonAction} from './singletons';

export type Action =
  | DropdownAction
  | ModelAction
  | SingletonAction;

export default {
    models,
    dropdowns,
    singletons,
};
