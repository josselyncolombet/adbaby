# Module 4 — Groupes et appartenances

Les **groupes** portent les permissions. Sans groupe, tu te retrouves à donner des droits utilisateur par utilisateur — ingérable et impossible à auditer. À l'épreuve E7, on attend que tu connaisses la stratégie **AGDLP**.

## 1. Catégorie et portée d'un groupe

| Attribut | Valeurs | Sens |
|---|---|---|
| **GroupCategory** | `Security` ou `Distribution` | sécurité = pour les ACL ; distribution = pour les listes mail. |
| **GroupScope** | `DomainLocal`, `Global`, `Universal` | définit où le groupe peut avoir des membres et où il peut être utilisé. |

> 📖 **Convention E7** : si on ne te dit rien, c'est `Security` + `Global`.

## 2. Créer un groupe

```powershell
New-ADGroup `
  -Name "G_Compta" `
  -SamAccountName "G_Compta" `
  -GroupCategory Security `
  -GroupScope Global `
  -Path "OU=Groupes,DC=pme,DC=local" `
  -Description "Groupe global du service Compta"
```

> 💡 **Astuce** : préfixer les groupes (`G_`, `DL_`, `U_`) rend les ACL et les exports lisibles. C'est *de facto* la norme.

## 3. Ajouter / retirer des membres

```powershell
# Ajouter
Add-ADGroupMember -Identity G_Compta -Members p.martin
Add-ADGroupMember -Identity G_Compta -Members p.martin, j.dupont

# Retirer
Remove-ADGroupMember -Identity G_Compta -Members p.martin -Confirm:$false

# Lister les membres
Get-ADGroupMember -Identity G_Compta
```

## 4. Imbrication AGDLP

C'est la stratégie de référence en environnement Windows :

- **A** ccount → on place les comptes…
- **G** lobal → dans des groupes globaux par service (`G_Compta`, `G_Direction`).
- **D** omain **L** ocal → on place les groupes globaux dans des groupes domaine-local par ressource (`DL_Partage_Compta_RW`, `DL_Imprimante_Couleur`).
- **P** ermissions → on assigne les permissions NTFS / partage **uniquement aux groupes domaine-local**.

```
p.martin (user)
  └→ G_Compta (global)
       └→ DL_Partage_Compta_RW (domain local)
            └→ ACL NTFS sur \\srv-fic\compta
```

> ⚠️ **Avertissement** : la faute classique aux corrigés E7 est de mettre les comptes directement dans des groupes domaine-local, ou de mettre des droits NTFS directement sur des comptes. **Aucun point** n'est donné pour ces patterns.

## 5. Groupes par défaut à connaître

| Groupe | Rôle | Risque |
|---|---|---|
| `Domain Users` | tous les comptes du domaine | légitime, à laisser. |
| `Domain Admins` | admins du domaine. | **gros risque** : à limiter à 2-3 comptes. |
| `Enterprise Admins` | admins de la forêt. | encore plus sensible. À vider en mono-domaine. |
| `Schema Admins` | modification du schéma AD. | à vider hors opérations. |
| `Backup Operators` | sauvegarde sans tenir compte des ACL. | sensibilité ≈ admin local. |
| `Account Operators` | gestion comptes simples. | déprécié, **à éviter**. |

> 📖 **À retenir** pour E7 : un compte humain dans `Domain Admins` doit avoir **deux comptes** (`u.nom` pour le quotidien, `a.u.nom` pour l'admin). Mélanger les deux est une faute d'audit.

---

## Récap rapide

```powershell
# Créer le groupe
New-ADGroup -Name G_Compta -GroupScope Global -GroupCategory Security `
            -Path "OU=Groupes,DC=pme,DC=local"

# Ajouter trois membres en une commande
Add-ADGroupMember -Identity G_Compta -Members p.martin, m.bernard, s.lefevre

# Vérifier
Get-ADGroupMember -Identity G_Compta | Select-Object SamAccountName
```
