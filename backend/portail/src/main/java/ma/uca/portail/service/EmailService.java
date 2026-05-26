package ma.uca.portail.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    /**
     * Envoie un email de confirmation quand la réservation est confirmée
     */
    public void envoyerEmailConfirmation(String email, String nom, String evenement) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Inscription confirmée — " + evenement);
            message.setText("Bonjour " + nom + ",\n\n"
                    + "Votre inscription à l'événement \"" + evenement + "\" a été confirmée.\n\n"
                    + "Cordialement,\n"
                    + "UCA Marrakech");

            mailSender.send(message);
            logger.info("Email de confirmation envoyé à: {} pour l'événement: {}", email, evenement);
        } catch (Exception e) {
            logger.error("Erreur lors de l'envoi de l'email de confirmation à: {}", email, e);
        }
    }

    /**
     * Envoie un email de refus quand la réservation est refusée
     */
    public void envoyerEmailRefus(String email, String nom, String evenement) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Inscription annulée — " + evenement);
            message.setText("Bonjour " + nom + ",\n\n"
                    + "Nous sommes désolés, votre inscription à l'événement \""
                    + evenement + "\" n'a pas été acceptée.\n\n"
                    + "Cordialement,\n"
                    + "UCA Marrakech");

            mailSender.send(message);
            logger.info("Email de refus envoyé à: {} pour l'événement: {}", email, evenement);
        } catch (Exception e) {
            logger.error("Erreur lors de l'envoi de l'email de refus à: {}", email, e);
        }
    }
}
