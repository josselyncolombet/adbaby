# Handoff — Plateforme Active Directory pour BTS SIO

## 🎯 Vision du projet

Site web interactif d'apprentissage de **l'administration Active Directory en PowerShell** calibré sur les besoins du **BTS SIO SISR (épreuve E7 — Cybersécurité des services informatiques)**.

**Pourquoi ce site existe** : la lecture des sujets E7 (Métropole 2023 « Ville du Parc », Métropole 2024 « Clinique Martin ») montre que **2 dossiers sur 3** tournent autour d'Active Directory : audit (PingCastle), politique de mots de passe, comptes privilégiés (ProtectedUsers, Kerberos), scripts PowerShell de gestion de comptes. C'est *le* gisement de points le plus important pour cette épreuve, et celui que les étudiants drillent le moins en autonomie faute d'un outil adapté.

**Layout cible** (calqué sur sqlbaby) :
- **Sidebar gauche** : progression par module (📖 cours + exos)
- **Volet centre** : énoncé markdown + **arbre AD visualisé** (domaine / OU / users / groups) + état initial des comptes affectés
- **Volet droit** : éditeur PowerShell (CodeMirror) + bouton « Exécuter » + zone de sortie type terminal + indices

L'utilisateur tape de vraies commandes PowerShell : `Get-ADUser`, `Set-ADAccountPassword`, `New-ADGroup`, `Add-ADGroupMember`, `Search-ADAccount -AccountInactive`, etc. — sur un AD simulé en mémoire (rien ne sort du navigateur, pas de vraie infra Windows requise).

---

## 🛠 Stack technique

| Élément | Choix | Pourquoi |
|---|---|---|
| Framework | **Next.js 16 (App Router) + Turbopack** | Cohérence avec sqlbaby/jsbaby/subnetbaby |
| Langage | **TypeScript** | Sécurité sur le modèle AD et le parser PowerShell |
| Styling | **Tailwind CSS 4** | Cohérence palette terminal (amber warm yellow) |
| Moteur AD | **Simulateur custom JS** (modèle en mémoire + parser PowerShell) | Pas de runtime exotique, contrôle total, exécution instantanée |
| Éditeur PowerShell | **CodeMirror 6** (`@codemirror/lang-powershell` ou highlighter custom) | Coloration verbe-nom et paramètres |
| Diagrammes AD | **Mermaid** (`graph TD`) ou composant treeview custom | Arbre OU lisible |
| Contenu des exos | **JSON** dans `/content/exercices` | Idem sqlbaby |
| États AD initiaux | **JSON snapshots** dans `/content/etats` | Réutilisables entre exos |
| Auth + persistance | **Supabase** (`@supabase/ssr`) | Idem subnetbaby — auth Google + completions DB + admin |
| Hébergement | **Vercel** | Idem subnetbaby (CI/CD via GitHub) |

---

## 📁 Structure de projet recommandée

