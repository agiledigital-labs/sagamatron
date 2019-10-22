import { concoctCrud } from "./concoctCrud";

// tslint:disable: no-expression-statement

it("concocts CRUD boilerplate", async () => {
  type User = { readonly username: string };
  type PersistedUser = User & { readonly id: string };

  const userApi = {
    list: (): Promise<ReadonlyArray<PersistedUser>> => {
      return Promise.resolve([
        {
          id: "1234",
          username: "username"
        }
      ]);
    },
    get: (id: string): Promise<PersistedUser> => {
      return Promise.resolve({
        id,
        username: "username"
      });
    },
    create: (user: User): Promise<PersistedUser> => {
      return Promise.resolve({
        id: "1234",
        username: user.username
      });
    },
    update: (id: string, user: User): Promise<PersistedUser> => {
      return Promise.resolve({
        id,
        username: user.username
      });
    },
    // tslint:disable-next-line: variable-name
    delete: (_id: string): Promise<void> => {
      return Promise.resolve();
    }
  };

  const {
    actions: {
      get: [getUser],
      list: [listUsers]
    },
    rootReducer,
    rootSaga
  } = concoctCrud("user", "users", userApi);

  const getAction = getUser("42");
  const listAction = listUsers();

  expect(rootReducer.users).toBeDefined();

  rootSaga();

  expect(getAction).toEqual({
    type: "GET_USER",
    payload: {
      params: ["42"]
    }
  });

  expect(listAction).toEqual({
    type: "LIST_USERS",
    payload: {
      params: []
    }
  });
});
