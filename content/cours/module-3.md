# Module 3 — Modifier l'AD : New / Set / Remove

Tu sais lire. Maintenant tu écris. Les cmdlets de modification sont sensibles : une erreur peut désactiver un compte clé. À l'épreuve E7 on attend que tu écrives des scripts **idempotents et défensifs**.

## 1. Créer un compte avec `New-ADUser`

```powershell
New-ADUser `
  -SamAccountName "p.martin" `
  -Name "Pierre Martin" `
  -GivenName "Pierre" `
  -Surname "Martin" `
  -UserPrincipalName "p.martin@pme.local" `
  -Path "OU=Compta,DC=pme,DC=local" `
  -Title "Comptable" `
  -Department "Compta" `
  -Enabled $true `
  -AccountPassword (ConvertTo-SecureString "Initi@l-2026" -AsPlainText -Force) `
  -ChangePasswordAtLogon $true
```

> 💡 **Astuce** : tape le ` ` ` (backtick) en fin de ligne pour continuer une commande sur plusieurs lignes — c'est plus lisible quand tu as 8 paramètres.

> ⚠️ **Avertissement** : sans `-Enabled $true`, le compte est créé **désactivé**. C'est volontaire (sécurité par défaut) mais surprenant la première fois.

## 2. Modifier des attributs avec `Set-ADUser`

```powershell
Set-ADUser -Identity p.martin -Title "Responsable Compta"
Set-ADUser -Identity p.martin -Description "Promu en mai 2026"
Set-ADUser -Identity p.martin -PasswordNeverExpires $true   # ← à éviter !
```

`Set-ADUser` cible **un seul attribut à la fois** (ou plusieurs si tu enchaînes les paramètres). Pour modifier plusieurs comptes, on combine avec un pipeline :

```powershell
Get-ADUser -Filter { Department -eq "Compta" } |
  Set-ADUser -Department "Finance"
```

## 3. Activer / désactiver / déverrouiller

```powershell
Disable-ADAccount -Identity m.bernard       # départ d'un salarié
Enable-ADAccount -Identity m.bernard        # retour de congé sabbatique
Unlock-ADAccount -Identity c.rousseau       # client a tapé 5x un mauvais mdp
```

> 📖 **À retenir** : on **désactive** plutôt qu'on supprime. Tant que le compte existe (même désactivé), tu peux récupérer son historique de fichiers, mails, et droits NTFS.

## 4. Déplacer un compte d'OU avec `Move-ADObject`

```powershell
Move-ADObject `
  -Identity "CN=Pierre Martin,OU=Compta,DC=pme,DC=local" `
  -TargetPath "OU=Direction,DC=pme,DC=local"
```

Utile quand un salarié change de service. **Le DN change**, donc les GPO appliquées aussi.

## 5. Supprimer (en dernier recours)

```powershell
Remove-ADUser -Identity p.martin -Confirm:$false
```

> ⚠️ **Avertissement** : `Remove-ADUser` est **irréversible** sans une corbeille AD activée. Au BTS, ne supprime jamais en production. Désactive et déplace dans une OU `OU=Désactivés` après 30 jours.

## Workflow type : départ d'un salarié

```powershell
$user = "p.martin"

# 1. Désactiver
Disable-ADAccount -Identity $user

# 2. Reset le mot de passe (sécurité)
Set-ADAccountPassword -Identity $user -Reset `
  -NewPassword (ConvertTo-SecureString "Random-2026!" -AsPlainText -Force)

# 3. Déplacer dans l'OU des comptes désactivés
Move-ADObject -Identity (Get-ADUser $user).DistinguishedName `
  -TargetPath "OU=Désactivés,DC=pme,DC=local"

# 4. Sortir des groupes "métier" (sauf Domain Users)
Get-ADUser $user -Properties MemberOf |
  Select-Object -ExpandProperty MemberOf |
  Where-Object { $_ -notlike "*Domain Users*" } |
  ForEach-Object { Remove-ADGroupMember -Identity $_ -Members $user -Confirm:$false }
```

C'est exactement le scénario *Clinique Martin 2024* à l'E7. Tu reprendras ce pattern au module 4.

---

## Récap rapide

| Action | Cmdlet |
|---|---|
| Créer | `New-ADUser` |
| Modifier un attribut | `Set-ADUser` |
| Désactiver / activer | `Disable-ADAccount` / `Enable-ADAccount` |
| Déverrouiller | `Unlock-ADAccount` |
| Déplacer d'OU | `Move-ADObject` |
| Supprimer (rare) | `Remove-ADUser` |
