# Flow Editor Enhancement Plan

## Current Issue
The Flow Editor currently doesn't display the complete picture of flows, particularly missing the state machines and connections between different flows.

## Analysis of Existing Files
- `welcome-flow.ts` defines states, transitions, and handoff points
- `setup-new-wizard-flow.ts` defines its own states, transitions, and entry points
- `flow-factory.ts` creates flow diagrams but doesn't visualize states or flow connections

## Implementation Plan

### 1. Enhance Schema Processing
```typescript
private processFlowConnections(mainSchema: FlowSchema): { connectedFlows: string[], connectionPoints: ConnectionPoint[] } {
  const connectedFlows: string[] = [];
  const connectionPoints: ConnectionPoint[] = [];

  // Extract handoff points
  if (mainSchema.handoffPoints) {
    mainSchema.handoffPoints.forEach(handoff => {
      connectedFlows.push(handoff.flowName);
      connectionPoints.push({
        sourceFlow: mainSchema.name,
        targetFlow: handoff.flowName,
        sourceState: handoff.sourceState,
        transition: handoff.transition,
        description: handoff.description
      });
    });
  }

  // Extract entry points
  if (mainSchema.entryPoints) {
    mainSchema.entryPoints.forEach(entry => {
      if (!connectedFlows.includes(entry.flowName)) {
        connectedFlows.push(entry.flowName);
      }
      connectionPoints.push({
        sourceFlow: entry.flowName,
        targetFlow: mainSchema.name,
        sourceState: entry.sourceState,
        targetState: entry.targetState,
        transition: entry.transition,
        description: entry.description
      });
    });
  }

  return { connectedFlows, connectionPoints };
}
```

### 2. Modify createFlowDiagram to Include Connected Flows
```typescript
public createFlowDiagram(schema: FlowSchema): FlowDiagram {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Process main flow and get connected flows
  const { connectedFlows, connectionPoints } = this.processFlowConnections(schema);

  // Create main flow node
  const mainFlowNode = this.createFlowNode(schema, { x: canvasWidth / 2, y: canvasHeight / 2 });
  nodes.push(mainFlowNode);

  // Calculate positions for connected flow nodes in a circular layout
  const radius = Math.min(canvasWidth, canvasHeight) * 0.3;
  const angleStep = (2 * Math.PI) / connectedFlows.length;

  // Create nodes for connected flows
  connectedFlows.forEach((flowName, index) => {
    const angle = index * angleStep;
    const x = canvasWidth / 2 + radius * Math.cos(angle);
    const y = canvasHeight / 2 + radius * Math.sin(angle);

    // Fetch or create placeholder for connected flow
    const connectedFlowNode = this.createConnectedFlowNode(flowName, { x, y });
    nodes.push(connectedFlowNode);

    // Create edges for handoffs and entry points
    const connectionsToFlow = connectionPoints.filter(cp =>
      cp.targetFlow === flowName || cp.sourceFlow === flowName
    );

    connectionsToFlow.forEach(connection => {
      edges.push(this.createConnectionEdge(connection, mainFlowNode.id, connectedFlowNode.id));
    });
  });

  return { nodes, edges };
}
```

### 3. Helper Methods for Node and Edge Creation
```typescript
private createFlowNode(schema: FlowSchema, position: { x: number, y: number }): Node {
  return {
    id: `flow-${schema.name}`,
    type: 'custom',
    position,
    data: {
      label: schema.name.split('/').pop() || 'Flow',
      type: 'flow',
      flowData: schema
    },
    style: {
      width: 200,
      height: 120,
      borderColor: '#7c3aed',
      borderWidth: 2
    }
  };
}

private createConnectedFlowNode(flowName: string, position: { x: number, y: number }): Node {
  return {
    id: `connected-flow-${flowName}`,
    type: 'custom',
    position,
    data: {
      label: flowName.split('/').pop() || 'Connected Flow',
      type: 'connectedFlow',
      flowName
    },
    style: {
      width: 180,
      height: 100,
      borderColor: '#2563eb',
      borderWidth: 1,
      backgroundColor: '#eff6ff'
    }
  };
}

private createConnectionEdge(connection: ConnectionPoint, sourceNodeId: string, targetNodeId: string): Edge {
  const isHandoff = connection.sourceFlow === sourceNodeId.replace('flow-', '');

  return {
    id: `edge-${connection.sourceFlow}-to-${connection.targetFlow}-${connection.transition}`,
    source: isHandoff ? sourceNodeId : targetNodeId,
    target: isHandoff ? targetNodeId : sourceNodeId,
    animated: true,
    type: 'smoothstep',
    label: connection.transition,
    labelStyle: { fill: '#4b5563', fontWeight: 'bold' },
    style: { stroke: isHandoff ? '#10b981' : '#f59e0b', strokeWidth: 2 },
    data: {
      description: connection.description,
      sourceState: connection.sourceState,
      targetState: connection.targetState
    }
  };
}
```

