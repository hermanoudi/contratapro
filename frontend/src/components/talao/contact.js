// Link de WhatsApp com a mensagem já escrita para o profissional (null sem número válido)
export const whatsappLink = (whatsapp, profName, serviceName = '') => {
  if (!whatsapp) return null;
  const cleanPhone = whatsapp.replace(/\D/g, '');
  if (!cleanPhone) return null;
  const phone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

  let message = `Olá ${profName}! 👋\n\n`;
  message += 'Encontrei seu perfil na plataforma *ContrataPro* e ';
  message += serviceName
    ? `tenho interesse no serviço: *${serviceName}*\n\n`
    : 'gostaria de saber mais sobre seus serviços.\n\n';
  message += 'Podemos conversar?\n\nObrigado!';

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};
