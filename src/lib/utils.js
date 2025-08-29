import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Formatação de CNPJ/CPF
export function formatCNPJ(cnpj) {
  if (!cnpj) return '';
  const numbers = cnpj.replace(/\D/g, '');
  
  if (numbers.length === 11) {
    // CPF
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (numbers.length === 14) {
    // CNPJ
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  
  return cnpj;
}

// Remove formatação de CNPJ/CPF
export function cleanCNPJ(cnpj) {
  return cnpj ? cnpj.replace(/\D/g, '') : '';
}

// Formatação de data
export function formatDate(dateString) {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  } catch {
    return dateString;
  }
}

// Formatação de data e hora
export function formatDateTime(dateString) {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  } catch {
    return dateString;
  }
}

// Formatação de números
export function formatNumber(number, decimals = 2) {
  if (number === null || number === undefined) return '0';
  
  return Number(number).toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// Formatação de moeda
export function formatCurrency(value) {
  if (value === null || value === undefined) return 'R$ 0,00';
  
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

// Validação de CNPJ
export function isValidCNPJ(cnpj) {
  const numbers = cleanCNPJ(cnpj);
  
  if (numbers.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(numbers)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  let weight = 5;
  
  for (let i = 0; i < 12; i++) {
    sum += parseInt(numbers[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  
  let digit = sum % 11;
  digit = digit < 2 ? 0 : 11 - digit;
  
  if (parseInt(numbers[12]) !== digit) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  weight = 6;
  
  for (let i = 0; i < 13; i++) {
    sum += parseInt(numbers[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  
  digit = sum % 11;
  digit = digit < 2 ? 0 : 11 - digit;
  
  return parseInt(numbers[13]) === digit;
}

// Validação de CPF
export function isValidCPF(cpf) {
  const numbers = cleanCNPJ(cpf);
  
  if (numbers.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(numbers)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i);
  }
  
  let digit = sum % 11;
  digit = digit < 2 ? 0 : 11 - digit;
  
  if (parseInt(numbers[9]) !== digit) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * (11 - i);
  }
  
  digit = sum % 11;
  digit = digit < 2 ? 0 : 11 - digit;
  
  return parseInt(numbers[10]) === digit;
}

// Validação de CNPJ ou CPF
export function isValidDocument(document) {
  const numbers = cleanCNPJ(document);
  
  if (numbers.length === 11) {
    return isValidCPF(document);
  } else if (numbers.length === 14) {
    return isValidCNPJ(document);
  }
  
  return false;
}

// Trunca texto
export function truncateText(text, maxLength = 50) {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
}

// Converte data para formato da API (DD/MM/YYYY)
export function formatDateForAPI(date) {
  if (!date) return '';
  
  if (typeof date === 'string') {
    // Se já está no formato DD/MM/YYYY, retorna como está
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
      return date;
    }
    
    // Se está no formato YYYY-MM-DD, converte
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [year, month, day] = date.split('-');
      return `${day}/${month}/${year}`;
    }
  }
  
  if (date instanceof Date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  
  return '';
}

// Converte data do formato da API (DD/MM/YYYY) para Date
export function parseDateFromAPI(dateString) {
  if (!dateString) return null;
  
  const [day, month, year] = dateString.split('/');
  return new Date(year, month - 1, day);
}

// Debounce para otimizar buscas
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Mapeia tipos de operação para labels
export function getOperationLabel(tipo) {
  const labels = {
    saida: 'Saída para Consignação',
    retorno: 'Retorno de Consignação',
    simbolico: 'Retorno Simbólico',
    faturamento: 'Faturamento',
    outros: 'Outros'
  };
  
  return labels[tipo] || tipo;
}

// Mapeia tipos de operação para cores
export function getOperationColor(tipo) {
  const colors = {
    saida: 'bg-blue-100 text-blue-800',
    retorno: 'bg-green-100 text-green-800',
    simbolico: 'bg-yellow-100 text-yellow-800',
    faturamento: 'bg-purple-100 text-purple-800',
    outros: 'bg-gray-100 text-gray-800'
  };
  
  return colors[tipo] || colors.outros;
}

// Calcula status do saldo
export function getSaldoStatus(saldo) {
  if (saldo <= 0) {
    return { label: 'Zerado', color: 'bg-gray-100 text-gray-800' };
  } else if (saldo <= 5) {
    return { label: 'Crítico', color: 'bg-red-100 text-red-800' };
  } else if (saldo <= 10) {
    return { label: 'Baixo', color: 'bg-yellow-100 text-yellow-800' };
  } else {
    return { label: 'Normal', color: 'bg-green-100 text-green-800' };
  }
}
