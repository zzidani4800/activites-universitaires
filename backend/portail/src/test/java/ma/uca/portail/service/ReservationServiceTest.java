package ma.uca.portail.service;

import ma.uca.portail.dto.DemandeReservationDtos;
import ma.uca.portail.exception.ConflitException;
import ma.uca.portail.exception.NotFoundException;
import ma.uca.portail.model.DemandeReservation;
import ma.uca.portail.model.DemandeReservation.Statut;
import ma.uca.portail.model.DemandeReservation.TypeSalle;
import ma.uca.portail.model.DemandeReservation.TypeEvenement;
import ma.uca.portail.model.DemandeReservation.Departement;
import ma.uca.portail.model.Utilisateur;
import ma.uca.portail.repository.DemandeReservationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.data.domain.Sort;

import java.time.LocalDate;
//import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    @Mock
    private DemandeReservationRepository demandeRepo;

    @InjectMocks
    private ReservationService reservationService;

    private Utilisateur organisateur;
    private DemandeReservation demande;
    private DemandeReservationDtos.DemandeRequest request;

    @BeforeEach
    void setUp() {
        organisateur = Utilisateur.builder()
                .id(1L)
                .prenom("Omar")
                .nom("Ouali")
                .email("o.ouali@gmail.com")
                .role(Utilisateur.Role.ETUDIANT)
                .departement(Utilisateur.Departement.INFORMATIQUE)
                .build();

        demande = DemandeReservation.builder()
                .id(1L)
                .organisateur(organisateur)
                .departement(Departement.INFORMATIQUE)
                .titreEvenement("Conférence IA")
                .typeEvenement(TypeEvenement.CONFERENCE)
                .salle(TypeSalle.AMPHI)
                .date(LocalDate.now().plusDays(7))
                .creneau("09:00-12:00")
                .motivation("Club informatique")
                .statut(Statut.EN_ATTENTE)
                .build();

        request = new DemandeReservationDtos.DemandeRequest();
        request.setDepartement(Departement.INFORMATIQUE);
        request.setTitreEvenement("Conférence IA");
        request.setTypeEvenement(TypeEvenement.CONFERENCE);
        request.setSalle(TypeSalle.AMPHI);
        request.setDate(LocalDate.now().plusDays(7));
        request.setCreneau("09:00-12:00");
        request.setMotivation("Club informatique");
    }

    // ── soumettre ─────────────────────────────────────────

    @Test
    @DisplayName("soumettre → crée une demande EN_ATTENTE")
    void soumettre_ok() {
        when(demandeRepo.save(any())).thenReturn(demande);

        DemandeReservationDtos.DemandeResponse response =
                reservationService.soumettre(organisateur, request);

        assertThat(response).isNotNull();
        assertThat(response.getStatut()).isEqualTo("EN_ATTENTE");
        assertThat(response.getTitreEvenement()).isEqualTo("Conférence IA");
        verify(demandeRepo, times(1)).save(any());
    }

    // ── mesDemandes ───────────────────────────────────────

    @Test
    @DisplayName("mesDemandes → retourne les demandes de l'organisateur")
    void mesDemandes_ok() {
        when(demandeRepo.findByOrganisateur(organisateur))
                .thenReturn(List.of(demande));

        List<DemandeReservationDtos.DemandeResponse> result =
                reservationService.mesDemandes(organisateur);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitreEvenement())
                .isEqualTo("Conférence IA");
    }

    @Test
    @DisplayName("mesDemandes → retourne liste vide si aucune demande")
    void mesDemandes_vide() {
        when(demandeRepo.findByOrganisateur(organisateur))
                .thenReturn(List.of());

        List<DemandeReservationDtos.DemandeResponse> result =
                reservationService.mesDemandes(organisateur);

        assertThat(result).isEmpty();
    }

    // ── annuler ───────────────────────────────────────────

    @Test
    @DisplayName("annuler → passe le statut à ANNULE")
    void annuler_ok() {
        when(demandeRepo.findById(1L)).thenReturn(Optional.of(demande));
        when(demandeRepo.save(any())).thenReturn(demande);

        DemandeReservationDtos.DemandeResponse response =
                reservationService.annuler(organisateur, 1L);

        assertThat(response.getStatut()).isEqualTo("ANNULE");
        assertThat(response.getMotifRefus())
                .isEqualTo("Annulé par l'organisateur");
    }

    @Test
    @DisplayName("annuler → exception si demande introuvable")
    void annuler_introuvable() {
        when(demandeRepo.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                reservationService.annuler(organisateur, 99L))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Demande introuvable");
    }

    @Test
    @DisplayName("annuler → exception si demande déjà confirmée")
    void annuler_dejaConfirmee() {
        demande.setStatut(Statut.CONFIRMÉ);
        when(demandeRepo.findById(1L)).thenReturn(Optional.of(demande));

        assertThatThrownBy(() ->
                reservationService.annuler(organisateur, 1L))
                .isInstanceOf(ConflitException.class)
                .hasMessageContaining("Demande déjà confirmée");
    }

    @Test
    @DisplayName("annuler → exception si demande déjà refusée")
    void annuler_dejaRefusee() {
        demande.setStatut(Statut.REFUSÉ);
        when(demandeRepo.findById(1L)).thenReturn(Optional.of(demande));

        assertThatThrownBy(() ->
                reservationService.annuler(organisateur, 1L))
                .isInstanceOf(ConflitException.class)
                .hasMessageContaining("déjà refusée");
    }

    @Test
    @DisplayName("annuler → exception si pas le bon organisateur")
    void annuler_accesDenie() {
        Utilisateur autreUser = Utilisateur.builder()
                .id(99L)
                .prenom("Autre")
                .nom("User")
                .email("autre@gmail.com")
                .build();

        when(demandeRepo.findById(1L)).thenReturn(Optional.of(demande));

        assertThatThrownBy(() ->
                reservationService.annuler(autreUser, 1L))
                .isInstanceOf(SecurityException.class)
                .hasMessageContaining("Accès refusé");
    }

    // ── changerStatut ─────────────────────────────────────

    @Test
    @DisplayName("changerStatut → confirme une demande EN_ATTENTE")
    void changerStatut_confirmer() {
        when(demandeRepo.findById(1L)).thenReturn(Optional.of(demande));
        when(demandeRepo.isSalleOccupee(any(), any(), any()))
                .thenReturn(false);
        when(demandeRepo.save(any())).thenReturn(demande);

        DemandeReservationDtos.DemandeResponse response =
                reservationService.changerStatut(1L, Statut.CONFIRMÉ, null);

        assertThat(response.getStatut()).isEqualTo("CONFIRMÉ");
        verify(demandeRepo, times(1)).save(any());
    }

    @Test
    @DisplayName("changerStatut → refuse une demande EN_ATTENTE")
    void changerStatut_refuser() {
        when(demandeRepo.findById(1L)).thenReturn(Optional.of(demande));
        when(demandeRepo.save(any())).thenReturn(demande);

        DemandeReservationDtos.DemandeResponse response =
                reservationService.changerStatut(
                    1L, Statut.REFUSÉ, "Salle indisponible");

        assertThat(response.getStatut()).isEqualTo("REFUSÉ");
    }

    @Test
    @DisplayName("changerStatut → exception si déjà traitée")
    void changerStatut_dejaTraitee() {
        demande.setStatut(Statut.CONFIRMÉ);
        when(demandeRepo.findById(1L)).thenReturn(Optional.of(demande));

        assertThatThrownBy(() ->
                reservationService.changerStatut(1L, Statut.CONFIRMÉ, null))
                .isInstanceOf(ConflitException.class)
                .hasMessageContaining("Statut déjà traité");
    }

    @Test
    @DisplayName("changerStatut → exception si salle déjà occupée")
    void changerStatut_salleOccupee() {
        when(demandeRepo.findById(1L)).thenReturn(Optional.of(demande));
        when(demandeRepo.isSalleOccupee(any(), any(), any()))
                .thenReturn(true);

        assertThatThrownBy(() ->
                reservationService.changerStatut(1L, Statut.CONFIRMÉ, null))
                .isInstanceOf(ConflitException.class)
                .hasMessageContaining("Conflit");
    }

    // ── getById ───────────────────────────────────────────

    @Test
    @DisplayName("getById → retourne la demande")
    void getById_ok() {
        when(demandeRepo.findById(1L)).thenReturn(Optional.of(demande));

        DemandeReservationDtos.DemandeResponse response =
                reservationService.getById(1L);

        assertThat(response.getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("getById → exception si introuvable")
    void getById_introuvable() {
        when(demandeRepo.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reservationService.getById(99L))
                .isInstanceOf(NotFoundException.class);
    }
}