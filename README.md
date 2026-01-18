🚀 YouTube Analyzer (AI-Powered)

An AI-powered web application that analyzes YouTube videos and channels to help users decide whether content is worth watching or following.

Users can paste any YouTube video or channel URL, and the app provides:

Key statistics

Upload behavior insights

AI-generated summaries

Sentiment analysis of comments

A clear “worth watching” or “worth following” verdict

✨ Features
🔹 Video Analysis

Video title, views, upload date, and channel name

AI-generated video summary

Estimated good vs bad comment sentiment

“Worth watching” decision

Suggestions to improve video quality and value

🔹 Channel Analysis

Channel name, subscribers, total videos

Upload frequency (daily / weekly / bi-weekly / irregular)

AI-generated channel summary

Score (0–100) indicating overall channel quality

“Worth following” recommendation

🧠 How It Works

User enters a YouTube video or channel URL

Backend detects the URL type automatically

Data is fetched using YouTube Data API

AI analysis is generated using OpenAI

Frontend renders results dynamically based on input type

🛠 Tech Stack

Frontend

React (Vite)

Tailwind CSS

Fetch API

Backend

Node.js

Express

YouTube Data API v3

OpenAI API (GPT-4o-mini)

⚙️ Setup Instructions
1. Clone the repository
git clone https://github.com/your-username/youtube-analyzer.git
cd youtube-analyzer

2. Backend setup
cd src/backend
npm install


Create a .env file:

YOUTUBE_API_KEY=your_youtube_api_key
OPENAI_API_KEY=your_openai_api_key


Run backend:

node index.js

3. Frontend setup
npm install
npm run dev

📌 Example Use Cases

Decide whether a video is worth your time

Analyze creator consistency and content quality

Quickly understand unfamiliar YouTube channels

Learn from comment sentiment and audience feedback

🚧 Future Improvements

Playlist analysis

Video transcript-based analysis

User authentication

Save analysis history

Compare multiple channels

🧑‍💻 Author

Built by Tenzin Thinley as a full-stack AI project.