export {};

declare global {
  interface Window {
    ROOT_PATH: string;
    STATIC_URL: string;
    APP_NAME: string;
    AdminApp: any;
    DonateApp: any;
  }
}
