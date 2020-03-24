/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable functional/prefer-readonly-type */

import { combineReducers, Reducer, ReducersMapObject } from "redux";
import {
  ActionTypes,
  concoctBoilerplate,
  ExtractResult,
  SagaBoilerplate,
  State,
} from "./concoctBoilerplate";

export type EntityRepository<
  ID,
  ListParams extends any[],
  ListResponse,
  GetResponse,
  CreateParams extends any[],
  CreateResponse,
  UpdateParams extends any[],
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
  EntityRepository<any, any, any, any, any, any, any, any, any>
> => {
  const entityNameUpper = entityName.toUpperCase();
  const entityNamePluralUpper = entityNamePlural.toUpperCase();

  return {
    list: [
      `LIST_${entityNamePluralUpper}`,
      `LIST_${entityNamePluralUpper}_SUCCESS`,
      `LIST_${entityNamePluralUpper}_FAILURE`,
      "list",
    ],
    get: [
      `GET_${entityNameUpper}`,
      `GET_${entityNameUpper}_SUCCESS`,
      `GET_${entityNameUpper}_FAILURE`,
      "current",
    ],
    create: [
      `CREATE_${entityNameUpper}`,
      `CREATE_${entityNameUpper}_SUCCESS`,
      `CREATE_${entityNameUpper}_FAILURE`,
      "created",
    ],
    update: [
      `UPDATE_${entityNameUpper}`,
      `UPDATE_${entityNameUpper}_SUCCESS`,
      `UPDATE_${entityNameUpper}_FAILURE`,
      "updated",
    ],
    delete: [
      `DELETE_${entityNameUpper}`,
      `DELETE_${entityNameUpper}_SUCCESS`,
      `DELETE_${entityNameUpper}_FAILURE`,
      "deleted",
    ],
  };
};

export type CrudState<
  ER extends EntityRepository<any, any, any, any, any, any, any, any, any>,
  ErrorType extends unknown = Error
> = {
  readonly list: State<ErrorType, ExtractResult<ER["list"]>>;
  readonly current: State<ErrorType, ExtractResult<ER["get"]>>;
  readonly created: State<ErrorType, ExtractResult<ER["create"]>>;
  readonly updated: State<ErrorType, ExtractResult<ER["update"]>>;
  readonly deleted: State<ErrorType, ExtractResult<ER["delete"]>>;
};

export const concoctCrud = <
  EntityNamePlural extends string,
  ID,
  ListParams extends any[],
  ListResponse,
  GetResponse,
  CreateParams extends any[],
  CreateResponse,
  UpdateParams extends any[],
  UpdateResponse,
  DeleteResponse
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
  >
): SagaBoilerplate<
  typeof repo,
  ActionTypes<typeof repo>,
  { readonly [k in EntityNamePlural]: CrudState<typeof repo> }
> => {
  const { actions, rootReducer, rootSaga } = concoctBoilerplate(
    repo,
    actionTypes(entityName, entityNamePlural)
  );

  // TODO remove these casts
  const entityReducer = {
    [entityNamePlural]: combineReducers(
      rootReducer as ReducersMapObject<CrudState<typeof repo>>
    ),
  } as { readonly [k in EntityNamePlural]: Reducer<CrudState<typeof repo>> };

  return { actions, rootReducer: entityReducer, rootSaga };
};
