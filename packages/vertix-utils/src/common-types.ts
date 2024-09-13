export type TWithRequiredProp<Type, Key extends keyof Type> = Omit<Type, Key> & Required<Pick<Type, Key>>;

// Utility purpose to handle conditionally optional properties
export type TWithOptionalProps<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>;

export type TUnionToIntersection<U> =
    ( U extends unknown ? ( arg: U ) => void : never ) extends ( arg: infer I ) => void ? I : never;

/**
 * @see https://www.reddit.com/r/typescript/comments/13k27eb/need_help_with_a_type_regarding_readonly_const/
 * Defines a recursive type mapper which operates on two string tuples T and U
 */
export type TRecursiveStringMapper<T extends readonly string[], U extends readonly string[]> =
    Omit< // Omit is used to exclude certain properties from a type, here we exclude 'never'
        // Convert the union type to intersection type. This transformation is necessary because union combines different types while intersection overlaps, which forms a complete set of properties from recursive processes.
        TUnionToIntersection<
            // This conditional type checks if tuple T can be separated into a first element 'K' and rest of the elements 'KT'
            T extends readonly [ infer K extends string, ... infer KT extends readonly string[] ]
                // If the condition above holds, we further check if tuple U can be separated into a first element 'V' and rest of the elements 'UV'. If U is single element tuple or empty, this condition fails
                ? U extends readonly [ infer V, ... infer UV extends readonly string[] ]
                    // If the above condition holds, it means both T and U can be separated into 'first' and 'rest'. Then we combine the first elements into a key-value pair, and recursively process the rest of the elements
                    ? { [P in K]: V; } & TRecursiveStringMapper<KT, UV>
                    // When U doesn't have multiple elements, there is no corresponding value for the keys inferred from T (except the first one), the condition fails and returns never
                    : never
                // When T doesn't have multiple elements, i.e., it only has a single element or is empty. The condition fails and returns never
                : never
        >,
        // Exclude 'never' from the union-to-intersection result, as 'never' is not a valid key-value pair and doesn't contribute to the final mapped object
        never
    >;
