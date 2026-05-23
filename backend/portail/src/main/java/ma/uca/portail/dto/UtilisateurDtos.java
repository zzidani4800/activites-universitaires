package ma.uca.portail.dto;

import lombok.Data;
import ma.uca.portail.model.Utilisateur;

import java.time.LocalDate;

public class UtilisateurDtos {

    @Data
    public static class UtilisateurResponse {
        private Long id;
        private String prenom;
        private String nom;
        private String email;
        private String numeroEtudiant;
        private Utilisateur.Role role;
        private Utilisateur.Departement departement;
        private LocalDate dateInscription;

        public static UtilisateurResponse from(Utilisateur u) {
            UtilisateurResponse r = new UtilisateurResponse();
            r.setId(u.getId());
            r.setPrenom(u.getPrenom());
            r.setNom(u.getNom());
            r.setEmail(u.getEmail());
            r.setNumeroEtudiant(u.getNumeroEtudiant());
            r.setRole(u.getRole());
            r.setDepartement(u.getDepartement());
            r.setDateInscription(u.getDateInscription());
            return r;
        }
    }

    @Data
    public static class UpdateRequest {
        private String prenom;
        private String nom;
        private String email;           
        private String numeroEtudiant;  
        private Utilisateur.Role role;
        private Utilisateur.Departement departement; 
        private String motDePasse;       
    }
}