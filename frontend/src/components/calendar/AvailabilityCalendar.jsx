import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Phone } from 'lucide-react';

const AvailabilityCalendar = ({ 
  reservations = [], 
  selectedSpace = null, 
  spaceConfig = null,
  onDateSelect = () => {},
  selectedDate = null 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthReservations, setMonthReservations] = useState([]);

  // Agrupar reservas por data
  useEffect(() => {
    const grouped = reservations.reduce((acc, reservation) => {
      // Normalizar a data para garantir formato YYYY-MM-DD
      let date = reservation.reservation_date;
      
      // Se a data vem como string, garantir que está no formato correto
      if (typeof date === 'string') {
        // Se vem no formato ISO (2025-09-27T03:00:00.000000Z), extrair apenas a data
        if (date.includes('T')) {
          date = date.split('T')[0];
        }
        // Se vem no formato DD/MM/YYYY, converter para YYYY-MM-DD
        else if (date.includes('/')) {
          const [day, month, year] = date.split('/');
          date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        // Se vem no formato YYYY-MM-DD, usar como está
        else if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          date = date;
        }
      }
      // Se vem como Date object, converter para string
      else if (date instanceof Date) {
        date = date.toISOString().split('T')[0];
      }
      
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(reservation);
      return acc;
    }, {});

    setMonthReservations(grouped);
  }, [reservations]);

  // Obter dias do mês
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Dias do mês anterior (para preencher a primeira semana)
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: prevMonth.getDate() - i,
        isCurrentMonth: false,
        isToday: false,
        reservations: []
      });
    }

    // Dias do mês atual
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = today.getDate() === day && 
                     today.getMonth() === month && 
                     today.getFullYear() === year;
      
      days.push({
        date: day,
        dateStr,
        isCurrentMonth: true,
        isToday,
        reservations: monthReservations[dateStr] || []
      });
    }

    // Dias do próximo mês (para completar a última semana)
    const remainingDays = 42 - days.length; // 6 semanas x 7 dias
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: day,
        isCurrentMonth: false,
        isToday: false,
        reservations: []
      });
    }

    return days;
  };

  // Navegar entre meses
  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  // Verificar se o dia da semana está disponível na configuração
  const isDayOfWeekAvailable = (dateStr) => {
    if (!spaceConfig || !spaceConfig.available_days) {
      return true; // Se não há configuração, todos os dias estão disponíveis
    }
    
    // Criar data de forma mais robusta
    const date = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = date.getDay(); // 0 = domingo, 1 = segunda, etc.
    
    // Mapear dias da semana para os valores da configuração
    const dayMapping = {
      0: 'sunday',    // domingo
      1: 'monday',    // segunda
      2: 'tuesday',   // terça
      3: 'wednesday', // quarta
      4: 'thursday',  // quinta
      5: 'friday',    // sexta
      6: 'saturday'   // sábado
    };
    
    const dayName = dayMapping[dayOfWeek];
    const isAvailable = spaceConfig.available_days.includes(dayName);
    
    return isAvailable;
  };

  // Verificar se a data está dentro do período de antecedência mínima/máxima
  const isDateWithinAdvanceLimits = (dateStr) => {
    if (!spaceConfig) return true;
    
    const today = new Date();
    const reservationDate = new Date(dateStr);
    const diffTime = reservationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Verificar antecedência mínima (em horas)
    const minAdvanceHours = spaceConfig.min_advance_hours || 0;
    const minAdvanceDays = Math.ceil(minAdvanceHours / 24);
    
    // Verificar antecedência máxima (em dias)
    const maxAdvanceDays = spaceConfig.max_advance_days || 365;
    
    return diffDays >= minAdvanceDays && diffDays <= maxAdvanceDays;
  };

  // Obter status do dia
  const getDayStatus = (day) => {
    if (!day.isCurrentMonth) return 'disabled';
    
    // Verificar se o dia da semana está disponível na configuração
    if (!isDayOfWeekAvailable(day.dateStr)) return 'not-available';
    
    // Verificar se está dentro dos limites de antecedência
    if (!isDateWithinAdvanceLimits(day.dateStr)) return 'not-available';
    
    if (day.reservations.length === 0) return 'available';
    if (day.reservations.length >= 3) return 'fully-booked';
    return 'partially-booked';
  };

  // Obter cor do dia
  const getDayColor = (day) => {
    const status = getDayStatus(day);
    const isSelected = selectedDate === day.dateStr;
    
    if (isSelected) return 'bg-[#ff6600] text-white';
    
    switch (status) {
      case 'disabled':
        return 'text-gray-600';
      case 'not-available':
        return 'text-gray-500 cursor-not-allowed opacity-50';
      case 'available':
        return 'text-white hover:bg-[#ff6600]/20';
      case 'partially-booked':
        return 'text-yellow-400 hover:bg-yellow-400/20';
      case 'fully-booked':
        return 'text-red-400 hover:bg-red-400/20';
      default:
        return 'text-white';
    }
  };

  // Obter ícone do status
  const getStatusIcon = (day) => {
    const status = getDayStatus(day);
    switch (status) {
      case 'available':
        return <div className="w-2 h-2 bg-green-400 rounded-full"></div>;
      case 'partially-booked':
        return <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>;
      case 'fully-booked':
        return <div className="w-2 h-2 bg-red-400 rounded-full"></div>;
      case 'not-available':
        return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
      default:
        return null;
    }
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="bg-[#1a1a1a] rounded-lg p-6">
      {/* Cabeçalho do calendário */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Calendar className="w-6 h-6 text-[#ff6600]" />
          <h3 className="text-xl font-bold text-white">
            Calendário de Disponibilidade
          </h3>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 text-[#ff6600] hover:bg-[#ff6600]/20 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h4 className="text-lg font-semibold text-white min-w-[200px] text-center">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h4>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 text-[#ff6600] hover:bg-[#ff6600]/20 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          <span className="text-gray-300">Disponível</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
          <span className="text-gray-300">Parcialmente Ocupado</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
          <span className="text-gray-300">Totalmente Ocupado</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
          <span className="text-gray-300">Não Disponível</span>
        </div>
        {selectedSpace && (
          <div className="ml-auto text-gray-400">
            Espaço: <span className="text-white font-medium">{selectedSpace.number}</span>
          </div>
        )}
      </div>

      {/* Grid do calendário */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {/* Cabeçalhos dos dias */}
        {dayNames.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-[#ff6600]">
            {day}
          </div>
        ))}
        
        {/* Dias do calendário */}
        {days.map((day, index) => (
          <div
            key={index}
            className={`
              relative p-2 min-h-[60px] border border-gray-700 rounded-lg cursor-pointer transition-colors
              ${getDayColor(day)}
              ${day.isCurrentMonth ? 'hover:bg-opacity-80' : ''}
              ${day.isToday ? 'ring-2 ring-[#ff6600]' : ''}
            `}
            onClick={() => {
              if (day.isCurrentMonth && day.dateStr && getDayStatus(day) !== 'not-available') {
                onDateSelect(day.dateStr);
              }
            }}
          >
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${day.isCurrentMonth ? '' : 'opacity-50'}`}>
                {day.date}
              </span>
              {day.isCurrentMonth && getStatusIcon(day)}
            </div>
            
            {/* Indicador de reservas */}
            {day.reservations.length > 0 && (
              <div className="absolute bottom-1 left-1 right-1">
                <div className="text-xs text-center truncate">
                  {day.reservations.length} reserva{day.reservations.length > 1 ? 's' : ''}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Detalhes das reservas do dia selecionado */}
      {selectedDate && monthReservations[selectedDate] && (
        <div className="mt-6 p-4 bg-[#2a2a2a] rounded-lg">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-[#ff6600]" />
            Reservas para {new Date(selectedDate).toLocaleDateString('pt-BR')}
          </h4>
          
          <div className="space-y-3">
            {monthReservations[selectedDate].map((reservation) => (
              <div key={reservation.id} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <span className="text-white font-medium">
                      {reservation.start_time.substring(0, 5)} - {reservation.end_time.substring(0, 5)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      reservation.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                      reservation.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {reservation.status === 'confirmed' ? 'Confirmada' :
                       reservation.status === 'pending' ? 'Pendente' : 'Cancelada'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-300">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{reservation.contact_name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone className="w-4 h-4" />
                      <span>{reservation.contact_phone}</span>
                    </div>
                  </div>
                  
                  {reservation.event_type && (
                    <div className="text-sm text-gray-400 mt-1">
                      Evento: {reservation.event_type}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityCalendar;
