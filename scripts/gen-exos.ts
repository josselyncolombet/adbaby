// Génère 120 exos JSON dans content/exercices/
// 8 modules × 15 exos (5 concepts × 3 difficultés)
// Calibré sur les annales E7 (Ville-du-Parc 2023, Clinique Martin 2024).

import fs from "node:fs";
import path from "node:path";

interface ExoDef {
  id: string;
  module: number;
  ordre: number;
  titre: string;
  difficulte: "facile" | "moyen" | "difficile";
  concepts: string[];
  contexte: string;
  enonce: string;
  indices: string[];
  type:
    | "compare-output"
    | "compare-state"
    | "qcm"
    | "audit"
    | "syntax-match";
  donnees?: Record<string, unknown>;
  solution: Record<string, unknown>;
  validation?: { tolerance?: "stricte" | "normaliser"; ordreImporte?: boolean };
}

const exos: ExoDef[] = [];

// =====================================================================
// MODULE 1 — Bases AD : domaine, OU, DN, samAccountName, ObjectClass
// =====================================================================

// C1 — Domaine / forêt / DC
exos.push({
  id: "m1-domaine-01", module: 1, ordre: 1,
  titre: "Domaine, forêt, contrôleur de domaine",
  difficulte: "facile", concepts: ["Domaine", "Forêt", "DC"],
  contexte: "On te confie l'AD d'une PME. Le DNS du domaine est `pme.local`.",
  enonce: "Quel terme désigne le serveur qui héberge la base AD et répond aux requêtes LDAP / Kerberos ?",
  indices: [
    "Le domaine est le périmètre logique. Il faut un serveur pour le porter.",
    "Ce serveur s'appelle le 'contrôleur de domaine'.",
    "Réponse : DC."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "dc", label: "Le contrôleur de domaine (DC)" },
    { value: "ad", label: "L'objet domaine" },
    { value: "fs", label: "Le serveur de fichiers" },
    { value: "dns", label: "Le serveur DNS" },
  ]},
  solution: { type: "qcm", bonneReponse: "dc" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m1-domaine-02", module: 1, ordre: 2,
  titre: "Réplication entre DCs",
  difficulte: "moyen", concepts: ["Réplication", "Multi-DC"],
  contexte: "L'entreprise a deux DCs : `DC01` et `DC02`. Tu crées un compte sur `DC01`.",
  enonce: "Que se passe-t-il pour ce compte du côté de `DC02` ?",
  indices: [
    "Les DCs d'un même domaine se synchronisent automatiquement.",
    "La réplication est multi-maître côté AD.",
    "Le compte est répliqué sans action de ta part."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "rep", label: "Il est répliqué automatiquement par AD" },
    { value: "manuel", label: "Tu dois pousser la réplication manuellement" },
    { value: "rien", label: "Il n'existe que sur DC01" },
    { value: "import", label: "Il faut l'importer via Csv" },
  ]},
  solution: { type: "qcm", bonneReponse: "rep" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m1-domaine-03", module: 1, ordre: 3,
  titre: "Forêt vs domaine : où placer Enterprise Admins ?",
  difficulte: "difficile", concepts: ["Forêt", "Enterprise Admins"],
  contexte: "Tu dois expliquer à ton stagiaire la différence entre `Domain Admins` et `Enterprise Admins`.",
  enonce: "Quel est le périmètre du groupe `Enterprise Admins` ?",
  indices: [
    "Domain Admins = un domaine.",
    "Enterprise Admins = au-dessus du domaine.",
    "Réponse : la forêt entière."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "foret", label: "Toute la forêt (tous les domaines de la forêt)" },
    { value: "domaine", label: "Le domaine racine uniquement" },
    { value: "ou", label: "Une OU spécifique" },
    { value: "site", label: "Un site AD" },
  ]},
  solution: { type: "qcm", bonneReponse: "foret" },
  validation: { tolerance: "stricte" },
});

// C2 — Distinguished Name
exos.push({
  id: "m1-dn-01", module: 1, ordre: 4,
  titre: "Lire un DN",
  difficulte: "facile", concepts: ["DN", "CN", "OU", "DC"],
  contexte: "Le DN d'un compte est : `CN=Pierre Martin,OU=Compta,DC=pme,DC=local`.",
  enonce: "Dans quelle OU est placé ce compte ?",
  indices: [
    "Le DN se lit de gauche (objet) à droite (racine).",
    "L'OU directement après le CN est l'OU parente.",
    "Réponse : OU=Compta."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "compta", label: "OU=Compta" },
    { value: "direction", label: "OU=Direction" },
    { value: "dc-pme", label: "Directement sous DC=pme" },
    { value: "users", label: "CN=Users" },
  ]},
  solution: { type: "qcm", bonneReponse: "compta" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m1-dn-02", module: 1, ordre: 5,
  titre: "Construire un DN à partir d'un nom",
  difficulte: "moyen", concepts: ["DN", "construction"],
  contexte: "Tu veux créer un compte `Camille Rousseau` dans l'OU `Commercial` du domaine `pme.local`.",
  enonce: "Quel est le DN attendu pour ce compte ?",
  indices: [
    "Format : CN=<nom complet>,OU=<ou>,DC=<comp1>,DC=<comp2>.",
    "Le nom complet est `Camille Rousseau`, l'OU est `Commercial`.",
    "Le domaine `pme.local` se traduit en `DC=pme,DC=local`."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "ok", label: "CN=Camille Rousseau,OU=Commercial,DC=pme,DC=local" },
    { value: "ko1", label: "CN=Camille Rousseau,DC=pme,DC=local,OU=Commercial" },
    { value: "ko2", label: "OU=Commercial,CN=Camille Rousseau,DC=pme,DC=local" },
    { value: "ko3", label: "DN=Camille Rousseau,Commercial,pme.local" },
  ]},
  solution: { type: "qcm", bonneReponse: "ok" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m1-dn-03", module: 1, ordre: 6,
  titre: "DN d'un domaine multi-niveaux",
  difficulte: "difficile", concepts: ["DN", "DC", "sous-domaine"],
  contexte: "Le domaine est `it.entreprise.lan`. Tu places un compte dans `OU=Equipe`.",
  enonce: "Quel DN obtiens-tu pour le compte `Lucas Faure` ?",
  indices: [
    "Chaque morceau du nom DNS devient un DC.",
    "`it.entreprise.lan` donne `DC=it,DC=entreprise,DC=lan`.",
    "On préfixe avec le CN puis l'OU."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "ok", label: "CN=Lucas Faure,OU=Equipe,DC=it,DC=entreprise,DC=lan" },
    { value: "ko1", label: "CN=Lucas Faure,OU=Equipe,DC=it.entreprise.lan" },
    { value: "ko2", label: "CN=Lucas Faure,OU=Equipe,DC=lan,DC=entreprise,DC=it" },
    { value: "ko3", label: "OU=Equipe,CN=Lucas Faure,DC=entreprise.lan,DC=it" },
  ]},
  solution: { type: "qcm", bonneReponse: "ok" },
  validation: { tolerance: "stricte" },
});

// C3 — OU
exos.push({
  id: "m1-ou-01", module: 1, ordre: 7,
  titre: "Différence OU vs Groupe",
  difficulte: "facile", concepts: ["OU", "Groupe"],
  contexte: "On te demande la différence entre une OU et un groupe AD.",
  enonce: "Laquelle de ces phrases décrit correctement leur rôle ?",
  indices: [
    "OU = conteneur dans l'arbre, sert à appliquer des GPO.",
    "Groupe = collection d'appartenances pour des permissions.",
    "Un compte est dans 1 OU mais peut être dans plusieurs groupes."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "ok", label: "L'OU organise l'arbre AD et porte des GPO ; le groupe sert aux permissions." },
    { value: "ko1", label: "L'OU sert aux permissions ; le groupe organise l'arbre." },
    { value: "ko2", label: "OU et groupes sont équivalents." },
    { value: "ko3", label: "Une OU est un compte machine spécial." },
  ]},
  solution: { type: "qcm", bonneReponse: "ok" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m1-ou-02", module: 1, ordre: 8,
  titre: "Combien d'OU parentes ?",
  difficulte: "moyen", concepts: ["OU", "DN"],
  contexte: "Le DN suivant : `CN=stage.compta,OU=Stagiaires,OU=Compta,DC=pme,DC=local`.",
  enonce: "Combien d'OU parentes ce compte a-t-il ?",
  indices: [
    "Compte chaque OU=… présent dans le DN.",
    "Le compte est dans Stagiaires, qui est dans Compta.",
    "Réponse : 2."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "0", label: "0 (le compte est sous le domaine)" },
  ]},
  solution: { type: "qcm", bonneReponse: "2" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m1-ou-03", module: 1, ordre: 9,
  titre: "Pourquoi imbriquer les OU",
  difficulte: "difficile", concepts: ["OU", "GPO", "héritage"],
  contexte: "Ton chef veut séparer les stagiaires Compta des comptes Compta titulaires, pour leur appliquer une GPO plus restrictive.",
  enonce: "Quelle est la solution la plus propre ?",
  indices: [
    "Les GPO se lient à une OU et héritent vers les sous-OU.",
    "Une sous-OU 'Stagiaires' dans 'Compta' permet une GPO supplémentaire.",
    "Pas besoin de groupe pour ça."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "ok", label: "Créer une sous-OU `OU=Stagiaires,OU=Compta,…` et y lier la GPO restrictive." },
    { value: "ko1", label: "Créer un groupe `G_Stagiaires` et y lier la GPO." },
    { value: "ko2", label: "Renommer les comptes stagiaires avec un préfixe `S_`." },
    { value: "ko3", label: "Mettre un attribut `Description=stagiaire` sur les comptes." },
  ]},
  solution: { type: "qcm", bonneReponse: "ok" },
  validation: { tolerance: "stricte" },
});

// C4 — samAccountName / UPN
exos.push({
  id: "m1-sam-01", module: 1, ordre: 10,
  titre: "samAccountName ou UPN ?",
  difficulte: "facile", concepts: ["samAccountName", "UPN"],
  contexte: "Tu vois ces deux identifiants pour un compte : `j.dupont` et `j.dupont@pme.local`.",
  enonce: "Lequel est le samAccountName ?",
  indices: [
    "samAccountName = identifiant style NetBIOS.",
    "UPN = identifiant style mail (avec un @).",
    "Réponse : `j.dupont`."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "sam", label: "j.dupont" },
    { value: "upn", label: "j.dupont@pme.local" },
    { value: "ni", label: "Aucun des deux, c'est un alias" },
    { value: "deux", label: "Les deux sont des UPN" },
  ]},
  solution: { type: "qcm", bonneReponse: "sam" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m1-sam-02", module: 1, ordre: 11,
  titre: "Limite du samAccountName",
  difficulte: "moyen", concepts: ["samAccountName", "longueur"],
  contexte: "Tu veux créer un samAccountName `christophe.de-la-fontaine`.",
  enonce: "Combien de caractères au maximum un samAccountName peut-il contenir ?",
  indices: [
    "C'est un identifiant hérité de NetBIOS.",
    "Il y a une vieille limite historique.",
    "Réponse : 20 caractères."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "20", label: "20" },
    { value: "64", label: "64" },
    { value: "256", label: "256" },
    { value: "illim", label: "Illimité" },
  ]},
  solution: { type: "qcm", bonneReponse: "20" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m1-sam-03", module: 1, ordre: 12,
  titre: "Construire UPN cohérent",
  difficulte: "difficile", concepts: ["UPN", "Convention nommage"],
  contexte: "Convention de la PME : UPN = `prénom.nom@<domaine>`. Tu crées un compte pour `Émilie Bertrand` dans `pme.local`.",
  enonce: "Quel UPN est cohérent avec la convention (sans accents) ?",
  indices: [
    "Format : prenom.nom@domaine.",
    "Sans accents : 'Émilie' → 'emilie', 'Bertrand' → 'bertrand'.",
    "Réponse : `emilie.bertrand@pme.local`."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "ok", label: "emilie.bertrand@pme.local" },
    { value: "ko1", label: "Émilie.Bertrand@pme.local" },
    { value: "ko2", label: "e.bertrand@PME" },
    { value: "ko3", label: "bertrand.emilie@pme.local" },
  ]},
  solution: { type: "qcm", bonneReponse: "ok" },
  validation: { tolerance: "stricte" },
});

// C5 — ObjectClass
exos.push({
  id: "m1-class-01", module: 1, ordre: 13,
  titre: "Lire un ObjectClass",
  difficulte: "facile", concepts: ["ObjectClass"],
  contexte: "Tu lances `Get-ADObject` et tu vois `ObjectClass : computer`.",
  enonce: "À quoi correspond cet objet ?",
  indices: [
    "computer = poste/serveur.",
    "user = compte humain ou service.",
    "group = groupe."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "comp", label: "Un poste ou serveur joint au domaine" },
    { value: "user", label: "Un compte utilisateur" },
    { value: "grp", label: "Un groupe AD" },
    { value: "ou", label: "Une unité d'organisation" },
  ]},
  solution: { type: "qcm", bonneReponse: "comp" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m1-class-02", module: 1, ordre: 14,
  titre: "Compte de service vs compte humain",
  difficulte: "moyen", concepts: ["ObjectClass", "Comptes service"],
  contexte: "Un compte `svc.sql` est utilisé par SQL Server pour démarrer son service.",
  enonce: "Quel ObjectClass affiche-t-il dans AD ?",
  indices: [
    "Un compte de service est techniquement un user.",
    "Sa nature 'service' n'est qu'une convention.",
    "Sauf cas gMSA (managed service account), c'est `user`."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "user", label: "user" },
    { value: "svc", label: "service" },
    { value: "comp", label: "computer" },
    { value: "msa", label: "msDS-ManagedServiceAccount par défaut" },
  ]},
  solution: { type: "qcm", bonneReponse: "user" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m1-class-03", module: 1, ordre: 15,
  titre: "Filtrer par ObjectClass dans la pratique",
  difficulte: "difficile", concepts: ["ObjectClass", "Filter"],
  contexte: "Tu prépares la commande `Get-ADObject` pour ne ramener que les groupes.",
  enonce: "Quelle valeur d'ObjectClass utilises-tu dans ton -Filter ?",
  indices: [
    "Le mot-clé exact côté schéma AD pour un groupe.",
    "C'est tout en minuscules.",
    "Réponse : `group`."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "group", label: "group" },
    { value: "Group", label: "Group" },
    { value: "ADGroup", label: "ADGroup" },
    { value: "groupOfNames", label: "groupOfNames" },
  ]},
  solution: { type: "qcm", bonneReponse: "group" },
  validation: { tolerance: "stricte" },
});

