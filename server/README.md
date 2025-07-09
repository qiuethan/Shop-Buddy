# 🛒 Shop Buddy

A smart web application that helps users find the perfect products to solve their problems. Simply describe your issue, and Shop Buddy will use AI to generate relevant search keywords and find products from Google Shopping.

## 🚀 Features

- **AI-Powered Problem Analysis**: Uses GPT-4o to understand user problems and generate optimal search keywords
- **Product Search**: Integrates with SerpAPI to find relevant products from Google Shopping
- **Beautiful UI**: Modern, responsive React interface with product cards and smooth animations
- **Real-time Results**: Fast search results with loading states and error handling

## 🛠️ Tech Stack

**Frontend:**
- React 18 with TypeScript
- CSS3 with modern styling
- Responsive design

**Backend:**
- Node.js with Express
- OpenAI GPT-4o API for AI keyword generation
- SerpAPI for product search
- CORS enabled for cross-origin requests

## 📋 Prerequisites

Before running this application, make sure you have:

1. **Node.js** (v14 or higher)
2. **npm** (v6 or higher)
3. **OpenAI API Key** from OpenAI
4. **SerpAPI Key** from SerpAPI

## 🔧 Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd shop-buddy

# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory (copy from `env.template`):

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# SerpAPI Configuration
SERPAPI_KEY=your_serpapi_key_here

# Server Configuration
PORT=5000
```

### 3. Get API Keys

#### OpenAI API Key:
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env` file

#### SerpAPI Key:
1. Go to [SerpAPI](https://serpapi.com/)
2. Create an account or sign in
3. Navigate to API Key section
4. Copy your API key to your `.env` file

### 4. Run the Application

```bash
# Option 1: Run both frontend and backend together
npm run dev

# Option 2: Run them separately
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🎯 Usage

1. **Open the application** in your browser at `http://localhost:3000`
2. **Describe your problem** in the text area (e.g., "my stone patio is cracked")
3. **Click "Find Solutions"** to start the search
4. **View results** with AI-generated keywords and product recommendations
5. **Click on products** to view them on the retailer's website

## 📁 Project Structure

```
shop-buddy/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SearchForm.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── App.tsx
│   │   └── index.tsx
│   └── package.json
├── server/                 # Node.js backend
│   └── index.js
├── .env                    # Environment variables
├── env.template           # Environment template
├── package.json           # Root package.json
└── README.md
```

## 🔍 API Endpoints

### Backend Routes

**GET /api/health**
- Health check endpoint
- Returns: `{ "status": "Server is running!" }`

**POST /api/find-solutions**
- Main endpoint for finding product solutions
- Body: `{ "problem": "description of the problem" }`
- Returns: `{ "keywords": "generated keywords", "products": [...] }`

## 🎨 Customization

### Adding New Example Problems

Edit the `exampleProblems` array in `client/src/components/SearchForm.tsx`:

```typescript
const exampleProblems = [
  "my stone patio is cracked",
  "my kitchen faucet is leaking",
  // Add your examples here
];
```

### Modifying GPT-4o Prompt

Update the prompt in `server/index.js` in the `generateSearchKeywords` function:

```javascript
content: `Your custom prompt here...`
```

### Styling Changes

Modify the CSS files in `client/src/components/` to customize the appearance.

## 🐛 Troubleshooting

### Common Issues

1. **API Key Errors**: Make sure your `.env` file has the correct API keys
2. **CORS Issues**: Ensure the backend is running on port 5000
3. **No Products Found**: Try different problem descriptions or check API quotas
4. **Loading Issues**: Check network connectivity and API service status

### Debug Mode

Enable debug logs by checking the browser console and server terminal for detailed error messages.

## 📊 Example Usage

**Input:** "my stone patio is cracked"

**AI-Generated Keywords:** "stone patio repair, concrete crack filler, masonry sealer, patio restoration kit"

**Results:** 12 relevant products from various retailers with images, prices, and direct links

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for GPT-4o API
- [SerpAPI](https://serpapi.com/) for Google Shopping integration
- [React](https://reactjs.org/) for the frontend framework
- [Express](https://expressjs.com/) for the backend framework

---

**Happy Shopping! 🛍️** 