```
adbaby/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Accueil + sign-in (idem subnetbaby)
│   ├── icon.tsx
│   ├── auth/                       # callback + signout (copie subnetbaby)
│   ├── admin/                      # roster + détail élève (copie subnetbaby)
│   ├── cours/[moduleId]/page.tsx   # Cours par module
│   └── exercices/
│       ├── page.tsx                # Liste/programme avec ProgrammeGrid
│       └── [id]/page.tsx           # Page d'un exo
├── components/
│   ├── hero.tsx
│   ├── sign-in-button.tsx
│   ├── sign-out-button.tsx
│   ├── terminal/
│   │   ├── scanlines.tsx
│   │   └── status-ticker.tsx
│   └── exercise/
│       ├── ExerciseLayout.tsx      # 3-pane workspace
│       ├── StatementPane.tsx       # Énoncé + arbre AD + état initial
│       ├── ProgressionSidebar.tsx
│       ├── ProgrammeGrid.tsx
│       ├── ad-tree.tsx             # "use client" — arbre OU/users/groups
│       ├── ad-account-table.tsx    # "use client" — état des comptes
│       ├── PowerShellEditor.tsx    # "use client" — CodeMirror
│       ├── PowerShellRunner.tsx    # "use client" — execute + output
│       ├── TerminalOutput.tsx      # "use client" — affichage type shell
│       ├── HintsPanel.tsx
│       └── result-feedback.tsx
├── content/
│   ├── etats/                      # Snapshots AD initiaux réutilisables
│   │   ├── pme-vide.json
│   │   ├── clinique-martin.json
│   │   ├── ville-du-parc.json
│   │   ├── lycee-50-postes.json
│   │   └── ...
│   ├── cours/                      # 1 markdown par module
│   │   ├── module-1.md
│   │   └── ...
│   └── exercices/
│       ├── 01-bases-domaine.json
│       ├── ...
├── lib/
│   ├── ad/
│   │   ├── types.ts                # ADDomain, ADUser, ADGroup, etc.
│   │   ├── snapshot.ts             # load / clone / serialize d'un état
│   │   ├── tree.ts                 # navigation OU, distinguishedName helpers
│   │   ├── search.ts               # filtrage type Get-ADUser -Filter
│   │   └── *.test.ts
│   ├── powershell/
│   │   ├── tokenizer.ts            # tokens PowerShell
│   │   ├── parser.ts               # AST minimaliste (commandes, pipelines, params)
│   │   ├── executor.ts             # exécute l'AST contre une snapshot AD
│   │   ├── cmdlets/                # un fichier par cmdlet supportée
│   │   │   ├── get-aduser.ts
│   │   │   ├── new-aduser.ts
│   │   │   ├── set-aduser.ts
│   │   │   ├── get-adgroup.ts
│   │   │   ├── add-adgroupmember.ts
│   │   │   ├── search-adaccount.ts
│   │   │   ├── get-addefaultdomainpasswordpolicy.ts
│   │   │   ├── set-adaccountpassword.ts
│   │   │   ├── unlock-adaccount.ts
│   │   │   ├── disable-adaccount.ts
│   │   │   ├── enable-adaccount.ts
│   │   │   ├── move-adobject.ts
│   │   │   ├── get-gpo.ts
│   │   │   ├── where-object.ts
│   │   │   ├── select-object.ts
│   │   │   ├── format-table.ts
│   │   │   ├── format-list.ts
│   │   │   ├── sort-object.ts
│   │   │   ├── measure-object.ts
│   │   │   └── ...
│   │   ├── format.ts               # rendu type Format-Table par défaut
│   │   └── *.test.ts
│   ├── exercises/
│   │   ├── loader.ts
│   │   ├── modules.ts
│   │   └── validator.ts
│   ├── auth/                       # require-student (idem subnetbaby)
│   ├── progression/                # completions DB (idem subnetbaby)
│   └── supabase/                   # browser/server/service (idem subnetbaby)
├── scripts/
│   ├── check-content.ts
│   ├── check-solutions.ts
│   ├── make-admin.ts
│   └── smoke-test.sh
├── supabase/migrations/
│   └── 0001_init.sql
├── types/
│   ├── exercise.ts
│   └── course.ts
└── package.json
```

---

## ⚠️ Pièges techniques connus

### 1. Modèle AD : le distinguished name

Tout objet AD a un **DN** (`distinguishedName`) qui encode son chemin dans la hiérarchie :

```
CN=jdupont,OU=RH,DC=corp,DC=local
```

Le DN doit rester cohérent quand on déplace un objet (`Move-ADObject`). Stocker le DN comme un champ calculé depuis l'OU parente, pas dur-codé.

### 2. Pipeline PowerShell

Les exos réalistes utilisent énormément `|` :

```powershell
Get-ADUser -Filter * -Properties LastLogonDate |
  Where-Object { $_.LastLogonDate -lt (Get-Date).AddMonths(-3) } |
  Select-Object SamAccountName, LastLogonDate
```

Le parser doit gérer le pipeline et `$_` (objet courant). Les cmdlets sont des fonctions `(input: any[], params: ParsedParams, ctx: ExecutionContext) => any[]` — le `input` vient du pipe précédent.

### 3. Filtres `-Filter`

`-Filter` accepte une mini-DSL : `'Enabled -eq $false'`, `'Name -like "DUPONT*"'`. Implémenter un évaluateur dédié — **ne pas réutiliser** l'évaluateur PowerShell général car la syntaxe `-Filter` est subtilement différente (pas de `$_`, attributs nus).

### 4. Variables `$_` et `$<nom>`

