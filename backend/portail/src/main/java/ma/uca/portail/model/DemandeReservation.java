package ma.uca.portail.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "demande_reservation")
public class DemandeReservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organisateur_id")
    private Utilisateur organisateur;

    @Enumerated(EnumType.STRING)
    private Departement departement;

    private String titreEvenement;

    @Enumerated(EnumType.STRING)
    private TypeEvenement typeEvenement;

    private String description;

    @Enumerated(EnumType.STRING)
    private TypeSalle salle;

    private LocalDate date;
    private String    creneau;
    private String    motivation;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Statut statut = Statut.EN_ATTENTE;

    private String        motifRefus;
    private LocalDateTime dateDecision;

    @CreationTimestamp
    private LocalDateTime dateSoumission;

    public enum Statut {
    EN_ATTENTE, CONFIRMÉ, REFUSÉ, ANNULE
}

    public enum Departement {
        CHIMIE("Chimie"),
        BIOLOGIE("Biologie"),
        INFORMATIQUE("Informatique"),
        PHYSIQUE("Physique"),
        MATHEMATIQUE("Mathématique");

        private final String libelle;

        Departement(String libelle) {
            this.libelle = libelle;
        }

        public String getLibelle() {
            return libelle;
        }
    }

    public enum TypeEvenement {
        CONFERENCE, SEMINAIRE, ATELIER, SPORT, CULTUREL, AUTRE
    }

    public enum TypeSalle {
        AMPHI, AMPHI_THEATRE, SALLE_POLYVALENTE, SALLE, LABORATOIRE
    }
}