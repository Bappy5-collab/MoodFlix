# 🎭 Emo-Tone: Mood-Based YouTube Video Recommender

A privacy-first web application that detects your facial expressions in real-time and recommends YouTube videos based on your current mood.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- **Real-time Emotion Detection**: Uses face-api.js to detect emotions (happy, sad, neutral, surprised) directly in your browser
- **YouTube Integration**: Fetches and displays relevant YouTube videos based on detected mood
- **Privacy-First**: All face analysis runs locally - no images or biometric data are stored or uploaded
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Dark theme with vibrant accents and smooth animations

## 🔒 Privacy Commitment

- ✅ All face detection runs **locally in your browser**
- ✅ **No face images** are stored, uploaded, or transmitted
- ✅ **No face recognition** - only emotion classification
- ✅ Camera can be **stopped at any time**
- ✅ **No analytics** on face data

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A YouTube Data API v3 key ([Get one here](https://console.cloud.google.com/apis/credentials))

### Installation

1. **Clone the repository**
   ```bash
   cd emo-tone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   YOUTUBE_API_KEY=your_youtube_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the app**
   
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Getting a YouTube API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **YouTube Data API v3**:
   - Go to "APIs & Services" > "Library"
   - Search for "YouTube Data API v3"
   - Click "Enable"
4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
5. Copy the API key and add it to your `.env.local` file

## 📁 Project Structure

```
emo-tone/
├── app/
│   ├── api/
│   │   └── youtube/
│   │       └── route.ts      # YouTube API endpoint
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main page component
├── components/
│   ├── CameraFeed.tsx        # Camera with emotion detection
│   ├── ConsentModal.tsx      # Privacy consent modal
│   ├── EmotionDisplay.tsx    # Current emotion display
│   ├── VideoGrid.tsx         # YouTube video grid
│   └── VideoPlayer.tsx       # Video player modal
├── lib/
│   ├── emotionMapping.ts     # Emotion → keyword mapping
│   └── types.ts              # TypeScript definitions
├── env.example               # Environment variables template
├── next.config.js            # Next.js configuration
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## 🎨 Emotion → Video Mapping

| Emotion | Search Keywords |
|---------|----------------|
| 😊 Happy | Comedy, music, feel-good content |
| 😢 Sad | Motivational, relaxing, calming |
| 😐 Neutral | Educational, tech, documentaries |
| 😮 Surprised | Trending, amazing facts, discoveries |

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Face Detection**: [@vladmandic/face-api](https://github.com/vladmandic/face-api) (runs in browser)
- **Video API**: [YouTube Data API v3](https://developers.google.com/youtube/v3)
- **Styling**: CSS-in-JS with CSS Variables

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

> Note: Camera access requires HTTPS in production or localhost in development.

## 🔧 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## ⚠️ Troubleshooting

### Camera not working?
- Ensure your browser has camera permissions enabled
- Check that no other application is using the camera
- Try refreshing the page

### Videos not loading?
- Verify your YouTube API key is correct in `.env.local`
- Check your API quota in the Google Cloud Console
- Ensure the YouTube Data API v3 is enabled

### Face detection not working?
- Ensure good lighting conditions
- Position your face clearly in the camera view
- Try moving closer to the camera

## 📄 License

MIT License - feel free to use this project for learning and personal projects.

## 🙏 Acknowledgments

- [face-api.js](https://github.com/vladmandic/face-api) for the emotion detection models
- [YouTube](https://www.youtube.com) for the video platform and API
- [Next.js](https://nextjs.org) team for the amazing framework

---

**Built with 💜 and privacy in mind**

