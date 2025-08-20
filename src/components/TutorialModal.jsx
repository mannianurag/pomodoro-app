import React from 'react';
import '../styles/TutorialModal.css';

export default function TutorialModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const steps = [
    {
      id: 1,
      title: "Choose a task",
      description: "Choose a task",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <circle cx="12" cy="12" r="3" fill="currentColor"/>
        </svg>
      ),
      color: "#D4AF37"
    },
    {
      id: 2,
      title: "Set the timer for 25 minutes and work all this time",
      description: "Set the timer for 25 minutes and work all this time",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      color: "#2E7D32"
    },
    {
      id: 3,
      title: "Take a break for 5 minutes",
      description: "Take a break for 5 minutes",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <path d="M10 8v8l6-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "#D32F2F"
    },
    {
      id: 4,
      title: "Repeat until task is finished",
      description: "Repeat until task is finished",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 3v5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 21v-5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "#F4A460"
    },
    {
      id: 5,
      title: "Take a 30 minutes break",
      description: "Take a 30 minutes break",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      color: "#D32F2F"
    }
  ];

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-modal">
        <div className="tutorial-header">
          <h2>The Pomodoro Technique</h2>
          <button className="tutorial-close-btn" onClick={onClose} aria-label="Close tutorial">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 8l8 8M16 8l-8 8" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </button>
        </div>

        <div className="tutorial-color-palette">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="palette-color" 
              style={{ backgroundColor: step.color }}
            />
          ))}
        </div>

        <div className="tutorial-steps">
          {steps.map((step) => (
            <div key={step.id} className="tutorial-step">
              <div className="step-icon-container" style={{ backgroundColor: step.color }}>
                <div className="step-icon">
                  {step.icon}
                </div>
                <div className="tomato-stem">
                  <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 0C6 0 4 2 4 4C4 6 6 8 8 8C10 8 12 6 12 4C12 2 10 0 8 0Z" fill="#2E7D32"/>
                    <path d="M7 2C7 2 6 3 6 4C6 5 7 6 8 6C9 6 10 5 10 4C10 3 9 2 8 2C7.5 2 7 2 7 2Z" fill="#4CAF50"/>
                  </svg>
                </div>
              </div>
              <div className="step-content">
                <p className="step-description">{step.description}</p>
                <div className="step-accent" style={{ backgroundColor: step.color }} />
              </div>
            </div>
          ))}
        </div>

        <div className="tutorial-footer">
          <button className="tutorial-start-btn" onClick={onClose}>
            Got it! Let's start
          </button>
        </div>
      </div>
    </div>
  );
}
