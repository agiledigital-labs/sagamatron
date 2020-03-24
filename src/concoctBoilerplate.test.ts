/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable functional/functional-parameters */
/* eslint-disable functional/no-expression-statement */

import { concoctBoilerplate } from ".";

it("concocts boilerplate", async () => {
  type User = { readonly id: string; readonly username: string };

  const userApi = {
    get: (id: string): Promise<User> => {
      return Promise.resolve({
        id,
        username: "username",
      });
    },
    syncGet: (id: string): User => {
      return {
        id,
        username: "username",
      };
    },
    // TODO support subsets
    // delete: (id: string): Promise<void> => {
    //   return Promise.reject("Not implemented")
    // }
  };

  const actionTypes = {
    get: ["GET_USER", "GET_USER_SUCCESS", "GET_USER_FAILURE", "user"],
    syncGet: [
      "SYNC_GET_USER",
      "SYNC_GET_USER_SUCCESS",
      "SYNC_GET_USER_FAILURE",
      "syncUser",
    ],
  } as const;

  const {
    actions: {
      get: [getUser],
      syncGet: [getSyncUser],
    },
    rootReducer,
    rootSaga,
  } = concoctBoilerplate(userApi, actionTypes);

  const action = getUser("42");
  const syncAction = getSyncUser("42");

  expect(rootReducer.user).toBeDefined();
  expect(rootReducer.syncUser).toBeDefined();
  rootSaga();

  expect(action).toEqual({
    type: "GET_USER",
    payload: {
      params: ["42"],
    },
  });

  expect(syncAction).toEqual({
    type: "SYNC_GET_USER",
    payload: {
      params: ["42"],
    },
  });
});
