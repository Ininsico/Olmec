# 3D Builder Page - React Implementation Plan

## Overview
Converting a 5348-line HTML file with Three.js 3D modeling application to React with TypeScript, maintaining all functionality while updating to match the existing color scheme.

## Core Features Analysis

### 1. **UI Layout Components**
- ✅ Header with menu system (File, Edit, Add, Sculpt, Timeline)
- ✅ Left Sidebar (Create, Sculpt, Scene tabs)
- ✅ Main Viewport with Three.js canvas
- ✅ Right Sidebar (Properties, Transform, Material, Lighting)
- ✅ Bottom Timeline Panel (Animation system)
- ✅ Status Bar (Object count, FPS, etc.)
- ✅ Context Menu
- ✅ Notification System
- ✅ Progress Bar

### 2. **3D Modeling Features**
#### Object Creation
- Cube, Sphere, Cylinder, Cone, Torus, Plane
- Extrude, Bevel, Boolean operations

#### Transform Tools
- Select, Move, Rotate, Scale
- Snap to grid
- Axis constraints (X, Y, Z)
- Transform controls (TransformControls.js)

#### Sculpting Tools
- Draw, Smooth, Flatten, Inflate
- Pinch, Grab, Crevice, Mask
- Brush size, strength, falloff controls
- Symmetry modes (X, Y, Z, Radial)

#### Boolean Operations
- Union, Difference, Intersect

### 3. **Material & Rendering**
- Color picker
- Metallic/Roughness sliders
- Texture maps (Diffuse, Normal, Roughness)
- View modes (Solid, Wireframe, Material, Rendered)

### 4. **Lighting**
- Environment light with intensity control
- Add custom light sources

### 5. **Camera Controls**
- OrbitControls
- View presets (Front, Side, Top, Perspective)
- Perspective/Orthographic toggle
- Zoom controls

### 6. **Animation System**
- Timeline with keyframes
- Play, Pause, Stop, Record
- FPS control
- Frame range (Start/End)
- Keyframe interpolation (Linear, Bezier, Constant)
- Property tracks (Position, Rotation, Scale, Visibility)
- Zoom in/out timeline
- Copy/Paste keyframes

### 7. **Scene Management**
- Scene hierarchy
- Object selection (single/multi)
- Object grouping/ungrouping
- Hide/Show objects
- Freeze/Unfreeze objects
- Layer system

### 8. **File Operations**
- New Project
- Open Project
- Import (GLTF/GLB)
- Export (GLTF)
- Save/Load scene state

### 9. **History System**
- Undo/Redo (up to 100 states)
- State serialization
- History management

### 10. **UI Features**
- Collapsible panels (left/right sidebars)
- Tab system
- Tooltips
- Notifications (info, success, warning, error)
- Context menu (right-click)
- Keyboard shortcuts
- Responsive design

## Component Structure

```
src/pages/Builder.tsx (Main page)
├── components/builder/
│   ├── Header/
│   │   ├── BuilderHeader.tsx
│   │   ├── MenuBar.tsx
│   │   └── MenuItem.tsx
│   ├── Sidebars/
│   │   ├── LeftSidebar/
│   │   │   ├── LeftSidebar.tsx
│   │   │   ├── CreatePanel.tsx
│   │   │   ├── SculptPanel.tsx
│   │   │   └── ScenePanel.tsx
│   │   └── RightSidebar/
│   │       ├── RightSidebar.tsx
│   │       ├── PropertiesPanel.tsx
│   │       ├── TransformPanel.tsx
│   │       ├── MaterialPanel.tsx
│   │       ├── LightingPanel.tsx
│   │       └── BevelExtrudePanel.tsx
│   ├── Viewport/
│   │   ├── Viewport.tsx
│   │   ├── ThreeCanvas.tsx
│   │   ├── Toolbar.tsx
│   │   ├── WelcomeScreen.tsx
│   │   └── ViewportControls.tsx
│   ├── Timeline/
│   │   ├── Timeline.tsx
│   │   ├── TimelineControls.tsx
│   │   ├── TimelineGrid.tsx
│   │   ├── TrackList.tsx
│   │   └── Keyframe.tsx
│   ├── StatusBar/
│   │   └── StatusBar.tsx
│   ├── UI/
│   │   ├── ContextMenu.tsx
│   │   ├── Notification.tsx
│   │   └── ProgressBar.tsx
│   └── hooks/
│       ├── useThreeScene.ts
│       ├── useSceneManager.ts
│       ├── useAppState.ts
│       ├── useAnimation.ts
│       ├── useSculpting.ts
│       └── useKeyboardShortcuts.ts
└── utils/
    ├── SceneManager.ts
    ├── AppState.ts
    ├── AnimationManager.ts
    ├── SculptingEngine.ts
    ├── BooleanOperations.ts
    └── FileManager.ts
```

