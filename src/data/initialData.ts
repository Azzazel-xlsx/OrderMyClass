import { Course, Student, CourseAttendanceDay, TeacherProfile, AttendanceStatus } from '../types';

export const initialTeacher: TeacherProfile = {
  name: 'Carlos Mendoza',
  title: 'Profesor de Inglés',
  school: 'International Language Academy',
  email: 'carlos.mendoza@school.edu',
};

export const initialCourses: Course[] = [
  {
    id: 'course-a1',
    name: 'English A1',
    level: 'Nivel A1',
    color: 'blue',
    gradeScale: '10',
    skillWeights: {
      listening: 30,
      reading: 35,
      speaking: 35,
    },
    subGradeConfigs: {
      listening: [
        { id: 'sub-l1', name: 'Nota 1', weightPercent: 50 },
        { id: 'sub-l2', name: 'Nota 2', weightPercent: 50 },
      ],
      reading: [
        { id: 'sub-r1', name: 'Reading 1', weightPercent: 40 },
        { id: 'sub-r2', name: 'Reading 2', weightPercent: 30 },
        { id: 'sub-r3', name: 'Reading 3', weightPercent: 30 },
      ],
      speaking: [
        { id: 'sub-s1', name: 'Speaking 1', weightPercent: 40 },
        { id: 'sub-s2', name: 'Speaking 2', weightPercent: 30 },
        { id: 'sub-s3', name: 'Speaking 3', weightPercent: 30 },
      ],
    },
    schedule: [
      { id: 'sch-1', courseId: 'course-a1', dayOfWeek: 1, startTime: '08:00', endTime: '09:00', classroom: 'Aula 101' },
      { id: 'sch-2', courseId: 'course-a1', dayOfWeek: 2, startTime: '10:00', endTime: '11:00', classroom: 'Aula 101' },
      { id: 'sch-3', courseId: 'course-a1', dayOfWeek: 4, startTime: '10:00', endTime: '11:00', classroom: 'Lab 2' },
    ],
    createdAt: '2026-09-01T08:00:00.000Z',
  },
  {
    id: 'course-a2',
    name: 'English A2',
    level: 'Nivel A2',
    color: 'green',
    gradeScale: '10',
    skillWeights: {
      listening: 30,
      reading: 40,
      speaking: 30,
    },
    subGradeConfigs: {
      listening: [
        { id: 'sub-a2-l1', name: 'Listening Quiz 1', weightPercent: 50 },
        { id: 'sub-a2-l2', name: 'Listening Final', weightPercent: 50 },
      ],
      reading: [
        { id: 'sub-a2-r1', name: 'Short Story', weightPercent: 50 },
        { id: 'sub-a2-r2', name: 'Grammar & Text', weightPercent: 50 },
      ],
      speaking: [
        { id: 'sub-a2-s1', name: 'Oral Presentation', weightPercent: 60 },
        { id: 'sub-a2-s2', name: 'Dialogue Pairs', weightPercent: 40 },
      ],
    },
    schedule: [
      { id: 'sch-4', courseId: 'course-a2', dayOfWeek: 1, startTime: '10:00', endTime: '11:00', classroom: 'Aula 202' },
      { id: 'sch-5', courseId: 'course-a2', dayOfWeek: 2, startTime: '10:00', endTime: '11:00', classroom: 'Aula 202' },
      { id: 'sch-6', courseId: 'course-a2', dayOfWeek: 4, startTime: '08:00', endTime: '09:00', classroom: 'Aula 202' },
    ],
    createdAt: '2026-09-02T08:00:00.000Z',
  },
  {
    id: 'course-b1',
    name: 'English B1',
    level: 'Nivel B1',
    color: 'orange',
    gradeScale: '10',
    skillWeights: {
      listening: 30,
      reading: 35,
      speaking: 35,
    },
    subGradeConfigs: {
      listening: [
        { id: 'sub-b1-l1', name: 'Podcast Review', weightPercent: 50 },
        { id: 'sub-b1-l2', name: 'Exam Test', weightPercent: 50 },
      ],
      reading: [
        { id: 'sub-b1-r1', name: 'Essay Analysis', weightPercent: 50 },
        { id: 'sub-b1-r2', name: 'Vocabulary Quiz', weightPercent: 50 },
      ],
      speaking: [
        { id: 'sub-b1-s1', name: 'Debate Session', weightPercent: 50 },
        { id: 'sub-b1-s2', name: 'Individual Pitch', weightPercent: 50 },
      ],
    },
    schedule: [
      { id: 'sch-7', courseId: 'course-b1', dayOfWeek: 2, startTime: '07:00', endTime: '08:00', classroom: 'Aula 305' },
      { id: 'sch-8', courseId: 'course-b1', dayOfWeek: 3, startTime: '07:00', endTime: '08:00', classroom: 'Aula 305' },
      { id: 'sch-9', courseId: 'course-b1', dayOfWeek: 5, startTime: '07:00', endTime: '08:00', classroom: 'Aula 305' },
    ],
    createdAt: '2026-09-03T08:00:00.000Z',
  },
  {
    id: 'course-spk',
    name: 'Speaking Club',
    level: 'Intermedio - Avanzado',
    color: 'purple',
    gradeScale: '10',
    skillWeights: {
      listening: 20,
      reading: 10,
      speaking: 70,
    },
    subGradeConfigs: {
      listening: [
        { id: 'sub-sc-l1', name: 'Active Listening', weightPercent: 100 },
      ],
      reading: [
        { id: 'sub-sc-r1', name: 'Article Prep', weightPercent: 100 },
      ],
      speaking: [
        { id: 'sub-sc-s1', name: 'Fluency & Flow', weightPercent: 40 },
        { id: 'sub-sc-s2', name: 'Pronunciation', weightPercent: 30 },
        { id: 'sub-sc-s3', name: 'Spontaneity', weightPercent: 30 },
      ],
    },
    schedule: [
      { id: 'sch-10', courseId: 'course-spk', dayOfWeek: 3, startTime: '09:00', endTime: '10:00', classroom: 'Auditorio' },
      { id: 'sch-11', courseId: 'course-spk', dayOfWeek: 4, startTime: '09:00', endTime: '10:00', classroom: 'Auditorio' },
    ],
    createdAt: '2026-09-04T08:00:00.000Z',
  },
];

