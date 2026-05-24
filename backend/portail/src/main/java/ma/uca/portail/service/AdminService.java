package ma.uca.portail.service;

import lombok.RequiredArgsConstructor;
import ma.uca.portail.dto.DemandeReservationDtos;
import ma.uca.portail.dto.UtilisateurDtos;
import ma.uca.portail.exception.ConflitException;
import ma.uca.portail.exception.NotFoundException;
import ma.uca.portail.model.DemandeReservation;
import ma.uca.portail.model.DemandeReservation.Statut;
import ma.uca.portail.model.Utilisateur;
import ma.uca.portail.repository.DemandeReservationRepository;
import ma.uca.portail.repository.UtilisateurRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UtilisateurRepository utilisateurRepo;
    private final DemandeReservationRepository demandeRepo;
    private final ReservationService reservationService;
    private final PasswordEncoder passwordEncoder; // AJOUTER CETTE LIGNE

    // ── Dashboard ─────────────────────────────────────────

    @Transactional(readOnly = true)
    public Map<String, Object> getStats() {
        long total = demandeRepo.count();
        long enAttente = demandeRepo.countByStatut(Statut.EN_ATTENTE);
        long confirmees = demandeRepo.countByStatut(Statut.CONFIRMÉ);
        long refusees = demandeRepo.countByStatut(Statut.REFUSÉ);

        double taux = total > 0
                ? Math.round((confirmees * 100.0 / total) * 10.0) / 10.0
                : 0;

        long conflits = demandeRepo.findAll().stream()
                .filter(d -> d.getStatut() != Statut.REFUSÉ)
                .collect(Collectors.groupingBy(
                        d -> d.getSalle() + "|" + d.getDate() + "|" + d.getCreneau(),
                        Collectors.counting()))
                .values().stream().filter(c -> c > 1).count();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("demandesTotal", total);
        stats.put("enAttente", enAttente);
        stats.put("confirmees", confirmees);
        stats.put("refusees", refusees);
        stats.put("tauxApprobation", taux + "%");
        stats.put("conflitsDetectes", conflits);
        return stats;
    }

    // ── Réservations ──────────────────────────────────────

    @Transactional(readOnly = true)
    public List<DemandeReservationDtos.DemandeResume> toutesLesDemandes() {
        return reservationService.toutesLesDemandes();
    }

    @Transactional(readOnly = true)
    public List<DemandeReservationDtos.DemandeResume> enAttente() {
        return reservationService.enAttente();
    }

    @Transactional
    public DemandeReservationDtos.DemandeResponse changerStatut(
            Long id, DemandeReservation.Statut decision, String motif) {
        return reservationService.changerStatut(id, decision, motif);
    }

    // ── Gestion utilisateurs ──────────────────────────────

    @Transactional(readOnly = true)
    public List<UtilisateurDtos.UtilisateurResponse> listerUtilisateurs() {
        return utilisateurRepo.findAll().stream()
                .map(UtilisateurDtos.UtilisateurResponse::from)
                .toList();
    }

    @Transactional
    public UtilisateurDtos.UtilisateurResponse modifierUtilisateur(
            Long id, UtilisateurDtos.UpdateRequest req) {

        Utilisateur u = utilisateurRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));

        if (req.getPrenom() != null)
            u.setPrenom(req.getPrenom());
        if (req.getNom() != null)
            u.setNom(req.getNom());
        if (req.getRole() != null)
            u.setRole(req.getRole());
        if (req.getDepartement() != null)
            u.setDepartement(req.getDepartement());
        if (req.getNumeroEtudiant() != null)
            u.setNumeroEtudiant(req.getNumeroEtudiant());

        // AJOUT : Hasher le mot de passe s'il est fourni
        if (req.getMotDePasse() != null && !req.getMotDePasse().isBlank()) {
            if (req.getMotDePasse().length() < 6) {
                throw new IllegalArgumentException("Le mot de passe doit contenir au moins 6 caractères.");
            }
            String hashedPassword = passwordEncoder.encode(req.getMotDePasse());
            u.setMotDePasse(hashedPassword);
            System.out.println("Mot de passe hashé pour " + u.getEmail());
        }

        // Email : vérifier unicité si changé
        if (req.getEmail() != null && !req.getEmail().equals(u.getEmail())) {
            if (utilisateurRepo.existsByEmail(req.getEmail()))
                throw new ConflitException("Cet email est déjà utilisé.");
            u.setEmail(req.getEmail());
        }

        return UtilisateurDtos.UtilisateurResponse.from(utilisateurRepo.save(u));
    }

    @Transactional
    public void supprimerUtilisateur(Long id) {
        Utilisateur u = utilisateurRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));

        // Supprimer les demandes liées avant de supprimer l'utilisateur
        List<DemandeReservation> demandes = demandeRepo.findByOrganisateur(u);
        demandeRepo.deleteAll(demandes);
        demandeRepo.flush();

        utilisateurRepo.delete(u);
    }
}