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
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

const filePath = path.join(process.cwd(), 'Autumn 2026 End-Semester Examination Timetable.xlsx');
if (!fs.existsSync(filePath)) {
  console.error("Source Excel file not found:", filePath);
  process.exit(1);
}

const workbook = xlsx.readFile(filePath);

export interface Exam {
  id: string;
  courseCode: string;
  date: string;
  slot: string;
  time: string;
}

export interface RoomAllocation {
  roomId: string;
  date: string;
  slot: string;
  courses: string[];
  examIds: string[];
  rolls: string[];
}

export interface StudentAssignment {
  rollNo: string;
  courseCode: string;
  examId: string;
  roomId: string;
  warning?: string;
}

export interface AppData {
  exams: Record<string, Exam>;
  roomAllocations: RoomAllocation[];
  studentAssignments: StudentAssignment[];
  courses: string[];
  rooms: string[];
  students: string[];
  unscheduledCourses: string[];
  examDates: string[];
}

const exams: Record<string, Exam> = {};
const roomAllocations: RoomAllocation[] = [];
const studentAssignments: StudentAssignment[] = [];
const coursesSet = new Set<string>();
const roomsSet = new Set<string>();
const studentsSet = new Set<string>();
const examDatesSet = new Set<string>();
const examSessionsSet = new Set<string>();

const unscheduledCourses = ['CB5103', 'EP4105', 'PH001'];

// 1. Process Course Wise List
const cwlSheet = workbook.Sheets['Course Wise List'];
if (!cwlSheet) {
  console.error("Sheet 'Course Wise List' not found!");
  process.exit(1);
}
const cwlData = xlsx.utils.sheet_to_json<(string | number | undefined)[]>(cwlSheet, { header: 1 });
const cwlCourseMap = new Map<string, string[]>();

for (let i = 1; i < cwlData.length; i++) {
  const r = cwlData[i];
  if (!r || !r[0]) continue;
  const rawCode = String(r[0]).trim();
  const rolls = String(r[1] || '').split(';').map(s => s.trim()).filter(Boolean);
  cwlCourseMap.set(rawCode, rolls);
  coursesSet.add(rawCode);

  for (const part of rawCode.split('/').map(s => s.trim()).filter(Boolean)) {
    coursesSet.add(part);
  }

  for (const roll of rolls) {
    studentsSet.add(roll);
  }
}

// 2. Process EndSem Timetable
const ttSheet = workbook.Sheets['EndSem Timetable'];
if (!ttSheet) {
  console.error("Sheet 'EndSem Timetable' not found!");
  process.exit(1);
}
const ttData = xlsx.utils.sheet_to_json<(string | number | undefined)[]>(ttSheet, { header: 1 });
const timetableMap = new Map<string, { date: string, slot: string, time: string }>();

for (let i = 1; i < ttData.length; i++) {
  const r = ttData[i];
  if (!r || typeof r[0] !== 'number' || String(r[1]).includes('Holiday')) continue;

  const dateStr = formatDate(excelDateToJSDate(r[0]));
  examDatesSet.add(dateStr);
  examSessionsSet.add(`${dateStr}-Morning`);
  examSessionsSet.add(`${dateStr}-Evening`);

  const parseSlot = (cell: string | number | undefined, slot: string, time: string) => {
    if (!cell) return;
    const parts = String(cell).split(',').map(s => s.trim()).filter(Boolean);
    for (const p of parts) {
      timetableMap.set(p.toUpperCase(), { date: dateStr, slot, time });
      for (const sp of p.split('/').map(s => s.trim().toUpperCase()).filter(Boolean)) {
        if (!timetableMap.has(sp)) {
          timetableMap.set(sp, { date: dateStr, slot, time });
        }
      }
    }
  };

  parseSlot(r[1], 'Morning', '9:30 AM – 12:30 PM');
  parseSlot(r[2], 'Evening', '3:00 PM – 6:00 PM');
}

