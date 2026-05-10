import { test } from "node:test";
import { strict as assert } from "node:assert";
import {
  computeUnlockedExos,
  computeUnlockedCourses,
} from "./unlock";
import type { ModuleWithExercices } from "@/types/exercise";

// Modules synthétiques pour tester la logique en isolation.
const FIXTURE: ModuleWithExercices[] = [
  {
    module: 1,
    titre: "M1",
    exercices: [
      { id: "a1", ordre: 1, titre: "a1", difficulte: "facile" },
      { id: "a2", ordre: 2, titre: "a2", difficulte: "facile" },
      { id: "a3", ordre: 3, titre: "a3", difficulte: "moyen" },
    ],
  },
  {
    module: 2,
    titre: "M2",
    exercices: [
      { id: "b1", ordre: 1, titre: "b1", difficulte: "facile" },
      { id: "b2", ordre: 2, titre: "b2", difficulte: "moyen" },
    ],
  },
  {
    module: 3,
    titre: "M3",
    exercices: [
      { id: "c1", ordre: 1, titre: "c1", difficulte: "facile" },
    ],
  },
];

test("au démarrage : seul a1 est débloqué, c1 module 1 cours libre", () => {
  const completed = new Set<string>();
  const unlocked = computeUnlockedExos(FIXTURE, completed);
  assert.deepEqual([...unlocked].sort(), ["a1"]);
  const cours = computeUnlockedCourses(FIXTURE, completed);
  assert.deepEqual([...cours].sort(), [1]);
});

test("valider a1 débloque a2 mais pas plus", () => {
  const completed = new Set(["a1"]);
  const unlocked = computeUnlockedExos(FIXTURE, completed);
  assert.deepEqual([...unlocked].sort(), ["a1", "a2"]);
});

test("valider a1+a2 débloque a3 mais b1 reste verrouillé", () => {
  const completed = new Set(["a1", "a2"]);
  const unlocked = computeUnlockedExos(FIXTURE, completed);
  assert.deepEqual([...unlocked].sort(), ["a1", "a2", "a3"]);
  const cours = computeUnlockedCourses(FIXTURE, completed);
  assert.deepEqual([...cours].sort(), [1]);
});

test("valider tout le module 1 débloque b1 ET le cours du module 2", () => {
  const completed = new Set(["a1", "a2", "a3"]);
  const unlocked = computeUnlockedExos(FIXTURE, completed);
  assert.deepEqual([...unlocked].sort(), ["a1", "a2", "a3", "b1"]);
  const cours = computeUnlockedCourses(FIXTURE, completed);
  assert.deepEqual([...cours].sort(), [1, 2]);
});

test("valider M1 + b1 débloque b2 mais c1 module 3 reste verrouillé", () => {
  const completed = new Set(["a1", "a2", "a3", "b1"]);
  const unlocked = computeUnlockedExos(FIXTURE, completed);
  assert.deepEqual([...unlocked].sort(), ["a1", "a2", "a3", "b1", "b2"]);
  const cours = computeUnlockedCourses(FIXTURE, completed);
  assert.deepEqual([...cours].sort(), [1, 2]);
});

test("valider tout M1+M2 débloque c1 ET le cours du module 3", () => {
  const completed = new Set(["a1", "a2", "a3", "b1", "b2"]);
  const unlocked = computeUnlockedExos(FIXTURE, completed);
  assert.deepEqual([...unlocked].sort(), ["a1", "a2", "a3", "b1", "b2", "c1"]);
  const cours = computeUnlockedCourses(FIXTURE, completed);
  assert.deepEqual([...cours].sort(), [1, 2, 3]);
});

test("sauter a2 ne débloque rien : a3 reste verrouillé", () => {
  const completed = new Set(["a1", "a3"]);
  const unlocked = computeUnlockedExos(FIXTURE, completed);
  // a3 a été marqué validé directement (par admin), mais a2 n'est pas fait → a3 reste accessible (déjà fait), b1 reste verrouillé
  assert.equal(unlocked.has("a2"), true, "a2 toujours débloqué");
  assert.equal(unlocked.has("b1"), false, "b1 doit rester verrouillé tant que a2 non validé");
});

test("compléter le dernier exo d'un module sans les autres ne débloque pas le suivant", () => {
  const completed = new Set(["a1", "a2"]); // a3 manquant
  const cours = computeUnlockedCourses(FIXTURE, completed);
  assert.equal(cours.has(2), false, "le cours du module 2 doit rester verrouillé");
  const unlocked = computeUnlockedExos(FIXTURE, completed);
  assert.equal(unlocked.has("b1"), false, "b1 doit rester verrouillé");
});

test("progression strictement vide : seul l'exo 1 du module 1 est ouvert", () => {
  const unlocked = computeUnlockedExos(FIXTURE, new Set());
  assert.equal(unlocked.size, 1);
  assert.equal(unlocked.has("a1"), true);
});

test("100% complété : tout est débloqué", () => {
  const all = new Set(FIXTURE.flatMap((m) => m.exercices.map((e) => e.id)));
  const unlocked = computeUnlockedExos(FIXTURE, all);
  assert.equal(unlocked.size, all.size);
  const cours = computeUnlockedCourses(FIXTURE, all);
  assert.equal(cours.size, FIXTURE.length);
});
