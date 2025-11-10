# Refactoring Plan: UI Controllers and Data Access Layer

This document outlines the plan for refactoring the interaction between `vertix-bot` UI flows and the `vertix-flow` editor, introducing new architectural patterns for improved decoupling and maintainability.

**Date:** April 6, 2024

## 1. Goals

*   Improve separation of concerns between UI flow logic, interaction handling, and data access.
*   Decouple `vertix-bot` UI components (Flows, Controllers) from direct data persistence logic.
*   Replace the existing `UIAdapter` pattern with a more cohesive `UIController` pattern.
*   Enhance maintainability, testability, and overall code clarity.
*   Ensure continued or improved interaction with the `vertix-flow` visual editor.

## 2. Problems with Current Approach

*   `UIAdapter` instances exhibit coupling issues, sometimes referencing other adapters directly.
*   Logic for handling UI interactions, flow state, and service calls is intertwined within adapters.
*   Potential for outdated references and logic inconsistencies (e.g., `SetupNewWizardAdapter` referencing older `SetupAdapter`).
*   Lack of a dedicated, standardized layer for UI-related data access.

## 3. Proposed Architecture

We will introduce two main patterns:

### 3.1. UIController Pattern

*   Replaces `UIAdapterBase`.
*   Each `UIController` (e.g., `WelcomeController`) will be explicitly aware of and interact directly with its corresponding `UIFlow` (e.g., `WelcomeFlow`).
*   **Responsibilities:**
    *   Handle platform-specific events (Discord interactions).
    *   Consult the `UIFlow` for valid transitions.
    *   Trigger transitions on the `UIFlow` instance.
    *   Interact with the `UIDataService` (see below) to fetch/persist data as needed based on flow state.
    *   Update the `UIComponent` based on the current flow state.

### 3.2. Data Access Layer

*   Provides a dedicated layer for UI-related data operations.
*   **Components:**
    *   `UIDataBase`: Abstract base class defining a CRUD interface (using methods).
    *   Concrete Implementations (e.g., `MasterChannelsData`, `BadwordsData`): Extend `UIDataBase` for specific entities, encapsulating Prisma logic.
    *   `UIDataService`: A central service (extending `ServiceBase`) responsible for registering and providing instances of `UIDataBase` components.

### 3.3. Architectural Diagram

```mermaid
flowchart TD
    subgraph External [External Systems]
        DiscordEvent(User Interaction e.g., Button Click, Modal Submit)
    end

    subgraph Application [Application Core]
        direction TB

        subgraph Controller [Controller Layer]
            UIController(UIController e.g., WelcomeController)
        end

        subgraph Flow [Flow Logic Layer]
             UIFlow(UIFlow e.g., WelcomeFlow / SetupNewWizardFlow)
        end

        subgraph DataAccess [Data Access Layer]
             UIDataService(UIDataService)
             MasterChannelsData(UIDataBase: MasterChannelsData)
             BadwordsData(UIDataBase: BadwordsData)
             MaxChannelsData(UIDataBase: MaxMasterChannelsData)
        end

         subgraph Services [Service Layer]
             ServiceLocator(ServiceLocator)
             PrismaClient(PrismaClient / DB Abstraction)
         end
    end

    subgraph Presentation [UI Presentation]
         UIComponent(UIComponent e.g., WelcomeComponent / Wizard Steps)
    end

    subgraph Persistence [Database]
         DB[(Database)]
    end

    %% Core Interaction Flow
    DiscordEvent -- 1. Triggers --> UIController

    UIController -- 2. Consults Flow --> UIFlow
    UIController -- 3. Requests Data Accessor --> UIDataService
    UIDataService -- 4. Provides --> MasterChannelsData # Or other UIDataBase needed
    UIController -- 5. Uses Data Accessor --> MasterChannelsData

    %% Example Conditional Branch
    UIController -- 6. Triggers Transition --> UIFlow

    %% Post-Transition
    UIController -- 7. Gets Updated State --> UIFlow
    UIController -- 8. Updates UI --> UIComponent

    %% Data Persistence Flow
    UIController -- Calls Create/Update --> MasterChannelsData
    MasterChannelsData -- Uses --> PrismaClient
    PrismaClient -- Reads/Writes --> DB

    %% Dependency Injection
    UIController -- Uses --> ServiceLocator
    UIDataService -- Uses --> ServiceLocator
    MasterChannelsData -- Uses --> ServiceLocator # To get PrismaClient etc.

    ServiceLocator -- Provides --> UIDataService
    ServiceLocator -- Provides --> PrismaClient
```

## 4. Implementation Steps

1.  [x] Refactor `UIDataBase` to use methods for CRUD operations (`packages/vertix-gui/src/bases/ui-data-base.ts`).
2.  [x] Create `UIDataService` for managing data components (`packages/vertix-gui/src/ui-data-service.ts`).
3.  [x] Create skeleton files for `UIDataBase` implementations in `packages/vertix-bot/src/data/`:
    *   `master-channels-data.ts`
    *   `badwords-data.ts`
    *   `max-master-channels-data.ts`
4.  [ ] Implement data access logic (using Prisma via `PrismaBotClient.$.getClient()`) within the created `UIDataBase` components.
    *   Start with `master-channels-data.ts`.
    *   Implement `badwords-data.ts`.
    *   Implement `max-master-channels-data.ts`.
5.  [ ] Register the implemented `UIDataBase` components with the `UIDataService` during application initialization.
6.  [ ] Define a base `UIController` class (similar structure to `UIAdapterBase` but designed to hold a `UIFlow` instance).
7.  [ ] Implement specific controllers (e.g., `WelcomeController`, `SetupNewWizardController`).
    *   Inject/retrieve corresponding `UIFlow`.
    *   Inject/retrieve `UIDataService`.
    *   Map Discord interactions (buttons, modals, selects) to methods.
    *   Implement interaction handlers using the Flow state machine and Data components.
8.  [ ] Register the new `UIController`s (potentially via `UIService` or a new dedicated service if preferred).
9.  [ ] Update event listeners (e.g., Discord client `interactionCreate`) to route events to the new Controllers instead of the old Adapters.
10. [ ] Verify interaction with the `vertix-flow` editor (ensure `getEdgeSourceMappings` or similar mechanisms still function correctly with the new structure).
11. [ ] Gradually remove or deprecate the old `UIAdapter` implementations (`WelcomeAdapter`, `SetupNewWizardAdapter`) once Controllers are fully functional.

## 5. Open Questions / Considerations

*   Final location/management of `UIController` instances (via `UIService`? New `UIControllerService`?).
*   Specific mechanism for feeding flow/connection data to the `vertix-flow` editor.
*   Error handling patterns within Controllers and Data Components.
*   Instantiation strategy for `UIDataBase` components via `UIDataService` (currently new instance per `get`, consider caching/singleton if appropriate).
