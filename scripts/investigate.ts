import * as xlsx from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

function excelDateToJSDate(serial: number) {
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), 0, 0, 0);
}

function formatDate(date: Date) {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

const filePath = path.join(process.cwd(), 'Autumn 2026 Mid-Semester Examination Timetable and Room Allocation.xlsx');
const workbook = xlsx.readFile(filePath);

const courseRegistrations = new Map<string, Set<string>>();
const courseRegSheet = workbook.Sheets['Course Registration'];
const data = xlsx.utils.sheet_to_json<any>(courseRegSheet, { header: 1 });
for (let i = 1; i < data.length; i++) {
  const row = data[i];
  if (row.length < 2) continue;
  let roll = String(row[0]).trim();
  let courseCode = String(row[1]).trim();
  if (!roll || !courseCode) continue;

  if (!courseRegistrations.has(roll)) courseRegistrations.set(roll, new Set());
  const splitCourses = courseCode.split('/').map(s => s.trim()).filter(s => s);
  for (const sc of splitCourses) courseRegistrations.get(roll)!.add(sc);
}

const roomAllocSheet = workbook.Sheets['Room Allocation'];
const roomAllocData = xlsx.utils.sheet_to_json<any>(roomAllocSheet, { header: 1 });

const unmatchedAssignments = [];
const assignmentSet = new Set<string>();
const duplicates = [];

for (let i = 1; i < roomAllocData.length; i++) {
  const row = roomAllocData[i];
  if (!row || row.length < 5 || !row[0]) continue;

  const dateSerial = typeof row[0] === 'number' ? row[0] : null;
  if (!dateSerial) continue;
  const dateStr = formatDate(excelDateToJSDate(dateSerial));
  const slot = String(row[1]).trim();
  const room = String(row[2]).trim();
  const coursesRaw = String(row[3]).trim();
  const rollsRaw = String(row[4]).trim();
  
  const courseParts = coursesRaw.split(',').map(s => s.trim());
  const allocatedCourses = new Set<string>();
  
  for (const cp of courseParts) {
    let cleaned = cp.replace(/\(.*?\)/g, '').trim();
    const splitCourses = cleaned.split('/').map(s => s.trim()).filter(s => s);
    for (const sc of splitCourses) allocatedCourses.add(sc);
  }

  const rollsList = rollsRaw.split(',').map(s => s.trim()).filter(s => s);
  
  for (const roll of rollsList) {
    let matchedCourse = "";
    const registered = courseRegistrations.get(roll);
    if (registered) {
      for (const ac of allocatedCourses) {
        if (registered.has(ac)) {
          matchedCourse = ac;
          break;
        }
      }
    }
    
    if (!matchedCourse && allocatedCourses.size === 1) {
      matchedCourse = Array.from(allocatedCourses)[0];
    }

    if (!matchedCourse) {
      unmatchedAssignments.push({ roll, room, allocatedCourses: Array.from(allocatedCourses) });
    } else {
      const examId = `${matchedCourse}-${dateStr}-${slot}`;
      const key = `${roll}|${examId}`;
      if (assignmentSet.has(key)) {
        duplicates.push({ roll, examId, room });
      } else {
        assignmentSet.add(key);
      }
    }
  }
}

console.log("=== Investigation ===");
console.log("Duplicates:");
console.log(duplicates);

console.log("\nUnmatched Room Assignments (Sample of 10):");
console.log(unmatchedAssignments.slice(0, 10));
console.log(`Total Unmatched: ${unmatchedAssignments.length}`);
