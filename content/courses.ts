// The four CodeBloom courses. Pages read this file; they contain no course text
// of their own. Adding a language means adding one entry here (SPEC.md NFR-3).
//
// No lessons are published yet, so every course has status "planned" and its
// topics are a provisional plan (SPEC.md FR-C2). When the first lessons exist,
// Milestone 2 adds another status and the lesson list.

export type CourseStatus = "planned";

export type Course = {
  /** Used in the address: /courses/<slug> */
  slug: string;
  /** Language name as learners write it */
  name: string;
  /** One sentence for the course card */
  summary: string;
  /** A short paragraph for the course page */
  description: string;
  status: CourseStatus;
  /** Planned and subject to change. Shown as plain text, never as links. */
  plannedTopics: string[];
};

export const courses: Course[] = [
  {
    slug: "c",
    name: "C",
    summary: "Close to the hardware. You see exactly how variables, memory and loops work.",
    description:
      "C is a small language that keeps you close to how the computer works. It is a good place to see what variables, memory and loops really do, and many later languages borrow its syntax.",
    status: "planned",
    plannedTopics: [
      "Your first program and what compiling means",
      "Variables and data types",
      "Printing and reading values with printf and scanf",
      "Operators and expressions",
      "Making decisions with if and switch",
      "Loops: while, for and do while",
      "Functions",
      "Arrays",
      "Strings",
      "Pointers",
      "Structures",
    ],
  },
  {
    slug: "cpp",
    name: "C++",
    summary: "Builds on C with classes and the standard library, for organizing bigger programs.",
    description:
      "C++ builds on C. It adds classes, references and a large standard library, which help you organize bigger programs.",
    status: "planned",
    plannedTopics: [
      "Your first C++ program",
      "Variables and data types",
      "Input and output with cin and cout",
      "Decisions and loops",
      "Functions and references",
      "Arrays and std::vector",
      "Text with std::string",
      "Classes and objects",
      "Constructors and destructors",
      "Pointers and dynamic memory",
    ],
  },
  {
    slug: "java",
    name: "Java",
    summary: "Every program lives inside a class, so object-oriented ideas appear from the first lesson.",
    description:
      "In Java, every program lives inside a class. That makes object-oriented ideas, such as classes and objects, part of your very first program.",
    status: "planned",
    plannedTopics: [
      "Your first program: classes and main",
      "Variables and data types",
      "Reading input with Scanner and printing output",
      "Decisions and loops",
      "Methods",
      "Arrays",
      "Strings",
      "Classes and objects",
      "Inheritance",
      "Exceptions",
    ],
  },
  {
    slug: "python",
    name: "Python",
    summary: "Short, readable syntax that lets you focus on the idea before the details.",
    description:
      "Python has short, readable syntax, so you can focus on what a program does without declaring types or ending lines with semicolons.",
    status: "planned",
    plannedTopics: [
      "Your first Python program",
      "Variables and data types",
      "Input and output",
      "Decisions with if, elif and else",
      "Loops: while and for",
      "Functions",
      "Lists",
      "Strings",
      "Dictionaries",
      "Reading and writing files",
    ],
  },
];

export function findCourse(slug: string): Course | undefined {
  return courses.find((course) => course.slug === slug);
}