Supporter en **lecture seule** dans les blocs `{ ... }` de Where-Object / ForEach-Object. Pas besoin d'un vrai scoping global (pas d'assignations utilisateur dans les exos prévus).

### 5. Sortie : objets, pas chaînes

Une cmdlet renvoie des **objets** (avec `__type` interne). Le terminal applique `Format-Table` par défaut sur le dernier résultat (sauf si `Format-List` ou `Out-String` explicite). Stocker le typage par défaut par cmdlet (`Get-ADUser` → table avec `Name`, `SamAccountName`, `Enabled` ; `-Properties *` → tous les attributs en `Format-List`).

### 6. État AD persistant intra-exercice mais reset par exo

L'élève peut taper plusieurs commandes successives qui modifient l'état. Au reset (bouton ou nouvel exo), on recharge la snapshot initiale.

### 7. Components client vs serveur

Page `[id]/page.tsx` reste Server Component (charge JSON). Tous les composants interactifs (`PowerShellEditor`, `PowerShellRunner`, `ad-tree`, `TerminalOutput`) ont `"use client"`.

### 8. Différences PowerShell vrai vs simulé — à documenter explicitement

Le simulateur n'implémente **pas** : remoting (`Invoke-Command`), `try/catch/finally`, `function`, `param()`, `$global:`, scope absolu, pipelines parallèles, jobs, modules. À mentionner dans une page « Limites » et orienter vers PowerShell ISE en TP pour ces sujets.

---

## 📦 Dépendances à installer

```bash
npx create-next-app@latest adbaby --typescript --tailwind --app --turbopack
cd adbaby

npm install @supabase/ssr @supabase/supabase-js
npm install @uiw/react-codemirror @codemirror/lang-powershell @codemirror/view
npm install mermaid
npm install react-markdown remark-gfm
npm install lucide-react
npm install -D tsx dotenv
```

Si `@codemirror/lang-powershell` n'existe pas (à vérifier au moment de l'install), fallback : `@codemirror/legacy-modes` avec le mode `powershell`, ou highlighter Lezer custom — ~80 lignes pour les verbes/noms/paramètres.

`.env.local` :
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 📐 Modèle AD (cœur de la simulation)

```typescript
// lib/ad/types.ts

export interface ADDomain {
  name: string;                  // "corp.local"
  netbios: string;               // "CORP"
  forestFunctionalLevel: string; // "Windows2016Forest"
  rootOU: ADOrganizationalUnit;
  passwordPolicy: PasswordPolicy;
  lockoutPolicy: LockoutPolicy;
  finegrainedPolicies: PSO[];
  gpos: GPO[];
  protectedUsersMembers: string[]; // SAMs
}

export interface ADOrganizationalUnit {
  name: string;                  // "RH"
  distinguishedName: string;     // "OU=RH,DC=corp,DC=local"
  parent?: string;
  children: ADOrganizationalUnit[];
  protectedFromAccidentalDeletion: boolean;
}

export interface ADUser {
  objectClass: 'user';
  samAccountName: string;
  cn: string;
  givenName?: string;
  surname?: string;
  displayName?: string;
  userPrincipalName: string;
  distinguishedName: string;     // calculé
  ouPath: string;                // DN de l'OU parente
  enabled: boolean;
  locked: boolean;
  passwordLastSet: string;       // ISO
  passwordNeverExpires: boolean;
  cannotChangePassword: boolean;
  passwordExpired: boolean;
  lastLogonDate?: string;
  badPwdCount: number;
  memberOf: string[];            // DN des groupes
  description?: string;
  emailAddress?: string;
  title?: string;
  department?: string;
  adminCount?: 0 | 1;            // marque les comptes privilégiés
}

export interface ADGroup {
  objectClass: 'group';
  samAccountName: string;
  cn: string;
  distinguishedName: string;
  ouPath: string;
  groupCategory: 'Security' | 'Distribution';
  groupScope: 'DomainLocal' | 'Global' | 'Universal';
  members: string[];             // DN des membres
  description?: string;
  adminCount?: 0 | 1;
}

export interface ADComputer {
  objectClass: 'computer';
  samAccountName: string;        // "PC-01$"
  dnsHostName: string;
  distinguishedName: string;
  ouPath: string;
  enabled: boolean;
  operatingSystem: string;       // "Windows Server 2019" / "Windows 10"
  operatingSystemVersion: string;
  lastLogonDate?: string;
}

export interface PasswordPolicy {
  minPasswordLength: number;
  maxPasswordAge: number;        // jours, 0 = jamais
  minPasswordAge: number;
  passwordHistoryCount: number;
  complexityEnabled: boolean;
  reversibleEncryption: boolean;
}

export interface LockoutPolicy {
  threshold: number;             // 0 = pas de verrouillage
  duration: number;              // minutes
  observationWindow: number;     // minutes
}

export interface PSO {
  name: string;
  precedence: number;
  appliesTo: string[];           // DNs (groupes ou users)
  minPasswordLength: number;
  maxPasswordAge: number;
  // ...
}

export interface GPO {
  displayName: string;
  guid: string;
  linkedTo: string[];            // DN des OUs
  enabled: boolean;
  description?: string;
  // settings JSON minimaliste pour les exos qui en ont besoin
}
```

