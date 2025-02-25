const webhooks = {
  page_title: 'Webhooks',
  title: 'Webhooks',
  subtitle:
    'Os webhooks fornecem atualizações em tempo real sobre eventos específicos no URL do seu endpoint, permitindo reações imediatas.',
  create: 'Criar Webhook',
  events: {
    post_register: 'Criar nova conta',
    post_sign_in: 'Entrar',
    post_reset_password: 'Redefinir senha',
  },
  table: {
    name: 'Nome',
    events: 'Eventos',
    success_rate: 'Taxa de sucesso (24h)',
    requests: 'Requisições (24h)',
  },
  placeholder: {
    title: 'Webhook',
    description:
      'Os webhooks fornecem atualizações em tempo real sobre eventos específicos no URL do seu endpoint, permitindo reações imediatas. Os eventos "Criar nova conta, Entrar e Redefinir senha" agora são compatíveis.',
    create_webhook: 'Criar Webhook',
  },
  create_form: {
    title: 'Criar Webhook',
    subtitle:
      'Adicione o Webhook para enviar uma solicitação POST para o URL do endpoint com detalhes de quaisquer eventos de usuários.',
    events: 'Eventos',
    events_description: 'Selecione os eventos de gatilho que o Logto enviará a solicitação POST.',
    name: 'Nome',
    name_placeholder: 'Digite o nome do webhook',
    endpoint_url: 'Endpoint URL',
    endpoint_url_placeholder: 'https://seu.url.endpoint.do.webhook',
    endpoint_url_tip:
      'Digite a URL HTTPS do seu endpoint para a qual a carga útil de um webhook é enviada quando o evento ocorre.',
    create_webhook: 'Criar webhook',
    missing_event_error: 'Você precisa selecionar pelo menos um evento.',
    https_format_error: 'Formato HTTPS necessário por motivos de segurança.',
  },
  webhook_created: 'O webhook {{name}foi criado com sucesso.',
};

export default webhooks;
