import React, { useState } from 'react';
import {
  Student,
  Staff,
  SchoolClass,
  Subject,
  TeachingAssignment,
  ExamResult,
  SubjectScore
} from '../types/school';
import {
  GraduationCap,
  UserCheck,
  UserPlus,
  UserMinus,
  Edit3,
  Save,
  CheckCircle,
  AlertCircle,
  Search,
  BookOpen,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StaffDashboardProps {
  currentStaff: Staff | undefined;
  allStaff: Staff[];
  students: Student[];
  classes: SchoolClass[];
  subjects: Subject[];
  assignments: TeachingAssignment[];
  results: ExamResult[];
  onEnrollStudent: (data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Student>;
  onDeenrollStudent: (studentId: string) => Promise<void>;
  onSaveScore: (
    studentId: string,
    subjectId: string,
    subjectName: string,
    ca1: number,
    ca2: number,
    ca3: number,
    exam: number,
    teacherId: string,
    teacherName: string
  ) => Promise<void>;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  currentStaff,
  allStaff,
  students,
  classes,
  subjects,
  assignments,
  results,
  onEnrollStudent,
  onDeenrollStudent,
  onSaveScore
}) => {
  // Use either the logged in teacher or default to first staff
  const teacher = currentStaff || allStaff[0];

  // Determine classes assigned to this teacher
  const teacherClasses = classes.filter(
    (c) =>
      teacher?.assignedClasses?.includes(c.name) ||
      teacher?.formTeacherClassId === c.id ||
      c.formTeacherName === teacher?.fullName ||
      assignments.some((a) => a.teacherId === teacher?.id && a.classId === c.id)
  );

  // Fallback to all classes if none assigned yet
  const availableClasses = teacherClasses.length > 0 ? teacherClasses : classes;

  const [selectedClassId, setSelectedClassId] = useState<string>(
    availableClasses[0]?.id || ''
  );
  const selectedClass = classes.find((c) => c.id === selectedClassId) || availableClasses[0];

  // Determine subjects taught by this teacher in this class
  const teacherAssignments = assignments.filter((a) => a.teacherId === teacher?.id);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    teacherAssignments[0]?.subjectId || subjects[0]?.id || ''
  );
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  // Enrollment form state
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  // Score input editing state { [studentId]: { ca1, ca2, ca3, exam, saving, saved } }
  const [scoresState, setScoresState] = useState<{
    [studentId: string]: {
      ca1: number;
      ca2: number;
      ca3: number;
      exam: number;
      saving?: boolean;
      saved?: boolean;
    };
  }>({});

  // Filter students enrolled in the teacher's selected class
  const enrolledStudents = students.filter(
    (s) => s.classId === selectedClass?.id || s.className === selectedClass?.name
  );

  // Initialize scores state from existing results
  const getExistingScore = (studentId: string) => {
    if (scoresState[studentId]) {
      return scoresState[studentId];
    }
    const res = results.find((r) => r.studentId === studentId);
    const subScore = res?.subjects?.find((s) => s.subjectId === selectedSubject?.id);
    return {
      ca1: subScore?.ca1 ?? 0,
      ca2: subScore?.ca2 ?? 0,
      ca3: subScore?.ca3 ?? 0,
      exam: subScore?.exam ?? 0
    };
  };

  const handleScoreChange = (
    studentId: string,
    field: 'ca1' | 'ca2' | 'ca3' | 'exam',
    value: string
  ) => {
    const num = Number(value);
    const maxVal = field === 'exam' ? 70 : 10;
    // Strictly clamp marks: CAs <= 10, Exam <= 70
    const clamped = Math.max(0, Math.min(maxVal, isNaN(num) ? 0 : num));

    const current = getExistingScore(studentId);
    setScoresState((prev) => ({
      ...prev,
      [studentId]: {
        ...current,
        [field]: clamped,
        saved: false
      }
    }));
  };

  const handleSaveStudentScore = async (student: Student) => {
    const studentScore = getExistingScore(student.id);
    setScoresState((prev) => ({
      ...prev,
      [student.id]: { ...studentScore, saving: true }
    }));

    try {
      await onSaveScore(
        student.id,
        selectedSubject.id,
        selectedSubject.name,
        studentScore.ca1,
        studentScore.ca2,
        studentScore.ca3,
        studentScore.exam,
        teacher?.id || 'staff-01',
        teacher?.fullName || 'Teacher'
      );

      confetti({ particleCount: 20 });
      setScoresState((prev) => ({
        ...prev,
        [student.id]: { ...studentScore, saving: false, saved: true }
      }));
      setTimeout(() => {
        setScoresState((prev) => ({
          ...prev,
          [student.id]: { ...studentScore, saved: false }
        }));
      }, 3000);
    } catch (err) {
      console.error(err);
      setScoresState((prev) => ({
        ...prev,
        [student.id]: { ...studentScore, saving: false }
      }));
    }
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnrolling(true);
    try {
      const count = students.length + 1;
      const admissionNo = `GSTC/2026/${count.toString().padStart(3, '0')}`;

      await onEnrollStudent({
        admissionNo,
        firstName,
        lastName,
        gender,
        classId: selectedClass.id,
        className: selectedClass.name,
        term: 'First Term',
        session: '2025/2026',
        guardianName,
        guardianPhone,
        status: 'Active',
        enrolledByTeacherId: teacher?.id
      });

      confetti({ particleCount: 40 });
      setFirstName('');
      setLastName('');
      setGuardianName('');
      setGuardianPhone('');
      setShowEnrollModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setEnrolling(false);
    }
  };

  const isFormTeacherOfCurrentClass =
    teacher?.isFormTeacher &&
    (teacher.formTeacherClassId === selectedClass?.id ||
      teacher.formTeacherClassName === selectedClass?.name);

  return (
    <div className="space-y-6">
      {/* Teacher Profile Banner */}
      <div className="bg-[#0b4d2c] text-white p-5 rounded-2xl shadow-sm border border-emerald-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-stone-900 uppercase">
              Staff Portal
            </span>
            {isFormTeacherOfCurrentClass && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-700 text-white border border-emerald-500">
                ★ Form Master: {selectedClass?.name}
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            Teacher Gradebook & Class Roster
          </h2>
          <p className="text-xs text-emerald-100 mt-0.5">
            Logged in as <strong className="text-white">{teacher?.fullName}</strong> ({teacher?.staffId}) • Manage enrolled students and record CA1 (10 max), CA2 (10 max), CA3 (10 max), and Exam (70 max).
          </p>
        </div>

        <button
          onClick={() => setShowEnrollModal(true)}
          className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5 self-start md:self-auto shrink-0"
        >
          <UserPlus className="w-4 h-4 text-stone-950" />
          <span>Enroll Student to {selectedClass?.name}</span>
        </button>
      </div>

      {/* Class & Subject Selector Controls */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
            1. Select Assigned Class
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none bg-white font-medium"
          >
            {availableClasses.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} ({cls.arm}) — Form Master: {cls.formTeacherName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
            2. Select Subject for Mark Entry
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none bg-white font-medium"
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name} ({sub.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Guidelines Note on Mark Boundaries */}
      <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs flex items-center justify-between gap-3 text-amber-900">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Assessment Rules:</strong> First CA (10 max), Second CA (10 max), Third CA (10 max), and Exam (70 max). Total score is automatically calculated out of 100 max.
          </span>
        </div>
        <span className="font-mono text-[11px] font-bold text-amber-800 shrink-0">
          Max Total: 100
        </span>
      </div>

      {/* Enrolled Students & Marks Entry Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-stone-900">
              {selectedClass?.name} Roster • {selectedSubject?.name} Marks
            </h3>
            <p className="text-xs text-stone-500">
              {enrolledStudents.length} students enrolled in this class
            </p>
          </div>
          <button
            onClick={() => setShowEnrollModal(true)}
            className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-md border border-stone-300 flex items-center gap-1 self-start sm:self-auto"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Enroll Another Student</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-3">Adm No</th>
                <th className="py-3 px-3">Student Name</th>
                <th className="py-3 px-2 text-center w-20">CA 1 (10)</th>
                <th className="py-3 px-2 text-center w-20">CA 2 (10)</th>
                <th className="py-3 px-2 text-center w-20">CA 3 (10)</th>
                <th className="py-3 px-2 text-center w-24">Exam (70)</th>
                <th className="py-3 px-2 text-center w-20">Total (100)</th>
                <th className="py-3 px-2 text-center">Grade</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {enrolledStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-stone-400">
                    No students enrolled in {selectedClass?.name} yet. Click &quot;Enroll Student&quot; above to add learners.
                  </td>
                </tr>
              ) : (
                enrolledStudents.map((std) => {
                  const score = getExistingScore(std.id);
                  const total = score.ca1 + score.ca2 + score.ca3 + score.exam;

                  let grade = 'F';
                  if (total >= 75) grade = 'A';
                  else if (total >= 65) grade = 'B';
                  else if (total >= 50) grade = 'C';
                  else if (total >= 45) grade = 'D';
                  else if (total >= 40) grade = 'E';

                  return (
                    <tr key={std.id} className="hover:bg-stone-50/70 transition">
                      <td className="py-3 px-3 font-mono font-bold text-[#0b4d2c]">
                        {std.admissionNo}
                      </td>
                      <td className="py-3 px-3 font-medium text-stone-900">
                        {std.firstName} {std.lastName}
                        <span className="block text-[10px] text-stone-400">{std.gender}</span>
                      </td>

                      {/* CA 1 (Max 10) */}
                      <td className="py-3 px-2 text-center">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={score.ca1}
                          onChange={(e) => handleScoreChange(std.id, 'ca1', e.target.value)}
                          className="w-14 text-center px-1 py-1 font-mono font-semibold border border-stone-300 rounded focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                        />
                      </td>

                      {/* CA 2 (Max 10) */}
                      <td className="py-3 px-2 text-center">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={score.ca2}
                          onChange={(e) => handleScoreChange(std.id, 'ca2', e.target.value)}
                          className="w-14 text-center px-1 py-1 font-mono font-semibold border border-stone-300 rounded focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                        />
                      </td>

                      {/* CA 3 (Max 10) */}
                      <td className="py-3 px-2 text-center">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={score.ca3}
                          onChange={(e) => handleScoreChange(std.id, 'ca3', e.target.value)}
                          className="w-14 text-center px-1 py-1 font-mono font-semibold border border-stone-300 rounded focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                        />
                      </td>

                      {/* Exam (Max 70) */}
                      <td className="py-3 px-2 text-center">
                        <input
                          type="number"
                          min="0"
                          max="70"
                          value={score.exam}
                          onChange={(e) => handleScoreChange(std.id, 'exam', e.target.value)}
                          className="w-16 text-center px-1 py-1 font-mono font-bold text-stone-900 border border-stone-300 rounded focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none bg-stone-50"
                        />
                      </td>

                      {/* Total (Max 100) */}
                      <td className="py-3 px-2 text-center font-bold text-sm text-[#0b4d2c]">
                        {total}
                      </td>

                      {/* Grade */}
                      <td className="py-3 px-2 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            grade === 'A'
                              ? 'bg-emerald-100 text-emerald-800'
                              : grade === 'B'
                              ? 'bg-blue-100 text-blue-800'
                              : grade === 'C'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {grade}
                        </span>
                      </td>

                      {/* Actions: Save Score & De-enroll */}
                      <td className="py-3 px-3 text-right space-x-2">
                        <button
                          onClick={() => handleSaveStudentScore(std)}
                          disabled={score.saving}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-md shadow-2xs transition ${
                            score.saved
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#0b4d2c] hover:bg-[#083a21] text-white'
                          }`}
                        >
                          {score.saving ? 'Saving...' : score.saved ? 'Saved ✓' : 'Save Score'}
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`De-enroll ${std.firstName} ${std.lastName} from ${selectedClass?.name}?`)) {
                              onDeenrollStudent(std.id);
                            }
                          }}
                          className="px-2 py-1 text-stone-400 hover:text-red-600 rounded"
                          title="De-enroll student"
                        >
                          <UserMinus className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Enroll Student by Teacher */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs text-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-emerald-700" />
                Enroll Student into {selectedClass?.name}
              </h3>
              <button onClick={() => setShowEnrollModal(false)} className="text-stone-400 hover:text-stone-600">✕</button>
            </div>

            <form onSubmit={handleEnrollSubmit} className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fatima"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Last / Surname</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bello"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e: any) => setGender(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Guardian Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Alh. Bello"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Guardian Phone</label>
                  <input
                    type="text"
                    placeholder="+234 803 000 0000"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowEnrollModal(false)} className="px-3 py-1.5 text-stone-600">Cancel</button>
                <button
                  type="submit"
                  disabled={enrolling}
                  className="px-4 py-1.5 bg-[#0b4d2c] text-white font-bold rounded-lg shadow-sm"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
