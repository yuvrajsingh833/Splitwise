# Splitwise Clone - Expense Tracking Application

A modern, full-stack expense tracking application inspired by Splitwise, built with React, Node.js, Express, and SQLite.

## Features

### 🏠 **Group Management**
- Create expense groups with multiple users
- View group details including members and total expenses
- Intuitive group overview with member avatars

### 💰 **Expense Management**
- Add expenses with detailed descriptions and amounts
- Support for two split types:
  - **Equal Split**: Automatically divide expenses evenly among group members
  - **Percentage Split**: Custom percentage allocation for each member
- Track who paid for each expense
- Comprehensive expense history with timestamps

### 📊 **Balance Tracking**
- Real-time calculation of who owes whom
- Simplified balance resolution (nets out mutual debts)
- Personal balance dashboard across all groups
- Visual indicators for debts and credits

### 👥 **User Management**
- Create and manage users
- User avatars with initials
- User selection for personal balance views

### 🎨 **Modern UI/UX**
- Clean, responsive design with Tailwind CSS
- Smooth animations and transitions
- Intuitive navigation with clear visual hierarchy
- Mobile-optimized interface
- Beautiful color system with semantic states

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for development and building

### Backend
- **Node.js** with **Express**
- **SQLite** database for persistence
- **TypeScript** for type safety
- RESTful API design

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Docker and Docker Compose (for containerized setup)

### Option 1: Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the application:**
   ```bash
   npm run dev
   ```

   This command starts both the backend API server (port 3001) and the frontend development server (port 5173) concurrently.

3. **Access the application:**
   Open your browser and navigate to `http://localhost:5173`

### Option 2: Docker Setup (Recommended for Production)

1. **Quick setup with script:**
   ```bash
   ./scripts/docker-setup.sh
   ```

2. **Or manually with Docker Compose:**
   ```bash
   # Build and start all services
   docker-compose up -d

   # View logs
   docker-compose logs -f

   # Stop services
   docker-compose down
   ```

3. **Access the application:**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3001`
   - Production (with Nginx): `http://localhost:80`

### Option 3: Development with Docker

For development with hot reload:
```bash
docker-compose -f docker-compose.dev.yml up -d
```

## Docker Services

### Production Setup
- **backend**: Node.js API server with SQLite database
- **frontend**: React app served by Nginx
- **nginx**: Reverse proxy for production deployment (optional)

### Development Setup
- **backend-dev**: Node.js with hot reload and volume mounting
- **frontend-dev**: Vite dev server with hot reload

## API Documentation

### Base URL
`http://localhost:3001`

### Endpoints

#### Groups
- `GET /groups` - Get all groups
- `POST /groups` - Create a new group
  ```json
  {
    "name": "Weekend Trip",
    "user_ids": ["user-1", "user-2", "user-3"]
  }
  ```
- `GET /groups/{group_id}` - Get group details with members and expenses

#### Expenses
- `POST /groups/{group_id}/expenses` - Add expense to group
  ```json
  {
    "description": "Dinner at restaurant",
    "amount": 120.50,
    "paid_by": "user-1",
    "split_type": "equal"
  }
  ```
  
  For percentage splits:
  ```json
  {
    "description": "Hotel room",
    "amount": 200.00,
    "paid_by": "user-1",
    "split_type": "percentage",
    "splits": [
      {"user_id": "user-1", "percentage": 40},
      {"user_id": "user-2", "percentage": 35},
      {"user_id": "user-3", "percentage": 25}
    ]
  }
  ```

#### Balances
- `GET /groups/{group_id}/balances` - Get group balance summary
- `GET /users/{user_id}/balances` - Get personal balances across all groups

#### Users
- `GET /users` - Get all users
- `POST /users` - Create a new user
  ```json
  {
    "name": "John Doe"
  }
  ```

## Database Schema

### Tables
- **users**: User information (id, name, created_at)
- **groups**: Group information (id, name, created_at)
- **group_users**: Many-to-many relationship between groups and users
- **expenses**: Expense records (id, group_id, description, amount, paid_by, split_type, created_at)
- **expense_splits**: Individual split amounts for each user per expense

