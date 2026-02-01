import  { useState, useEffect, useRef } from 'react';

const FAQ = () => {
    const [activeIndex, setActiveIndex] = useState(-1);
    const faqCards = useRef([]);
    const particlesRef = useRef(null);
    const audioRef = useRef(null);

    const faqs = [
        {
            question: "What is Ininsico?",
            answer: "The world's first AI-powered 3D modeling platform that automates asset creation while giving you full control in Unity/Blender."
        },
        {
            question: "How does AI modeling work?",
            answer: "Describe what you need ('cyberpunk car' or 'fantasy sword') and our neural networks generate production-ready 3D models with perfect topology."
        },
        {
            question: "Can I edit the AI models?",
            answer: "Yes! Every generated model is fully editable in Blender or Unity with clean quads, proper UVs, and PBR materials."
        },
        {
            question: "What about animations?",
            answer: "Our AI can rig and animate characters automatically. Just upload a reference video and get FBX animations ready for game engines."
        },
        {
            question: "Is there real-time collaboration?",
            answer: "Teams work together in synchronized 3D spaces with live updates, version history, and commenting tools."
        },
        {
            question: "System requirements?",
            answer: "Runs in browser! For AI features: RTX 3060+ recommended. Cloud rendering available for weaker devices."
        }
    ];

    // Initialize effects
    useEffect(() => {
        // Sound effect on flip
        audioRef.current = new Audio('https://assets.codepen.io/605876/flip-card.mp3');
        audioRef.current.volume = 0.3;

        // 3D card hover effects
        faqCards.current.forEach((card, index) => {
            // VanillaTilt for 3D perspective
            card.style.transformStyle = 'preserve-3d';
            card.style.transition = 'transform 0.5s ease, box-shadow 0.3s ease';

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateY = (x - centerX) / 20;
                const rotateX = (centerY - y) / 20;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                card.style.boxShadow = `${-rotateY * 2}px ${rotateX * 2}px 30px rgba(74, 144, 226, 0.3)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
                card.style.boxShadow = '0 10px 25px -5px rgba(74, 144, 226, 0.1)';
            });
        });

        // Floating dots animation
        const canvas = particlesRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const dots = Array.from({ length: 50 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5
        }));

        const animateParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw connecting lines
            ctx.strokeStyle = 'rgba(74, 144, 226, 0.1)';
            ctx.lineWidth = 0.5;

            for (let i = 0; i < dots.length; i++) {
                for (let j = i + 1; j < dots.length; j++) {
                    const dx = dots[i].x - dots[j].x;
                    const dy = dots[i].y - dots[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 150) {
                        ctx.beginPath();
                        ctx.moveTo(dots[i].x, dots[i].y);
                        ctx.lineTo(dots[j].x, dots[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Update and draw dots
            ctx.fillStyle = 'rgba(42, 195, 222, 0.8)';
            dots.forEach(dot => {
                dot.x += dot.speedX;
                dot.y += dot.speedY;

                // Boundary check
                if (dot.x < 0 || dot.x > canvas.width) dot.speedX *= -1;
                if (dot.y < 0 || dot.y > canvas.height) dot.speedY *= -1;

                ctx.beginPath();
                ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
                ctx.fill();
            });

            requestAnimationFrame(animateParticles);
        };

        animateParticles();

        // Entry animation
        const timer = setTimeout(() => {
            faqCards.current.forEach((card, i) => {
                anime({
                    targets: card,
                    opacity: [0, 1],
                    translateY: [50, 0],
                    duration: 800,
                    delay: i * 100,
                    easing: 'easeOutBack'
                });
            });
        }, 300);

        return () => clearTimeout(timer);
    }, []);

    const flipCard = (index) => {
        if (activeIndex === index) {
            anime({
                targets: faqCards.current[index],
                rotateY: 0,
                duration: 800,
                easing: 'easeInOutBack'
            });
            setActiveIndex(-1);
        } else {
            if (activeIndex !== -1) {
                anime({
                    targets: faqCards.current[activeIndex],
                    rotateY: 0,
                    duration: 600,
                    easing: 'easeInOutBack'
                });
            }
            audioRef.current.play();
            anime({
                targets: faqCards.current[index],
                rotateY: 180,
                duration: 800,
                easing: 'easeInOutBack'
            });
            setActiveIndex(index);
        }
    };

    return (
        <div style={{
            position: 'relative',
            minHeight: '100vh',
            padding: '5rem 0',
            overflow: 'hidden',
            background: 'linear-gradient(to bottom right, #0a1a3a, #162a4a)'
        }}>
            {/* Particle Background Canvas */}
            <canvas
                ref={particlesRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 0,
                    opacity: 0.3
                }}
            />

            <div style={{
                position: 'relative',
                zIndex: 10,
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 1rem'
            }}>
                <h1 style={{
                    fontSize: '3.5rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginBottom: '5rem',
                    background: 'linear-gradient(to right, #2ac3de, #4a90e2)',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    backgroundSize: '200% auto',
                    animation: 'textShine 3s linear infinite alternate'
                }}>
                    Frequently Asked Questions
                </h1>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem'
                }}>
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            ref={el => faqCards.current[index] = el}
                            style={{
                                position: 'relative',
                                height: '320px',
                                cursor: 'pointer',
                                transformStyle: 'preserve-3d',
                                opacity: 0 // Start hidden for entry animation
                            }}
                            onClick={() => flipCard(index)}
                        >
                            {/* Front Side */}
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                backfaceVisibility: 'hidden',
                                borderRadius: '1rem',
                                padding: '2rem',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                opacity: activeIndex === index ? 0 : 1,
                                background: 'linear-gradient(to bottom right, rgba(10, 26, 58, 0.7), rgba(22, 42, 74, 0.5))',
                                border: '1px solid rgba(74, 144, 226, 0.2)',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                                transition: 'opacity 0.3s ease'
                            }}>
                                <h3 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    color: 'white',
                                    marginBottom: '1rem'
                                }}>
                                    {faq.question}
                                </h3>
                                <div style={{
                                    marginTop: 'auto',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <span style={{
                                        fontSize: '0.875rem',
                                        color: 'rgba(180, 210, 255, 0.7)'
                                    }}>
                                        Click to flip
                                    </span>
                                    <div style={{
                                        width: '2.5rem',
                                        height: '2.5rem',
                                        borderRadius: '50%',
                                        background: 'rgba(74, 144, 226, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '1px solid rgba(74, 144, 226, 0.3)'
                                    }}>
                                        <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="rgba(42, 195, 222, 1)"
                                            strokeWidth="2"
                                        >
                                            <path d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Back Side (Answer) */}
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                backfaceVisibility: 'hidden',
                                borderRadius: '1rem',
                                padding: '2rem',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                transform: 'rotateY(180deg)',
                                opacity: activeIndex === index ? 1 : 0,
                                background: 'linear-gradient(to bottom right, rgba(42, 195, 222, 0.2), rgba(74, 144, 226, 0.3))',
                                border: '1px solid rgba(42, 195, 222, 0.3)',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 10px 25px -5px rgba(42, 195, 222, 0.2)',
                                transition: 'opacity 0.3s ease',
                                overflowY: 'auto'
                            }}>
                                <p style={{
                                    color: 'rgba(220, 240, 255, 0.9)',
                                    fontSize: '1.125rem',
                                    lineHeight: '1.6',
                                    marginBottom: '1.5rem'
                                }}>
                                    {faq.answer}
                                </p>
                                <button
                                    style={{
                                        marginTop: 'auto',
                                        alignSelf: 'flex-end',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '0.5rem',
                                        background: 'rgba(42, 195, 222, 0.2)',
                                        border: '1px solid rgba(42, 195, 222, 0.3)',
                                        color: 'rgba(220, 240, 255, 0.9)',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(42, 195, 222, 0.3)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(42, 195, 222, 0.2)'}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        flipCard(index);
                                    }}
                                >
                                    Flip Back
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Text shine animation */}
            <style>{`
        @keyframes textShine {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
      `}</style>
        </div>
    );
};

export default FAQ;