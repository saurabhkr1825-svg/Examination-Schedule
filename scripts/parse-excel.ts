import * as xlsx from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

function excelDateToJSDate(serial: number) {
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  const fractional_day = serial - Math.floor(serial) + 0.0000001;
  let total_seconds = Math.floor(86400 * fractional_day);
  const seconds = total_seconds % 60;
  total_seconds -= seconds;
  const hours = Math.floor(total_seconds / (60 * 60));
  const minutes = Math.floor(total_seconds / 60) % 60;
  return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
}

function formatDate(date: Date) {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

const filePath = path.join(process.cwd(), 'Autumn 2026 Mid-Semester Examination Timetable and Room Allocation.xlsx');
if (!fs.existsSync(filePath)) {
  console.error("File not found:", filePath);
  process.exit(1);
}

const workbook = xlsx.readFile(filePath);

// Data structures
const exams: Record<string, any> = {};
const roomAllocations: any[] = [];
const studentAssignments: any[] = [];
const coursesSet = new Set<string>();
const roomsSet = new Set<string>();
const studentsSet = new Set<string>();

const courseRegistrations = new Map<string, Set<string>>(); // roll -> Set of courses

// 1. Parse Course Registration
const courseRegSheet = workbook.Sheets['Course Registration'];
if (courseRegSheet) {
  const data = xlsx.utils.sheet_to_json<any>(courseRegSheet, { header: 1 });
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row.length < 2) continue;
    let roll = String(row[0]).trim();
    let courseCode = String(row[1]).trim();
    if (!roll || !courseCode) continue;

    if (!courseRegistrations.has(roll)) {
      courseRegistrations.set(roll, new Set());
    }
    
    // Split by / if present
    const splitCourses = courseCode.split('/').map(s => s.trim()).filter(s => s);
    for (const sc of splitCourses) {
      courseRegistrations.get(roll)!.add(sc);
    }
    studentsSet.add(roll);
  }
}

// 2. Parse Timetable
const timetableSheet = workbook.Sheets['Timetable'];
const timetableData = xlsx.utils.sheet_to_json<any>(timetableSheet, { header: 1 });

for (let i = 1; i < timetableData.length; i++) {
  const row = timetableData[i];
  if (!row || row.length === 0 || !row[0]) continue;
  
  const dateSerial = typeof row[0] === 'number' ? row[0] : null;
  if (!dateSerial) continue;

  const dateStr = formatDate(excelDateToJSDate(dateSerial));
  
  const parseCourses = (cellValue: any, slot: string, time: string) => {
    if (!cellValue) return;
    const str = String(cellValue);
    const parts = str.split(',').map(s => s.trim()).filter(s => s);
    for (const part of parts) {
      // Courses can be separated by / in some sheets, but typically Timetable uses comma
      const subParts = part.split('/').map(s => s.trim());
      for (const courseCode of subParts) {
        if (!courseCode) continue;
        const examId = `${courseCode}-${dateStr}-${slot}`;
        exams[examId] = {
          id: examId,
          courseCode,
          date: dateStr,
          slot,
          time
        };
        coursesSet.add(courseCode);
      }
    }
  };

  parseCourses(row[1], 'Morning', '10:30 AM – 12:30 PM');
  parseCourses(row[2], 'Evening', '3:30 PM – 5:30 PM');
}

// 3. Parse Room Allocation
const roomAllocSheet = workbook.Sheets['Room Allocation'];
const roomAllocData = xlsx.utils.sheet_to_json<any>(roomAllocSheet, { header: 1 });

