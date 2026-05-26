package ma.uca.portail.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@SpringBootTest
class EmailServiceTest {

    @Autowired
    private EmailService emailService;

    @MockBean
    private JavaMailSender mailSender;

    @Test
    void testEnvoyerEmailConfirmation() {
        // Données de test
        String email = "etudiant@example.com";
        String nom = "Ahmed Ben";
        String evenement = "Conférence Tech 2024";

        // Appeler la méthode
        emailService.envoyerEmailConfirmation(email, nom, evenement);

        // Vérifier que mailSender.send() a été appelé exactement 1 fois
        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }

    @Test
    void testEnvoyerEmailRefus() {
        // Données de test
        String email = "etudiant@example.com";
        String nom = "Ahmed Ben";
        String evenement = "Conférence Tech 2024";

        // Appeler la méthode
        emailService.envoyerEmailRefus(email, nom, evenement);

        // Vérifier que mailSender.send() a été appelé exactement 1 fois
        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }

    @Test
    void testEnvoyerEmailConfirmationAvecCaracteresSpeciaux() {
        // Test avec accents et caractères spéciaux
        String email = "étudiant@example.com";
        String nom = "François Détude";
        String evenement = "Séminaire d'Été 2024 🎓";

        emailService.envoyerEmailConfirmation(email, nom, evenement);

        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }

    @Test
    void testEnvoyerEmailRefusAvecMotif() {
        // Test du refus
        String email = "etudiant@example.com";
        String nom = "Fatima Hajj";
        String evenement = "Workshop Python";

        emailService.envoyerEmailRefus(email, nom, evenement);

        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }

    @Test
    void testMultiplesEmails() {
        // Test d'envoi multiple
        String[] emails = {"user1@example.com", "user2@example.com", "user3@example.com"};
        
        for (String email : emails) {
            emailService.envoyerEmailConfirmation(email, "User", "Événement");
        }

        // Vérifier que mailSender.send() a été appelé 3 fois
        verify(mailSender, times(3)).send(any(SimpleMailMessage.class));
    }
}