# Portail des Activités Universitaires — UCA

Application web full-stack permettant aux étudiants et professeurs de l'Université Cadi Ayyad (UCA) de soumettre des demandes de réservation de salles pour des activités universitaires (conférences, ateliers, séminaires, événements sportifs, culturels…), et aux administrateurs de les gérer.

---

##  Démo en ligne

[https://zzidani4800.github.io/activites-universitaires](https://zzidani4800.github.io/activites-universitaires)

---

##  Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 19, React Router , Tailwind CSS |
| Backend | Spring Boot 3.3, Spring Security, JPA/Hibernate |
| Base de données | MySQL (H2 pour les tests) |
| Authentification | JWT (jjwt 0.12.5) |
| Notifications | Spring Mail (Gmail SMTP) |
| CI/CD | GitHub Actions |
| Déploiement frontend | GitHub Pages |
| Déploiement backend | Railway |

---

## Fonctionnalités

###  Utilisateur (Étudiant / Professeur)
- Inscription et connexion sécurisée (JWT)
- Soumission d'une demande de réservation de salle (amphithéâtre, laboratoire, salle polyvalente…)
- Suivi de l'état des demandes (En attente, Confirmé, Refusé, Annulé)
- Annulation d'une réservation avec formulaire de motivation
- Consultation de ses réservations avec filtres

### Administrateur
- Tableau de bord avec gestion complète des demandes
- Validation ou refus des demandes (avec motif)
- Gestion des utilisateurs (création, consultation)
- Gestion des événements

---

## Structure du projet
```
activites-universitaires/
├── .github/workflows/
├── backend/portail/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
│       ├── main/java/ma/uca/portail/
│       │   ├── config/
│       │   ├── controller/
│       │   ├── dto/
│       │   ├── exception/
│       │   ├── model/
│       │   ├── repository/
│       │   ├── security/
│       │   └── service/
│       └── test/
└── frontend/
    ├── public/
    └── src/
        ├── __tests__/
        ├── components/
        ├── contexts/
        ├── pages/
        └── services/
```

---

## Installation locale

### Prérequis
- Java 17+
- Node.js 18+
- MySQL

### Backend

```bash
cd backend/portail
export DATABASE_URL=jdbc:mysql://localhost:3306/uca_portail
export DATABASE_USERNAME=root
export DATABASE_PASSWORD=ton_mot_de_passe
export JWT_SECRET=ta_cle_secrete
export MAIL_USERNAME=ton_email@gmail.com
export MAIL_PASSWORD=ton_app_password
./mvnw spring-boot:run
```

L'API démarre sur `http://localhost:8082`.

### Frontend

```bash
cd frontend
npm install
npm start
```

L'application démarre sur `http://localhost:3000`.

---

## Rôles et accès

| Rôle | Accès |
|---|---|
| `ETUDIANT` | Inscription, soumission et suivi de demandes, annulation |
| `PROFESSEUR` | Mêmes droits que l'étudiant |
| `ADMIN` | Gestion complète des demandes et des utilisateurs |

---

## Tests

```bash
# Tests backend
cd backend/portail
./mvnw test

# Tests frontend
cd frontend
npm test
```

---

## Variables d'environnement

| Variable | Description | Défaut |
|---|---|---|
| `DATABASE_URL` | URL JDBC MySQL | `jdbc:mysql://localhost:3306/uca_portail` |
| `DATABASE_USERNAME` | Utilisateur MySQL | `root` |
| `DATABASE_PASSWORD` | Mot de passe MySQL | *(vide)* |
| `JWT_SECRET` | Clé secrète JWT (Base64) | valeur de dev incluse |
| `JWT_EXPIRATION_MS` | Durée de validité du token | `86400000` (24h) |
| `ADMIN_EMAIL` | Email du compte admin initial | — |
| `ADMIN_PASSWORD` | Mot de passe admin initial | — |
| `MAIL_USERNAME` | Adresse Gmail d'envoi | — |
| `MAIL_PASSWORD` | App Password Gmail | — |

---

## Auteur

**Ilyass Ourahou** 

**Zidane Zidani**

Filière : ISI 2025-2026