---

## 📐 Format d'un exercice

```typescript
// types/exercise.ts

export type ExerciseType =
  | 'compare-output'      // tape la commande, on compare la sortie
  | 'compare-state'       // tape la commande, on compare l'état AD résultant
  | 'qcm'                 // QCM théorie (Kerberos, ProtectedUsers, etc.)
  | 'audit'               // analyse un AD pourri, identifie les failles (réponse multi-checks)
  | 'syntax-match';       // match la structure de la commande (apprentissage syntaxe)

export interface Exercise {
  id: string;
  module: number;
  ordre: number;
  titre: string;
  difficulte: 'facile' | 'moyen' | 'difficile';
  concepts: string[];

  contexte: string;              // markdown
  enonce: string;                // ce qu'il faut faire
  indices: string[];             // 3 indices progressifs

  etatInitial?: string;          // slug d'un fichier dans content/etats/
  visualisations?: ('tree' | 'comptes' | 'groupes' | 'gpo' | 'policy')[];

  type: ExerciseType;

  // Solution selon le type
  solution: string | string[];   // commande (ou plusieurs valides) ou clé QCM

  validation:
    | {
        type: 'compare-output';
        ignorerOrdre?: boolean;
        ignorerCasse?: boolean;
        comparerColonnes?: string[]; // si l'élève peut Select-Object différemment
      }
    | {
        type: 'compare-state';
        commandeVerification: string; // "Get-ADUser jdupont -Properties *"
        comparerChamps?: string[];
      }
    | {
        type: 'qcm';
        bonneReponse: string;
        options: { value: string; label: string }[];
      }
    | {
        type: 'audit';
        checks: AuditCheck[];
      }
    | {
        type: 'syntax-match';
        cmdletAttendue: string;
        paramsAttendus: Record<string, string | RegExp>;
      };
}

export type AuditCheck =
  | { kind: 'commande-tapée'; pattern: string | RegExp; description: string }
  | { kind: 'état-attendu'; commandeVerification: string; attendu: unknown };
```

### Exemple concret

```json
{
  "id": "get-aduser-disabled-01",
  "module": 2,
  "ordre": 4,
  "titre": "Lister tous les comptes désactivés",
  "difficulte": "facile",
  "concepts": ["Get-ADUser", "Filtre Enabled", "Bonnes pratiques d'audit"],
  "contexte": "La RSSI te demande de produire la liste des comptes utilisateurs **désactivés** pour faire le ménage. Sur l'annuaire de la clinique Martin, plusieurs comptes ont été créés au fil des stagiaires sans nettoyage.",
  "enonce": "Affiche tous les comptes utilisateurs dont la propriété `Enabled` est à `$false`.",
  "indices": [
    "`Get-ADUser` accepte un paramètre `-Filter` qui prend une expression entre apostrophes.",
    "L'expression peut comparer une propriété : `'Enabled -eq $false'`.",
    "Solution complète : `Get-ADUser -Filter 'Enabled -eq $false'`."
  ],
  "etatInitial": "clinique-martin",
  "visualisations": ["comptes"],
  "type": "compare-output",
  "solution": "Get-ADUser -Filter 'Enabled -eq $false'",
  "validation": {
    "type": "compare-output",
    "ignorerOrdre": true,
    "ignorerCasse": true
  }
}
```

---

## 🧪 Logique de validation (cœur de l'app)

