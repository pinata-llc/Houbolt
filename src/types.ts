import { Env } from "./environment";
import { StrKeyOf } from "./strkeyof";
import { NamedTypeNode, ListTypeNode, TypeNode } from "graphql";

export type GQLNamedType<E extends Env> = StrKeyOf<E["types"]>;
export type GQLListType<E extends Env> = readonly [GQLNamedType<E>];
export type GQLRawType<E extends Env> = GQLNamedType<E> | GQLListType<E>;
export type GQLNonNullType<E extends Env> = readonly [GQLRawType<E>, "!"];
export type GQLType<E extends Env> = GQLRawType<E> | GQLNonNullType<E>;

// prettier-ignore
export type GQLRawTypeToTS<E extends Env, RT> = RT extends GQLListType<E>
  ? E["types"][RT[0]]
  : RT extends GQLNamedType<E>
    ? E["types"][RT]
    : never;

/** Returns the correspondent TypeScript type for a given Houbolt GraphQL type */
export type GQLTypeToTS<E extends Env, T> = T extends GQLNonNullType<E>
  ? GQLRawTypeToTS<E, T[0]>
  : (GQLRawTypeToTS<E, T> | undefined);

export function buildRawType<E extends Env>(rawType: GQLRawType<E>): NamedTypeNode | ListTypeNode {
  return typeof rawType === "object"
    ? {
        kind: "ListType",
        type: {
          kind: "NamedType",
          name: {
            kind: "Name",
            value: rawType[0],
          },
        },
      }
    : {
        kind: "NamedType",
        name: {
          kind: "Name",
          value: rawType,
        },
      };
}

/** Builds the GraphQL AST for a given Houbolt type */
export function buildType<E extends Env>(type: GQLType<E>): TypeNode {
  return isNonNull(type)
    ? {
        kind: "NonNullType",
        type: buildRawType(type[0]),
      }
    : buildRawType(type);
}

/** Returns whether the provided type is non null */
export function isNonNull<E extends Env>(type: GQLType<E>): type is GQLNonNullType<E> {
  return typeof type === "object" && type[1] === "!";
}
