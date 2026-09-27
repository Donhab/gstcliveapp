# GSTC Garki School Management System

Govt. Science & Tech. College School Management Web Application with Real-Time Firebase Firestore Synchronization and Authentication.

## Features
- **Live Real-time Sync**: Multi-device state updates instantly across phones, laptops, and remote terminals via Cloud Firestore document listeners (`onSnapshot`).
- **Dashboard Overview**: Faithful reproduction of the live portal interface with 5 key metric counters (Students, Staff, Classes, Subjects, Teaching assignments).
- **Academic Advisory Broadcast**: Real-time announcement banner editable by admins and instantly broadcast to all devices.
- **Quick Action Modules**:
  - Staff Registration (Auto-assigned GSTC/STF ID)
  - Student Registration (Admit into CCS 1, Garment 1, etc.)
  - Scratch Card PIN Generator (12-digit batch PIN generator)
  - Result Checker & Terminal Report Card Generator
- **Multi-Role Authentication**: Principal Admin, Examination Officer, and Subject Teachers with Firebase Auth.
- **Vercel & GitHub Ready**: Ready to be pushed to GitHub and deployed in 1-click on Vercel.

## Quick Start
```bash
npm install
npm run dev
```

## Deploying to Vercel
1. Push this project to your GitHub repository:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/gstc-garki.git
git push -u origin main
```
2. Go to [Vercel](https://vercel.com/new) and import your repository.
3. The project will automatically build with Vite and connect to the Firestore database.
