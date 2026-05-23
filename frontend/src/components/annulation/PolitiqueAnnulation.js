function PolitiqueAnnulation() {
  const regles = [
    {
      icone: 'schedule',
      titre: 'Délai minimum',
      texte: "L'annulation doit être soumise au moins 48 heures avant le début de l'événement. Toute demande hors délai sera automatiquement rejetée.",
      accent: '48 heures',
    },
    {
      icone: 'pending_actions',
      titre: 'Demandes en attente uniquement',
      texte: "Seules les demandes avec le statut EN ATTENTE peuvent être annulées. Une réservation déjà CONFIRMÉE ne peut pas être annulée ici — contactez l'administration.",
      accent: 'EN ATTENTE',
    },
    {
      icone: 'warning',
      titre: 'Conséquences',
      texte: "Les annulations répétées peuvent entraîner une restriction temporaire de vos droits d'inscription aux futurs événements universitaires.",
      accent: null,
    },
    {
      icone: 'block',
      titre: 'Non-remboursable',
      texte: "Tout frais de dossier engagé est strictement non-remboursable selon les statuts de l'Université Cadi Ayyad.",
      accent: null,
    },
    {
      icone: 'mark_email_read',
      titre: 'Confirmation par email',
      texte: "Un email de confirmation vous sera envoyé à votre adresse institutionnelle après validation de l'annulation.",
      accent: null,
    },
  ]

  return (
    <div className="sticky top-28">
      <h2 className="text-2xl font-display text-on-surface mb-2 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">rule</span>
        Politique d'annulation
      </h2>
      <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
        Veuillez lire attentivement ces conditions avant de soumettre votre demande.
      </p>

      <div className="space-y-3">
        {regles.map((regle, index) => (
          <div key={index} className="bg-surface-container-lowest rounded-xl p-4 flex items-start gap-4 border border-outline-variant/20">
            <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-primary text-lg">{regle.icone}</span>
            </div>
            <div>
              <p className="font-bold text-on-surface text-sm mb-1">{regle.titre}</p>
              <p className="text-on-surface-variant text-xs leading-relaxed">
                {regle.accent
                  ? regle.texte.split(regle.accent).map((part, i) => (
                      <span key={i}>
                        {part}
                        {i === 0 && <strong className="text-on-surface">{regle.accent}</strong>}
                      </span>
                    ))
                  : regle.texte}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Encadré contact admin */}
      <div className="mt-6 bg-primary/5 border border-primary/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-primary text-base">support_agent</span>
          <p className="text-sm font-bold text-primary">Besoin d'aide ?</p>
        </div>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Pour toute réservation confirmée ou litige, contactez l'administration à{' '}
          <a href="mailto:admin@uca.ac.ma" className="text-primary underline">admin@uca.ac.ma</a>
        </p>
      </div>
    </div>
  )
}

export default PolitiqueAnnulation