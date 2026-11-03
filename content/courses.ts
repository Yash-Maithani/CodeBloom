// The four CodeBloom courses. Pages read this file; they contain no course text
// of their own. Adding a language means adding one entry here (SPEC.md NFR-3).
//
// Each course has one ordered list of topics. A topic with `lesson` points to a
// lesson in content/lessons/<course>/; once that lesson is published, the course
// page links to it. Every other topic is a plan, shown as plain text and marked
// as subject to change (SPEC.md FR-C2). Lesson order follows this list.

export type Topic = {
  title: string;
  /** Slug of the lesson that teaches this topic, if one has been written */
  lesson?: string;
};

export type Course = {
  /** Used in the address: /courses/<slug> */
  slug: string;
  /** Language name as learners write it */
  name: string;
  /** One sentence for the course card */
  summary: string;
  /** A short paragraph for the course page */
  description: string;
  /** In course order. Topics without a published lesson are shown as plain text, never as links. */
  topics: Topic[];
};

export const courses: Course[] = [
  {
    slug: "c",
    name: "C",
    summary: "Close to the hardware. You see exactly how variables, memory and loops work.",
    description:
      "C is a small language that keeps you close to how the computer works. It is a good place to see what variables, memory and loops really do, and many later languages borrow its syntax.",
    topics: [
      { title: "Your first program and what compiling means", lesson: "first-program" },
      { title: "Variables and data types", lesson: "variables" },
      { title: "Numbers and arithmetic", lesson: "numbers" },
      { title: "Printing and reading values with printf and scanf", lesson: "printf-scanf" },
      { title: "Making decisions with if and else", lesson: "decisions" },
      { title: "More decisions with else if and switch", lesson: "else-if" },
      { title: "Combining conditions with &&, || and !", lesson: "conditions" },
      { title: "Loops: while, for and do while", lesson: "loops" },
      { title: "Functions", lesson: "functions" },
      { title: "Arrays", lesson: "arrays" },
      { title: "Strings", lesson: "strings" },
      { title: "Pointers", lesson: "pointers" },
      { title: "Structures", lesson: "structures" },
    ],
  },
  {
    slug: "cpp",
    name: "C++",
    summary: "Builds on C with classes and the standard library, for organizing bigger programs.",
    description:
      "C++ builds on C. It adds classes, references and a large standard library, which help you organize bigger programs.",
    topics: [
      { title: "Your first C++ program" },
      { title: "Variables and data types" },
      { title: "Input and output with cin and cout" },
      { title: "Decisions and loops" },
      { title: "Functions and references" },
      { title: "Arrays and std::vector" },
      { title: "Text with std::string" },
      { title: "Classes and objects" },
      { title: "Constructors and destructors" },
      { title: "Pointers and dynamic memory" },
    ],
  },
  {
    slug: "java",
    name: "Java",
    summary: "Every program lives inside a class, so object-oriented ideas appear from the first lesson.",
    description:
      "In Java, every program lives inside a class. That makes object-oriented ideas, such as classes and objects, part of your very first program.",
    topics: [
      { title: "Your first program: classes and main" },
      { title: "Variables and data types" },
      { title: "Reading input with Scanner and printing output" },
      { title: "Decisions and loops" },
      { title: "Methods" },
      { title: "Arrays" },
      { title: "Strings" },
      { title: "Classes and objects" },
      { title: "Inheritance" },
      { title: "Exceptions" },
    ],
  },
  {
    slug: "python",
    name: "Python",
    summary: "Short, readable syntax that lets you focus on the idea before the details.",
    description:
      "Python has short, readable syntax, so you can focus on what a program does without declaring types or ending lines with semicolons.",
    topics: [
      { title: "Your first Python program", lesson: "first-program" },
      { title: "Variables and data types", lesson: "variables" },
      { title: "Numbers and arithmetic", lesson: "numbers" },
      { title: "Input and output", lesson: "input-output" },
      { title: "Making decisions with if and else", lesson: "decisions" },
      { title: "More decisions with elif", lesson: "elif" },
      { title: "Combining conditions with and, or and not", lesson: "conditions" },
      { title: "Loops: while and for", lesson: "loops" },
      { title: "Functions", lesson: "functions" },
      { title: "Lists", lesson: "lists" },
      { title: "Strings", lesson: "strings" },
      { title: "Dictionaries", lesson: "dictionaries" },
      { title: "Reading and writing files", lesson: "files" },
    ],
  },
];

export function findCourse(slug: string): Course | undefined {
  return courses.find((course) => course.slug === slug);
}
