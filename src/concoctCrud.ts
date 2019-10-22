import {
  ActionTypes,
  concoctBoilerplate,
  ReadonlyRecord,
  SagaBoilerplate
} from "./concoctBoilerplate";

type Persisted<Entity, ID> = Entity & { readonly id: ID };

export type EntityRepository<
  Entity,
  ID = string,
  ListParams = { readonly offset: number; readonly limit: number },
  ListResponse = {
    readonly total: number;
    readonly items: ReadonlyArray<Persisted<Entity, ID>>;
  },
  GetResponse = { readonly item: Persisted<Entity, ID> },
  CreateParams = { readonly item: Entity },
  CreateResponse = { readonly item: Persisted<Entity, ID> },
  UpdateParams = { readonly id: ID; readonly item: Partial<Entity> },
  UpdateResponse = { readonly item: Persisted<Entity, ID> },
  DeleteResponse = {}
> = {
  readonly list: (params: ListParams) => ListResponse;
  readonly get: (id: ID) => GetResponse;
  readonly create: (params: CreateParams) => CreateResponse;
  readonly update: (params: UpdateParams) => UpdateResponse;
  readonly delete: (id: ID) => DeleteResponse;
};

export const actionTypes = <Entity>(
  entityName: string
): ActionTypes<EntityRepository<Entity>> => {
  const entityNameUpper = entityName.toUpperCase();

  return {
    list: [
      `LIST_${entityNameUpper}`,
      `LIST_${entityNameUpper}_SUCCESS`,
      `LIST_${entityNameUpper}_FAILURE`,
      `${entityName}List`
    ],
    get: [
      `GET_${entityNameUpper}`,
      `GET_${entityNameUpper}_SUCCESS`,
      `GET_${entityNameUpper}_FAILURE`,
      `${entityName}`
    ],
    create: [
      `CREATE_${entityNameUpper}`,
      `CREATE_${entityNameUpper}_SUCCESS`,
      `CREATE_${entityNameUpper}_FAILURE`,
      `${entityName}Created`
    ],
    update: [
      `UPDATE_${entityNameUpper}`,
      `UPDATE_${entityNameUpper}_SUCCESS`,
      `UPDATE_${entityNameUpper}_FAILURE`,
      `${entityName}Updated`
    ],
    delete: [
      `DELETE_${entityNameUpper}`,
      `DELETE_${entityNameUpper}_SUCCESS`,
      `DELETE_${entityNameUpper}_FAILURE`,
      `${entityName}Deleted`
    ]
  };
};

export const concoctCrud = <
  Entity,
  // TODO better state type here
  // tslint:disable-next-line: no-any
  S = ReadonlyRecord<string, any>
>(
  entityName: string,
  repo: EntityRepository<Entity>,
  defaultState?: S
): SagaBoilerplate<
  EntityRepository<Entity>,
  ActionTypes<EntityRepository<Entity>>,
  S
> => concoctBoilerplate(repo, actionTypes<Entity>(entityName), defaultState);
