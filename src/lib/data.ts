import fs from 'fs';
import path from 'path';

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
}

export interface AppData {
  exams: Record<string, Exam>;
  roomAllocations: RoomAllocation[];
  studentAssignments: StudentAssignment[];
  courses: string[];
  rooms: string[];
  students: string[];
}

let cachedData: AppData | null = null;

export function getAppData(): AppData {
  if (cachedData) return cachedData;
  const filePath = path.join(process.cwd(), 'data.json');
  if (!fs.existsSync(filePath)) {
    throw new Error('data.json not found. Please run "npm run parse" first.');
  }
  const fileData = fs.readFileSync(filePath, 'utf8');
  cachedData = JSON.parse(fileData) as AppData;
  return cachedData;
}

export function getStudent(rollNo: string) {
  const data = getAppData();
  const normalizedRoll = rollNo.toUpperCase();
  if (!data.students.includes(normalizedRoll)) return null;
  return { rollNo: normalizedRoll };
}

export function getStudentExams(rollNo: string) {
  const data = getAppData();
  const normalizedRoll = rollNo.toUpperCase();
  const assignments = data.studentAssignments.filter(sa => sa.rollNo === normalizedRoll);
  
  // Sort assignments chronologically (by Date then slot)
  // For sorting, parse the date string (e.g. "21 September 2026")
  const sorted = assignments.sort((a, b) => {
    const examA = data.exams[a.examId];
    const examB = data.exams[b.examId];
    if (!examA || !examB) return 0;
    
    const dateA = new Date(examA.date).getTime();
    const dateB = new Date(examB.date).getTime();
    
    if (dateA !== dateB) return dateA - dateB;
    
    // If same date, sort by slot (Morning before Evening)
    if (examA.slot === 'Morning' && examB.slot === 'Evening') return -1;
    if (examA.slot === 'Evening' && examB.slot === 'Morning') return 1;
    return 0;
  });
  
  return sorted.map(sa => ({
    assignment: sa,
    exam: data.exams[sa.examId]
  }));
}

export function getCourseExams(courseCode: string) {
  const data = getAppData();
  const normalized = courseCode.toUpperCase();
  const courseExams = Object.values(data.exams).filter(e => e.courseCode === normalized);
  
  return courseExams.map(exam => {
    // Find rooms for this exam
    const allocations = data.roomAllocations.filter(ra => ra.examIds.includes(exam.id));
    return {
      exam,
      allocations
    };
  });
}

export function getRoomStudents(roomId: string, date: string, slot: string, courseCode?: string) {
  const data = getAppData();
  
  // Find the allocation
  const allocation = data.roomAllocations.find(ra => 
    ra.roomId.toUpperCase() === roomId.toUpperCase() && 
    ra.date === date && 
    ra.slot === slot
  );
  
  if (!allocation) return null;
  
  // Find students in this room from student assignments (which has their courses)
  let studentsInRoom = data.studentAssignments.filter(sa => 
    sa.roomId.toUpperCase() === roomId.toUpperCase() &&
    data.exams[sa.examId]?.date === date &&
    data.exams[sa.examId]?.slot === slot
  );
  
  if (courseCode) {
    studentsInRoom = studentsInRoom.filter(sa => sa.courseCode === courseCode.toUpperCase());
  }
  
  return {
    allocation,
    students: studentsInRoom
  };
}

export function compareStudents(roll1: string, roll2: string) {
  const data = getAppData();
  const r1 = roll1.toUpperCase();
  const r2 = roll2.toUpperCase();
  
  const exams1 = getStudentExams(r1);
  const exams2 = getStudentExams(r2);
  
  const commonExams = [];
  const onlyRoll1 = [];
  const onlyRoll2 = [];
  
  // Map of examIds for quick lookup
  const map2 = new Map(exams2.map(e => [e.exam.id, e]));
  
  for (const e1 of exams1) {
    if (map2.has(e1.exam.id)) {
      const e2 = map2.get(e1.exam.id)!;
      commonExams.push({
        exam: e1.exam,
        roll1Room: e1.assignment.roomId,
        roll2Room: e2.assignment.roomId,
        sameRoom: e1.assignment.roomId === e2.assignment.roomId
      });
      map2.delete(e1.exam.id); // remove processed
    } else {
      onlyRoll1.push(e1);
    }
  }
  
  // Remaining in map2 are only in roll2
  for (const e2 of map2.values()) {
    onlyRoll2.push(e2);
  }
  
  return {
    roll1: r1,
    roll2: r2,
    commonExams,
    onlyRoll1,
    onlyRoll2,
    counts: {
      commonExams: commonExams.length,
      sameCourse: commonExams.length, // By definition of common exam
      sameDate: commonExams.length,   // By definition
      sameSlot: commonExams.length,   // By definition
      sameRoom: commonExams.filter(c => c.sameRoom).length
    }
  };
}
