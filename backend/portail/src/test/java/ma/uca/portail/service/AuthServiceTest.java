package ma.uca.portail.service;

import ma.uca.portail.dto.AuthDtos;
import ma.uca.portail.exception.ConflitException;
import ma.uca.portail.exception.NotFoundException;
import ma.uca.portail.model.Utilisateur;
import ma.uca.portail.repository.UtilisateurRepository;
import ma.uca.portail.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UtilisateurRepository utilisateurRepo;
    @Mock
    private PasswordEncoder       passwordEncoder;
    @Mock
    private JwtUtils              jwtUtils;

    @InjectMocks
    private AuthService authService;

    private Utilisateur utilisateur;

    @BeforeEach
    void setUp() {
        utilisateur = Utilisateur.builder()
                .id(1L)
                .prenom("Omar")
                .nom("Ouali")
                .email("o.ouali@gmail.com")
                .motDePasse("hashed_password")
                .role(Utilisateur.Role.ETUDIANT)
                .build();
    }

    // ── login ─────────────────────────────────────────────

    @Test
    @DisplayName("login → retourne token si identifiants corrects")
    void login_ok() {
        AuthDtos.LoginRequest req = new AuthDtos.LoginRequest();
        req.setEmail("o.ouali@gmail.com");
        req.setMotDePasse("ee123456");

        when(utilisateurRepo.findByEmail("o.ouali@gmail.com"))
                .thenReturn(Optional.of(utilisateur));
        when(passwordEncoder.matches("ee123456", "hashed_password"))
                .thenReturn(true);
        when(jwtUtils.genererToken(utilisateur))
                .thenReturn("fake_token");

        AuthDtos.LoginResponse response = authService.login(req);

        assertThat(response.getToken()).isEqualTo("fake_token");
        assertThat(response.getEmail()).isEqualTo("o.ouali@gmail.com");
        assertThat(response.getRole()).isEqualTo(Utilisateur.Role.ETUDIANT);
    }

    @Test
    @DisplayName("login → exception si email introuvable")
    void login_emailIntrouvable() {
        AuthDtos.LoginRequest req = new AuthDtos.LoginRequest();
        req.setEmail("inconnu@gmail.com");
        req.setMotDePasse("password");

        when(utilisateurRepo.findByEmail("inconnu@gmail.com"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Utilisateur introuvable");
    }

    @Test
    @DisplayName("login → exception si mot de passe incorrect")
    void login_mauvaisMotDePasse() {
        AuthDtos.LoginRequest req = new AuthDtos.LoginRequest();
        req.setEmail("o.ouali@gmail.com");
        req.setMotDePasse("mauvais");

        when(utilisateurRepo.findByEmail("o.ouali@gmail.com"))
                .thenReturn(Optional.of(utilisateur));
        when(passwordEncoder.matches("mauvais", "hashed_password"))
                .thenReturn(false);

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Mot de passe incorrect");
    }

    // ── register ──────────────────────────────────────────

    @Test
    @DisplayName("register → crée un compte et retourne token")
    void register_ok() {
        AuthDtos.RegisterRequest req = new AuthDtos.RegisterRequest();
        req.setPrenom("Amina");
        req.setNom("Mansouri");
        req.setEmail("a.mansouri@gmail.com");
        req.setMotDePasse("password123");
        req.setNumeroEtudiant("EE999");
        req.setRole(Utilisateur.Role.ETUDIANT);

        when(utilisateurRepo.existsByEmail(any())).thenReturn(false);
        when(utilisateurRepo.existsByNumeroEtudiant(any())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("hashed");
        when(utilisateurRepo.save(any())).thenReturn(utilisateur);
        when(jwtUtils.genererToken(any())).thenReturn("fake_token");

        AuthDtos.LoginResponse response = authService.register(req);

        assertThat(response.getToken()).isEqualTo("fake_token");
        verify(utilisateurRepo, times(1)).save(any());
    }

    @Test
    @DisplayName("register → exception si email déjà utilisé")
    void register_emailDejaUtilise() {
        AuthDtos.RegisterRequest req = new AuthDtos.RegisterRequest();
        req.setEmail("o.ouali@gmail.com");
        req.setMotDePasse("password");

        when(utilisateurRepo.existsByEmail("o.ouali@gmail.com"))
                .thenReturn(true);

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(ConflitException.class)
                .hasMessageContaining("email est déjà utilisé");
    }

    @Test
    @DisplayName("register → exception si numéro étudiant déjà utilisé")
    void register_numeroDejaUtilise() {
        AuthDtos.RegisterRequest req = new AuthDtos.RegisterRequest();
        req.setEmail("nouveau@gmail.com");
        req.setMotDePasse("password");
        req.setNumeroEtudiant("EE123456");

        when(utilisateurRepo.existsByEmail(any())).thenReturn(false);
        when(utilisateurRepo.existsByNumeroEtudiant("EE123456"))
                .thenReturn(true);

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(ConflitException.class)
                .hasMessageContaining("APOGÉE");
    }

    @Test
    @DisplayName("register → rôle ETUDIANT par défaut si non précisé")
    void register_roleParDefaut() {
        AuthDtos.RegisterRequest req = new AuthDtos.RegisterRequest();
        req.setPrenom("Test");
        req.setNom("User");
        req.setEmail("test@gmail.com");
        req.setMotDePasse("password");
        req.setRole(null);

        when(utilisateurRepo.existsByEmail(any())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("hashed");
        when(utilisateurRepo.save(any())).thenReturn(utilisateur);
        when(jwtUtils.genererToken(any())).thenReturn("fake_token");

        AuthDtos.LoginResponse response = authService.register(req);

        assertThat(response).isNotNull();
        verify(utilisateurRepo, times(1)).save(
            argThat(u -> u.getRole() == Utilisateur.Role.ETUDIANT));
    }
}