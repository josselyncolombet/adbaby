# Module 8 — Audit et incident

C'est le module qui rapporte le plus de points en E7 : on te donne un AD imparfait (extrait PingCastle, capture événements, ligne PowerShell d'attaquant) et on attend de toi *un diagnostic structuré + un plan d'action*. Les sujets *Métropole 2023* et *Métropole 2024* y consacrent un dossier complet.

## 1. PingCastle — l'audit standard

[PingCastle](https://www.pingcastle.com) est l'outil d'audit AD **gratuit** le plus utilisé en France (par l'ANSSI, par les SI public). Il sort un rapport HTML avec un score sur 100 et des règles classées par sévérité.

| Règle PingCastle | Cause typique |
|---|---|
| `S-DC-Coerce` | DC vulnérable à NTLM Coerce (PetitPotam). Patch + désactiver NTLM. |
| `S-PwdNeverExpires` | Comptes admin avec `PasswordNeverExpires=true`. |
| `S-OldNtlm` | NTLMv1 encore autorisé. |
| `A-AdminCount` | Comptes anciennement Domain Admin avec ACL héritées d'AdminSDHolder. |
| `A-NotProtectedUsers` | Comptes admins absents de `Protected Users`. |

> 📖 **À retenir** : à l'E7, on attend que tu sois capable d'**identifier la règle** et de **proposer la remédiation**. Pas de panique, c'est toujours du PowerShell qu'on a vu modules 3-6.

## 2. Reconnaissance des indicateurs de compromission

Quelques signaux qui doivent te mettre en alerte :

| Signal | Interprétation possible |
|---|---|
| Pic de connexions **après 22h** depuis un compte de comptable. | Compte compromis ou usage par un tiers. |
| Création soudaine d'un compte **dans Domain Admins**. | Persistance d'un attaquant. |
| Désactivation massive de Windows Defender via GPO. | Préparation à un déploiement de rançongiciel. |
| Ouverture de ports SMB depuis un poste vers tous les autres. | Latéralisation type *WannaCry*. |
| Création d'un **GPO** liée au domaine root, par un compte non-admin. | Élévation de privilèges via délégation mal configurée. |

## 3. Lire les Event Logs côté DC

Les events à connaître :

| Event ID | Source | Sens |
|---|---|---|
| `4625` | Security | échec d'ouverture de session. Volume anormal = bruteforce. |
| `4740` | Security | compte verrouillé. |
| `4624` | Security | ouverture de session réussie. Filtre par *LogonType=10* pour les RDP. |
| `4720` | Security | compte créé. |
| `4728` / `4732` | Security | ajout d'un membre dans un groupe global / domaine-local. |

```powershell
# Compter les 4625 sur les 7 derniers jours par compte
Get-WinEvent -FilterHashtable @{
  LogName = 'Security'; Id = 4625;
  StartTime = (Get-Date).AddDays(-7)
} | Group-Object -Property { $_.Properties[5].Value } | Sort-Object Count -Descending
```

## 4. Réponse à incident — le déroulé attendu

Si on te dit "un compte semble compromis", la séquence canonique est :

1. **Geler** le compte : `Disable-ADAccount` + `Set-ADAccountPassword -Reset`.
2. **Capturer** les éléments : Event Logs, sessions actives (`Get-NetSession`), historique connexions.
3. **Identifier** le *blast radius* : qu'a-t-il fait, où s'est-il connecté, quels droits a-t-il utilisés ?
4. **Confiner** : déconnecter du réseau les machines compromises, isoler les VLAN.
5. **Restaurer** : depuis sauvegarde *froide* (immuable, hors ligne) — *jamais* depuis une sauvegarde sur le même AD.
6. **Renforcer** : appliquer les mesures correctives (Protected Users, LAPS, MFA, durcissement GPO).

> ⚠️ **Avertissement** : *ne pas* réinitialiser le mot de passe avant capture des sessions actives. Tu perdrais les indices côté Kerberos.

## 5. Cas type : rançongiciel

Le scénario *Metropole 2025* simule une attaque rançongiciel.

```
J-7  : phishing reçu sur compte compta.
J-6  : exécution macro Word → reverse shell.
J-3  : latéralisation via SMB vers serveur fichiers.
J-1  : élévation Domain Admin via Mimikatz + Pass-the-Hash.
J0   : 22h35, déploiement rançongiciel via GPO.
```

À chaque étape on attend que tu cites :

- **L'indicateur** observable.
- **La mesure préventive** qui aurait stoppé l'attaque (filtrage mail, désactivation macros, LAPS, Protected Users, segmentation VLAN, sauvegardes immuables).

---

## 6. Centralisation des journaux : Windows Event Forwarding (WEF)

Sans centralisation, les Event Logs restent sur chaque poste. Si un attaquant les efface (`wevtutil cl Security` ou Event 1102), tu n'as plus rien. **WEF (Windows Event Forwarding)** transfère les événements vers un **collecteur** (un serveur Windows dédié) en quasi-temps réel, via un canal HTTPS chiffré.

### Deux modes de déploiement

| Mode | Qui initie ? | Quand utiliser ? |
|---|---|---|
| **Source-initiated (Push)** | le poste pousse vers le collecteur | parc large (200+ postes), pare-feu strict, GPO centralisée. **Choix par défaut**. |
| **Collector-initiated (Pull)** | le collecteur va chercher | parc petit, contrôle fin par poste. Demande des ports entrants ouverts. |

### Pré-requis côté GPO (mode push)

1. Démarrer et démarrer auto le service `WinRM` sur les postes.
2. Configurer l'URL du collecteur dans la GPO : `Configure target Subscription Manager`.
3. Donner au compte machine du collecteur (`NT AUTHORITY\NetworkService`) la permission de lire le log Security.

### Abonnement « baseline » ANSSI

L'ANSSI publie un guide listant les Event IDs minimaux à collecter. Les incontournables :

| Event ID | Sens | Critique en SOC |
|---|---|---|
| 4624 | ouverture de session réussie | corréler logon admins |
| 4625 | échec d'ouverture | détecter bruteforce |
| 4720 | création de compte | persistance attaquant |
| 4732 | ajout dans groupe domaine-local (Administrators) | élévation |
| 4740 | verrouillage | conséquence bruteforce |
| **1102** | **effacement du journal Security** | **IoC critique** — un attaquant qui couvre ses traces |

> 📖 **À retenir pour E7** : si on te demande "comment fiabiliser la détection sur 50 postes", la réponse en deux temps est *(1) WEF en source-initiated*, *(2) abonnement baseline avec a minima 4624, 4625, 4720, 4732, 4740, 1102*.

> ⚠️ **Avertissement** : ne collecte **pas** 4634 (logoff) ni 5061 (cryptographic operations) en baseline — volume énorme, valeur faible. Tu noies le SOC.

---

## Récap rapide

- Audit régulier : PingCastle (gratuit), Microsoft Security Compliance Toolkit.
- 5 events Security à connaître (4625, 4740, 4624, 4720, 4728/4732).
- Séquence d'incident : **Geler → Capturer → Identifier → Confiner → Restaurer → Renforcer**.
- Sauvegardes **froides immuables** = ta dernière ligne de défense.
