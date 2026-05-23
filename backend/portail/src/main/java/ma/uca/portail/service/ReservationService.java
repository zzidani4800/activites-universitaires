package ma.uca.portail.service;

import lombok.RequiredArgsConstructor;
import ma.uca.portail.dto.DemandeReservationDtos;
import ma.uca.portail.exception.ConflitException;
import ma.uca.portail.exception.NotFoundException;
import ma.uca.portail.model.DemandeReservation;
import ma.uca.portail.model.DemandeReservation.Statut;
import ma.uca.portail.model.Utilisateur;
import ma.uca.portail.repository.DemandeReservationRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final DemandeReservationRepository demandeRepo;

    // ── Organisateur ─────────────────────────────────────

    /** Soumettre une nouvelle demande de réservation */
    @Transactional
    public DemandeReservationDtos.DemandeResponse soumettre(
            Utilisateur organisateur,
            DemandeReservationDtos.DemandeRequest req) {

        DemandeReservation demande = DemandeReservation.builder()
                .organisateur(organisateur)
                .departement(req.getDepartement())
                .titreEvenement(req.getTitreEvenement())
                .typeEvenement(req.getTypeEvenement())
                .description(req.getDescription())
                .salle(req.getSalle())
                .date(req.getDate())
                .creneau(req.getCreneau())
                .motivation(req.getMotivation())
                .build();

        return DemandeReservationDtos.DemandeResponse
                .from(demandeRepo.save(demande));
    }

    /** Mes demandes (organisateur connecté) */
    @Transactional(readOnly = true)
    public List<DemandeReservationDtos.DemandeResponse> mesDemandes(
            Utilisateur organisateur) {
        return demandeRepo.findByOrganisateur(organisateur)
                .stream()
                .map(DemandeReservationDtos.DemandeResponse::from)
                .toList();
    }

    /** Annuler sa propre demande */

    @Transactional
    public DemandeReservationDtos.DemandeResponse annuler(
            Utilisateur organisateur, Long id) {

        DemandeReservation d = findOrThrow(id);

    // Vérifier que c'est bien sa demande
    if (!d.getOrganisateur().getId().equals(organisateur.getId()))
        throw new SecurityException("Accès refusé");

    // Ne peut pas annuler une demande déjà confirmée
    if (d.getStatut() == Statut.CONFIRMÉ)
        throw new ConflitException(
            "Demande déjà confirmée, contactez l'administrateur");

    // Ne peut pas annuler une demande déjà refusée
    if (d.getStatut() == Statut.REFUSÉ)
        throw new ConflitException(
            "Cette demande est déjà refusée");

    // CORRECTION : Utiliser ANNULE au lieu de REFUSÉ
    d.setStatut(Statut.ANNULE);  // ← Changement important
    d.setMotifRefus("Annulé par l'organisateur");
    d.setDateDecision(LocalDateTime.now());

    return DemandeReservationDtos.DemandeResponse
            .from(demandeRepo.save(d));
}

    // ── Admin ─────────────────────────────────────────────

    /** Toutes les demandes triées par date + salle + créneau
     *  avec détection automatique des conflits */
    @Transactional(readOnly = true)
    public List<DemandeReservationDtos.DemandeResume> toutesLesDemandes() {

        List<DemandeReservation> toutes = demandeRepo
                .findAll(Sort.by("date", "salle", "creneau"));

        // Calculer les clés en conflit une seule fois
        Set<String> clesEnConflit = toutes.stream()
                .filter(d -> d.getStatut() != Statut.REFUSÉ)
                .collect(Collectors.groupingBy(
                    d -> d.getSalle() + "|" +
                         d.getDate()  + "|" +
                         d.getCreneau(),
                    Collectors.counting()))
                .entrySet().stream()
                .filter(e -> e.getValue() > 1)
                .map(Map.Entry::getKey)
                .collect(Collectors.toSet());

        return toutes.stream()
                .map(d -> {
                    String cle = d.getSalle() + "|" +
                                 d.getDate()  + "|" +
                                 d.getCreneau();
                    return DemandeReservationDtos.DemandeResume
                            .from(d, clesEnConflit.contains(cle));
                })
                .toList();
    }

    /** Demandes en attente uniquement */
    @Transactional(readOnly = true)
    public List<DemandeReservationDtos.DemandeResume> enAttente() {
        return demandeRepo.findByStatut(Statut.EN_ATTENTE)
                .stream()
                .map(d -> DemandeReservationDtos.DemandeResume
                        .from(d, false))
                .toList();
    }

    /** Détail complet d'une demande */
    @Transactional(readOnly = true)
    public DemandeReservationDtos.DemandeResponse getById(Long id) {
        return DemandeReservationDtos.DemandeResponse
                .from(findOrThrow(id));
    }

    /** Changer le statut manuellement (admin) */
    @Transactional
    public DemandeReservationDtos.DemandeResponse changerStatut(
            Long id,
            Statut decision,
            String motif) {

        DemandeReservation d = findOrThrow(id);

        // Vérifier que la demande est encore en attente
        if (d.getStatut() != Statut.EN_ATTENTE)
            throw new ConflitException(
                "Statut déjà traité : " + d.getStatut());

        // Si confirmation → vérifier qu'aucune autre demande
        // n'est déjà confirmée sur cette salle/date/créneau
        if (decision == Statut.CONFIRMÉ &&
            demandeRepo.isSalleOccupee(
                d.getSalle(), d.getDate(), d.getCreneau())) {
            throw new ConflitException(
                "Conflit : cette salle est déjà confirmée " +
                "pour ce créneau");
        }

        d.setStatut(decision);
        d.setMotifRefus(motif);
        d.setDateDecision(LocalDateTime.now());

        return DemandeReservationDtos.DemandeResponse
                .from(demandeRepo.save(d));
    }

    // ── Utilitaire ────────────────────────────────────────

    private DemandeReservation findOrThrow(Long id) {
        return demandeRepo.findById(id)
                .orElseThrow(() ->
                    new NotFoundException("Demande introuvable : " + id));
    }
}