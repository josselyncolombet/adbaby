import type { CmdletArgs } from "./index";
import type { PSValue } from "../value";

export function measureObject({ input }: CmdletArgs): PSValue[] {
  return [
    {
      type: "MeasureInfo",
      raw: { count: input.length },
      props: { Count: input.length },
    },
  ];
}