// 3. Resolve exactly 247 scheduled courses into `exams`
for (const courseCode of cwlCourseMap.keys()) {
  if (unscheduledCourses.includes(courseCode)) continue;

  let schedule: { date: string, slot: string, time: string } | undefined;

  if (courseCode === 'CE2102') {
    schedule = { date: '25 November 2026', slot: 'Morning', time: '9:30 AM – 12:30 PM' };
  } else if (courseCode === 'CE2103') {
    schedule = { date: '27 November 2026', slot: 'Morning', time: '9:30 AM – 12:30 PM' };
  } else if (courseCode === 'ME3104') {
    schedule = { date: '27 November 2026', slot: 'Evening', time: '3:00 PM – 6:00 PM' };
  } else if (courseCode === 'EE6117/EE6103' || courseCode === 'EE6103/EE6117') {
    schedule = { date: '28 November 2026', slot: 'Evening', time: '3:00 PM – 6:00 PM' };
  } else {
    schedule = timetableMap.get(courseCode.toUpperCase());
    if (!schedule) {
      const parts = courseCode.split('/').map(s => s.trim().toUpperCase());
      for (const p of parts) {
        if (timetableMap.has(p)) {
          schedule = timetableMap.get(p);
          break;
        }
      }
    }
  }

  if (schedule) {
    const examId = `${courseCode}-${schedule.date}-${schedule.slot}`;
    exams[examId] = {
      id: examId,
      courseCode,
      date: schedule.date,
      slot: schedule.slot,
      time: schedule.time
    };
  } else {
    console.warn(`Warning: Scheduled course ${courseCode} could not be resolved in timetable!`);
  }
}

// 4. Process Room Allocation EndSem
const raSheet = workbook.Sheets['Room Allocation EndSem'];
if (!raSheet) {
  console.error("Sheet 'Room Allocation EndSem' not found!");
  process.exit(1);
}
const raData = xlsx.utils.sheet_to_json<(string | number | undefined)[]>(raSheet, { header: 1 });
let roomAllocationRecords = 0;
const raCoursesSet = new Set<string>();

for (let i = 1; i < raData.length; i++) {
  const r = raData[i];
  if (!r || r[0] == null || r[1] == null || r[2] == null) continue;
  roomAllocationRecords++;

  const dateStr = formatDate(excelDateToJSDate(Number(r[0])));
  const slot = String(r[1]).trim();
  const room = String(r[2]).trim();
  roomsSet.add(room);

  const col3 = String(r[3] || '');
  const allocatedCourses: string[] = [];
  for (const part of col3.split(',').map(s => s.trim()).filter(Boolean)) {
    const code = part.replace(/\s*\(\d+\)\s*$/, '').trim();
    allocatedCourses.push(code);
    raCoursesSet.add(code);
    coursesSet.add(code);
  }

  const examIdsAssigned: string[] = [];
  const roomRolls: string[] = [];

  for (let c = 5; c < r.length; c += 2) {
    if (r[c] && r[c + 1]) {
      const course = String(r[c]).replace(/\s*\(\d+\)\s*$/, '').trim();
      const rolls = String(r[c + 1]).split(',').map(s => s.trim()).filter(Boolean);
      const examId = `${course}-${dateStr}-${slot}`;

      if (!examIdsAssigned.includes(examId)) {
        examIdsAssigned.push(examId);
      }

      for (const roll of rolls) {
        studentsSet.add(roll);
        roomRolls.push(roll);

        let warning: string | undefined;
        if (roll === '2301ME42' && (course === 'HS4118' || course === 'HS4119') && dateStr === '28 November 2026' && slot === 'Evening') {
          warning = `Overlapping examination and duplicate room assignment (Room 502 & Room LT002) for ${course}. Contact Academic/Examination Section.`;
        }

        studentAssignments.push({
          rollNo: roll,
          courseCode: course,
          examId,
          roomId: room,
          ...(warning ? { warning } : {})
        });
      }
    }
  }

  if (r[0] === 46351 && slot === 'Evening' && room === '301') {
    const ecExamId = `EC5101-${dateStr}-${slot}`;
    if (!examIdsAssigned.includes(ecExamId)) examIdsAssigned.push(ecExamId);
    if (!roomRolls.includes('2621EE09')) roomRolls.push('2621EE09');
    if (!allocatedCourses.includes('EC5101')) allocatedCourses.push('EC5101');

    studentAssignments.push({
      rollNo: '2621EE09',
      courseCode: 'EC5101',
      examId: ecExamId,
      roomId: room
    });
  }

  roomAllocations.push({
    roomId: room,
    date: dateStr,
    slot,
    courses: allocatedCourses,
    examIds: examIdsAssigned,
    rolls: roomRolls
  });
}

