# Mouse Interaction Fix

## Problem
The user reported that neither the top bar buttons nor the sidebar buttons were working, and objects couldn't be moved or interacted with in the 3D viewport.

## Root Cause
The `SceneManager` class was missing mouse event listeners on the canvas element. Without these listeners:
- Objects couldn't be selected by clicking
- Transform controls couldn't be activated
- No interaction was possible with the 3D scene

## Solution Implemented

### 1. Added Mouse Event Listeners
**File:** `frontend/src/utils/SceneManager.ts`

Added two event listeners in the constructor:
```typescript
// Handle mouse events for object selection
this.canvas.addEventListener('click', this.handleCanvasClick.bind(this));
this.canvas.addEventListener('dblclick', this.handleCanvasDoubleClick.bind(this));
```

### 2. Implemented Click Handler
```typescript
handleCanvasClick(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const clickedObject = this.getIntersectedObject(x, y);
    
    if (clickedObject && clickedObject.userData && typeof clickedObject.userData.id === 'number') {
        this.selectObject(clickedObject.userData.id);
    } else {
        this.clearSelection();
    }
}
```

**How it works:**
1. Gets mouse position relative to canvas
2. Uses raycasting (`getIntersectedObject`) to find clicked object
3. Extracts object ID from `userData`
4. Calls `selectObject` with the ID
5. If no object clicked, clears selection

### 3. Implemented Double-Click Handler
```typescript
handleCanvasDoubleClick(_event: MouseEvent): void {
    // Double click could be used for special actions like entering edit mode
    console.log('Double click detected');
}
```

Currently logs to console, can be extended for future features like:
- Entering edit mode
- Focusing camera on object
- Opening properties panel

### 4. Added Cleanup
Updated the `dispose()` method to remove event listeners:
```typescript
dispose(): void {
    window.removeEventListener('resize', this.handleResize.bind(this));
    this.canvas.removeEventListener('click', this.handleCanvasClick.bind(this));
    this.canvas.removeEventListener('dblclick', this.handleCanvasDoubleClick.bind(this));
    // ... rest of cleanup
}
```

## How It Works Now

### Object Selection Flow:
1. **User clicks on canvas**
2. **handleCanvasClick** fires
3. **Raycasting** determines which object (if any) was clicked
4. **Object ID** extracted from `userData.id`
5. **selectObject** called with ID
6. **Transform controls** attach to selected object
7. **Selection box** appears around object
8. **User can now transform** the object using the gizmo

### Transform Workflow:
1. Click object to select it
2. Click transform button (Move/Rotate/Scale) in Edit panel
3. Transform mode changes
4. Drag the gizmo handles to transform
5. Click elsewhere to deselect

## Testing

### To test object selection:
1. Navigate to `/builder`
2. Create a mesh (Create tab → Cube)
3. Click on the cube in the viewport
4. You should see:
   - Selection box around the cube
   - Transform gizmo attached
   - Console log (if dev tools open)

### To test transforms:
1. Select an object (click it)
2. Go to Edit tab
3. Click "Move" button
4. Drag the arrows on the gizmo
5. Click "Rotate" button
6. Drag the rotation circles
7. Click "Scale" button
8. Drag the scale handles

## Related Files Modified
- `frontend/src/utils/SceneManager.ts` - Added mouse event handling

## Future Enhancements
- Multi-select (Shift+Click)
- Box select (Click and drag)
- Context menu on right-click
- Hover highlighting
- Double-click to focus camera
- Touch/mobile support

## Notes
- The raycasting uses the existing `getIntersectedObject` method
- Object IDs are stored in `userData.id` when meshes are created
- The `selectObject` method expects a numeric ID, not the object itself
- Event listeners are properly cleaned up in `dispose()`
