function InscriptionInfo() {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-8 sticky top-28">

      <span className="inline-block bg-primary text-on-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4">
        Inscription ouverte
      </span>

      <h1 className="text-3xl font-display text-on-surface leading-snug mb-4">
        Inscription à un Événement Académique
      </h1>

      <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
        Participez à la vie savante de l'institution. Votre inscription sera
        validée par le bureau du registraire après vérification de vos acquis.
      </p>

      <div className="flex items-start gap-3 mb-5">
        <span className="material-symbols-outlined text-primary text-xl mt-0.5">verified</span>
        <div>
          <p className="font-bold text-on-surface text-sm">Validation</p>
          <p className="text-on-surface-variant text-xs mt-1">
            Vérification immédiate via le registre central de l'Université Cadi Ayyad.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-xl mt-0.5">mark_email_read</span>
        <div>
          <p className="font-bold text-on-surface text-sm">Notification de Confirmation</p>
          <p className="text-on-surface-variant text-xs mt-1">
            Une réponse de l'administration sera envoyée à votre adresse email.
          </p>
        </div>
      </div>

    </div>
  )
}

export default InscriptionInfo