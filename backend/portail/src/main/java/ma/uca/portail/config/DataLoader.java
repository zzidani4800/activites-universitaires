// package ma.uca.portail.config;

// import java.time.LocalDate;

// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.boot.CommandLineRunner;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.stereotype.Component;

// import lombok.RequiredArgsConstructor;
// import ma.uca.portail.model.DemandeReservation;
// import ma.uca.portail.model.Utilisateur;
// import ma.uca.portail.repository.DemandeReservationRepository;
// import ma.uca.portail.repository.UtilisateurRepository;

// @Component
// @RequiredArgsConstructor
// public class DataLoader implements CommandLineRunner {

//         private final UtilisateurRepository utilisateurRepo;
//         private final DemandeReservationRepository demandeRepo;
//         private final PasswordEncoder passwordEncoder;

//         @Value("${app.init.admin-email}")
//         private String adminEmail;

//         @Value("${app.init.admin-password}")
//         private String adminPassword;

//         @Override
//         public void run(String... args) {

//                 // ── Admin ─────────────────────────────────────────
//                 utilisateurRepo.findByEmail(adminEmail).orElseGet(() -> utilisateurRepo.save(Utilisateur.builder()
//                                 .prenom("Super")
//                                 .nom("Admin")
//                                 .email(adminEmail)
//                                 .motDePasse(passwordEncoder.encode(adminPassword))
//                                 .role(Utilisateur.Role.ADMIN)
//                                 .build()));

//                 // ── Organisateurs de démo ─────────────────────────
//                 Utilisateur etudiant1 = utilisateurRepo
//                                 .findByEmail("o.ouali@gmail.com")
//                                 .orElseGet(() -> utilisateurRepo.save(Utilisateur.builder()
//                                                 .prenom("Omar").nom("Ouali")
//                                                 .email("o.ouali@gmail.com")
//                                                 .motDePasse(passwordEncoder.encode("ee123456"))
//                                                 .numeroEtudiant("EE123456")
//                                                 .role(Utilisateur.Role.ETUDIANT)
//                                                 .departement(Utilisateur.Departement.INFORMATIQUE)
//                                                 .build()));

//                 Utilisateur etudiant2 = utilisateurRepo
//                                 .findByEmail("a.mansouri@gmail.com")
//                                 .orElseGet(() -> utilisateurRepo.save(Utilisateur.builder()
//                                                 .prenom("Amina").nom("Mansouri")
//                                                 .email("a.mansouri@gmail.com")
//                                                 .motDePasse(passwordEncoder.encode("ee654321"))
//                                                 .numeroEtudiant("EE654321")
//                                                 .role(Utilisateur.Role.ETUDIANT)
//                                                 .departement(Utilisateur.Departement.PHYSIQUE)
//                                                 .build()));

//                 Utilisateur prof = utilisateurRepo
//                                 .findByEmail("k.benali@gmail.com")
//                                 .orElseGet(() -> utilisateurRepo.save(Utilisateur.builder()
//                                                 .prenom("Khalid").nom("Benali")
//                                                 .email("k.benali@gmail.com")
//                                                 .motDePasse(passwordEncoder.encode("prof1234"))
//                                                 .role(Utilisateur.Role.PROFESSEUR)
//                                                 .departement(Utilisateur.Departement.BIOLOGIE)
//                                                 .build()));

//                 // ── Demandes de réservation de démo ───────────────
//                 if (demandeRepo.count() == 0) {

//                         // Demande normale confirmée
//                         demandeRepo.save(DemandeReservation.builder()
//                                         .organisateur(etudiant1)
//                                         .departement(DemandeReservation.Departement.INFORMATIQUE)
//                                         .titreEvenement("Conférence IA & Machine Learning")
//                                         .typeEvenement(DemandeReservation.TypeEvenement.CONFERENCE)
//                                         .description("Conférence sur les avancées en IA.")
//                                         .salle(DemandeReservation.TypeSalle.AMPHI)
//                                         .date(LocalDate.now().plusDays(7))
//                                         .creneau("09:00-12:00")
//                                         .motivation("Club informatique UCA.")
//                                         .statut(DemandeReservation.Statut.CONFIRMÉ)
//                                         .build());

//                         // Demande en attente
//                         demandeRepo.save(DemandeReservation.builder()
//                                         .organisateur(etudiant2)
//                                         .departement(DemandeReservation.Departement.PHYSIQUE)
//                                         .titreEvenement("Séminaire Physique Quantique")
//                                         .typeEvenement(DemandeReservation.TypeEvenement.SEMINAIRE)
//                                         .description("Séminaire doctoral en physique théorique.")
//                                         .salle(DemandeReservation.TypeSalle.SALLE_POLYVALENTE)
//                                         .date(LocalDate.now().plusDays(14))
//                                         .creneau("14:00-16:00")
//                                         .motivation("Groupe de recherche physique.")
//                                         .statut(DemandeReservation.Statut.EN_ATTENTE)
//                                         .build());

//                         // Demande en conflit (même salle/date/créneau que la première)
//                         demandeRepo.save(DemandeReservation.builder()
//                                         .organisateur(prof)
//                                         .departement(DemandeReservation.Departement.BIOLOGIE)
//                                         .titreEvenement("Journée Biologie Moléculaire")
//                                         .typeEvenement(DemandeReservation.TypeEvenement.SEMINAIRE)
//                                         .description("Séminaire biologie moléculaire.")
//                                         .salle(DemandeReservation.TypeSalle.AMPHI)
//                                         .date(LocalDate.now().plusDays(7))
//                                         .creneau("09:00-12:00")
//                                         .motivation("Département biologie.")
//                                         .statut(DemandeReservation.Statut.EN_ATTENTE)
//                                         .build());

//                         // Demande refusée
//                         demandeRepo.save(DemandeReservation.builder()
//                                         .organisateur(etudiant1)
//                                         .departement(DemandeReservation.Departement.INFORMATIQUE)
//         .titreEvenement("Atelier Python")
//         .typeEvenement(DemandeReservation.TypeEvenement.ATELIER)
//         .description("Atelier initiation Python.")
//         .salle(DemandeReservation.TypeSalle.LABORATOIRE)
//         .date(LocalDate.now().plusDays(3))
//         .creneau("16:00-18:00")
//         .motivation("Club programmation.")
//         .statut(DemandeReservation.Statut.REFUSÉ)
//          .motifRefus("Salle non disponible.")
//                       .build());
//                 }

//                 System.out.println(" DataLoader : données de démo chargées.");
//                 System.out.println("   Admin    : " + adminEmail + " / " + adminPassword);
//                 System.out.println("   Étudiant : o.ouali@gmail.com / ee123456");
//                 System.out.println("   Prof     : k.benali@gmail.com / prof1234");
//         }
// }