const connector_details = {
  page_title: 'Détails du connecteur',
  back_to_connectors: 'Retour à Connecteurs',
  check_readme: 'Vérifier le README',
  settings: 'Paramètres généraux',
  settings_description:
    "Les connecteurs jouent un rôle essentiel dans Logto. Avec leur aide, Logto permet aux utilisateurs finaux d'utiliser une inscription ou une connexion sans mot de passe et les capacités de connexion avec des comptes sociaux.",
  parameter_configuration: 'Configuration des paramètres',
  test_connection: 'Tester la connexion',
  save_error_empty_config: 'Veuillez entrer la configuration',
  send: 'Envoyer',
  send_error_invalid_format: 'Entrée non valide',
  edit_config_label: 'Entrez votre json ici',
  test_email_sender: 'Testez votre connecteur Email',
  test_sms_sender: 'Testez votre connecteur SMS',
  test_email_placeholder: 'john.doe@example.com',
  test_sms_placeholder: '+33 6 12 34 56 78',
  test_message_sent: 'Message de test envoyé',
  test_sender_description:
    'Logto utilise le modèle "Generic" pour les tests. Tu recevras un message si ton connecteur est correctement configuré.',
  options_change_email: 'Modifier le connecteur Email',
  options_change_sms: 'Changer le connecteur SMS',
  connector_deleted: 'Le connecteur a été supprimé avec succès',
  type_email: 'Connecteur Email',
  type_sms: 'Connecteur SMS',
  type_social: 'Connecteur Social',
  in_used_social_deletion_description:
    'Ce connecteur est utilisé dans votre expérience de connexion. En le supprimant, l’expérience de connexion de <name/> sera supprimée dans les paramètres de l’expérience de connexion. Vous devrez le reconfigurer si vous décidez de l’ajouter à nouveau.',
  in_used_passwordless_deletion_description:
    'Cet {{name}} est utilisé dans votre expérience de connexion. En le supprimant, votre expérience de connexion ne fonctionnera pas correctement tant que vous n’aurez pas résolu le conflit. Vous devrez le reconfigurer si vous décidez de l’ajouter à nouveau.',
  deletion_description:
    "Vous supprimez ce connecteur. Il ne peut pas être annulé et vous devrez le reconfigurer si vous décidez de l'ajouter à nouveau.",
};

export default connector_details;
