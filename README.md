# Peer2Stream 🎬🍿

Welcome to Peer2Stream! This is your all-in-one spot to discover, watch, and organize your favorite movies and TV shows. Super easy, super fun! 🚀

## What is Peer2Stream? 🤔

Peer2Stream is a web app built with Next.js that lets you explore trending movies and series, search for what you love, save your favorites in your own videoclub, and keep track of what you’ve watched. Everything is designed for a smooth experience on your computer! 💻

## Features ✨

- **External Plugin Integration** – Watch content using external plugins for a better viewing experience 🎥
- **TMDB Integration** – All info and covers come from The Movie Database (TMDB) 🗂️
- **Easy Login & Register** – Sign up, log in, and reset your password in a snap 🔐
- **Personal Dashboard** – Edit your profile and tweak your settings 👤
- **Content Discovery** – Find trending stuff, filter by genre, provider, and more 🔎
- **Videoclub** – Save, sort, and search your favorite movies and shows ⭐
- **Watch Progress Tracking** – Never lose your place! Continue watching anytime ⏩
- **Recommendations** – Get suggestions based on your tastes 🤩
- **Where to Watch** – See which platforms have your content 📺
- **Trailers** – Watch trailers right in the app 🎞️
- **Notifications** – Stay in the loop with updates and news 🔔
- **Full Details** – See cast, ratings, and more for every title 📝
- **TV Show Management** – Browse seasons and episodes, track your progress 📅
- **User Preferences** – Set your language and video quality 🌍
- **Made for Desktop** – Best viewed on your computer! 🖥️

## Tech Stack 🛠️

- **Frontend**
  - Next.js 15.3.0 (React 19)
  - CSS Modules
  - Material UI & Icons
  - Framer Motion (animations)
  - TailwindCSS

- **Backend**
  - MongoDB + Mongoose
  - JWT (auth)
  - bcrypt.js (passwords)
  - Nodemailer (emails)

- **External Services**
  - TMDB API
  - External media plugins
  - Streaming platform integration

- **Other Tools**
  - Vercel Analytics
  - React Icons
  - DND Kit (drag & drop)
  - Custom video player

## Getting Started 🚦

### What you need:
- Node.js (v18+)
- npm or yarn
- MongoDB (local or cloud)

### Setup Steps

1. Clone this repo:
   ```bash
   git clone https://github.com/yourusername/peer2stream.git
   cd peer2stream-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
yarn install
   ```
3. Add a `.env.local` file with:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key_for_jwt
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
   EXTERNAL_PLUGIN_URL=http://localhost:3000
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-email-password
   EMAIL_FROM=noreply@peer2stream.com
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
   _Tip: Get a free TMDB API key [here](https://www.themoviedb.org/documentation/api) and make sure you have a compatible media plugin installed!_

4. Start the app:
   ```bash
   npm run dev
   # or
yarn dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser and enjoy! 🎉

## Environment Variables 🌱

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:password@cluster.mongodb.net/peer2stream` |
| `JWT_SECRET` | Secret key for JWT | `your-strong-secret-key` |
| `NEXT_PUBLIC_API_URL` | API base URL | `http://localhost:3000/api` |
| `NEXT_PUBLIC_TMDB_API_KEY` | TMDB API key | `your-tmdb-api-key` |
| `EXTERNAL_PLUGIN_URL` | Media plugin URL | `http://localhost:3000` |
| `SMTP_HOST` | SMTP server | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | SMTP username | `your-email@gmail.com` |
| `SMTP_PASSWORD` | SMTP password | `your-email-password` |
| `EMAIL_FROM` | Sender email | `noreply@peer2stream.com` |
| `NEXT_PUBLIC_SITE_URL` | Public site URL | `https://peer2stream.live` |

## How to Use Peer2Stream 🕹️

### Sign Up & Log In
1. Go to the login page and hit "Register" to make an account ✍️
2. Check your email if needed
3. Log in and you’re set!

### Discover Content
1. Click the compass icon 🧭 to explore trending stuff
2. Use filters to find exactly what you want
3. Click any card for more info

### Your Videoclub
1. Add movies/series to your Videoclub with one click ⭐
2. Access your collection via the Videoclub icon 🎬
3. Sort, search, and manage your faves

### Watching Stuff
1. Click a card to see details
2. For movies, hit play ▶️ (make sure your plugin is ready!)
3. For TV shows, pick a season/episode and start watching 📺
4. Your progress is saved automatically
5. Continue anytime from the "Continue Watching" section 🔄
6. See where else you can watch with direct links 🌐

## API Reference 📚

### Auth
- `POST /api/auth/register` – Register
- `POST /api/auth/login` – Log in
- `POST /api/auth/logout` – Log out
- `GET /api/auth/me` – Who am I?
- `POST /api/auth/forgot-password` – Forgot password
- `POST /api/auth/reset-password` – Reset password
- `PUT /api/auth/update` – Update user info

### Content
- `GET /api/content-status` – All your watch status
- `GET /api/content-status?status=pending` – In-progress stuff
- `GET /api/content-status/[externalId]` – Status for a specific title
- `POST /api/content-status` – Update watch status

### User Settings
- `GET /api/user/settings/getSettings` – Get settings
- `PUT /api/user/settings/updateSettings` – Update settings
- `GET /api/user/favourites/getFavourites` – Get favorites
- `PUT /api/user/favourites/updateFavourites` – Update favorites
- `POST /api/user/favourites/updateFavourites` – Add to favorites
- `GET /api/user/notifications` – Get notifications
- `POST /api/user/notifications` – New notification

### TMDB & External
- `GET https://api.themoviedb.org/3/find/{external_id}` – Find by IMDB
- `GET https://api.themoviedb.org/3/trending/{media_type}/{time_window}` – Trending
- `GET https://api.themoviedb.org/3/{media_type}/{id}/watch/providers` – Streaming providers
- `GET https://api.themoviedb.org/3/{media_type}/{id}/videos` – Trailers
- `GET https://api.themoviedb.org/3/{media_type}/{id}/similar` – Similar content

## Want to Contribute? 🤝

1. Fork this repo
2. Make a new branch (`git checkout -b cool-feature`)
3. Commit your changes (`git commit -m 'Add cool feature'`)
4. Push and open a Pull Request

Please follow the code style and add tests if you can! 🧪

## License 📄

MIT License – see the LICENSE file for details.

## Thanks & Credits 🙏

- [Next.js](https://nextjs.org/) – The React framework
- [MongoDB](https://www.mongodb.com/) – Database
- [Material UI](https://mui.com/) – UI components
- [The Movie Database (TMDB)](https://www.themoviedb.org/) – API & content
- [Framer Motion](https://www.framer.com/motion/) – Animations
- [Vercel](https://vercel.com/) – Hosting
- [TailwindCSS](https://tailwindcss.com/) – Styling
- Everyone who helped make this project awesome! 🚀

## System Requirements 🖥️

- **Desktop Only**: Best on a computer (not mobile!)
- **Modern Browser**: Chrome, Firefox, Safari, Edge
- **Internet**: Needed for streaming & discovery
- **Browser Plugins**: You’ll need a compatible media plugin
- **Plugin Permissions**: Allow the plugin to play media
