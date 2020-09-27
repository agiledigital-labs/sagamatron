/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable functional/functional-parameters */
/* eslint-disable functional/no-expression-statement */

import { concoctCrud } from "./concoctCrud";

it("concocts CRUD boilerplate", async () => {
  type User = { readonly username: string };
  type PersistedUser = User & { readonly id: string };

  const userApi = {
    list: (): Promise<ReadonlyArray<PersistedUser>> => {
      return Promise.resolve([
        {
          id: "1234",
          username: "username",
        },
      ]);
    },
    get: (id: string): Promise<PersistedUser> => {
      return Promise.resolve({
        id,
        username: "username",
      });
    },
    create: (user: User): Promise<PersistedUser> => {
      return Promise.resolve({
        id: "1234",
        username: user.username,
      });
    },
    update: (id: string, user: User): Promise<PersistedUser> => {
      return Promise.resolve({
        id,
        username: user.username,
      });
    },
    delete: (id: string): Promise<string> => {
      return Promise.resolve(id);
    },
  };

  const {
    actions: {
      get: [getUser, getUserSuccess],
      list: [listUsers],
    },
    rootReducer,
    rootSaga,
  } = concoctCrud("user", "users", userApi);

  const getAction = getUser("42");
  const listAction = listUsers();

  expect(rootReducer.users).toBeDefined();

  const nextState = rootReducer.users(
    {
      list: { loading: false, result: [{ id: "1234", username: "username" }] },
      current: { loading: false },
      created: { loading: false },
      updated: { loading: false },
      deleted: { loading: false },
    },
    // TODO fix this
    // eslint-disable-next-line total-functions/no-unsafe-readonly-mutable-assignment
    getUserSuccess({ id: "5678", username: "anotheruser" })
  );

  expect(nextState).toEqual({
    list: { loading: false, result: [{ id: "1234", username: "username" }] },
    current: {
      result: {
        id: "5678",
        username: "anotheruser",
      },
      loading: false,
    },
    created: { loading: false },
    updated: { loading: false },
    deleted: { loading: false },
  });

  rootSaga();

  expect(getAction).toEqual({
    type: "GET_USER",
    payload: {
      params: ["42"],
    },
  });

  expect(listAction).toEqual({
    type: "LIST_USERS",
    payload: {
      params: [],
    },
  });
});
