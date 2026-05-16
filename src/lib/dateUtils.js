export const JS_DAY_TO_SCHEDULE = {
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sábado'
};

export const getAvailableDates = () => {
  const dates = [];
  let current = new Date();
  
  // Se for domingo, pula para segunda
  if (current.getDay() === 0) {
    current.setDate(current.getDate() + 1);
  }

  while (dates.length < 14) {
    if (current.getDay() !== 0) { // Pula domingos
      dates.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

export const SCHEDULE = {
  'Segunda-feira': ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
  'Terça-feira': ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
  'Quarta-feira': ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
  'Quinta-feira': ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
  'Sexta-feira': ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
  'Sábado': ['09:00', '10:00', '11:00', '12:00', '13:00'],
};

export const getFilteredSchedule = (date) => {
  const dayName = JS_DAY_TO_SCHEDULE[date.getDay()];
  const allSlots = SCHEDULE[dayName] || [];
  
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  
  if (!isToday) return allSlots;

  // Se for hoje, filtra horários passados (com 1h de margem de segurança)
  const currentHour = today.getHours();
  return allSlots.filter(slot => {
    const [hour] = slot.split(':').map(Number);
    return hour > currentHour;
  });
};