Pseudo-code dans `lib/exercises/validator.ts` :

```typescript
import { loadEtat } from '@/lib/ad/snapshot';
import { execute } from '@/lib/powershell/executor';
import { runAuditChecks } from './audit';

export async function validate(
  exercise: Exercise,
  userInput: string,
): Promise<ValidationResult> {
  switch (exercise.type) {
    case 'compare-output': {
      const etat = loadEtat(exercise.etatInitial!);
      const userOut = execute(userInput, etat).output;
      const refOut = execute(exercise.solution as string, loadEtat(exercise.etatInitial!)).output;
      return compareOutputs(userOut, refOut, exercise.validation);
    }

    case 'compare-state': {
      const etatUser = loadEtat(exercise.etatInitial!);   // copie isolée
      execute(userInput, etatUser);
      const userVerif = execute(exercise.validation.commandeVerification, etatUser).output;

      const etatRef = loadEtat(exercise.etatInitial!);
      execute(exercise.solution as string, etatRef);
      const refVerif = execute(exercise.validation.commandeVerification, etatRef).output;

      return compareOutputs(userVerif, refVerif, { ignorerOrdre: true });
    }

    case 'qcm':
      return userInput.trim() === exercise.validation.bonneReponse
        ? { ok: true }
        : { ok: false, attendu: exercise.validation.bonneReponse };

    case 'audit':
      return runAuditChecks(userInput, exercise);

    case 'syntax-match':
      return matchSyntax(userInput, exercise.validation);
  }
}
```

**Important** : toujours **cloner la snapshot AD** avant exécution pour isoler la tentative de l'élève (sinon ses commandes destructives polluent les essais suivants).

---

## 📚 Progression pédagogique — 8 modules · 120+ exercices

### Module 1 — Bases d'Active Directory *(théorie + qcm, 12 exos)*

Concepts : domaine vs forêt, contrôleur de domaine, OU vs CN, types d'objets, distinguished name, schéma, niveau fonctionnel.

1. Définition d'un domaine AD
2. Différence domaine / forêt
3. Rôle d'un contrôleur de domaine
4. Pourquoi 2 DC minimum
5. Lire un distinguished name
6. OU vs CN — différence
7. Types d'objets standards
8. Schéma AD (notion)
9. Niveau fonctionnel — impact pratique
10. Trust (notion)
11. Site AD (notion réseau)
12. Catalogue global (notion)

### Module 2 — Lire l'AD (Get-AD*) *(15 exos, cœur du programme)*

Concepts : `Get-ADUser`, `Get-ADGroup`, `Get-ADComputer`, `-Filter`, `-Identity`, `-Properties`, pipeline, `Where-Object`, `Select-Object`, `Sort-Object`, `Format-Table`.

13. `Get-ADUser <samaccount>` — un seul utilisateur
14. `Get-ADUser -Filter '*'` — tous
15. `-Filter 'Enabled -eq $false'` — comptes désactivés
16. `-Filter 'Name -like "DUPONT*"'` — pattern
17. `-Properties *` — tous les attributs
18. `-Properties LastLogonDate, Department` — sélection
19. `-SearchBase "OU=RH,DC=corp,DC=local"` — limiter à une OU
20. Pipeline `| Where-Object { $_.PasswordNeverExpires -eq $true }`
21. `| Select-Object SamAccountName, Department`
22. `| Sort-Object LastLogonDate -Descending`
23. `Get-ADGroup -Filter *` puis `Get-ADGroupMember`
24. `Get-ADComputer -Filter '*'` + filtre par OS obsolète
25. Combiner SearchBase + Filter + Properties (cas réaliste)
26. Compter avec `Measure-Object`
27. Synthèse : produire un tableau « comptes inactifs depuis 6 mois » exploitable par RSSI

### Module 3 — Modifier l'AD (New/Set/Remove-AD*) *(15 exos)*

