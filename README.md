# CheckPoint-PersonalizedGamingJournal

CheckPoint is a web application designed for gamers to track their progress in the games they are playing and plan to play in the future. It helps users log their gaming sessions, create journal entries for games they play, and visualize their progress over time. With CheckPoint, you'll never forget where you left off in a game!

---

## Tech Stack:

CheckPoint is built using the following technologies:

- **Frontend**: 
  - [React](https://reactjs.org/) with [Next.js](https://nextjs.org/) for server-side rendering and routing.
  - [Mantine](https://mantine.dev/) for UI components and styling.
  - [TypeScript](https://www.typescriptlang.org/) for type safety.

- **Backend**:
  - [Node.js](https://nodejs.org/) with [Next.js API routes](https://nextjs.org/docs/api-routes/introduction).
  - [MongoDB](https://www.mongodb.com/) for the database.
  - [IGDB API](https://www.igdb.com/api) for game data.

- **Authentication**:
  - [Better-Auth](https://www.better-auth.com/) for the authentication system with Email/Password or social media providers like Google and Discord

- **Other Tools**:
  - [Toast](https://react-hot-toast.com/) for notifications.
  - [Lucide Icons](https://lucide.dev/) for icons.
  - [Tabler Icons](https://tabler-icons.io/) for additional icons.

---

## Getting Started

Follow these steps to set up the project locally:

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/) (local or cloud instance)
- IGDB API credentials (client ID and client secret)

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/CheckPoint-PersonalizedGamingJournal.git
   cd CheckPoint-PersonalizedGamingJournal

2. **Install Dependencies**:
   ```
    npm install
    # or
    yarn install

4. **Set up Enviroment Variables**:
    Create a .env.local file in the root directory and add the following variables:

    MONGODB_URI=your-mongodb-connection-string
    IGDB_CLIENT_ID=your-igdb-client-id
    IGDB_CLIENT_SECRET=your-igdb-client-secret
    NEXT_PUBLIC_BASE_URL=http://localhost:3000

## **Features:**
  - **Detailed Game Information:** Learn more about the details of a game, like storylines, companies involved, and screenshots to view.
 - **Game Tracking:** Log games you're playing, completed, or plan to play.
 - **Journal Entries:** Add detailed journal entries for each game session.
 - **Responsive Design:** Works seamlessly on desktop and mobile devices.

## Acknowledgements:
  - Data provided by [IGDB](https://www.igdb.com/api).
  - Icons by Lucide and Tabler.
