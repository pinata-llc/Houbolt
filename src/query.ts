import { DocumentNode, SelectionSetNode, FragmentDefinitionNode } from "graphql";

import { Env } from "./environment";
import { StrKeyOf } from "./strkeyof";
import { ArgsConfig, buildArguments } from "./arguments";
import { VarsConfig, buildVariables } from "./variables";

/** Query configuration object. */
export interface QueryConfig<E extends Env, VC extends VarsConfig<E>> {
  /** The operation name {@link https://graphql.org/learn/queries/#operation-name} */
  readonly name: string;
  /** Variable configuration. {@see VarsConfig} */
  readonly variables: VC;
  /** Entry point configuration */
  readonly entry: {
    /** The name of the Query entry point */
    name: StrKeyOf<E["entries"]>;
    /** Arguments to be passed from variables */
    args: ArgsConfig<E, VC>;
    /** An optional function that manipulates the selection set.
     * Common use cases include: nesting the selected fragments further down and adding constant fields.
     **/
    mapSelect?: (node: SelectionSetNode) => SelectionSetNode;
  };
}

export interface Query<E extends Env, VC extends VarsConfig<E>> {
  /** Given an array of fragments, it returns the final DocumentNode.
   * The fragments array can be empty as long as the mapSelect config option selects something.
   */
  readonly select: (fragments: FragmentDefinitionNode[]) => DocumentNode;
  /** The configuration object used to build this query. */
  readonly config: QueryConfig<E, VC>;
}

/** Creates reusable query {@see Query} */
export function createQuery<E extends Env, VC extends VarsConfig<E>>(config: QueryConfig<E, VC>): Query<E, VC> {
  const { name, entry, variables } = config;

  const variableDefinitions = buildVariables(variables);
  const entryArgs = buildArguments(entry.args);

  return {
    select: fragments => {
      const fragmentsSet: SelectionSetNode = {
        kind: "SelectionSet",
        selections: fragments.map(fragment => ({
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
          ...fragments,
        ],
      };
    },
    config,
  };
}
