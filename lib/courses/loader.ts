import fs from "node:fs";
import path from "node:path";

const COURS_DIR = path.join(process.cwd(), "content", "cours");

export function loadCourse(moduleId: number): string | null {
  const file = path.join(COURS_DIR, `module-${moduleId}.md`);
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file, "utf8");
}