// =====================================================================
// MODULE 2 — Lire l'AD avec Get-AD* et le pipeline
// =====================================================================
const SNAP = "pme-vide";

// C1 — Get-ADUser -Identity
exos.push({
  id: "m2-identity-01", module: 2, ordre: 1,
  titre: "Lire un compte par samAccountName",
  difficulte: "facile", concepts: ["Get-ADUser", "-Identity"],
  contexte: "La directrice s'appelle Julie Dupont, son samAccountName est `j.dupont`.",
  enonce: "Affiche les informations du compte de Julie Dupont avec `-Identity`.",
  indices: [
    "Cmdlet : `Get-ADUser`.",
    "Paramètre : `-Identity <samAccountName>`.",
    "Solution : `Get-ADUser -Identity j.dupont`."
  ],
  type: "compare-output",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-output", sams: ["j.dupont"] },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m2-identity-02", module: 2, ordre: 2,
  titre: "Lire un compte avec attributs étendus",
  difficulte: "moyen", concepts: ["Get-ADUser", "-Properties"],
  contexte: "Tu veux la date de dernière connexion de `s.lefevre`. Par défaut elle n'est pas remontée.",
  enonce: "Affiche le compte de `s.lefevre` en demandant `LastLogonDate` via `-Properties`.",
  indices: [
    "Format : `Get-ADUser -Identity <sam> -Properties <attr>`.",
    "Le résultat doit contenir LastLogonDate.",
    "Solution : `Get-ADUser -Identity s.lefevre -Properties LastLogonDate`."
  ],
  type: "compare-output",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-output", sams: ["s.lefevre"] },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m2-identity-03", module: 2, ordre: 3,
  titre: "Lire les groupes d'un compte",
  difficulte: "difficile", concepts: ["Get-ADUser", "MemberOf"],
  contexte: "Tu veux voir à quels groupes appartient `a.dupont` (compte admin de Julie).",
  enonce: "Récupère le compte `a.dupont` avec l'attribut `MemberOf`.",
  indices: [
    "MemberOf n'est pas dans les attributs par défaut.",
    "Il faut le demander via `-Properties MemberOf`.",
    "`Get-ADUser -Identity a.dupont -Properties MemberOf`"
  ],
  type: "compare-output",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-output", sams: ["a.dupont"] },
  validation: { tolerance: "stricte" },
});

// C2 — Get-ADUser -Filter
exos.push({
  id: "m2-filter-01", module: 2, ordre: 4,
  titre: "Lister tous les comptes",
  difficulte: "facile", concepts: ["Get-ADUser", "-Filter *"],
  contexte: "Tu veux la liste exhaustive des comptes du domaine.",
  enonce: "Tape la commande qui ramène TOUS les comptes utilisateurs du domaine.",
  indices: [
    "Avec `-Filter`, on peut passer une expression `{...}` ou `*`.",
    "Pour 'tous', l'idiome est `-Filter *`.",
    "Solution : `Get-ADUser -Filter *`."
  ],
  type: "compare-output",
  donnees: { snapshot: SNAP },
  solution: {
    type: "compare-output",
    sams: ["j.dupont","p.martin","s.lefevre","m.bernard","c.rousseau","l.dubois","a.dupont","stage.compta","svc.sql","n.legrand"]
  },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m2-filter-02", module: 2, ordre: 5,
  titre: "Filtrer les comptes désactivés",
  difficulte: "moyen", concepts: ["Get-ADUser", "Filter Enabled"],
  contexte: "Avant de faire le ménage, tu veux la liste des comptes désactivés.",
  enonce: "Liste les comptes où `Enabled` vaut `$false`.",
  indices: [
    "`-Filter { Enabled -eq $false }`.",
    "Note : pas de guillemets autour de $false.",
    "Solution : `Get-ADUser -Filter { Enabled -eq $false }`."
  ],
  type: "compare-output",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-output", sams: ["m.bernard","n.legrand"] },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m2-filter-03", module: 2, ordre: 6,
  titre: "Filtrer par département",
  difficulte: "difficile", concepts: ["Get-ADUser", "Filter Department"],
  contexte: "Le service Compta a besoin d'un export de ses comptes.",
  enonce: "Liste les comptes du département `Compta`.",
  indices: [
    "`-Filter { Department -eq \"Compta\" }`.",
    "Le service est exactement 'Compta' (casse non sensible).",
    "Solution : `Get-ADUser -Filter { Department -eq \"Compta\" }`."
  ],
  type: "compare-output",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-output", sams: ["p.martin","stage.compta"] },
  validation: { tolerance: "stricte" },
});

// C3 — Get-ADGroup / Get-ADComputer
exos.push({
  id: "m2-types-01", module: 2, ordre: 7,
  titre: "Lister tous les groupes",
  difficulte: "facile", concepts: ["Get-ADGroup", "-Filter *"],
  contexte: "Tu prépares un audit des groupes existants.",
  enonce: "Liste tous les groupes du domaine.",
  indices: [
    "Cmdlet : `Get-ADGroup`.",
    "Filter : `*`.",
    "Solution : `Get-ADGroup -Filter *`."
  ],
  type: "compare-output",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-output", outputContains: ["Domain Admins","Enterprise Admins","Protected Users","G_Compta"] },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m2-types-02", module: 2, ordre: 8,
  titre: "Lister les postes du domaine",
  difficulte: "moyen", concepts: ["Get-ADComputer"],
  contexte: "Tu veux savoir quels postes sont joints au domaine.",
  enonce: "Liste tous les comptes ordinateur.",
  indices: [
    "Cmdlet : `Get-ADComputer`.",
    "Filter : `*`.",
    "Solution : `Get-ADComputer -Filter *`."
  ],
  type: "compare-output",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-output", outputContains: ["PC-COMPTA-01","SRV-FILE-01"] },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m2-types-03", module: 2, ordre: 9,
  titre: "Lister les OU du domaine",
  difficulte: "difficile", concepts: ["Get-ADOrganizationalUnit"],
  contexte: "Tu veux cartographier la structure organisationnelle de l'AD.",
  enonce: "Liste toutes les OU du domaine.",
  indices: [
    "Cmdlet : `Get-ADOrganizationalUnit`.",
    "Tu dois préciser un -Filter.",
    "Solution : `Get-ADOrganizationalUnit -Filter *`."
  ],
  type: "compare-output",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-output", outputContains: ["Direction","Compta","Commercial","Production"] },
  validation: { tolerance: "stricte" },
});

// C4 — Pipeline / Where-Object
exos.push({
  id: "m2-pipe-01", module: 2, ordre: 10,
  titre: "Filtrer côté client avec Where-Object",
  difficulte: "facile", concepts: ["Pipeline", "Where-Object"],
  contexte: "Tu veux les comptes verrouillés. Le -Filter LDAP ne supporte pas `LockedOut` directement.",
  enonce: "Récupère tous les comptes puis filtre côté client ceux dont `LockedOut` est `$true`.",
  indices: [
    "Pipe : `Get-ADUser -Filter * | Where-Object { ... }`.",
    "Référence à l'objet courant : `$_`.",
    "Solution : `Get-ADUser -Filter * | Where-Object { $_.LockedOut -eq $true }`."
  ],
  type: "compare-output",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-output", sams: ["c.rousseau"] },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m2-pipe-02", module: 2, ordre: 11,
  titre: "Comptes dont le mdp n'expire jamais",
  difficulte: "moyen", concepts: ["Pipeline", "PasswordNeverExpires"],
  contexte: "Audit ANSSI : tu dois lister les comptes avec mdp éternel (à corriger).",
  enonce: "Liste les comptes dont `PasswordNeverExpires` est `$true`.",
  indices: [
    "PasswordNeverExpires n'est pas dans les attributs par défaut.",
    "Il faut le demander via `-Properties PasswordNeverExpires`.",
    "Puis filtrer avec `Where-Object`."
  ],
  type: "compare-output",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-output", sams: ["j.dupont","a.dupont","svc.sql"] },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m2-pipe-03", module: 2, ordre: 12,
  titre: "Comptes Production actifs",
  difficulte: "difficile", concepts: ["Pipeline", "Filter combiné"],
  contexte: "Tu veux la liste des comptes du département Production qui sont actifs (Enabled = true).",
  enonce: "Liste les comptes Production actifs (deux conditions).",
  indices: [
    "Tu peux combiner deux conditions avec `-and`.",
    "Soit dans le -Filter, soit dans Where-Object.",
    "`Get-ADUser -Filter { Department -eq \"Production\" -and Enabled -eq $true }`"
  ],
  type: "compare-output",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-output", sams: ["l.dubois","svc.sql"] },
  validation: { tolerance: "stricte" },
});

// C5 — Select / Sort / Measure
exos.push({
  id: "m2-pipe2-01", module: 2, ordre: 13,
  titre: "Compter les comptes",
  difficulte: "facile", concepts: ["Measure-Object"],
  contexte: "Tu veux savoir combien de comptes utilisateurs existent.",
  enonce: "Affiche le nombre total de comptes via `Measure-Object`.",
  indices: [
    "Pipe : `Get-ADUser -Filter * | Measure-Object`.",
    "Le résultat affiche `Count`.",
    "Solution : `Get-ADUser -Filter * | Measure-Object`."
  ],
  type: "compare-output",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-output", outputContains: ["Count","10"] },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m2-pipe2-02", module: 2, ordre: 14,
  titre: "Trier par dernière connexion",
  difficulte: "moyen", concepts: ["Sort-Object"],
  contexte: "Pour un audit d'inactivité, tu veux les comptes du plus ancien au plus récent.",
  enonce: "Trie les comptes par `LastLogonDate` croissant.",
  indices: [
    "Demander LastLogonDate via -Properties.",
    "Pipe vers `Sort-Object LastLogonDate`.",
    "Pas besoin de `-Descending`."
  ],
  type: "compare-output",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-output", outputContains: ["m.bernard","l.dubois"] },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m2-pipe2-03", module: 2, ordre: 15,
  titre: "Export ciblé : Name + SamAccountName + Enabled",
  difficulte: "difficile", concepts: ["Select-Object"],
  contexte: "Pour un export CSV, on ne veut que 3 colonnes : Name, SamAccountName, Enabled.",
  enonce: "Récupère tous les comptes avec uniquement ces 3 colonnes via `Select-Object`.",
  indices: [
    "`Get-ADUser -Filter * | Select-Object Name, SamAccountName, Enabled`.",
    "Les noms de propriétés se séparent par des virgules.",
    "L'ordre des colonnes affichées suit l'ordre passé."
  ],
  type: "compare-output",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-output", outputContains: ["j.dupont","p.martin","s.lefevre","m.bernard","c.rousseau"] },
  validation: { tolerance: "stricte" },
});

// =====================================================================
// MODULE 3 — Modifier l'AD : New / Set / Remove
// =====================================================================

// C1 — New-ADUser
exos.push({
  id: "m3-new-01", module: 3, ordre: 1,
  titre: "Créer un compte minimal",
  difficulte: "facile", concepts: ["New-ADUser", "-SamAccountName"],
  contexte: "On embauche `Théo Garnier` à la Compta. Tu dois lui créer un compte.",
  enonce: "Crée un compte `t.garnier` avec Name `Théo Garnier` dans `OU=Compta,DC=pme,DC=local`, activé.",
  indices: [
    "Cmdlet `New-ADUser`.",
    "Paramètres : `-SamAccountName`, `-Name`, `-Path`, `-Enabled $true`.",
    "Pas de mot de passe demandé pour cet exo (compte de test)."
  ],
  type: "compare-state",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-state",
    reference: "New-ADUser -SamAccountName t.garnier -Name \"Théo Garnier\" -Path \"OU=Compta,DC=pme,DC=local\" -Enabled $true"
  },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m3-new-02", module: 3, ordre: 2,
  titre: "Créer un compte avec attributs métier",
  difficulte: "moyen", concepts: ["New-ADUser", "Title", "Department"],
  contexte: "Le compte de `Théo Garnier` doit porter `Title=Comptable` et `Department=Compta`.",
  enonce: "Crée le compte avec ces deux attributs en plus.",
  indices: [
    "Ajouter `-Title \"Comptable\"` et `-Department \"Compta\"`.",
    "Toujours -SamAccountName, -Name, -Path, -Enabled.",
    "Vérifie que le compte n'existe pas déjà avant."
  ],
  type: "compare-state",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-state",
    reference: "New-ADUser -SamAccountName t.garnier -Name \"Théo Garnier\" -Title Comptable -Department Compta -Path \"OU=Compta,DC=pme,DC=local\" -Enabled $true"
  },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m3-new-03", module: 3, ordre: 3,
  titre: "Créer un compte de stagiaire dans la bonne OU",
  difficulte: "difficile", concepts: ["New-ADUser", "OU spécifique"],
  contexte: "Une nouvelle stagiaire `Inès Roy` arrive en Commercial. Convention : `i.roy`, créée dans `OU=Commercial`.",
  enonce: "Crée le compte avec UPN `i.roy@pme.local`, Title `Stagiaire`, Department `Commercial`.",
  indices: [
    "Penser au -UserPrincipalName.",
    "OU cible : `OU=Commercial,DC=pme,DC=local`.",
    "Activer le compte."
  ],
  type: "compare-state",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-state",
    reference: "New-ADUser -SamAccountName i.roy -Name \"Inès Roy\" -UserPrincipalName i.roy@pme.local -Title Stagiaire -Department Commercial -Path \"OU=Commercial,DC=pme,DC=local\" -Enabled $true"
  },
  validation: { tolerance: "stricte" },
});

