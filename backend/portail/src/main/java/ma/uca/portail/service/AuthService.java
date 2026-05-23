package ma.uca.portail.service;

import lombok.RequiredArgsConstructor;
import ma.uca.portail.dto.AuthDtos;
import ma.uca.portail.model.Utilisateur;
import ma.uca.portail.exception.ConflitException;
import ma.uca.portail.exception.NotFoundException;
import ma.uca.portail.repository.UtilisateurRepository;
import ma.uca.portail.security.JwtUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UtilisateurRepository utilisateurRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    private AuthDtos.LoginResponse toResponse(Utilisateur user, String token) {
        return new AuthDtos.LoginResponse(
            token,
            "Bearer",
            user.getId(),
            user.getPrenom(),   
            user.getNom(),      
            user.getEmail(),
            user.getRole()
        );
    }

    @Transactional(readOnly = true)
    public AuthDtos.LoginResponse login(AuthDtos.LoginRequest req) {
        Utilisateur user = utilisateurRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));

        if (!passwordEncoder.matches(req.getMotDePasse(), user.getMotDePasse())) {
            throw new IllegalArgumentException("Mot de passe incorrect");
        }

        return toResponse(user, jwtUtils.genererToken(user));
    }

    @Transactional
    public AuthDtos.LoginResponse register(AuthDtos.RegisterRequest req) {
        if (utilisateurRepo.existsByEmail(req.getEmail())) {
            throw new ConflitException("Cet email est déjà utilisé");
        }
        if (req.getNumeroEtudiant() != null
                && utilisateurRepo.existsByNumeroEtudiant(req.getNumeroEtudiant())) {
            throw new ConflitException("Ce numéro APOGÉE est déjà enregistré");
        }

        Utilisateur.Role role = req.getRole() != null ? req.getRole() : Utilisateur.Role.ETUDIANT;

        Utilisateur user = Utilisateur.builder()
                .prenom(req.getPrenom())
                .nom(req.getNom())
                .email(req.getEmail())
                .motDePasse(passwordEncoder.encode(req.getMotDePasse()))
                .numeroEtudiant(req.getNumeroEtudiant())
                .role(role)
                .departement(req.getDepartement())
                .build();

        utilisateurRepo.save(user);
        return toResponse(user, jwtUtils.genererToken(user));
    }
}