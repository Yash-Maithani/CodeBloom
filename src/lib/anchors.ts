// The id of a line of an example, so prose terms can link to it. A plain
// module (not a client component), so server and client code get the same function.
export const lineAnchor = (exampleId: string, line: number) => `${exampleId.replace(/\W/g, "-")}-line-${line}`;
