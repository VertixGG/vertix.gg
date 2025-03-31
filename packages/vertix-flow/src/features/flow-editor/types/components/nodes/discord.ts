import { ComponentType } from "discord-api-types/v10";

import type {
  APIButtonComponent,
  APIStringSelectComponent,
  APIRoleSelectComponent,
  APIMessageActionRowComponent
} from "discord-api-types/v10";

import type { BaseNode } from "@vertix.gg/flow/src/features/flow-editor/types/core/base";
import type { GroupNodeData } from "@vertix.gg/flow/src/features/flow-editor/types/components/nodes/group";

// Discord Embed Types
export interface DiscordEmbed {
  title?: string;
  description?: string;
  thumbnail?: { url: string };
  image?: { url: string };
  [key: string]: unknown;
}

// Discord Element Types
export interface DiscordElement {
  attributes: APIMessageActionRowComponent;
}

// Discord Component Types
export interface RenderableElementData {
  id: string;
  label: string;
  type: string;
  attributes: APIMessageActionRowComponent;
}

// Node Data Types
export interface ComponentNodeData extends BaseNode {
  type: "component";
  elements?: Array<{
    id: string;
    label: string;
    elements: Array<RenderableElementData>;
  }>;
  embeds?: Array<{
    id: string;
    label: string;
    attributes: DiscordEmbed;
  }>;
  childNodes?: Array<ExtendedNodeData>;
}

export interface EmbedNodeData extends BaseNode {
  type: "embed";
  attributes: DiscordEmbed;
}

export interface ElementNodeData extends BaseNode {
  type: "element";
  attributes: APIMessageActionRowComponent;
}

export interface ElementsRowData extends BaseNode {
  type: "elements-row";
  elements: Array<ElementNodeData>;
}

// Type Guards
export const isButtonComponent = ( component: APIMessageActionRowComponent ): component is APIButtonComponent => {
  return component.type === ComponentType.Button;
};

export const isStringSelectComponent = ( component: APIMessageActionRowComponent ): component is APIStringSelectComponent => {
  return component.type === ComponentType.StringSelect;
};

export const isRoleSelectComponent = ( component: APIMessageActionRowComponent ): component is APIRoleSelectComponent => {
  return component.type === ComponentType.RoleSelect;
};

// Helper Functions
export const getButtonLabel = ( button: APIButtonComponent ): string | undefined => {
  if ( "url" in button || "custom_id" in button ) {
    return "label" in button ? button.label : undefined;
  }
  return undefined;
};

// Discord Select Types
export interface DiscordEmoji {
  name: string;
  id?: string;
  animated?: boolean;
}

export interface DiscordSelectOption {
  label: string;
  value: string;
  description?: string;
  emoji?: string | DiscordEmoji;
  default?: boolean;
}

// Union Types
export type ExtendedNodeData = ComponentNodeData | EmbedNodeData | ElementNodeData | ElementsRowData | GroupNodeData;
