/// <reference types="gtag.js" />

declare module '*.css';
declare module '*.scss';

interface Window {
  gtag: Gtag.Gtag;
}
