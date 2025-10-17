import React from 'react';
import LogoBrancoLaranja from '../../assets/logo_branco_laranja.png'

const Logo = ({ 
  variant = 'horizontal', // 'horizontal', 'icon', 'compact'
  size = 'medium', // 'small', 'medium', 'large'
  theme = 'auto', // 'auto', 'light', 'dark'
  className = '',
  onClick = null
}) => {
  // Determina qual logo usar baseado no tema
  const getLogoSrc = () => {
    if (variant === 'icon') {
      return '/src/assets/logo_branco_laranja.png';
    }
    
    if (theme === 'light') {
      return size === 'small' ? '/src/assets/logo_branco_laranja.png' : '/src/assets/logo_branco_laranja.png';
    }
    
    if (theme === 'dark') {
      return size === 'small' ? '/src/assets/200px branco.png' : '/src/assets/500px branco.png';
    }
    
    // Auto: usa branco e laranja por padrão (assumindo tema escuro)
    return size === 'small' ? '/src/assets/logo_branco_laranja.png' : '/src/assets/logo_branco_laranja.png';
  };

  // Determina as classes de tamanho
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return variant === 'icon' ? 'w-8 h-8' : 'h-6';
      case 'large':
        return variant === 'icon' ? 'w-16 h-16' : 'h-12';
      case 'medium':
      default:
        return variant === 'icon' ? 'w-10 h-10' : 'h-8';
    }
  };

  const logoSrc = getLogoSrc();
  const sizeClasses = getSizeClasses();
  
  const baseClasses = 'object-contain';
  const interactiveClasses = onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : '';
  
  return (
    <img
      src={LogoBrancoLaranja}
      id='logo_sidebar'
      alt="SíndicoApp"
      className={`${baseClasses} ${sizeClasses} ${interactiveClasses} ${className}`}
      onClick={onClick}
    />
  );
};

export default Logo;
