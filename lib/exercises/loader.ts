import fs from "node:fs";
import path from "node:path";
import type { Exercise } from "@/types/exercise";
import type { ADSnapshot } from "@/lib/ad/types";

const EXO_DIR = path.join(process.cwd(), "content", "exercices");
const ETATS_DIR = path.join(process.cwd(), "content", "etats");

export function loadAll(): Exercise[] {
  if (!fs.existsSync(EXO_DIR)) return [];
  const files = fs
    .readdirSync(EXO_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();
  const list = files.map((f) => {
    const raw = fs.readFileSync(path.join(EXO_DIR, f), "utf8");
    return JSON.parse(raw) as Exercise;
  });
  list.sort((a, b) => a.module - b.module || a.ordre - b.ordre);
  return list;
}

export function loadById(id: string): Exercise | null {
  return loadAll().find((e) => e.id === id) ?? null;
}

export function loadByModule(module: number): Exercise[] {
  return loadAll().filter((e) => e.module === module);
}

export function loadSnapshot(name: string): ADSnapshot | null {
  const file = path.join(ETATS_DIR, `${name}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8")) as ADSnapshot;
}
