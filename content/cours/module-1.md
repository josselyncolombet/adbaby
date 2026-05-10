# Module 1 — Bases d'Active Directory

L'**Active Directory (AD)** est l'annuaire LDAP des environnements Windows. C'est ton point unique pour gérer les comptes, les machines et les droits dans une organisation. À l'épreuve E7 du BTS SIO SISR, tu n'auras *jamais* à installer un AD, mais tu dois savoir lire son organisation, écrire un script PowerShell et discuter sa sécurité.

## 1. Domaine, forêt, contrôleur de domaine

- Un **domaine** regroupe les objets (users, groupes, machines) sous un nom DNS, par exemple `ville-du-parc.local`.
- Le **contrôleur de domaine (DC)** est le serveur qui héberge la base AD et répond aux requêtes LDAP / Kerberos. Dans une PME tu en as au minimum un, idéalement deux pour la haute disponibilité.
- Plusieurs domaines reliés forment une **forêt**. Au BTS, tu travailles presque toujours en *forêt mono-domaine*.

> 📖 **À retenir** : un compte créé sur un DC est immédiatement répliqué vers les autres DCs du domaine. Tu n'as jamais à pousser manuellement.

## 2. Distinguished Name (DN)

Chaque objet AD a un **DN** unique qui décrit sa position dans l'arbre, lu *de la feuille à la racine* :

```
CN=Julie Dupont,OU=Direction,DC=pme,DC=local
└── CN ┘ └── OU ───┘ └─── DC ───────┘
   nom    unité       composantes du domaine
```

- `CN` : Common Name (nom de l'objet).
- `OU` : Organizational Unit (unité d'organisation, conteneur).
- `DC` : Domain Component (un par bout du nom DNS).

> 💡 **Astuce** : le DN se lit comme une URL inversée. Plus tu vas vers la droite, plus tu remontes vers la racine du domaine.

## 3. Organizational Units (OU)

Les **OU** servent à organiser les objets et **appliquer des stratégies de groupe (GPO)** différenciées par service.

```
DC=pme,DC=local
├── OU=Direction
├── OU=Compta
├── OU=Commercial
└── OU=Production
```

> ⚠️ **Avertissement** : ne confonds pas une **OU** (conteneur de comptes) avec un **groupe** (collection d'appartenances pour des permissions). On y revient au module 4.

## 4. samAccountName vs UserPrincipalName

Un compte utilisateur a plusieurs identifiants :

| Attribut | Exemple | Usage |
|---|---|---|
| `samAccountName` | `j.dupont` | identifiant *legacy* style NetBIOS, max 20 caractères. C'est celui-ci que tu utilises avec `-Identity` en PowerShell. |
| `UserPrincipalName` (UPN) | `j.dupont@pme.local` | identifiant style mail, recommandé pour les ouvertures de session modernes. |
| `DistinguishedName` | `CN=Julie Dupont,OU=Direction,DC=pme,DC=local` | identifiant LDAP unique. |

> 📖 **Convention E7** : on cible toujours par `samAccountName` quand on peut, pour éviter de retaper un long DN.

## 5. Types d'objets AD

Les principaux types que tu manipules :

- **user** : un compte humain ou un compte de service.
- **group** : un groupe de sécurité (pour les droits) ou de distribution (pour les listes mail).
- **computer** : un poste ou un serveur joint au domaine.
- **organizationalUnit** : une OU.

Chaque type expose un `ObjectClass` accessible via `Get-AD*`. C'est utile pour filtrer un export.

---

## Récap rapide

```powershell
# Le DN d'un user
"CN=Julie Dupont,OU=Direction,DC=pme,DC=local"

# Son samAccountName
"j.dupont"

# Son UPN
"j.dupont@pme.local"
```

Tu connais maintenant le vocabulaire. Au module 2, on attaque la lecture de l'AD avec `Get-AD*`.
