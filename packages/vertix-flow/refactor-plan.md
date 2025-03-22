@rules @Flow

let's refactor the project, here are the requirements:
- Modularity
- Single responsibility principle
- Fixed name conventions
- Avoid of any, proper types
- Use zustand state management when needed
- Use design patterns where applicable

🧠 Rule Name

react-flow-important-rule-avoid-using-hard-coded-values-for-calculation-of-position

📜 Description

Avoid using hard-coded pixel values (e.g., x: 100, y: 200) when positioning nodes, edges, or cursors in React Flow. This can lead to rigid layouts that break across screen sizes, zoom levels, or dynamic content changes. Instead, use relative calculations based on node dimensions, parent containers, or viewport metrics.


✅ Correct Example
const position = {
  x: parentWidth / 2 - nodeWidth / 2,
  y: parentHeight / 2 - nodeHeight / 2,
};


❌ Incorrect Example
const position = {
  x: 150,
  y: 300,
};


💡 Why It’s Important
Hardcoded values reduce flexibility and make the flow layout brittle to changes in screen resolution, zoom level, or dynamic node sizes. Using dynamic or contextual values leads to more responsive and maintainable designs.

Please tell me your refactor plan, and let part it to small chunks and proceed step by step


Phase 1: Project Structure and Type Safety
Directory Structure Reorganization
Implement feature-based folder structure
Separate client and server code more clearly
Create dedicated folders for shared utilities and constants
Type System Enhancement
Create proper TypeScript interfaces/types for all entities
Remove any any types
Implement proper error types
Add type guards where necessary
Phase 2: State Management and Patterns
Zustand Implementation
Identify global state requirements
Create separate stores by feature
Implement proper state typing
Design Patterns Integration
Implement Observer pattern for flow updates
Use Factory pattern for flow node creation
Implement Strategy pattern for different flow behaviors
Phase 3: Component Architecture
Component Refactoring
Break down large components
Implement proper prop typing
Create reusable UI components
Implement proper component composition
Phase 4: Utils and Helpers
Utility Functions
Create proper typed utility functions
Implement proper error handling
Add input validation

Before proceeding, I need your approval on:
Do you agree with this general plan?
Which phase should we start with?
Are there any specific areas you'd like to prioritize?
Please let me know your thoughts, and we can start with the first chunk of refactoring based on your preferences.
