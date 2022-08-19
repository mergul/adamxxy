import {
  Observable,
  MonoTypeOperatorFunction,
  Subscription,
  Subscriber,
  Observer,
  Unsubscribable,
} from 'rxjs';

export function coalesceWith<T>(
  durationSelector: Observable<any>,
  scope: any
): MonoTypeOperatorFunction<T> {
  return (source) => {
    return new Observable<T>((subscriber) => {
      const rootSubscription = new Subscription();
      rootSubscription.add(
        source.subscribe(createInnerObserver(subscriber, rootSubscription))
      );
      return rootSubscription;
    });

    function createInnerObserver(
      outerObserver: Subscriber<T>,
      rootSubscription: Subscription
    ): Observer<T> {
      let actionSubscription!: Unsubscribable;
      let latestValue: T | undefined;
      const tryEmitLatestValue = () => {
        // console.log('scope', scope);
        if (scope.numCoalescingSubscribers <= 1) {
          outerObserver.next(latestValue);
        }
      };
      return {
        complete: () => {
          if (actionSubscription) {
            tryEmitLatestValue();
          }
          outerObserver.complete();
        },
        error: (error) => outerObserver.error(error),
        next: (value) => {
          latestValue = value;
          if (!actionSubscription) {
            ++scope.numCoalescingSubscribers;
            actionSubscription = durationSelector.subscribe({
              next: () => {
                --scope.numCoalescingSubscribers;
                tryEmitLatestValue();
                actionSubscription = undefined!;
              },
              complete: () => {
                if (actionSubscription) {
                  tryEmitLatestValue();
                  actionSubscription = undefined!;
                }
              },
            });
            rootSubscription.add(actionSubscription);
          }
        },
      };
    }
  };
}
