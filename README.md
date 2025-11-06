# Finance Tracker

A full-stack personal finance tracking application built with TypeScript, designed to help users manage their income, expenses, and budgets.

## Tech Stack

### Frontend
- **Angular** - Component-based framework
- **TypeScript** - Type-safe JavaScript
- **Bootstrap** - Responsive UI components
- **Chart.js** *(coming soon)* - Data visualization

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **TypeScript** - Type safety throughout
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM

## Features (Planned)

- [x] Project setup with TypeScript
- [x] MongoDB connection
- [x] Transaction management (Add, Edit, Delete)
- [x] Income and expense tracking
- [ ] Budget setting and monitoring
- [x] Category-based expense tracking
- [x] Data visualization with charts
- [ ] Monthly/yearly financial reports
- [ ] Expense trends analysis

##  Getting Started

### Prerequisites
- Node.js (v20 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/jaimelu/finance-tracker.git
cd finance-tracker

```
**2. Backend Setup**
```bash
cd backend
npm install
```

Create .env file in backend folder:

```bash
PORT=3000
MONGODB_URI=your_mongodb_connection_string
```

Start the backend:

```bash
npm run dev
```
Backend runs on http://localhost:3000

**3. Frontend Setup**

Open a new terminal:

```bash
cd frontend
npm install
ng serve
```
Frontend runs on http://localhost:4200

# Project Status
This is a personal learning project, but suggestions and feedback are welcome

## Author

**Jaime Lu**

LinkedIn: https://linkedin.com/in/jaime-lu

GitHub: https://github.com/jaimelu

## License
This Project is open source and available under the MIT License
