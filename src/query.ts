import { DocumentNode, SelectionSetNode, FragmentDefinitionNode } from "graphql";

import { Env } from "./environment";
import { ArgsConfig, buildArguments, getArguments } from "./arguments";
import { VarsConfig, buildVariables } from "./variables";

type FilterKeys<O, T> = {
  [Key in keyof O]: O[Key] extends T ? Key : never;
}[keyof O];

/** Query configuration object. */
export interface QueryConfig<E extends Env = Env, VC extends VarsConfig<E> = VarsConfig<E>, T = unknown> {
  /** The operation name {@link https://graphql.org/learn/queries/#operation-name} */
  readonly name: string;
  /** Variable configuration. {@see VarsConfig} */
  readonly variables: VC;
  /** Entry point configuration */
  readonly entry: {
    /** The name of the Query entry point */
    name: Extract<FilterKeys<E["entries"], T>, string>;
    /** Arguments to be passed from variables */
    args?: ArgsConfig<E, VC>;
    /** An optional function that manipulates the selection set.
     * Common use cases include: nesting the selected fragments further down and adding constant fields.
     **/
    mapSelect?: (node: SelectionSetNode) => SelectionSetNode;
  };
  /** An array of fragments to select  */
  readonly fragments: DocumentNode[];
}

/** Should only be used when inferring the generics */
type ResultQuery<E extends Env = any, VC extends VarsConfig<E> = any, T = any> = Pick<QueryConfig<E, VC, T>, "entry">;

export type QueryEntryResult<Q extends ResultQuery> = Q extends ResultQuery<infer E, any, infer T>
  ? T extends unknown
    ? E["entries"][Q["entry"]["name"]]
    : T
  : never;

/** It returns a type represeting the raw output of a query */
export type QueryResult<Q extends ResultQuery, E extends string> = Record<E, QueryEntryResult<Q>>;

/** Builds a GraphQL query AST from a QueryConfig object */
export function buildQuery<E extends Env, VC extends VarsConfig<E>>({
  name,
  entry,
  variables,
  fragments,
}: QueryConfig<E, VC, any>): DocumentNode {
  const variableDefinitions = buildVariables(variables);
  const entryArgs = buildArguments(getArguments<E, VC>(variables, entry.args));

  const fragmentNodes = fragments.map(fragment => fragment.definitions[0] as FragmentDefinitionNode);

  const fragmentsSet: SelectionSetNode = {
    kind: "SelectionSet",
    selections: fragmentNodes.map(fragment => ({
      kind: "FragmentSpread",
      name: fragment.name,
      directives: [],
    })),
  };

  return {
    kind: "Document",
    definitions: [
      {
        kind: "OperationDefinition",
        operation: "query",
        name: {
          kind: "Name",
          value: name,
        },
        variableDefinitions,
        directives: [],
        selectionSet: {
          kind: "SelectionSet",
          selections: [
            {
              kind: "Field",
              name: {
                kind: "Name",
                value: entry.name,
              },
              arguments: entryArgs,
              directives: [],
              selectionSet: entry.mapSelect ? entry.mapSelect(fragmentsSet) : fragmentsSet,
            },
          ],
        },
      },
      ...fragmentNodes,
    ],
  };
}