// C2 — Set-ADUser
exos.push({
  id: "m3-set-01", module: 3, ordre: 4,
  titre: "Modifier le titre d'un compte",
  difficulte: "facile", concepts: ["Set-ADUser", "Title"],
  contexte: "Pierre Martin est promu `Responsable Compta`.",
  enonce: "Mets à jour son `Title`.",
  indices: [
    "`Set-ADUser -Identity p.martin -Title \"Responsable Compta\"`.",
    "Pas besoin du -Identity en majuscules.",
    "Pas de guillemets nécessaires si pas d'espace."
  ],
  type: "compare-state",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-state",
    reference: "Set-ADUser -Identity p.martin -Title \"Responsable Compta\""
  },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m3-set-02", module: 3, ordre: 5,
  titre: "Mettre fin à PasswordNeverExpires",
  difficulte: "moyen", concepts: ["Set-ADUser", "PasswordNeverExpires"],
  contexte: "Audit ANSSI : le compte `j.dupont` a un mdp éternel. Tu dois corriger.",
  enonce: "Remets `PasswordNeverExpires` à `$false` sur `j.dupont`.",
  indices: [
    "`Set-ADUser -Identity j.dupont -PasswordNeverExpires $false`.",
    "Booléens sans guillemets.",
    "Le compte continue de fonctionner, le mdp expirera selon la politique."
  ],
  type: "compare-state",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-state",
    reference: "Set-ADUser -Identity j.dupont -PasswordNeverExpires $false"
  },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m3-set-03", module: 3, ordre: 6,
  titre: "Compléter Description et Department en une commande",
  difficulte: "difficile", concepts: ["Set-ADUser", "multi-attribut"],
  contexte: "Le compte `stage.compta` n'a pas de description claire. Tu veux poser `Description=Stagiaire avril–juin 2026` ET `Title=Stagiaire`.",
  enonce: "Mets à jour les deux en une seule commande `Set-ADUser`.",
  indices: [
    "Plusieurs paramètres dans le même appel.",
    "`Set-ADUser -Identity stage.compta -Description \"...\" -Title \"...\"`.",
    "Description identique à l'énoncé."
  ],
  type: "compare-state",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-state",
    reference: "Set-ADUser -Identity stage.compta -Description \"Stagiaire avril–juin 2026\" -Title Stagiaire"
  },
  validation: { tolerance: "stricte" },
});

// C3 — Disable / Enable / Remove
exos.push({
  id: "m3-disable-01", module: 3, ordre: 7,
  titre: "Désactiver un compte (départ)",
  difficulte: "facile", concepts: ["Disable-ADAccount"],
  contexte: "Camille Rousseau quitte la PME. Première étape : désactiver son compte.",
  enonce: "Désactive le compte `c.rousseau`.",
  indices: [
    "`Disable-ADAccount -Identity c.rousseau`.",
    "On ne supprime jamais directement.",
    "On désactive d'abord, on supprime au bout de N mois."
  ],
  type: "compare-state",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-state",
    reference: "Disable-ADAccount -Identity c.rousseau"
  },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m3-disable-02", module: 3, ordre: 8,
  titre: "Réactiver un compte de retour de congé",
  difficulte: "moyen", concepts: ["Enable-ADAccount"],
  contexte: "Marc Bernard, désactivé depuis fin 2025, revient finalement en mission temporaire.",
  enonce: "Réactive le compte `m.bernard`.",
  indices: [
    "`Enable-ADAccount -Identity m.bernard`.",
    "Pas besoin de reset de mdp pour cet exo.",
    "Tu pourras refaire un Set-ADAccountPassword au module 5."
  ],
  type: "compare-state",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-state",
    reference: "Enable-ADAccount -Identity m.bernard"
  },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m3-disable-03", module: 3, ordre: 9,
  titre: "Supprimer un compte ex-salarié",
  difficulte: "difficile", concepts: ["Remove-ADUser"],
  contexte: "Nathan Legrand est parti en février 2025. Il est dans `OU=Désactivés` depuis. La direction valide la suppression.",
  enonce: "Supprime le compte `n.legrand`.",
  indices: [
    "`Remove-ADUser -Identity n.legrand`.",
    "Penser à `-Confirm:$false` en script (mais facultatif ici).",
    "Action irréversible sans corbeille AD."
  ],
  type: "compare-state",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-state",
    reference: "Remove-ADUser -Identity n.legrand"
  },
  validation: { tolerance: "stricte" },
});

// C4 — Move-ADObject
exos.push({
  id: "m3-move-01", module: 3, ordre: 10,
  titre: "Déplacer un compte d'OU",
  difficulte: "facile", concepts: ["Move-ADObject"],
  contexte: "Pierre Martin passe de `OU=Compta` à `OU=Direction` après sa promotion.",
  enonce: "Déplace son compte vers `OU=Direction,DC=pme,DC=local`.",
  indices: [
    "`Move-ADObject -Identity <DN> -TargetPath <DN OU>`.",
    "Tu peux passer le DN actuel : `CN=Pierre Martin,OU=Compta,DC=pme,DC=local`.",
    "TargetPath = OU cible uniquement."
  ],
  type: "compare-state",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-state",
    reference: "Move-ADObject -Identity \"CN=Pierre Martin,OU=Compta,DC=pme,DC=local\" -TargetPath \"OU=Direction,DC=pme,DC=local\""
  },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m3-move-02", module: 3, ordre: 11,
  titre: "Archiver un compte désactivé",
  difficulte: "moyen", concepts: ["Move-ADObject", "OU=Désactivés"],
  contexte: "Marc Bernard est désactivé. Tu l'archives dans `OU=Désactivés`.",
  enonce: "Déplace `m.bernard` (DN actuel `CN=Marc Bernard,OU=Production,DC=pme,DC=local`) vers `OU=Désactivés,DC=pme,DC=local`.",
  indices: [
    "Mêmes paramètres qu'avant.",
    "Le DN d'identité doit pointer vers le compte actuel.",
    "Le DN target = OU=Désactivés,DC=pme,DC=local."
  ],
  type: "compare-state",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-state",
    reference: "Move-ADObject -Identity \"CN=Marc Bernard,OU=Production,DC=pme,DC=local\" -TargetPath \"OU=Désactivés,DC=pme,DC=local\""
  },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m3-move-03", module: 3, ordre: 12,
  titre: "Déplacer en utilisant le samAccountName",
  difficulte: "difficile", concepts: ["Move-ADObject", "Identity flexible"],
  contexte: "Notre runner accepte aussi le samAccountName comme `-Identity`.",
  enonce: "Déplace `stage.compta` vers `OU=Direction,DC=pme,DC=local` en passant simplement `stage.compta` comme identity.",
  indices: [
    "`-Identity` peut être un sam (pratique en interactif).",
    "TargetPath reste un DN d'OU.",
    "Solution : `Move-ADObject -Identity stage.compta -TargetPath \"OU=Direction,DC=pme,DC=local\"`."
  ],
  type: "compare-state",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-state",
    reference: "Move-ADObject -Identity stage.compta -TargetPath \"OU=Direction,DC=pme,DC=local\""
  },
  validation: { tolerance: "stricte" },
});

// C5 — Workflow
exos.push({
  id: "m3-flow-01", module: 3, ordre: 13,
  titre: "Workflow départ : étape 1 (désactiver)",
  difficulte: "facile", concepts: ["Workflow", "Disable"],
  contexte: "Camille Rousseau quitte la PME demain. Première étape du workflow standard.",
  enonce: "Désactive le compte `c.rousseau`.",
  indices: [
    "Une seule commande à cette étape.",
    "`Disable-ADAccount -Identity c.rousseau`.",
    "On verra l'étape suivante au prochain exo."
  ],
  type: "compare-state",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-state",
    reference: "Disable-ADAccount -Identity c.rousseau"
  },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m3-flow-02", module: 3, ordre: 14,
  titre: "Workflow départ : étape 2 (archiver)",
  difficulte: "moyen", concepts: ["Workflow", "Move"],
  contexte: "Le compte `c.rousseau` est désactivé (préfait pour toi). Tu l'archives.",
  enonce: "Déplace `c.rousseau` vers `OU=Désactivés,DC=pme,DC=local`.",
  indices: [
    "Move-ADObject + DN du compte.",
    "Cible : OU=Désactivés.",
    "Le DN actuel : `CN=Camille Rousseau,OU=Commercial,DC=pme,DC=local`."
  ],
  type: "compare-state",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-state",
    reference: "Move-ADObject -Identity \"CN=Camille Rousseau,OU=Commercial,DC=pme,DC=local\" -TargetPath \"OU=Désactivés,DC=pme,DC=local\""
  },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m3-flow-03", module: 3, ordre: 15,
  titre: "Workflow départ : étapes combinées",
  difficulte: "difficile", concepts: ["Workflow", "Pipeline d'admin"],
  contexte: "Tu veux faire les deux étapes en une seule session : désactiver puis archiver.",
  enonce: "Désactive `stage.compta` et déplace-le vers `OU=Désactivés,DC=pme,DC=local`. Tu peux taper deux commandes séparées.",
  indices: [
    "Sépare avec `;` ou retour ligne.",
    "1. Disable-ADAccount.",
    "2. Move-ADObject vers OU=Désactivés."
  ],
  type: "compare-state",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-state",
    reference: "Disable-ADAccount -Identity stage.compta\nMove-ADObject -Identity \"CN=Stagiaire Compta,OU=Compta,DC=pme,DC=local\" -TargetPath \"OU=Désactivés,DC=pme,DC=local\""
  },
  validation: { tolerance: "stricte" },
});

// =====================================================================
// MODULE 4 — Groupes et appartenances
// =====================================================================

// C1 — New-ADGroup
exos.push({
  id: "m4-new-01", module: 4, ordre: 1,
  titre: "Créer un groupe global Sécurité",
  difficulte: "facile", concepts: ["New-ADGroup", "Global", "Security"],
  contexte: "Tu crées le groupe `G_Direction` pour les membres de la direction.",
  enonce: "Crée `G_Direction` global Security dans `OU=Groupes,DC=pme,DC=local`.",
  indices: [
    "`New-ADGroup -Name G_Direction -GroupScope Global -GroupCategory Security -Path ...`.",
    "Penser à -SamAccountName si différent du Name (ici identique).",
    "Path = `OU=Groupes,DC=pme,DC=local`."
  ],
  type: "compare-state",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-state",
    reference: "New-ADGroup -Name G_Direction -SamAccountName G_Direction -GroupScope Global -GroupCategory Security -Path \"OU=Groupes,DC=pme,DC=local\""
  },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m4-new-02", module: 4, ordre: 2,
  titre: "Groupe domaine-local pour ressource",
  difficulte: "moyen", concepts: ["New-ADGroup", "DomainLocal", "AGDLP"],
  contexte: "Tu crées `DL_Partage_Compta_RW` pour porter les permissions NTFS sur `\\\\srv-fic\\compta` (lecture/écriture).",
  enonce: "Crée `DL_Partage_Compta_RW` domaine-local Security dans `OU=Groupes,DC=pme,DC=local`.",
  indices: [
    "GroupScope DomainLocal.",
    "Convention de nommage : DL_…_RW.",
    "Path : OU=Groupes."
  ],
  type: "compare-state",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-state",
    reference: "New-ADGroup -Name DL_Partage_Compta_RW -SamAccountName DL_Partage_Compta_RW -GroupScope DomainLocal -GroupCategory Security -Path \"OU=Groupes,DC=pme,DC=local\""
  },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m4-new-03", module: 4, ordre: 3,
  titre: "Groupe de distribution pour mailing",
  difficulte: "difficile", concepts: ["New-ADGroup", "Distribution"],
  contexte: "On veut une liste de diffusion `M_Toute_PME` (groupe distribution, scope Universal).",
  enonce: "Crée le groupe correspondant dans `OU=Groupes,DC=pme,DC=local`.",
  indices: [
    "GroupCategory Distribution (pas Security).",
    "GroupScope Universal.",
    "Convention de nom : M_… pour mailing."
  ],
  type: "compare-state",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-state",
    reference: "New-ADGroup -Name M_Toute_PME -SamAccountName M_Toute_PME -GroupScope Universal -GroupCategory Distribution -Path \"OU=Groupes,DC=pme,DC=local\""
  },
  validation: { tolerance: "stricte" },
});

// C2 — Add-ADGroupMember
exos.push({
  id: "m4-add-01", module: 4, ordre: 4,
  titre: "Ajouter un membre",
  difficulte: "facile", concepts: ["Add-ADGroupMember"],
  contexte: "Tu veux ajouter `s.lefevre` au groupe `G_Compta`.",
  enonce: "Ajoute `s.lefevre` à `G_Compta`.",
  indices: [
    "`Add-ADGroupMember -Identity G_Compta -Members s.lefevre`.",
    "L'identity = le groupe.",
    "Members = un ou plusieurs comptes."
  ],
  type: "compare-state",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-state",
    reference: "Add-ADGroupMember -Identity G_Compta -Members s.lefevre"
  },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m4-add-02", module: 4, ordre: 5,
  titre: "Ajouter plusieurs membres en une commande",
  difficulte: "moyen", concepts: ["Add-ADGroupMember", "Liste"],
  contexte: "Trois nouveaux salariés rejoignent la Compta : `m.bernard`, `l.dubois` et `c.rousseau`.",
  enonce: "Ajoute ces trois comptes à `G_Compta` en une seule commande.",
  indices: [
    "Liste de membres séparés par des virgules.",
    "`Add-ADGroupMember -Identity G_Compta -Members u1, u2, u3`.",
    "L'ordre est libre."
  ],
  type: "compare-state",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-state",
    reference: "Add-ADGroupMember -Identity G_Compta -Members m.bernard, l.dubois, c.rousseau"
  },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m4-add-03", module: 4, ordre: 6,
  titre: "Mettre Julie dans Protected Users",
  difficulte: "difficile", concepts: ["Add-ADGroupMember", "Protected Users"],
  contexte: "Recommandation ANSSI : ses comptes admin `j.dupont` et `a.dupont` doivent être dans `Protected Users`.",
  enonce: "Ajoute `j.dupont` et `a.dupont` à `Protected Users` en une commande.",
  indices: [
    "Identité du groupe : `Protected Users` (avec espace, donc guillemets).",
    "Members : `j.dupont, a.dupont`.",
    "Pas besoin de DN, le sam suffit."
  ],
  type: "compare-state",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-state",
    reference: "Add-ADGroupMember -Identity \"Protected Users\" -Members j.dupont, a.dupont"
  },
  validation: { tolerance: "stricte" },
});

