# Module 7 — GPO et stratégies

Les **GPO (Group Policy Objects)** sont la façon native d'imposer des paramètres (sécurité, déploiement, restrictions) sur un parc Windows joint au domaine. Au BTS SIO SISR, tu n'écris pas de GPO en PowerShell mais tu dois savoir les *lire*, *interpréter une faute d'audit* et *expliquer le mécanisme*.

## 1. Concept

Une GPO est un **conteneur de paramètres** Windows lié à :

- la racine du **domaine** (toutes les machines / users du domaine),
- une **OU** (uniquement les objets de cette OU),
- un **site** AD (rare, surtout multi-sites géographiques).

Ordre d'application : **L** ocal → **S** ite → **D** omaine → **O** U (LSDO). La dernière GPO appliquée gagne.

## 2. Les deux moitiés d'une GPO

Une GPO contient deux configurations :

- **Computer Configuration** : appliquée au *poste* au démarrage, indépendamment de l'utilisateur connecté (ex. paramètres pare-feu, redémarrages, scripts de démarrage).
- **User Configuration** : appliquée à *l'utilisateur* à l'ouverture de session (ex. lecteurs réseaux, fond d'écran, restrictions IE).

> 📖 **À retenir** : les paramètres "Computer" priment sur les paramètres "User" en cas de conflit, sauf en mode *loopback*.

## 3. Filtrage et ciblage

Une GPO liée à une OU s'applique **par défaut à tous les objets** de l'OU. Tu peux restreindre :

- **Filtrage de sécurité** : seuls les groupes / users listés dans *Security Filtering* l'appliquent.
- **Filtrage WMI** : applique uniquement si la requête WMI est vraie (ex. `Win32_OperatingSystem WHERE Caption LIKE 'Windows 11%'`).
- **Item-level targeting** (Préférences) : très fin, par utilisateur, groupe, IP, etc.

> ⚠️ **Avertissement** : si le filtrage de sécurité retire `Authenticated Users`, **plus personne** n'applique la GPO. Faute classique en sortie de mauvais durcissement.

## 4. Loopback policy

Quand tu veux appliquer la **User Configuration** d'une GPO en fonction du *poste* (et non de l'utilisateur), tu actives **User Group Policy Loopback Processing Mode** :

- **Replace** : remplace la User Config de l'utilisateur par celle des GPO du poste.
- **Merge** : combine les deux.

C'est typiquement utilisé sur les **postes en libre-service** (bornes, salles de classe) pour imposer un environnement neutre quel que soit l'utilisateur connecté.

## 5. Quelques GPO de durcissement attendues à l'E7

| Objectif | Paramètre |
|---|---|
| Désactiver SMBv1 | `Computer\Admin Templates\Network\Lanman Workstation\Enable insecure guest logons` ; SMB1 désinstallé via Optional Features. |
| Forcer le pare-feu | `Computer\Windows Settings\Security Settings\Windows Defender Firewall` |
| Verrouiller la session après 10 min | `Computer\Policies\Windows Settings\Security Settings\Local Policies\Security Options\Interactive logon: Machine inactivity limit` |
| Bloquer l'exécution de scripts | `Computer\Policies\Administrative Templates\Windows Components\Windows PowerShell\Turn on Script Execution: AllSigned` |
| LAPS (mot de passe admin local) | déploiement via *Microsoft LAPS GPO Templates*. |

## 6. LAPS — l'incontournable

**LAPS (Local Administrator Password Solution)** fait tourner automatiquement le mot de passe administrateur local de chaque poste. Il est stocké chiffré dans un attribut AD lisible uniquement par les comptes/groupes habilités.

Avantage côté audit : plus de mot de passe admin local **identique partout** (faute *Pass-the-Hash* immédiate).

> 💡 **Astuce** : à l'E7, si on te demande "comment empêcher la propagation latérale dans le domaine ?", LAPS est dans le top 3 des bonnes réponses.

---

## Récap rapide

- Ordre d'application : **L** ocal → **S** ite → **D** omaine → **O** U.
- Une GPO = Computer Config + User Config.
- Filtrage de sécurité : *Authenticated Users* doit rester pour que la GPO s'applique.
- LAPS = la mesure de durcissement standard pour les admins locaux.