// Helper to seed students for English A1 exactly matching the screenshot
const sampleDates = [
  '2026-09-02', '2026-09-07', '2026-09-09', '2026-09-14',
  '2026-09-16', '2026-09-21', '2026-09-23', '2026-09-28',
  '2026-09-29', '2026-09-30'
];

export const initialStudents: Student[] = [
  // English A1 students
  {
    id: 'stu-a1-1',
    courseId: 'course-a1',
    name: 'Pedro Andrés',
    email: 'pedro.andres@student.edu',
    grades: {
      listening: { 'sub-l1': 8.0, 'sub-l2': 9.0 },
      reading: { 'sub-r1': 8.5, 'sub-r2': 8.0, 'sub-r3': 7.5 },
      speaking: { 'sub-s1': 9.0, 'sub-s2': 9.0, 'sub-s3': 9.0 },
    },
    attendance: {
      '2026-09-28': 'present',
      '2026-09-29': 'present',
      '2026-09-30': 'present',
    },
  },
  {
    id: 'stu-a1-2',
    courseId: 'course-a1',
    name: 'María José',
    email: 'maria.jose@student.edu',
    grades: {
      listening: { 'sub-l1': 7.5, 'sub-l2': 7.5 },
      reading: { 'sub-r1': 8.5, 'sub-r2': 8.5, 'sub-r3': 8.5 },
      speaking: { 'sub-s1': 8.0, 'sub-s2': 8.0, 'sub-s3': 8.0 },
    },
    attendance: {
      '2026-09-28': 'present',
      '2026-09-29': 'present',
      '2026-09-30': 'present',
    },
  },
  {
    id: 'stu-a1-3',
    courseId: 'course-a1',
    name: 'Juan David',
    email: 'juan.david@student.edu',
    grades: {
      listening: { 'sub-l1': 9.0, 'sub-l2': 9.0 },
      reading: { 'sub-r1': 8.0, 'sub-r2': 8.0, 'sub-r3': 8.0 },
      speaking: { 'sub-s1': 8.5, 'sub-s2': 8.5, 'sub-s3': 8.5 },
    },
    attendance: {
      '2026-09-28': 'present',
      '2026-09-29': 'present',
      '2026-09-30': 'present',
    },
  },
  {
    id: 'stu-a1-4',
    courseId: 'course-a1',
    name: 'Laura',
    email: 'laura.gomez@student.edu',
    grades: {
      listening: { 'sub-l1': 8.0, 'sub-l2': 8.0 },
      reading: { 'sub-r1': 7.5, 'sub-r2': 7.5, 'sub-r3': 7.5 },
      speaking: { 'sub-s1': 8.0, 'sub-s2': 8.0, 'sub-s3': 8.0 },
    },
    attendance: {
      '2026-09-28': 'present',
      '2026-09-29': 'present',
      '2026-09-30': 'absent',
    },
  },
  {
    id: 'stu-a1-5',
    courseId: 'course-a1',
    name: 'Carlos',
    email: 'carlos.ruiz@student.edu',
    grades: {
      listening: { 'sub-l1': 6.5, 'sub-l2': 6.5 },
      reading: { 'sub-r1': 7.0, 'sub-r2': 7.0, 'sub-r3': 7.0 },
      speaking: { 'sub-s1': 7.5, 'sub-s2': 7.5, 'sub-s3': 7.5 },
    },
    attendance: {
      '2026-09-28': 'present',
      '2026-09-29': 'present',
      '2026-09-30': 'present',
    },
  },
  {
    id: 'stu-a1-6',
    courseId: 'course-a1',
    name: 'Daniela',
    email: 'daniela.mora@student.edu',
    grades: {
      listening: { 'sub-l1': 9.5, 'sub-l2': 9.5 },
      reading: { 'sub-r1': 9.0, 'sub-r2': 9.0, 'sub-r3': 9.0 },
      speaking: { 'sub-s1': 9.5, 'sub-s2': 9.5, 'sub-s3': 9.5 },
    },
    attendance: {
      '2026-09-28': 'present',
      '2026-09-29': 'present',
      '2026-09-30': 'present',
    },
  },
  // Additional students for English A1 to complete the 24 students
  ...[
    'Alejandro Torres', 'Beatriz Silva', 'Camilo Vargas', 'Diana Ortiz',
    'Esteban Morales', 'Fernanda Castillo', 'Gabriel Herrera', 'Helena Rojas',
    'Ignacio Paredes', 'Jimena Cruz', 'Kevin Duarte', 'Lucía Peña',
    'Manuel Ríos', 'Natalia Cano', 'Óscar Gil', 'Paula Benítez',
    'Rodrigo Méndez', 'Sara Valencia'
  ].map((name, idx): Student => ({
    id: `stu-a1-${idx + 7}`,
    courseId: 'course-a1',
    name,
    email: `${name.toLowerCase().replace(/\s+/g, '.')}@student.edu`,
    grades: {
      listening: { 'sub-l1': 7.0 + ((idx * 3) % 30) / 10, 'sub-l2': 7.5 + ((idx * 2) % 25) / 10 },
      reading: { 'sub-r1': 7.0 + ((idx * 4) % 30) / 10, 'sub-r2': 8.0, 'sub-r3': 7.8 },
      speaking: { 'sub-s1': 8.0, 'sub-s2': 7.5 + ((idx * 5) % 25) / 10, 'sub-s3': 8.2 },
    },
    attendance: {
      '2026-09-28': idx % 7 === 0 ? 'absent' : 'present',
      '2026-09-29': 'present',
      '2026-09-30': idx === 3 ? 'absent' : 'present',
    },
  })),

  // English A2 students (22 students)
  ...[
    'Andrés Felipe', 'Camila Restrepo', 'Daniel Quintero', 'Elena Beltrán',
    'Felipe Caicedo', 'Gabriela Soler', 'Hugo Cárdenas', 'Isabella Franco',
    'Joaquín Osorio', 'Karla Mendoza', 'Leonardo Paz', 'Manuela Gallego',
    'Nicolás Jaramillo', 'Olga Varela', 'Pablo Echeverry', 'Quirino Santos',
    'Renata Londoño', 'Samuel Botero', 'Tatiana Zuleta', 'Ulises Giraldo',
    'Valentina Marín', 'William Ospina'
  ].map((name, idx): Student => ({
    id: `stu-a2-${idx + 1}`,
    courseId: 'course-a2',
    name,
    email: `${name.toLowerCase().replace(/\s+/g, '.')}@student.edu`,
    grades: {
      listening: { 'sub-a2-l1': 8.0 + ((idx * 2) % 20) / 10, 'sub-a2-l2': 8.5 },
      reading: { 'sub-a2-r1': 8.2, 'sub-a2-r2': 8.7 },
      speaking: { 'sub-a2-s1': 8.5, 'sub-a2-s2': 8.8 },
    },
    attendance: {
      '2026-09-28': 'present',
      '2026-09-29': idx % 8 === 0 ? 'absent' : 'present',
      '2026-09-30': 'present',
    },
  })),

  // English B1 students (18 students)
  ...[
    'Adriana Pinto', 'Bernardo Soto', 'Carolina Naranjo', 'David Forero',
    'Emilia Hoyos', 'Federico Rincón', 'Gloria Meza', 'Héctor Salcedo',
    'Inés Tamara', 'Julio Arango', 'Karen Villalba', 'Lucas Barreto',
    'Mónica Hurtado', 'Néstor Carvajal', 'Patricia Moncada', 'Rafael Garzón',
    'Silvia Agudelo', 'Tomás Palacios'
  ].map((name, idx): Student => ({
    id: `stu-b1-${idx + 1}`,
    courseId: 'course-b1',
    name,
    email: `${name.toLowerCase().replace(/\s+/g, '.')}@student.edu`,
    grades: {
      listening: { 'sub-b1-l1': 8.5, 'sub-b1-l2': 8.8 },
      reading: { 'sub-b1-r1': 8.6, 'sub-b1-r2': 8.5 },
      speaking: { 'sub-b1-s1': 9.0, 'sub-b1-s2': 8.7 },
    },
    attendance: {
      '2026-09-28': idx % 5 === 0 ? 'absent' : 'present',
      '2026-09-29': 'present',
      '2026-09-30': 'present',
    },
  })),

  // Speaking Club students (15 students)
  ...[
    'Alberto Montero', 'Brenda Colmenares', 'César Villegas', 'Dora Pantoja',
    'Enrique Albarracín', 'Fabiola Corredor', 'Gonzalo Suescún', 'Hilda Maya',
    'Iván Peñuela', 'Julia Fonseca', 'Lina Baracaldo', 'Mauricio Buitrago',
    'Norma Salamanca', 'Orlando Flórez', 'Priscila Cuéllar'
  ].map((name, idx): Student => ({
    id: `stu-sc-${idx + 1}`,
    courseId: 'course-spk',
    name,
    email: `${name.toLowerCase().replace(/\s+/g, '.')}@student.edu`,
    grades: {
      listening: { 'sub-sc-l1': 8.8 },
      reading: { 'sub-sc-r1': 9.0 },
      speaking: { 'sub-sc-s1': 9.2, 'sub-sc-s2': 8.8, 'sub-sc-s3': 8.9 },
    },
    attendance: {
      '2026-09-28': 'present',
      '2026-09-29': 'present',
      '2026-09-30': 'present',
    },
  })),
];

