import { FluxStandardAction } from "flux-standard-action";
import { Reducer, ReducersMapObject } from "redux";
import { all, call, Effect, put, takeLatest } from "redux-saga/effects";

// tslint:disable: object-literal-sort-keys

type ReadonlyRecord<K extends string, T> = {
  readonly [P in K]: T;
};

// TODO: better error type?
// TODO: remove any?
// tslint:disable-next-line: no-any
type SideEffectRecord<A = any> = ReadonlyRecord<
  string,
  (...args: readonly A[]) => unknown
>;

type ActionTypes<A extends SideEffectRecord<unknown>> = {
  readonly [P in keyof A]: readonly [string, string, string, string];
};

export type SagaIterator<RT> = Generator<Effect<unknown>, RT, unknown>;

type Action = FluxStandardAction<
  string,
  { readonly result?: unknown; readonly error?: unknown }
>;

// PERFORM SIDE EFFECT (e.g. GET)
type SideEffectAction<
  A extends SideEffectRecord<unknown>,
  B extends ActionTypes<A>,
  P extends keyof A
> = {
  readonly type: B[P][0];
  readonly payload: {
    readonly params: Parameters<A[P]>;
  };
};

type SagaActions<
  A extends SideEffectRecord<unknown>,
  B extends ActionTypes<A>,
  ErrorType extends unknown = Error
> = {
  readonly [P in keyof A]: readonly [
    // PERFORM SIDE EFFECT (e.g. GET)
    (...params: Parameters<A[P]>) => SideEffectAction<A, B, P>,
    // PERFORM SIDE EFFECT SUCCESS (e.g. GET SUCCESS)
    (
      result: ReturnType<A[P]> extends Promise<infer Result>
        ? Result
        : ReturnType<A[P]>
    ) => {
      readonly type: B[P][1];
      readonly payload: {
        // TODO: don't repeat this incantation
        readonly result: ReturnType<A[P]> extends Promise<infer Result>
          ? Result
          : ReturnType<A[P]>;
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
    Reducer<object, Action>,
    (action: SideEffectAction<A, B, P>) => SagaIterator<void>
  ];
};

type SagaBoilerplate<
  A extends SideEffectRecord<unknown>,
  B extends ActionTypes<A>,
  ErrorType extends unknown = Error
> = {
  readonly actions: SagaActions<A, B, ErrorType>;
  // TODO: better types for the reducer
  readonly rootReducer: ReducersMapObject;
  readonly rootSaga: () => SagaIterator<void>;
};

export const concoctBoilerplate = <
  A extends SideEffectRecord,
  B extends ActionTypes<A>,
  C = {}
>(
  sideEffects: A,
  actionTypes: B,
  defaultState?: C
): SagaBoilerplate<A, B> => {
  const keys = Object.keys(sideEffects) as ReadonlyArray<keyof A>;

  const actions = keys.reduce((acc, k) => {
    // tslint:disable-next-line: one-variable-per-declaration
    const reducer = (state: C | undefined = defaultState, action: Action) => {
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
            result:
              action.payload !== undefined ? action.payload.result : undefined,
            error: undefined
          };
        case actionTypes[k][2]:
          return {
            ...state,
            loading: false,
            result: undefined,
            error:
              action.payload !== undefined ? action.payload.error : undefined
          };
        default:
          return state;
      }
    };

    function* saga(
      action: SideEffectAction<A, B, typeof k>
    ): SagaIterator<void> {
      // tslint:disable-next-line: no-try
      try {
        // TODO: https://github.com/agiledigital/typed-redux-saga
        const result = yield call(sideEffects[k], ...action.payload.params);

        // tslint:disable-next-line: no-expression-statement
        yield put<Action>({
          type: actionTypes[k][1],
          payload: {
            result
          }
        });
      } catch (error) {
        // tslint:disable-next-line: no-expression-statement
        yield put<Action>({
          type: actionTypes[k][2],
          payload: {
            error
          }
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
        (
          result: ReturnType<A[typeof k]> extends Promise<infer Result>
            ? Result
            : ReturnType<A[typeof k]>
        ) => ({
          type: actionTypes[k][1],
          payload: {
            result
          }
        }),
        // PERFORM SIDE EFFECT FAILURE (e.g. GET FAILURE)
        (error: unknown) => ({
          type: actionTypes[k][2],
          payload: {
            error
          },
          error: true
        }),
        reducer,
        saga
      ]
    };
    // TODO get rid of this cast
  }, {}) as SagaActions<A, B>;

  const rootReducer: ReducersMapObject = keys.reduce(
    (acc, k) => ({
      ...acc,
      [actionTypes[k][3]]: actions[k][3]
    }),
    {}
  );

  function* rootSaga(): SagaIterator<void> {
    // tslint:disable-next-line: no-expression-statement
    yield all(keys.map(k => takeLatest(actionTypes[k][0], actions[k][4])));
  }

  return {
    actions,
    rootReducer,
    rootSaga
  };
};
