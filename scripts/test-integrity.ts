import { getAppData, getStudent, searchStudents, getStudentExams, getCourseExams, getRoomStudents, compareStudents } from '../src/lib/data';

console.log("=================================================");
console.log("   AUTOMATED INTEGRITY & FUNCTIONAL TEST SUITE   ");
console.log("=================================================");

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`PASS: ${testName}`);
    passed++;
  } else {
    console.error(`FAIL: ${testName}`);
    failed++;
  }
}

const data = getAppData();

// 1. Metric Validations
assert(data.roomAllocations.length === 215, "Total room allocation records is 215");
assert(data.examDates.length === 9, "Total unique examination dates is 9");
assert(Object.keys(data.exams).length === 247, "Scheduled course examination events is 247");
assert(data.rooms.length === 26, "Total unique examination rooms is 26");
assert(data.students.length === 3523, "Total unique students is 3,523");

// Check unique student-exam allocations in Room Allocation
const raStudentExams = new Set(
  data.studentAssignments
    .filter(sa => sa.roomId !== 'Room not assigned in source timetable')
    .map(sa => `${sa.rollNo.trim().toUpperCase()}|${sa.courseCode}|${sa.examId}`)
);
assert(raStudentExams.size === 18401, "Unique student-exam allocations in Room Allocation is 18,401");

// 2. Mandatory Exception #1: CE2102 and CE2103
const ce2102 = getCourseExams('CE2102');
assert(ce2102.length > 0 && ce2102[0].exam.date === '27 November 2026' && ce2102[0].exam.slot === 'Morning', 
  "CE2102 exam date is 27 November 2026 Morning");
const ce2103 = getCourseExams('CE2103');
assert(ce2103.length > 0 && ce2103[0].exam.date === '25 November 2026' && ce2103[0].exam.slot === 'Morning',
  "CE2103 exam date is 25 November 2026 Morning");

// 3. Mandatory Exception #2: Student 2301ME42
const me42Exams = getStudentExams('2301ME42');
assert(me42Exams.length === 7, "Student 2301ME42 has all 7 source allocations preserved");
const me42Conflicting = me42Exams.filter(e => e.exam.date === '28 November 2026');
assert(me42Conflicting.length === 4, "Student 2301ME42 has 4 allocations on 28 November Evening");
const me42Rooms = new Set(me42Conflicting.map(e => e.assignment.roomId));
assert(me42Rooms.has('502') && me42Rooms.has('LT002'), "Student 2301ME42 duplicate rooms are 502 and LT002");
const me42Warnings = me42Conflicting.filter(e => Boolean(e.assignment.warning));
assert(me42Warnings.length === 4, "Student 2301ME42 conflicting allocations have explicit warning flags");

// 4. Mandatory Exception #3: EC5101 & 2621EE09
const ec5101Exams = getCourseExams('EC5101');
assert(ec5101Exams.length > 0 && ec5101Exams[0].exam.date === '25 November 2026' && ec5101Exams[0].exam.slot === 'Evening',
  "EC5101 is scheduled on 25 November 2026 Evening");
const ec5101Students = data.studentAssignments.filter(sa => sa.courseCode.includes('EC5101'));
assert(ec5101Students.length === 25, "EC5101 has all 25 students represented");
const student2621EE09 = ec5101Students.find(sa => sa.rollNo === '2621EE09');
assert(student2621EE09 !== undefined && student2621EE09.roomId === '301', 
  "Student 2621EE09 is allocated in Room 301 for EC5101");
const room301Students = getRoomStudents('301', '25 November 2026', 'Evening');
assert(room301Students !== null && room301Students.students.some(s => s.rollNo === '2621EE09'),
  "Room 301 on 25 Nov Evening includes student 2621EE09");

// 5. Mandatory Exception #4: EE6103/EE6117
const eeExams = getCourseExams('EE6117/EE6103');
assert(eeExams.length > 0 && eeExams[0].exam.date === '28 November 2026' && eeExams[0].exam.slot === 'Evening',
  "EE6103/EE6117 is scheduled on 28 November 2026 Evening");
const eeStudents = data.studentAssignments.filter(sa => sa.courseCode.includes('EE6103') || sa.courseCode.includes('EE6117'));
assert(eeStudents.length === 18, "EE6103/EE6117 has 18 students");
assert(eeStudents.every(s => s.roomId === 'Room not assigned in source timetable'),
  "All 18 EE6103/EE6117 students have roomId: 'Room not assigned in source timetable'");

// 6. Mandatory Exception #5: ME3104
const me3104Exams = getCourseExams('ME3104');
assert(me3104Exams.length > 0 && me3104Exams[0].exam.date === '27 November 2026' && me3104Exams[0].exam.slot === 'Evening',
  "ME3104 is scheduled on 27 November 2026 Evening");
const me3104Students = data.studentAssignments.filter(sa => sa.courseCode === 'ME3104');
assert(me3104Students.length === 96, "ME3104 has 96 students");
const me3104Rooms = new Set(me3104Exams[0].allocations.map(a => a.roomId));
assert(me3104Rooms.has('101') && me3104Rooms.has('102') && me3104Rooms.has('104'),
  "ME3104 is allocated across Rooms 101, 102, and 104");

// 7. Mandatory Exception #6: Unscheduled courses
assert(data.unscheduledCourses.includes('CB5103'), "CB5103 is marked unscheduled");
assert(data.unscheduledCourses.includes('EP4105'), "EP4105 is marked unscheduled");
assert(data.unscheduledCourses.includes('PH001'), "PH001 is marked unscheduled");
assert(Object.values(data.exams).every(e => e.courseCode !== 'CB5103' && e.courseCode !== 'EP4105' && e.courseCode !== 'PH001'),
  "Unscheduled courses are NOT in confirmed exams list");

// 8. Timings & Calendar Validations
const morningExams = Object.values(data.exams).filter(e => e.slot === 'Morning');
assert(morningExams.every(e => e.time === '9:30 AM – 12:30 PM'), "All morning exams have time 9:30 AM – 12:30 PM");
const eveningExams = Object.values(data.exams).filter(e => e.slot === 'Evening');
assert(eveningExams.every(e => e.time === '3:00 PM – 6:00 PM'), "All evening exams have time 3:00 PM – 6:00 PM");
assert(!data.examDates.includes('24 November 2026'), "24 November 2026 (Guru Nanak Jayanti) has no exams");

// 9. Student Search & Autocomplete
const searchPartial = searchStudents('2301ME', 10);
assert(searchPartial.length > 0 && searchPartial.every(s => s.includes('2301ME')), "Partial student search for '2301ME' works");
const exactStudent = getStudent('2501CE01');
assert(exactStudent !== null && exactStudent.rollNo === '2501CE01', "Exact student lookup works");

// 10. Peer Comparison
const comparison = compareStudents('2501CE01', '2501CE02');
assert(comparison !== null && comparison.counts.commonExams > 0, "Comparing 2501CE01 and 2501CE02 finds common exams");

console.log("\n=================================================");
console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log("=================================================");

if (failed > 0) {
  process.exit(1);
}
