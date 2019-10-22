import { concoctCrud, EntityRepository } from "./concoctCrud";

// tslint:disable: no-expression-statement

it("concocts CRUDboilerplate", async () => {
  type User = { readonly username: string };
  type PersistedUser = User & { readonly id: string };

  const userApi = ({
    get: (id: string): Promise<PersistedUser> => {
      return Promise.resolve({
        id,
        username: "username"
      });
    }
  } as unknown) as EntityRepository<User>;

  const {
    actions: {
      get: [getUser]
    },
    rootReducer,
    rootSaga
  } = concoctCrud("user", userApi);

  const action = getUser("42");

  expect(rootReducer.user).toBeDefined();

  rootSaga();

  expect(action).toEqual({
    type: "GET_USER",
    payload: {
      params: ["42"]
    }
  });
});
