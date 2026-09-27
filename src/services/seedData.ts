import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  query,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  SchoolClass,
  Subject,
  Staff,
  Student,
  TeachingAssignment,
  ScratchCard,
  ExamResult,
  Notice,
  AdminAccount,
  SchoolSettings,
  SchoolNews,
  WebsiteCustomization
} from '../types/school';

const DEFAULT_ADMINS: AdminAccount[] = [
  {
    id: 'admin-super-2',
    username: 'SuperAdmin2',
    fullName: 'Executive Super Admin',
    email: 'superadmin2@gstcgarki.edu.ng',
    password: '0000',
    role: 'super_admin',
    isPrincipalSuperAdmin: false,
    assignedOffice: 'Executive Portal Administration',
    createdAt: Date.now() - 12000000
  },
  {
    id: 'admin-01',
    username: 'admin_usman',
    fullName: 'Alh. Usman Mohammed',
    email: 'admin.usman@gstcgarki.edu.ng',
    password: 'GarkiAdmin#2026',
    role: 'admin',
    assignedOffice: 'Academic Affairs & Records',
    createdAt: Date.now() - 10000000
  },
  {
    id: 'admin-02',
    username: 'admin_fatima',
    fullName: 'Hajiya Fatima Garba',
    email: 'fatima.garba@gstcgarki.edu.ng',
    password: 'SecureSchoolPass24',
    role: 'admin',
    assignedOffice: 'Examination & Admissions',
    createdAt: Date.now() - 8000000
  }
];

const DEFAULT_CLASSES: SchoolClass[] = [
  {
    id: 'class-ccs1',
    name: 'CCS 1',
    arm: 'Tech',
    level: 'CCS 1',
    formTeacherName: 'Engr. Danjuma Bello',
    formTeacherId: 'stf-001',
    assignedSubjectIds: ['sub-comp', 'sub-math', 'sub-eng', 'sub-td']
  },
  {
    id: 'class-garment1',
    name: 'Garment 1',
    arm: 'Vocational',
    level: 'Garment',
    formTeacherName: 'Mrs. Fatima Aliyu',
    formTeacherId: 'stf-002',
    assignedSubjectIds: ['sub-garment', 'sub-math', 'sub-eng']
  },
];

const DEFAULT_SUBJECTS: Subject[] = [
  { id: 'sub-comp', code: 'CST101', name: 'Computer Craft Studies', category: 'Technical / Vocational', classesOffered: ['CCS 1'] },
  { id: 'sub-garment', code: 'GMC102', name: 'Garment Making & Design', category: 'Technical / Vocational', classesOffered: ['Garment 1'] },
  { id: 'sub-math', code: 'MTH101', name: 'General Mathematics', category: 'Core', classesOffered: ['CCS 1', 'Garment 1'] },
  { id: 'sub-eng', code: 'ENG101', name: 'English Language', category: 'Core', classesOffered: ['CCS 1', 'Garment 1'] },
  { id: 'sub-td', code: 'TDR101', name: 'Technical Drawing', category: 'Technical / Vocational', classesOffered: ['CCS 1'] },
];

const DEFAULT_STAFF: Staff[] = [
  {
    id: 'stf-001',
    staffId: 'GSTC/STF/001',
    password: '0000',
    fullName: 'Engr. Danjuma Bello',
    email: 'danjuma.bello@gstcgarki.edu.ng',
    phone: '+234 803 123 4567',
    role: 'Teacher',
    assignedClasses: ['CCS 1'],
    subjects: ['Computer Craft Studies', 'Technical Drawing'],
    isFormTeacher: true,
    formTeacherClassId: 'class-ccs1',
    formTeacherClassName: 'CCS 1',
    status: 'Active',
    createdAt: Date.now() - 10000000,
    updatedAt: Date.now()
  },
  {
    id: 'stf-002',
    staffId: 'GSTC/STF/002',
    password: '0000',
    fullName: 'Mrs. Fatima Aliyu',
    email: 'fatima.aliyu@gstcgarki.edu.ng',
    phone: '+234 802 234 5678',
    role: 'Teacher',
    assignedClasses: ['Garment 1'],
    subjects: ['Garment Making & Design'],
    isFormTeacher: true,
    formTeacherClassId: 'class-garment1',
    formTeacherClassName: 'Garment 1',
    status: 'Active',
    createdAt: Date.now() - 9000000,
    updatedAt: Date.now()
  }
];

