import React from 'react';
import './InstructionsPlaceholder.css';

const InstructionsPlaceholder: React.FC = () => {
  return (
    <div className="instructions-placeholder">
      <div className="instructions-header">
        <h2>How Shop Buddy Works</h2>
        <p>Get AI-powered solutions with integrated product recommendations</p>
      </div>
      
      <div className="instructions-content">
        <section className="instruction-section">
          <h3>🎯 Step 1: Describe Your Problem</h3>
          <p>Tell us what you're trying to solve, build, fix, or accomplish. Be as specific as possible for better results.</p>
        </section>

        <section className="instruction-section">
          <h3>🛍️ Step 2: Choose Your Preferences</h3>
          <p>Set your maximum budget, select your location, and choose which stores to search for the best deals.</p>
        </section>

        <section className="instruction-section">
          <h3>🧠 Step 3: Get AI Solutions</h3>
          <p>Our AI will generate a comprehensive step-by-step solution with specific product recommendations and alternatives.</p>
        </section>

        <section className="examples-section">
          <h3>💡 Try These Examples</h3>
          <div className="example-grid">
            <div className="example-card">
              <h4>🖥️ Tech Problems</h4>
              <ul>
                <li>"My laptop is running slowly"</li>
                <li>"I need a home office setup"</li>
                <li>"Build a gaming PC under $1000"</li>
                <li>"Set up a smart home system"</li>
              </ul>
            </div>

            <div className="example-card">
              <h4>🏠 Home Improvement</h4>
              <ul>
                <li>"Organize my garage efficiently"</li>
                <li>"Create a cozy reading nook"</li>
                <li>"Install outdoor security lighting"</li>
                <li>"Build a raised garden bed"</li>
              </ul>
            </div>

            <div className="example-card">
              <h4>🎨 Creative Projects</h4>
              <ul>
                <li>"Set up a home art studio"</li>
                <li>"Build a photography backdrop"</li>
                <li>"Create a podcast recording setup"</li>
                <li>"Design a craft room"</li>
              </ul>
            </div>

            <div className="example-card">
              <h4>🏋️ Health & Fitness</h4>
              <ul>
                <li>"Create a home gym in my basement"</li>
                <li>"Set up an outdoor workout space"</li>
                <li>"Build a meditation corner"</li>
                <li>"Organize healthy meal prep"</li>
              </ul>
            </div>

            <div className="example-card">
              <h4>🌱 Outdoor Projects</h4>
              <ul>
                <li>"Build a treehouse for kids"</li>
                <li>"Create an outdoor entertainment area"</li>
                <li>"Set up container gardening"</li>
                <li>"Install a backyard fire pit"</li>
              </ul>
            </div>

            <div className="example-card">
              <h4>🔧 DIY & Repairs</h4>
              <ul>
                <li>"Fix squeaky door hinges"</li>
                <li>"Build custom storage shelves"</li>
                <li>"Repair a leaky faucet"</li>
                <li>"Install new light fixtures"</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="tips-section">
          <h3>✨ Pro Tips</h3>
          <div className="tips-list">
            <div className="tip">
              <strong>Be Specific:</strong> Instead of "I need storage," try "I need to organize my small apartment bedroom closet."
            </div>
            <div className="tip">
              <strong>Include Context:</strong> Mention your space size, budget range, and any constraints or preferences.
            </div>
            <div className="tip">
              <strong>Ask Questions:</strong> Include questions like "What's the best way to..." or "How do I..."
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default InstructionsPlaceholder; 