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
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { SchoolBadge } from './SchoolBadge';
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
  Award,
  Eye,
  EyeOff,
  Copy,
  Check,
  Key,
  CheckSquare,
  Square,
  CheckCheck,
  RotateCcw,
  Sparkles,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function isStudentInSchoolClass(s: Student, cls: SchoolClass | undefined | null): boolean {
  if (!s || !cls) return false;
  // 1. Direct classId match
  if (s.classId && cls.id && s.classId.trim() === cls.id.trim()) return true;
  // 2. Direct or normalized className match
  if (s.className && cls.name) {
    const normS = s.className.trim().toLowerCase().replace(/\s+/g, ' ');
    const normC = cls.name.trim().toLowerCase().replace(/\s+/g, ' ');
    if (normS === normC) return true;
  }
  // 3. Fallback: if student classId matches class name (e.g. classId: "CCS 1")
  if (s.classId && cls.name) {
    const normId = s.classId.trim().toLowerCase().replace(/\s+/g, ' ');
    const normC = cls.name.trim().toLowerCase().replace(/\s+/g, ' ');
    if (normId === normC) return true;
  }
  // 4. Fallback: if student className matches class id (e.g. className: "class-ccs1")
  if (s.className && cls.id) {
    const normS = s.className.trim().toLowerCase().replace(/\s+/g, ' ');
    const normId = cls.id.trim().toLowerCase().replace(/\s+/g, ' ');
    if (normS === normId) return true;
  }
  return false;
}

