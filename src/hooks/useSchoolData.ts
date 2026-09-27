import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  Student,
  Staff,
  SchoolClass,
  Subject,
  TeachingAssignment,
  ScratchCard,
  ExamResult,
  Notice,
  AdminAccount,
  SchoolSettings,
  SubjectScore,
  SchoolNews,
  WebsiteCustomization
} from '../types/school';
import { seedInitialSchoolDataIfNeeded } from '../services/seedData';

export function useSchoolData() {
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<TeachingAssignment[]>([]);
  const [scratchCards, setScratchCards] = useState<ScratchCard[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [news, setNews] = useState<SchoolNews[]>([]);
  const [customization, setCustomization] = useState<WebsiteCustomization | null>(null);

  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'connected' | 'syncing' | 'error'>('syncing');
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  useEffect(() => {
    seedInitialSchoolDataIfNeeded();
  }, []);

  useEffect(() => {
    setSyncStatus('syncing');

    // 0. Admins listener
    const unsubAdmins = onSnapshot(
      collection(db, 'admins'),
      (snap) => {
        const list: AdminAccount[] = [];
        snap.forEach((d) => list.push({ ...d.data(), id: d.id } as AdminAccount));
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setAdmins(list);
        setSyncStatus('connected');
        setLastSyncTime(new Date());
      },
      (err) => console.error('Admins sync error:', err)
    );

    // 1. Students listener
    const unsubStudents = onSnapshot(
      collection(db, 'students'),
      (snap) => {
        const list: Student[] = [];
        snap.forEach((d) => list.push({ ...d.data(), id: d.id } as Student));
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setStudents(list);
        setSyncStatus('connected');
        setLastSyncTime(new Date());
      },
      (err) => console.error('Students sync error:', err)
    );

    // 2. Staff listener
    const unsubStaff = onSnapshot(
      collection(db, 'staff'),
      (snap) => {
        const list: Staff[] = [];
        snap.forEach((d) => list.push({ ...d.data(), id: d.id } as Staff));
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setStaff(list);
        setSyncStatus('connected');
      },
      (err) => console.error('Staff sync error:', err)
    );

    // 3. Classes listener
    const unsubClasses = onSnapshot(
      collection(db, 'classes'),
      (snap) => {
        const list: SchoolClass[] = [];
        snap.forEach((d) => list.push({ ...d.data(), id: d.id } as SchoolClass));
        setClasses(list);
      },
      (err) => console.error('Classes sync error:', err)
    );

    // 4. Subjects listener
    const unsubSubjects = onSnapshot(
      collection(db, 'subjects'),
      (snap) => {
        const list: Subject[] = [];
        snap.forEach((d) => list.push({ ...d.data(), id: d.id } as Subject));
        setSubjects(list);
      },
      (err) => console.error('Subjects sync error:', err)
    );

    // 5. Assignments listener
    const unsubAssignments = onSnapshot(
      collection(db, 'assignments'),
      (snap) => {
        const list: TeachingAssignment[] = [];
        snap.forEach((d) => list.push({ ...d.data(), id: d.id } as TeachingAssignment));
        setAssignments(list);
      },
      (err) => console.error('Assignments sync error:', err)
    );

    // 6. Scratch Cards listener
    const unsubCards = onSnapshot(
      collection(db, 'scratch_cards'),
      (snap) => {
        const list: ScratchCard[] = [];
        snap.forEach((d) => list.push({ ...d.data(), id: d.id } as ScratchCard));
        list.sort((a, b) => (b.generatedAt || 0) - (a.generatedAt || 0));
        setScratchCards(list);
      },
      (err) => console.error('Cards sync error:', err)
    );

    // 7. Results listener
    const unsubResults = onSnapshot(
      collection(db, 'results'),
      (snap) => {
        const list: ExamResult[] = [];
        snap.forEach((d) => list.push({ ...d.data(), id: d.id } as ExamResult));
        setResults(list);
      },
      (err) => console.error('Results sync error:', err)
    );

    // 8. Notice listener
    const unsubNotice = onSnapshot(
      doc(db, 'notices', 'current-advisory'),
      (snap) => {
        if (snap.exists()) {
          setNotice(snap.data() as Notice);
        }
      },
      (err) => console.error('Notice sync error:', err)
    );

    // 9. Settings listener
    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'global_config'),
      (snap) => {
        if (snap.exists()) {
          setSettings(snap.data() as SchoolSettings);
        }
      },
      (err) => console.error('Settings sync error:', err)
    );

    // 10. News & Announcements listener (for visitors & public)
    const unsubNews = onSnapshot(
      collection(db, 'school_news'),
      (snap) => {
        const list: SchoolNews[] = [];
        snap.forEach((d) => list.push({ ...d.data(), id: d.id } as SchoolNews));
        list.sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0));
        setNews(list);
      },
      (err) => console.error('News sync error:', err)
    );

    // 11. Website Customization listener (Super Admin controls website changes)
    const unsubCustom = onSnapshot(
      doc(db, 'website_customization', 'main'),
      (snap) => {
        if (snap.exists()) {
          setCustomization(snap.data() as WebsiteCustomization);
        } else {
          setCustomization({
            heroTagline: 'Empowering Future Innovators & Technical Leaders',
            heroAnnouncement: 'Admissions for 2026/2027 Academic Session are now open.',
            principalWelcomeMessage: 'Welcome to Government Science & Technical College Garki.',
            schoolContactEmail: 'info@gstcgarki.edu.ng',
            schoolPhone: '+234 9 291 0000',
            schoolAddress: 'Area 10, Garki, Abuja FCT, Nigeria',
            bannerNoticeText: 'Academic Session 2025/2026 First Term ongoing.',
            bannerNoticeActive: true,
            primaryAccentColor: '#0b4d2c',
            updatedAt: Date.now(),
            updatedBy: 'Principal Super Admin'
          });
        }
        setLoading(false);
      },
      (err) => {
        console.error('Customization sync error:', err);
        setLoading(false);
      }
    );

    return () => {
      unsubAdmins();
      unsubStudents();
      unsubStaff();
      unsubClasses();
      unsubSubjects();
      unsubAssignments();
      unsubCards();
      unsubResults();
      unsubNotice();
      unsubSettings();
      unsubNews();
      unsubCustom();
    };
  }, []);

  // --- Super Admin Actions ---
  const addAdmin = async (adminData: Omit<AdminAccount, 'id' | 'createdAt'>) => {
    const newDocRef = doc(collection(db, 'admins'));
    const newAdmin: AdminAccount = {
      ...adminData,
      id: newDocRef.id,
      createdAt: Date.now()
    };
    await setDoc(newDocRef, newAdmin);
    return newAdmin;
  };

  const removeAdmin = async (adminId: string) => {
    await deleteDoc(doc(db, 'admins', adminId));
  };

  const updateWebsiteCustomization = async (updates: Partial<WebsiteCustomization>) => {
    await setDoc(
      doc(db, 'website_customization', 'main'),
      {
        ...updates,
        updatedAt: Date.now(),
        updatedBy: 'Principal Super Admin'
      },
      { merge: true }
    );
  };

  // Generate arbitrary user-specified number of scratch cards
  const generateBatchScratchCards = async (count: number) => {
    const safeCount = Math.max(1, Math.min(200, Number(count) || 5));
    const batchList: ScratchCard[] = [];
    const batch = writeBatch(db);

    for (let i = 0; i < safeCount; i++) {
      const pin = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
      const serialNumber = `GSTC-SCR-${Math.floor(100000 + Math.random() * 900000)}`;
      const cardRef = doc(collection(db, 'scratch_cards'));
      const cardItem: ScratchCard = {
        id: cardRef.id,
        pin,
        serialNumber,
        usageCount: 0,
        maxUsage: 5,
        status: 'Active',
        generatedAt: Date.now() + i
      };
      batch.set(cardRef, cardItem);
      batchList.push(cardItem);
    }
    await batch.commit();
    return batchList;
  };

  // --- Admin Actions ---
  const postNews = async (newsData: Omit<SchoolNews, 'id' | 'publishedAt'>) => {
    const newDocRef = doc(collection(db, 'school_news'));
    const newsItem: SchoolNews = {
      ...newsData,
      id: newDocRef.id,
      publishedAt: Date.now()
    };
    await setDoc(newDocRef, newsItem);
    return newsItem;
  };

  const deleteNews = async (id: string) => {
    await deleteDoc(doc(db, 'school_news', id));
  };

  const addStaff = async (staffData: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDocRef = doc(collection(db, 'staff'));
    const newStaff: Staff = {
      ...staffData,
      id: newDocRef.id,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await setDoc(newDocRef, newStaff);

    if (staffData.isFormTeacher && staffData.formTeacherClassId) {
      await updateDoc(doc(db, 'classes', staffData.formTeacherClassId), {
        formTeacherId: newDocRef.id,
        formTeacherName: staffData.fullName
      });
    }
    return newStaff;
  };

  const updateStaff = async (id: string, updates: Partial<Staff>) => {
    await updateDoc(doc(db, 'staff', id), {
      ...updates,
      updatedAt: Date.now()
    });
    if (updates.isFormTeacher && updates.formTeacherClassId) {
      await updateDoc(doc(db, 'classes', updates.formTeacherClassId), {
        formTeacherId: id,
        formTeacherName: updates.fullName
      });
    }
  };

  const deleteStaff = async (id: string) => {
    await deleteDoc(doc(db, 'staff', id));
  };

  const addClass = async (classData: Omit<SchoolClass, 'id'>) => {
    const newDocRef = doc(collection(db, 'classes'));
    await setDoc(newDocRef, { ...classData, id: newDocRef.id });
  };

  const updateClass = async (id: string, updates: Partial<SchoolClass>) => {
    await updateDoc(doc(db, 'classes', id), updates);
  };

  const addSubject = async (subjectData: Omit<Subject, 'id'>) => {
    const newDocRef = doc(collection(db, 'subjects'));
    await setDoc(newDocRef, { ...subjectData, id: newDocRef.id });
  };

  const assignAllSubjectsToAllClasses = async () => {
    const allSubjectIds = subjects.map((s) => s.id);
    const batch = writeBatch(db);

    for (const cls of classes) {
      const classRef = doc(db, 'classes', cls.id);
      batch.update(classRef, {
        assignedSubjectIds: allSubjectIds
      });
    }

    const allClassNames = classes.map((c) => c.name);
    for (const sub of subjects) {
      const subRef = doc(db, 'subjects', sub.id);
      batch.update(subRef, {
        classesOffered: allClassNames
      });
    }

    await batch.commit();
  };

  const assignSubjectToTeacher = async (
    teacherId: string,
    subjectId: string,
    classId: string,
    periods: number = 4
  ) => {
    const teacher = staff.find((s) => s.id === teacherId);
    const subject = subjects.find((s) => s.id === subjectId);
    const schoolClass = classes.find((c) => c.id === classId);

    if (!teacher || !subject || !schoolClass) return;

    const newDocRef = doc(collection(db, 'assignments'));
    const assignment: TeachingAssignment = {
      id: newDocRef.id,
      teacherId,
      teacherName: teacher.fullName,
      subjectId,
      subjectName: subject.name,
      classId,
      className: schoolClass.name,
      periodsPerWeek: periods
    };
    await setDoc(newDocRef, assignment);

    const currentSubjects = teacher.subjects || [];
    const currentClasses = teacher.assignedClasses || [];
    if (!currentSubjects.includes(subject.name)) currentSubjects.push(subject.name);
    if (!currentClasses.includes(schoolClass.name)) currentClasses.push(schoolClass.name);

    await updateDoc(doc(db, 'staff', teacherId), {
      subjects: currentSubjects,
      assignedClasses: currentClasses
    });
  };

  const deleteAssignment = async (id: string) => {
    await deleteDoc(doc(db, 'assignments', id));
  };

  const updateSettings = async (newSettings: Partial<SchoolSettings>) => {
    await setDoc(doc(db, 'settings', 'global_config'), newSettings, { merge: true });
  };

  const updateNotice = async (updates: Partial<Notice>) => {
    await setDoc(doc(db, 'notices', 'current-advisory'), updates, { merge: true });
  };

  // --- Teacher Actions ---
  const enrollStudent = async (studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDocRef = doc(collection(db, 'students'));
    const student: Student = {
      ...studentData,
      id: newDocRef.id,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await setDoc(newDocRef, student);
    return student;
  };

  const deenrollStudent = async (studentId: string) => {
    await deleteDoc(doc(db, 'students', studentId));
  };

  const saveStudentScore = async (
    studentId: string,
    subjectId: string,
    subjectName: string,
    ca1Input: number,
    ca2Input: number,
    ca3Input: number,
    examInput: number,
    teacherId: string,
    teacherName: string
  ) => {
    const ca1 = Math.min(10, Math.max(0, Number(ca1Input) || 0));
    const ca2 = Math.min(10, Math.max(0, Number(ca2Input) || 0));
    const ca3 = Math.min(10, Math.max(0, Number(ca3Input) || 0));
    const exam = Math.min(70, Math.max(0, Number(examInput) || 0));
    const total = Math.min(100, ca1 + ca2 + ca3 + exam);

    let grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' = 'F';
    let remark = 'Needs Improvement';
    if (total >= 75) {
      grade = 'A';
      remark = 'Excellent';
    } else if (total >= 65) {
      grade = 'B';
      remark = 'Very Good';
    } else if (total >= 50) {
      grade = 'C';
      remark = 'Good Credit';
    } else if (total >= 45) {
      grade = 'D';
      remark = 'Pass';
    } else if (total >= 40) {
      grade = 'E';
      remark = 'Fair';
    }

    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const existingResult = results.find((r) => r.studentId === studentId);
    const scoreItem: SubjectScore = {
      subjectId,
      subjectName,
      ca1,
      ca2,
      ca3,
      exam,
      total,
      grade,
      remark,
      teacherId,
      teacherName,
      updatedAt: Date.now()
    };

    if (existingResult) {
      const otherSubjects = existingResult.subjects.filter((s) => s.subjectId !== subjectId);
      const updatedSubjects = [...otherSubjects, scoreItem];
      const totalScore = updatedSubjects.reduce((acc, s) => acc + s.total, 0);
      const averageScore = Math.round((totalScore / updatedSubjects.length) * 10) / 10;

      await updateDoc(doc(db, 'results', existingResult.id), {
        subjects: updatedSubjects,
        totalScore,
        averageScore,
        updatedAt: Date.now()
      });
    } else {
      const newDocRef = doc(collection(db, 'results'));
      const newResult: ExamResult = {
        id: newDocRef.id,
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        admissionNo: student.admissionNo,
        classId: student.classId,
        className: student.className,
        term: student.term || 'First Term',
        session: student.session || '2025/2026',
        subjects: [scoreItem],
        totalScore: total,
        averageScore: total,
        teacherRemark: 'Progressing steadily with active class participation.',
        principalRemark: 'Approved terminal continuous assessment.',
        status: 'Published',
        updatedAt: Date.now()
      };
      await setDoc(newDocRef, newResult);
    }
  };

  // --- Student Actions ---
  const activateScratchCardForStudent = async (studentAdmissionNo: string, rawPin: string) => {
    const formattedPin = rawPin.trim();
    const card = scratchCards.find(
      (c) => c.pin.replace(/-/g, '') === formattedPin.replace(/-/g, '')
    );
    if (!card) {
      throw new Error('Invalid Scratch Card PIN. Please check the 12-digit number.');
    }
    if (card.status === 'Expired') {
      throw new Error('This Scratch Card PIN has expired.');
    }
    if (card.usageCount >= card.maxUsage) {
      throw new Error('This Scratch Card has reached its maximum allowable uses (5).');
    }

    const student = students.find(
      (s) => s.admissionNo.toLowerCase() === studentAdmissionNo.toLowerCase()
    );
    if (!student) {
      throw new Error(`Student with admission number "${studentAdmissionNo}" was not found.`);
    }

    const newUsage = card.usageCount + 1;
    await updateDoc(doc(db, 'scratch_cards', card.id), {
      usageCount: newUsage,
      status: newUsage >= card.maxUsage ? 'Used' : 'Active',
      usedByStudentId: student.id,
      usedByStudentName: `${student.firstName} ${student.lastName}`,
      usedByAdmissionNo: student.admissionNo
    });

    await updateDoc(doc(db, 'students', student.id), {
      hasActivatedScratchCard: true,
      activatedScratchCardPin: card.pin
    });

    return true;
  };

  return {
    admins,
    students,
    staff,
    classes,
    subjects,
    assignments,
    scratchCards,
    results,
    notice,
    settings,
    news,
    customization,
    loading,
    syncStatus,
    lastSyncTime,
    // Super Admin
    addAdmin,
    removeAdmin,
    generateBatchScratchCards,
    updateWebsiteCustomization,
    // Admin
    postNews,
    deleteNews,
    addStaff,
    updateStaff,
    deleteStaff,
    addClass,
    updateClass,
    addSubject,
    assignAllSubjectsToAllClasses,
    assignSubjectToTeacher,
    deleteAssignment,
    updateSettings,
    updateNotice,
    // Teacher
    enrollStudent,
    deenrollStudent,
    saveStudentScore,
    // Student
    activateScratchCardForStudent
  };
}
