import { combineReducers } from "redux";
import {
  ActionTypes,
  concoctBoilerplate,
  ReadonlyRecord,
  SagaBoilerplate
} from "./concoctBoilerplate";

export type EntityRepository<
  ID,
  // tslint:disable: no-any readonly-array
  ListParams extends any[],
  ListResponse,
  GetResponse,
  CreateParams extends any[],
  CreateResponse,
  UpdateParams extends any[],
  // tslint:enable: no-any readonly-array
  UpdateResponse,
  DeleteResponse
> = {
  readonly list: (...params: ListParams) => ListResponse;
  readonly get: (id: ID) => GetResponse;
  readonly create: (...params: CreateParams) => CreateResponse;
  readonly update: (...params: UpdateParams) => UpdateResponse;
  readonly delete: (id: ID) => DeleteResponse;
};

export const actionTypes = (
  entityName: string,
  entityNamePlural: string
): ActionTypes<
  // tslint:disable-next-line: no-any
  EntityRepository<any, any, any, any, any, any, any, any, any>
> => {
  const entityNameUpper = entityName.toUpperCase();
  const entityNamePluralUpper = entityNamePlural.toUpperCase();

  return {
    list: [
      `LIST_${entityNamePluralUpper}`,
      `LIST_${entityNamePluralUpper}_SUCCESS`,
      `LIST_${entityNamePluralUpper}_FAILURE`,
      "list"
    ],
    get: [
      `GET_${entityNameUpper}`,
      `GET_${entityNameUpper}_SUCCESS`,
      `GET_${entityNameUpper}_FAILURE`,
      "retrieved"
    ],
    create: [
      `CREATE_${entityNameUpper}`,
      `CREATE_${entityNameUpper}_SUCCESS`,
      `CREATE_${entityNameUpper}_FAILURE`,
      "created"
    ],
    update: [
      `UPDATE_${entityNameUpper}`,
      `UPDATE_${entityNameUpper}_SUCCESS`,
      `UPDATE_${entityNameUpper}_FAILURE`,
      "updated"
    ],
    delete: [
      `DELETE_${entityNameUpper}`,
      `DELETE_${entityNameUpper}_SUCCESS`,
      `DELETE_${entityNameUpper}_FAILURE`,
      "deleted"
    ]
  };
};

export const concoctCrud = <
  EntityNamePlural extends string,
  ID,
  // tslint:disable: no-any readonly-array
  ListParams extends any[],
  ListResponse,
  GetResponse,
  CreateParams extends any[],
  CreateResponse,
  UpdateParams extends any[],
  // tslint:enable: no-any readonly-array
  UpdateResponse,
  DeleteResponse,
  // TODO better state type here
  S = ReadonlyRecord<
    // tslint:disable-next-line: max-union-size
    "list" | "retrieved" | "created" | "updated" | "deleted",
    // tslint:disable-next-line: no-any
    any
  >
>(
  entityName: string,
  entityNamePlural: EntityNamePlural,
  repo: EntityRepository<
    ID,
    ListParams,
    ListResponse,
    GetResponse,
    CreateParams,
    CreateResponse,
    UpdateParams,
    UpdateResponse,
    DeleteResponse
  >,
  defaultState?: S
): SagaBoilerplate<
  typeof repo,
  ActionTypes<typeof repo>,
  // TODO better key than just string here (use EntityNamePlural?)
  { readonly [k: string]: S }
> => {
  const { actions, rootReducer, rootSaga } = concoctBoilerplate(
    repo,
    actionTypes(entityName, entityNamePlural),
    defaultState
  );

  const entityReducer = {
    [entityNamePlural]: combineReducers(rootReducer)
  };

  return { actions, rootReducer: entityReducer, rootSaga };
};