// C3 — Remove-ADGroupMember
exos.push({
  id: "m4-rem-01", module: 4, ordre: 7,
  titre: "Retirer un membre",
  difficulte: "facile", concepts: ["Remove-ADGroupMember"],
  contexte: "Pierre Martin n'est plus en Compta. Tu le retires de `G_Compta`.",
  enonce: "Retire `p.martin` de `G_Compta`.",
  indices: [
    "Symétrique de Add-ADGroupMember.",
    "`Remove-ADGroupMember -Identity G_Compta -Members p.martin`.",
    "Le compte n'est pas supprimé, juste retiré du groupe."
  ],
  type: "compare-state",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-state",
    reference: "Remove-ADGroupMember -Identity G_Compta -Members p.martin"
  },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m4-rem-02", module: 4, ordre: 8,
  titre: "Vider Enterprise Admins",
  difficulte: "moyen", concepts: ["Remove-ADGroupMember", "Enterprise Admins"],
  contexte: "ANSSI : on retire `a.dupont` d'`Enterprise Admins` (à n'utiliser qu'en cas exceptionnel).",
  enonce: "Retire `a.dupont` du groupe `Enterprise Admins`.",
  indices: [
    "Group avec espace → guillemets.",
    "`Remove-ADGroupMember -Identity \"Enterprise Admins\" -Members a.dupont`.",
    "L'idée : éviter la persistance d'un compte EA."
  ],
  type: "compare-state",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-state",
    reference: "Remove-ADGroupMember -Identity \"Enterprise Admins\" -Members a.dupont"
  },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m4-rem-03", module: 4, ordre: 9,
  titre: "Retirer un compte de Domain Admins",
  difficulte: "difficile", concepts: ["Remove-ADGroupMember", "Domain Admins"],
  contexte: "Julie Dupont, en tant que directrice, ne devrait pas avoir un compte humain dans Domain Admins. Son compte admin `a.dupont` y est aussi.",
  enonce: "Retire `j.dupont` (compte humain) du groupe `Domain Admins`. On garde `a.dupont` dedans.",
  indices: [
    "Identifie clairement quel compte tu retires (humain ≠ admin).",
    "Members : juste `j.dupont`.",
    "Group : Domain Admins (avec guillemets)."
  ],
  type: "compare-state",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-state",
    reference: "Remove-ADGroupMember -Identity \"Domain Admins\" -Members j.dupont"
  },
  validation: { tolerance: "stricte" },
});

// C4 — Get-ADGroupMember
exos.push({
  id: "m4-list-01", module: 4, ordre: 10,
  titre: "Lister les Domain Admins",
  difficulte: "facile", concepts: ["Get-ADGroupMember"],
  contexte: "Audit : qui est dans `Domain Admins` ?",
  enonce: "Liste les membres de `Domain Admins`.",
  indices: [
    "`Get-ADGroupMember -Identity \"Domain Admins\"`.",
    "Le résultat liste les comptes/groupes membres.",
    "Pour cet AD, deux comptes y sont."
  ],
  type: "compare-output",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-output", sams: ["j.dupont","a.dupont"] },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m4-list-02", module: 4, ordre: 11,
  titre: "Lister G_Compta",
  difficulte: "moyen", concepts: ["Get-ADGroupMember"],
  contexte: "Tu veux voir qui est dans `G_Compta` actuellement.",
  enonce: "Liste les membres de `G_Compta`.",
  indices: [
    "`Get-ADGroupMember -Identity G_Compta`.",
    "Le résultat liste les comptes membres.",
    "Pour cet AD initial, un seul membre y est."
  ],
  type: "compare-output",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-output", sams: ["p.martin"] },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m4-list-03", module: 4, ordre: 12,
  titre: "Compter les membres d'un groupe",
  difficulte: "difficile", concepts: ["Get-ADGroupMember", "Measure-Object"],
  contexte: "Combien de comptes admin (Domain Admins) ?",
  enonce: "Compte les membres de `Domain Admins`.",
  indices: [
    "Pipe vers Measure-Object.",
    "`Get-ADGroupMember \"Domain Admins\" | Measure-Object`.",
    "Le résultat affiche Count."
  ],
  type: "compare-output",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-output", outputContains: ["Count","2"] },
  validation: { tolerance: "stricte" },
});

// C5 — AGDLP
exos.push({
  id: "m4-agdlp-01", module: 4, ordre: 13,
  titre: "Sens de A G DL P",
  difficulte: "facile", concepts: ["AGDLP"],
  contexte: "Tu présentes la stratégie AGDLP à un collègue.",
  enonce: "Que signifie chaque lettre dans l'ordre ?",
  indices: [
    "A = Account, G = Global group.",
    "DL = Domain Local group, P = Permissions.",
    "C'est la chaîne d'imbrication : compte → global → domaine local → permissions."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "ok", label: "Account → Global → Domain Local → Permissions" },
    { value: "ko1", label: "Admin → Group → Domain → Privilege" },
    { value: "ko2", label: "Account → GPO → Domain → Permissions" },
    { value: "ko3", label: "Account → Global → Distribution → Permissions" },
  ]},
  solution: { type: "qcm", bonneReponse: "ok" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m4-agdlp-02", module: 4, ordre: 14,
  titre: "Où mettre les ACL NTFS ?",
  difficulte: "moyen", concepts: ["AGDLP", "ACL"],
  contexte: "Tu donnes l'accès en lecture/écriture à un partage. Sur quel objet poses-tu l'ACL ?",
  enonce: "Choisis le bon niveau dans la chaîne AGDLP.",
  indices: [
    "Pas sur le compte directement.",
    "Pas sur le groupe global.",
    "Sur le groupe domaine-local (DL_…)."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "ok", label: "Sur le groupe domaine-local (DL_)" },
    { value: "ko1", label: "Directement sur le compte" },
    { value: "ko2", label: "Sur le groupe global (G_)" },
    { value: "ko3", label: "Sur l'OU Groupes" },
  ]},
  solution: { type: "qcm", bonneReponse: "ok" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m4-agdlp-03", module: 4, ordre: 15,
  titre: "Faute classique d'audit",
  difficulte: "difficile", concepts: ["AGDLP", "Audit"],
  contexte: "Lors d'un audit AD, on relève la configuration suivante : un compte `c.rousseau` est mis directement dans un groupe domaine-local `DL_Partage_RH_RW`.",
  enonce: "Pourquoi est-ce une faute du point de vue AGDLP ?",
  indices: [
    "AGDLP impose une chaîne d'imbrication.",
    "Les comptes vont dans des groupes globaux, pas DL.",
    "On perd la séparation 'rôle métier' / 'permission technique'."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "ok", label: "On court-circuite le groupe global ; on mélange identité et permission, et on rend l'audit beaucoup plus difficile à grande échelle." },
    { value: "ko1", label: "Aucun problème, c'est juste différent." },
    { value: "ko2", label: "Faute parce qu'un DL ne peut pas avoir de membres." },
    { value: "ko3", label: "Faute parce qu'il faut systématiquement Universal." },
  ]},
  solution: { type: "qcm", bonneReponse: "ok" },
  validation: { tolerance: "stricte" },
});

// =====================================================================
// MODULE 5 — Mots de passe et verrouillage
// =====================================================================

// C1 — Get-ADDefaultDomainPasswordPolicy
exos.push({
  id: "m5-pol-01", module: 5, ordre: 1,
  titre: "Lire la politique par défaut",
  difficulte: "facile", concepts: ["Get-ADDefaultDomainPasswordPolicy"],
  contexte: "Tu prépares un audit du domaine. Première étape : connaître la politique en vigueur.",
  enonce: "Affiche la politique de mots de passe par défaut.",
  indices: [
    "Cmdlet : `Get-ADDefaultDomainPasswordPolicy`.",
    "Pas de paramètre.",
    "Le résultat liste MinPasswordLength, ComplexityEnabled, etc."
  ],
  type: "compare-output",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-output",
    outputContains: ["MinPasswordLength","ComplexityEnabled"]
  },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m5-pol-02", module: 5, ordre: 2,
  titre: "Recommandation ANSSI : longueur",
  difficulte: "moyen", concepts: ["Politique", "ANSSI"],
  contexte: "L'ANSSI recommande une longueur minimale de mot de passe ≥ N.",
  enonce: "Quelle est la longueur minimale recommandée pour des comptes utilisateurs standards ?",
  indices: [
    "ANSSI guide d'hygiène : 12 caractères pour comptes standards.",
    "16+ pour comptes admin.",
    "Réponse demandée : 12."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "8", label: "8" },
    { value: "12", label: "12" },
    { value: "20", label: "20" },
    { value: "32", label: "32" },
  ]},
  solution: { type: "qcm", bonneReponse: "12" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m5-pol-03", module: 5, ordre: 3,
  titre: "Pourquoi désactiver Reversible Encryption",
  difficulte: "difficile", concepts: ["Politique", "ReversibleEncryption"],
  contexte: "L'audit te signale `ReversibleEncryptionEnabled = True`. Tu dois corriger.",
  enonce: "Pourquoi cette option est-elle considérée comme une faute majeure ?",
  indices: [
    "Cette option stocke les mdp d'une façon réversible côté DC.",
    "Cela revient à les stocker en quasi-clair.",
    "Un attaquant ayant accès à la base AD récupère les mdp."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "ok", label: "Les mots de passe sont stockés en quasi-clair côté DC ; un accès à la base AD = mots de passe lisibles." },
    { value: "ko1", label: "Ça empêche le SSO." },
    { value: "ko2", label: "Ça augmente le coût Kerberos." },
    { value: "ko3", label: "Ça force tout le monde à changer son mdp tous les 30 jours." },
  ]},
  solution: { type: "qcm", bonneReponse: "ok" },
  validation: { tolerance: "stricte" },
});

// C2 — Set-ADAccountPassword
exos.push({
  id: "m5-reset-01", module: 5, ordre: 4,
  titre: "Reset basique d'un mot de passe",
  difficulte: "facile", concepts: ["Set-ADAccountPassword", "-Reset"],
  contexte: "Pierre Martin a oublié son mot de passe. Tu lui en redonnes un.",
  enonce: "Réinitialise le mot de passe de `p.martin` (la commande sans préciser le nouveau mdp est acceptée pour cet exo).",
  indices: [
    "`Set-ADAccountPassword -Identity p.martin -Reset`.",
    "Pour le runner, le -NewPassword n'est pas exigé.",
    "L'attribut `passwordLastSet` est mis à jour."
  ],
  type: "compare-state",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-state",
    reference: "Set-ADAccountPassword -Identity p.martin -Reset"
  },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m5-reset-02", module: 5, ordre: 5,
  titre: "Reset + déverrouiller en même temps",
  difficulte: "moyen", concepts: ["Set-ADAccountPassword", "Unlock"],
  contexte: "Camille Rousseau est verrouillée. Tu lui redonnes un mdp et tu déverrouilles.",
  enonce: "Reset le mot de passe de `c.rousseau` (avec -Reset, qui déverrouille aussi dans notre simulateur).",
  indices: [
    "Set-ADAccountPassword -Reset.",
    "Le compte se déverrouille (LockedOut → false).",
    "Pas besoin d'Unlock-ADAccount séparé pour cet exo."
  ],
  type: "compare-state",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-state",
    reference: "Set-ADAccountPassword -Identity c.rousseau -Reset"
  },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m5-reset-03", module: 5, ordre: 6,
  titre: "Reset du compte de service SQL",
  difficulte: "difficile", concepts: ["Set-ADAccountPassword", "Comptes service"],
  contexte: "Le compte `svc.sql` n'a pas changé de mdp depuis 4 ans. C'est une faute d'audit.",
  enonce: "Reset le mot de passe de `svc.sql`.",
  indices: [
    "Même cmdlet que pour un user humain.",
    "Identifier : `svc.sql`.",
    "En vrai, on enchaîne avec une mise à jour de la chaîne de connexion SQL."
  ],
  type: "compare-state",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-state",
    reference: "Set-ADAccountPassword -Identity svc.sql -Reset"
  },
  validation: { tolerance: "stricte" },
});

// C3 — Unlock-ADAccount
exos.push({
  id: "m5-unlock-01", module: 5, ordre: 7,
  titre: "Déverrouiller un compte",
  difficulte: "facile", concepts: ["Unlock-ADAccount"],
  contexte: "Camille appelle, son compte est verrouillé après 5 mauvaises tentatives.",
  enonce: "Déverrouille `c.rousseau`.",
  indices: [
    "`Unlock-ADAccount -Identity c.rousseau`.",
    "Cela ne reset pas le mot de passe.",
    "Le compte reprend tel quel."
  ],
  type: "compare-state",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-state",
    reference: "Unlock-ADAccount -Identity c.rousseau"
  },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m5-unlock-02", module: 5, ordre: 8,
  titre: "Unlock vs Enable : quelle différence ?",
  difficulte: "moyen", concepts: ["Unlock", "Enable"],
  contexte: "Question vocabulaire : Disable-ADAccount vs Unlock-ADAccount.",
  enonce: "Lequel s'applique à un compte qu'on a explicitement désactivé en console ?",
  indices: [
    "Désactivé → Enable-ADAccount pour le réactiver.",
    "Verrouillé (trop de mauvais mdp) → Unlock-ADAccount.",
    "Unlock ne réactive pas un compte désactivé."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "enable", label: "Enable-ADAccount" },
    { value: "unlock", label: "Unlock-ADAccount" },
    { value: "set", label: "Set-ADUser" },
    { value: "rien", label: "Aucun, il faut recréer le compte" },
  ]},
  solution: { type: "qcm", bonneReponse: "enable" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m5-unlock-03", module: 5, ordre: 9,
  titre: "Audit + Unlock combinés",
  difficulte: "difficile", concepts: ["Search-ADAccount", "Unlock-ADAccount"],
  contexte: "Le helpdesk a 3 comptes verrouillés ce matin (en réalité ici un seul : `c.rousseau`).",
  enonce: "Déverrouille `c.rousseau` (l'idée serait, en script, d'utiliser `Search-ADAccount -LockedOut | Unlock-ADAccount`).",
  indices: [
    "Pour cet exo, une commande directe suffit.",
    "Unlock-ADAccount -Identity c.rousseau.",
    "En script : `Search-ADAccount -LockedOut | Unlock-ADAccount`."
  ],
  type: "compare-state",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-state",
    reference: "Unlock-ADAccount -Identity c.rousseau"
  },
  validation: { tolerance: "stricte" },
});