const DEFAULT_STUDENTS: Student[] = [
  {
    id: 'std-001',
    admissionNo: 'GSTC/2025/001',
    password: '0000',
    firstName: 'Ibrahim',
    lastName: 'Musa',
    gender: 'Male',
    classId: 'class-ccs1',
    className: 'CCS 1',
    term: 'First Term',
    session: '2025/2026',
    guardianName: 'Mallam Musa Garba',
    guardianPhone: '+234 802 987 6543',
    status: 'Active',
    hasActivatedScratchCard: true,
    activatedScratchCardPin: '8392-4910-5821',
    createdAt: Date.now() - 5000000,
    updatedAt: Date.now()
  },
  {
    id: 'std-002',
    admissionNo: 'GSTC/2025/002',
    password: '0000',
    firstName: 'Amina',
    lastName: 'Suleiman',
    gender: 'Female',
    classId: 'class-garment1',
    className: 'Garment 1',
    term: 'First Term',
    session: '2025/2026',
    guardianName: 'Alh. Suleiman Waziri',
    guardianPhone: '+234 803 765 4321',
    status: 'Active',
    hasActivatedScratchCard: false,
    createdAt: Date.now() - 4000000,
    updatedAt: Date.now()
  }
];

const DEFAULT_ASSIGNMENTS: TeachingAssignment[] = [
  {
    id: 'asg-001',
    teacherId: 'stf-001',
    teacherName: 'Engr. Danjuma Bello',
    subjectId: 'sub-comp',
    subjectName: 'Computer Craft Studies',
    classId: 'class-ccs1',
    className: 'CCS 1',
    periodsPerWeek: 4
  }
];

const DEFAULT_CARDS: ScratchCard[] = [
  {
    id: 'card-001',
    pin: '8392-4910-5821',
    serialNumber: 'GSTC-SCR-829101',
    usageCount: 1,
    maxUsage: 5,
    status: 'Active',
    generatedAt: Date.now() - 200000,
    usedByStudentId: 'std-001',
    usedByStudentName: 'Ibrahim Musa',
    usedByAdmissionNo: 'GSTC/2025/001'
  },
  {
    id: 'card-002',
    pin: '1092-3847-9201',
    serialNumber: 'GSTC-SCR-829102',
    usageCount: 0,
    maxUsage: 5,
    status: 'Active',
    generatedAt: Date.now() - 100000
  },
  {
    id: 'card-003',
    pin: '5542-8819-3012',
    serialNumber: 'GSTC-SCR-829103',
    usageCount: 0,
    maxUsage: 5,
    status: 'Active',
    generatedAt: Date.now() - 50000
  }
];

const DEFAULT_RESULTS: ExamResult[] = [
  {
    id: 'res-001',
    studentId: 'std-001',
    studentName: 'Ibrahim Musa',
    admissionNo: 'GSTC/2025/001',
    classId: 'class-ccs1',
    className: 'CCS 1',
    term: 'First Term',
    session: '2025/2026',
    subjects: [
      { subjectId: 'sub-comp', subjectName: 'Computer Craft Studies', ca1: 9, ca2: 8, ca3: 9, exam: 58, total: 84, grade: 'A', remark: 'Excellent' },
      { subjectId: 'sub-math', subjectName: 'General Mathematics', ca1: 8, ca2: 9, ca3: 8, exam: 52, total: 77, grade: 'A', remark: 'Very Good' },
      { subjectId: 'sub-eng', subjectName: 'English Language', ca1: 7, ca2: 8, ca3: 7, exam: 48, total: 70, grade: 'B', remark: 'Good' },
      { subjectId: 'sub-td', subjectName: 'Technical Drawing', ca1: 9, ca2: 9, ca3: 10, exam: 60, total: 88, grade: 'A', remark: 'Distinction' }
    ],
    totalScore: 319,
    averageScore: 79.8,
    position: '1st of 28',
    teacherRemark: 'Outstanding technical diligence. Remarkable performance in all practical subjects.',
    principalRemark: 'Exemplary scholar. Maintain this discipline.',
    status: 'Published',
    updatedAt: Date.now()
  }
];