### 4. Connected Flow Loading Logic
```typescript
const fetchConnectedFlowData = useCallback(async (flowName: string) => {
  try {
    setLoading(true);
    // Fetch schema for connected flow
    const connectedSchema = await fetchFlowSchema(flowName);

    // Update store with connected flow data
    dispatch(addConnectedFlow(connectedSchema));

    return connectedSchema;
  } catch (error) {
    console.error(`Error loading connected flow ${flowName}:`, error);
    setError(`Failed to load connected flow: ${flowName}`);
    return null;
  } finally {
    setLoading(false);
  }
}, []);

// Add function to load all connected flows
const loadConnectedFlows = useCallback(async (schema: FlowSchema) => {
  const { connectedFlows } = processFlowConnections(schema);

  // Load all connected flows in parallel
  await Promise.all(
    connectedFlows.map(flowName => fetchConnectedFlowData(flowName))
  );

  // Update diagram with all flow connections
  handleSchemaLoaded(schema);
}, [fetchConnectedFlowData, handleSchemaLoaded]);
```

## Flow Loading Process

1. **Initial Flow Load**:
   - User selects a module and flow (e.g., WelcomeFlow)
   - The main flow is loaded through the API
   - Initial flow visualization is displayed

2. **Connected Flow Discovery**:
   - System examines `getHandoffPoints()` and `getEntryPoints()` methods
   - For WelcomeFlow, detects handoff to SetupWizardFlow (via `CLICK_SETUP`)
   - Extracts target flow names from connection points

3. **Connected Flow Loading**:
   - Makes additional API calls to load data for connected flows
   - Happens automatically after main flow loads
   - No user interaction required for initial connection visualization

4. **Connection Rendering**:
   - Creates edges between flows showing transition names
   - Includes source and target states in edge data
   - Uses visual styling to indicate flow direction

## Visual Representation

```
                   INITIAL LOAD                                    AUTO-LOADED AFTER DISCOVERY
+--------------------------------------------------+  +--------------------------------------------------+
|                                                  |  |                                                  |
|  +---------------------------------------------+ |  |  +---------------------------------------------+ |
|  |              WelcomeFlow                    | |  |  |            SetupWizardFlow                 | |
|  |                                             | |  |  |                                             | |
|  |  +-----------+    +----------------+        | |  |  |  +-----------+    +----------------+        | |
|  |  |  INITIAL  |--->| SETUP_CLICKED |--------|-|--|->|  |  INITIAL  |--->| STEP_1_NAME_TEMPLATE |  | |
|  |  +-----------+    +----------------+        | |  |  |  +-----------+    +----------------+        | |
|  |       |                                     | |  |  |       |                   |                 | |
|  |       v                                     | |  |  |       v                   v                 | |
|  |  +-----------+    +----------------+        | |  |  |  +-----------+    +----------------+        | |
|  |  | LANG_SEL  |    | INVITE_CLICKED |        | |  |  |  | STEP_2_BUTTONS |->| STEP_3_ROLES |      | |
|  |  +-----------+    +----------------+        | |  |  |  +-----------+    +----------------+        | |
|  |                                             | |  |  |                         |                   | |
|  |              [Loaded First]                 | |  |  |                         v                   | |
|  +---------------------------------------------+ |  |  |                    +-----------+            | |
|                                                  |  |  |                    | COMPLETED |            | |
+-----------------|-------------------------------|--+  |  +------------------|------------|------------+ |
                  |                                |     |                    |                          |
                  |     Handoff via CLICK_SETUP    |     |                    |                          |
                  +------------------------------->|     |                    |                          |
                                                   |     |                    v                          |
                                                   |     |                +-----------+                  |
                                                   |     |                |   ERROR   |                  |
                                                   |     |                +-----------+                  |
                                                   |     |                                               |
                                                   |     +-----------------------------------------------+
                                                   |              [Auto-loaded when WelcomeFlow is selected]
                                                   |
                                                   v
                  When user clicks on SetupWizardFlow node, it becomes the main flow
                  and its connections are then loaded/displayed
```

This approach ensures that as soon as a user selects a flow, they immediately see how it connects to other flows without requiring additional actions. The diagram shows not just a single flow but the web of relationships between flows.
