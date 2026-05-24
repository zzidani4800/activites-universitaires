package ma.uca.portail.service;

import ma.uca.portail.dto.UtilisateurDtos;
import ma.uca.portail.exception.NotFoundException;
//import ma.uca.portail.model.DemandeReservation;
import ma.uca.portail.model.DemandeReservation.Statut;
import ma.uca.portail.model.Utilisateur;
import ma.uca.portail.repository.DemandeReservationRepository;
import ma.uca.portail.repository.UtilisateurRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private UtilisateurRepository        utilisateurRepo;
    @Mock
    private DemandeReservationRepository demandeRepo;
    @Mock
    private ReservationService           reservationService;

    @InjectMocks
    private AdminService adminService;

    private Utilisateur utilisateur;

    @BeforeEach
    void setUp() {
        utilisateur = Utilisateur.builder()
                .id(1L)
                .prenom("Omar")
                .nom("Ouali")
                .email("o.ouali@gmail.com")
                .role(Utilisateur.Role.ETUDIANT)
                .build();
    }

    // ── getStats ──────────────────────────────────────────

    @Test
    @DisplayName("getStats → retourne les bonnes statistiques")
    void getStats_ok() {
        when(demandeRepo.count()).thenReturn(10L);
        when(demandeRepo.countByStatut(Statut.EN_ATTENTE)).thenReturn(4L);
        when(demandeRepo.countByStatut(Statut.CONFIRMÉ)).thenReturn(5L);
        when(demandeRepo.countByStatut(Statut.REFUSÉ)).thenReturn(1L);
        when(demandeRepo.findAll()).thenReturn(List.of());

        Map<String, Object> stats = adminService.getStats();

        assertThat(stats.get("demandesTotal")).isEqualTo(10L);
        assertThat(stats.get("enAttente")).isEqualTo(4L);
        assertThat(stats.get("confirmees")).isEqualTo(5L);
        assertThat(stats.get("refusees")).isEqualTo(1L);
        assertThat(stats.get("tauxApprobation")).isEqualTo("50.0%");
        assertThat(stats.get("conflitsDetectes")).isEqualTo(0L);
    }

    @Test
    @DisplayName("getStats → taux 0% si aucune demande")
    void getStats_aucuneDemande() {
        when(demandeRepo.count()).thenReturn(0L);
        when(demandeRepo.countByStatut(any())).thenReturn(0L);
        when(demandeRepo.findAll()).thenReturn(List.of());

        Map<String, Object> stats = adminService.getStats();

        assertThat(stats.get("tauxApprobation")).isEqualTo("0.0%");
        assertThat(stats.get("conflitsDetectes")).isEqualTo(0L);
    }

    // ── listerUtilisateurs ────────────────────────────────

    @Test
    @DisplayName("listerUtilisateurs → retourne tous les utilisateurs")
    void listerUtilisateurs_ok() {
        when(utilisateurRepo.findAll()).thenReturn(List.of(utilisateur));

        List<UtilisateurDtos.UtilisateurResponse> result =
                adminService.listerUtilisateurs();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEmail())
                .isEqualTo("o.ouali@gmail.com");
    }

    // ── modifierUtilisateur ───────────────────────────────

    @Test
    @DisplayName("modifierUtilisateur → modifie les champs non null")
    void modifierUtilisateur_ok() {
        UtilisateurDtos.UpdateRequest req =
                new UtilisateurDtos.UpdateRequest();
        req.setPrenom("Nouveau");
        req.setNom("Nom");
        req.setRole(Utilisateur.Role.PROFESSEUR);

        when(utilisateurRepo.findById(1L))
                .thenReturn(Optional.of(utilisateur));
        when(utilisateurRepo.save(any())).thenReturn(utilisateur);

        UtilisateurDtos.UtilisateurResponse response =
                adminService.modifierUtilisateur(1L, req);

        assertThat(response).isNotNull();
        verify(utilisateurRepo, times(1)).save(any());
    }

    @Test
    @DisplayName("modifierUtilisateur → exception si introuvable")
    void modifierUtilisateur_introuvable() {
        when(utilisateurRepo.findById(99L))
                .thenReturn(Optional.empty());

        UtilisateurDtos.UpdateRequest req =
                new UtilisateurDtos.UpdateRequest();

        assertThatThrownBy(() ->
                adminService.modifierUtilisateur(99L, req))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Utilisateur introuvable");
    }

    // ── supprimerUtilisateur ──────────────────────────────

    @Test
    @DisplayName("supprimerUtilisateur → supprime correctement")
    void supprimerUtilisateur_ok() {
       when(utilisateurRepo.findById(1L)).thenReturn(Optional.of(utilisateur));
    when(demandeRepo.findByOrganisateur(utilisateur)).thenReturn(List.of());
    doNothing().when(demandeRepo).deleteAll(any());
    doNothing().when(utilisateurRepo).delete(utilisateur);

    assertThatCode(() ->
            adminService.supprimerUtilisateur(1L))
            .doesNotThrowAnyException();

    verify(utilisateurRepo, times(1)).delete(utilisateur);
    }

    @Test
    @DisplayName("supprimerUtilisateur → exception si introuvable")
    void supprimerUtilisateur_introuvable() {
        when(utilisateurRepo.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                adminService.supprimerUtilisateur(99L))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Utilisateur introuvable");
    }
}