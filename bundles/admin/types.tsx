export interface Model {
  _error: any;
  _internal: any;
  _fields: any;
}

export interface SpeedrunModel extends Model {
  pk: number;
  name: string;
  order: number;
  deprecated_runners: string;
  console: string;
  runners: string;
  start_time: string;
  starttime: string; // TODO: which is it?
  end_time: string;
  run_time: string;
  setup_time: string;
  description: string;
  commentators: string;
};

export interface EventModel extends Model {
  pk: number;
  short: string;
  name: string;
}