interface StaffDashboardProps {
  currentStaff: Staff | undefined;
  allStaff: Staff[];
  students: Student[];
  classes: SchoolClass[];
  subjects: Subject[];
  assignments: TeachingAssignment[];
  results: ExamResult[];
  onEnrollStudent: (data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Student>;
  onUpdateStudent?: (studentId: string, updates: Partial<Student>) => Promise<void>;
  onDeenrollStudent: (studentId: string) => Promise<void>;
  onEnrollStudentsInSubject?: (studentIds: string[], subjectId: string) => Promise<void>;
  onUnenrollStudentsFromSubject?: (studentIds: string[], subjectId: string) => Promise<void>;
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
  onUpdateStudent,
  onDeenrollStudent,
  onEnrollStudentsInSubject,
  onUnenrollStudentsFromSubject,
  onSaveScore
}) => {
  // Use either the logged in teacher or default to first staff
  const teacher = currentStaff || allStaff[0];

  // Determine classes where this teacher is the Form Teacher
  const formTeacherClasses = classes.filter(
    (c) =>
      (teacher?.isFormTeacher &&
        (teacher.formTeacherClassId === c.id ||
          teacher.formTeacherClassName?.toLowerCase() === c.name.toLowerCase())) ||
      c.formTeacherId === teacher?.id ||
      (teacher?.fullName && c.formTeacherName?.toLowerCase() === teacher.fullName.toLowerCase())
  );

  // Determine classes assigned to this teacher
  const teacherClasses = classes.filter(
    (c) =>
      formTeacherClasses.some((fc) => fc.id === c.id) ||
      teacher?.assignedClasses?.includes(c.name) ||
      assignments.some((a) => a.teacherId === teacher?.id && a.classId === c.id)
  );

  // Selected class (defaults to form class or first available class)
  const [selectedClassId, setSelectedClassId] = useState<string>(
    formTeacherClasses[0]?.id || classes[0]?.id || ''
  );
  const selectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  // Determine subjects taught by this teacher in this class
  const teacherAssignments = assignments.filter((a) => a.teacherId === teacher?.id);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    teacherAssignments[0]?.subjectId || subjects[0]?.id || ''
  );
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  // Enrollment form state
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [studentToDeenroll, setStudentToDeenroll] = useState<Student | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [studentPassword, setStudentPassword] = useState('0000');
  const [alsoEnrollInCurrentSubject, setAlsoEnrollInCurrentSubject] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  // Password visibility & copy state for Form Teacher viewing student credentials
  const [visiblePasswords, setVisiblePasswords] = useState<{ [id: string]: boolean }>({});
  const [showAllPasswords, setShowAllPasswords] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingPasswordStudent, setEditingPasswordStudent] = useState<Student | null>(null);
  const [newStudentPassInput, setNewStudentPassInput] = useState('');
  const [savingStudentPass, setSavingStudentPass] = useState(false);

  // Subject enrollment bulk operations state
  const [bulkEnrolling, setBulkEnrolling] = useState(false);
  const [bulkSuccessNotice, setBulkSuccessNotice] = useState<string | null>(null);
  const [togglingOffering, setTogglingOffering] = useState<{ [id: string]: boolean }>({});
  const [offeringFilter, setOfferingFilter] = useState<'all' | 'offering' | 'not_offering'>('all');

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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

  // Filter all students registered in the selected class (robust ID + Name matching)
  const enrolledStudents = students.filter((s) => isStudentInSchoolClass(s, selectedClass));

  // Determine whether a given student offers the selected subject
  const isOfferingSubject = (std: Student): boolean => {
    if (!selectedSubject) return false;
    if (Array.isArray(std.enrolledSubjectIds)) {
      return std.enrolledSubjectIds.includes(selectedSubject.id);
    }
    // If student has a recorded score in results for this subject, treat as offering
    const res = results.find((r) => r.studentId === std.id || r.admissionNo === std.admissionNo);
    const subScore = res?.subjects?.find((s) => s.subjectId === selectedSubject.id);
    return Boolean(
      subScore &&
        (subScore.ca1 > 0 || subScore.ca2 > 0 || subScore.ca3 > 0 || subScore.exam > 0)
    );
  };

  const offeringStudents = enrolledStudents.filter((s) => isOfferingSubject(s));
  const notOfferingStudents = enrolledStudents.filter((s) => !isOfferingSubject(s));

  const displayedStudents =
    offeringFilter === 'offering'
      ? offeringStudents
      : offeringFilter === 'not_offering'
      ? notOfferingStudents
      : enrolledStudents;

  // Toggle subject offering for an individual student (tick/untick)
  const handleToggleOffering = async (std: Student) => {
    if (!selectedSubject) return;
    const isCurrentlyOffering = isOfferingSubject(std);
    setTogglingOffering((prev) => ({ ...prev, [std.id]: true }));
    try {
      if (isCurrentlyOffering) {
        if (onUnenrollStudentsFromSubject) {
          await onUnenrollStudentsFromSubject([std.id], selectedSubject.id);
        } else if (onUpdateStudent) {
          const next = (std.enrolledSubjectIds || []).filter((id) => id !== selectedSubject.id);
          await onUpdateStudent(std.id, { enrolledSubjectIds: next });
        }
      } else {
        if (onEnrollStudentsInSubject) {
          await onEnrollStudentsInSubject([std.id], selectedSubject.id);
        } else if (onUpdateStudent) {
          const next = Array.from(new Set([...(std.enrolledSubjectIds || []), selectedSubject.id]));
          await onUpdateStudent(std.id, { enrolledSubjectIds: next });
        }
        confetti({ particleCount: 15 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingOffering((prev) => ({ ...prev, [std.id]: false }));
    }
  };

  // Button: Enroll all students at once
  const handleEnrollAllStudents = async () => {
    if (!selectedSubject || enrolledStudents.length === 0) return;
    setBulkEnrolling(true);
    try {
      const studentIds = enrolledStudents.map((s) => s.id);
      if (onEnrollStudentsInSubject) {
        await onEnrollStudentsInSubject(studentIds, selectedSubject.id);
      } else if (onUpdateStudent) {
        for (const std of enrolledStudents) {
          const next = Array.from(new Set([...(std.enrolledSubjectIds || []), selectedSubject.id]));
          await onUpdateStudent(std.id, { enrolledSubjectIds: next });
        }
      }
      confetti({ particleCount: 45, spread: 70 });
      setBulkSuccessNotice(
        `All ${enrolledStudents.length} students in ${selectedClass?.name} are now enrolled in ${selectedSubject?.name}!`
      );
      setTimeout(() => setBulkSuccessNotice(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setBulkEnrolling(false);
    }
  };

  // Button: Deselect / Unenroll all students
  const handleUnenrollAllStudents = async () => {
    if (!selectedSubject || enrolledStudents.length === 0) return;
    setBulkEnrolling(true);
    try {
      const studentIds = enrolledStudents.map((s) => s.id);
      if (onUnenrollStudentsFromSubject) {
        await onUnenrollStudentsFromSubject(studentIds, selectedSubject.id);
      } else if (onUpdateStudent) {
        for (const std of enrolledStudents) {
          const next = (std.enrolledSubjectIds || []).filter((id) => id !== selectedSubject.id);
          await onUpdateStudent(std.id, { enrolledSubjectIds: next });
        }
      }
      setBulkSuccessNotice(
        `All students in ${selectedClass?.name} unselected from ${selectedSubject?.name}.`
      );
      setTimeout(() => setBulkSuccessNotice(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setBulkEnrolling(false);
    }
  };

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

    // If student was not marked as offering yet, automatically mark them as enrolled!
    const targetStudent = students.find((s) => s.id === studentId);
    if (targetStudent && !isOfferingSubject(targetStudent)) {
      handleToggleOffering(targetStudent);
    }
  };

  const handleSaveStudentScore = async (student: Student) => {
    const studentScore = getExistingScore(student.id);
    setScoresState((prev) => ({
      ...prev,
      [student.id]: { ...studentScore, saving: true }
    }));

    try {
      // Ensure student is marked as enrolled in this subject
      if (!isOfferingSubject(student)) {
        await handleToggleOffering(student);
      }

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
      // Safe admission number generator
      let maxNum = 0;
      students.forEach((s) => {
        const parts = s.admissionNo?.split('/');
        if (parts && parts.length >= 3) {
          const num = parseInt(parts[parts.length - 1], 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      });
      const nextIdx = Math.max(students.length + 1, maxNum + 1);
      const admissionNo = `GSTC/2026/${nextIdx.toString().padStart(3, '0')}`;

      await onEnrollStudent({
        admissionNo,
        password: studentPassword.trim() || '0000',
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender,
        classId: selectedClass.id,
        className: selectedClass.name.trim(),
        term: 'First Term',
        session: '2025/2026',
        guardianName: guardianName.trim(),
        guardianPhone: guardianPhone.trim(),
        status: 'Active',
        enrolledByTeacherId: teacher?.id,
        enrolledSubjectIds:
          alsoEnrollInCurrentSubject && selectedSubject ? [selectedSubject.id] : []
      });

      confetti({ particleCount: 40 });
      setFirstName('');
      setLastName('');
      setGuardianName('');
      setGuardianPhone('');
      setStudentPassword('0000');
      setShowEnrollModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setEnrolling(false);
    }
  };

  const handleUpdateStudentPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPasswordStudent || !onUpdateStudent) return;
    setSavingStudentPass(true);
    try {
      await onUpdateStudent(editingPasswordStudent.id, {
        password: newStudentPassInput.trim() || '0000'
      });
      confetti({ particleCount: 30 });
      setEditingPasswordStudent(null);
      setNewStudentPassInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setSavingStudentPass(false);
    }
  };

  const isFormTeacherOfCurrentClass = Boolean(
    formTeacherClasses.some((fc) => fc.id === selectedClass?.id || fc.name === selectedClass?.name) ||
      (teacher?.isFormTeacher &&
        (teacher.formTeacherClassId === selectedClass?.id ||
          teacher.formTeacherClassName?.toLowerCase() === selectedClass?.name?.toLowerCase())) ||
      selectedClass?.formTeacherId === teacher?.id ||
      (teacher?.fullName &&
        selectedClass?.formTeacherName?.toLowerCase() === teacher.fullName.toLowerCase())
  );

  // All students belonging to any class where this teacher is the Form Teacher
  const myFormClassStudents = students.filter((s) =>
    formTeacherClasses.some((fc) => fc.id === s.classId || fc.name.toLowerCase() === s.className.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Teacher Profile Banner */}
      <div className="bg-[#0b4d2c] text-white p-5 rounded-2xl shadow-sm border border-emerald-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <SchoolBadge size="md" className="shadow-sm" />
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
        </div>

        <button
          onClick={() => setShowEnrollModal(true)}
          className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5 self-start md:self-auto shrink-0"
        >
          <UserPlus className="w-4 h-4 text-stone-950" />
          <span>Enroll New Student to {selectedClass?.name}</span>
        </button>
      </div>

      {/* Class & Subject Selector Controls */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
            1. Select Class
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none bg-white font-medium"
          >
            {classes.map((cls) => {
              const isAssigned = teacherClasses.some((tc) => tc.id === cls.id);
              const isForm = formTeacherClasses.some((fc) => fc.id === cls.id);
              return (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.arm}) — Form Master: {cls.formTeacherName || 'Unassigned'}
                  {isForm ? ' ★ [Your Form Class]' : isAssigned ? ' • [Assigned]' : ''}
                </option>
              );
            })}
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
                {sub.name} ({sub.code}) — {sub.category}
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

      {/* Form Teacher Exclusive: Student Login Details Directory */}
      {(isFormTeacherOfCurrentClass || formTeacherClasses.length > 0) && (
        <div className="bg-white rounded-xl border border-emerald-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-emerald-50/70 border-b border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0b4d2c] text-white uppercase tracking-wider flex items-center gap-1">
                  <Key className="w-3 h-3 text-amber-300" /> Form Teacher Access
                </span>
                <span className="text-xs font-bold text-emerald-950">
                  Class: {isFormTeacherOfCurrentClass ? selectedClass?.name : formTeacherClasses.map((c) => c.name).join(', ')}
                </span>
              </div>
              <h3 className="text-sm font-bold text-stone-900 mt-1">
                My Form Class Students — Login Details &amp; Passwords
              </h3>
              <p className="text-xs text-stone-600">
                As the designated Form Teacher, you can view, copy, and manage your students&apos; portal login credentials (Admission Number &amp; Password).
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setShowAllPasswords((prev) => !prev)}
                className="px-3 py-1.5 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold rounded-lg border border-emerald-300 flex items-center gap-1.5 shadow-2xs"
              >
                {showAllPasswords ? <EyeOff className="w-3.5 h-3.5 text-[#0b4d2c]" /> : <Eye className="w-3.5 h-3.5 text-[#0b4d2c]" />}
                <span>{showAllPasswords ? 'Hide All Passwords' : 'Show All Passwords'}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Student Name</th>
                  <th className="py-2.5 px-4">Class</th>
                  <th className="py-2.5 px-4">Login Username (Admission No)</th>
                  <th className="py-2.5 px-4">Login Password</th>
                  <th className="py-2.5 px-4 text-right">Credentials Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {(isFormTeacherOfCurrentClass ? enrolledStudents : myFormClassStudents).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-stone-400">
                      No students enrolled in your form class yet.
                    </td>
                  </tr>
                ) : (
                  (isFormTeacherOfCurrentClass ? enrolledStudents : myFormClassStudents).map((std) => {
                    const stdPass = std.password || '0000';
                    const isPassVisible = showAllPasswords || visiblePasswords[std.id];
                    return (
                      <tr key={`cred-${std.id}`} className="hover:bg-emerald-50/30 transition">
                        <td className="py-2.5 px-4 font-semibold text-stone-900">
                          {std.firstName} {std.lastName}
                          <span className="ml-2 text-[10px] text-stone-400 font-normal">({std.gender})</span>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-stone-100 border border-stone-200 text-stone-700 font-medium">
                            {std.className}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-[#0b4d2c]">{std.admissionNo}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(std.admissionNo, `ft-adm-${std.id}`)}
                              className="text-stone-400 hover:text-stone-700 p-0.5"
                              title="Copy Admission No"
                            >
                              {copiedId === `ft-adm-${std.id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-[#0b4d2c] bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                              {isPassVisible ? stdPass : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(std.id)}
                              className="text-stone-400 hover:text-stone-700 p-1"
                              title={isPassVisible ? 'Hide Password' : 'Show Password'}
                            >
                              {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopy(stdPass, `ft-pass-${std.id}`)}
                              className="text-stone-400 hover:text-stone-700 p-1"
                              title="Copy Password"
                            >
                              {copiedId === `ft-pass-${std.id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(
                                `Student: ${std.firstName} ${std.lastName} | Login ID: ${std.admissionNo} | Password: ${stdPass}`,
                                `ft-full-${std.id}`
                              )
                            }
                            className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded border border-stone-300 text-[11px] font-semibold inline-flex items-center gap-1"
                          >
                            {copiedId === `ft-full-${std.id}` ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" /> Copy Login
                              </>
                            )}
                          </button>
                          {onUpdateStudent && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPasswordStudent(std);
                                setNewStudentPassInput(std.password || '0000');
                              }}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#0b4d2c] rounded border border-emerald-200 text-[11px] font-semibold inline-flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" /> Set Password
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enrolled Students & Marks Entry Table with Subject Offering Checkboxes */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
        {/* Table Header & Controls Bar */}
        <div className="p-4 border-b border-stone-200 bg-stone-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-stone-900">
                {selectedClass?.name} Roster • {selectedSubject?.name} Marks
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#0b4d2c] text-white">
                {offeringStudents.length} of {enrolledStudents.length} Offering Subject
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Tick the box beside each student&apos;s name to select who offers {selectedSubject?.name}. Only enrolled students have continuous assessment scores recorded.
            </p>
          </div>

          {/* Action Buttons: Enroll All at Once & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={bulkEnrolling || enrolledStudents.length === 0}
              onClick={handleEnrollAllStudents}
              className="px-3.5 py-2 bg-[#0b4d2c] hover:bg-[#07361e] text-white text-xs font-bold rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Enroll all students in this class in this subject at once"
            >
              <CheckCheck className="w-4 h-4 text-amber-300" />
              <span>{bulkEnrolling ? 'Enrolling All...' : 'Enroll All Students at Once'}</span>
            </button>

            {offeringStudents.length > 0 && (
              <button
                type="button"
                disabled={bulkEnrolling}
                onClick={handleUnenrollAllStudents}
                className="px-3 py-2 bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold rounded-lg border border-stone-300 transition flex items-center gap-1 cursor-pointer"
                title="Deselect all students for this subject"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Deselect All</span>
              </button>
            )}

            <button
              onClick={() => setShowEnrollModal(true)}
              className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-lg shadow-xs flex items-center gap-1 transition cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-stone-950" />
              <span>Add Student</span>
            </button>
          </div>
        </div>

        {/* Filter Pills and Success Banner */}
        <div className="px-4 py-2.5 bg-stone-100/70 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-stone-600 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-stone-500" /> View:
            </span>
            <button
              type="button"
              onClick={() => setOfferingFilter('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                offeringFilter === 'all'
                  ? 'bg-stone-800 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
              }`}
            >
              All Class Students ({enrolledStudents.length})
            </button>
            <button
              type="button"
              onClick={() => setOfferingFilter('offering')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                offeringFilter === 'offering'
                  ? 'bg-[#0b4d2c] text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
              }`}
            >
              Offering Subject ({offeringStudents.length})
            </button>
            <button
              type="button"
              onClick={() => setOfferingFilter('not_offering')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                offeringFilter === 'not_offering'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
              }`}
            >
              Not Offering ({notOfferingStudents.length})
            </button>
          </div>

          {bulkSuccessNotice && (
            <span className="text-emerald-800 font-bold flex items-center gap-1 animate-pulse">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>{bulkSuccessNotice}</span>
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-3 w-40">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="master-enroll-checkbox"
                      checked={
                        enrolledStudents.length > 0 &&
                        offeringStudents.length === enrolledStudents.length
                      }
                      onChange={() => {
                        if (offeringStudents.length === enrolledStudents.length) {
                          handleUnenrollAllStudents();
                        } else {
                          handleEnrollAllStudents();
                        }
                      }}
                      className="w-4 h-4 text-[#0b4d2c] rounded border-stone-300 focus:ring-[#0b4d2c] cursor-pointer accent-[#0b4d2c]"
                      title="Select / Deselect all students in this class"
                    />
                    <label htmlFor="master-enroll-checkbox" className="cursor-pointer">
                      Offers Subject?
                    </label>
                  </div>
                </th>
                <th className="py-3 px-3">Login ID (Adm No)</th>
                <th className="py-3 px-3">Student Name</th>
                {isFormTeacherOfCurrentClass && (
                  <th className="py-3 px-3">Password (Form Master)</th>
                )}
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
              {displayedStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={isFormTeacherOfCurrentClass ? 11 : 10}
                    className="py-10 text-center text-stone-400 space-y-2"
                  >
                    <BookOpen className="w-8 h-8 text-stone-300 mx-auto" />
                    <p className="font-semibold text-stone-700">
                      {enrolledStudents.length === 0
                        ? `No students registered in ${selectedClass?.name} yet.`
                        : offeringFilter === 'offering'
                        ? `No students in ${selectedClass?.name} are currently enrolled in ${selectedSubject?.name}. Click "Enroll All Students at Once" above or tick individual students.`
                        : 'No students matching this filter.'}
                    </p>
                    {enrolledStudents.length > 0 && offeringStudents.length === 0 && (
                      <button
                        type="button"
                        onClick={handleEnrollAllStudents}
                        className="px-4 py-2 bg-[#0b4d2c] hover:bg-[#07361e] text-white font-bold rounded-lg text-xs"
                      >
                        Enroll All {enrolledStudents.length} Students in {selectedSubject?.name} Now
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                displayedStudents.map((std) => {
                  const isOffering = isOfferingSubject(std);
                  const score = getExistingScore(std.id);
                  const total = score.ca1 + score.ca2 + score.ca3 + score.exam;
                  const stdPass = std.password || '0000';
                  const isPassVisible = showAllPasswords || visiblePasswords[std.id];

                  let grade = 'F';
                  if (total >= 75) grade = 'A';
                  else if (total >= 65) grade = 'B';
                  else if (total >= 50) grade = 'C';
                  else if (total >= 45) grade = 'D';
                  else if (total >= 40) grade = 'E';

                  return (
                    <tr
                      key={std.id}
                      className={`transition ${
                        isOffering
                          ? 'hover:bg-emerald-50/40 bg-white'
                          : 'bg-stone-50/40 opacity-75 hover:opacity-100 hover:bg-stone-100/60'
                      }`}
                    >
                      {/* Column 1: Box beside Student Name to Tick / Select Offering */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`offering-${std.id}`}
                            checked={isOffering}
                            disabled={togglingOffering[std.id]}
                            onChange={() => handleToggleOffering(std)}
                            className="w-4.5 h-4.5 text-[#0b4d2c] rounded border-stone-300 focus:ring-[#0b4d2c] cursor-pointer accent-[#0b4d2c]"
                            title={
                              isOffering
                                ? `Enrolled in ${selectedSubject?.name}. Click to untick.`
                                : `Click to tick and enroll in ${selectedSubject?.name}.`
                            }
                          />
                          <label
                            htmlFor={`offering-${std.id}`}
                            className="cursor-pointer select-none"
                          >
                            {isOffering ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                <Check className="w-3 h-3 text-emerald-700" />
                                <span>Offering</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-500 border border-stone-200 hover:bg-emerald-50 hover:text-emerald-800 transition">
                                <span>Tick to enroll</span>
                              </span>
                            )}
                          </label>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-[#0b4d2c]">
                        {std.admissionNo}
                      </td>

                      <td className="py-3 px-3 font-medium text-stone-900">
                        <div className="flex items-center gap-1.5">
                          <span>
                            {std.firstName} {std.lastName}
                          </span>
                          <span className="text-[10px] text-stone-400 font-normal">
                            ({std.gender})
                          </span>
                        </div>
                        {!isOffering && (
                          <span className="text-[10px] text-amber-700 block font-normal">
                            Not offering {selectedSubject?.code} • Tick box to enroll
                          </span>
                        )}
                      </td>

                      {isFormTeacherOfCurrentClass && (
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1">
                            <span className="font-mono font-bold text-[#0b4d2c] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {isPassVisible ? stdPass : '••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(std.id)}
                              className="text-stone-400 hover:text-stone-700 p-0.5"
                              title={isPassVisible ? 'Hide Password' : 'Show Password'}
                            >
                              {isPassVisible ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopy(stdPass, `tbl-pass-${std.id}`)}
                              className="text-stone-400 hover:text-stone-700 p-0.5"
                              title="Copy Password"
                            >
                              {copiedId === `tbl-pass-${std.id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>
                      )}

                      {/* CA 1 (Max 10) */}
                      <td className="py-3 px-2 text-center">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={score.ca1}
                          onChange={(e) => handleScoreChange(std.id, 'ca1', e.target.value)}
                          className={`w-14 text-center px-1 py-1 font-mono font-semibold border rounded focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none ${
                            isOffering
                              ? 'border-stone-300 bg-white'
                              : 'border-stone-200 bg-stone-100 text-stone-500'
                          }`}
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
                          className={`w-14 text-center px-1 py-1 font-mono font-semibold border rounded focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none ${
                            isOffering
                              ? 'border-stone-300 bg-white'
                              : 'border-stone-200 bg-stone-100 text-stone-500'
                          }`}
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
                          className={`w-14 text-center px-1 py-1 font-mono font-semibold border rounded focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none ${
                            isOffering
                              ? 'border-stone-300 bg-white'
                              : 'border-stone-200 bg-stone-100 text-stone-500'
                          }`}
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
                          className={`w-16 text-center px-1 py-1 font-mono font-bold border rounded focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none ${
                            isOffering
                              ? 'border-stone-300 bg-stone-50 text-stone-900'
                              : 'border-stone-200 bg-stone-100 text-stone-500'
                          }`}
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
                              : isOffering
                              ? 'bg-[#0b4d2c] hover:bg-[#083a21] text-white cursor-pointer'
                              : 'bg-stone-200 hover:bg-[#0b4d2c] text-stone-700 hover:text-white cursor-pointer'
                          }`}
                          title={
                            isOffering
                              ? 'Save score to Firestore'
                              : 'Tick box & save score for student'
                          }
                        >
                          {score.saving ? 'Saving...' : score.saved ? 'Saved ✓' : 'Save Score'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setStudentToDeenroll(std)}
                          className="px-2 py-1 text-stone-400 hover:text-red-600 rounded cursor-pointer"
                          title="De-enroll student from class"
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
              <button
                onClick={() => setShowEnrollModal(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
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

              <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs">
                <span className="text-stone-600">Assigned Class: </span>
                <strong className="text-emerald-950 font-bold">
                  {selectedClass?.name} ({selectedClass?.arm})
                </strong>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  The student will immediately appear in the {selectedClass?.name} student list.
                </p>
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

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Student Portal Login Password
                </label>
                <input
                  type="text"
                  required
                  placeholder="Default: 0000"
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  className="w-full px-3 py-2 font-mono border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none bg-emerald-50/40"
                />
              </div>

              {selectedSubject && (
                <div className="flex items-center gap-2 p-2 bg-stone-50 rounded-lg border border-stone-200">
                  <input
                    type="checkbox"
                    id="modal-also-enroll"
                    checked={alsoEnrollInCurrentSubject}
                    onChange={(e) => setAlsoEnrollInCurrentSubject(e.target.checked)}
                    className="w-4 h-4 text-[#0b4d2c] rounded border-stone-300 focus:ring-[#0b4d2c] cursor-pointer"
                  />
                  <label htmlFor="modal-also-enroll" className="cursor-pointer font-medium text-stone-700">
                    Also enroll in {selectedSubject.name} ({selectedSubject.code})
                  </label>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="px-3 py-1.5 text-stone-600"
                >
                  Cancel
                </button>
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

      {/* Modal: Form Teacher Set/Update Student Password */}
      {editingPasswordStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs text-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-[#0b4d2c]" />
                Student Login Credentials
              </h3>
              <button
                onClick={() => setEditingPasswordStudent(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateStudentPasswordSubmit} className="space-y-3 mt-4">
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-1">
                <div className="text-stone-500">Student Name:</div>
                <div className="font-bold text-stone-900">
                  {editingPasswordStudent.firstName} {editingPasswordStudent.lastName}
                </div>
                <div className="text-stone-500 pt-1">Login ID (Admission No):</div>
                <div className="font-mono font-bold text-[#0b4d2c]">
                  {editingPasswordStudent.admissionNo}
                </div>
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Student Portal Password
                </label>
                <input
                  type="text"
                  required
                  value={newStudentPassInput}
                  onChange={(e) => setNewStudentPassInput(e.target.value)}
                  className="w-full px-3 py-2 font-mono border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPasswordStudent(null)}
                  className="px-3 py-1.5 text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingStudentPass}
                  className="px-4 py-1.5 bg-[#0b4d2c] text-white font-bold rounded-lg shadow-sm"
                >
                  {savingStudentPass ? 'Saving...' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(studentToDeenroll)}
        title="De-enroll & Remove Student"
        message={
          studentToDeenroll
            ? `Are you sure you want to de-enroll and remove "${studentToDeenroll.firstName} ${studentToDeenroll.lastName}" (${studentToDeenroll.admissionNo}) from ${selectedClass?.name || 'this class'}?`
            : ''
        }
        confirmLabel="Yes, De-enroll Student"
        onConfirm={async () => {
          if (studentToDeenroll) {
            await onDeenrollStudent(studentToDeenroll.id);
            setStudentToDeenroll(null);
          }
        }}
        onCancel={() => setStudentToDeenroll(null)}
      />
    </div>
  );
};