## Implementation Phases

### Phase 1: Core Setup & Layout (Priority 1)
1. Create main Builder page
2. Implement basic layout (Header, Sidebars, Viewport, Timeline, StatusBar)
3. Add collapsible panel functionality
4. Setup Three.js canvas integration

### Phase 2: 3D Scene Foundation (Priority 1)
1. Initialize Three.js scene, camera, renderer
2. Add OrbitControls
3. Implement grid and axes helpers
4. Basic object creation (primitives)
5. Object selection system

### Phase 3: Transform Tools (Priority 1)
1. Select, Move, Rotate, Scale tools
2. TransformControls integration
3. Snap to grid
4. Axis constraints
5. Properties panel updates

### Phase 4: Material & Rendering (Priority 2)
1. Material panel UI
2. Color picker
3. Metallic/Roughness controls
4. Texture loading
5. View mode switching

### Phase 5: Sculpting System (Priority 2)
1. Sculpt panel UI
2. Brush controls
3. Sculpting engine
4. Symmetry modes
5. Sculpt undo/redo

### Phase 6: Animation System (Priority 2)
1. Timeline UI
2. Keyframe system
3. Animation playback
4. Interpolation
5. Timeline controls

### Phase 7: Advanced Features (Priority 3)
1. Boolean operations
2. Extrude/Bevel
3. Scene hierarchy
4. Grouping/Ungrouping
5. Layers

### Phase 8: File Operations (Priority 3)
1. Import/Export GLTF
2. Save/Load project
3. Scene serialization

### Phase 9: Polish & Optimization (Priority 3)
1. Keyboard shortcuts
2. Context menu
3. Notifications
4. Performance optimization
5. Responsive design

## Color Scheme Integration
Use existing color scheme from Home.tsx and other pages:
- Primary: `#6e48ff` (purple-blue)
- Primary Dark: `#4a1eff`
- Secondary: `#9d50ff`
- Accent: `#4776ff`
- Backgrounds: `#0a0a0a`, `#111111`, `#1a1a1a`
- Glass effects with backdrop-filter
- Neon glows and gradients

## Key Technical Considerations

### Three.js Integration
- Use React Three Fiber OR vanilla Three.js with refs
- **Decision: Use vanilla Three.js** (easier to port existing code)
- Manage Three.js lifecycle in useEffect hooks
- Proper cleanup on unmount

### State Management
- Use React Context for global app state
- Local state for UI components
- Consider Zustand for complex state management

### Performance
- Optimize re-renders with React.memo
- Use useCallback/useMemo appropriately
- Efficient Three.js scene updates
- RequestAnimationFrame for animations

### TypeScript
- Strong typing for all components
- Type definitions for Three.js objects
- Interface definitions for app state

## Dependencies to Install
```bash
npm install three @types/three
npm install @react-three/fiber @react-three/drei (optional)
```

## File Naming Convention
- Components: PascalCase (e.g., `BuilderHeader.tsx`)
- Hooks: camelCase with 'use' prefix (e.g., `useThreeScene.ts`)
- Utils: PascalCase (e.g., `SceneManager.ts`)
- Types: PascalCase with `.types.ts` suffix

## Next Steps
1. Create base Builder page structure
2. Implement layout components
3. Setup Three.js canvas
4. Build out features phase by phase
5. Test and optimize
