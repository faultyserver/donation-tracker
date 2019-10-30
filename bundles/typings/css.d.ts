declare module '*.png';
declare module '*.jpg';
declare module '*.gif';
declare module '*.svg';

declare module '*.css' {
  const styles: {[className: string]: string};
  export default styles;
}
