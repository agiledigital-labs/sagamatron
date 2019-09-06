import { concoctBoilerplate } from ".";

type User = {readonly id: string, readonly username: string};

const userApi = {
  get: (id: string): Promise<User> => {
    // tslint:disable-next-line: no-reject
    return Promise.reject("Not implemented")
  },
  // TODO support subsets
  // delete: (id: string): Promise<void> => {
  //   // tslint:disable-next-line: no-reject
  //   return Promise.reject("Not implemented")
  // }
};

const actionTypes = {
  get: ["GET_USER", "GET_USER_SUCCESS", "GET_USER_FAILURE"]
} as const;

const {get: [getUser, getUserSuccess, getUserFailure, reducer, saga]} = concoctBoilerplate(userApi, actionTypes);

// dispatch(getUser("42"))