import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { SceneManager } from '../utils/SceneManager';
import { AppState } from '../utils/AppState';
import {
    useAppStore,
    useActiveTool,
    useViewMode,
    useActiveTab,
    useSelectedObjectIds,
    useSceneObjects,
    useIsLeftPanelCollapsed
} from '../store/useAppStore';
import { useScenePersistence } from '../hooks/useScenePersistence';
import type { Tool, ViewMode, CameraView, NotificationType } from '../types/builder.types';
import { CreatePanel } from '../components/builder/sidebar/CreatePanel';
import { EditPanel } from '../components/builder/sidebar/EditPanel';
import { SculptPanel } from '../components/builder/sidebar/SculptPanel';
import { ShadingPanel } from '../components/builder/sidebar/ShadingPanel';
import { AnimPanel } from '../components/builder/sidebar/AnimPanel';
import { PhysicsPanel } from '../components/builder/sidebar/PhysicsPanel';
import { ScenePanel } from '../components/builder/sidebar/ScenePanel';
import { WorldPanel } from '../components/builder/sidebar/WorldPanel';
import { RenderPanel } from '../components/builder/sidebar/RenderPanel';
import { LogicPanel } from '../components/builder/sidebar/LogicPanel';
import { PropertiesPanel } from '../components/builder/sidebar/PropertiesPanel';