## Project Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── GroupList.tsx    # Groups overview
│   │   ├── CreateGroup.tsx  # Group creation form
│   │   ├── GroupDetail.tsx  # Group details and balances
│   │   ├── AddExpense.tsx   # Expense creation form
│   │   ├── PersonalBalances.tsx # User balance dashboard
│   │   └── UserManagement.tsx   # User creation and management
│   ├── App.tsx              # Main application component
│   └── main.tsx             # Application entry point
├── server/
│   ├── index.ts             # Express server and API routes
│   └── database.ts          # SQLite database setup and utilities
├── docker-compose.yml       # Production Docker setup
├── docker-compose.dev.yml   # Development Docker setup
├── Dockerfile.backend       # Backend container configuration
├── Dockerfile.frontend      # Frontend container configuration
├── nginx.conf               # Nginx reverse proxy configuration
└── README.md
```

## Docker Commands

### Production
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f [service-name]

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Scale services
docker-compose up -d --scale backend=2
```

### Development
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View development logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop development environment
docker-compose -f docker-compose.dev.yml down
```

### Useful Commands
```bash
# Execute commands in running containers
docker-compose exec backend sh
docker-compose exec frontend sh

# View container status
docker-compose ps

# Remove all containers and volumes
docker-compose down -v --remove-orphans
```

## Environment Variables

### Backend
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 3001)

### Frontend
- `VITE_API_URL`: Backend API URL (default: http://localhost:3001)

## Key Features Explained

### Balance Calculation Algorithm
The application implements sophisticated balance resolution:
1. Tracks all expense splits per user
2. Calculates gross amounts owed between each pair of users
3. Nets out mutual debts to minimize transactions
4. Provides simplified "who owes whom" summary

### Split Types
- **Equal Split**: Automatically divides expense amount by number of group members
- **Percentage Split**: Allows custom percentage allocation with validation (must total 100%)

### Real-time Updates
- Balances update immediately after adding expenses
- Group totals recalculate automatically
- Personal balance dashboard reflects all group changes

## Development

### Available Scripts
- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:client` - Start only the frontend development server
- `npm run dev:server` - Start only the backend API server
- `npm run build` - Build the frontend for production
- `npm run preview` - Preview the production build

### Database Management
The SQLite database (`splitwise.db`) is automatically created in the project root. In Docker, it's persisted in the `./data` volume. It includes:
- Automatic table creation on first run
- Sample user data for testing
- Foreign key constraints for data integrity

## Production Deployment

### With Docker Compose
1. Clone the repository
2. Run `docker-compose up -d`
3. Access via `http://localhost:80` (with Nginx) or `http://localhost:5173` (direct)

### Manual Deployment
1. Build frontend: `npm run build`
2. Serve `dist/` folder with any static file server
3. Deploy backend to any Node.js hosting service
4. Configure environment variables

## Assumptions Made

1. **No Authentication**: The application doesn't implement user authentication for simplicity
2. **No Payments**: Focus is on expense tracking and balance calculation, not actual payment processing
3. **SQLite Database**: Uses file-based SQLite instead of PostgreSQL for easier setup in development
4. **Sample Users**: Pre-seeds database with sample users for immediate testing
5. **Single Currency**: All amounts are assumed to be in USD
6. **No Expense Editing**: Expenses cannot be modified after creation (common in expense tracking apps for audit trail)

## Future Enhancements

- User authentication and authorization
- Expense editing and deletion
- Multiple currency support
- Payment/settlement tracking
- Email notifications
- Mobile app
- Group chat/comments
- Receipt photo uploads
- Expense categories and tags
- Data export functionality
- PostgreSQL support for production
- Redis caching for better performance
- WebSocket support for real-time updates

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in docker-compose.yml if 3001 or 5173 are in use
2. **Database permissions**: Ensure the `./data` directory has proper write permissions
3. **Docker build fails**: Clear Docker cache with `docker system prune -a`
4. **Services not starting**: Check logs with `docker-compose logs [service-name]`

### Health Checks
The backend service includes health checks. Monitor with:
```bash
docker-compose ps
```

---

**Built with ❤️ using modern web technologies and Docker**