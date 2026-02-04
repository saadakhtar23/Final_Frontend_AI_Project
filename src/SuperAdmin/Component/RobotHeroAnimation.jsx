import React, { useState } from 'react';
import Lottie from 'lottie-react';
import robotAnimation from '../../Component 18.json';
 
const RobotHeroAnimation = () => {
  const [isHovered, setIsHovered] = useState(false);
 
  // Main Container Styles
  const containerStyle = {
    position: 'relative',
    width: '400px',
    height: '400px',
    borderRadius: '24px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'sans-serif',
    color: 'white',
    // Using a gradient similar to the image as a fallback
    background: 'linear-gradient(135deg, #a020f0 0%, #d330f9 100%)',
  };
 
  // Background Lottie Styles
  const lottieStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1, // Stays behind text
  };
 
  // Foreground Content Styles
  const contentStyle = {
    position: 'relative',
    zIndex: 2, // Sits above the animation
    padding: '30px',
    textAlign: 'right', // Aligned to the right like the image
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  };
 
  const buttonStyle = {
    marginTop: '20px',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
    background: 'rgba(255, 255, 255, 0.2)', // Semi-transparent
    border: '1px solid rgba(255, 255, 255, 0.5)',
    borderRadius: '50px',
    cursor: 'pointer',
    backdropFilter: 'blur(10px)', // Frosty glass effect
    transition: 'all 0.3s ease',
    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
    boxShadow: isHovered
      ? '0 8px 15px rgba(0,0,0,0.2)'
      : '0 4px 6px rgba(0,0,0,0.1)',
  };
 
  return (
    <div style={containerStyle}>
      {/* 1. Animation Layer (Background) */}
      <Lottie
        animationData={robotAnimation}
        loop={true}
        style={lottieStyle}
      />
 
      {/* 2. Text & Button Layer (Foreground) */}
      <div style={contentStyle}>
        <h1 style={{ fontSize: '28px', margin: '0 0 10px 0', fontWeight: 'bold' }}>
          Command Everything <br /> Effortlessly
        </h1>
        <p style={{ fontSize: '14px', opacity: 0.9, lineHeight: '1.4', maxWidth: '280px' }}>
          Rule the system confidently with powerful controls and playful efficiency
        </p>
       
        {/* <button
          style={buttonStyle}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          View Enquiry Messages
        </button> */}
      </div>
    </div>
  );
};
 
export default RobotHeroAnimation;