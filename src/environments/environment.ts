// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
 // serviceWorkerScript: 'sw-sync.js',
  firebase: {
    apiKey: 'AIzaSyA82jMk8_IIzUwtS8yAWXb6lHSGpAusvwE',
    authDomain: 'centrenews-dfc60.firebaseapp.com',
    databaseURL: 'https://centrenews-dfc60.firebaseio.com',
    projectId: 'centrenews-dfc60',
    storageBucket: 'centrenews-dfc60.appspot.com',
    messagingSenderId: '608473106039'
  }
};
export const globals = {
  url: 'http://localhost' // '35.204.190.149'
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
