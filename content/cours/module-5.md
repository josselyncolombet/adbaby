# Module 5 — Mots de passe et verrouillage

C'est le sujet le plus pénalisant à l'audit AD : un mot de passe trop court ou un compte verrouillé qui ne se déverrouille jamais peut t'envoyer en bas du score PingCastle. À l'E7, tu dois savoir lire la politique en vigueur, la modifier, et déverrouiller un utilisateur en panique.

## 1. La politique de mot de passe par défaut

```powershell
Get-ADDefaultDomainPasswordPolicy
```

Sortie typique :

```
ComplexityEnabled           : True
LockoutDuration             : 00:30:00
LockoutObservationWindow    : 00:30:00
LockoutThreshold            : 5
MaxPasswordAge              : 90.00:00:00
MinPasswordAge              : 1.00:00:00
MinPasswordLength           : 8
PasswordHistoryCount        : 5
ReversibleEncryptionEnabled : False
```

| Paramètre | Recommandation ANSSI |
|---|---|
| `MinPasswordLength` | ≥ 12 caractères |
| `ComplexityEnabled` | `True` |
| `MaxPasswordAge` | 90 jours (ou 0 si MFA) |
| `LockoutThreshold` | 3 à 5 tentatives |
| `LockoutDuration` | 15 à 30 minutes |
| `ReversibleEncryptionEnabled` | **`False`** (sinon mots de passe lisibles) |

> ⚠️ **Avertissement** : `ReversibleEncryptionEnabled = True` est une faute d'audit *immédiate*. Ce paramètre stocke le mdp en quasi-clair côté DC.

## 2. Réinitialiser un mot de passe

```powershell
Set-ADAccountPassword -Identity p.martin -Reset `
  -NewPassword (ConvertTo-SecureString "Nouveau-2026!" -AsPlainText -Force)
```

Le paramètre `-Reset` permet à l'admin de fixer un mot de passe sans connaître l'ancien.

> 💡 **Astuce** : enchaîne avec `Set-ADUser -Identity ... -ChangePasswordAtLogon $true` pour forcer le changement à la prochaine ouverture.

## 3. Déverrouiller un compte

```powershell
# Le compte de Camille s'est verrouillé après 5 tentatives
Unlock-ADAccount -Identity c.rousseau
```

> 📖 **À retenir** : `Unlock-ADAccount` ne réinitialise pas le mot de passe. Le compte reprend exactement comme avant le verrouillage.

## 4. Audit des comptes : `Search-ADAccount`

```powershell
# Comptes inactifs depuis plus de 90 jours
Search-ADAccount -AccountInactive -TimeSpan 90 -UsersOnly

# Comptes désactivés
Search-ADAccount -AccountDisabled -UsersOnly

# Comptes verrouillés
Search-ADAccount -LockedOut

# Comptes dont le mdp n'expire jamais (audit ANSSI)
Search-ADAccount -PasswordNeverExpires -UsersOnly

# Comptes dont le mdp est expiré
Search-ADAccount -PasswordExpired -UsersOnly
```

C'est exactement ce que tu vas restituer dans un tableau d'audit type *Ville du Parc 2023*.

## 5. Fine-grained password policy (PSO)

Quand tu veux une **politique différenciée** (ex. les admins doivent avoir un mdp ≥ 15 chars), tu crées un **Password Settings Object (PSO)** :

```powershell
New-ADFineGrainedPasswordPolicy `
  -Name "PSO-Admins" `
  -Precedence 10 `
  -MinPasswordLength 15 `
  -ComplexityEnabled $true `
  -PasswordHistoryCount 24 `
  -MaxPasswordAge "60.00:00:00"

Add-ADFineGrainedPasswordPolicySubject -Identity PSO-Admins -Subjects "Domain Admins"
```

> 📖 **À retenir** pour l'E7 : il y a *une seule* politique par défaut par domaine. Les exigences renforcées passent par PSO appliqués à un groupe.

---

## Récap rapide

```powershell
# Lire la politique actuelle
Get-ADDefaultDomainPasswordPolicy

# Reset + forcer le changement
Set-ADAccountPassword -Identity user -Reset `
  -NewPassword (ConvertTo-SecureString "X-2026!" -AsPlainText -Force)
Set-ADUser -Identity user -ChangePasswordAtLogon $true

# Déverrouiller
Unlock-ADAccount -Identity user

# Audit des comptes inactifs
Search-ADAccount -AccountInactive -TimeSpan 90 -UsersOnly
```
