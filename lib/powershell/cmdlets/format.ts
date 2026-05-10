import type { CmdletArgs } from "./index";
import type { PSValue } from "../value";

// Format-Table et Format-List sont des passe-plat : ils n'altèrent pas
// les objets (le formatage final est fait par formatPipelineOutput).
// On les expose pour ne pas crasher si l'élève les enchaîne.
export function formatTable({ input }: CmdletArgs): PSValue[] {
  return input;
}

export function formatList({ input }: CmdletArgs): PSValue[] {
  return input.map((v) => ({ ...v, type: v.type + "@List" }));
}
