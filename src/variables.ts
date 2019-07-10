import { VariableDefinitionNode } from "graphql";
import { Env } from "./environment";
import { StrKeyOf } from "./strkeyof";
import { GQLTypeToTS, GQLType, buildType } from "./types";

/** Given a VarsConfig object, it returns the variables values object type */
export type VarValues<E extends Env, VC extends VarsConfig<E>> = { [X in StrKeyOf<VC>]: GQLTypeToTS<E, VC[X]> };

/** Defines Query variables. Keys are variable names and values are Houbolt's GraphQL types.
 *
 * @example
 *  {
 *    after: "ID",
 *    states: ["String"],
 *    active: ["Boolean", "!"]
 *  }
 */
export interface VarsConfig<E extends Env> {
  readonly [name: string]: GQLType<E>;
}

/** Builds the GraphQL VariableDefinitions for a given {@see VarsConfig} object */
export function buildVariables<E extends Env>(vars: VarsConfig<E>): VariableDefinitionNode[] {
  return Object.entries(vars).map(([name, type]) => ({
    kind: "VariableDefinition",
    variable: {
      kind: "Variable",
      name: {
        kind: "Name",
        value: name,
      },
    },
    type: buildType(type),
    directives: [],
  }));
}