const DEFAULT_SETTINGS: SchoolSettings = {
  schoolName: 'Govt. Science & Tech. College, Garki',
  motto: 'Knowledge, Skill, and Self Reliance',
  address: 'Area 3 Garki, Abuja FCT, Nigeria',
  session: '2025/2026',
  term: 'First Term',
  ca1Max: 10,
  ca2Max: 10,
  ca3Max: 10,
  examMax: 70,
  gradingSystem: {
    A: 75,
    B: 65,
    C: 50,
    D: 45,
    E: 40,
    F: 0
  }
};

const DEFAULT_CUSTOMIZATION: WebsiteCustomization = {
  heroTagline: 'Empowering Future Innovators & Technical Leaders',
  heroAnnouncement: 'Admissions for 2026/2027 Academic Session are now open for Science, Craft, and 9 Accredited Vocational Trades.',
  principalWelcomeMessage: 'Welcome to Government Science & Technical College Garki, Area 3 Abuja. Together with our wonderful team of high-performing administrative and academic staff, we are committed to fostering practical excellence, technological innovation, and self-reliance across all 9 NABTEB-accredited trades.',
  schoolContactEmail: 'info@gstcgarki.edu.ng',
  schoolPhone: '+234 9 291 0000',
  schoolAddress: 'Area 3 Garki, Abuja Federal Capital Territory, Nigeria',
  bannerNoticeText: 'Academic Session 2025/2026 First Term continuous assessment marks submission deadline is approaching.',
  bannerNoticeActive: true,
  primaryAccentColor: '#0b4d2c',
  updatedAt: Date.now(),
  updatedBy: 'Dr. James Musa Kuta (Principal Super Admin)'
};

const DEFAULT_NEWS: SchoolNews[] = [
  {
    id: 'news-01',
    title: 'GSTC Robotics & Computer Craft Team Wins FCT Innovation Showcase',
    summary: 'Our outstanding Robotics Club and Computer Craft Studies department demonstrated automated solar controllers developed entirely in our technical workshops.',
    content: 'Students of the Robotics Club, Computer Craft Studies, and Electrical Maintenance arms represented GSTC Garki (Area 3, Abuja) at the annual FCT Science Fair, securing top honours for automated renewable energy circuits under the result-oriented leadership of Principal Dr. James Musa Kuta.',
    category: 'Technical Workshop',
    authorName: 'Alh. Usman Mohammed',
    authorRole: 'Admin (Academic Records)',
    publishedAt: Date.now() - 86400000 * 2,
    pinned: true
  },
  {
    id: 'news-02',
    title: 'Commencement of First Term 2025/2026 Continuous Assessments',
    summary: 'All students are reminded that First, Second, and Third CA assessments are actively ongoing.',
    content: 'Teachers are entering CA scores directly on the live school portal. Scratch cards for terminal result verification will be distributed through designated school offices.',
    category: 'Examination',
    authorName: 'Hajiya Fatima Garba',
    authorRole: 'Admin (Examination)',
    publishedAt: Date.now() - 86400000 * 5,
    pinned: false
  }
];

