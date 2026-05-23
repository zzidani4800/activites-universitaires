package ma.uca.portail.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "utilisateurs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String prenom;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String motDePasse;

    @Column(unique = true)
    private String numeroEtudiant;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    private Departement departement;

    @Column(nullable = false)
    private LocalDate dateInscription;

    @OneToMany(mappedBy = "organisateur",
               cascade = CascadeType.ALL,
               orphanRemoval = true)
    @Builder.Default
    private List<DemandeReservation> demandes = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (dateInscription == null) dateInscription = LocalDate.now();
    }

    public enum Role {
        ETUDIANT, PROFESSEUR, ADMIN
    }

    public enum Departement {
        CHIMIE, PHYSIQUE, BIOLOGIE, INFORMATIQUE, MATHEMATIQUES
    }
}