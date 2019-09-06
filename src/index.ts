// TODO: prettier
// TODO: type coverage
// TODO: tslint
// TODO: tslint immutable
// TODO: push to agile github
// TODO: entertaining readme, ad hominem attacks against hook heathens
// TODO: tests

type ReadonlyRecord<K extends string, T> = {
  readonly [P in K]: T;
};

// TODO: better error type?
// TODO: support non-promise return types
type SideEffectRecord = ReadonlyRecord<string, (...args: unknown[]) => Promise<unknown>>;

type ActionTypes<A extends SideEffectRecord> = {
  readonly [P in keyof A]: readonly [string, string, string];
};

type SagaBoilerplate<A extends SideEffectRecord, B extends ActionTypes<A>, ErrorType extends unknown = Error> = {
  readonly [P in keyof A]: [
    // PERFORM SIDE EFFECT (e.g. GET)
    (...params: Parameters<A[P]>) => {
      readonly type: B[P][0],
      readonly payload: {
        readonly params: Parameters<A[P]>
      }
    },
    // PERFORM SIDE EFFECT SUCCESS (e.g. GET SUCCESS)
    (result: ReturnType<A[P]> extends Promise<infer Result> ? Result : never) => {
      readonly type: B[P][1],
      readonly payload: {
        // TODO: don't repeat this incantation
        readonly result: ReturnType<A[P]> extends Promise<infer Result> ? Result : never
      }
    },
    // PERFORM SIDE EFFECT FAILURE (e.g. GET FAILURE)
    (error: ErrorType) => {
      readonly type: B[P][2],
      readonly error: ErrorType
    },
    // TODO Reducer,
    (action: any, state: any) => any,
    // TODO Saga,
    () => undefined
  ]
};

export const concoctBoilerplate = <A extends SideEffectRecord, B extends ActionTypes<A>>(
  sideEffects: A,
  actionTypes: B
): SagaBoilerplate<A, B> => {

  const keys = Object.keys(sideEffects) as ReadonlyArray<keyof A>;

  return keys.reduce((acc, k) => ({
    ...acc,
    [k]: [
      // PERFORM SIDE EFFECT (e.g. GET)
      (...params: Parameters<A[typeof k]>) => ({
        type: actionTypes[k][0],
        payload: {
          params
        }
      }),
      // PERFORM SIDE EFFECT SUCCESS (e.g. GET SUCCESS)
      (result: ReturnType<A[typeof k]> extends Promise<infer Result> ? Result : never) => ({
        type: actionTypes[k][1],
        payload: {
          result
        }
      }),
      // PERFORM SIDE EFFECT FAILURE (e.g. GET FAILURE)
      (error: unknown) => ({
        type: actionTypes[k][2],
        error
      }),
      // TODO Reducer,
      (action: {readonly type: string, readonly payload?: any, readonly error?: any}, state: any) => {
        switch (action.type) {
          case actionTypes[k][0]:
            return {
              ...state,
              loading: true
            };
          case actionTypes[k][1]:
            return {
              ...state,
              loading: false,
              result: action.payload.result,
              error: undefined
            };
          case actionTypes[k][2]:
            return {
              ...state,
              loading: false,
              result: undefined,
              error: action.error
            };
          default:
            return state;
        }
      },
      // TODO Saga,
      () => undefined
    ]
  }), {}) as SagaBoilerplate<A, B>;
}
