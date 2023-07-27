// import { EventSourcePolyfill } from 'event-source-polyfill';
// import { BehaviorSubject } from 'rxjs';
// import { OfferPayload } from './core/news.model';
// const offersBehaviorSubject = new BehaviorSubject<OfferPayload[]>([]);

// addEventListener('message', ({ data }) => {
//   let ev = JSON.parse(data[0]);
//   let evy = data[1];
//   Object.setPrototypeOf(ev, EventSourcePolyfill.prototype);
//   console.log('webworker: ', ev._listeners, ' number: ', evy);
//   ev.addEventListener('top-offers-' + evy, (event: MessageEvent) => {
//     const topOffers = JSON.parse(event.data);
//     offersBehaviorSubject.next(topOffers.list);
//     postMessage(JSON.stringify(offersBehaviorSubject.value));
//   });
// });
