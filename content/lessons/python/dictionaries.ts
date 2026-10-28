import type { LessonSource } from "@/lib/lesson-types";

// Prose in reading order: dictionaries.md. Shared idea: content/concepts/key-value.md.
export const pythonDictionaries: LessonSource = {
  course: "python",
  slug: "dictionaries",
  title: "Dictionaries",
  status: "published",
  concept: "key-value",
  objective: "Store values under keys in a dictionary, look them up, add and change them, check for a key, and count things with a loop.",
  analogy: {
    title: "A phone book",
    text: "A phone book lists a phone number next to each name. You do not look for the number in position 40. You look up a name and read the number beside it.",
    limit:
      "a printed phone book is sorted by name, and two people in it can have the same name. A Python dictionary keeps its items in the order they were added, and each key can appear only once. A key stored again replaces the old value.",
  },
  examples: {
    basics: {
      file: "python/dict_basics",
      caption: "Ages by name",
      notes: [
        { startLine: 1, endLine: 1, text: "Two items. `\"Ada\"` and `\"Grace\"` are the keys, and 36 and 45 are the values." },
        { startLine: 2, endLine: 2, text: "`print` shows a dictionary with curly brackets, colons and quotes around text keys." },
        { startLine: 3, endLine: 3, text: "The key in square brackets finds the value stored under it." },
        { startLine: 5, endLine: 5, text: "`len` gives the number of items." },
      ],
    },
    change: {
      file: "python/dict_change",
      caption: "Add one, change one",
      notes: [
        { startLine: 2, endLine: 2, text: "Assigning to a key that is not there adds a new item." },
        { startLine: 3, endLine: 3, text: "Assigning to a key that is there replaces its value." },
      ],
    },
    check: {
      file: "python/dict_in_get",
      caption: "in and get",
      notes: [
        { startLine: 2, endLine: 2, text: "`in` asks whether `\"Ada\"` is a key." },
        { startLine: 4, endLine: 4, text: "`\"Alan\"` is not a key, so `get` gives back `None` instead of stopping the program." },
        { startLine: 5, endLine: 5, text: "The second value is a default, given back when the key is missing." },
      ],
    },
    loop: {
      file: "python/dict_loop",
      caption: "Keys and values",
      notes: [
        { startLine: 2, endLine: 2, text: "`name` is each key in turn." },
        { startLine: 3, endLine: 3, text: "`ages[name]` looks up the value for the current key." },
      ],
    },
    count: {
      file: "python/dict_count",
      caption: "Counting words",
      notes: [
        { startLine: 1, endLine: 1, text: "`split(\" \")` cuts the sentence at every space and gives back a list of five words." },
        { startLine: 2, endLine: 2, text: "An empty dictionary: curly brackets with nothing inside." },
        {
          startLine: 4,
          endLine: 4,
          text: "`counts.get(word, 0)` is the current count of this word, or 0 if the word is new. The result plus 1 is stored under the word, which either adds a new item or replaces the old count.",
        },
        { startLine: 5, endLine: 5, text: "Not indented, so it runs once, after the loop." },
      ],
    },
  },
  visuals: {
    growth: {
      example: "python/dict_count",
      title: "Step through it: watch the dictionary grow",
      notes: {
        2: "An empty dictionary. Nothing has been counted yet.",
        4: "`the` was not a key yet, so `get` supplied 0. The dictionary now has one item.",
        10: "`the` is a key now, so `get` gave back 1 and the count became 2. No new item was added: the old count was replaced.",
        12: "`hat` is a new word, so a new item is added. The dictionary now has four items.",
        14: "The loop is over, and `print` shows the finished dictionary.",
      },
    },
  },
  mistakes: [
    {
      title: "Asking for a key that is not there",
      example: {
        file: "python/dict_key_error",
        notes: [{ startLine: 2, endLine: 2, text: "`\"Alan\"` is not a key of `ages`." }],
      },
      whatHappens: "Python stops with a `KeyError` on line 2. Square brackets do not make up an answer for a missing key.",
      howToRead: "the last line names the error and shows the missing key. The lines above show the code that failed.",
      fix: "use `get` with a default, or check with `in` first.",
      fixExample: {
        file: "python/dict_key_error_fix",
        caption: "The fix",
        notes: [{ startLine: 2, endLine: 2, text: "`get` gives back the default when the key is missing." }],
      },
    },
    {
      title: "Using the same key twice",
      example: {
        file: "python/dict_duplicate",
        notes: [{ startLine: 1, endLine: 1, text: "`\"Ada\"` appears twice as a key." }],
      },
      whatHappens:
        "the program runs without an error, but the dictionary has two items, not three. A dictionary keeps one item per key. The later value, 37, replaced the earlier one, 36, and the item stayed in its first position.",
      whyEasyToMiss: "no error message appears and the result looks reasonable. Two people with the same first name are easy to overlook.",
      fix: "give every item its own key, for example full names.",
      fixExample: {
        file: "python/dict_duplicate_fix",
        caption: "The fix",
        notes: [{ startLine: 1, endLine: 1, text: "Each key is different, so every item is kept." }],
      },
    },
  ],
  practice: [
    {
      kind: "predict-output",
      question: "What does this program show?",
      example: { file: "python/practice_dict_update", notes: [] },
      correctPosition: 3,
      wrongOutputs: [
        { text: "3\n3", why: "Line 2 stores the result of `stock[\"apple\"] + 2` back under the key `\"apple\"`, replacing 3 with 5." },
        { text: "5\n2", why: "Line 3 assigns to a key that is not there, which adds a new item. The dictionary has three items: apple, pear and plum." },
      ],
      hints: ["What does line 2 store under `\"apple\"`?", "Does assigning to a new key add an item or cause an error?"],
      explanation: "apple becomes 5, and plum is added as a third item.",
    },
    {
      kind: "predict-output",
      question: "What does this program show?",
      example: { file: "python/practice_dict_get", notes: [] },
      correctPosition: 1,
      wrongOutputs: [
        { text: "None\nTrue\nFalse", why: "With a second value, `get` gives back that value when the key is missing, so 0 is shown, not `None`." },
        { text: "0\nTrue\nTrue", why: "`in` checks the keys, not the values. 2 is a value (the price of tea), not a key, so the answer is `False`." },
      ],
      hints: ["What does `get` give back when the key is missing and a default is given?", "Does `in` look at keys or at values?"],
      explanation: "\"coffee\" is missing, so `get` gives the default 0. \"tea\" is a key, and 2 is only a value.",
    },
    {
      kind: "choice",
      question: "A program has `scores = {\"Ada\": 90}` and runs `print(scores[\"Grace\"])`. What happens?",
      options: [
        {
          text: "Python stops with a `KeyError`, because `\"Grace\"` is not a key.",
          why: "Square brackets with a missing key stop the program, as in the first mistake above.",
          correct: true,
        },
        { text: "It shows `None`, because there is no value for `\"Grace\"`.", why: "`get` gives back `None` for a missing key, but square brackets do not. They stop the program." },
        {
          text: "It shows 0, because a missing value counts as zero.",
          why: "Python never makes up a value. `get(\"Grace\", 0)` gives 0 only because you asked for that default.",
        },
      ],
      hints: ["Is `\"Grace\"` a key of `scores`?", "What do square brackets do when the key is missing?"],
      explanation: "Square brackets need an existing key. To avoid the error, use `get` or check with `in`.",
    },
  ],
  recap: [
    "A dictionary stores values under keys: `{\"Ada\": 36}`. You find a value by its key, not by a position.",
    "`d[key]` reads a value, and `d[key] = value` adds a new item or replaces an existing one.",
    "A missing key makes `d[key]` stop with a `KeyError`. `key in d` and `d.get(key, default)` are safe ways to ask.",
    "`in` checks the keys, not the values.",
    "A `for` loop over a dictionary gives the keys, in the order they were added.",
    "Each key appears once, and a key stored again replaces the old value.",
    "Counting: `counts[word] = counts.get(word, 0) + 1`.",
  ],
};