28. `New-ADUser -Name "..." -SamAccountName "..." -Path "OU=..."`
29. `New-ADUser` avec mot de passe initial (`-AccountPassword`)
30. `New-ADUser -Enabled $true` à la création
31. `Set-ADUser <id> -Department "RH"`
32. `Set-ADUser` plusieurs attributs en une commande
33. `Set-ADUser -Replace @{ ... }` pour attributs multivalués
34. `Disable-ADAccount` / `Enable-ADAccount`
35. `Unlock-ADAccount`
36. `Set-ADAccountPassword -NewPassword (ConvertTo-SecureString ...) -Reset`
37. Forcer changement au prochain login (`-ChangePasswordAtLogon`)
38. `Move-ADObject` — déplacer un user d'OU
39. `Remove-ADUser` — suppression simple
40. Suppression d'OU avec `-Recursive` (et contournement de la protection)
41. `Rename-ADObject`
42. Synthèse : créer un compte conforme à la convention de nommage de l'entreprise

### Module 4 — Groupes et appartenances *(15 exos)*

Concepts : types (Security/Distribution), portées (Domain Local / Global / Universal), `New-ADGroup`, `Add-ADGroupMember`, `Get-ADGroupMember -Recursive`, groupes privilégiés.

43. `New-ADGroup -GroupScope Global -GroupCategory Security`
44. Différence Security vs Distribution (qcm)
45. Différence Domain Local / Global / Universal (qcm + cas)
46. `Add-ADGroupMember -Identity "..." -Members "..."`
47. `Add-ADGroupMember` avec plusieurs membres en une commande
48. `Remove-ADGroupMember`
49. `Get-ADGroupMember "..." -Recursive`
50. Groupes imbriqués — découvrir un user via un groupe parent
51. Groupes privilégiés intégrés (Domain Admins, Enterprise Admins, Schema Admins, ...)
52. Stratégie AGDLP (qcm + application)
53. Lister tous les membres de Domain Admins
54. Détecter les groupes vides (à nettoyer)
55. Détecter les users membres de plus de N groupes
56. Synthèse : provisionner un nouveau service avec OU + groupe + 5 users + droits

### Module 5 — Sécurité des mots de passe *(15 exos — récurrent à E7)*

57. `Get-ADDefaultDomainPasswordPolicy`
58. Lire `MinPasswordLength`, `MaxPasswordAge`
59. Recommandations ANSSI 2022 (qcm)
60. Pourquoi *ne plus* expirer les mots de passe (NIST + ANSSI)
61. Détecter comptes `PasswordNeverExpires -eq $true`
62. Détecter comptes `PasswordNotRequired -eq $true`
63. Détecter comptes `PasswordLastSet < 1 an`
64. PSO (Fine-Grained Password Policy) — concept (qcm)
65. `Get-ADFineGrainedPasswordPolicy`
66. Stratégie de verrouillage (`AccountLockout*`)
67. Comptes verrouillés `Search-ADAccount -LockedOut`
68. Forcer renouvellement pour comptes à privilèges
69. Stratégie de coffre-fort de mots de passe (qcm + outil)
70. MFA (qcm + cas E7)
71. Synthèse : auditer la conformité de la politique mots de passe à l'ANSSI

### Module 6 — Comptes privilégiés et durcissement *(15 exos — cœur E7)*

Concepts : ProtectedUsers, AdminSDHolder, adminCount, comptes services (kerberoasting), Tier model, désactivation NTLM.

72. ProtectedUsers — qu'est-ce que c'est (qcm)
73. Effets de l'appartenance à ProtectedUsers (qcm)
74. Lister les membres de ProtectedUsers
75. Ajouter un compte admin à ProtectedUsers
76. Pourquoi laisser au moins un admin hors ProtectedUsers
77. AdminSDHolder — concept (qcm)
78. Repérer les comptes avec `adminCount=1`
79. Comptes de service — risque kerberoasting (qcm)
80. SPN — détecter les comptes utilisateurs avec un SPN défini
81. Tier model 0 / 1 / 2 (qcm)
82. Désactiver NTLM — pourquoi (qcm)
83. Comptes inactifs > 6 mois — détection + désactivation
84. Comptes "service" sans `LastLogonDate` récent
85. Délégation Kerberos non contrainte — risque (qcm)
86. Synthèse : durcir un AD selon les recommandations ANSSI

### Module 7 — GPO et stratégies *(13 exos)*