// C4 — Search-ADAccount
exos.push({
  id: "m5-search-01", module: 5, ordre: 10,
  titre: "Comptes verrouillés",
  difficulte: "facile", concepts: ["Search-ADAccount", "-LockedOut"],
  contexte: "Audit du matin : qui est verrouillé ?",
  enonce: "Liste les comptes verrouillés.",
  indices: [
    "Cmdlet : Search-ADAccount.",
    "Switch : `-LockedOut`.",
    "Solution : `Search-ADAccount -LockedOut`."
  ],
  type: "compare-output",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-output", sams: ["c.rousseau"] },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m5-search-02", module: 5, ordre: 11,
  titre: "Comptes désactivés",
  difficulte: "moyen", concepts: ["Search-ADAccount", "-AccountDisabled", "-UsersOnly"],
  contexte: "Tu veux la liste des comptes utilisateurs désactivés (sans les machines désactivées).",
  enonce: "Liste les comptes utilisateurs désactivés.",
  indices: [
    "`Search-ADAccount -AccountDisabled -UsersOnly`.",
    "Le switch `-UsersOnly` exclut les ordinateurs.",
    "Sans `-UsersOnly`, le résultat peut être pollué."
  ],
  type: "compare-output",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-output", sams: ["m.bernard","n.legrand"] },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m5-search-03", module: 5, ordre: 12,
  titre: "Comptes inactifs depuis 90 jours",
  difficulte: "difficile", concepts: ["Search-ADAccount", "-AccountInactive", "-TimeSpan"],
  contexte: "Audit ANSSI : recenser les comptes qui ne se sont pas connectés depuis ≥ 90 jours.",
  enonce: "Liste les comptes inactifs ≥ 90 jours, comptes utilisateurs uniquement.",
  indices: [
    "`Search-ADAccount -AccountInactive -TimeSpan 90 -UsersOnly`.",
    "Le TimeSpan en jours.",
    "À l'E7 c'est exactement la consigne PingCastle."
  ],
  type: "compare-output",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-output", sams: ["m.bernard","l.dubois","n.legrand"] },
  validation: { tolerance: "stricte" },
});

// C5 — PSO
exos.push({
  id: "m5-pso-01", module: 5, ordre: 13,
  titre: "Que veut dire PSO ?",
  difficulte: "facile", concepts: ["PSO"],
  contexte: "Le terme PSO est dans la doc Microsoft.",
  enonce: "Que signifie PSO ?",
  indices: [
    "P = Password.",
    "S = Settings.",
    "O = Object."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "ok", label: "Password Settings Object" },
    { value: "ko1", label: "Privileged Security Object" },
    { value: "ko2", label: "Password Synchronization Object" },
    { value: "ko3", label: "Permissive Security Override" },
  ]},
  solution: { type: "qcm", bonneReponse: "ok" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m5-pso-02", module: 5, ordre: 14,
  titre: "À qui s'applique un PSO ?",
  difficulte: "moyen", concepts: ["PSO", "Application"],
  contexte: "Tu crées un PSO pour les admins.",
  enonce: "À quoi peut-on attacher un PSO comme cible ?",
  indices: [
    "Pas une OU.",
    "Un groupe ou un user.",
    "Le plus propre : un groupe."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "groupe-user", label: "Un groupe ou un utilisateur" },
    { value: "ou", label: "Une OU" },
    { value: "site", label: "Un site AD" },
    { value: "domaine", label: "Le domaine entier" },
  ]},
  solution: { type: "qcm", bonneReponse: "groupe-user" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m5-pso-03", module: 5, ordre: 15,
  titre: "Précédence entre deux PSO",
  difficulte: "difficile", concepts: ["PSO", "Précédence"],
  contexte: "Un user a deux PSO qui s'appliquent (via deux groupes différents). PSO1 a Precedence 10, PSO2 Precedence 20.",
  enonce: "Lequel s'applique réellement ?",
  indices: [
    "Côté Microsoft : la plus petite valeur de Precedence gagne.",
    "PSO1 (10) prime sur PSO2 (20).",
    "Notion contre-intuitive, à connaître pour l'écrit."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "ok", label: "PSO1 (Precedence la plus basse l'emporte)" },
    { value: "ko1", label: "PSO2 (Precedence la plus haute l'emporte)" },
    { value: "ko2", label: "Les deux fusionnent" },
    { value: "ko3", label: "C'est aléatoire" },
  ]},
  solution: { type: "qcm", bonneReponse: "ok" },
  validation: { tolerance: "stricte" },
});

// =====================================================================
// MODULE 6 — Comptes privilégiés et sécurité
// =====================================================================

// C1 — Tier model
exos.push({
  id: "m6-tier-01", module: 6, ordre: 1,
  titre: "Niveau d'un Domain Admin",
  difficulte: "facile", concepts: ["Tier model"],
  contexte: "Modèle ANSSI à 3 tiers.",
  enonce: "Un compte Domain Admin est dans quel tier ?",
  indices: [
    "Tier 0 = AD/PKI/DC.",
    "Tier 1 = serveurs membres.",
    "Tier 2 = postes utilisateurs."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "0", label: "Tier 0" },
    { value: "1", label: "Tier 1" },
    { value: "2", label: "Tier 2" },
    { value: "tous", label: "Tous les tiers à la fois" },
  ]},
  solution: { type: "qcm", bonneReponse: "0" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m6-tier-02", module: 6, ordre: 2,
  titre: "Faute majeure dans le tier model",
  difficulte: "moyen", concepts: ["Tier model", "Compromission"],
  contexte: "Un admin se connecte en RDP avec son compte Domain Admin sur un poste utilisateur Tier 2.",
  enonce: "Pourquoi c'est dangereux ?",
  indices: [
    "Le hash NTLM ou le ticket Kerberos peut rester sur le poste.",
    "Un attaquant ayant pris la main sur le poste peut le récupérer.",
    "C'est l'ouverture de la voie au pass-the-hash."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "ok", label: "Le hash/ticket peut être récupéré sur le poste compromis et permettre une compromission complète du domaine." },
    { value: "ko1", label: "C'est juste lent." },
    { value: "ko2", label: "Cela viole les licences Windows." },
    { value: "ko3", label: "Cela crée un cookie GPO indésirable." },
  ]},
  solution: { type: "qcm", bonneReponse: "ok" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m6-tier-03", module: 6, ordre: 3,
  titre: "Quel poste utiliser pour administrer ?",
  difficulte: "difficile", concepts: ["Tier model", "PAW"],
  contexte: "Tu veux séparer ton activité quotidienne et tes opérations admin.",
  enonce: "Quelle solution est conforme à la doctrine ANSSI ?",
  indices: [
    "Notion de Privileged Access Workstation (PAW).",
    "Un poste dédié, durci, sans web ni mail.",
    "Utilisé uniquement pour les opérations Tier 0/1."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "paw", label: "Un Privileged Access Workstation (PAW) durci, sans accès web/mail." },
    { value: "vm", label: "Une VM Linux sur ton poste perso." },
    { value: "rdp", label: "Te connecter en RDP au DC depuis ton poste habituel." },
    { value: "ssh", label: "Utiliser SSH avec un mot de passe long." },
  ]},
  solution: { type: "qcm", bonneReponse: "paw" },
  validation: { tolerance: "stricte" },
});

// C2 — Protected Users
exos.push({
  id: "m6-protected-01", module: 6, ordre: 4,
  titre: "Que fait Protected Users ?",
  difficulte: "facile", concepts: ["Protected Users"],
  contexte: "Tu places un compte admin dans `Protected Users`.",
  enonce: "Quelle est l'une des protections automatiques apportées ?",
  indices: [
    "Pas de cache d'identifiants.",
    "Pas de NTLM, uniquement Kerberos AES.",
    "Durée TGT raccourcie."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "ok", label: "Pas de mise en cache des identifiants côté poste (donc pas de hash NTLM stocké)." },
    { value: "ko1", label: "Le compte ne peut plus se logger." },
    { value: "ko2", label: "Le compte hérite automatiquement de Domain Admins." },
    { value: "ko3", label: "Le compte voit son mot de passe inchangé même après reset." },
  ]},
  solution: { type: "qcm", bonneReponse: "ok" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m6-protected-02", module: 6, ordre: 5,
  titre: "Mettre les admins dans Protected Users",
  difficulte: "moyen", concepts: ["Add-ADGroupMember", "Protected Users"],
  contexte: "Tu as 1 compte admin : `a.dupont`. Tu décides d'appliquer la recommandation ANSSI.",
  enonce: "Ajoute `a.dupont` au groupe `Protected Users`.",
  indices: [
    "Add-ADGroupMember.",
    "Group avec espace → guillemets.",
    "Members : a.dupont."
  ],
  type: "compare-state",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-state",
    reference: "Add-ADGroupMember -Identity \"Protected Users\" -Members a.dupont"
  },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m6-protected-03", module: 6, ordre: 6,
  titre: "Limite de Protected Users",
  difficulte: "difficile", concepts: ["Protected Users", "Effets de bord"],
  contexte: "On te dit : 'on met TOUS les comptes dans Protected Users, c'est plus sûr'.",
  enonce: "Pourquoi ce n'est pas une bonne idée ?",
  indices: [
    "Désactive le cache → impossible de se logger hors ligne sur portable.",
    "Désactive certains protocoles utilisés par les apps legacy.",
    "Impact opérationnel important si appliqué sans tri."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "ok", label: "Pas de cache → utilisateurs nomades bloqués hors ligne ; protocoles legacy cassés." },
    { value: "ko1", label: "Aucune limite, faisons-le." },
    { value: "ko2", label: "Cela coûte une licence supplémentaire." },
    { value: "ko3", label: "Il faut un domaine au niveau fonctionnel 2003." },
  ]},
  solution: { type: "qcm", bonneReponse: "ok" },
  validation: { tolerance: "stricte" },
});

// C3 — AdminSDHolder
exos.push({
  id: "m6-sd-01", module: 6, ordre: 7,
  titre: "Rôle d'AdminSDHolder",
  difficulte: "facile", concepts: ["AdminSDHolder"],
  contexte: "Tu modifies les ACL d'un compte admin. Une heure après, elles sont revenues à l'état d'avant.",
  enonce: "Pourquoi ?",
  indices: [
    "AdminSDHolder est un objet 'modèle' dans CN=System.",
    "Ses ACL sont recopiées toutes les heures sur les comptes admin.",
    "C'est volontaire, anti-tampering."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "ok", label: "AdminSDHolder réécrase les ACL des comptes admins toutes les heures (mécanisme SDPROP)." },
    { value: "ko1", label: "Bug Windows, à patcher." },
    { value: "ko2", label: "C'est un effet du tier model." },
    { value: "ko3", label: "Les ACL ont été ajustées par un attaquant." },
  ]},
  solution: { type: "qcm", bonneReponse: "ok" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m6-sd-02", module: 6, ordre: 8,
  titre: "AdminCount = 1",
  difficulte: "moyen", concepts: ["AdminSDHolder", "adminCount"],
  contexte: "Un audit signale `adminCount = 1` sur des comptes qui ne sont plus admin.",
  enonce: "Que ça signifie ?",
  indices: [
    "Les comptes ont été admin par le passé.",
    "Le flag `adminCount` n'est jamais remis à 0 automatiquement.",
    "Leurs ACL héritent toujours d'AdminSDHolder."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "ok", label: "Comptes anciennement admin dont les ACL héritent toujours d'AdminSDHolder ; faute classique d'audit." },
    { value: "ko1", label: "Comptes en cours d'élévation par un attaquant." },
    { value: "ko2", label: "Comptes joints à 1 groupe administratif." },
    { value: "ko3", label: "Comptes avec quota de comptes-machines." },
  ]},
  solution: { type: "qcm", bonneReponse: "ok" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m6-sd-03", module: 6, ordre: 9,
  titre: "Remédier à un adminCount résiduel",
  difficulte: "difficile", concepts: ["AdminSDHolder", "Remédiation"],
  contexte: "Tu as identifié 5 comptes ex-admin avec adminCount=1.",
  enonce: "Quelle séquence corrige proprement la situation ?",
  indices: [
    "1. Sortir le compte du groupe admin (déjà fait).",
    "2. Remettre adminCount à 0 ou supprimer l'attribut.",
    "3. Réactiver l'héritage des ACL sur l'objet."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "ok", label: "Vérifier qu'il n'est plus dans aucun groupe admin, supprimer/zéroter l'attribut adminCount, réactiver l'héritage des ACL." },
    { value: "ko1", label: "Désactiver le compte." },
    { value: "ko2", label: "Le supprimer puis le recréer immédiatement." },
    { value: "ko3", label: "Mettre Protected Users."},
  ]},
  solution: { type: "qcm", bonneReponse: "ok" },
  validation: { tolerance: "stricte" },
});

