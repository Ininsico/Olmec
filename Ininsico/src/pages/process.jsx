// ProcessExportPage.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Process() {
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve the data from localStorage
    const sceneData = localStorage.getItem('currentSceneExport');
    
    if (sceneData) {
      try {
        const parsedData = JSON.parse(sceneData);
        // Process your data here
        console.log('Exported data:', parsedData);
        
        // Optionally clear the storage after processing
        localStorage.removeItem('currentSceneExport');
      } catch (error) {
        console.error('Error processing export data:', error);
        navigate('/'); // Redirect if error occurs
      }
    } else {
      // No data found, redirect back
      navigate('/');
    }
  }, [navigate]);

  return (
    <div>
      <h1>Processing Export</h1>
      <p>Your 3D scene is being processed...</p>
      {/* Add your export processing UI here */}
    </div>
  );
}

export default Process;