87. `Get-GPO -All`
88. Hiérarchie LSDOU (qcm + ordre d'application)
89. `Get-GPO -Name "..."` — détails
90. Lien GPO ↔ OU
91. Bloquer l'héritage (qcm)
92. GPO de sécurité courantes (mots de passe, SMBv1, désactivation autorun, AppLocker, ...)
93. AppLocker / WDAC (qcm)
94. GPO Préférences (qcm)
95. Détecter une GPO non liée
96. Détecter une GPO désactivée mais liée
97. Préférence vs Stratégie (qcm)
98. Backup/Restore d'une GPO (`Backup-GPO`, `Restore-GPO`) — concept
99. Synthèse : auditer les GPO d'un domaine

### Module 8 — Audit et incident *(13 exos)*

100. `Search-ADAccount -AccountInactive -TimeSpan 90.00:00:00`
101. `Search-ADAccount -PasswordExpired`
102. `Search-ADAccount -PasswordNeverExpires`
103. `Search-ADAccount -LockedOut`
104. Lecture rapport PingCastle — score global (qcm)
105. PingCastle : Anomalies vs Bien périmé vs Comptes privilégiés (qcm)
106. WEF (Windows Event Forwarding) — concept (qcm)
107. WEF push vs pull (qcm)
108. Centraliser les journaux vers un SIEM (qcm)
109. IoC d'un rançongiciel sur AD — détecter (cas pratique)
110. Réponse à incident : isoler un compte compromis
111. Réponse à incident : forcer rotation des mots de passe admin
112. Synthèse type E7 : analyse de rapport PingCastle + recommandations

### Bonus / niveau examen

- Cas complet type E7 (clinique / mairie / lycée) : 8-10 questions enchaînées dans un seul scénario AD pourri à auditer + corriger
- Notions Kerberos détaillées (TGT, TGS, KDC, AS-REQ, AS-REP, Pass-the-Ticket)
- LAPS (Local Administrator Password Solution) — concept
- Microsoft Defender for Identity (notion)

---

## 🗄 Snapshots AD à créer

Cohérents avec les sujets BTS officiels lus dans `reference/annales/sisr/` :

1. **`pme-vide`** — domaine fraîchement installé, 1 admin, 0 utilisateur. Pour les exos « créer son premier user ».
2. **`clinique-martin`** — inspiré E7 Métropole 2024. ~80 comptes, 4 OU (Médical, Administratif, Logistique, Direction), Active Directory niveau 2016, machines Windows Server 2003 SP2 + 2019 + Windows 10 (mix 1607 → 21H2), politique mots de passe par défaut, comptes privilégiés mal séparés.
3. **`ville-du-parc`** — inspiré E7 Métropole 2023. ~1300 comptes (échantillon de 60 pour les exos), 4 pôles DSI, AD avec mots de passe sans expiration, comptes inactifs nombreux.
4. **`lycee-50-postes`** — environnement scolaire, OU profs/élèves/admin, GPO Wi-Fi invités, postes salle informatique.
5. **`pme-rancongiciel`** — un AD post-incident pour les exos d'audit / réponse : comptes verrouillés en masse, MdP de service tous identiques, journaux d'événements anormaux.

Chaque snapshot stocké en JSON, validé par `scripts/check-content.ts` (intégrité du DN, références groupes/users cohérentes, OU parent existante).

---

## 🚀 Roadmap suggérée

### Phase 1 — MVP (1 cmdlet qui marche de bout en bout)
- [ ] Setup Next.js 16 + Tailwind 4 + TypeScript
- [ ] Modèle AD minimal (`ADDomain`, `ADUser`)
- [ ] Snapshot loader + clone
- [ ] Tokenizer + parser PowerShell pour `Get-ADUser <id>` et `Get-ADUser -Filter '...'`
- [ ] Cmdlet `Get-ADUser` + `Format-Table` par défaut
- [ ] Composant `PowerShellEditor` (CodeMirror)
- [ ] Composant `TerminalOutput`
- [ ] 1 exo hardcodé (« liste un user ») validable de bout en bout

### Phase 2 — Élargir le vocabulaire PowerShell
- [ ] Pipeline `|`
- [ ] Cmdlets : `Get-ADGroup`, `Get-ADGroupMember`, `Get-ADComputer`
- [ ] Cmdlets pipeline : `Where-Object`, `Select-Object`, `Sort-Object`, `Measure-Object`, `Format-List`
- [ ] Variables `$_` et propriétés `$_.X`
- [ ] Comparaison `-eq -ne -lt -gt -le -ge -like -notlike -match -in`
- [ ] Logiques `-and -or -not`

### Phase 3 — Génération depuis JSON
- [ ] Loader d'exos
- [ ] `generateStaticParams`
- [ ] `scripts/check-content.ts` (cohérence types + validation snapshots)
- [ ] Modules 1 et 2 (théorie + Get-*) — ~27 exos

### Phase 4 — Modification AD
- [ ] Cmdlets : `New-ADUser`, `Set-ADUser`, `Remove-ADUser`, `Disable-ADAccount`, `Enable-ADAccount`, `Unlock-ADAccount`, `Set-ADAccountPassword`, `Move-ADObject`
- [ ] Validator `compare-state`
- [ ] Module 3

### Phase 5 — Groupes et politique
- [ ] Cmdlets : `New-ADGroup`, `Add-ADGroupMember`, `Remove-ADGroupMember`, `Get-ADGroupMember -Recursive`
- [ ] Cmdlets : `Get-ADDefaultDomainPasswordPolicy`, `Get-ADFineGrainedPasswordPolicy`
- [ ] `Search-ADAccount -*`
- [ ] Modules 4 et 5

### Phase 6 — Sécurité avancée
- [ ] ProtectedUsers (Get/Add)
- [ ] adminCount, AdminSDHolder
- [ ] `Get-GPO`
- [ ] Modules 6 et 7

### Phase 7 — Auth + admin (clone subnetbaby)
- [ ] Migration Supabase (students, completions, attempts)
- [ ] Sign-in Google + callback
- [ ] Page `/admin` + `/admin/[id]`
- [ ] Server actions block/unblock/reset

### Phase 8 — Cas de synthèse + polish
- [ ] Snapshots E7 (clinique-martin, ville-du-parc, lycee, pme-rancongiciel)
- [ ] Module 8 (audit + incident)
- [ ] Cas complet type E7 (8-10 questions enchaînées)
- [ ] Mode mobile (onglets)
- [ ] Reset AD par exo (bouton)

---

## ✅ Critères de succès

- Un élève peut faire un exercice complet sans installer un domaine Windows ni utiliser une VM
- Les commandes PowerShell **réalistes** sont acceptées (avec abréviations courantes : `gADu` = `Get-ADUser`, oui à supporter)
- Les sorties ressemblent **suffisamment** à un vrai shell pour que l'élève reconnaisse le format en stage
- Les feedbacks expliquent **précisément** ce qui ne va pas (commande absente, mauvais paramètre, mauvaise valeur, état AD divergent sur l'attribut X)
- Tout le programme E7 SISR « Active Directory » + « scripts PowerShell » est couvert
- Performance : chaque exécution `< 100ms` (modèle in-memory, pas d'attente)

---

## 📝 Notes finales

- **Localiser tout en français** (interface, messages d'erreur, énoncés). Les **prompts PowerShell restent en anglais** (réalisme : `PS C:\>` et messages d'erreur PowerShell originaux).
- **Erreurs PowerShell pédagogiques** : reproduire les messages réels (`Get-ADUser : Cannot find an object with identity: 'X' under: 'DC=corp,DC=local'.`, `The term 'X' is not recognized as the name of a cmdlet`, `A parameter cannot be found that matches parameter name 'Y'`).
- **Cohérence avec sqlbaby/jsbaby/subnetbaby** : même structure de routes, même `auth/`, même format `content/`, même `progression/` DB Supabase, même palette warm yellow.
- **Limites assumées** à documenter dans une page dédiée : pas de remoting, pas de `try/catch`, pas de modules tiers, pas de scoping global complet.
- **Tests** : `tsx --test` obligatoire sur `lib/ad/*` et `lib/powershell/parser.ts` + un test par cmdlet.
- **Calibration sur les annales E7** : avant d'écrire le contenu d'un module, relire les questions correspondantes dans les sujets `2022/2023/2024/2025` de `reference/annales/sisr/` pour s'assurer que les exos couvrent **les concepts qui tombent**, pas une vision théorique du programme.
- **Réutiliser le code de subnetbaby** : auth, sidebar, progression, admin — tout cela est identique. On copie les fichiers tels quels et on adapte uniquement le métier (exo, cours, sandbox).

Bonne continuation 🚀
