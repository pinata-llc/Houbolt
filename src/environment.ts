/** GraphQL environment type */
export type Env = {
  /** Which TypeScript type corresponds to which GraphQL type.
   *
   * @example
   *  houbolt<{
   *    types: {
   *      "ID": string;
   *      "Int": number;
   *    }
   *    entries: { ... }
   *  }>();
   */
  readonly types: {
    readonly [type: string]: any;
  };
  /** All queriable entrypoints with their returning types
   *
   * @example
   *  interface Product {
   *    id: string;
   *    name: string;
   *  }
   *
   *  houbolt<{
   *    types: { ... }
   *    entries: {
   *      products: Product[]
   *    }
   *  }>();
   */
  readonly entries: {};
};
