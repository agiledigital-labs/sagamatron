// TODO: prettier
// TODO: type coverage
// TODO: tslint
// TODO: tslint immutable
// TODO: push to agile github
// TODO: entertaining readme, ad hominem attacks against hook heathens
// TODO: tests

import { Reducer, Action } from "redux";
import { Effect, call, put } from "redux-saga/effects";

type ReadonlyRecord<K extends string, T> = {
  readonly [P in K]: T;
};

// TODO: better error type?
type SideEffectRecord = ReadonlyRecord<string, (...args: unknown[]) => unknown | Promise<unknown>>;

type ActionTypes<A extends SideEffectRecord> = {
  readonly [P in keyof A]: readonly [string, string, string];
};

export type SagaIterator<RT> = Generator<Effect<unknown>, RT, unknown>;

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
    (result: ReturnType<A[P]> extends Promise<infer Result> ? Result : ReturnType<A[P]>) => {
      readonly type: B[P][1],
      readonly payload: {
        // TODO: don't repeat this incantation
        readonly result: ReturnType<A[P]> extends Promise<infer Result> ? Result : ReturnType<A[P]>
      }
    },
    // PERFORM SIDE EFFECT FAILURE (e.g. GET FAILURE)
    (error: ErrorType) => {
      readonly type: B[P][2],
      readonly error: ErrorType
    },
    // TODO Reducer,
    Reducer,
    // TODO Saga,
    (...params: Parameters<A[P]>) => SagaIterator<void>
  ]
};

export const concoctBoilerplate = <A extends SideEffectRecord, B extends ActionTypes<A>>(
  sideEffects: A,
  actionTypes: B
): SagaBoilerplate<A, B> => {

  const keys = Object.keys(sideEffects) as ReadonlyArray<keyof A>;

  return keys.reduce((acc, k) => {

    const reducer = (action: Action<string> & { readonly payload?: any, readonly error?: any }, state: any) => {
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
    };

    function* saga (...params: Parameters<A[typeof k]>) {
      try {
        const result = yield call(sideEffects[k], ...params);

        yield put({
          payload: {
            result
          },
          type: actionTypes[k][1],
        });
      } catch (error) {
        yield put({
          type: actionTypes[k][2],
          error,
        });
      }
    }

    return {
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
      (result: ReturnType<A[typeof k]> extends Promise<infer Result> ? Result : ReturnType<A[typeof k]>) => ({
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
      reducer,
      saga,
    ]
  };
  }, {}) as SagaBoilerplate<A, B>;
}
