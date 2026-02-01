import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import anime from 'animejs';

const Sell = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('model');
    const [showSuccess, setShowSuccess] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [userData, setUserData] = useState(null);

    // Form states for different asset types
    const [modelForm, setModelForm] = useState({
        title: '',
        description: '',
        category: '',
        tags: [],
        price: '',
        licenseType: 'standard',
        softwareCompatibility: [],
        polygonCount: '',
        file: null,
        previewImages: [],
        thumbnail: null,
        isAnimated: false,
        isRigged: false,
        isPBR: false
    });

    const [textureForm, setTextureForm] = useState({
        title: '',
        description: '',
        category: '',
        tags: [],
        price: '',
        licenseType: 'standard',
        resolution: '2K',
        textureType: 'pbr',
        file: null,
        previewImages: [],
        thumbnail: null,
        seamless: false,
        tileable: false
    });

    const [toolForm, setToolForm] = useState({
        title: '',
        description: '',
        category: '',
        tags: [],
        price: '',
        licenseType: 'standard',
        softwareCompatibility: [],
        file: null,
        previewImages: [],
        thumbnail: null,
        version: '1.0',
        documentation: null
    });

    useEffect(() => {
        // Fetch categories and tags from API
        const fetchData = async () => {
            try {
                // In a real app, these would come from your API
                const mockCategories = [
                    'Characters', 'Environments', 'Props', 'Vehicles',
                    'Architecture', 'Nature', 'Weapons', 'Furniture'
                ];
                const mockTags = [
                    'realistic', 'stylized', 'low-poly', 'high-poly',
                    'game-ready', 'modular', 'scifi', 'fantasy',
                    'cartoon', 'anime', 'horror', 'medieval'
                ];

                setCategories(mockCategories);
                setTags(mockTags);

                // Fetch user data if logged in
                const token = localStorage.getItem('token');
                if (token) {
                    const response = await axios.get('http://localhost:5000/api/me', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUserData(response.data.user);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const handleModelChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === 'checkbox') {
            if (name === 'softwareCompatibility') {
                const updated = modelForm.softwareCompatibility.includes(value)
                    ? modelForm.softwareCompatibility.filter(item => item !== value)
                    : [...modelForm.softwareCompatibility, value];
                setModelForm({ ...modelForm, softwareCompatibility: updated });
            } else {
                setModelForm({ ...modelForm, [name]: checked });
            }
        } else if (type === 'file') {
            if (name === 'previewImages') {
                setModelForm({ ...modelForm, previewImages: Array.from(files) });
            } else if (name === 'thumbnail') {
                setModelForm({ ...modelForm, thumbnail: files[0] });
            } else {
                setModelForm({ ...modelForm, [name]: files[0] });
            }
        } else {
            setModelForm({ ...modelForm, [name]: value });
        }
    };

    const handleTextureChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === 'checkbox') {
            setTextureForm({ ...textureForm, [name]: checked });
        } else if (type === 'file') {
            if (name === 'previewImages') {
                setTextureForm({ ...textureForm, previewImages: Array.from(files) });
            } else if (name === 'thumbnail') {
                setTextureForm({ ...textureForm, thumbnail: files[0] });
            } else {
                setTextureForm({ ...textureForm, [name]: files[0] });
            }
        } else {
            setTextureForm({ ...textureForm, [name]: value });
        }
    };

    const handleToolChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === 'checkbox') {
            if (name === 'softwareCompatibility') {
                const updated = toolForm.softwareCompatibility.includes(value)
                    ? toolForm.softwareCompatibility.filter(item => item !== value)
                    : [...toolForm.softwareCompatibility, value];
                setToolForm({ ...toolForm, softwareCompatibility: updated });
            } else {
                setToolForm({ ...toolForm, [name]: checked });
            }
        } else if (type === 'file') {
            if (name === 'previewImages') {
                setToolForm({ ...toolForm, previewImages: Array.from(files) });
            } else if (name === 'thumbnail') {
                setToolForm({ ...toolForm, thumbnail: files[0] });
            } else if (name === 'documentation') {
                setToolForm({ ...toolForm, documentation: files[0] });
            } else {
                setToolForm({ ...toolForm, [name]: files[0] });
            }
        } else {
            setToolForm({ ...toolForm, [name]: value });
        }
    };

    const handleTagSelect = (tag, formType) => {
        const formKey = `${formType}Form`;
        const currentForm = formType === 'model' ? modelForm :
            formType === 'texture' ? textureForm : toolForm;

        const updatedTags = currentForm.tags.includes(tag)
            ? currentForm.tags.filter(t => t !== tag)
            : [...currentForm.tags, tag];

        if (formType === 'model') {
            setModelForm({ ...modelForm, tags: updatedTags });
        } else if (formType === 'texture') {
            setTextureForm({ ...textureForm, tags: updatedTags });
        } else {
            setToolForm({ ...toolForm, tags: updatedTags });
        }
    };

    const uploadFiles = async (files, assetType, assetId) => {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });
        formData.append('assetType', assetType);
        formData.append('assetId', assetId);

        try {
            const response = await axios.post('http://localhost:5000/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });
            return response.data.filePaths;
        } catch (error) {
            console.error('Error uploading files:', error);
            throw error;
        }
    };

    const submitModel = async (e) => {
        e.preventDefault();
        if (!userData) {
            navigate('/login');
            return;
        }

        setIsUploading(true);
        try {
            const assetId = uuidv4();

            // Upload main file
            const filePath = await uploadFiles([modelForm.file], 'models', assetId);

            // Upload preview images
            const previewImagePaths = modelForm.previewImages.length > 0
                ? await uploadFiles(modelForm.previewImages, 'previews', assetId)
                : [];

            // Upload thumbnail
            const thumbnailPath = modelForm.thumbnail
                ? (await uploadFiles([modelForm.thumbnail], 'thumbnails', assetId))[0]
                : null;

            const modelData = {
                id: assetId,
                title: modelForm.title,
                description: modelForm.description,
                category: modelForm.category,
                tags: modelForm.tags,
                price: parseFloat(modelForm.price),
                licenseType: modelForm.licenseType,
                softwareCompatibility: modelForm.softwareCompatibility,
                polygonCount: parseInt(modelForm.polygonCount),
                filePath: filePath[0],
                previewImages: previewImagePaths,
                thumbnail: thumbnailPath,
                isAnimated: modelForm.isAnimated,
                isRigged: modelForm.isRigged,
                isPBR: modelForm.isPBR,
                authorId: userData.id,
                authorName: userData.username,
                createdAt: new Date().toISOString()
            };

            await axios.post('http://localhost:5000/api/models', modelData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            setShowSuccess(true);
            resetForms();
            animateSuccess();
        } catch (error) {
            console.error('Error submitting model:', error);
            // Handle error (show notification, etc.)
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const submitTexture = async (e) => {
        e.preventDefault();
        if (!userData) {
            navigate('/login');
            return;
        }

        setIsUploading(true);
        try {
            const assetId = uuidv4();

            // Upload main file
            const filePath = await uploadFiles([textureForm.file], 'textures', assetId);

            // Upload preview images
            const previewImagePaths = textureForm.previewImages.length > 0
                ? await uploadFiles(textureForm.previewImages, 'previews', assetId)
                : [];

            // Upload thumbnail
            const thumbnailPath = textureForm.thumbnail
                ? (await uploadFiles([textureForm.thumbnail], 'thumbnails', assetId))[0]
                : null;

            const textureData = {
                id: assetId,
                title: textureForm.title,
                description: textureForm.description,
                category: textureForm.category,
                tags: textureForm.tags,
                price: parseFloat(textureForm.price),
                licenseType: textureForm.licenseType,
                resolution: textureForm.resolution,
                textureType: textureForm.textureType,
                filePath: filePath[0],
                previewImages: previewImagePaths,
                thumbnail: thumbnailPath,
                seamless: textureForm.seamless,
                tileable: textureForm.tileable,
                authorId: userData.id,
                authorName: userData.username,
                createdAt: new Date().toISOString()
            };

            await axios.post('http://localhost:5000/api/textures', textureData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            setShowSuccess(true);
            resetForms();
            animateSuccess();
        } catch (error) {
            console.error('Error submitting texture:', error);
            // Handle error
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const submitTool = async (e) => {
        e.preventDefault();
        if (!userData) {
            navigate('/login');
            return;
        }

        setIsUploading(true);
        try {
            const assetId = uuidv4();

            // Upload main file
            const filePath = await uploadFiles([toolForm.file], 'tools', assetId);

            // Upload preview images
            const previewImagePaths = toolForm.previewImages.length > 0
                ? await uploadFiles(toolForm.previewImages, 'previews', assetId)
                : [];

            // Upload thumbnail
            const thumbnailPath = toolForm.thumbnail
                ? (await uploadFiles([toolForm.thumbnail], 'thumbnails', assetId))[0]
                : null;

            // Upload documentation if exists
            const documentationPath = toolForm.documentation
                ? (await uploadFiles([toolForm.documentation], 'docs', assetId))[0]
                : null;

            const toolData = {
                id: assetId,
                title: toolForm.title,
                description: toolForm.description,
                category: toolForm.category,
                tags: toolForm.tags,
                price: parseFloat(toolForm.price),
                licenseType: toolForm.licenseType,
                softwareCompatibility: toolForm.softwareCompatibility,
                filePath: filePath[0],
                previewImages: previewImagePaths,
                thumbnail: thumbnailPath,
                version: toolForm.version,
                documentation: documentationPath,
                authorId: userData.id,
                authorName: userData.username,
                createdAt: new Date().toISOString()
            };

            await axios.post('http://localhost:5000/api/tools', toolData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            setShowSuccess(true);
            resetForms();
            animateSuccess();
        } catch (error) {
            console.error('Error submitting tool:', error);
            // Handle error
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const resetForms = () => {
        setModelForm({
            title: '',
            description: '',
            category: '',
            tags: [],
            price: '',
            licenseType: 'standard',
            softwareCompatibility: [],
            polygonCount: '',
            file: null,
            previewImages: [],
            thumbnail: null,
            isAnimated: false,
            isRigged: false,
            isPBR: false
        });

        setTextureForm({
            title: '',
            description: '',
            category: '',
            tags: [],
            price: '',
            licenseType: 'standard',
            resolution: '2K',
            textureType: 'pbr',
            file: null,
            previewImages: [],
            thumbnail: null,
            seamless: false,
            tileable: false
        });

        setToolForm({
            title: '',
            description: '',
            category: '',
            tags: [],
            price: '',
            licenseType: 'standard',
            softwareCompatibility: [],
            file: null,
            previewImages: [],
            thumbnail: null,
            version: '1.0',
            documentation: null
        });
    };

    const animateSuccess = () => {
        anime({
            targets: '.success-notification',
            scale: [0.8, 1.1, 1],
            opacity: [0, 1],
            duration: 800,
            easing: 'spring(1, 80, 10, 0)'
        });

        setTimeout(() => {
            anime({
                targets: '.success-notification',
                opacity: [1, 0],
                scale: [1, 0.9],
                duration: 500,
                easing: 'easeOutQuad',
                complete: () => setShowSuccess(false)
            });
        }, 3000);
    };

    const renderFilePreview = (file) => {
        if (!file) return null;

        if (file.type.startsWith('image/')) {
            return <img src={URL.createObjectURL(file)} alt="Preview" className="h-20 w-20 object-cover rounded-md" />;
        } else {
            return (
                <div className="h-20 w-20 bg-gray-100 rounded-md flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                </div>
            );
        }
    };

    const renderModelForm = () => (
        <form onSubmit={submitModel} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
                    <input
                        type="text"
                        name="title"
                        value={modelForm.title}
                        onChange={handleModelChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD)*</label>
                    <input
                        type="number"
                        name="price"
                        value={modelForm.price}
                        onChange={handleModelChange}
                        min="0"
                        step="0.01"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
                <textarea
                    name="description"
                    value={modelForm.description}
                    onChange={handleModelChange}
                    required
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
                    <select
                        name="category"
                        value={modelForm.category}
                        onChange={handleModelChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Type*</label>
                    <select
                        name="licenseType"
                        value={modelForm.licenseType}
                        onChange={handleModelChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="standard">Standard License</option>
                        <option value="extended">Extended License</option>
                        <option value="editorial">Editorial License</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag) => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => handleTagSelect(tag, 'model')}
                            className={`px-3 py-1 rounded-full text-xs ${modelForm.tags.includes(tag) ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">3D Model File*</label>
                    <div className="flex items-center space-x-4">
                        <label className="flex-1">
                            <div className="px-4 py-2 border border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 text-center">
                                {modelForm.file ? modelForm.file.name : 'Choose file...'}
                            </div>
                            <input
                                type="file"
                                name="file"
                                onChange={handleModelChange}
                                required
                                accept=".fbx,.obj,.blend,.gltf,.dae,.stl"
                                className="hidden"
                            />
                        </label>
                        {modelForm.file && renderFilePreview(modelForm.file)}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Polygon Count</label>
                    <input
                        type="number"
                        name="polygonCount"
                        value={modelForm.polygonCount}
                        onChange={handleModelChange}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preview Images*</label>
                    <div className="flex flex-wrap gap-2">
                        {modelForm.previewImages.map((file, index) => (
                            <div key={index} className="relative">
                                <img src={URL.createObjectURL(file)} alt={`Preview ${index}`} className="h-20 w-20 object-cover rounded-md" />
                            </div>
                        ))}
                        <label className="h-20 w-20 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center cursor-pointer hover:border-indigo-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <input
                                type="file"
                                name="previewImages"
                                onChange={handleModelChange}
                                multiple
                                accept="image/*"
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Image*</label>
                    <div className="flex items-center space-x-4">
                        <label className="flex-1">
                            <div className="px-4 py-2 border border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 text-center">
                                {modelForm.thumbnail ? modelForm.thumbnail.name : 'Choose file...'}
                            </div>
                            <input
                                type="file"
                                name="thumbnail"
                                onChange={handleModelChange}
                                required
                                accept="image/*"
                                className="hidden"
                            />
                        </label>
                        {modelForm.thumbnail && renderFilePreview(modelForm.thumbnail)}
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Software Compatibility</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {['Blender', 'Maya', '3ds Max', 'Cinema 4D', 'Unreal Engine', 'Unity'].map((software) => (
                        <label key={software} className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                name="softwareCompatibility"
                                value={software}
                                checked={modelForm.softwareCompatibility.includes(software)}
                                onChange={handleModelChange}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700">{software}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        name="isAnimated"
                        checked={modelForm.isAnimated}
                        onChange={handleModelChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Animated</span>
                </label>
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        name="isRigged"
                        checked={modelForm.isRigged}
                        onChange={handleModelChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Rigged</span>
                </label>
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        name="isPBR"
                        checked={modelForm.isPBR}
                        onChange={handleModelChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">PBR Materials</span>
                </label>
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={isUploading}
                    className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-70"
                >
                    {isUploading ? 'Uploading...' : 'Submit 3D Model'}
                </button>
            </div>
        </form>
    );

    const renderTextureForm = () => (
        <form onSubmit={submitTexture} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
                    <input
                        type="text"
                        name="title"
                        value={textureForm.title}
                        onChange={handleTextureChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD)*</label>
                    <input
                        type="number"
                        name="price"
                        value={textureForm.price}
                        onChange={handleTextureChange}
                        min="0"
                        step="0.01"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
                <textarea
                    name="description"
                    value={textureForm.description}
                    onChange={handleTextureChange}
                    required
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
                    <select
                        name="category"
                        value={textureForm.category}
                        onChange={handleTextureChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Type*</label>
                    <select
                        name="licenseType"
                        value={textureForm.licenseType}
                        onChange={handleTextureChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="standard">Standard License</option>
                        <option value="extended">Extended License</option>
                        <option value="editorial">Editorial License</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag) => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => handleTagSelect(tag, 'texture')}
                            className={`px-3 py-1 rounded-full text-xs ${textureForm.tags.includes(tag) ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Texture Type*</label>
                    <select
                        name="textureType"
                        value={textureForm.textureType}
                        onChange={handleTextureChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="pbr">PBR Texture</option>
                        <option value="diffuse">Diffuse/Albedo</option>
                        <option value="normal">Normal Map</option>
                        <option value="roughness">Roughness</option>
                        <option value="metalness">Metalness</option>
                        <option value="displacement">Displacement</option>
                        <option value="ao">Ambient Occlusion</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Resolution*</label>
                    <select
                        name="resolution"
                        value={textureForm.resolution}
                        onChange={handleTextureChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="1K">1K (1024x1024)</option>
                        <option value="2K">2K (2048x2048)</option>
                        <option value="4K">4K (4096x4096)</option>
                        <option value="8K">8K (8192x8192)</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Texture File*</label>
                    <div className="flex items-center space-x-4">
                        <label className="flex-1">
                            <div className="px-4 py-2 border border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 text-center">
                                {textureForm.file ? textureForm.file.name : 'Choose file...'}
                            </div>
                            <input
                                type="file"
                                name="file"
                                onChange={handleTextureChange}
                                required
                                accept=".png,.jpg,.jpeg,.tga,.tiff,.exr,.hdr"
                                className="hidden"
                            />
                        </label>
                        {textureForm.file && renderFilePreview(textureForm.file)}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Image*</label>
                    <div className="flex items-center space-x-4">
                        <label className="flex-1">
                            <div className="px-4 py-2 border border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 text-center">
                                {textureForm.thumbnail ? textureForm.thumbnail.name : 'Choose file...'}
                            </div>
                            <input
                                type="file"
                                name="thumbnail"
                                onChange={handleTextureChange}
                                required
                                accept="image/*"
                                className="hidden"
                            />
                        </label>
                        {textureForm.thumbnail && renderFilePreview(textureForm.thumbnail)}
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preview Images*</label>
                <div className="flex flex-wrap gap-2">
                    {textureForm.previewImages.map((file, index) => (
                        <div key={index} className="relative">
                            <img src={URL.createObjectURL(file)} alt={`Preview ${index}`} className="h-20 w-20 object-cover rounded-md" />
                        </div>
                    ))}
                    <label className="h-20 w-20 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center cursor-pointer hover:border-indigo-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <input
                            type="file"
                            name="previewImages"
                            onChange={handleTextureChange}
                            multiple
                            accept="image/*"
                            className="hidden"
                        />
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        name="seamless"
                        checked={textureForm.seamless}
                        onChange={handleTextureChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Seamless Texture</span>
                </label>
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        name="tileable"
                        checked={textureForm.tileable}
                        onChange={handleTextureChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Tileable</span>
                </label>
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={isUploading}
                    className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-70"
                >
                    {isUploading ? 'Uploading...' : 'Submit Texture'}
                </button>
            </div>
        </form>
    );

    const renderToolForm = () => (
        <form onSubmit={submitTool} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
                    <input
                        type="text"
                        name="title"
                        value={toolForm.title}
                        onChange={handleToolChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD)*</label>
                    <input
                        type="number"
                        name="price"
                        value={toolForm.price}
                        onChange={handleToolChange}
                        min="0"
                        step="0.01"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
                <textarea
                    name="description"
                    value={toolForm.description}
                    onChange={handleToolChange}
                    required
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
                    <select
                        name="category"
                        value={toolForm.category}
                        onChange={handleToolChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Type*</label>
                    <select
                        name="licenseType"
                        value={toolForm.licenseType}
                        onChange={handleToolChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="standard">Standard License</option>
                        <option value="extended">Extended License</option>
                        <option value="editorial">Editorial License</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag) => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => handleTagSelect(tag, 'tool')}
                            className={`px-3 py-1 rounded-full text-xs ${toolForm.tags.includes(tag) ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tool File*</label>
                    <div className="flex items-center space-x-4">
                        <label className="flex-1">
                            <div className="px-4 py-2 border border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 text-center">
                                {toolForm.file ? toolForm.file.name : 'Choose file...'}
                            </div>
                            <input
                                type="file"
                                name="file"
                                onChange={handleToolChange}
                                required
                                accept=".zip,.rar,.7z,.js,.py,.lua,.exe"
                                className="hidden"
                            />
                        </label>
                        {toolForm.file && renderFilePreview(toolForm.file)}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                    <input
                        type="text"
                        name="version"
                        value={toolForm.version}
                        onChange={handleToolChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preview Images*</label>
                    <div className="flex flex-wrap gap-2">
                        {toolForm.previewImages.map((file, index) => (
                            <div key={index} className="relative">
                                <img src={URL.createObjectURL(file)} alt={`Preview ${index}`} className="h-20 w-20 object-cover rounded-md" />
                            </div>
                        ))}
                        <label className="h-20 w-20 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center cursor-pointer hover:border-indigo-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <input
                                type="file"
                                name="previewImages"
                                onChange={handleToolChange}
                                multiple
                                accept="image/*"
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Image*</label>
                    <div className="flex items-center space-x-4">
                        <label className="flex-1">
                            <div className="px-4 py-2 border border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 text-center">
                                {toolForm.thumbnail ? toolForm.thumbnail.name : 'Choose file...'}
                            </div>
                            <input
                                type="file"
                                name="thumbnail"
                                onChange={handleToolChange}
                                required
                                accept="image/*"
                                className="hidden"
                            />
                        </label>
                        {toolForm.thumbnail && renderFilePreview(toolForm.thumbnail)}
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Documentation (Optional)</label>
                <div className="flex items-center space-x-4">
                    <label className="flex-1">
                        <div className="px-4 py-2 border border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 text-center">
                            {toolForm.documentation ? toolForm.documentation.name : 'Choose file...'}
                        </div>
                        <input
                            type="file"
                            name="documentation"
                            onChange={handleToolChange}
                            accept=".pdf,.doc,.docx,.txt,.md"
                            className="hidden"
                        />
                    </label>
                    {toolForm.documentation && renderFilePreview(toolForm.documentation)}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Software Compatibility</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {['Blender', 'Maya', '3ds Max', 'Cinema 4D', 'Unreal Engine', 'Unity'].map((software) => (
                        <label key={software} className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                name="softwareCompatibility"
                                value={software}
                                checked={toolForm.softwareCompatibility.includes(software)}
                                onChange={handleToolChange}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700">{software}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={isUploading}
                    className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-70"
                >
                    {isUploading ? 'Uploading...' : 'Submit Tool'}
                </button>
            </div>
        </form>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Sell Your Digital Assets</h1>
                    <p className="mt-3 text-xl text-gray-500">
                        Share your creations with our community and earn money for your work
                    </p>
                </div>

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab('model')}
                                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'model' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            >
                                3D Models
                            </button>
                            <button
                                onClick={() => setActiveTab('texture')}
                                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'texture' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            >
                                Textures
                            </button>
                            <button
                                onClick={() => setActiveTab('tool')}
                                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'tool' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            >
                                Tools & Plugins
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        {isUploading && (
                            <div className="mb-6">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium text-indigo-700">Uploading...</span>
                                    <span className="text-sm font-medium text-indigo-700">{uploadProgress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-indigo-600 h-2.5 rounded-full"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {showSuccess && (
                            <div className="success-notification fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
                                <div className="flex items-center space-x-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Your asset has been submitted successfully!</span>
                                </div>
                            </div>
                        )}

                        {activeTab === 'model' && renderModelForm()}
                        {activeTab === 'texture' && renderTextureForm()}
                        {activeTab === 'tool' && renderToolForm()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sell;