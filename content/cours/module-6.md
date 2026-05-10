# Module 6 — Comptes privilégiés et sécurité

C'est ici que le SISR justifie son nom : **Sécurité**. Les compromissions AD viennent à 80 % d'un mauvais usage des comptes privilégiés. Le sujet *Métropole 2024 — Clinique Martin* y consacre un dossier entier.

## 1. Le triangle des droits

```
            [Enterprise Admins]   ← niveau forêt
                    │
            [Domain Admins]       ← niveau domaine, racine de tout
                    │
       ┌────────────┼────────────┐
[Server Operators] [Backup Op.] [Account Op.]   ← rôles métiers
                    │
           [Administrateurs locaux]              ← sur chaque poste/serveur
```

Plus tu montes, plus la compromission est large.

## 2. Le tier model (modèle ANSSI)

Découpe les comptes en **3 niveaux** étanches :

| Tier | Compte type | Ressource accédée |
|---|---|---|
| **Tier 0** | `a.dupont` (admin du domaine) | DC, AD, PKI |
| **Tier 1** | `s.dupont` (admin serveur) | serveurs membres |
| **Tier 2** | `j.dupont` (utilisateur normal) | postes utilisateurs |

> ⚠️ **Avertissement** : un compte tier 0 ne doit **jamais** ouvrir de session sur un poste tier 2. Une seule session interactive sur un poste compromis suffit à exfiltrer le hash NTLM et à *pwn* le domaine.

## 3. Le groupe `Protected Users`

Mettre un compte admin dans `Protected Users` impose :

- Pas de cache d'identifiants (pas de hash NTLM stocké).
- Pas de Kerberos *unconstrained delegation*.
- Pas de RC4 Kerberos (uniquement AES).
- Durée de TGT réduite à 4h.

```powershell
Add-ADGroupMember -Identity "Protected Users" -Members a.dupont
```

> 📖 **À retenir** : c'est la première mesure à proposer pour les comptes Domain Admins, recommandée par l'ANSSI et l'audit PingCastle.

## 4. AdminSDHolder

C'est un objet *spécial* dans `CN=System,DC=…` dont les ACL sont **recopiées toutes les heures** sur tous les comptes admins (Domain Admins, Enterprise Admins, etc.). Si un attaquant modifie les permissions sur un compte admin, AdminSDHolder *réécrase* sa modification.

> 💡 **Astuce** : si tu modifies les ACL d'un compte admin et qu'elles "reviennent toutes seules" 60 min après, ce n'est pas un bug : c'est AdminSDHolder qui fait son boulot.

## 5. Comptes de service et MSA

Pour les services Windows (SQL Server, IIS app pool, etc.), **n'utilise pas un compte humain**. Utilise :

- Un **Managed Service Account (MSA)** pour un service sur une seule machine.
- Un **group Managed Service Account (gMSA)** pour un service sur un cluster.

```powershell
# Créer un gMSA
New-ADServiceAccount -Name "gmsa-sql01" `
  -DNSHostName "sql01.pme.local" `
  -PrincipalsAllowedToRetrieveManagedPassword "G_SQL_Servers"
```

Avantages : mot de passe géré automatiquement (240 caractères, rotation 30 jours), pas de mot de passe stocké en clair dans un script.

## 6. Règles d'or (à restituer à l'écrit)

1. **Deux comptes par admin** : `j.dupont` pour le quotidien, `a.j.dupont` pour les opérations privilégiées.
2. **Comptes admins dans `Protected Users`**.
3. **Pas de session interactive admin sur poste utilisateur**. On utilise un *bastion* / poste d'administration dédié (PAW).
4. **Vidange des groupes super-privilégiés** (`Schema Admins`, `Enterprise Admins`) hors opération.
5. **Audit régulier** des `Domain Admins` : `Get-ADGroupMember "Domain Admins"`.

---

## 7. Kerberos en deux écrans

Kerberos est le protocole d'authentification **standard** dans un domaine AD. NTLM, son ancêtre, n'est conservé que pour la rétro-compatibilité.

### Acteurs

- **KDC (Key Distribution Center)** : porté par le DC. Il délivre les tickets.
- **TGT (Ticket Granting Ticket)** : preuve d'identité, valable typiquement 10h (4h dans `Protected Users`).
- **TGS (Ticket Granting Service)** : ticket d'accès à un service précis (un partage, SQL, IIS…), demandé en présentant le TGT.

### Flux simplifié (6 étapes)

```
1. Client envoie au KDC : "je suis alice, voici la preuve" (timestamp chiffré avec hash mdp)
2. KDC répond : "voici ton TGT" (chiffré pour le KDC, valide 10h)
3. Client veut accéder à \\srv-fic. Il envoie au KDC : "TGT + je veux \\srv-fic"
4. KDC répond : "voici un TGS pour \\srv-fic"
5. Client envoie le TGS à \\srv-fic
6. \\srv-fic vérifie le TGS et donne accès
```

### Kerberos vs NTLM — pourquoi NTLM est faible

| Critère | Kerberos | NTLM |
|---|---|---|
| Authentification mutuelle (le serveur prouve aussi son identité) | ✅ | ❌ |
| Anti-rejeu (timestamps) | ✅ | ❌ |
| Tickets à durée limitée | ✅ | hash réutilisable |
| Vulnérabilité pass-the-hash | non | **oui** |

> 📖 **À retenir pour E7** : si on te demande de justifier le passage à Kerberos, deux mots-clés suffisent : *authentification mutuelle* et *non-réutilisabilité des tickets*.

---

## Audit rapide des comptes privilégiés

```powershell
# Qui est Domain Admin ?
Get-ADGroupMember -Identity "Domain Admins" |
  Select-Object SamAccountName, ObjectClass

# Qui n'expire jamais et qui est admin ?
Get-ADGroupMember "Domain Admins" |
  Get-ADUser -Properties PasswordNeverExpires |
  Where-Object { $_.PasswordNeverExpires -eq $true }
```