// C4 — gMSA
exos.push({
  id: "m6-gmsa-01", module: 6, ordre: 10,
  titre: "Pourquoi un gMSA ?",
  difficulte: "facile", concepts: ["gMSA", "Comptes service"],
  contexte: "Tu déploies un service SQL sur 3 nœuds en cluster.",
  enonce: "Quel type de compte est recommandé ?",
  indices: [
    "Pas un user humain.",
    "Pas un MSA (1 seul nœud).",
    "Un gMSA (group MSA) supporte plusieurs hôtes."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "gmsa", label: "Un Group Managed Service Account (gMSA)" },
    { value: "user", label: "Un compte utilisateur dédié" },
    { value: "admin", label: "Le compte Administrateur du domaine" },
    { value: "local", label: "Un compte local par nœud" },
  ]},
  solution: { type: "qcm", bonneReponse: "gmsa" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m6-gmsa-02", module: 6, ordre: 11,
  titre: "Avantage côté mot de passe",
  difficulte: "moyen", concepts: ["gMSA"],
  contexte: "On compare un compte service classique vs gMSA.",
  enonce: "Quel est l'avantage du gMSA pour le mot de passe ?",
  indices: [
    "240 caractères, géré par AD.",
    "Rotation automatique tous les 30 jours.",
    "Pas de mdp en clair dans un script."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "ok", label: "Mot de passe long, géré et roté automatiquement par AD ; jamais stocké en clair." },
    { value: "ko1", label: "Le mot de passe ne change jamais, c'est plus simple." },
    { value: "ko2", label: "Le mot de passe est partagé entre plusieurs comptes humains." },
    { value: "ko3", label: "Le mot de passe est géré dans Excel." },
  ]},
  solution: { type: "qcm", bonneReponse: "ok" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m6-gmsa-03", module: 6, ordre: 12,
  titre: "Pré-requis d'un gMSA",
  difficulte: "difficile", concepts: ["gMSA", "Pré-requis"],
  contexte: "Tu prépares la mise en place d'un gMSA dans le domaine.",
  enonce: "Quel pré-requis est indispensable côté domaine ?",
  indices: [
    "KDS Root Key.",
    "À créer une seule fois par forêt.",
    "Sans elle, pas de gMSA possible."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "ok", label: "Une KDS Root Key doit exister dans la forêt (`Add-KdsRootKey`)." },
    { value: "ko1", label: "Une licence Microsoft Premier." },
    { value: "ko2", label: "L'option 'Reversible Encryption' activée." },
    { value: "ko3", label: "Un compte gMSA temporaire pour bootstrap." },
  ]},
  solution: { type: "qcm", bonneReponse: "ok" },
  validation: { tolerance: "stricte" },
});

// C5 — Audit privilégiés
exos.push({
  id: "m6-audit-01", module: 6, ordre: 13,
  titre: "Lister les Domain Admins (audit)",
  difficulte: "facile", concepts: ["Get-ADGroupMember", "Audit privilégiés"],
  contexte: "Tu prépares ton tableau d'audit privilégiés.",
  enonce: "Liste les membres de `Domain Admins`.",
  indices: [
    "Get-ADGroupMember.",
    "Identity = \"Domain Admins\".",
    "Pas besoin d'autre chose pour cet exo."
  ],
  type: "compare-output",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-output", sams: ["j.dupont","a.dupont"] },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m6-audit-02", module: 6, ordre: 14,
  titre: "Détecter PasswordNeverExpires sur admin",
  difficulte: "moyen", concepts: ["Audit", "Pipeline"],
  contexte: "Faute typique : un compte admin avec mot de passe éternel.",
  enonce: "Liste les comptes avec `PasswordNeverExpires=$true`.",
  indices: [
    "`-Properties PasswordNeverExpires`.",
    "Where-Object filtre.",
    "Ici : 3 comptes, dont a.dupont et j.dupont."
  ],
  type: "compare-output",
  donnees: { snapshot: SNAP },
  solution: { type: "compare-output", sams: ["j.dupont","a.dupont","svc.sql"] },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m6-audit-03", module: 6, ordre: 15,
  titre: "Constats d'audit privilégiés",
  difficulte: "difficile", concepts: ["Audit", "Multi-anomalies"],
  contexte: "Tu rédiges la page 'Comptes privilégiés' de ton rapport d'audit.",
  enonce: "Coche les anomalies que tu observes sur l'AD `pme.local` actuel.",
  indices: [
    "Compte humain (j.dupont) dans Domain Admins.",
    "Comptes admin avec PasswordNeverExpires=true.",
    "Aucun compte admin dans Protected Users."
  ],
  type: "audit",
  donnees: { anomalies: [
    { value: "humain-da", label: "Un compte humain (j.dupont) est dans Domain Admins" },
    { value: "pne-admin", label: "Au moins un compte admin a PasswordNeverExpires=$true" },
    { value: "pas-protected", label: "Aucun compte admin n'est dans Protected Users" },
    { value: "tous-actifs", label: "Tous les comptes admin sont activés (faux positif s'il y a des admins inactifs)" },
  ]},
  solution: { type: "audit", bonnesReponses: ["humain-da","pne-admin","pas-protected"] },
  validation: { tolerance: "stricte" },
});

// =====================================================================
// MODULE 7 — GPO et stratégies
// =====================================================================

// C1 — LSDO
exos.push({
  id: "m7-lsdo-01", module: 7, ordre: 1,
  titre: "Ordre LSDO",
  difficulte: "facile", concepts: ["GPO", "LSDO"],
  contexte: "Plusieurs GPO s'appliquent à un poste.",
  enonce: "Dans quel ordre s'appliquent-elles ?",
  indices: [
    "L = Local.",
    "S = Site.",
    "D = Domain, O = OU."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "ok", label: "Local → Site → Domaine → OU" },
    { value: "ko1", label: "OU → Domaine → Site → Local" },
    { value: "ko2", label: "Local → Domaine → Site → OU" },
    { value: "ko3", label: "Site → Local → OU → Domaine" },
  ]},
  solution: { type: "qcm", bonneReponse: "ok" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m7-lsdo-02", module: 7, ordre: 2,
  titre: "Conflit entre GPO",
  difficulte: "moyen", concepts: ["GPO", "Conflit"],
  contexte: "Une GPO de domaine définit `MinPasswordLength=8`. Une GPO d'OU définit `MinPasswordLength=14`.",
  enonce: "Quelle valeur s'applique sur un poste de l'OU ?",
  indices: [
    "La GPO appliquée en dernier 'gagne'.",
    "Ordre LSDO : OU vient en dernier.",
    "Donc 14."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "14", label: "14" },
    { value: "8", label: "8" },
    { value: "moy", label: "11 (moyenne)" },
    { value: "blocked", label: "La machine refuse de démarrer" },
  ]},
  solution: { type: "qcm", bonneReponse: "14" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m7-lsdo-03", module: 7, ordre: 3,
  titre: "Politique de mot de passe : exception",
  difficulte: "difficile", concepts: ["GPO", "Default Domain Policy"],
  contexte: "On dit en général 'l'OU prime sur le domaine', mais pas pour la politique de mots de passe.",
  enonce: "Pourquoi la `MinPasswordLength` définie au niveau du domaine prime-t-elle, peu importe l'OU ?",
  indices: [
    "La politique de mot de passe (account policies) est par défaut un paramètre *de domaine*.",
    "Elle ne s'applique pas via une GPO d'OU sur les comptes du domaine.",
    "Pour différencier : il faut un PSO (cf. module 5)."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "ok", label: "Les Account Policies (mdp, lockout) ne s'appliquent qu'au niveau du domaine ; pour différencier, on passe par un PSO." },
    { value: "ko1", label: "Bug Windows." },
    { value: "ko2", label: "Parce que le domaine est verrouillé." },
    { value: "ko3", label: "Parce que LSDO est inversé pour les mdp." },
  ]},
  solution: { type: "qcm", bonneReponse: "ok" },
  validation: { tolerance: "stricte" },
});

// C2 — Computer vs User config
exos.push({
  id: "m7-conf-01", module: 7, ordre: 4,
  titre: "Quelle config pour le pare-feu ?",
  difficulte: "facile", concepts: ["GPO", "Computer Configuration"],
  contexte: "Tu pousses un paramètre 'pare-feu Windows activé' sur tous les postes.",
  enonce: "Tu le mets dans la config Computer ou User ?",
  indices: [
    "Le pare-feu est un paramètre du système, pas de l'utilisateur.",
    "Il s'applique au démarrage du poste.",
    "Réponse : Computer Configuration."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "computer", label: "Computer Configuration" },
    { value: "user", label: "User Configuration" },
    { value: "both", label: "Les deux" },
    { value: "wmi", label: "Filtrage WMI uniquement" },
  ]},
  solution: { type: "qcm", bonneReponse: "computer" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m7-conf-02", module: 7, ordre: 5,
  titre: "Lecteur réseau au login",
  difficulte: "moyen", concepts: ["GPO", "User Configuration"],
  contexte: "Tu mappes le lecteur `Z:` vers `\\\\srv\\compta` à l'ouverture de session.",
  enonce: "Computer ou User Configuration ?",
  indices: [
    "Mapping persiste pour l'utilisateur.",
    "S'applique au login.",
    "User Configuration."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "user", label: "User Configuration" },
    { value: "computer", label: "Computer Configuration" },
    { value: "both", label: "Les deux" },
    { value: "wmi", label: "Filtrage WMI" },
  ]},
  solution: { type: "qcm", bonneReponse: "user" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m7-conf-03", module: 7, ordre: 6,
  titre: "Conflit Computer vs User",
  difficulte: "difficile", concepts: ["GPO", "Précédence"],
  contexte: "Une politique Computer fixe un proxy `proxy:8080`. Une User Config dit `direct`.",
  enonce: "Sans loopback, qui gagne ?",
  indices: [
    "Computer prime en cas de conflit.",
    "Sauf si loopback est activé.",
    "Ici pas de loopback : la valeur Computer s'applique."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "computer", label: "Computer (proxy:8080)" },
    { value: "user", label: "User (direct)" },
    { value: "merge", label: "Les deux fusionnent" },
    { value: "ignore", label: "Aucun ne s'applique" },
  ]},
  solution: { type: "qcm", bonneReponse: "computer" },
  validation: { tolerance: "stricte" },
});

// C3 — Filtrage de sécurité
exos.push({
  id: "m7-filter-01", module: 7, ordre: 7,
  titre: "Default security filtering",
  difficulte: "facile", concepts: ["GPO", "Filtrage sécurité"],
  contexte: "Une GPO neuve liée à une OU.",
  enonce: "À qui s'applique-t-elle par défaut ?",
  indices: [
    "Default = Authenticated Users.",
    "Tous les utilisateurs et machines authentifiés du domaine.",
    "Si tu retires ce groupe, plus rien ne s'applique."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "auth", label: "Authenticated Users (par défaut)" },
    { value: "domain-users", label: "Domain Users uniquement" },
    { value: "everyone", label: "Everyone, anonymous compris" },
    { value: "admins", label: "Domain Admins uniquement" },
  ]},
  solution: { type: "qcm", bonneReponse: "auth" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m7-filter-02", module: 7, ordre: 8,
  titre: "Restreindre à un groupe",
  difficulte: "moyen", concepts: ["GPO", "Security filtering ciblé"],
  contexte: "Tu veux qu'une GPO ne s'applique qu'au groupe `G_Compta`.",
  enonce: "Que mets-tu dans Security Filtering ?",
  indices: [
    "Retirer Authenticated Users.",
    "Ajouter G_Compta avec Apply.",
    "Et donner Read au groupe (souvent automatique)."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "ok", label: "Retirer Authenticated Users, ajouter G_Compta avec Apply Group Policy." },
    { value: "ko1", label: "Ajouter G_Compta dans la délégation seulement." },
    { value: "ko2", label: "Modifier le DN de la GPO." },
    { value: "ko3", label: "Désactiver la GPO et l'activer au login." },
  ]},
  solution: { type: "qcm", bonneReponse: "ok" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m7-filter-03", module: 7, ordre: 9,
  titre: "Faute classique du filtrage",
  difficulte: "difficile", concepts: ["GPO", "Faute audit"],
  contexte: "Un admin a retiré Authenticated Users du Security Filtering pour 'simplifier'.",
  enonce: "Que se passe-t-il sur un parc déjà à 200 postes ?",
  indices: [
    "Plus aucun groupe n'a Apply.",
    "Aucun objet n'applique la GPO.",
    "Faute typique : on remet Authenticated Users avec uniquement Read pour conserver le pré-requis."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "ok", label: "La GPO ne s'applique plus à personne ; pour cibler un sous-ensemble, il faut laisser Read à Authenticated Users mais retirer Apply, et ajouter Apply au groupe ciblé." },
    { value: "ko1", label: "Rien, tout fonctionne." },
    { value: "ko2", label: "Le DC redémarre." },
    { value: "ko3", label: "Les postes désinstallent Windows." },
  ]},
  solution: { type: "qcm", bonneReponse: "ok" },
  validation: { tolerance: "stricte" },
});

// C4 — Loopback
exos.push({
  id: "m7-loop-01", module: 7, ordre: 10,
  titre: "À quoi sert Loopback ?",
  difficulte: "facile", concepts: ["GPO", "Loopback"],
  contexte: "Tu prépares un parc de bornes en libre-service.",
  enonce: "Pourquoi activer le loopback ?",
  indices: [
    "Tu veux que la User Config dépende du *poste* et pas de l'utilisateur.",
    "Cas typique : salle de classe, borne, kiosque.",
    "Loopback Replace ou Merge."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "ok", label: "Imposer une User Config liée au poste, indépendante de l'utilisateur (kiosque, salle de classe)." },
    { value: "ko1", label: "Améliorer la latence du DC." },
    { value: "ko2", label: "Forcer le redémarrage des postes." },
    { value: "ko3", label: "Désactiver toutes les GPO." },
  ]},
  solution: { type: "qcm", bonneReponse: "ok" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m7-loop-02", module: 7, ordre: 11,
  titre: "Replace vs Merge",
  difficulte: "moyen", concepts: ["GPO", "Loopback Replace/Merge"],
  contexte: "Tu hésites entre les deux modes de loopback.",
  enonce: "Quel est l'effet de `Replace` ?",
  indices: [
    "Replace = ignore complètement la User Config de l'utilisateur.",
    "Merge = fusionne, avec priorité au poste en cas de conflit.",
    "Replace est plus dur."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "ok", label: "Ignore totalement la User Config de l'utilisateur ; seule la User Config liée au poste s'applique." },
    { value: "ko1", label: "Fusionne les deux User Config." },
    { value: "ko2", label: "Désactive Computer Config." },
    { value: "ko3", label: "Bascule l'utilisateur en mode hors ligne." },
  ]},
  solution: { type: "qcm", bonneReponse: "ok" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m7-loop-03", module: 7, ordre: 12,
  titre: "Cas d'usage de Merge",
  difficulte: "difficile", concepts: ["GPO", "Loopback Merge"],
  contexte: "On t'attribue un parc de PC partagés en salle libre-service. Tu veux laisser quelques préférences utilisateur (langue, thème) mais imposer un thème de bureau et des restrictions Office liées au poste.",
  enonce: "Quel mode loopback choisir ?",
  indices: [
    "Tu veux conserver une partie de la User Config utilisateur.",
    "Et superposer celle du poste.",
    "Merge convient."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "merge", label: "Merge" },
    { value: "replace", label: "Replace" },
    { value: "no", label: "Pas de loopback du tout" },
    { value: "site", label: "Site policy" },
  ]},
  solution: { type: "qcm", bonneReponse: "merge" },
  validation: { tolerance: "stricte" },
});

