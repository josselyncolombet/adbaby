import type { Command } from "../ast";
import type { ExecContext } from "../executor";
import type { PSValue } from "../value";
import { getADUser } from "./get-aduser";
import { getADGroup } from "./get-adgroup";
import { getADComputer } from "./get-adcomputer";
import { getADOrganizationalUnit } from "./get-adou";
import { newADUser } from "./new-aduser";
import { setADUser } from "./set-aduser";
import {
  disableADAccount,
  enableADAccount,
  unlockADAccount,
  removeADUser,
} from "./account-state";
import { moveADObject } from "./move-adobject";
import {
  addADGroupMember,
  removeADGroupMember,
  getADGroupMember,
  newADGroup,
  removeADGroup,
} from "./group-members";
import {
  setADAccountPassword,
  getADDefaultDomainPasswordPolicy,
  searchADAccount,
} from "./password";
import { whereObject } from "./where-object";
import { selectObject } from "./select-object";
import { sortObject } from "./sort-object";
import { measureObject } from "./measure-object";
import { formatTable, formatList } from "./format";

export interface CmdletArgs {
  ctx: ExecContext;
  command: Command;
  input: PSValue[];
}

export type Cmdlet = (args: CmdletArgs) => PSValue[];

export const CMDLETS: Record<string, Cmdlet> = {
  // Lecture
  "get-aduser": getADUser,
  "get-adgroup": getADGroup,
  "get-adcomputer": getADComputer,
  "get-adorganizationalunit": getADOrganizationalUnit,
  // Modification
  "new-aduser": newADUser,
  "set-aduser": setADUser,
  "remove-aduser": removeADUser,
  "disable-adaccount": disableADAccount,
  "enable-adaccount": enableADAccount,
  "unlock-adaccount": unlockADAccount,
  "move-adobject": moveADObject,
  // Groupes
  "new-adgroup": newADGroup,
  "remove-adgroup": removeADGroup,
  "add-adgroupmember": addADGroupMember,
  "remove-adgroupmember": removeADGroupMember,
  "get-adgroupmember": getADGroupMember,
  // Mots de passe / audit
  "set-adaccountpassword": setADAccountPassword,
  "get-addefaultdomainpasswordpolicy": getADDefaultDomainPasswordPolicy,
  "search-adaccount": searchADAccount,
  // Pipeline génériques
  "where-object": whereObject,
  where: whereObject,
  "?": whereObject,
  "select-object": selectObject,
  select: selectObject,
  "sort-object": sortObject,
  sort: sortObject,
  "measure-object": measureObject,
  measure: measureObject,
  "format-table": formatTable,
  ft: formatTable,
  "format-list": formatList,
  fl: formatList,
};
