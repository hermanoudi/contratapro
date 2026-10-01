// O backend responde algumas mensagens em inglês ou sem acento; aqui viram português de gente
const KNOWN_ERRORS = {
  // Cadastro e senha
  'Email already registered': 'Já existe uma conta com este e-mail. Entre com ele ou use outro e-mail.',
  'Token invalido ou expirado': 'Este link não vale mais. Peça um link novo em "Esqueci minha senha".',
  'A senha nao atende aos criterios de seguranca': 'A senha não atende às regras de segurança.',
  'Usuario nao encontrado': 'Não encontramos essa conta. Peça um link novo em "Esqueci minha senha".',
  // Agendamento
  'This slot is already booked': 'Alguém marcou este horário agora há pouco. Escolha outro.',
  'Professional is not available at this time': 'O profissional não atende neste horário. Escolha outro.',
  'Professional is not available on this day': 'O profissional não atende neste dia. Escolha outro.',
  'Professional is currently not accepting appointments': 'Este profissional não está recebendo agendamentos agora.',
  'Service not found': 'Este serviço não está mais disponível. Escolha outro.',
  'start_time and end_time are required for hourly services': 'Escolha um horário para este serviço.',
  // Painel do profissional
  'Only professionals can create services': 'Só profissionais podem cadastrar serviços.',
  'Only professionals can set working hours': 'Só profissionais podem marcar horários de atendimento.',
  'Working hour not found': 'Este horário já não existe. Recarregue a página.',
  // Detalhe do agendamento
  'Appointment not found': 'Não encontramos este agendamento.',
  'Not authorized': 'Este agendamento não é da sua conta.',
  'Only professionals can mark as completed': 'Só o profissional pode marcar o serviço como concluído.',
  'Reason is mandatory and must be at least 5 characters': 'Escreva o motivo com pelo menos 5 letras.',
  'Invalid status': 'Essa mudança não é possível para este agendamento.',
};

export const translateError = (detail, fallback) =>
  (typeof detail === 'string' && (KNOWN_ERRORS[detail] || detail)) || fallback;