export async function seedInitialSchoolDataIfNeeded(): Promise<void> {
  try {
    const metaDocRef = doc(db, 'system_meta', 'init_seed_v6');
    const metaSnap = await getDoc(metaDocRef);
    if (metaSnap.exists()) {
      return;
    }

    // Ensure Second Super Admin exists in 'admins' collection
    const secondSuperAdminDoc = await getDoc(doc(db, 'admins', 'admin-super-2'));
    if (!secondSuperAdminDoc.exists()) {
      await setDoc(doc(db, 'admins', 'admin-super-2'), DEFAULT_ADMINS[0]);
    }

    // Admins
    const adminsSnap = await getDocs(query(collection(db, 'admins'), limit(1)));
    if (adminsSnap.empty) {
      for (const adm of DEFAULT_ADMINS) {
        await setDoc(doc(db, 'admins', adm.id), adm);
      }
    }

    // Classes
    const classesSnap = await getDocs(query(collection(db, 'classes'), limit(1)));
    if (classesSnap.empty) {
      for (const item of DEFAULT_CLASSES) {
        await setDoc(doc(db, 'classes', item.id), item);
      }
    }

    // Subjects
    const subjectsSnap = await getDocs(query(collection(db, 'subjects'), limit(1)));
    if (subjectsSnap.empty) {
      for (const item of DEFAULT_SUBJECTS) {
        await setDoc(doc(db, 'subjects', item.id), item);
      }
    }

    // Staff
    const staffSnap = await getDocs(query(collection(db, 'staff'), limit(1)));
    if (staffSnap.empty) {
      for (const item of DEFAULT_STAFF) {
        await setDoc(doc(db, 'staff', item.id), item);
      }
    }

    // Students
    const studentsSnap = await getDocs(query(collection(db, 'students'), limit(1)));
    if (studentsSnap.empty) {
      for (const item of DEFAULT_STUDENTS) {
        await setDoc(doc(db, 'students', item.id), item);
      }
    }

    // Assignments
    const assignmentsSnap = await getDocs(query(collection(db, 'assignments'), limit(1)));
    if (assignmentsSnap.empty) {
      for (const item of DEFAULT_ASSIGNMENTS) {
        await setDoc(doc(db, 'assignments', item.id), item);
      }
    }

    // Scratch cards
    const cardsSnap = await getDocs(query(collection(db, 'scratch_cards'), limit(1)));
    if (cardsSnap.empty) {
      for (const card of DEFAULT_CARDS) {
        await setDoc(doc(db, 'scratch_cards', card.id), card);
      }
    }

    // Results
    const resultsSnap = await getDocs(query(collection(db, 'results'), limit(1)));
    if (resultsSnap.empty) {
      for (const res of DEFAULT_RESULTS) {
        await setDoc(doc(db, 'results', res.id), res);
      }
    }

    // System Auth - Principal Super Admin & Second Super Admin
    const superAdminRef = doc(db, 'system_auth', 'super_admin');
    const superAdminSnap = await getDoc(superAdminRef);
    if (!superAdminSnap.exists()) {
      await setDoc(superAdminRef, {
        username: 'Admin',
        password: '0000',
        role: 'super_admin',
        fullName: 'Principal Super Admin',
        email: 'admin@gstcgarki.edu.ng',
        updatedAt: Date.now()
      });
    }

    const secondSuperRef = doc(db, 'system_auth', 'second_super_admin');
    const secondSuperSnap = await getDoc(secondSuperRef);
    if (!secondSuperSnap.exists()) {
      await setDoc(secondSuperRef, {
        username: 'SuperAdmin2',
        password: '0000',
        role: 'super_admin',
        fullName: 'Executive Super Admin',
        email: 'superadmin2@gstcgarki.edu.ng',
        updatedAt: Date.now()
      });
    }

    // Website Customization doc
    await setDoc(doc(db, 'website_customization', 'main'), DEFAULT_CUSTOMIZATION, { merge: true });

    // News
    const newsSnap = await getDocs(query(collection(db, 'school_news'), limit(1)));
    if (newsSnap.empty) {
      for (const post of DEFAULT_NEWS) {
        await setDoc(doc(db, 'school_news', post.id), post);
      }
    }

    // Settings
    await setDoc(doc(db, 'settings', 'global_config'), DEFAULT_SETTINGS, { merge: true });

    await setDoc(metaDocRef, {
      seededAt: serverTimestamp(),
      initialized: true
    });
  } catch (err) {
    console.warn('Initial seeding notice (non-fatal):', err);
  }
}
