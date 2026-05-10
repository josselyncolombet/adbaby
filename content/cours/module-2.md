# Module 2 — Lire l'AD avec Get-AD\* et le pipeline

Tu sais ce qu'est l'AD. Maintenant tu vas l'**interroger** sans rien casser. Toutes les cmdlets `Get-AD*` sont en lecture seule.

## 1. Cibler un objet précis avec `-Identity`

```powershell
Get-ADUser -Identity j.dupont
Get-ADGroup -Identity "Domain Admins"
Get-ADComputer -Identity SRV-FILE-01
```

`-Identity` accepte un `samAccountName` ou un DN. Si l'objet n'existe pas, la commande lève une erreur — toujours utile pour scripter de façon défensive.

> 💡 **Astuce** : par défaut, `Get-ADUser -Identity` ne te ramène qu'un sous-ensemble de propriétés. Pour avoir `LastLogonDate`, `PasswordLastSet`, `MemberOf`… il faut les demander avec `-Properties`.

```powershell
Get-ADUser -Identity j.dupont -Properties LastLogonDate, PasswordLastSet, MemberOf
```

## 2. Filtrer une liste avec `-Filter`

`-Filter` prend un *scriptblock* qui décrit la condition LDAP à évaluer côté serveur :

```powershell
Get-ADUser -Filter *                                 # tous les comptes
Get-ADUser -Filter { Enabled -eq $false }            # uniquement les comptes désactivés
Get-ADUser -Filter { Department -eq "Compta" }       # filtrage sur attribut
Get-ADUser -Filter { samAccountName -like "j.*" }    # wildcard
```

> ⚠️ **Avertissement** : `-Filter *` sur un domaine de 5 000 comptes ramène 5 000 objets. Pense à filtrer côté serveur quand tu peux, c'est plus rapide qu'un `Where-Object`.

## 3. Le pipeline `|`

Le pipeline passe les objets d'une cmdlet à l'autre. Trois cmdlets que tu vas utiliser tout le temps :

```powershell
Get-ADUser -Filter * |
  Where-Object { $_.Enabled -eq $false } |
  Select-Object Name, SamAccountName, LastLogonDate
```

- `Where-Object` : filtre côté client (utile quand `-Filter` ne suffit pas, ex. pour des dates).
- `Select-Object` : ne garde que certaines propriétés.
- `Sort-Object` : trie sur une propriété (`-Descending` pour l'ordre inverse).
- `Measure-Object` : compte / moyenne / max…

## 4. Variantes par type d'objet

- `Get-ADGroup` : annuaire des groupes. `-Properties Members` pour avoir la liste des DNs membres.
- `Get-ADComputer` : annuaire des postes/serveurs. `-Properties LastLogonDate, OperatingSystem` est typique en audit.
- `Get-ADOrganizationalUnit -Filter *` : énumérer les OU.

## 5. Variables et propriétés au pipeline

À l'intérieur d'un `Where-Object`, tu accèdes à l'objet courant avec `$_` :

```powershell
Get-ADUser -Filter * -Properties LastLogonDate |
  Where-Object { $_.LastLogonDate -lt (Get-Date).AddDays(-90) } |
  Select-Object Name, LastLogonDate |
  Sort-Object LastLogonDate
```

> 📖 **À retenir** : `-eq -ne -lt -le -gt -ge -like -notlike -match -contains -in -and -or -not` sont les opérateurs PowerShell. Pas de `==` ni de `!=` ici, c'est du PowerShell, pas du C#.

---

## 6. Adapter un script existant

À l'écrit E7, on te donne souvent un script PowerShell **déjà écrit** que tu dois **modifier** pour répondre à un nouveau besoin (changer un département, ajouter une condition de date, exclure les comptes désactivés, etc.).

Pattern type :

```powershell
# Avant : tous les comptes
Get-ADUser -Filter * |
  Where-Object { $_.Enabled -eq $false }

# Après : on veut ceux qui sont verrouillés
Get-ADUser -Filter * |
  Where-Object { $_.LockedOut -eq $true }
```

> 💡 **Astuce** : quand tu adaptes, identifie d'abord la **partie à changer** (filter, propriété, condition) puis ne touche qu'à ça. Garder le reste du squelette montre à l'examinateur que tu lis le script.

> ⚠️ **Avertissement** : un piège classique consiste à enchaîner `Search-ADAccount -AccountInactive` sans filtrer ensuite les comptes désactivés. Tu retournes alors des comptes déjà partis (faux positifs). Pense à `| Where-Object { $_.Enabled -eq $true }`.

---

## Récap rapide

| Tu veux… | Tu tapes… |
|---|---|
| Un compte précis | `Get-ADUser -Identity sam` |
| Tous les comptes | `Get-ADUser -Filter *` |
| Les désactivés | `Get-ADUser -Filter { Enabled -eq $false }` |
| Avec des attributs en plus | `... -Properties LastLogonDate, MemberOf` |
| Le compter | `... | Measure-Object` |
| Filtrer côté client | `... | Where-Object { $_.x -eq y }` |
