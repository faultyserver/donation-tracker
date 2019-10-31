export type SpeedrunModel = {
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
  _internal: any;
};

export type Event = {
  pk: number;
  short: string;
}

export type Model = SpeedrunModel | Event;
