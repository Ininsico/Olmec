import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const ModelEditor = () => {
    const iframeRef = useRef(null);
    const navigate = useNavigate();
    useEffect(() => {
        const handlemessage = (e) => {
            if (e.orgin != window.location.origin) return;

            if (e.data.type == 'SAVE_MODEL') {
                console.log('Model data received:', event.data.modelData);
                alert('Model saved!')
                navigate('/')
            }
        };
        window.addEventListener('message', handlemessage);
        return () => window.removeEventListener('message', handlemessage);

    }, [navigate]);
    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <iframe ref={iframeRef} src="/ininsico.html" style={{ width: '100%', height: '100%', border: 'none' }} title="Ininsico-3D Model-desginer">
            </iframe>
        </div>
    )
};
export default ModelEditor