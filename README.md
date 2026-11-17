# IIT Patna Examination Schedule — Autumn 2026 End-Semester

Official examination schedule, seating arrangement, and room allocation portal for IIT Patna Autumn 2026 End-Semester Examinations.

## Examination Overview

- **Examination Session:** Autumn 2026 End-Semester Examinations
- **Examination Period:** 21, 22, 23, 25, 26, 27, 28, 29, and 30 November 2026 (9 examination dates)
- **Institute Holiday:** 24 November 2026 (Guru Nanak Jayanti — No examinations)
- **Session Timings:**
  - **Morning Session:** 9:30 AM – 12:30 PM
  - **Evening Session:** 3:00 PM – 6:00 PM
- **Key Metrics:**
  - 215 Room Allocation Records
  - 26 Examination Rooms
  - 247 Scheduled Course Examination Events
  - 250 Unique Courses in Course Wise List
  - 3,523 Registered Students
  - 18,401 Student-Exam Allocations

## Key Features

1. **Personalized Student Schedule Search:** Look up schedules by student roll number (with partial-match search and autocomplete suggestions).
2. **Anomaly & Conflict Warnings:** Transparently flags source timetable anomalies (e.g., student 2301ME42 with duplicate room and overlapping session assignments) with academic office alerts.
3. **Course Lookup:** Search any of the 247 scheduled courses to view allocated halls and enrolled students.
4. **Room-Wise Seating Search:** Filter and inspect seating allocations across all 26 examination rooms with date, slot, and course filtering.
5. **Full Timetable View:** Day-by-day timetable organized by Morning and Evening sessions.
6. **Peer Schedule Comparison:** Compare schedules with classmates to find common exams and shared examination rooms.
7. **Live Session Countdown:** Real-time countdown to upcoming sessions and active session status.

## Development & Build

```bash
# Generate / validate timetable data
npm run parse

# Start development server
npm run dev

# Run TypeScript checks and production build
npm run build

# Run linter
npm run lint
```

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Frontend:** React 19 + TypeScript
- **Styling:** Tailwind CSS + Radix/Base UI components
- **Icons:** Lucide React
- **Deployment:** Vercel
