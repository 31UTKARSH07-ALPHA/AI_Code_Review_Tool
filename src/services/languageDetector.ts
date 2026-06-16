export function detectLanguage(code: string): string {
  const scores: Record<string, number> = {
    python: 0,
    typescript: 0,
    javascript: 0,
    java: 0,
    unknown: 0,
  };

  if (code.includes("def ")) scores.python += 2;
  if (code.includes("self.")) scores.python += 2;
  if (code.includes("import ") && !code.includes("from '")) scores.python += 1;
  if (code.includes("print(")) scores.python += 2;
  if (code.includes("elif ")) scores.python += 3;

  if (code.includes(": string")) scores.typescript += 2;
  if (code.includes(": number")) scores.typescript += 2;
  if (code.includes(": boolean")) scores.typescript += 2;
  if (code.includes("interface ")) scores.typescript += 3;
  if (code.includes(": void")) scores.typescript += 2;
  if (code.includes("<T>") || code.includes("generic")) scores.typescript += 2;

  if (code.includes("const ")) scores.javascript += 1;
  if (code.includes("let ")) scores.javascript += 1;
  if (code.includes("=>")) scores.javascript += 1;
  if (code.includes("console.log")) scores.javascript += 2;
  if (code.includes("require(")) scores.javascript += 2;

  if (code.includes("public class")) scores.java += 3;
  if (code.includes("System.out.println")) scores.java += 3;
  if (code.includes("public static void main")) scores.java += 3;
  if (code.includes("@Override")) scores.java += 2;

  const detected = Object.entries(scores).reduce((a, b) =>
    b[1] > a[1] ? b : a,
  );

  return detected[1] === 0 ? "unknown" : detected[0];
}
