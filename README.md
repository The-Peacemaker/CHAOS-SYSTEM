# VOICE OF CAMPUS

**"Order is for the weak. Embrace the Chaos."**

A Brutalist, high-energy College Community & Governance System designed to disrupt the mundane. This MVP (Minimum Viable Product) provides a platform for student engagement, voting, and campus safety with a unique, chaotic aesthetic.

## 🚧 Features

- **🔥 Brutalist UI:** A raw, chaotic, and high-contrast design system (Yellow, Cyan, Magenta, Black).
- **🖤 EMO BOY AI:** An AI-powered, emotionally supportive (and slightly dramatic) campus companion powered by Gemini.
- **🏆 Leaderboard:** Top 10 students with a "Podium" style showcase for the top 3 based on Karma points.
- **🗳️ Campus Elections:** Real-time voting system for student council positions.
- **📢 The Wall:** Anonymous feedback, rants, and suggestions.
- **🚨 SOS Alert:** Instant emergency trigger for campus safety.
- **👨‍🏫 Professor Mode:** Admin capabilities to manage elections and oversee the platform.

## 🛠️ Tech Stack

- **Frontend:** Vanilla HTML, CSS (Brutalist Design), JavaScript
- **Backend:** Node.js, Express.js
- **Database:** Firebase Firestore (via `firebase-admin`)
- **AI:** Google Gemini (via OpenRouter API)
- **Auth:** JWT (JSON Web Tokens)

## 🚀 Setup & Run

### 1. Prerequisites
- Node.js installed (v14+ recommended)
- A Firebase Project (Firestore Database enabled)
- An OpenRouter or Google Gemini API Key

### 2. Clone the Repository
```bash
git clone <your-repo-url>
cd HACKATHON
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Firebase Setup
1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Create a new project (or use an existing one).
3.  Navigate to **Project Settings** > **Service accounts**.
4.  Click **Generate new private key**.
5.  Save the downloaded JSON file as `serviceAccountKey.json` in the root directory of this project.

### 5. Environment Configuration
Create a `.env` file in the root directory and add your API keys:

```env
# Choose one or both depending on your configuration
GEMINI_API_KEY=your_gemini_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### 6. Seed the Database
Initialize the database with sample data (Users, Posts, Elections):

```bash
node reset_db.js
```
*Note: This will clear existing data in the collections specified in the script.*

### 7. Start the Server
```bash
npm start
```
The server will start on port 3000.
Visit `http://localhost:3000` in your browser to enter the system.

## 🔑 Test Credentials

**Student Account:**
- **Email:** `alice@example.com`
- **Password:** `password123`

**Professor (Admin) Account:**
- **Email:** `bob@example.com`
- **Password:** `password123`

## ⚠️ Disclaimer

This is a hackathon project. It is designed for demonstration purposes. Ensure you have the `serviceAccountKey.json` correctly placed before starting the server.
