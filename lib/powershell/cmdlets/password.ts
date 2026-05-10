// Set-ADAccountPassword, Search-ADAccount, Get-ADDefaultDomainPasswordPolicy
import type { CmdletArgs } from "./index";
import { RuntimeError } from "../executor";
import { findUserBySam } from "../../ad/tree";
import { paramMap, stringy, hasSwitch } from "./_helpers";
import { psFromUser, type PSValue } from "../value";

export function setADAccountPassword(args: CmdletArgs) {
  const p = paramMap(args.command.params);
  const ident =
    stringy(p.get("Identity")) ?? stringy(args.command.positional[0]);
  if (!ident) throw new RuntimeError("Set-ADAccountPassword : -Identity requis");
  const u = findUserBySam(args.ctx.state, ident);
  if (!u) throw new RuntimeError(`compte '${ident}' introuvable`);
  // On simule : on note juste que le mot de passe a été reset.
  u.passwordLastSet = args.ctx.state.now;
  if (hasSwitch(args.command.params, "Reset")) {
    u.locked = false;
    u.badPwdCount = 0;
  }
  u.whenChanged = args.ctx.state.now;
  return [];
}

export function getADDefaultDomainPasswordPolicy(args: CmdletArgs): PSValue[] {
  const pol = args.ctx.state.defaultPasswordPolicy;
  return [
    {
      type: "ADPasswordPolicy",
      raw: pol,
      props: {
        MinPasswordLength: pol.minPasswordLength,
        PasswordHistoryCount: pol.passwordHistoryCount,
        MaxPasswordAge: `${pol.maxPasswordAge}.00:00:00`,
        MinPasswordAge: `${pol.minPasswordAge}.00:00:00`,
        ComplexityEnabled: pol.complexityEnabled,
        ReversibleEncryptionEnabled: pol.reversibleEncryptionEnabled,
        LockoutThreshold: pol.lockoutThreshold,
        LockoutDuration: `00:${String(pol.lockoutDuration).padStart(2, "0")}:00`,
        LockoutObservationWindow: `00:${String(pol.lockoutObservationWindow).padStart(2, "0")}:00`,
      },
    },
  ];
}

const DAY_MS = 86_400_000;

export function searchADAccount(args: CmdletArgs): PSValue[] {
  const flags = {
    accountInactive: hasSwitch(args.command.params, "AccountInactive"),
    accountDisabled: hasSwitch(args.command.params, "AccountDisabled"),
    lockedOut: hasSwitch(args.command.params, "LockedOut"),
    passwordExpired: hasSwitch(args.command.params, "PasswordExpired"),
    passwordNeverExpires: hasSwitch(args.command.params, "PasswordNeverExpires"),
    usersOnly: hasSwitch(args.command.params, "UsersOnly"),
    computersOnly: hasSwitch(args.command.params, "ComputersOnly"),
  };
  const p = paramMap(args.command.params);
  const timespanRaw = p.get("TimeSpan");
  const days =
    timespanRaw && timespanRaw.kind === "number"
      ? timespanRaw.value
      : 90;
  const now = Date.parse(args.ctx.state.now);

  return args.ctx.state.users
    .filter((u) => {
      if (flags.accountDisabled && u.enabled) return false;
      if (flags.lockedOut && !u.locked) return false;
      if (flags.passwordNeverExpires && !u.passwordNeverExpires) return false;
      if (flags.accountInactive) {
        const last = u.lastLogonDate ? Date.parse(u.lastLogonDate) : 0;
        if (now - last < days * DAY_MS) return false;
      }
      if (flags.passwordExpired) {
        const last = u.passwordLastSet ? Date.parse(u.passwordLastSet) : 0;
        const max = args.ctx.state.defaultPasswordPolicy.maxPasswordAge;
        if (u.passwordNeverExpires) return false;
        if (now - last < max * DAY_MS) return false;
      }
      // Si aucun filtre n'est posé : retourner tous les comptes filtrés au moins par usersOnly
      if (
        !flags.accountInactive &&
        !flags.accountDisabled &&
        !flags.lockedOut &&
        !flags.passwordExpired &&
        !flags.passwordNeverExpires
      ) {
        return false;
      }
      return true;
    })
    .map((u) => psFromUser(u));
}