export const initialAttendanceRecords: CourseAttendanceDay[] = [
  {
    id: 'att-2026-09-30-a1',
    courseId: 'course-a1',
    date: '2026-09-30',
    records: {
      'stu-a1-1': 'present',
      'stu-a1-2': 'present',
      'stu-a1-3': 'present',
      'stu-a1-4': 'absent',
      'stu-a1-5': 'present',
      'stu-a1-6': 'present',
    },
    savedAt: '2026-09-30T10:00:00.000Z',
  },
  {
    id: 'att-2026-09-29-a1',
    courseId: 'course-a1',
    date: '2026-09-29',
    records: {
      'stu-a1-1': 'present',
      'stu-a1-2': 'present',
      'stu-a1-3': 'present',
      'stu-a1-4': 'present',
      'stu-a1-5': 'present',
      'stu-a1-6': 'present',
    },
    savedAt: '2026-09-29T10:00:00.000Z',
  },
  {
    id: 'att-2026-09-28-a1',
    courseId: 'course-a1',
    date: '2026-09-28',
    records: {
      'stu-a1-1': 'present',
      'stu-a1-2': 'present',
      'stu-a1-3': 'present',
      'stu-a1-4': 'present',
      'stu-a1-5': 'present',
      'stu-a1-6': 'present',
    },
    savedAt: '2026-09-28T10:00:00.000Z',
  },
];