for (let i = 1; i < roomAllocData.length; i++) {
  const row = roomAllocData[i];
  if (!row || row.length < 5 || !row[0]) continue;

  const dateSerial = typeof row[0] === 'number' ? row[0] : null;
  if (!dateSerial) continue;
  
  const dateStr = formatDate(excelDateToJSDate(dateSerial));
  const slot = String(row[1]).trim(); // "Morning" or "Evening"
  const room = String(row[2]).trim();
  const coursesRaw = String(row[3]).trim();
  const rollsRaw = String(row[4]).trim();
  
  roomsSet.add(room);

  // Parse courses from the room allocation (removing capacities like "(80)")
  const courseParts = coursesRaw.split(',').map(s => s.trim());
  const allocatedCourses = new Set<string>();
  
  for (const cp of courseParts) {
    // cp might be "CS1101 (80)" or "CE5108/CE4104/CE6119"
    // Remove anything in parentheses
    let cleaned = cp.replace(/\(.*?\)/g, '').trim();
    const splitCourses = cleaned.split('/').map(s => s.trim()).filter(s => s);
    for (const sc of splitCourses) {
      allocatedCourses.add(sc);
      coursesSet.add(sc);
    }
  }

  // Rolls
  const rollsListRaw = rollsRaw.split(',').map(s => s.trim()).filter(s => s);
  const rollsList = Array.from(new Set(rollsListRaw));

  // We need to map rolls to specific courses based on Registration Data (or Timetable).
  // The user says: "A student's final exam assignment must represent: roll number + course code + exam date + slot + room"
  // Since one room row may have multiple courses (e.g. CE5108 and CE4104), and we have a list of rolls, 
  // we use courseRegistrations to determine which course this roll is taking.
  
  const examIdsAssigned = Array.from(allocatedCourses).map(c => `${c}-${dateStr}-${slot}`);
  
  for (const roll of rollsList) {
    studentsSet.add(roll);
    let matchedCourse = "";
    
    // Find which of the allocatedCourses this student is registered for
    const registered = courseRegistrations.get(roll);
    
    if (registered) {
      for (const ac of allocatedCourses) {
        if (registered.has(ac)) {
          matchedCourse = ac;
          break;
        }
      }
    }
    
    // If not found in registration, maybe they only have one course in the room?
    if (!matchedCourse && allocatedCourses.size === 1) {
      matchedCourse = Array.from(allocatedCourses)[0];
    }
    
    // If still no match, we just assign to all? Or leave unmatched?
    // User requested "unmatched room assignments" tracking.
    
    if (matchedCourse) {
      const examId = `${matchedCourse}-${dateStr}-${slot}`;
      studentAssignments.push({
        rollNo: roll,
        courseCode: matchedCourse,
        examId,
        roomId: room
      });
    } else {
      // Unmatched room assignment - couldn't figure out which course
      studentAssignments.push({
        rollNo: roll,
        courseCode: 'UNKNOWN',
        examId: `UNKNOWN-${dateStr}-${slot}`,
        roomId: room
      });
    }
  }

  roomAllocations.push({
    roomId: room,
    date: dateStr,
    slot,
    courses: Array.from(allocatedCourses),
    examIds: examIdsAssigned,
    rolls: rollsList
  });
}

// Validation
let unmatchedCourseRegistrations = 0;
let unmatchedRoomAssignments = 0;
let duplicateAssignments = 0;

// Track for duplicates
const assignmentSet = new Set<string>();

for (const sa of studentAssignments) {
  if (sa.courseCode === 'UNKNOWN') {
    unmatchedRoomAssignments++;
  } else {
    const key = `${sa.rollNo}-${sa.examId}`;
    if (assignmentSet.has(key)) {
      duplicateAssignments++;
    } else {
      assignmentSet.add(key);
    }
  }
}

// Unmatched registrations: student registered for a course, but doesn't have a room assignment for its exam
// We need a map of registered courses to assignments
const rollToAssignedExams = new Map<string, Set<string>>();
for (const sa of studentAssignments) {
  if (sa.courseCode !== 'UNKNOWN') {
    if (!rollToAssignedExams.has(sa.rollNo)) {
      rollToAssignedExams.set(sa.rollNo, new Set());
    }
    rollToAssignedExams.get(sa.rollNo)!.add(sa.courseCode);
  }
}

for (const [roll, courses] of courseRegistrations.entries()) {
  for (const course of courses) {
    const isExamInTimetable = Object.values(exams).some(e => e.courseCode === course);
    if (isExamInTimetable) {
      const assigned = rollToAssignedExams.get(roll);
      if (!assigned || !assigned.has(course)) {
        unmatchedCourseRegistrations++;
        
        // Add a placeholder assignment so it shows up in the UI
        const examObj = Object.values(exams).find(e => e.courseCode === course);
        if (examObj) {
          studentAssignments.push({
            rollNo: roll,
            courseCode: course,
            examId: examObj.id,
            roomId: "Room not assigned in source timetable"
          });
        }
      }
    }
  }
}


console.log("=== Validation Report ===");
console.log(`Total Students: ${studentsSet.size}`);
console.log(`Total Exams: ${Object.keys(exams).length}`);
console.log(`Total Assignments: ${studentAssignments.length}`);
console.log(`Total Courses: ${coursesSet.size}`);
console.log(`Total Rooms: ${roomsSet.size}`);
console.log(`Unmatched Course Registrations: ${unmatchedCourseRegistrations}`);
console.log(`Unmatched Room Assignments: ${unmatchedRoomAssignments}`);
console.log(`Duplicate Assignments: ${duplicateAssignments}`);

const output = {
  exams,
  roomAllocations,
  studentAssignments: studentAssignments.filter(sa => sa.courseCode !== 'UNKNOWN'),
  courses: Array.from(coursesSet).sort(),
  rooms: Array.from(roomsSet).sort(),
  students: Array.from(studentsSet).sort(),
};

fs.writeFileSync(path.join(process.cwd(), 'data.json'), JSON.stringify(output, null, 2));
console.log("Successfully generated data.json");
