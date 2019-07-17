import { ArgumentNode } from "graphql";
import { Env } from "./environment";
import { VarsConfig } from "./variables";
import { StrKeyOf } from "./strkeyof";

/** An array of variables to be passed as arguments */
export type ArgsConfig<E extends Env, VC extends VarsConfig<E>> = Array<StrKeyOf<VC>>;

/** Builds AST for GraphQL arguments from an array of arguments */
export function buildArguments<E extends Env, VC extends VarsConfig<E>>(args: ArgsConfig<E, VC>): ArgumentNode[] {
  return args.map(arg => ({
    kind: "Argument",
    name: {
      kind: "Name",
      value: arg,
    },
    value: {
      kind: "Variable",
      name: {
        kind: "Name",
        value: arg,
      },
    },
  }));
}

/** Returns all variable names if the arguments array is undefined */
export function getArguments<E extends Env, VC extends VarsConfig<E>>(
  vars: VC,
  args?: ArgsConfig<E, VC>,
): ArgsConfig<E, VC> {
  if (args) return args;
  return Object.keys(vars) as ArgsConfig<E, VC>;
}
