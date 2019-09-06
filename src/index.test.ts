import { ReducersMapObject } from "redux";
import { all, takeLatest } from "redux-saga/effects";
import { concoctBoilerplate } from ".";

// tslint:disable: no-expression-statement

it("concocts boilerplate", async () => {
  type User = { readonly id: string; readonly username: string };

  const userApi = {
    get: (id: string): Promise<User> => {
      return Promise.resolve({
        id,
        username: "username"
      });
    },
    syncGet: (id: string): User => {
      return {
        id,
        username: "username"
      };
    }
    // TODO support subsets
    // delete: (id: string): Promise<void> => {
    //   // tslint:disable-next-line: no-reject
    //   return Promise.reject("Not implemented")
    // }
  };

  const actionTypes = {
    get: ["GET_USER", "GET_USER_SUCCESS", "GET_USER_FAILURE"],
    syncGet: ["SYNC_GET_USER", "SYNC_GET_USER_SUCCESS", "SYNC_GET_USER_FAILURE"]
  } as const;

  const {
    get: [getUser, , , getUserReducer, getUserSaga],
    syncGet: [getSyncUser, , , getSyncUserReducer, getSyncUserSaga]
  } = concoctBoilerplate(userApi, actionTypes);

  const action = getUser("42");
  const syncAction = getSyncUser("42");

  // TODO move this boilerplate into concoctBoilerplate
  const allReducers = (): ReducersMapObject => ({
    user: getUserReducer,
    syncUser: getSyncUserReducer
  });

  function* rootSaga(): IterableIterator<unknown> {
    // TODO move this boilerplate into concoctBoilerplate
    yield all([
      takeLatest("GET_USER", getUserSaga),
      takeLatest("SYNC_GET_USER", getSyncUserSaga)
    ]);
  }

  allReducers();
  rootSaga();

  expect(action).toEqual({
    type: "GET_USER",
    payload: {
      params: ["42"]
    }
  });

  expect(syncAction).toEqual({
    type: "SYNC_GET_USER",
    payload: {
      params: ["42"]
    }
  });
});
