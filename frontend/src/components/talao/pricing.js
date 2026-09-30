export const formatPrice = (value) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: Number.isInteger(value) ? 0 : 2 });

// Serviço principal (o primeiro cadastrado) e o menor preço na mesma unidade dele: hora não se compara com dia
export const pickHighlight = (services = []) => {
  const main = services[0];
  if (!main) return null;
  const unit = main.duration_type === 'daily' ? 'daily' : 'hourly';
  const priced = services
    .filter((s) => (s.duration_type === 'daily' ? 'daily' : 'hourly') === unit && Number(s.price) > 0)
    .sort((a, b) => a.price - b.price);
  const service = priced[0] || main;
  return {
    title: service.title,
    price: priced[0] ? Number(priced[0].price) : null,
    unit: unit === 'daily' ? 'dia' : 'hora',
    fromPrice: priced.length > 1,
  };
};