// C5 — LAPS
exos.push({
  id: "m7-laps-01", module: 7, ordre: 13,
  titre: "Qu'est-ce que LAPS ?",
  difficulte: "facile", concepts: ["LAPS"],
  contexte: "On parle de LAPS dans la doc Microsoft.",
  enonce: "Quel est le rôle de LAPS ?",
  indices: [
    "Local Administrator Password Solution.",
    "Gère le mdp admin local de chaque poste.",
    "Stocké chiffré dans AD."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "ok", label: "Gérer et roter automatiquement le mot de passe administrateur local de chaque poste, stocké dans AD." },
    { value: "ko1", label: "Stocker tous les mots de passe utilisateurs en clair." },
    { value: "ko2", label: "Synchroniser les comptes Linux et Windows." },
    { value: "ko3", label: "Désactiver le compte Administrateur local." },
  ]},
  solution: { type: "qcm", bonneReponse: "ok" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m7-laps-02", module: 7, ordre: 14,
  titre: "Pourquoi LAPS bloque le pass-the-hash",
  difficulte: "moyen", concepts: ["LAPS", "Pass-the-hash"],
  contexte: "Sans LAPS, tous les postes ont souvent le même mot de passe admin local.",
  enonce: "Comment LAPS limite-t-il la propagation latérale ?",
  indices: [
    "Mot de passe différent par poste.",
    "Roté tous les 30 jours.",
    "Un hash récupéré ne marche que sur ce poste."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "ok", label: "Chaque poste a un mot de passe admin local unique et roté ; un hash compromis n'ouvre que ce poste." },
    { value: "ko1", label: "LAPS désactive NTLM partout." },
    { value: "ko2", label: "LAPS bloque les ouvertures de session." },
    { value: "ko3", label: "LAPS supprime les comptes admin locaux." },
  ]},
  solution: { type: "qcm", bonneReponse: "ok" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m7-laps-03", module: 7, ordre: 15,
  titre: "Qui peut lire le mdp LAPS ?",
  difficulte: "difficile", concepts: ["LAPS", "Délégation"],
  contexte: "Tu veux que seul ton équipe support puisse lire le mdp admin local des postes utilisateurs.",
  enonce: "Comment limites-tu cet accès ?",
  indices: [
    "Permissions sur les attributs `ms-Mcs-AdmPwd*`.",
    "Délégation au groupe support sur l'OU des postes.",
    "PowerShell : Set-LapsADReadPasswordPermission."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "ok", label: "Déléguer le droit de lecture sur l'attribut LAPS de l'OU des postes au groupe support uniquement." },
    { value: "ko1", label: "Mettre LAPS en cache sur chaque poste." },
    { value: "ko2", label: "Donner Domain Admins à tout le support." },
    { value: "ko3", label: "Activer LAPS uniquement la nuit." },
  ]},
  solution: { type: "qcm", bonneReponse: "ok" },
  validation: { tolerance: "stricte" },
});

// =====================================================================
// MODULE 8 — Audit et incident
// =====================================================================

// C1 — PingCastle
exos.push({
  id: "m8-pc-01", module: 8, ordre: 1,
  titre: "Que fait PingCastle ?",
  difficulte: "facile", concepts: ["PingCastle"],
  contexte: "On te demande d'auditer l'AD avec PingCastle.",
  enonce: "Quel est le livrable principal ?",
  indices: [
    "Rapport HTML avec score sur 100.",
    "Règles classées par sévérité.",
    "Outil gratuit, standard de marché."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "ok", label: "Un rapport HTML avec un score sur 100 et une liste de règles à corriger." },
    { value: "ko1", label: "Une copie de tous les mots de passe en clair." },
    { value: "ko2", label: "Un export Excel des comptes." },
    { value: "ko3", label: "Une mise à jour automatique du domaine." },
  ]},
  solution: { type: "qcm", bonneReponse: "ok" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m8-pc-02", module: 8, ordre: 2,
  titre: "Règle S-PwdNeverExpires",
  difficulte: "moyen", concepts: ["PingCastle", "Règles"],
  contexte: "PingCastle remonte la règle `S-PwdNeverExpires`.",
  enonce: "Que faut-il corriger ?",
  indices: [
    "Comptes avec PasswordNeverExpires=$true.",
    "Notamment côté admin.",
    "Set-ADUser -PasswordNeverExpires $false."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "ok", label: "Corriger les comptes (notamment admin) dont le mot de passe est paramétré pour ne jamais expirer." },
    { value: "ko1", label: "Désactiver PingCastle." },
    { value: "ko2", label: "Forcer un changement de mdp sur tout le domaine." },
    { value: "ko3", label: "Migrer en Azure AD." },
  ]},
  solution: { type: "qcm", bonneReponse: "ok" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m8-pc-03", module: 8, ordre: 3,
  titre: "Score acceptable",
  difficulte: "difficile", concepts: ["PingCastle", "Score"],
  contexte: "Selon l'éditeur, un AD bien tenu vise un score PingCastle proche de quel objectif ?",
  enonce: "Quel score viser pour un AD considéré comme correctement durci ?",
  indices: [
    "≤ 30 : ok.",
    "≤ 20 : bien.",
    "≤ 10 : excellent."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "20", label: "Score ≤ 20" },
    { value: "60", label: "Score ≤ 60" },
    { value: "90", label: "Score ≤ 90" },
    { value: "100", label: "Score = 100" },
  ]},
  solution: { type: "qcm", bonneReponse: "20" },
  validation: { tolerance: "stricte" },
});

// C2 — IoC
exos.push({
  id: "m8-ioc-01", module: 8, ordre: 4,
  titre: "Indicateurs d'une compromission",
  difficulte: "facile", concepts: ["IoC"],
  contexte: "Tu fais une revue d'événements sur les 7 derniers jours.",
  enonce: "Coche les éléments qui sont des indicateurs de compromission probables.",
  indices: [
    "Connexions admin à des heures inhabituelles.",
    "Création soudaine de comptes admin.",
    "Désactivation de Defender via GPO."
  ],
  type: "audit",
  donnees: { anomalies: [
    { value: "logon-nuit", label: "Pic de connexions admin entre 23h et 5h" },
    { value: "creation-da", label: "Création d'un compte placé d'office dans Domain Admins" },
    { value: "defender-off", label: "Désactivation massive de Windows Defender via GPO" },
    { value: "smb-scan", label: "Pic de connexions SMB d'un poste vers tous les autres" },
    { value: "user-sleep", label: "Un utilisateur en arrêt maladie ne se connecte pas pendant 3 jours" },
  ]},
  solution: { type: "audit", bonnesReponses: ["logon-nuit","creation-da","defender-off","smb-scan"] },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m8-ioc-02", module: 8, ordre: 5,
  titre: "Reconnaître la latéralisation",
  difficulte: "moyen", concepts: ["IoC", "Latéralisation"],
  contexte: "Un poste utilisateur ouvre des connexions SMB vers 50 autres postes en 10 minutes.",
  enonce: "Comment qualifies-tu ce comportement ?",
  indices: [
    "C'est anormal pour un poste utilisateur.",
    "Pattern type WannaCry / NotPetya.",
    "C'est de la propagation latérale."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "ok", label: "Une tentative de propagation latérale (worm SMB)" },
    { value: "ko1", label: "Du backup automatique" },
    { value: "ko2", label: "Une mise à jour Windows" },
    { value: "ko3", label: "Un test légitime du support" },
  ]},
  solution: { type: "qcm", bonneReponse: "ok" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m8-ioc-03", module: 8, ordre: 6,
  titre: "GPO non autorisée",
  difficulte: "difficile", concepts: ["IoC", "Persistance"],
  contexte: "Sur un audit GPO, tu repères une nouvelle GPO liée au domaine root, créée par un compte stagiaire 2h avant l'incident.",
  enonce: "Coche les indicateurs préoccupants.",
  indices: [
    "Création par un compte non admin.",
    "Liaison au domaine root (large blast radius).",
    "Timing avant incident."
  ],
  type: "audit",
  donnees: { anomalies: [
    { value: "compte-non-admin", label: "GPO créée par un compte qui n'a normalement pas le droit" },
    { value: "domain-root", label: "Liée au domaine root, donc s'applique partout" },
    { value: "timing", label: "Création peu avant l'incident" },
    { value: "nom-banal", label: "Nom de GPO banal (peu suspect par lui-même)" },
  ]},
  solution: { type: "audit", bonnesReponses: ["compte-non-admin","domain-root","timing"] },
  validation: { tolerance: "stricte" },
});

// C3 — Event Logs
exos.push({
  id: "m8-evt-01", module: 8, ordre: 7,
  titre: "Event ID 4625",
  difficulte: "facile", concepts: ["Event Logs"],
  contexte: "Sur le DC, tu vois un volume anormal d'events 4625.",
  enonce: "Que représente l'event 4625 ?",
  indices: [
    "Échec d'ouverture de session.",
    "Volume anormal = bruteforce probable.",
    "À surveiller en bouclant sur les comptes ciblés."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "fail", label: "Échec d'ouverture de session" },
    { value: "ok", label: "Ouverture de session réussie" },
    { value: "lock", label: "Verrouillage de compte" },
    { value: "create", label: "Création de compte" },
  ]},
  solution: { type: "qcm", bonneReponse: "fail" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m8-evt-02", module: 8, ordre: 8,
  titre: "Event ID 4740",
  difficulte: "moyen", concepts: ["Event Logs"],
  contexte: "Tu reçois une alerte 'Event 4740'.",
  enonce: "Que représente cet event ?",
  indices: [
    "Conséquence d'événements 4625 trop nombreux.",
    "Compte verrouillé.",
    "Source à corréler avec un incident."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "lock", label: "Verrouillage de compte" },
    { value: "fail", label: "Échec d'ouverture de session" },
    { value: "delete", label: "Suppression de compte" },
    { value: "rdp", label: "Connexion RDP" },
  ]},
  solution: { type: "qcm", bonneReponse: "lock" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m8-evt-03", module: 8, ordre: 9,
  titre: "Event ID 4732 sur un groupe critique",
  difficulte: "difficile", concepts: ["Event Logs", "Privilèges"],
  contexte: "Un event 4732 indique l'ajout d'un membre à un groupe.",
  enonce: "Quel cas est le plus critique à surveiller ?",
  indices: [
    "4728 = ajout dans un groupe global.",
    "4732 = ajout dans un groupe domaine-local.",
    "Critique : ajout dans Administrators / Domain Admins."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "ok", label: "Ajout dans un groupe administratif (Administrators, Domain Admins, …)" },
    { value: "ko1", label: "Ajout dans Domain Users" },
    { value: "ko2", label: "Ajout dans un groupe de distribution mail" },
    { value: "ko3", label: "Ajout dans Authenticated Users" },
  ]},
  solution: { type: "qcm", bonneReponse: "ok" },
  validation: { tolerance: "stricte" },
});

// C4 — Réponse incident séquence
exos.push({
  id: "m8-resp-01", module: 8, ordre: 10,
  titre: "Première action sur un compte suspect",
  difficulte: "facile", concepts: ["Réponse incident"],
  contexte: "Tu suspectes que `s.lefevre` est compromis.",
  enonce: "Quelle est la *première* action à effectuer ?",
  indices: [
    "Geler le compte (Disable + reset mdp).",
    "Capturer ensuite les sessions.",
    "Surtout pas attendre."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "geler", label: "Geler le compte (Disable-ADAccount puis reset mdp)" },
    { value: "supprimer", label: "Supprimer le compte" },
    { value: "ignorer", label: "Ignorer, attendre confirmation par l'utilisateur" },
    { value: "promouvoir", label: "Le promouvoir Domain Admin pour vérifier" },
  ]},
  solution: { type: "qcm", bonneReponse: "geler" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m8-resp-02", module: 8, ordre: 11,
  titre: "Faute classique du débutant",
  difficulte: "moyen", concepts: ["Réponse incident", "Forensic"],
  contexte: "Le débutant veut 'tout réinitialiser' immédiatement.",
  enonce: "Pourquoi reset le mot de passe avant la capture des sessions actives est risqué ?",
  indices: [
    "Cela ferme les sessions actives.",
    "On perd les indices côté Kerberos.",
    "Capturer d'abord, puis reset."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "ok", label: "On ferme les sessions actives et on perd les indices côté Kerberos avant de les avoir capturés." },
    { value: "ko1", label: "Cela viole le RGPD." },
    { value: "ko2", label: "Le DC redémarre tout seul." },
    { value: "ko3", label: "Le compte est définitivement bloqué." },
  ]},
  solution: { type: "qcm", bonneReponse: "ok" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m8-resp-03", module: 8, ordre: 12,
  titre: "Séquence complète d'un incident",
  difficulte: "difficile", concepts: ["Réponse incident"],
  contexte: "Tu rédiges la procédure incident standard.",
  enonce: "Coche les étapes qui doivent figurer dans la séquence.",
  indices: [
    "Geler, capturer, identifier, confiner, restaurer, renforcer.",
    "L'ordre compte mais la consigne demande la liste.",
    "Tout doit être présent."
  ],
  type: "audit",
  donnees: { anomalies: [
    { value: "geler", label: "Geler les comptes compromis" },
    { value: "capturer", label: "Capturer les sessions actives, logs, indicateurs" },
    { value: "identifier", label: "Identifier le périmètre (blast radius)" },
    { value: "confiner", label: "Confiner les machines et VLAN compromis" },
    { value: "restaurer", label: "Restaurer depuis sauvegarde froide immuable" },
    { value: "renforcer", label: "Renforcer l'AD (Protected Users, LAPS, MFA)" },
    { value: "screenshot", label: "Faire des captures d'écran pour LinkedIn" },
  ]},
  solution: { type: "audit", bonnesReponses: ["geler","capturer","identifier","confiner","restaurer","renforcer"] },
  validation: { tolerance: "stricte" },
});

