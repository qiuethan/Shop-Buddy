# Shop Buddy

An AI-powered shopping assistant that helps you solve problems by providing complete solutions with integrated product recommendations.

## What it does

Shop Buddy takes your problem description and generates:
- **AI-powered solutions** - Complete step-by-step guidance using OpenAI
- **Smart product recommendations** - Relevant products found across multiple stores
- **Organized browsing** - Products categorized for easy exploration
- **Customizable search** - Filter by price, location, and preferred stores

Simply describe any problem you're facing, and Shop Buddy will provide both the solution and suggest the right products to help you implement it.

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** - Build tool and dev server
- **Lucide React** - Icons
- **React Markdown** - Solution rendering

### Backend
- **Node.js** with Express.js
- **OpenAI API** - AI solution generation
- **SerpAPI** - Product search across stores
- **Security** - Helmet, CORS, rate limiting

## Getting Started

1. **Install dependencies:**
   ```bash
   # Install client dependencies
   cd client && npm install
   
   # Install server dependencies
   cd ../server && npm install
   ```

2. **Set up environment variables:**
   - Add your OpenAI API key and SerpAPI key

3. **Run the application:**
   ```bash
   # Start the server (from server directory)
   npm run dev
   
   # Start the client (from client directory)
   npm run dev
   ```

4. **Open your browser** to `http://localhost:3000` 