import React from 'react';

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
      return '/src/assets/sindico-icone-app.png';
    }
    
    if (theme === 'light') {
      return size === 'small' ? '/src/assets/200px branco e laranja.png' : '/src/assets/500px branco e laranja.png';
    }
    
    if (theme === 'dark') {
      return size === 'small' ? '/src/assets/200px branco.png' : '/src/assets/500px branco.png';
    }
    
    // Auto: usa branco e laranja por padrão (assumindo tema escuro)
    return size === 'small' ? '/src/assets/200px branco e laranja.png' : '/src/assets/500px branco e laranja.png';
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
      src={logoSrc}
      alt="SíndicoApp"
      className={`${baseClasses} ${sizeClasses} ${interactiveClasses} ${className}`}
      onClick={onClick}
    />
  );
};

export default Logo;