// C5 — Cas synthèse rançongiciel
exos.push({
  id: "m8-cas-01", module: 8, ordre: 13,
  titre: "Cas Clinique Martin — diagnostic",
  difficulte: "facile", concepts: ["Cas E7", "Diagnostic"],
  contexte: "Le rapport PingCastle de la Clinique Martin remonte : `S-PwdNeverExpires` + `A-NotProtectedUsers` + `S-OldNtlm`.",
  enonce: "Coche les 3 mesures correspondantes à mettre en oeuvre.",
  indices: [
    "PwdNeverExpires → reset + Set-ADUser sur les comptes admin.",
    "NotProtectedUsers → Add-ADGroupMember 'Protected Users'.",
    "OldNtlm → désactiver NTLMv1."
  ],
  type: "audit",
  donnees: { anomalies: [
    { value: "fix-pne", label: "Désactiver PasswordNeverExpires sur les comptes admin" },
    { value: "fix-protected", label: "Ajouter les admins au groupe Protected Users" },
    { value: "fix-ntlm", label: "Désactiver NTLMv1 dans la stratégie de sécurité" },
    { value: "reinstall", label: "Réinstaller Windows sur tous les postes" },
  ]},
  solution: { type: "audit", bonnesReponses: ["fix-pne","fix-protected","fix-ntlm"] },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m8-cas-02", module: 8, ordre: 14,
  titre: "Cas Ville-du-Parc — confinement",
  difficulte: "moyen", concepts: ["Cas E7", "Confinement"],
  contexte: "Rançongiciel détecté à 22h35. Tu prends la main à 22h40.",
  enonce: "Coche les actions immédiates de confinement.",
  indices: [
    "Couper la propagation : isoler VLAN.",
    "Désactiver les comptes compromis.",
    "NE PAS éteindre brutalement les machines (perte de RAM)."
  ],
  type: "audit",
  donnees: { anomalies: [
    { value: "isoler-vlan", label: "Isoler les VLAN où la propagation est observée" },
    { value: "disable-comptes", label: "Désactiver les comptes admin et comptes compromis" },
    { value: "couper-internet", label: "Couper l'accès Internet sortant des serveurs critiques" },
    { value: "eteindre-poste", label: "Éteindre brutalement les postes (faux : on perd la RAM)" },
    { value: "appeler-cnil", label: "Appeler la CNIL avant tout (faux : pas la priorité H+0)" },
  ]},
  solution: { type: "audit", bonnesReponses: ["isoler-vlan","disable-comptes","couper-internet"] },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m8-cas-03", module: 8, ordre: 15,
  titre: "Cas synthèse — reconstruction",
  difficulte: "difficile", concepts: ["Cas E7", "Reconstruction"],
  contexte: "L'incident est circonscrit. Tu dois reconstruire l'AD à partir d'une sauvegarde antérieure à l'attaque.",
  enonce: "Coche les principes de reconstruction.",
  indices: [
    "Sauvegarde froide immuable (jamais sur le même AD).",
    "Restaurer DC + reset des secrets KRBTGT 2 fois.",
    "Renforcer (PAW, MFA, durcissement) AVANT remise en prod."
  ],
  type: "audit",
  donnees: { anomalies: [
    { value: "sauvegarde-froide", label: "Restaurer depuis une sauvegarde froide immuable, jamais sur le même AD" },
    { value: "reset-krbtgt", label: "Réinitialiser le mot de passe du compte KRBTGT (deux fois espacées)" },
    { value: "durcir-avant", label: "Durcir l'AD (Protected Users, LAPS, MFA) avant remise en prod" },
    { value: "restore-attaque", label: "Restaurer la sauvegarde du jour de l'attaque (faux : elle est compromise)" },
  ]},
  solution: { type: "audit", bonnesReponses: ["sauvegarde-froide","reset-krbtgt","durcir-avant"] },
  validation: { tolerance: "stricte" },
});

// =====================================================================
// MODULE 2 — C6 (gap E7) : Adapter un script existant
// =====================================================================
exos.push({
  id: "m2-script-01", module: 2, ordre: 16,
  titre: "Adapter un script : filtrer par département",
  difficulte: "facile", concepts: ["Adapter un script", "Filter Department"],
  contexte: "Le script suivant ramène TOUS les comptes du domaine. Tu dois l'adapter pour ne ramener que ceux du département `Compta`.",
  enonce: "Modifie le script pour qu'il ne retourne que les comptes du département Compta.",
  indices: [
    "Ne change pas la cmdlet (`Get-ADUser`).",
    "Modifie l'argument de `-Filter` pour cibler `Department`.",
    "Solution : `Get-ADUser -Filter { Department -eq \"Compta\" }`."
  ],
  type: "compare-output",
  donnees: { snapshot: SNAP, initialCode: "Get-ADUser -Filter *" },
  solution: { type: "compare-output", sams: ["p.martin","stage.compta"] },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m2-script-02", module: 2, ordre: 17,
  titre: "Adapter un script : passer désactivés → verrouillés",
  difficulte: "moyen", concepts: ["Adapter un script", "Where-Object"],
  contexte: "Ton collègue a écrit un script qui liste les comptes désactivés. Tu dois l'adapter pour qu'il liste les comptes verrouillés à la place.",
  enonce: "Modifie le `Where-Object` pour ramener les comptes verrouillés (`LockedOut`).",
  indices: [
    "Garde la structure `Get-ADUser -Filter * | Where-Object { ... }`.",
    "Remplace `Enabled -eq $false` par `LockedOut -eq $true`.",
    "Un seul compte est verrouillé dans cet AD."
  ],
  type: "compare-output",
  donnees: { snapshot: SNAP,
    initialCode: "Get-ADUser -Filter * | Where-Object { $_.Enabled -eq $false }"
  },
  solution: { type: "compare-output", sams: ["c.rousseau"] },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m2-script-03", module: 2, ordre: 18,
  titre: "Adapter un script de surveillance : inactifs ET actifs",
  difficulte: "difficile", concepts: ["Adapter un script", "Pipeline composé"],
  contexte: "Le script de surveillance ramène tous les comptes inactifs depuis 90 jours, mais il inclut aussi les comptes désactivés (faux positifs). Tu dois affiner pour ne garder que les comptes inactifs ET activés (vrais comptes oubliés).",
  enonce: "Adapte le script pour exclure les comptes désactivés.",
  indices: [
    "Garde `Search-ADAccount -AccountInactive -TimeSpan 90 -UsersOnly`.",
    "Ajoute un `Where-Object` pour filtrer `Enabled -eq $true`.",
    "Solution : `Search-ADAccount -AccountInactive -TimeSpan 90 -UsersOnly | Where-Object { $_.Enabled -eq $true }`."
  ],
  type: "compare-output",
  donnees: { snapshot: SNAP,
    initialCode: "Search-ADAccount -AccountInactive -TimeSpan 90 -UsersOnly"
  },
  solution: { type: "compare-output", sams: ["l.dubois"] },
  validation: { tolerance: "stricte" },
});

// =====================================================================
// MODULE 6 — C6 (gap E7) : Kerberos
// =====================================================================
exos.push({
  id: "m6-kerberos-01", module: 6, ordre: 16,
  titre: "Que signifie KDC ?",
  difficulte: "facile", concepts: ["Kerberos", "KDC"],
  contexte: "Dans la doc Microsoft sur l'authentification Windows.",
  enonce: "Que signifie l'acronyme KDC ?",
  indices: [
    "K = Key.",
    "D = Distribution.",
    "C = Center."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "ok", label: "Key Distribution Center" },
    { value: "ko1", label: "Kerberos Domain Controller" },
    { value: "ko2", label: "Key Domain Cache" },
    { value: "ko3", label: "Kernel Daemon Controller" },
  ]},
  solution: { type: "qcm", bonneReponse: "ok" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m6-kerberos-02", module: 6, ordre: 17,
  titre: "TGT vs TGS : ordre",
  difficulte: "moyen", concepts: ["Kerberos", "TGT", "TGS"],
  contexte: "Tu schématises le flux Kerberos pour ton rapport.",
  enonce: "Quel ticket l'utilisateur reçoit-il en premier après l'authentification ?",
  indices: [
    "TGT = Ticket Granting Ticket, délivré par le KDC à l'authentification.",
    "TGS = Ticket Granting Service, délivré ensuite pour chaque service.",
    "Ordre : TGT d'abord (preuve d'identité), puis TGS (preuve d'autorisation pour service)."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "tgt", label: "TGT (Ticket Granting Ticket)" },
    { value: "tgs", label: "TGS (Ticket Granting Service)" },
    { value: "nt", label: "Un hash NTLM" },
    { value: "session", label: "Une clé de session AES" },
  ]},
  solution: { type: "qcm", bonneReponse: "tgt" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m6-kerberos-03", module: 6, ordre: 18,
  titre: "Pourquoi NTLM est faible vs Kerberos",
  difficulte: "difficile", concepts: ["Kerberos", "NTLM", "Pass-the-hash"],
  contexte: "Question d'audit ANSSI : justifier pourquoi NTLM est marqué obsolète.",
  enonce: "Quelle est la principale faiblesse de NTLM par rapport à Kerberos ?",
  indices: [
    "Kerberos : authentification mutuelle (client + serveur prouvent leur identité), tickets à durée limitée, anti-rejeu.",
    "NTLM : authentification unilatérale (serveur ne prouve rien), hash réutilisable = pass-the-hash possible.",
    "Réponse : NTLM ne fait pas d'authentification mutuelle et expose au pass-the-hash."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "ok", label: "Pas d'authentification mutuelle, hash réutilisable → vulnérable au pass-the-hash" },
    { value: "ko1", label: "NTLM ne supporte pas Unicode" },
    { value: "ko2", label: "NTLM consomme plus de bande passante" },
    { value: "ko3", label: "NTLM ne fonctionne pas hors connexion" },
  ]},
  solution: { type: "qcm", bonneReponse: "ok" },
  validation: { tolerance: "stricte" },
});

// =====================================================================
// MODULE 8 — C6 (gap E7) : WEF / Centralisation des journaux
// =====================================================================
exos.push({
  id: "m8-wef-01", module: 8, ordre: 16,
  titre: "Que signifie WEF ?",
  difficulte: "facile", concepts: ["WEF"],
  contexte: "Dans la doc Microsoft sur la centralisation des Event Logs.",
  enonce: "Que signifie WEF ?",
  indices: [
    "W = Windows.",
    "E = Event.",
    "F = Forwarding."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "ok", label: "Windows Event Forwarding" },
    { value: "ko1", label: "Windows Event Filter" },
    { value: "ko2", label: "Windows Encryption Framework" },
    { value: "ko3", label: "Workstation Event Federation" },
  ]},
  solution: { type: "qcm", bonneReponse: "ok" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m8-wef-02", module: 8, ordre: 17,
  titre: "Push (source-initiated) vs Pull (collector-initiated)",
  difficulte: "moyen", concepts: ["WEF", "Architecture"],
  contexte: "Tu déploies WEF sur un parc 200 postes en agence, dont 50 derrière un pare-feu strict (ports sortants limités).",
  enonce: "Quel mode WEF privilégier dans ce cas ?",
  indices: [
    "Pull (collector-initiated) : le collecteur va chercher, donc ports entrants à ouvrir sur chaque poste.",
    "Push (source-initiated) : le poste pousse, donc un seul port sortant vers le collecteur.",
    "En pare-feu strict : Push est plus simple (un seul flux sortant à autoriser)."
  ],
  type: "qcm",
  donnees: { options: [
    { value: "push", label: "Source-initiated (push) — un seul flux sortant à autoriser depuis chaque poste" },
    { value: "pull", label: "Collector-initiated (pull) — il faut ouvrir les ports entrants sur chaque poste" },
    { value: "syslog", label: "Syslog UDP en clair" },
    { value: "smb", label: "Partage SMB sur le DC" },
  ]},
  solution: { type: "qcm", bonneReponse: "push" },
  validation: { tolerance: "stricte" },
});
exos.push({
  id: "m8-wef-03", module: 8, ordre: 18,
  titre: "Abonnement baseline ANSSI : que collecter ?",
  difficulte: "difficile", concepts: ["WEF", "Audit", "ANSSI"],
  contexte: "Tu prépares un abonnement WEF 'baseline' pour la collecte minimale recommandée par l'ANSSI.",
  enonce: "Coche les Event IDs à inclure absolument dans la baseline.",
  indices: [
    "Authentification : 4624 (succès), 4625 (échec).",
    "Comptes : 4720 (création), 4732 (ajout groupe DL).",
    "Sécurité : 4740 (verrouillage), 1102 (effacement journal).",
    "Pas dans la baseline minimale : 4634 (logoff), 5379 (Credential Manager read)."
  ],
  type: "audit",
  donnees: { anomalies: [
    { value: "4624", label: "4624 — ouverture de session réussie" },
    { value: "4625", label: "4625 — échec d'ouverture de session" },
    { value: "4720", label: "4720 — création de compte" },
    { value: "4732", label: "4732 — ajout dans un groupe domaine-local" },
    { value: "4740", label: "4740 — verrouillage de compte" },
    { value: "1102", label: "1102 — effacement du journal de sécurité (IoC critique)" },
    { value: "4634", label: "4634 — fermeture de session (volume énorme, peu utile en baseline)" },
  ]},
  solution: { type: "audit", bonnesReponses: ["4624","4625","4720","4732","4740","1102"] },
  validation: { tolerance: "stricte" },
});

// =====================================================================
// Génération des fichiers
// =====================================================================

const OUT = path.join(process.cwd(), "content", "exercices");
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

let count = 0;
for (const exo of exos) {
  const file = path.join(OUT, `${exo.id}.json`);
  fs.writeFileSync(file, JSON.stringify(exo, null, 2) + "\n", "utf8");
  count++;
}

// Stats par module
const byModule = new Map<number, number>();
for (const e of exos) byModule.set(e.module, (byModule.get(e.module) ?? 0) + 1);
console.log(`✅ ${count} exos générés dans ${OUT}`);
for (const [m, n] of [...byModule.entries()].sort((a, b) => a[0] - b[0])) {
  console.log(`  module ${m}: ${n} exos`);
}
