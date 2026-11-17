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
  const normalizedRoll = rollNo.toUpperCase().trim();
  const found = data.students.find(s => s.toUpperCase().trim() === normalizedRoll);
  if (!found) return null;
  return { rollNo: found };
}

export function searchStudents(query: string, limit = 20) {
  const data = getAppData();
  const q = query.toUpperCase().trim();
  if (!q) return [];
  return data.students
    .filter(s => s.toUpperCase().includes(q))
    .slice(0, limit);
}

export function getStudentExams(rollNo: string) {
  const data = getAppData();
  const normalizedRoll = rollNo.toUpperCase().trim();
  const assignments = data.studentAssignments.filter(
    sa => sa.rollNo.toUpperCase().trim() === normalizedRoll
  );

  // Sort assignments chronologically (by Date then slot)
  const sorted = [...assignments].sort((a, b) => {
    const examA = data.exams[a.examId] || Object.values(data.exams).find(e => 
      e.courseCode === a.courseCode || e.courseCode.split('/').map(s => s.trim().toUpperCase()).includes(a.courseCode.toUpperCase())
    );
    const examB = data.exams[b.examId] || Object.values(data.exams).find(e => 
      e.courseCode === b.courseCode || e.courseCode.split('/').map(s => s.trim().toUpperCase()).includes(b.courseCode.toUpperCase())
    );
    if (!examA || !examB) return 0;

    const dateA = new Date(examA.date).getTime();
    const dateB = new Date(examB.date).getTime();

    if (dateA !== dateB) return dateA - dateB;

    // Morning before Evening
    if (examA.slot === 'Morning' && examB.slot === 'Evening') return -1;
    if (examA.slot === 'Evening' && examB.slot === 'Morning') return 1;
    return 0;
  });

  return sorted.map(sa => {
    let exam: Exam | undefined = data.exams[sa.examId];
    if (!exam) {
      exam = Object.values(data.exams).find(e => 
        e.courseCode === sa.courseCode || 
        e.courseCode.split('/').map(s => s.trim().toUpperCase()).includes(sa.courseCode.toUpperCase())
      );
    }
    const finalExam: Exam = exam || {
      id: sa.examId,
      courseCode: sa.courseCode,
      date: 'Scheduled in Source',
      slot: 'TBA',
      time: 'TBA'
    };
    return {
      assignment: sa,
      exam: finalExam
    };
  });
}

export function getCourseExams(courseCode: string) {
  const data = getAppData();
  const normalized = courseCode.toUpperCase().trim();

  // Find exams where courseCode matches or is part of a slash code
  const courseExams = Object.values(data.exams).filter(e => {
    const code = e.courseCode.toUpperCase().trim();
    if (code === normalized) return true;
    const parts = code.split('/').map(s => s.trim().toUpperCase());
    return parts.includes(normalized);
  });

  return courseExams.map(exam => {
    // Find rooms for this exam
    const allocations = data.roomAllocations.filter(ra => {
      if (ra.examIds.includes(exam.id)) return true;
      return ra.courses.some(c => {
        const cNorm = c.toUpperCase().trim();
        if (cNorm === exam.courseCode.toUpperCase().trim() || cNorm === normalized) return true;
        const cParts = cNorm.split('/').map(s => s.trim().toUpperCase());
        return cParts.includes(exam.courseCode.toUpperCase().trim()) || cParts.includes(normalized);
      });
    });

    return {
      exam,
      allocations
    };
  });
}

export function getRoomStudents(roomId: string, date: string, slot: string, courseCode?: string) {
  const data = getAppData();
  const normRoom = roomId.toUpperCase().trim();
  const normDate = date.trim();
  const normSlot = slot.trim().toLowerCase();

  // Find the allocation
  const allocation = data.roomAllocations.find(ra => 
    ra.roomId.toUpperCase().trim() === normRoom && 
    ra.date.trim() === normDate && 
    ra.slot.trim().toLowerCase() === normSlot
  );

  if (!allocation) return null;

  // Find students in this room from student assignments
  let studentsInRoom = data.studentAssignments.filter(sa => 
    sa.roomId.toUpperCase().trim() === normRoom &&
    (
      data.exams[sa.examId]?.date.trim() === normDate ||
      allocation.examIds.includes(sa.examId) ||
      allocation.courses.some(c => c.toUpperCase().trim() === sa.courseCode.toUpperCase().trim())
    )
  );

  if (courseCode) {
    const normCourse = courseCode.toUpperCase().trim();
    studentsInRoom = studentsInRoom.filter(sa => {
      const c = sa.courseCode.toUpperCase().trim();
      return c === normCourse || c.split('/').map(s => s.trim()).includes(normCourse);
    });
  }

  return {
    allocation,
    students: studentsInRoom
  };
}

export function compareStudents(roll1: string, roll2: string) {
  const r1 = roll1.toUpperCase().trim();
  const r2 = roll2.toUpperCase().trim();

  const exams1 = getStudentExams(r1);
  const exams2 = getStudentExams(r2);

  const commonExams = [];
  const onlyRoll1 = [];
  const onlyRoll2 = [];

  const map2 = new Map(exams2.map(e => [e.exam.id, e]));

  for (const e1 of exams1) {
    if (map2.has(e1.exam.id)) {
      const e2 = map2.get(e1.exam.id)!;
      commonExams.push({
        exam: e1.exam,
        roll1Room: e1.assignment.roomId,
        roll2Room: e2.assignment.roomId,
        sameRoom: e1.assignment.roomId.toUpperCase().trim() === e2.assignment.roomId.toUpperCase().trim()
      });
      map2.delete(e1.exam.id);
    } else {
      onlyRoll1.push(e1);
    }
  }

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
      sameCourse: commonExams.length,
      sameDate: commonExams.length,
      sameSlot: commonExams.length,
      sameRoom: commonExams.filter(c => c.sameRoom).length
    }
  };
}
