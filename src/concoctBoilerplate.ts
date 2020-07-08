/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable functional/no-mixed-type */
/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-try-statement */
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/functional-parameters */

// TODO fix these and re-enable rule.
/* eslint-disable total-functions/no-array-subscript */

import { FluxStandardAction } from "flux-standard-action";
import { Reducer, ReducersMapObject } from "redux";
import { all, call, SagaGenerator, takeLatest, put } from "typed-redux-saga";

export type ReadonlyRecord<K extends string, T> = {
  readonly [P in K]: T;
};

// TODO: better error type?
// TODO: remove any?
export type SideEffectRecord<A = any> = ReadonlyRecord<
  string,
  // eslint-disable-next-line functional/prefer-readonly-type
  (...args: A[]) => any
>;

export type ActionTypes<A extends SideEffectRecord<any>> = {
  readonly [P in keyof A]: readonly [string, string, string, string];
};

type Action<ErrorType extends unknown> = FluxStandardAction<
  string,
  { readonly result?: unknown; readonly error?: ErrorType }
>;

// PERFORM SIDE EFFECT (e.g. GET)
type SideEffectAction<
  A extends SideEffectRecord<any>,
  B extends ActionTypes<A>,
  P extends keyof A
> = {
  readonly type: B[P][0];
  readonly payload: {
    readonly params: Parameters<A[P]>;
  };
};

// eslint-disable-next-line functional/prefer-readonly-type
export type ExtractResult<A extends (...a: unknown[]) => any> = ReturnType<
  A
> extends Promise<infer Result>
  ? Result
  : ReturnType<A>;

type SagaActionsArray<
  P extends keyof A,
  A extends SideEffectRecord<any>,
  B extends ActionTypes<A>,
  ErrorType extends unknown
> = readonly [
  // PERFORM SIDE EFFECT (e.g. GET)
  (...params: Parameters<A[P]>) => SideEffectAction<A, B, P>,
  // PERFORM SIDE EFFECT SUCCESS (e.g. GET SUCCESS)
  (
    result: ExtractResult<A[P]>
  ) => {
    readonly type: B[P][1];
    readonly payload: {
      readonly result: ExtractResult<A[P]>;
    };
  },
  // PERFORM SIDE EFFECT FAILURE (e.g. GET FAILURE)
  (
    error: ErrorType
  ) => {
    readonly type: B[P][2];
    readonly payload: {
      readonly error: ErrorType;
    };
    readonly error: true;
  },
  // TODO: better types for the reducer
  Reducer<unknown, Action<ErrorType>>,
  (action: SideEffectAction<A, B, P>) => SagaGenerator<void>
];

type SagaActionsRecord<
  A extends SideEffectRecord<any>,
  B extends ActionTypes<A>,
  ErrorType extends unknown
> = {
  readonly [P in keyof A]: SagaActionsArray<P, A, B, ErrorType>;
};

export type SagaBoilerplate<
  A extends SideEffectRecord<any>,
  B extends ActionTypes<A>,
  S,
  ErrorType extends unknown
> = {
  readonly actions: SagaActionsRecord<A, B, ErrorType>;
  // TODO: better types for the reducer
  readonly rootReducer: ReducersMapObject<S>;
  readonly rootSaga: () => SagaGenerator<void>;
};

export type State<ErrorType extends unknown, ResultType = unknown> = {
  readonly loading: boolean;
  readonly error?: ErrorType;
  readonly result?: ResultType;
};

export const concoctBoilerplate = <
  A extends SideEffectRecord,
  B extends ActionTypes<A>
>(
  sideEffects: A,
  actionTypes: B
): SagaBoilerplate<A, B, ReadonlyRecord<string, State<Error>>, Error> => {
  const keys: ReadonlyArray<string> = Object.keys(sideEffects);

  const defaultState: State<Error> = {
    error: undefined,
    result: undefined,
    loading: false,
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const actions = keys.reduce((acc, k) => {
    const reducer = (
      state: State<Error> | undefined = defaultState,
      action: Action<Error>
    ): State<Error> => {
      switch (action.type) {
        case actionTypes[k][0]:
          return {
            ...state,
            loading: true,
          };
        case actionTypes[k][1]:
          return {
            ...state,
            loading: false,
            result:
              action.payload !== undefined ? action.payload.result : undefined,
            error: undefined,
          };
        case actionTypes[k][2]:
          return {
            ...state,
            loading: false,
            result: undefined,
            error:
              action.payload !== undefined ? action.payload.error : undefined,
          };
        default:
          return state !== undefined ? state : defaultState;
      }
    };

    function* saga(
      action: SideEffectAction<A, B, typeof k>
    ): SagaGenerator<void> {
      try {
        // TODO: https://github.com/agiledigital/typed-redux-saga
        const result = yield* call(sideEffects[k], ...action.payload.params);

        yield* put<Action<Error>>({
          type: actionTypes[k][1],
          payload: {
            result,
          },
        });
      } catch (error) {
        yield* put<Action<Error>>({
          type: actionTypes[k][2],
          payload: {
            // TODO fix this
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            error,
          },
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
            params,
          },
        }),
        // PERFORM SIDE EFFECT SUCCESS (e.g. GET SUCCESS)
        (result: ExtractResult<A[typeof k]>) => ({
          type: actionTypes[k][1],
          payload: {
            result,
          },
        }),
        // PERFORM SIDE EFFECT FAILURE (e.g. GET FAILURE)
        (error: unknown) => ({
          type: actionTypes[k][2],
          payload: {
            error,
          },
          error: true,
        }),
        reducer,
        saga,
      ],
    };
    // TODO get rid of this cast
  }, {}) as SagaActionsRecord<A, B, Error>;

  const rootReducer = keys.reduce(
    (acc, k) => ({
      ...acc,
      [actionTypes[k][3]]: actions[k][3],
    }),
    {}
  ) as ReducersMapObject<ReadonlyRecord<string, State<Error>>>;

  function* rootSaga(): SagaGenerator<void> {
    yield* all(keys.map((k) => takeLatest(actionTypes[k][0], actions[k][4])));
  }

  return {
    actions,
    rootReducer,
    rootSaga,
  };
};
