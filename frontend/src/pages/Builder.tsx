import React, { useEffect, useRef, useState } from 'react';
import { SceneManager } from '../utils/SceneManager';
import { AppState } from '../utils/AppState';
import type { Tool, ViewMode, CameraView, TabType, NotificationType } from '../types/builder.types';

const Builder: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sceneManagerRef = useRef<SceneManager | null>(null);
    const appStateRef = useRef<AppState | null>(null);
    const animationFrameRef = useRef<number>(0);

    // UI State
    const [activeTab, setActiveTab] = useState<TabType>('create');
    const [activeTool, setActiveTool] = useState<Tool>('select');
    const [viewMode, setViewMode] = useState<ViewMode>('solid');
    const [isTimelineVisible, setIsTimelineVisible] = useState(false);
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
    const [objectCount, setObjectCount] = useState(0);
    const [triangleCount, setTriangleCount] = useState(0);
    const [vertexCount, setVertexCount] = useState(0);
    const [fps, setFps] = useState(60);
    const [statusMessage, setStatusMessage] = useState('Ready');
    const [notification, setNotification] = useState<{ type: NotificationType; message: string } | null>(null);

    // Initialize Three.js scene
    useEffect(() => {
        if (!canvasRef.current) return;

        const sceneManager = new SceneManager(canvasRef.current);
        const appState = new AppState();
        appState.sceneManager = sceneManager;

        sceneManagerRef.current = sceneManager;
        appStateRef.current = appState;

        // Animation loop
        const animate = () => {
            sceneManager.render();
            appState.updateAnimation();
            appState.updatePerformance();

            // Update UI stats
            setObjectCount(appState.sceneObjects.length);
            setTriangleCount(sceneManager.stats.triangles);
            setVertexCount(sceneManager.stats.vertices);
            setFps(appState.performance.fps);

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animate();

        // Cleanup
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            sceneManager.dispose();
        };
    }, []);

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

        showNotification('success', `${shape} created successfully`);
        setStatusMessage(`Created ${shape}`);
    };

    // Handle tool change
    const handleToolChange = (tool: Tool) => {
        setActiveTool(tool);
        if (appStateRef.current) {
            appStateRef.current.activeTool = tool;
        }

        if (sceneManagerRef.current) {
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
    };

    // Handle view mode change
    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
        if (sceneManagerRef.current) {
            sceneManagerRef.current.setViewMode(mode);
        }
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

    return (
        <div className="h-screen flex flex-col bg-[#FDFBF7] text-slate-900">
            {/* Header */}
            <header className="h-16 glass-nav border-b border-slate-200 flex items-center px-6 relative z-50">
                <div className="text-2xl font-black mr-8 font-serif text-richred">
                    Olmec Builder
                </div>

                <nav className="flex space-x-1">
                    {/* File Menu */}
                    <div className="menu-item relative group">
                        <div className="px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                            <span className="text-sm font-medium">File</span>
                        </div>
                        <div className="submenu absolute top-full left-0 mt-2 min-w-[200px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 glass-panel shadow-lg">
                            <div className="submenu-item px-4 py-3 text-sm cursor-pointer rounded-t-lg hover:bg-slate-100">
                                <i className="fas fa-plus w-4 mr-3"></i>New Project
                            </div>
                            <div className="submenu-item px-4 py-3 text-sm cursor-pointer hover:bg-slate-100">
                                <i className="fas fa-folder-open w-4 mr-3"></i>Open...
                            </div>
                            <div className="h-px bg-slate-200 mx-2"></div>
                            <div className="submenu-item px-4 py-3 text-sm cursor-pointer hover:bg-slate-100">
                                <i className="fas fa-download w-4 mr-3"></i>Import
                            </div>
                            <div className="submenu-item px-4 py-3 text-sm cursor-pointer rounded-b-lg hover:bg-slate-100">
                                <i className="fas fa-upload w-4 mr-3"></i>Export
                            </div>
                        </div>
                    </div>

                    {/* Edit Menu */}
                    <div className="menu-item relative group">
                        <div className="px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                            <span className="text-sm font-medium">Edit</span>
                        </div>
                        <div className="submenu absolute top-full left-0 mt-2 min-w-[200px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 glass-panel shadow-lg">
                            <div className="submenu-item px-4 py-3 text-sm cursor-pointer rounded-t-lg hover:bg-slate-100" onClick={handleUndo}>
                                <i className="fas fa-undo w-4 mr-3"></i>Undo
                            </div>
                            <div className="submenu-item px-4 py-3 text-sm cursor-pointer hover:bg-slate-100" onClick={handleRedo}>
                                <i className="fas fa-redo w-4 mr-3"></i>Redo
                            </div>
                            <div className="h-px bg-slate-200 mx-2"></div>
                            <div className="submenu-item px-4 py-3 text-sm cursor-pointer hover:bg-slate-100">
                                <i className="fas fa-clone w-4 mr-3"></i>Duplicate
                            </div>
                            <div className="submenu-item px-4 py-3 text-sm cursor-pointer rounded-b-lg hover:bg-slate-100">
                                <i className="fas fa-trash w-4 mr-3"></i>Delete
                            </div>
                        </div>
                    </div>
                </nav>

                <div className="ml-auto flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-richred rounded-full animate-pulse"></div>
                        <span className="text-sm text-slate-600 font-mono">ONLINE</span>
                    </div>
                    <button className="bg-richred hover:bg-richred-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">
                        <i className="fas fa-cloud-upload-alt mr-2"></i>Export
                    </button>
                    <button
                        className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        onClick={() => setIsTimelineVisible(!isTimelineVisible)}
                    >
                        <i className="fas fa-film mr-2"></i>Timeline
                    </button>
                </div>
            </header>

            {/* Main Container */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar */}
                <aside className={`${isLeftPanelCollapsed ? 'w-0' : 'w-80'} glass-panel border-r border-slate-200 overflow-y-auto transition-all duration-300 relative`}>
                    <button
                        className="absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2 w-6 h-12 glass-panel border border-slate-200 rounded-r-lg flex items-center justify-center hover:bg-slate-100 transition-colors z-10"
                        onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
                    >
                        <i className={`fas fa-chevron-${isLeftPanelCollapsed ? 'right' : 'left'} text-xs`}></i>
                    </button>

                    {!isLeftPanelCollapsed && (
                        <div className="panel-content h-full">
                            {/* Tab Navigation */}
                            <div className="flex border-b border-slate-200">
                                <button
                                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'create' ? 'bg-slate-100 border-b-2 border-richred text-richred' : 'text-slate-600 hover:bg-slate-50'}`}
                                    onClick={() => setActiveTab('create')}
                                >
                                    Create
                                </button>
                                <button
                                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'sculpt' ? 'bg-slate-100 border-b-2 border-richred text-richred' : 'text-slate-600 hover:bg-slate-50'}`}
                                    onClick={() => setActiveTab('sculpt')}
                                >
                                    Sculpt
                                </button>
                                <button
                                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'scene' ? 'bg-slate-100 border-b-2 border-richred text-richred' : 'text-slate-600 hover:bg-slate-50'}`}
                                    onClick={() => setActiveTab('scene')}
                                >
                                    Scene
                                </button>
                            </div>

                            {/* Create Panel */}
                            {activeTab === 'create' && (
                                <div className="p-6">
                                    <div className="mb-4">
                                        <h3 className="font-semibold text-lg mb-4 flex items-center">
                                            <i className="fas fa-plus-circle mr-3 text-richred"></i>
                                            Create Objects
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['box', 'sphere', 'cylinder', 'cone', 'torus', 'plane'].map((shape) => (
                                            <div
                                                key={shape}
                                                className="glass-panel rounded-lg p-4 cursor-pointer flex flex-col items-center space-y-2 hover:bg-slate-100 transition-all"
                                                onClick={() => handleCreateShape(shape)}
                                            >
                                                <i className={`fas fa-${shape === 'box' ? 'cube' : shape === 'sphere' ? 'globe' : shape === 'cylinder' ? 'database' : shape === 'cone' ? 'concierge-bell' : shape === 'torus' ? 'ring' : 'square'} text-2xl text-richred`}></i>
                                                <span className="text-xs font-medium capitalize">{shape}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sculpt Panel */}
                            {activeTab === 'sculpt' && (
                                <div className="p-6">
                                    <div className="mb-4">
                                        <h3 className="font-semibold text-lg mb-4 flex items-center">
                                            <i className="fas fa-paint-brush mr-3 text-richred"></i>
                                            Sculpting Tools
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 mb-4">
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
                                                className="glass-panel rounded-lg p-3 cursor-pointer flex flex-col items-center space-y-1 hover:bg-slate-100 transition-all"
                                            >
                                                <i className={`fas fa-${icon} text-lg text-richred`}></i>
                                                <span className="text-xs capitalize">{tool}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Scene Panel */}
                            {activeTab === 'scene' && (
                                <div className="p-6">
                                    <div className="mb-4">
                                        <h3 className="font-semibold text-lg mb-4 flex items-center">
                                            <i className="fas fa-sitemap mr-3 text-richred"></i>
                                            Scene Hierarchy
                                        </h3>
                                    </div>
                                    <div className="text-center text-slate-500 text-sm mt-8">
                                        <i className="fas fa-layer-group text-2xl mb-2 block"></i>
                                        No objects in scene
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </aside>

                {/* Main Viewport */}
                <main className="flex-1 flex flex-col">
                    {/* Toolbar */}
                    <div className="h-16 glass-panel border-b border-slate-200 flex items-center px-6 space-x-2">
                        {/* Transform Tools */}
                        <div className="flex items-center space-x-1 pr-4 border-r border-slate-200">
                            {[
                                { tool: 'select' as Tool, icon: 'mouse-pointer' },
                                { tool: 'move' as Tool, icon: 'arrows-alt' },
                                { tool: 'rotate' as Tool, icon: 'sync-alt' },
                                { tool: 'scale' as Tool, icon: 'expand-arrows-alt' }
                            ].map(({ tool, icon }) => (
                                <button
                                    key={tool}
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all ${activeTool === tool ? 'bg-richred text-white' : 'glass-panel hover:bg-slate-100'}`}
                                    onClick={() => handleToolChange(tool)}
                                >
                                    <i className={`fas fa-${icon}`}></i>
                                </button>
                            ))}
                        </div>

                        {/* View Modes */}
                        <div className="flex items-center space-x-1 pr-4 border-r border-slate-200">
                            {[
                                { mode: 'solid' as ViewMode, icon: 'cube' },
                                { mode: 'wireframe' as ViewMode, icon: 'project-diagram' },
                                { mode: 'material' as ViewMode, icon: 'palette' },
                                { mode: 'rendered' as ViewMode, icon: 'eye' }
                            ].map(({ mode, icon }) => (
                                <button
                                    key={mode}
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all ${viewMode === mode ? 'bg-richred text-white' : 'glass-panel hover:bg-slate-100'}`}
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
                                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg glass-panel hover:bg-slate-100 transition-all"
                                    onClick={() => handleCameraViewChange(view)}
                                >
                                    <i className={`fas fa-${icon}`}></i>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 3D Viewport */}
                    <div className="flex-1 relative bg-gradient-to-br from-cream-100 to-cream-200">
                        <canvas ref={canvasRef} className="w-full h-full"></canvas>

                        {/* Welcome Screen */}
                        {objectCount === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center">
                                    <div className="w-32 h-32 glass-panel rounded-full flex items-center justify-center mb-8 mx-auto">
                                        <i className="fas fa-cube text-4xl text-richred"></i>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4">Welcome to Olmec Builder</h3>
                                    <p className="text-slate-600 mb-6 max-w-md">
                                        Start creating by adding objects from the left panel
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                {/* Right Sidebar */}
                <aside className={`${isRightPanelCollapsed ? 'w-0' : 'w-80'} glass-panel border-l border-slate-200 overflow-y-auto transition-all duration-300 relative`}>
                    <button
                        className="absolute left-0 top-1/2 transform -translate-x-full -translate-y-1/2 w-6 h-12 glass-panel border border-slate-200 rounded-l-lg flex items-center justify-center hover:bg-slate-100 transition-colors z-10"
                        onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
                    >
                        <i className={`fas fa-chevron-${isRightPanelCollapsed ? 'left' : 'right'} text-xs`}></i>
                    </button>

                    {!isRightPanelCollapsed && (
                        <div className="panel-content h-full p-6">
                            {/* Properties Panel */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-lg mb-4 flex items-center">
                                    <i className="fas fa-cog mr-3 text-richred"></i>
                                    Properties
                                </h3>
                                <div className="text-center text-slate-500 text-sm">
                                    <i className="fas fa-mouse-pointer text-2xl mb-2 block"></i>
                                    Select an object to view properties
                                </div>
                            </div>

                            {/* Transform Panel */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-lg mb-4 flex items-center">
                                    <i className="fas fa-arrows-alt mr-3 text-richred"></i>
                                    Transform
                                </h3>
                                <div className="space-y-3">
                                    {['X', 'Y', 'Z'].map((axis) => (
                                        <div key={axis}>
                                            <label className="block text-xs text-slate-600 mb-1">{axis}</label>
                                            <input
                                                type="number"
                                                defaultValue="0.000"
                                                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-mono focus:border-richred focus:ring-1 focus:ring-richred outline-none transition-all"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Material Panel */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-lg mb-4 flex items-center">
                                    <i className="fas fa-palette mr-3 text-richred"></i>
                                    Material
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs text-slate-600 mb-2">Base Color</label>
                                        <input
                                            type="color"
                                            defaultValue="#808080"
                                            className="w-full h-10 rounded-lg border border-slate-200 cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-600 mb-2">Metallic</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            defaultValue="0"
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-600 mb-2">Roughness</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            defaultValue="0.5"
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </aside>
            </div>

            {/* Timeline Panel */}
            {isTimelineVisible && (
                <div className="h-48 glass-panel border-t border-slate-200 flex flex-col">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200">
                        <div className="flex items-center">
                            <i className="fas fa-film mr-2 text-richred"></i>
                            <h3 className="font-semibold">Animation Timeline</h3>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button className="glass-panel px-2 py-1 rounded text-sm hover:bg-slate-100">
                                <i className="fas fa-play"></i>
                            </button>
                            <button className="glass-panel px-2 py-1 rounded text-sm hover:bg-slate-100">
                                <i className="fas fa-pause"></i>
                            </button>
                            <button className="glass-panel px-2 py-1 rounded text-sm hover:bg-slate-100">
                                <i className="fas fa-stop"></i>
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 p-4">
                        <div className="text-center text-slate-500 text-sm">
                            <i className="fas fa-clock text-2xl mb-2 block"></i>
                            No animation tracks
                        </div>
                    </div>
                </div>
            )}

            {/* Status Bar */}
            <footer className="h-8 px-6 flex items-center justify-between text-xs text-slate-600 font-mono border-t border-slate-200 bg-white">
                <div className="flex items-center space-x-6">
                    <span>Objects: {objectCount}</span>
                    <span>Triangles: {triangleCount}</span>
                    <span>Vertices: {vertexCount}</span>
                </div>
                <div className="flex items-center space-x-6">
                    <span>FPS: {fps}</span>
                    <span className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-richred rounded-full mr-2"></div>
                        <span>{statusMessage}</span>
                    </span>
                </div>
            </footer>

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
