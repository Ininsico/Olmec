import React, { useEffect, useRef, useState } from 'react';
import { SceneManager } from '../utils/SceneManager';
import { AppState } from '../utils/AppState';
import { useAppStore } from '../store/useAppStore';
import type { Tool, ViewMode, CameraView, NotificationType } from '../types/builder.types';

const Builder: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sceneManagerRef = useRef<SceneManager | null>(null);
    const appStateRef = useRef<AppState | null>(null);
    const animationFrameRef = useRef<number>(0);
    const statsUpdateRef = useRef<number>(0);

    // Zustand Store
    const activeTab = useAppStore((state) => state.activeTab);
    const activeTool = useAppStore((state) => state.activeTool);
    const viewMode = useAppStore((state) => state.viewMode);
    const isTimelineVisible = useAppStore((state) => state.isTimelineVisible);
    const isLeftPanelCollapsed = useAppStore((state) => state.isLeftPanelCollapsed);
    const objectCount = useAppStore((state) => state.sceneObjects.length);

    // Stats (Managed locally to avoid store overhead on every frame, updated throttled)
    const [stats, setStats] = useState({ triangles: 0, vertices: 0, fps: 0 });

    const [statusMessage, setStatusMessage] = useState('Ready');
    const [notification, setNotification] = useState<{ type: NotificationType; message: string } | null>(null);

    // Actions
    const {
        setActiveTab,
        setTool,
        setViewMode: setStoreViewMode,
        toggleTimeline,
        toggleLeftPanel,
        addObject: addStoreObject
    } = useAppStore.getState(); // Using getState() for actions to avoid re-renders if actions were to change (they don't usually)

    // Initialize Three.js scene
    useEffect(() => {
        if (!canvasRef.current) return;

        const sceneManager = new SceneManager(canvasRef.current);
        const appState = new AppState();
        appState.sceneManager = sceneManager;

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
        if (!appStateRef.current || !sceneManagerRef.current) return;

        const obj = {
            id: 0,
            type: shape as any,
            name: `${shape}_${appStateRef.current.lastObjectId + 1}`,
            userData: {}
        };

        const addedObj = appStateRef.current.addObject(obj);
        sceneManagerRef.current.addObject(addedObj);

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
                        <div className="px-4 py-2 rounded-lg cursor-pointer bg-white/5 border border-white/10 hover:bg-white/20 transition-all">
                            <span className="text-sm font-medium">File</span>
                        </div>
                        <div className="submenu absolute top-full left-0 mt-2 min-w-[200px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 glass-panel shadow-lg">
                            <div className="submenu-item px-4 py-3 text-sm cursor-pointer rounded-t-lg hover:bg-white/10">
                                <i className="fas fa-plus w-4 mr-3"></i>New Project
                            </div>
                            <div className="submenu-item px-4 py-3 text-sm cursor-pointer hover:bg-white/10">
                                <i className="fas fa-folder-open w-4 mr-3"></i>Open...
                            </div>
                            <div className="h-px bg-white/20 mx-2"></div>
                            <div className="submenu-item px-4 py-3 text-sm cursor-pointer hover:bg-white/10">
                                <i className="fas fa-download w-4 mr-3"></i>Import
                            </div>
                            <div className="submenu-item px-4 py-3 text-sm cursor-pointer rounded-b-lg hover:bg-white/10">
                                <i className="fas fa-upload w-4 mr-3"></i>Export
                            </div>
                        </div>
                    </div>

                    {/* Edit Menu */}
                    <div className="menu-item relative group">
                        <div className="px-4 py-2 rounded-lg cursor-pointer bg-white/5 border border-white/10 hover:bg-white/20 transition-all">
                            <span className="text-sm font-medium">Edit</span>
                        </div>
                        <div className="submenu absolute top-full left-0 mt-2 min-w-[200px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 glass-panel shadow-lg">
                            <div className="submenu-item px-4 py-3 text-sm cursor-pointer rounded-t-lg hover:bg-white/10" onClick={handleUndo}>
                                <i className="fas fa-undo w-4 mr-3"></i>Undo
                            </div>
                            <div className="submenu-item px-4 py-3 text-sm cursor-pointer hover:bg-white/10" onClick={handleRedo}>
                                <i className="fas fa-redo w-4 mr-3"></i>Redo
                            </div>
                            <div className="h-px bg-white/20 mx-2"></div>
                            <div className="submenu-item px-4 py-3 text-sm cursor-pointer hover:bg-white/10">
                                <i className="fas fa-clone w-4 mr-3"></i>Duplicate
                            </div>
                            <div className="submenu-item px-4 py-3 text-sm cursor-pointer rounded-b-lg hover:bg-white/10">
                                <i className="fas fa-trash w-4 mr-3"></i>Delete
                            </div>
                        </div>
                    </div>
                </nav>

                <div className="ml-auto flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-richred rounded-full animate-pulse"></div>
                        <span className="text-sm text-slate-400 font-mono">ONLINE</span>
                    </div>
                    <button className="bg-richred hover:bg-richred-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">
                        <i className="fas fa-cloud-upload-alt mr-2"></i>Export
                    </button>
                    <button
                        className="bg-white/10 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        onClick={toggleTimeline}
                    >
                        <i className="fas fa-film mr-2"></i>Timeline
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
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar */}
                <div className="relative h-full">
                    {/* Toggle Button */}
                    <button
                        className="absolute -right-6 top-1/2 transform -translate-y-1/2 w-6 h-12 glass-panel border-y border-r border-white/10 rounded-r-lg flex items-center justify-center hover:bg-white/10 transition-colors z-50 text-white"
                        onClick={toggleLeftPanel}
                    >
                        <i className={`fas fa-chevron-${isLeftPanelCollapsed ? 'right' : 'left'} text-xs`}></i>
                    </button>

                    <aside className={`${isLeftPanelCollapsed ? 'w-[60px]' : 'w-[280px]'} h-full glass-panel border-r border-white/10 transition-all duration-300 flex overflow-hidden`}>

                        {/* Vertical Navigation Rail */}
                        <div className="w-[60px] flex-shrink-0 border-r border-white/10 flex flex-col items-center py-6 gap-6 bg-white/5 relative z-20">
                            {[
                                { id: 'create', icon: 'plus', label: 'Create' },
                                { id: 'sculpt', icon: 'paint-brush', label: 'Sculpt' },
                                { id: 'scene', icon: 'layer-group', label: 'Scene' },
                                { id: 'properties', icon: 'sliders-h', label: 'Props' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative group ${activeTab === tab.id ? 'bg-richred text-white shadow-lg shadow-richred/20' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}
                                    onClick={() => setActiveTab(tab.id as any)}
                                >
                                    <i className={`fas fa-${tab.icon} text-lg`}></i>

                                    {/* Tooltip */}
                                    <div className="absolute left-full ml-4 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10 z-50">
                                        {tab.label}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto bg-black/20 custom-scrollbar overflow-x-hidden">
                            <div className="h-full w-[220px]">
                                {/* Create Panel */}
                                {activeTab === 'create' && (
                                    <div className="p-5">
                                        <div className="mb-6">
                                            <h3 className="font-bold text-lg text-white mb-1">Create</h3>
                                            <p className="text-xs text-slate-500">Add objects to your scene</p>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Primitives</h4>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {['box', 'sphere', 'cylinder', 'cone', 'torus', 'plane'].map((shape) => (
                                                        <div
                                                            key={shape}
                                                            className="glass-panel border border-white/5 rounded-xl p-3 cursor-pointer flex flex-col items-center gap-2 hover:bg-white/10 hover:border-white/20 transition-all group"
                                                            onClick={() => handleCreateShape(shape)}
                                                        >
                                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform text-white/70 group-hover:text-richred">
                                                                <i className={`fas fa-${shape === 'box' ? 'cube' : shape === 'sphere' ? 'globe' : shape === 'cylinder' ? 'database' : shape === 'cone' ? 'concierge-bell' : shape === 'torus' ? 'ring' : 'square'}`}></i>
                                                            </div>
                                                            <span className="text-[10px] font-medium text-slate-300 capitalize group-hover:text-white">{shape}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Sculpt Panel */}
                                {activeTab === 'sculpt' && (
                                    <div className="p-5">
                                        <div className="mb-6">
                                            <h3 className="font-bold text-lg text-white mb-1">Sculpt</h3>
                                            <p className="text-xs text-slate-500">Mold your meshes</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { tool: 'draw', icon: 'paint-brush' },
                                                { tool: 'smooth', icon: 'brush' },
                                                { tool: 'flatten', icon: 'ruler-combined' },
                                                { tool: 'inflate', icon: 'expand' },
                                                { tool: 'pinch', icon: 'hand-paper' },
                                                { tool: 'grab', icon: 'hand-rock' },
                                                { tool: 'crevice', icon: 'mountain' },
                                                { tool: 'mask', icon: 'mask' }
                                            ].map(({ tool, icon }) => (
                                                <div
                                                    key={tool}
                                                    className="glass-panel border border-white/5 rounded-xl p-3 cursor-pointer flex flex-col items-center gap-2 hover:bg-white/10 hover:border-white/20 transition-all group"
                                                >
                                                    <i className={`fas fa-${icon} text-lg text-slate-400 group-hover:text-richred transition-colors`}></i>
                                                    <span className="text-[10px] capitalize text-slate-400 group-hover:text-white">{tool}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Scene Panel */}
                                {activeTab === 'scene' && (
                                    <div className="p-5">
                                        <div className="mb-6">
                                            <h3 className="font-bold text-lg text-white mb-1">Outliner</h3>
                                            <p className="text-xs text-slate-500">Scene hierarchy</p>
                                        </div>

                                        {objectCount === 0 ? (
                                            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/5 rounded-xl">
                                                <i className="fas fa-layer-group text-2xl text-slate-600 mb-2"></i>
                                                <span className="text-xs text-slate-500">Empty Scene</span>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                {/* Placeholder for object list */}
                                                <div className="text-xs text-slate-500 italic">Objects list (Coming soon)</div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Properties Panel */}
                                {activeTab === 'properties' && (
                                    <div className="p-5">
                                        <div className="mb-6">
                                            <h3 className="font-bold text-lg text-white mb-1">Properties</h3>
                                            <p className="text-xs text-slate-500">Object settings</p>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Transform */}
                                            <div className="space-y-3">
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                                                    Transform
                                                    <i className="fas fa-arrows-alt text-[10px]"></i>
                                                </h4>
                                                <div className="space-y-2">
                                                    {['Location', 'Rotation', 'Scale'].map((label, i) => (
                                                        <div key={label} className="grid grid-cols-4 gap-2 items-center">
                                                            <span className="text-[10px] text-slate-500">{label.substring(0, 3)}</span>
                                                            {['x', 'y', 'z'].map((axis, j) => (
                                                                <input
                                                                    key={axis}
                                                                    type="number"
                                                                    className={`w-full bg-black/40 border-b-2 ${j === 0 ? 'border-red-500/50' : j === 1 ? 'border-green-500/50' : 'border-blue-500/50'} rounded-t-sm px-1 py-1 text-[10px] text-white font-mono focus:outline-none focus:bg-white/10 transition-colors`}
                                                                    placeholder="0"
                                                                    defaultValue={label === 'Scale' ? "1" : "0"}
                                                                />
                                                            ))}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="h-px bg-white/10"></div>

                                            {/* Material */}
                                            <div className="space-y-3">
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                                                    Material
                                                    <i className="fas fa-palette text-[10px]"></i>
                                                </h4>

                                                <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5">
                                                    <span className="text-xs text-slate-300">Base Color</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-mono text-slate-500">#808080</span>
                                                        <input type="color" className="w-6 h-6 rounded overflow-hidden cursor-pointer border-none" defaultValue="#808080" />
                                                    </div>
                                                </div>

                                                <div className="space-y-3 pt-2">
                                                    {[
                                                        { label: 'Roughness', val: 0.5 },
                                                        { label: 'Metallic', val: 0.0 }
                                                    ].map(slider => (
                                                        <div key={slider.label}>
                                                            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                                                <span>{slider.label}</span>
                                                                <span className="font-mono">{slider.val.toFixed(2)}</span>
                                                            </div>
                                                            <input type="range" min="0" max="1" step="0.01" defaultValue={slider.val} className="w-full h-1 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-richred" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>

                {/* Main Viewport */}
                <main className="flex-1 flex flex-col">
                    {/* Toolbar */}
                    <div className="h-16 glass-panel border-b border-white/10 flex items-center px-6 space-x-2">
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

            {/* Timeline Panel */}
            {isTimelineVisible && (
                <div className="h-48 glass-panel border-t border-white/10 flex flex-col">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                        <div className="flex items-center">
                            <i className="fas fa-film mr-2 text-richred"></i>
                            <h3 className="font-semibold">Animation Timeline</h3>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button className="glass-panel px-2 py-1 rounded text-sm hover:bg-white/10">
                                <i className="fas fa-play"></i>
                            </button>
                            <button className="glass-panel px-2 py-1 rounded text-sm hover:bg-white/10">
                                <i className="fas fa-pause"></i>
                            </button>
                            <button className="glass-panel px-2 py-1 rounded text-sm hover:bg-white/10">
                                <i className="fas fa-stop"></i>
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 p-4">
                        <div className="text-center text-slate-400 text-sm">
                            <i className="fas fa-clock text-2xl mb-2 block"></i>
                            No animation tracks
                        </div>
                    </div>
                </div>
            )}

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