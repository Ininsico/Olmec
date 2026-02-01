import { useState } from 'react';
import './ProfileSetup.css';
import { useNavigate } from 'react-router-dom';

const ProfileSetup = () => {
    const navigate = useNavigate();

    // Predefined avatar options
    const avatarOptions = [
        'https://cdn-icons-png.flaticon.com/512/3135/3135715.png', // default avatar
        'https://cdn-icons-png.flaticon.com/512/4333/4333609.png',
        'https://cdn-icons-png.flaticon.com/512/4140/4140047.png',
        'https://cdn-icons-png.flaticon.com/512/921/921071.png',
        'https://cdn-icons-png.flaticon.com/512/3667/3667325.png',
        'https://cdn-icons-png.flaticon.com/512/3667/3667339.png'
    ];

    // Form state
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState(() => {
        const user = JSON.parse(localStorage.getItem('user')) || {};
        return {
            name: user.username || '',
            email: user.email || '',
            password: '',
            profilePhoto: null,
            previewPhoto: user.profile?.photo || avatarOptions[0], // Default to first avatar
            selectedAvatar: user.profile?.photo || avatarOptions[0],
            interests: user.profile?.interests || [],
            bio: user.profile?.bio || '',
            profession: user.profile?.profession || '',
            location: user.profile?.location || '',
            socialLinks: {
                twitter: user.profile?.socialLinks?.twitter || '',
                linkedin: user.profile?.socialLinks?.linkedin || '',
                github: user.profile?.socialLinks?.github || ''
            }
        };
    });

    // UI state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [shake, setShake] = useState(false);
    const [showAvatarOptions, setShowAvatarOptions] = useState(false);

    // Available interests for algorithm
    const interestOptions = [
        'Technology', 'Art', 'Music', 'Sports', 'Travel',
        'Photography', 'Cooking', 'Gaming', 'Reading', 'Fitness',
        'Finance', 'Science', 'Fashion', 'Movies', 'Programming'
    ];

    // Handle input changes
    const handleChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === 'file') {
            const file = files[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFormData(prev => ({
                        ...prev,
                        profilePhoto: file,
                        previewPhoto: reader.result,
                        selectedAvatar: null // Clear selected avatar if uploading new photo
                    }));
                };
                reader.readAsDataURL(file);
            }
        } else if (name.startsWith('social-')) {
            const socialKey = name.split('-')[1];
            setFormData(prev => ({
                ...prev,
                socialLinks: {
                    ...prev.socialLinks,
                    [socialKey]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Handle avatar selection
    const selectAvatar = (avatarUrl) => {
        setFormData(prev => ({
            ...prev,
            previewPhoto: avatarUrl,
            selectedAvatar: avatarUrl,
            profilePhoto: null // Clear uploaded photo if selecting avatar
        }));
        setShowAvatarOptions(false);
    };

    // Handle interest toggle
    const toggleInterest = (interest) => {
        setFormData(prev => {
            const newInterests = prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest];

            return { ...prev, interests: newInterests };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (step === 3) { // Changed from 4 to 3 since we removed basic info step
            setIsSubmitting(true);

            try {
                let photoUrl = formData.selectedAvatar; // Start with selected avatar

                // Only upload if user uploaded a custom photo
                if (formData.profilePhoto) {
                    const uploadFormData = new FormData();
                    uploadFormData.append('photo', formData.profilePhoto);

                    const uploadResponse = await fetch('http://localhost:5000/api/upload-photo', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: uploadFormData
                    });

                    const uploadData = await uploadResponse.json();
                    if (!uploadResponse.ok) throw new Error(uploadData.error || 'Photo upload failed');
                    photoUrl = uploadData.photoUrl;
                }

                // Prepare profile data for submission
                const profileData = {
                    photo: photoUrl,
                    bio: formData.bio,
                    profession: formData.profession,
                    location: formData.location,
                    interests: formData.interests,
                    socialLinks: formData.socialLinks
                };

                // Submit profile data
                const response = await fetch('http://localhost:5000/api/complete-profile', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(profileData)
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Profile completion failed');
                }

                // Update local user data
                const currentUser = JSON.parse(localStorage.getItem('user'));
                const updatedUser = {
                    ...currentUser,
                    profileComplete: true,
                    profile: profileData
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));

                // Redirect to dashboard
                navigate('/dashboard');

            } catch (error) {
                console.error('Submission error:', error);
                alert(error.message || 'Failed to complete profile setup');
            } finally {
                setIsSubmitting(false);
            }
        } else {
            nextStep();
        }
    };

    // Navigation between steps
    const nextStep = () => {
        if (validateStep()) {
            setStep(prev => prev + 1);
            setProgress(((step + 1) / 3) * 100); // Changed to 3 steps
        } else {
            triggerShake();
        }
    };

    const prevStep = () => {
        setStep(prev => prev - 1);
        setProgress(((step - 1) / 3) * 100); // Changed to 3 steps
    };

    // Skip profile setup
    const skipSetup = () => {
        navigate('/dashboard');
    };

    // Validate current step
    const validateStep = () => {
        switch (step) {
            case 0: // Profile photo (now optional)
                return true;
            case 1: // Interests
                return formData.interests.length >= 3;
            case 2: // About you
                return formData.bio.trim().length >= 20 &&
                    formData.profession.trim() &&
                    formData.location.trim();
            default:
                return true;
        }
    };

    // Shake animation for validation errors
    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    // Step titles (reduced to 3 steps)
    const stepTitles = [
        'Profile Picture',
        'Your Interests',
        'About You',
        'Review & Complete'
    ];

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className={`w-full max-w-2xl bg-blue-900 bg-opacity-20 rounded-xl shadow-2xl overflow-hidden border border-blue-800 border-opacity-50 transition-all duration-500 ${shake ? 'animate-shake' : ''}`}>
                {/* Progress bar */}
                <div className="h-1.5 bg-blue-900 bg-opacity-30">
                    <div
                        className="h-full bg-blue-400 transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                {/* Header */}
                <div className="p-6 border-b border-blue-800 border-opacity-50">
                    <h1 className="text-2xl font-bold text-blue-100">Complete Your Profile</h1>
                    <p className="text-blue-300 text-opacity-80 mt-1">{stepTitles[step]}</p>
                </div>

                {/* Form container */}
                <div className="p-6 relative overflow-hidden">
                    {/* Step 0: Profile Photo */}
                    {step === 0 && (
                        <div className="animate-fadeIn">
                            <div className="flex flex-col items-center justify-center space-y-6">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-full bg-gray-800 bg-opacity-50 border-2 border-dashed border-blue-700 flex items-center justify-center overflow-hidden">
                                        <img
                                            src={formData.previewPhoto}
                                            alt="Profile preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <label className="cursor-pointer bg-blue-600 bg-opacity-80 rounded-full p-2">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <input
                                                type="file"
                                                name="profilePhoto"
                                                onChange={handleChange}
                                                className="hidden"
                                                accept="image/*"
                                            />
                                        </label>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowAvatarOptions(!showAvatarOptions)}
                                    className="px-4 py-2 bg-blue-900 bg-opacity-30 hover:bg-opacity-50 text-blue-200 rounded-lg transition-all"
                                >
                                    {showAvatarOptions ? 'Hide Avatars' : 'Choose from Avatars'}
                                </button>

                                {showAvatarOptions && (
                                    <div className="grid grid-cols-3 gap-4 p-4 bg-gray-800 bg-opacity-50 rounded-lg">
                                        {avatarOptions.map((avatar, index) => (
                                            <div
                                                key={index}
                                                onClick={() => selectAvatar(avatar)}
                                                className={`cursor-pointer p-1 rounded-full transition-all ${formData.selectedAvatar === avatar ? 'ring-2 ring-blue-400' : 'hover:ring-1 hover:ring-blue-200'}`}
                                            >
                                                <img
                                                    src={avatar}
                                                    alt={`Avatar ${index + 1}`}
                                                    className="w-16 h-16 rounded-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <p className="text-blue-300 text-opacity-80 text-sm text-center">
                                    Add a profile photo or choose from our avatars. This helps people recognize you.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 1: Interests */}
                    {step === 1 && (
                        <div className="animate-fadeIn">
                            <div className="mb-6">
                                <h3 className="text-blue-100 font-medium mb-2">Select your interests</h3>
                                <p className="text-blue-300 text-opacity-80 text-sm">We'll use this to personalize your content (Select at least 3)</p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {interestOptions.map((interest) => (
                                    <button
                                        key={interest}
                                        type="button"
                                        onClick={() => toggleInterest(interest)}
                                        className={`py-2 px-4 rounded-lg border transition-all ${formData.interests.includes(interest)
                                            ? 'bg-blue-600 bg-opacity-50 border-blue-400 text-white'
                                            : 'bg-gray-800 bg-opacity-30 border-blue-800 text-blue-200 hover:bg-opacity-50'}`}
                                    >
                                        {interest}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: About You */}
                    {step === 2 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div>
                                <label className="block text-blue-100 mb-2">Profession</label>
                                <input
                                    type="text"
                                    name="profession"
                                    value={formData.profession}
                                    onChange={handleChange}
                                    className="w-full bg-gray-800 bg-opacity-50 border border-blue-800 rounded-lg px-4 py-3 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="What do you do?"
                                />
                            </div>

                            <div>
                                <label className="block text-blue-100 mb-2">Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full bg-gray-800 bg-opacity-50 border border-blue-800 rounded-lg px-4 py-3 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="Where are you based?"
                                />
                            </div>

                            <div>
                                <label className="block text-blue-100 mb-2">Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full bg-gray-800 bg-opacity-50 border border-blue-800 rounded-lg px-4 py-3 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="Tell us about yourself (at least 20 characters)"
                                ></textarea>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-blue-100 font-medium">Social Links (Optional)</h4>

                                <div className="flex items-center space-x-2">
                                    <div className="bg-blue-900 bg-opacity-30 p-2 rounded-lg">
                                        <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        name="social-twitter"
                                        value={formData.socialLinks.twitter}
                                        onChange={handleChange}
                                        className="flex-1 bg-gray-800 bg-opacity-50 border border-blue-800 rounded-lg px-4 py-2 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        placeholder="Twitter username"
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <div className="bg-blue-900 bg-opacity-30 p-2 rounded-lg">
                                        <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        name="social-linkedin"
                                        value={formData.socialLinks.linkedin}
                                        onChange={handleChange}
                                        className="flex-1 bg-gray-800 bg-opacity-50 border border-blue-800 rounded-lg px-4 py-2 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        placeholder="LinkedIn profile URL"
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <div className="bg-blue-900 bg-opacity-30 p-2 rounded-lg">
                                        <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        name="social-github"
                                        value={formData.socialLinks.github}
                                        onChange={handleChange}
                                        className="flex-1 bg-gray-800 bg-opacity-50 border border-blue-800 rounded-lg px-4 py-2 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        placeholder="GitHub username"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review */}
                    {step === 3 && (
                        <div className="animate-fadeIn">
                            <div className="flex flex-col sm:flex-row space-y-6 sm:space-y-0 sm:space-x-6">
                                <div className="flex-shrink-0">
                                    <div className="w-24 h-24 rounded-full bg-gray-800 bg-opacity-50 border border-blue-800 overflow-hidden">
                                        <img
                                            src={formData.previewPhoto}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-blue-100">{formData.name}</h3>
                                        <p className="text-blue-300">{formData.profession}</p>
                                        <p className="text-blue-400 text-opacity-80 text-sm">{formData.location}</p>
                                    </div>

                                    <div>
                                        <h4 className="text-blue-100 font-medium mb-2">About</h4>
                                        <p className="text-blue-300 text-opacity-90">{formData.bio}</p>
                                    </div>

                                    <div>
                                        <h4 className="text-blue-100 font-medium mb-2">Interests</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.interests.map(interest => (
                                                <span key={interest} className="bg-blue-900 bg-opacity-30 text-blue-200 px-3 py-1 rounded-full text-sm">
                                                    {interest}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {Object.values(formData.socialLinks).some(link => link) && (
                                        <div>
                                            <h4 className="text-blue-100 font-medium mb-2">Social Links</h4>
                                            <div className="flex space-x-4">
                                                {formData.socialLinks.twitter && (
                                                    <a href={`https://twitter.com/${formData.socialLinks.twitter}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                                        </svg>
                                                    </a>
                                                )}

                                                {formData.socialLinks.linkedin && (
                                                    <a href={formData.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                                        </svg>
                                                    </a>
                                                )}

                                                {formData.socialLinks.github && (
                                                    <a href={`https://github.com/${formData.socialLinks.github}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                            <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                                                        </svg>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 p-4 bg-blue-900 bg-opacity-10 rounded-lg border border-blue-800 border-opacity-50">
                                <h4 className="text-blue-100 font-medium mb-2">Email</h4>
                                <p className="text-blue-300">{formData.email}</p>
                            </div>
                        </div>
                    )}

                    {/* Navigation buttons */}
                    <div className="mt-8 flex justify-between">
                        {step > 0 ? (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="px-6 py-2 rounded-lg bg-transparent border border-blue-700 text-blue-300 hover:bg-blue-900 hover:bg-opacity-30 transition-all"
                            >
                                Back
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={skipSetup}
                                className="px-6 py-2 rounded-lg bg-transparent border border-blue-700 text-blue-300 hover:bg-blue-900 hover:bg-opacity-30 transition-all"
                            >
                                Skip for now
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`px-6 py-2 rounded-lg flex items-center space-x-2 transition-all ${isSubmitting
                                ? 'bg-blue-700 bg-opacity-50 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-500'}`}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <span>{step === 3 ? 'Complete Setup' : 'Continue'}</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSetup;