# @zenflux/react-commander

A lightweight command orchestration layer for React that separates UI from behavior through typed Commands, per-instance component context, and a central command manager. Includes a minimal Query abstraction for data fetching, caching, and lifecycle wiring.

## Table of contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [API Reference](#api-reference)
  - [Commands](#commands)
  - [Hooks](#hooks)
  - [Query System](#query-system)
- [Advanced Features](#advanced-features)
- [Live Examples](#live-examples)
- [Examples](#examples)
- [Migration Guide](#migration-guide)
- [Contributing](#contributing)

## Installation

```bash
bun add @zenflux/react-commander
```

## Quick Start

> **Live Demo**: See the complete budget allocation system in action at [apps-example/budget-allocation](../../apps-example//budget-allocation/)

### 1. Define a Command

```ts
import { CommandBase } from "@zenflux/react-commander/command-base";

type Item = { id: string; name: string };
type ItemsState = { items: Item[] };

export class SetItemName extends CommandBase<ItemsState, { id: string; name: string }> {
  static getName() { return "App/ItemsList/SetName" }

  protected apply(args: { id: string; name: string }) {
    const items = (this.state.items ?? []).map(i => 
      i.id === args.id ? { ...i, name: args.name } : i
    );
    return this.setState({ items });
  }
}
```

### 2. Wrap a Component

```tsx
import React from "react";
import { withCommands } from "@zenflux/react-commander/with-commands";
import { useCommand, useCommandState } from "@zenflux/react-commander/hooks";

type Item = { id: string; name: string };
type ItemsState = { items: Item[] };

function ItemsList() {
  const setName = useCommand("App/ItemsList/SetName");
  const [slice] = useCommandState<ItemsState, { items: Item[] }>(
    "App/ItemsList", 
    s => ({ items: s.items ?? [] })
  );

  const renameFirst = () => {
    const first = slice.items[0];
    if (first) setName.run({ id: first.id, name: first.name + "!" });
  };

  return (
    <div>
      <button onClick={renameFirst}>Rename first</button>
      <ul>{slice.items.map(i => <li key={i.id}>{i.name}</li>)}</ul>
    </div>
  );
}

export const ItemsListWithCommands = withCommands<{}, ItemsState>(
  "App/ItemsList",
  ItemsList,
  { items: [] },
  [SetItemName]
);
```

### 3. Add Data Fetching (Optional)

```ts
import { QueryListModuleBase } from "@zenflux/react-commander/query/module-base";

export class ItemsQuery extends QueryListModuleBase<Item> {
  static getName() { return "items" }
  protected getResourceName() { return "items" }

  protected registerEndpoints(): void {
    this.defineEndpoint<Array<{ id: string; name: string }>, Item[]>(
      "App/ItemsList",
      { method: "GET", path: "v1/items", prepareData: api => api.map(x => ({ id: x.id, name: x.name })) }
    );
    this.register("POST", "App/ItemsList/SetName", "v1/items/set-name");
  }

  protected onMount(context, resource?: Item[]) {
    context.setState({ ...context.getState(), items: resource ?? [] });
  }
}
```

### 4. Bootstrap Your App

```tsx
import React from "react";
import { QueryClient } from "@zenflux/react-commander/query/client";
import { QueryProvider } from "@zenflux/react-commander/query/provider";
import { QueryComponent } from "@zenflux/react-commander/query/component";
import { ItemsQuery } from "./items-query";
import { ItemsListWithCommands } from "./items-list";

const client = new QueryClient("https://api.example.com");
client.registerModule(ItemsQuery);

export function App() {
  return (
    <QueryProvider client={client}>
      <QueryComponent
        module={ItemsQuery}
        component={ItemsListWithCommands}
        props={{}}
      />
    </QueryProvider>
  );
}
```

## Core Concepts

### Commands
Commands are classes that encapsulate user actions with typed arguments and state transitions. They provide:
- **Type Safety**: Full TypeScript support for arguments and state
- **Testability**: Easy to unit test in isolation
- **Observability**: Built-in logging and analytics hooks
- **Reversibility**: Support for undo/redo patterns

### Component Context
Each wrapped component gets a unique context with:
- **Per-instance State**: Isolated state management
- **Command Registry**: Access to registered commands
- **Lifecycle Hooks**: Mount, update, and unmount events
- **Event System**: Cross-component communication

### Query System
A lightweight data fetching layer that provides:
- **Endpoint Declaration**: Define API routes and data transformation
- **Caching**: Automatic request deduplication and caching
- **Lifecycle Integration**: Automatic data loading and state updates
- **Type Safety**: End-to-end type safety from API to component

## API Reference

### Commands

#### CommandBase<TState, TArgs>

Base class for all commands.

```ts
abstract class CommandBase<TState, TArgs = {}> {
  static getName(): string
  protected get state(): TState
  protected setState<K extends keyof TState>(state: TState | Pick<TState, K>, cb?: (s: TState) => void): Promise<void>
  protected validateArgs?(args: TArgs): void
  protected apply?(args: TArgs): Promise<unknown> | unknown
  static globalHook(fn: (result?: unknown, args?: TArgs) => void): void
  static globalUnhook(): void
}
```

#### withCommands(componentName, Component, [state?], commands[])

Wraps a component with command capabilities.

```tsx
export const MyComponentWithCommands = withCommands<Props, State>(
  "App/MyComponent",
  MyComponent,
  { initial: "state" },
  [Command1, Command2]
);
```

### Hooks

#### useCommand(commandName, ref?)

Intelligent command adapter that resolves commands by context.

```tsx
const setName = useCommand("App/ItemsList/SetName");
setName.run({ id: "123", name: "New Name" });

// With ref for specific instance
const itemRef = React.useRef();
const setName = useCommand("App/Item/SetName", itemRef);
```

#### useComponent(componentName, context?, options?)

Target a specific component instance by context.

```tsx
const item = useComponent("App/Item");
item.run("App/Item/SetName", { name: "New" });
item.getState<ItemState>();
```

#### useCommandState(componentName, selector?, options?)

Subscribe to component state with optional selector.

```tsx
// Basic usage
const [getState, setState, isMounted] = useCommandState<ItemState>("App/Item");

// With selector for performance
const [slice, setState, isMounted] = useCommandState<ItemState, { name: string }>(
  "App/Item",
  s => ({ name: s.name })
);
```

#### useCommandHook(commandName, handler, ref?)

Declarative subscription to command events.

```tsx
useCommandHook("App/Item/SetName", (result, args) => {
  console.log("Item renamed:", args);
});
```

#### useChildCommandHook(childComponentName, commandName, handler, opts?)

Subscribe to commands on child components.

```tsx
useChildCommandHook("App/Item", "App/Item/SetName", (result, args) => {
  console.log("Child item renamed:", args);
});
```

### Query System

#### QueryModuleBase<TResource>

Base class for query modules.

```ts
abstract class QueryModuleBase<TResource> {
  static getName(): string
  protected getResourceName(): string
  protected registerEndpoints(): void
  protected defineEndpoint<TApi, TData>(name: string, cfg: { method: string; path: string; prepareData?: (api: TApi) => TData }): void
  protected register(method: string, name: string, route: string | { path: string }): void
  request<TResult>(name: string, args?: Record<string, unknown>): Promise<TResult>
  getData<TData>(element: DCommandFunctionComponent, args?: Record<string, unknown>): Promise<TData>
}
```

#### QueryListModuleBase<TEntity>

Specialized for list operations.

```ts
export class ItemsQuery extends QueryListModuleBase<Item> {
  static getName() { return "items"; }
  protected getResourceName() { return "items"; }
  
  protected registerEndpoints() {
    this.defineEndpoint<ItemApiResponse[], Item[]>("App/ItemsList", {
      method: "GET",
      path: "v1/items",
      prepareData: api => api.map(transformItem)
    });
  }
}
```

## Advanced Features

### Undo/Redo Support

Every command can be made reversible by implementing inverse operations:

```ts
export class SetItemName extends CommandBase<ItemsState, { id: string; name: string }> {
  static getName() { return "App/ItemsList/SetName" }

  protected apply(args: { id: string; name: string }) {
    const previousName = this.state.items.find(i => i.id === args.id)?.name;
    const items = this.state.items.map(i => 
      i.id === args.id ? { ...i, name: args.name } : i
    );
    this.setState({ items });
    
    // Return inverse for undo support
    return { id: args.id, name: previousName };
  }
}
```

### Analytics and Logging

Global hooks for analytics and auditing:

```ts
// Global analytics
const cmds = commandsManager.get("App/ItemsList", true);
cmds["App/ItemsList/SetName"].global().globalHook((result, args) => {
  analytics.track("item_renamed", { itemId: args.id, newName: args.name });
});
```

### Autosave

Automatic saving with debouncing:

```ts
import { queryCreateAutoSaveManager } from "@zenflux/react-commander/query/auto-save-manager";

const autosave = queryCreateAutoSaveManager<ItemsState, { items: Item[] }>({
  getKey: () => "items-list",
  pickToSave: s => ({ items: s.items }),
  save: async input => { 
    await api.fetch("POST", "v1/items/save", input); 
  },
  debounceMs: 800,
  intervalMs: 5000
});
```

### Testing

#### Unit Testing Commands

```ts
test("SetItemName updates item name", async () => {
  const cmd = new SetItemName({});
  const holder = { state: { items: [{ id: "1", name: "Old" }] } };
  
  cmd.options = { 
    state: holder.state, 
    setState: (s, cb) => { 
      holder.state = { ...holder.state, ...s }; 
      cb?.(holder.state); 
    } 
  };
  
  await cmd.execute({ on: () => [], listeners: () => [] } as any, { id: "1", name: "New" });
  expect(holder.state.items[0].name).toBe("New");
});
```

#### Integration Testing

```tsx
test("rename button dispatches command", async () => {
  const handler = vi.fn();
  commandsManager.hookByNameScoped(
    { commandName: "App/ItemsList/SetName", componentName: "App/ItemsList", ownerId: "test" }, 
    handler
  );
  
  render(<RenameButton id="1" />);
  fireEvent.click(screen.getByText("Rename"));
  
  expect(handler).toHaveBeenCalledWith(expect.any(Object), { id: "1", name: "New Name" });
});
```

## Live Examples

### Budget Allocation System

A complete, production-ready application demonstrating all `@zenflux/react-commander` features:

- **Commands**: Add, edit, remove channels with full CRUD operations
- **Query System**: Data fetching, caching, and automatic persistence
- **Cross-Component Communication**: Parent-child interactions and event handling
- **Multiple Views**: Accordion and table layouts with dynamic switching
- **Autosave**: Debounced persistence with interval-based flushing
- **Real-world Patterns**: Error handling, loading states, and user interactions

**🔗 [View Live Demo](https://github.com/ZenFlux/zenflux/tree/main/zenflux-react-app-examples/budget-allocation)**

This example showcases:
- Complex state management with typed commands
- API integration with automatic sync
- Child component orchestration
- Performance optimizations with selectors
- Production-ready error handling

## Examples

### Complete Budget Allocation System

This comprehensive example demonstrates all features including Commands, Query system, child components, and real-world patterns.

> **Live Demo**: [View the complete implementation](https://github.com/ZenFlux/zenflux/tree/main/zenflux-react-app-examples/budget-allocation)

#### 1. Domain Types

```ts
// types.ts
export interface Channel {
  meta: {
    id: string;
    name: string;
    icon: string;
  };
  breaks?: BudgetBreak[];
}

export interface BudgetBreak {
  id: string;
  amount: number;
  description: string;
}

export interface ChannelListState {
  channels: Channel[];
  selected: { [key: string]: boolean };
}

export interface ChannelListProps {
  view: "accordion" | "table";
}
```

#### 2. Commands

```ts
// channels-commands.ts
import { CommandBase } from "@zenflux/react-commander/command-base";
import { getQueryModule } from "@zenflux/react-commander/query/provider";
import { ChannelsListQuery } from "./channels-list-query";

export class AddChannel extends CommandBase<ChannelListState> {
  static getName() { return "App/ChannelsList/AddChannel" }
  
  async apply() {
    const queryModule = getQueryModule(ChannelsListQuery);
    const channel = await queryModule.request("App/ChannelsList/AddChannel");
    return this.setState({ channels: [...this.state.channels, channel] });
  }
}

export class SetChannelName extends CommandBase<ChannelListState, { id: string; name: string }> {
  static getName() { return "App/ChannelsList/SetName" }
  
  apply(args: { id: string; name: string }) {
    const channels = this.state.channels.map(c =>
      c.meta.id === args.id 
        ? { ...c, meta: { ...c.meta, name: args.name } }
        : c
    );
    return this.setState({ channels });
  }
}

export class EditChannel extends CommandBase<ChannelListState, { channel: Channel }> {
  static getName() { return "App/ChannelsList/EditRequest" }
  
  apply(args: { channel: Channel }) {
    // Logic for editing channel
    return this.setState({ selected: { [args.channel.meta.id]: true } });
  }
}

export class RemoveChannel extends CommandBase<ChannelListState, { channel: Channel }> {
  static getName() { return "App/ChannelsList/RemoveRequest" }
  
  apply(args: { channel: Channel }) {
    const channels = this.state.channels.filter(c => c.meta.id !== args.channel.meta.id);
    return this.setState({ channels });
  }
}
```

#### 3. Query Module

```ts
// channels-list-query.ts
import { QueryListModuleBase } from "@zenflux/react-commander/query/module-base";
import { queryCreateAutoSaveManager } from "@zenflux/react-commander/query/auto-save-manager";
import commandsManager from "@zenflux/react-commander/commands-manager";

export class ChannelsListQuery extends QueryListModuleBase<Channel> {
  private autosave: ReturnType<typeof queryCreateAutoSaveManager>;

  constructor(client: QueryClient) {
    super(client);
    
    this.autosave = queryCreateAutoSaveManager<ChannelListState, { key: string; channels: Channel[] }>({
      getKey: () => "channels-list",
      pickToSave: (state) => ({
        key: "channels-list",
        channels: state.channels
      }),
      save: async (input) => {
        await this.api.fetch("POST", "v1/channels/list", input);
      },
      debounceMs: 800,
      intervalMs: 5000
    });
  }

  static getName() { return "channels" }
  protected getResourceName() { return "channels" }

  protected registerEndpoints() {
    this.defineEndpoint<ChannelApiResponse[], Channel[]>("App/ChannelsList", {
      method: "GET",
      path: "v1/channels",
      prepareData: (api) => api.map(transformChannel)
    });

    this.register("POST", "App/ChannelsList/AddChannel", "v1/channels/create");
    this.register("POST", "App/ChannelsList/SetName", "v1/channels/set-name");
  }

  protected onMount(context, resource?: Channel[]) {
    context.setState({ 
      ...context.getState(), 
      channels: resource ?? [] 
    });

    // Set up autosave on selection changes
    const accordion = commandsManager.get("UI/Accordion", true);
    if (accordion) {
      const saveCallback = async () => {
        const state = context.getState<ChannelListState>();
        this.autosave.queryUpsert(state);
        await this.autosave.queryFlush();
      };

      accordion["UI/Accordion/onSelectionAttached"].global().globalHook(saveCallback);
      accordion["UI/Accordion/onSelectionDetached"].global().globalHook(saveCallback);
    }

    // Set up API sync for name changes
    const channelsList = commandsManager.get("App/ChannelsList", true);
    if (channelsList) {
      channelsList["App/ChannelsList/SetName"].global().globalHook(async (_, args) => {
        if (args?.id && args?.name) {
          await this.request("App/ChannelsList/SetName", {
            id: args.id as string,
            name: args.name as string
          });
        }
      });
    }
  }

  protected onUnmount(context) {
    this.autosave.queryFlush();
    // Clean up global hooks
  }
}
```

#### 4. Main Component with Commands

```tsx
// channels-list.tsx
import React from "react";
import { withCommands } from "@zenflux/react-commander/with-commands";
import { useCommandState } from "@zenflux/react-commander/hooks";
import { QueryComponent } from "@zenflux/react-commander/query/component";

function ChannelsList({ view }: ChannelListProps) {
  const [state] = useCommandState<ChannelListState>("App/ChannelsList", s => s);
  
  switch (view) {
    case "accordion":
      return <ChannelsListAccordion />;
    case "table":
      return <ChannelsListTable />;
    default:
      throw new Error(`Unknown view: ${view}`);
  }
}

export const ChannelsListWithCommands = withCommands<ChannelListProps, ChannelListState>(
  "App/ChannelsList",
  ChannelsList,
  { channels: [], selected: {} },
  [AddChannel, SetChannelName, EditChannel, RemoveChannel]
);
```

#### 5. Accordion View with Interactions

```tsx
// channels-list-accordion.tsx
import React from "react";
import { useComponent, useCommandState, useChildCommandHook, useChildCommandRunner } from "@zenflux/react-commander/hooks";

export function ChannelsListAccordion() {
  const [state, setState] = useCommandState<ChannelListState>("App/ChannelsList", s => s);
  const component = useComponent("App/ChannelsList");
  
  // Listen to child accordion item title edits
  useChildCommandHook("UI/AccordionItem", "UI/AccordionItem/EditTitle", (_, args) => {
    component.run("App/ChannelsList/SetName", {
      id: args.itemKey,
      name: args.title
    });
  });

  // Runner for child components
  const runAccordionItem = useChildCommandRunner("UI/AccordionItem", (ctx) => ctx.props.itemKey);

  // Handle edit requests
  useCommandHook("App/ChannelsList/EditRequest", (_, args) => {
    const { channel } = args;
    setState({ selected: { [channel.meta.id]: true } });
    
    // Enable editing mode on the accordion item
    runAccordionItem(channel.meta.id, "UI/AccordionItem/EditableTitle", { state: true });
  });

  return (
    <Accordion selected={state.selected} setSelected={(selected) => setState({ selected })}>
      {state.channels.map(channel => (
        <AccordionItem
          key={channel.meta.id}
          itemKey={channel.meta.id}
          heading={{ title: channel.meta.name, icon: channel.meta.icon }}
          menu={{
            edit: {
              label: "Edit",
              action: () => component.run("App/ChannelsList/EditRequest", { channel })
            },
            remove: {
              label: "Remove",
              color: "danger" as const,
              action: () => component.run("App/ChannelsList/RemoveRequest", { channel })
            }
          }}
        >
          <ChannelContent channelId={channel.meta.id} meta={channel.meta} />
        </AccordionItem>
      ))}
    </Accordion>
  );
}
```

#### 6. Table View

```tsx
// channels-list-table.tsx
import React from "react";
import { useCommandState } from "@zenflux/react-commander/hooks";

export function ChannelsListTable() {
  const [state] = useCommandState<ChannelListState>("App/ChannelsList", s => s);
  
  const channelsWithBreaks = state.channels.filter(
    channel => channel.breaks && channel.breaks.length > 0
  );

  return (
    <div className="pt-[45px]">
      {channelsWithBreaks.length === 0 ? (
        <div className="pt-[15px] ps-[40px] text-slate-400 text-[11px] font-bold uppercase leading-none text-center">
          There are {state.channels.length} channels, but none have budget allocation.
        </div>
      ) : (
        channelsWithBreaks.map((channel, index) => (
          <div key={index} className="h-[130px] flex flex-row items-center">
            <div className="w-[220px] h-full">
              <div className="pt-[15px] ps-[40px] text-slate-400 text-[11px] font-bold uppercase leading-none">
                Channel #{index + 1}
              </div>
              <div className="pt-[30px] ps-[35px] text-slate-800 text-sm font-medium font-sans leading-[21px]">
                <img src={channel.meta.icon} alt={channel.meta.name} className="inline-block mr-[10px] w-[36px] h-[36px]"/>
                <span>{channel.meta.name}</span>
              </div>
            </div>
            <div className="w-[80px] h-full border-e border-slate-300 bg-[linear-gradient(to_right,rgba(169,181,210,0.01),rgba(112,126,167,0.134))] opacity-50"/>
            <ChannelItemTable $data={channel} key={channel.meta.id}/>
          </div>
        ))
      )}
    </div>
  );
}
```

#### 7. App Bootstrap

```tsx
// app.tsx
import React from "react";
import { QueryClient } from "@zenflux/react-commander/query/client";
import { QueryProvider } from "@zenflux/react-commander/query/provider";
import { ChannelsListQuery } from "./channels-list-query";
import { ChannelsListWithCommands } from "./channels-list";

const client = new QueryClient("https://api.example.com");
client.registerModule(ChannelsListQuery);

export function App() {
  return (
    <QueryProvider client={client}>
      <QueryComponent
        module={ChannelsListQuery}
        component={ChannelsListWithCommands}
        props={{ view: "accordion" }}
      />
    </QueryProvider>
  );
}
```

#### 8. Child Component Integration

```tsx
// channel-content.tsx
import React from "react";
import { QueryComponent } from "@zenflux/react-commander/query/component";
import { ChannelItemQuery } from "./channel-item-query";
import { ChannelItemAccordion } from "./channel-item-accordion";

const ChannelContent = React.memo<{ channelId: string; meta: Channel["meta"] }>(({ channelId, meta }) => {
  return (
    <QueryComponent
      key={channelId}
      fallback={<div className="loading">Loading...</div>}
      module={ChannelItemQuery}
      component={ChannelItemAccordion}
      props={{ meta }}
    />
  );
}, (prevProps, nextProps) => prevProps.channelId === nextProps.channelId);
```

This comprehensive example demonstrates:

- **Commands**: Add, edit, remove, and rename operations
- **Query System**: Data fetching, caching, and lifecycle management
- **Autosave**: Automatic persistence with debouncing
- **Child Components**: Cross-component communication
- **Multiple Views**: Accordion and table layouts
- **Real-world Patterns**: Error handling, loading states, and user interactions
- **Type Safety**: Full TypeScript integration throughout

## Migration Guide

### From Redux

1. Replace actions with Commands
2. Replace reducers with Command.apply methods
3. Replace useSelector with useCommandState
4. Replace dispatch with useCommand

### From Context API

1. Wrap components with withCommands
2. Replace context consumers with useCommand/useCommandState
3. Move state logic to Commands

## API Reference

### Core Classes

#### CommandBase<TState, TArgs>

Base class for all commands.

```ts
import { CommandBase } from "@zenflux/react-commander/command-base";

abstract class CommandBase<TState = React.ComponentState, TArgs = DCommandArgs> {
  static getName(): string
  protected get state(): TState
  protected setState<K extends keyof TState>(state: TState | Pick<TState, K>, cb?: (s: TState) => void): Promise<void>
  protected validateArgs?(args: TArgs): void
  protected apply?(args: TArgs): Promise<unknown> | unknown
  static globalHook(fn: (result?: unknown, args?: TArgs) => void): void
  static globalUnhook(): void
}
```

#### withCommands(componentName, Component, [state?], commands[])

Higher-order component that wraps components with command capabilities.

```ts
import { withCommands } from "@zenflux/react-commander/with-commands";

function withCommands<TProps = any, TState = undefined>(
  componentName: string,
  Component: DCommandFunctionComponent<TProps, TState>,
  state?: TState,
  commands?: DCommandNewInstanceWithArgs<TState>[]
): DCommandFunctionComponent<TProps, TState>
```

#### commandsManager

Central registry and dispatcher for all commands.

```ts
import commandsManager from "@zenflux/react-commander/commands-manager";

class CommandsManager {
  register(args: DCommandRegisterArgs): CommandBase[]
  run(id: DCommandIdArgs, args: DCommandArgs, callback?: (result: any) => any): Promise<any>
  hook(id: DCommandIdArgs, callback: (result?: any, args?: DCommandArgs) => any): DCommandHookHandle
  unhook(id: DCommandIdArgs): void
  unhookHandle(handle: DCommandHookHandle): void
  get(componentName: string, includeGlobal?: boolean): { [commandName: string]: CommandBase }
}
```

### React Hooks

#### useCommand(commandName, ref?)

Intelligent command adapter that resolves commands by context.

```ts
import { useCommand } from "@zenflux/react-commander/hooks";

function useCommand(commandName: string): UseCommandAdapter
function useCommand(commandName: string, ref: React.RefObject<any>): UseCommandAdapter | null

// Returns: { run, hook, unhook, unhookHandle?, getInternalContext }
```

**Example:**
```tsx
function ItemComponent({ id, name }: { id: string; name: string }) {
  const setName = useCommand("App/ItemsList/SetName");
  const deleteItem = useCommand("App/ItemsList/DeleteItem");
  
  const handleRename = () => {
    setName.run({ id, name: "New Name" });
  };
  
  const handleDelete = () => {
    deleteItem.run({ id });
  };
  
  return (
    <div>
      <span>{name}</span>
      <button onClick={handleRename}>Rename</button>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
}
```

#### useComponent(componentName, context?, options?)

Target a specific component instance by context.

```ts
import { useComponent } from "@zenflux/react-commander/hooks";

function useComponent(
  componentName: string, 
  context?: DCommandComponentContextProps, 
  options?: { silent?: boolean }
): {
  run: (commandName: string, args: DCommandArgs, callback?: (result: any) => void) => Promise<any>
  hook: (commandName: string, callback: (result?: any, args?: DCommandArgs) => void) => DCommandHookHandle
  unhook: (commandName: string) => void
  unhookHandle: (handle: DCommandHookHandle) => void
  getId: () => string
  getKey: () => string
  isAlive: () => boolean
  getInternalContext: () => DCommandSingleComponentContext
  getContext: () => DCommandComponentContextProps
  getState: <TState extends React.ComponentState>() => TState
}
```

**Example:**
```tsx
function ItemsListToolbar() {
  const itemsList = useComponent("App/ItemsList");
  
  const handleSelectAll = () => {
    if (itemsList.isAlive()) {
      itemsList.run("App/ItemsList/SelectAll");
    }
  };
  
  const handleClearSelected = () => {
    itemsList.run("App/ItemsList/ClearSelected", {}, (result) => {
      console.log(`Cleared ${result.count} items`);
    });
  };
  
  const currentState = itemsList.getState<ItemsListState>();
  
  return (
    <div>
      <button onClick={handleSelectAll}>Select All</button>
      <button onClick={handleClearSelected}>
        Clear Selected ({currentState.selectedCount})
      </button>
    </div>
  );
}
```

#### useCommandState(componentName, selector?, options?)

Subscribe to component state with optional selector.

```ts
import { useCommandState } from "@zenflux/react-commander/hooks";

// Basic usage
function useCommandState<TState>(commandName: string): readonly [
  () => TState,
  (state: TState | ((prev: TState) => TState)) => void,
  () => boolean
]

// With selector
function useCommandState<TState, TSelector>(
  commandName: string,
  selector: (state: TState) => TSelector,
  options?: { equalityFn?: (a: TSelector, b: TSelector) => boolean }
): readonly [TSelector, (state: TState | ((prev: TState) => TState)) => void, () => boolean]
```

**Example:**
```tsx
function ItemsList() {
  // Basic usage - get full state
  const [getState, setState, isMounted] = useCommandState<ItemsListState>("App/ItemsList");
  
  // With selector - only re-render when items change
  const [items, setItems, isMounted] = useCommandState<ItemsListState, { items: Item[] }>(
    "App/ItemsList",
    state => ({ items: state.items })
  );
  
  // Custom equality function for complex objects
  const [filteredItems, setFilteredItems] = useCommandState<ItemsListState, Item[]>(
    "App/ItemsList",
    state => state.items.filter(item => !item.archived),
    { equalityFn: (a, b) => a.length === b.length && a.every((item, i) => item.id === b[i]?.id) }
  );
  
  const handleAddItem = () => {
    if (isMounted()) {
      setItems(prev => ({
        ...prev,
        items: [...prev.items, { id: Date.now().toString(), name: "New Item", archived: false }]
      }));
    }
  };
  
  return (
    <div>
      <button onClick={handleAddItem}>Add Item</button>
      <ul>
        {filteredItems.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

#### useCommandHook(commandName, handler, ref?)

Declarative subscription to command events.

```ts
import { useCommandHook } from "@zenflux/react-commander/hooks";

function useCommandHook(
  commandName: string,
  handler: (result?: unknown, args?: DCommandArgs) => void,
  ref?: React.RefObject<any>
): void
```

**Example:**
```tsx
function ItemsAnalytics() {
  // Track item creation
  useCommandHook("App/ItemsList/AddItem", (result, args) => {
    analytics.track("item_created", {
      itemId: result.id,
      timestamp: Date.now()
    });
  });
  
  // Track item updates
  useCommandHook("App/ItemsList/SetName", (result, args) => {
    analytics.track("item_renamed", {
      itemId: args.id,
      newName: args.name,
      timestamp: Date.now()
    });
  });
  
  // Track with specific component instance
  const itemRef = useRef();
  useCommandHook("App/Item/DeleteItem", (result, args) => {
    console.log(`Item ${args.id} deleted from specific component`);
  }, itemRef);
  
  return <div>Analytics tracking active</div>;
}
```

#### useCommandRunner(commandName, ref?)

Get a memoized runner function for a specific command.

```ts
import { useCommandRunner } from "@zenflux/react-commander/hooks";

function useCommandRunner(
  commandName: string, 
  ref?: React.RefObject<any>
): (args?: DCommandArgs, callback?: (result: unknown) => void) => unknown
```

**Example:**
```tsx
function ItemForm({ onSubmit }: { onSubmit: (item: Item) => void }) {
  const addItem = useCommandRunner("App/ItemsList/AddItem");
  const [name, setName] = useState("");
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    addItem(
      { name, archived: false },
      (result) => {
        console.log("Item created:", result);
        onSubmit(result);
        setName("");
      }
    );
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={name} 
        onChange={(e) => setName(e.target.value)}
        placeholder="Add an item..."
      />
      <button type="submit">Add Item</button>
    </form>
  );
}

// With ref for specific instance
function ItemActions({ itemId }: { itemId: string }) {
  const itemRef = useRef();
  const toggleItem = useCommandRunner("App/Item/ToggleItem", itemRef);
  
  const handleToggle = () => {
    toggleItem({ id: itemId });
  };
  
  return <button onClick={handleToggle}>Toggle</button>;
}
```

#### useComponentWithRef(componentName, ref)

Target a component instance by ref.

```ts
import { useComponentWithRef } from "@zenflux/react-commander/hooks";

function useComponentWithRef(
  componentName: string, 
  ref: React.RefObject<any>
): ReturnType<typeof useComponent> | null
```

**Example:**
```tsx
function ItemsList() {
  const itemRefs = useRef<{ [key: string]: React.RefObject<any> }>({});
  
  return (
    <div>
      {items.map(item => {
        const itemRef = useRef();
        itemRefs.current[item.id] = itemRef;
        
        return (
          <ItemComponent 
            key={item.id} 
            ref={itemRef}
            item={item} 
          />
        );
      })}
    </div>
  );
}

function ItemComponent({ item }: { item: Item }) {
  const itemRef = useRef();
  const itemComponent = useComponentWithRef("App/Item", itemRef);
  
  const handleEdit = () => {
    if (itemComponent) {
      itemComponent.run("App/Item/StartEdit");
    }
  };
  
  const handleDelete = () => {
    if (itemComponent) {
      itemComponent.run("App/Item/Delete", { id: item.id });
    }
  };
  
  return (
    <div ref={itemRef}>
      <span>{item.name}</span>
      <button onClick={handleEdit}>Edit</button>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
}
```

#### useChildCommandHook(childComponentName, commandName, handler, opts?)

Subscribe to commands on child components.

```ts
import { useChildCommandHook } from "@zenflux/react-commander/hooks";

function useChildCommandHook(
  childComponentName: string,
  commandName: string,
  handler: (result?: unknown, args?: DCommandArgs) => void,
  opts?: { filter?: (cmd: any) => boolean; ignoreDuplicate?: boolean }
): void
```

**Example:**
```tsx
function ItemsList() {
  const [archivedCount, setArchivedCount] = useState(0);
  
  // Listen to all child items being archived
  useChildCommandHook("App/Item", "App/Item/ToggleArchive", (result, args) => {
    if (result.archived) {
      setArchivedCount(prev => prev + 1);
      analytics.track("item_archived", { itemId: args.id });
    } else {
      setArchivedCount(prev => prev - 1);
    }
  });
  
  // Listen to child items being deleted with filtering
  useChildCommandHook(
    "App/Item", 
    "App/Item/DeleteItem", 
    (result, args) => {
      console.log(`Item ${args.id} deleted`);
    },
    { 
      filter: (cmd) => cmd.args.priority === "high",
      ignoreDuplicate: true 
    }
  );
  
  return (
    <div>
      <h2>Archived: {archivedCount}</h2>
      {items.map(item => (
        <ItemComponent key={item.id} item={item} />
      ))}
    </div>
  );
}
```

#### useChildCommandRunner(childComponentName, selector)

Run commands on child components by key/selector.

```ts
import { useChildCommandRunner } from "@zenflux/react-commander/hooks";

function useChildCommandRunner(
  childComponentName: string,
  selector: (ctx: DCommandSingleComponentContext) => string
): (key: string, commandName: string, args: DCommandArgs) => boolean
```

**Example:**
```tsx
function ItemsList() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // Runner to target specific items by ID
  const runOnItem = useChildCommandRunner("App/Item", (ctx) => ctx.props.itemId);
  
  const handleSelectAll = () => {
    items.forEach(item => {
      const success = runOnItem(item.id, "App/Item/Select", { selected: true });
      if (success) {
        setSelectedItems(prev => [...prev, item.id]);
      }
    });
  };
  
  const handleClearSelection = () => {
    selectedItems.forEach(itemId => {
      runOnItem(itemId, "App/Item/Select", { selected: false });
    });
    setSelectedItems([]);
  };
  
  const handleArchiveSelected = () => {
    selectedItems.forEach(itemId => {
      runOnItem(itemId, "App/Item/ToggleArchive", { archived: true });
    });
  };
  
  return (
    <div>
      <div>
        <button onClick={handleSelectAll}>Select All</button>
        <button onClick={handleClearSelection}>Clear Selection</button>
        <button onClick={handleArchiveSelected}>
          Archive Selected ({selectedItems.length})
        </button>
      </div>
      {items.map(item => (
        <ItemComponent key={item.id} item={item} />
      ))}
    </div>
  );
}
```

### Query System

#### QueryClient

Main client for query operations.

```ts
import { QueryClient } from "@zenflux/react-commander/query/client";

class QueryClient {
  constructor(baseUrl: string)
  registerModule<TResource extends object>(module: DQueryModuleBaseStatic<TResource>): void
  fetch<T>(method: string, path: string, data?: any, responseHandler?: (response: Response) => Promise<T>): Promise<T>
  get cache(): QueryCache
  get Component(): typeof QueryComponent
}
```

#### QueryModuleBase<TResource>

Base class for query modules.

```ts
import { QueryModuleBase } from "@zenflux/react-commander/query/module-base";

abstract class QueryModuleBase<TResource extends object = object> {
  static getName(): string
  protected getResourceName(): string
  protected registerEndpoints(): void
  protected defineEndpoint<TApi, TData>(name: string, cfg: { method: string; path: string; prepareData?: (api: TApi) => TData }): void
  protected register(method: string, name: string, route: string | { path: string }): void
  request<TResult>(name: string, args?: Record<string, unknown>): Promise<TResult>
  getData<TData>(element: DCommandFunctionComponent, args?: Record<string, unknown>): Promise<TData>
}
```

#### QueryListModuleBase<TEntity>

Specialized for list operations.

```ts
import { QueryListModuleBase } from "@zenflux/react-commander/query/list-module-base";

abstract class QueryListModuleBase<TEntity extends object> extends QueryModuleBase<TEntity[]> {
  // Inherits all QueryModuleBase methods
  // Provides list-specific cache keys and helpers
}
```

#### QueryComponent

Suspense bridge to load module data and inject lifecycle hooks.

```ts
import { QueryComponent } from "@zenflux/react-commander/query/component";

class QueryComponent<TData, TProps, TResource, TState> extends React.PureComponent<DQueryComponentProps<TData, TProps, TResource, TState>>
```

#### QueryProvider

Provides query client to descendants.

```ts
import { QueryProvider, useQueryClient, getQueryClient, getQueryModule } from "@zenflux/react-commander/query/provider";

function QueryProvider(props: { client: QueryClient; children: React.ReactNode }): JSX.Element
function useQueryClient(): QueryClient
function getQueryClient(): QueryClient
function getQueryModule<TResource extends object>(module: DQueryModuleBaseStatic<TResource>): QueryModuleBase<TResource>
```

### Query Utilities

#### queryCreateAutoSaveManager

Creates an autosave manager with debouncing.

```ts
import { queryCreateAutoSaveManager } from "@zenflux/react-commander/query/auto-save-manager";

function queryCreateAutoSaveManager<TState extends object, TSave extends QuerySaveInput>(
  options: QueryCreateAutoSaveManagerOptions<TState, TSave>
): QueryAutoSaveManager<TState, TSave>
```

#### queryDiffById

Computes differences between two lists by ID.

```ts
import { queryDiffById } from "@zenflux/react-commander/query/list-diff";

function queryDiffById<T>(prev: T[], curr: T[], getId: (t: T) => string): { added: T[]; removed: T[] }
```

#### queryCreateMemoryCache

Creates a memory-based cache.

```ts
import { queryCreateMemoryCache } from "@zenflux/react-commander/query/cache";

function queryCreateMemoryCache(): QueryCache
```

### Type Definitions

#### DCommandFunctionComponent<TProps, TState>

Type for command-enabled functional components.

```ts
import type { DCommandFunctionComponent } from "@zenflux/react-commander/definitions";

interface DCommandFunctionComponent<TProps = any, TState = undefined> extends React.FC<TProps> {
  (props: TProps, state?: TState): React.ReactNode
  getName?(): string
}
```

#### DCommandSingleComponentContext

Context for a single component instance.

```ts
import type { DCommandSingleComponentContext } from "@zenflux/react-commander/definitions";

interface DCommandSingleCompzeonentContext {
  commands: { [commandName: string]: CommandBase }
  componentNameUnique: string
  componentName: string
  key: string
  props: any
  isMounted(): boolean
  getState<TState>(): TState
  setState<TState>(state: TState | ((prev: TState) => TState), callback?: (state: TState) => void): Promise<void>
  getComponentContext(): any
  emitter: EventEmitter
  lifecycleHandlers: any
}
```

#### DCommandArgs

Type for command arguments.

```ts

import type { DCommandArgs } from "@zenflux/react-commander/definitions";

type DCommandArgs = {
  [key: string]: unknown
}
```

## License

MIT License - see [LICENSE](LICENSE) for details.
