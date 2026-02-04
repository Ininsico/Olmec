# Debugging Guide for Object Selection Issue

## Problem
User reports being unable to select objects in the 3D viewport to perform transformations.

## Debugging Steps

### Step 1: Open Browser Console
1. Open your browser (Chrome/Firefox/Edge)
2. Navigate to `http://localhost:5173/builder`
3. Press `F12` to open Developer Tools
4. Click on the "Console" tab

### Step 2: Test Object Creation
1. Click on the "Create" tab in the left sidebar
2. Click on "Cube" under the Mesh section
3. **Check the console** for these messages:
   ```
   handleCreateShape called with: cube
   Creating object: {id: 0, type: "cube", name: "cube_1", userData: {}}
   Object added to AppState: {id: 1, type: "cube", name: "cube_1", userData: {}}
   Object added to SceneManager: Mesh {geometry: BoxGeometry, material: MeshStandardMaterial, ...}
   ```

### Step 3: Test Object Selection
1. Click anywhere on the 3D canvas
2. **Check the console** for these messages:
   ```
   Canvas clicked
   Click position: {x: 123, y: 456}
   Clicked object: Mesh {...} OR null
   ```

### Step 4: Identify the Issue

#### If you see "handleCreateShape called" but no object appears:
- **Problem**: Object creation is failing
- **Check**: Look for errors in the console related to MeshFactory or geometry creation

#### If you see "Canvas clicked" but nothing else:
- **Problem**: Event listener is not properly attached
- **Solution**: Refresh the page (Ctrl+F5)

#### If you see "Clicked object: null" when clicking on a cube:
- **Problem**: Raycasting is not detecting the object
- **Possible causes**:
  - Object is not in the scene
  - Camera position is wrong
  - Object has no geometry

#### If you see "Clicked object: Mesh" but "No object clicked, clearing selection":
- **Problem**: Object doesn't have userData.id set
- **This is the most likely issue!**

### Step 5: Check Object Properties
If an object is created, click on it and then in the console type:
```javascript
// Get the scene manager
const canvas = document.querySelector('canvas');
console.log('Canvas:', canvas);

// Check if objects exist in the scene
// (You'll need to access this through React DevTools or add a global reference)
```

## Common Issues and Solutions

### Issue 1: Objects Created But Not Visible
**Symptoms:**
- Console shows object created
- Nothing appears in viewport

**Solutions:**
1. Check camera position (should be at 5, 5, 5)
2. Check object position (should be at 0, 0, 0)
3. Check if scene background is same color as object
4. Check if lights are working

### Issue 2: Objects Visible But Not Selectable
**Symptoms:**
- Objects appear in viewport
- Clicking does nothing
- Console shows "Clicked object: null"

**Solutions:**
1. Verify raycaster is working
2. Check if objects are in the `objects` Map
3. Verify object has proper geometry

### Issue 3: Objects Selectable But Transform Doesn't Work
**Symptoms:**
- Object gets selected (console shows ID)
- No transform gizmo appears
- Can't move/rotate/scale

**Solutions:**
1. Check if TransformControls are initialized
2. Verify transform mode is set correctly
3. Check if controls are added to scene

## Quick Fix Commands

If you have access to the browser console, try these:

### Check if SceneManager exists:
```javascript
// This won't work directly, but you can add a global reference in Builder.tsx
window.sceneManager = sceneManagerRef.current;
```

### Force select an object:
```javascript
// After adding global reference
window.sceneManager.selectObject(1);
```

### List all objects:
```javascript
window.sceneManager.objects.forEach((obj, id) => {
  console.log(`Object ${id}:`, obj);
});
```

## Expected Console Output (Working System)

When everything works correctly, you should see:

1. **On page load:**
   ```
   SceneManager initialized
   AppState initialized
   ```

2. **When creating a cube:**
   ```
   handleCreateShape called with: cube
   Creating object: {...}
   Object added to AppState: {id: 1, ...}
   Object added to SceneManager: Mesh {...}
   ```

3. **When clicking the cube:**
   ```
   Canvas clicked
   Click position: {x: 400, y: 300}
   Clicked object: Mesh {uuid: "...", userData: {id: 1}, ...}
   Selecting object with ID: 1
   ```

4. **When clicking empty space:**
   ```
   Canvas clicked
   Click position: {x: 100, y: 100}
   Clicked object: null
   No object clicked, clearing selection
   ```

## Next Steps

After checking the console:
1. **Take a screenshot** of the console output
2. **Note any error messages** (red text)
3. **Share the console logs** so we can identify the exact issue

## Temporary Workaround

If selection still doesn't work, you can manually test by adding this to Builder.tsx:

```typescript
// Add after sceneManager initialization
useEffect(() => {
    if (sceneManagerRef.current) {
        // Expose to window for debugging
        (window as any).sceneManager = sceneManagerRef.current;
        (window as any).appState = appStateRef.current;
        console.log('SceneManager and AppState exposed to window');
    }
}, []);
```

Then in console:
```javascript
// Create a cube manually
window.appState.addObject({id: 0, type: 'cube', name: 'test_cube'});
window.sceneManager.addObject({id: 1, type: 'cube', name: 'test_cube'});

// Select it manually
window.sceneManager.selectObject(1);
```