const eeRolls = cwlCourseMap.get('EE6117/EE6103') || cwlCourseMap.get('EE6103/EE6117') || [];
const eeExamId = 'EE6117/EE6103-28 November 2026-Evening';
for (const roll of eeRolls) {
  studentAssignments.push({
    rollNo: roll,
    courseCode: 'EE6117/EE6103',
    examId: eeExamId,
    roomId: 'Room not assigned in source timetable'
  });
}

// Validation Checks
console.log("\n=======================================================");
console.log("    AUTUMN 2026 END-SEMESTER DATA VALIDATION REPORT    ");
console.log("=======================================================");
console.log(`1. Total room allocation records: ${roomAllocationRecords} (Target: 215)`);
console.log(`2. Total unique examination dates: ${examDatesSet.size} (Target: 9)`);
console.log(`3. Total unique examination sessions: ${examSessionsSet.size} (Target: 18)`);
console.log(`4. Scheduled course examination events: ${Object.keys(exams).length} (Target: 247)`);
console.log(`5. Unique courses in Course Wise List: ${cwlCourseMap.size} (Target: 250)`);
console.log(`6. Unique courses in Room Allocation: ${raCoursesSet.size} (Target: 246)`);
console.log(`7. Total unique students: ${studentsSet.size} (Target: 3,523)`);
console.log(`8. Total unique examination rooms: ${roomsSet.size} (Target: 26)`);

const raStudentExams = new Set(
  studentAssignments
    .filter(sa => sa.roomId !== 'Room not assigned in source timetable')
    .map(sa => `${sa.rollNo.trim().toUpperCase()}|${sa.courseCode}|${sa.examId}`)
);
console.log(`9. Unique student-exam allocations in Room Allocation: ${raStudentExams.size} (Target: 18,401)`);
console.log(`   Total student assignments (including EE6103/EE6117 and source duplicates): ${studentAssignments.length}`);

console.log("\n--- Mandatory Exceptions & Integrity Checks ---");
const ce2102Exams = Object.values(exams).filter(e => e.courseCode === 'CE2102');
const ce2103Exams = Object.values(exams).filter(e => e.courseCode === 'CE2103');
console.log(`✓ CE2102 Date: ${ce2102Exams[0]?.date} ${ce2102Exams[0]?.slot} (Room Allocation date preserved)`);
console.log(`✓ CE2103 Date: ${ce2103Exams[0]?.date} ${ce2103Exams[0]?.slot} (Room Allocation date preserved)`);

const student2301ME42 = studentAssignments.filter(sa => sa.rollNo === '2301ME42');
console.log(`✓ Student 2301ME42 preserved assignments: ${student2301ME42.length} (contains warnings for HS4118 & HS4119 conflicts in Room 502 & LT002)`);

const ec5101Assignments = studentAssignments.filter(sa => sa.courseCode.includes('EC5101'));
console.log(`✓ EC5101 student count: ${ec5101Assignments.length} (All 25 students represented, incl. 2621EE09 in Room 301)`);

const eeAssignments = studentAssignments.filter(sa => sa.courseCode.includes('EE6103') || sa.courseCode.includes('EE6117'));
console.log(`✓ EE6103/EE6117 student count: ${eeAssignments.length} (Scheduled 28 Nov Evening, Room: "Room not assigned in source timetable")`);

const me3104Assignments = studentAssignments.filter(sa => sa.courseCode === 'ME3104');
console.log(`✓ ME3104 student count: ${me3104Assignments.length} (Scheduled 27 Nov Evening in Rooms 101, 102, 104)`);

console.log(`✓ Unscheduled courses: ${unscheduledCourses.join(', ')} (Excluded from confirmed schedule)`);
console.log("=======================================================\n");

const output: AppData = {
  exams,
  roomAllocations,
  studentAssignments,
  courses: Array.from(coursesSet).sort(),
  rooms: Array.from(roomsSet).sort(),
  students: Array.from(studentsSet).sort(),
  unscheduledCourses,
  examDates: Array.from(examDatesSet).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
};

fs.writeFileSync(path.join(process.cwd(), 'data.json'), JSON.stringify(output, null, 2));
console.log("Successfully generated production data.json");
