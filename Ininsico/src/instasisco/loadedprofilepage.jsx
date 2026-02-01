import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';

const UserProfile = () => {
    const [activeTab, setActiveTab] = useState('models');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedModel, setSelectedModel] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const { username } = useParams();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [models, setModels] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadData, setUploadData] = useState({
        title: '',
        description: '',
        tags: '',
        sceneFile: null,
        thumbnailFile: null
    });
    const fileInputRef = useRef(null);
    const thumbnailInputRef = useRef(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                // Fetch user data
                const userResponse = await fetch(`http://localhost:5000/api/users/${username}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });

                if (!userResponse.ok) throw new Error('Failed to fetch user data');
                const userData = await userResponse.json();

                // Handle profile photo URL
                let avatarUrl = userData.profile?.photo;
                if (!avatarUrl || !avatarUrl.startsWith('http')) {
                    avatarUrl = avatarUrl
                        ? `${window.location.protocol}//${window.location.host}${avatarUrl}`
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.username)}&background=random`;
                }

                setUserData({
                    username: userData.username,
                    email: userData.email || '',
                    profile: {
                        photo: avatarUrl,
                        profession: userData.profile?.profession || '3D Creator',
                        bio: userData.profile?.bio || '',
                        location: userData.profile?.location || 'No location set'
                    }
                });

                // Fetch user's models
                const modelsResponse = await fetch(`http://localhost:5000/api/users/${username}/models`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (modelsResponse.ok) {
                    const modelsData = await modelsResponse.json();
                    setModels(modelsData);
                }

            } catch (error) {
                console.error('Error fetching data:', error);
                setUserData({
                    username: username,
                    email: '',
                    profile: {
                        photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
                        profession: '3D Creator',
                        bio: '',
                        location: 'No location set'
                    }
                });
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [username]);

    const handleUploadChange = (e) => {
        const { name, value, files } = e.target;
        setUploadData(prev => ({
            ...prev,
            [name]: files ? files[0] : value
        }));
    };

    const handleModelUpload = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            if (!uploadData.title || !uploadData.sceneFile) {
                alert('Title and scene file are required');
                return;
            }

            setUploadProgress(0);

            const formData = new FormData();
            formData.append('title', uploadData.title);
            formData.append('description', uploadData.description);
            formData.append('tags', uploadData.tags);
            formData.append('sceneFile', uploadData.sceneFile); // Append the file directly
            if (uploadData.thumbnailFile) {
                formData.append('thumbnail', uploadData.thumbnailFile);
            }

            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'http://localhost:5000/api/models', true);
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    setUploadProgress(percentComplete);
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    setModels(prev => [response.model, ...prev]);
                    setShowUploadModal(false);
                    setUploadData({
                        title: '',
                        description: '',
                        tags: '',
                        sceneFile: null,
                        thumbnailFile: null
                    });
                } else {
                    console.error('Upload failed:', xhr.responseText);
                    alert('Upload failed');
                }
            };

            xhr.send(formData);

        } catch (error) {
            console.error('Upload error:', error);
            alert('Error uploading model');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <p className="text-white">User not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-md border-b border-gray-800">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold"
                        >
                            {userData.username.charAt(0).toUpperCase()}
                        </motion.div>
                        <div>
                            <h1 className="font-bold text-lg text-white">{userData.username}</h1>
                            <p className="text-sm text-blue-300">@{username}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700"
                            onClick={() => setShowUploadModal(true)}
                        >
                            Upload Model
                        </motion.button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <div className="relative h-[400px] w-full overflow-hidden bg-gradient-to-br from-gray-900 to-blue-900">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px]"></div>
                </div>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        className="relative mb-8"
                    >
                        <div className="w-32 h-32 rounded-full border-4 border-blue-500/80 shadow-xl overflow-hidden ring-4 ring-blue-500/30">
                            <img
                                src={userData.profile?.photo}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-4xl font-bold text-white mb-2"
                    >
                        {userData.username}
                    </motion.h1>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="text-xl text-blue-300 mb-6"
                    >
                        {userData.profile?.profession}
                    </motion.p>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="text-blue-200"
                    >
                        {userData.profile?.bio}
                    </motion.div>
                </div>
            </div>

            {/* Models Section */}
            <div className="container mx-auto px-4 py-8 pb-20">
                <h2 className="text-2xl font-bold text-white mb-6">3D Models</h2>

                {models.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-400 mb-6">No models uploaded yet</p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg"
                            onClick={() => setShowUploadModal(true)}
                        >
                            Upload Your First Model
                        </motion.button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {models.map((model) => (
                            <motion.div
                                key={model._id}
                                whileHover={{ y: -5 }}
                                className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-700"
                                onClick={() => setSelectedModel(model)}
                            >
                                <div className="relative pt-[56.25%] overflow-hidden">
                                    {model.thumbnail ? (
                                        <img
                                            src={model.thumbnail}
                                            alt={model.title}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-white mb-1">{model.title}</h3>
                                    <p className="text-sm text-gray-400 line-clamp-2">{model.description}</p>
                                    <div className="mt-3 flex justify-between items-center text-sm">
                                        <span className="text-gray-500">
                                            {new Date(model.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            <AnimatePresence>
                {showUploadModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowUploadModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 50 }}
                            className="bg-gray-900 rounded-2xl w-full max-w-md overflow-hidden relative border border-gray-700"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className="absolute top-4 right-4 z-10 bg-gray-800 rounded-full p-2 shadow-md hover:bg-gray-700 text-gray-300"
                                onClick={() => setShowUploadModal(false)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <div className="p-6">
                                <h2 className="text-2xl font-bold mb-6 text-white">Upload 3D Model</h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-gray-300 mb-2">Title*</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={uploadData.title}
                                            onChange={handleUploadChange}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-300 mb-2">Description</label>
                                        <textarea
                                            name="description"
                                            value={uploadData.description}
                                            onChange={handleUploadChange}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            rows="3"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-300 mb-2">Tags (comma separated)</label>
                                        <input
                                            type="text"
                                            name="tags"
                                            value={uploadData.tags}
                                            onChange={handleUploadChange}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-300 mb-2">Scene File (JSON)*</label>
                                        <div
                                            className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
                                            onClick={() => fileInputRef.current.click()}
                                        >
                                            {uploadData.sceneFile ? (
                                                <p className="text-blue-400">{uploadData.sceneFile.name}</p>
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                    </svg>
                                                    <p className="text-gray-400">Click to select scene file</p>
                                                    <p className="text-sm text-gray-500">.json file exported from your 3D editor</p>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                name="sceneFile"
                                                accept=".json"
                                                onChange={handleUploadChange}
                                                className="hidden"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-gray-300 mb-2">Thumbnail (Optional)</label>
                                        <div
                                            className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
                                            onClick={() => thumbnailInputRef.current.click()}
                                        >
                                            {uploadData.thumbnailFile ? (
                                                <div className="relative">
                                                    <img
                                                        src={URL.createObjectURL(uploadData.thumbnailFile)}
                                                        alt="Thumbnail preview"
                                                        className="max-h-32 mx-auto"
                                                    />
                                                </div>
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <p className="text-gray-400">Click to select thumbnail</p>
                                                    <p className="text-sm text-gray-500">.jpg, .png (recommended 800x600)</p>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                ref={thumbnailInputRef}
                                                name="thumbnailFile"
                                                accept="image/*"
                                                onChange={handleUploadChange}
                                                className="hidden"
                                            />
                                        </div>
                                    </div>

                                    {uploadProgress > 0 && uploadProgress < 100 && (
                                        <div className="w-full bg-gray-800 rounded-full h-2.5">
                                            <div
                                                className="bg-blue-600 h-2.5 rounded-full"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                    )}

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium mt-4 disabled:opacity-50"
                                        onClick={handleModelUpload}
                                        disabled={!uploadData.title || !uploadData.sceneFile || uploadProgress > 0}
                                    >
                                        {uploadProgress > 0 ? `Uploading... ${Math.round(uploadProgress)}%` : 'Upload Model'}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Model Detail Modal */}
            <AnimatePresence>
                {selectedModel && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedModel(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 50 }}
                            className="bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative border border-gray-700"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className="absolute top-4 right-4 z-10 bg-gray-800 rounded-full p-2 shadow-md hover:bg-gray-700 text-gray-300"
                                onClick={() => setSelectedModel(null)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <div className="flex-1 overflow-y-auto">
                                {/* Model Preview */}
                                <div className="relative h-96 bg-gray-800 flex items-center justify-center">
                                    {selectedModel.thumbnail ? (
                                        <img
                                            src={selectedModel.thumbnail}
                                            alt={selectedModel.title}
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                            </svg>
                                            <p className="text-gray-400">3D Model Preview</p>
                                        </div>
                                    )}
                                </div>

                                {/* Model Details */}
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-white mb-2">{selectedModel.title}</h2>
                                            <p className="text-gray-400">
                                                Uploaded on {new Date(selectedModel.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    {selectedModel.description && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                                            <p className="text-gray-300 whitespace-pre-line">{selectedModel.description}</p>
                                        </div>
                                    )}

                                    {selectedModel.tags && selectedModel.tags.length > 0 && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-white mb-2">Tags</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedModel.tags.map((tag, index) => (
                                                    <span key={index} className="px-3 py-1 bg-gray-800 rounded-full text-sm text-blue-400">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex space-x-4">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium"
                                        >
                                            Download
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-6 py-3 bg-gray-800 text-white rounded-lg font-medium border border-gray-700"
                                        >
                                            Edit
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserProfile;