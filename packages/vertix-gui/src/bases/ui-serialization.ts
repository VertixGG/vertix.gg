import type { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";

/**
 * Interface for components that can be serialized to schema format
 * Provides consistent serialization across different systems
 */
export interface ComponentSerializer {
  /**
   * Convert component to standardized schema representation
   * @param context Optional serialization context
   * @returns Complete component schema with all children and elements
   */
  toSchema( context?: SerializationContext ): Promise<ComponentSchemaResult>;
}

/**
 * Context for serialization process
 * Allows passing information down the serialization chain
 */
export interface SerializationContext {
  /** Optional parent component reference */
  parent?: UIComponentBase;
  /** Custom properties needed for serialization */
  properties?: Record<string, any>;
}

/**
 * Result of component schema serialization
 */
export interface ComponentSchemaResult {
  name: string;
  type: string;
  entities?: {
    elements?: Array<Array<any>>;
    embeds?: Array<any>;
  };
  components?: ComponentSchemaResult[];
}