const Builder: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sceneManagerRef = useRef<SceneManager | null>(null);
    const appStateRef = useRef<AppState | null>(null);
    const animationFrameRef = useRef<number>(0);
    const statsUpdateRef = useRef<number>(0);

    // Optimized Zustand Selectors - only re-render when these specific values change
    const activeTab = useActiveTab();
    const selectedObjectIds = useSelectedObjectIds();
    const sceneObjects = useSceneObjects();
    const activeTool = useActiveTool();
    const viewMode = useViewMode();
    const isLeftPanelCollapsed = useIsLeftPanelCollapsed();

    // Computed values with useMemo
    const objectCount = useMemo(() => sceneObjects.length, [sceneObjects.length]);
    const getObject = useCallback((id: number) => sceneObjects.find(o => o.id === id), [sceneObjects]);

    // Stats (Managed locally to avoid store overhead on every frame, updated throttled)
    const [_stats, setStats] = useState({ triangles: 0, vertices: 0, fps: 0 });
    const [_statusMessage, setStatusMessage] = useState('Ready');
    const [notification, setNotification] = useState<{ type: NotificationType; message: string } | null>(null);
    const [editMode, setEditMode] = useState<'object' | 'vertex' | 'edge' | 'face'>('object');

    // Auto-save hook
    useScenePersistence(sceneManagerRef);

    // Actions - Get from store state, won't cause re-renders
    const {
        setActiveTab,
        setTool,
        setViewMode: setStoreViewMode,
        toggleLeftPanel,
        addObject: addStoreObject
    } = useAppStore.getState();

    // Initialize Three.js scene
    useEffect(() => {
        if (!canvasRef.current) return;

        const sceneManager = new SceneManager(canvasRef.current);
        const appState = new AppState();
        appState.sceneManager = sceneManager;

        // Handle object transforms from SceneManager
        sceneManager.onObjectTransform = (id, position, rotation, scale) => {
            appState.updateObjectTransform(id, position, rotation, scale);
        };

        // Handle selection sync
        sceneManager.onObjectSelected = (id) => {
            if (id !== null) {
                // We use the store's selectObject action.
                // Note: The store action might toggle. Ideally we force select.
                // Assuming standard behavior is sufficient for now.
                useAppStore.getState().selectObject(id);
            } else {
                // If id is null (deselected), we should clear store selection if possible.
                // Implementation detail: If store has clearSelection, use it.
                // Otherwise pass dummy or handle manually.
                // For now, if SceneManager keeps selection (background click ignored), this happens rarely (only delete).
                // Actually removeObject calls this with null.
            }
        };

        sceneManagerRef.current = sceneManager;
        appStateRef.current = appState;

        // Handle canvas resize automatically
        const resizeObserver = new ResizeObserver(() => {
            sceneManager.handleResize();
        });

        if (canvasRef.current.parentElement) {
            resizeObserver.observe(canvasRef.current.parentElement);
        }

        // Animation loop
        const animate = (time: number) => {
            if (!sceneManagerRef.current) return;

            sceneManager.render();
            appState.updateAnimation();
            appState.updatePerformance();

            // Throttle stats updates to ~2 times per second to prevent React rendering bottlenecks
            if (time - statsUpdateRef.current > 500) {
                setStats({
                    triangles: sceneManager.stats.triangles,
                    vertices: sceneManager.stats.vertices,
                    fps: appState.performance.fps
                });
                statsUpdateRef.current = time;
            }

            animationFrameRef.current = requestAnimationFrame(animate);
        };


        animationFrameRef.current = requestAnimationFrame(animate);

        // Expose to window for debugging
        (window as any).sceneManager = sceneManager;
        (window as any).appState = appState;
        console.log('🔧 Debug: SceneManager and AppState exposed to window');
        console.log('🔧 Try: window.sceneManager or window.appState in console');

        // Cleanup
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            resizeObserver.disconnect();
            sceneManager.dispose();
        };
    }, []);

    // Sync Zustand active tool with SceneManager
    useEffect(() => {
        if (sceneManagerRef.current) {
            const tool = useAppStore.getState().activeTool;
            switch (tool) {
                case 'move':
                    sceneManagerRef.current.setTransformMode('translate');
                    break;
                case 'rotate':
                    sceneManagerRef.current.setTransformMode('rotate');
                    break;
                case 'scale':
                    sceneManagerRef.current.setTransformMode('scale');
                    break;
            }
        }
    }, [activeTool]);

    // Sync Zustand view mode with SceneManager
    useEffect(() => {
        if (sceneManagerRef.current) {
            sceneManagerRef.current.setViewMode(useAppStore.getState().viewMode);
        }
    }, [viewMode]);

    // Handle object creation
    const handleCreateShape = (shape: string) => {
        console.log('handleCreateShape called with:', shape);

        if (!appStateRef.current || !sceneManagerRef.current) {
            console.error('AppState or SceneManager not initialized');
            return;
        }

        const obj = {
            id: 0,
            type: shape as any,
            name: `${shape}_${appStateRef.current.lastObjectId + 1}`,
            userData: {}
        };

        console.log('Creating object:', obj);

        const addedObj = appStateRef.current.addObject(obj);
        console.log('Object added to AppState:', addedObj);

        const threeObj = sceneManagerRef.current.addObject(addedObj);
        console.log('Object added to SceneManager:', threeObj);

        // Update store
        addStoreObject(obj);

        showNotification('success', `${shape} created successfully`);
        setStatusMessage(`Created ${shape}`);
    };

    // Handle tool change
    const handleToolChange = (tool: Tool) => {
        setTool(tool); // Update Zustand
        // SceneManager update handled by effect
    };

    // Handle view mode change
    const handleViewModeChange = (mode: ViewMode) => {
        setStoreViewMode(mode); // Update Zustand
        // SceneManager update handled by effect
    };

    // Handle camera view change
    const handleCameraViewChange = (view: CameraView) => {
        if (sceneManagerRef.current) {
            sceneManagerRef.current.setCameraView(view);
        }
    };

    // Handle delete selected objects
    const handleDeleteSelected = useCallback(() => {
        if (!sceneManagerRef.current || selectedObjectIds.length === 0) {
            showNotification('warning', 'No objects selected to delete');
            return;
        }

        const count = selectedObjectIds.length;

        // Delete from all storage locations
        selectedObjectIds.forEach(id => {
            // 1. Remove from SceneManager (Three.js scene and Map)
            sceneManagerRef.current?.removeObject(id);

            // 2. Remove from Zustand store
            useAppStore.getState().removeObject(id);

            // 3. Remove from AppState
            appStateRef.current?.removeObject(id);
        });

        // Backend will auto-sync via useScenePersistence hook
        showNotification('success', `Deleted ${count} object(s)`);
        setStatusMessage(`Deleted ${count} object(s)`);
    }, [selectedObjectIds]);

    // Show notification
    const showNotification = (type: NotificationType, message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    // Handle undo/redo
    const handleUndo = () => {
        if (appStateRef.current && appStateRef.current.undo()) {
            showNotification('info', 'Undo successful');
        }
    };

    const handleRedo = () => {
        if (appStateRef.current && appStateRef.current.redo()) {
            showNotification('info', 'Redo successful');
        }
    };

    // Handle transform actions
    const handleTransformAction = (action: string) => {
        if (!sceneManagerRef.current) return;

        switch (action) {
            case 'move':
                setTool('move');
                showNotification('info', 'Move mode activated');
                break;
            case 'rotate':
                setTool('rotate');
                showNotification('info', 'Rotate mode activated');
                break;
            case 'scale':
                setTool('scale');
                showNotification('info', 'Scale mode activated');
                break;
            case 'transform':
                // Reset transform
                sceneManagerRef.current.resetSelectedObjectTransform();
                showNotification('success', 'Transform reset');
                break;

            default:
                // Handle extended edit actions
                if ((sceneManagerRef.current as any).applyEditAction) {
                    (sceneManagerRef.current as any).applyEditAction(action);
                    showNotification('info', `Action: ${action.replace('_', ' ')}`);
                } else {
                    showNotification('info', `${action} (coming soon)`);
                }
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    return (
        <div className="h-screen flex flex-col bg-black text-white">
            {/* Header */}
            <header className="h-16 glass-nav border-b border-white/10 flex items-center px-6 relative z-50">
                <div className="text-2xl font-black mr-8 font-serif text-richred">
                    Ininsico Builder
                </div>

                <nav className="flex space-x-1">
                    {/* File Menu */}
                    <div className="menu-item relative group">
                        <div className="px-3 py-1.5 rounded-md cursor-pointer hover:bg-white/10 transition-all">
                            <span className="text-xs font-medium text-slate-300 group-hover:text-white">File</span>
                        </div>
                        <div className="submenu absolute top-full left-0 mt-1 min-w-[200px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 glass-panel shadow-2xl border border-white/10 z-50">
                            <div className="submenu-item px-4 py-2 text-xs cursor-pointer rounded-t-lg hover:bg-richred hover:text-white transition-colors flex items-center">
                                <i className="fas fa-plus w-5"></i>New Project
                            </div>
                            <div className="submenu-item px-4 py-2 text-xs cursor-pointer hover:bg-richred hover:text-white transition-colors flex items-center">
                                <i className="fas fa-folder-open w-5"></i>Open...
                            </div>
                            <div className="h-px bg-white/10 mx-2 my-1"></div>
                            <div className="submenu-item px-4 py-2 text-xs cursor-pointer hover:bg-richred hover:text-white transition-colors flex items-center">
                                <i className="fas fa-download w-5"></i>Import
                            </div>
                            <div className="submenu-item px-4 py-2 text-xs cursor-pointer rounded-b-lg hover:bg-richred hover:text-white transition-colors flex items-center">
                                <i className="fas fa-upload w-5"></i>Export
                            </div>
                        </div>
                    </div>

                    {/* Edit Menu */}
                    <div className="menu-item relative group">
                        <div className="px-3 py-1.5 rounded-md cursor-pointer hover:bg-white/10 transition-all">
                            <span className="text-xs font-medium text-slate-300 group-hover:text-white">Edit</span>
                        </div>
                        <div className="submenu absolute top-full left-0 mt-1 min-w-[200px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 glass-panel shadow-2xl border border-white/10 z-50">
                            <div className="submenu-item px-4 py-2 text-xs cursor-pointer rounded-t-lg hover:bg-richred hover:text-white transition-colors flex items-center" onClick={handleUndo}>
                                <i className="fas fa-undo w-5"></i>Undo <span className="ml-auto opacity-50 text-[10px]">Ctrl+Z</span>
                            </div>
                            <div className="submenu-item px-4 py-2 text-xs cursor-pointer hover:bg-richred hover:text-white transition-colors flex items-center" onClick={handleRedo}>
                                <i className="fas fa-redo w-5"></i>Redo <span className="ml-auto opacity-50 text-[10px]">Ctrl+Shift+Z</span>
                            </div>
                            <div className="h-px bg-white/10 mx-2 my-1"></div>
                            <div className="submenu-item px-4 py-2 text-xs cursor-pointer hover:bg-richred hover:text-white transition-colors flex items-center">
                                <i className="fas fa-cog w-5"></i>Preferences
                            </div>
                        </div>
                    </div>

                    {/* Render Menu */}
                    <div className="menu-item relative group">
                        <div className="px-3 py-1.5 rounded-md cursor-pointer hover:bg-white/10 transition-all">
                            <span className="text-xs font-medium text-slate-300 group-hover:text-white">Render</span>
                        </div>
                        <div className="submenu absolute top-full left-0 mt-1 min-w-[200px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 glass-panel shadow-2xl border border-white/10 z-50">
                            <div className="submenu-item px-4 py-2 text-xs cursor-pointer rounded-t-lg hover:bg-richred hover:text-white transition-colors flex items-center">
                                <i className="fas fa-image w-5"></i>Render Image <span className="ml-auto opacity-50 text-[10px]">F12</span>
                            </div>
                            <div className="submenu-item px-4 py-2 text-xs cursor-pointer hover:bg-richred hover:text-white transition-colors flex items-center">
                                <i className="fas fa-film w-5"></i>Render Animation <span className="ml-auto opacity-50 text-[10px]">Ctrl+F12</span>
                            </div>
                            <div className="h-px bg-white/10 mx-2 my-1"></div>
                            <div className="submenu-item px-4 py-2 text-xs cursor-pointer rounded-b-lg hover:bg-richred hover:text-white transition-colors flex items-center">
                                <i className="fas fa-eye w-5"></i>View Render
                            </div>
                        </div>
                    </div>

                    {/* Window Menu */}
                    <div className="menu-item relative group">
                        <div className="px-3 py-1.5 rounded-md cursor-pointer hover:bg-white/10 transition-all">
                            <span className="text-xs font-medium text-slate-300 group-hover:text-white">Window</span>
                        </div>
                        <div className="submenu absolute top-full left-0 mt-1 min-w-[200px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 glass-panel shadow-2xl border border-white/10 z-50">
                            <div className="submenu-item px-4 py-2 text-xs cursor-pointer rounded-t-lg hover:bg-richred hover:text-white transition-colors flex items-center">
                                <i className="fas fa-window-maximize w-5"></i>New Window
                            </div>
                            <div className="submenu-item px-4 py-2 text-xs cursor-pointer hover:bg-richred hover:text-white transition-colors flex items-center" onClick={toggleFullscreen}>
                                <i className="fas fa-expand w-5"></i>Toggle Fullscreen
                            </div>
                        </div>
                    </div>

                    {/* Help Menu */}
                    <div className="menu-item relative group">
                        <div className="px-3 py-1.5 rounded-md cursor-pointer hover:bg-white/10 transition-all">
                            <span className="text-xs font-medium text-slate-300 group-hover:text-white">Help</span>
                        </div>
                        <div className="submenu absolute top-full left-0 mt-1 min-w-[200px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 glass-panel shadow-2xl border border-white/10 z-50">
                            <div className="submenu-item px-4 py-2 text-xs cursor-pointer rounded-t-lg hover:bg-richred hover:text-white transition-colors flex items-center">
                                <i className="fas fa-book w-5"></i>Manual
                            </div>
                            <div className="submenu-item px-4 py-2 text-xs cursor-pointer hover:bg-richred hover:text-white transition-colors flex items-center">
                                <i className="fas fa-graduation-cap w-5"></i>Tutorials
                            </div>
                        </div>
                    </div>
                </nav>

                <div className="ml-auto flex items-center space-x-4">
                    {/* Delete Button - Only visible when object is selected */}
                    {selectedObjectIds.length > 0 && (
                        <button
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                            onClick={handleDeleteSelected}
                            title={`Delete ${selectedObjectIds.length} selected object(s)`}
                        >
                            <i className="fas fa-trash"></i>
                            Delete ({selectedObjectIds.length})
                        </button>
                    )}

                    <button className="bg-richred hover:bg-richred-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">
                        <i className="fas fa-cloud-upload-alt mr-2"></i>Export
                    </button>

                    <button
                        className="bg-white/10 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        onClick={toggleFullscreen}
                    >
                        <i className="fas fa-expand mr-2"></i>Fullscreen
                    </button>
                </div>
            </header>

            {/* Main Container */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Left Sidebar */}
                <div className="absolute left-0 top-0 h-full z-40 pointer-events-none">
                    {/* Toggle Button */}
                    <button
                        className="absolute -right-6 top-1/2 transform -translate-y-1/2 w-6 h-12 glass-panel border-y border-r border-white/10 rounded-r-lg flex items-center justify-center hover:bg-white/10 transition-colors z-50 text-white pointer-events-auto"
                        onClick={toggleLeftPanel}
                    >
                        <i className={`fas fa-chevron-${isLeftPanelCollapsed ? 'right' : 'left'} text-xs`}></i>
                    </button>

                    <aside className={`${isLeftPanelCollapsed ? 'w-[60px]' : 'w-[280px]'} h-full bg-black border-r border-white/20 transition-all duration-300 flex overflow-hidden pointer-events-auto`}>

                        {/* Vertical Navigation Rail */}
                        <div className="w-[60px] flex-shrink-0 border-r border-white/20 flex flex-col items-center py-6 gap-6 bg-black relative z-20">
                            {[
                                { id: 'create', icon: 'plus', label: 'Create' },
                                { id: 'edit', icon: 'cube', label: 'Edit' },
                                { id: 'sculpt', icon: 'paint-brush', label: 'Sculpt' },
                                { id: 'shading', icon: 'magic', label: 'Shading' },
                                { id: 'anim', icon: 'running', label: 'Anim' },
                                { id: 'physics', icon: 'atom', label: 'Physics' },
                                { id: 'scene', icon: 'layer-group', label: 'Scene' },
                                { id: 'world', icon: 'globe', label: 'World' },
                                { id: 'render', icon: 'camera', label: 'Render' },
                                { id: 'game', icon: 'gamepad', label: 'Logic' },
                                { id: 'properties', icon: 'sliders-h', label: 'Props' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative group ${activeTab === tab.id ? 'bg-white text-black shadow-lg shadow-white/20' : 'text-slate-500 hover:text-white'}`}
                                    onClick={() => setActiveTab(tab.id as any)}
                                >
                                    <i className={`fas fa-${tab.icon} text-lg`}></i>

                                    {/* Tooltip */}
                                    <div className="absolute left-full ml-4 px-2 py-1 bg-white text-black text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                        {tab.label}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto bg-black custom-scrollbar overflow-x-hidden">
                            <div className="h-full w-[220px]">
                                {/* Create Panel */}
                                {activeTab === 'create' && <CreatePanel onCreateShape={handleCreateShape} />}

                                {/* Edit Panel */}
                                {activeTab === 'edit' && (
                                    <EditPanel
                                        editMode={editMode}
                                        onEditModeChange={(mode) => {
                                            setEditMode(mode);
                                            if (sceneManagerRef.current) {
                                                sceneManagerRef.current.setEditMode(mode);
                                            }
                                        }}
                                        onTransformAction={handleTransformAction}
                                        selectedObject={selectedObjectIds.length === 1 ? getObject(selectedObjectIds[0]) : undefined}
                                        onPropertyChange={(id, prop, value) => {
                                            if (sceneManagerRef.current) {
                                                const mesh = sceneManagerRef.current.objects.get(id);
                                                if (mesh) {
                                                    const [key, axis] = prop.split('.');
                                                    if (axis && (key === 'position' || key === 'scale' || key === 'rotation')) {
                                                        // @ts-ignore
                                                        mesh[key][axis] = value;

                                                        // Also update pivot/selection box if selected
                                                        if (sceneManagerRef.current.selectedObject === mesh) {
                                                            sceneManagerRef.current.updateSelectionBox(mesh);
                                                        }
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                )}

                                {/* Shading Panel */}
                                {activeTab === 'shading' && <ShadingPanel />}

                                {/* Animation Panel */}
                                {activeTab === 'anim' && <AnimPanel />}

                                {/* Physics Panel */}
                                {activeTab === 'physics' && <PhysicsPanel />}

                                {/* Sculpt Panel */}
                                {activeTab === 'sculpt' && <SculptPanel />}

                                {/* Scene Panel */}
                                {activeTab === 'scene' && <ScenePanel />}

                                {/* World Panel */}
                                {activeTab === 'world' && <WorldPanel />}

                                {/* Render Panel */}
                                {activeTab === 'render' && <RenderPanel />}

                                {/* Game Logic Panel */}
                                {activeTab === 'game' && <LogicPanel />}

                                {/* Properties Panel */}
                                {activeTab === 'properties' && <PropertiesPanel />}
                            </div>
                        </div>
                    </aside>
                </div>

                {/* Main Viewport */}
                <main className="flex-1 flex flex-col">
                    {/* Toolbar */}
                    <div className="h-16 glass-panel border-b border-white/10 flex items-center justify-end px-6 space-x-2">
                        {/* Transform Tools */}
                        <div className="flex items-center space-x-1 pr-4 border-r border-white/10">
                            {[
                                { tool: 'select' as Tool, icon: 'mouse-pointer' },
                                { tool: 'move' as Tool, icon: 'arrows-alt' },
                                { tool: 'rotate' as Tool, icon: 'sync-alt' },
                                { tool: 'scale' as Tool, icon: 'expand-arrows-alt' }
                            ].map(({ tool, icon }) => (
                                <button
                                    key={tool}
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all ${activeTool === tool ? 'bg-richred text-white' : 'glass-panel hover:bg-white/10'}`}
                                    onClick={() => handleToolChange(tool)}
                                >
                                    <i className={`fas fa-${icon}`}></i>
                                </button>
                            ))}
                        </div>

                        {/* View Modes */}
                        <div className="flex items-center space-x-1 pr-4 border-r border-white/10">
                            {[
                                { mode: 'solid' as ViewMode, icon: 'cube' },
                                { mode: 'wireframe' as ViewMode, icon: 'project-diagram' },
                                { mode: 'material' as ViewMode, icon: 'palette' },
                                { mode: 'rendered' as ViewMode, icon: 'eye' }
                            ].map(({ mode, icon }) => (
                                <button
                                    key={mode}
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all ${viewMode === mode ? 'bg-richred text-white' : 'glass-panel hover:bg-white/10'}`}
                                    onClick={() => handleViewModeChange(mode)}
                                >
                                    <i className={`fas fa-${icon}`}></i>
                                </button>
                            ))}
                        </div>

                        {/* Camera Views */}
                        <div className="flex items-center space-x-1">
                            {[
                                { view: 'front' as CameraView, icon: 'arrow-up' },
                                { view: 'side' as CameraView, icon: 'arrow-right' },
                                { view: 'top' as CameraView, icon: 'arrow-down' },
                                { view: 'perspective' as CameraView, icon: 'cube' }
                            ].map(({ view, icon }) => (
                                <button
                                    key={view}
                                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg glass-panel hover:bg-white/10 transition-all"
                                    onClick={() => handleCameraViewChange(view)}
                                >
                                    <i className={`fas fa-${icon}`}></i>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 3D Viewport */}
                    <div className="flex-1 relative bg-white">
                        <canvas ref={canvasRef} className="w-full h-full"></canvas>

                        {/* Welcome Screen */}
                        {objectCount === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center">
                                    <div className="w-32 h-32 glass-panel rounded-full flex items-center justify-center mb-8 mx-auto">
                                        <i className="fas fa-cube text-4xl text-richred"></i>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4 text-black">Welcome to Ininsico Builder</h3>
                                    <p className="text-black mb-6 max-w-md">
                                        Start creating by adding objects from the left panel
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </main>


            </div>



            {/* Status Bar */}


            {/* Notification */}
            {notification && (
                <div className={`fixed bottom-20 right-6 glass-panel border-l-4 ${notification.type === 'success' ? 'border-green-500' :
                    notification.type === 'error' ? 'border-red-500' :
                        notification.type === 'warning' ? 'border-yellow-500' :
                            'border-blue-500'
                    } px-4 py-3 rounded-lg shadow-lg animate-fade-in z-50`}>
                    <div className="flex items-center">
                        <i className={`fas fa-${notification.type === 'success' ? 'check-circle text-green-500' :
                            notification.type === 'error' ? 'exclamation-circle text-red-500' :
                                notification.type === 'warning' ? 'exclamation-triangle text-yellow-500' :
                                    'info-circle text-blue-500'
                            } mr-2`}></i>
                        <span className="text-sm">{notification.message}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Builder;