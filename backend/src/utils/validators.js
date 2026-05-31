function isEmpty(value) {
  return !value || String(value).trim() === "";
}

function validateName(name, fieldName = "Nome") {
  const onlyLetters = /^[A-Za-zÀ-ÿ\s]+$/;

  if (isEmpty(name)) {
    return `${fieldName} é obrigatório.`;
  }

  if (name.trim().length < 3) {
    return `${fieldName} precisa ter pelo menos 3 letras.`;
  }

  if (!onlyLetters.test(name.trim())) {
    return `${fieldName} deve conter apenas letras e espaços.`;
  }

  return null;
}

function validatePhone(phone) {
  const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;

  if (isEmpty(phone)) {
    return "Telefone é obrigatório.";
  }

  if (!phoneRegex.test(phone)) {
    return "Telefone deve estar no formato (67) 99999-9999.";
  }

  return null;
}

function validateLicense(license) {
  const licenseRegex = /^\d{11}$/;

  if (isEmpty(license)) {
    return "CNH é obrigatória.";
  }

  if (!licenseRegex.test(license)) {
    return "CNH deve ter exatamente 11 números.";
  }

  return null;
}

function validateStatus(status, validStatuses, fieldName = "Status") {
  if (isEmpty(status)) {
    return `${fieldName} é obrigatório.`;
  }

  if (!validStatuses.includes(status)) {
    return `${fieldName} inválido.`;
  }

  return null;
}

function validatePlate(plate) {
  const oldPlateRegex = /^[A-Z]{3}-\d{4}$/;
  const mercosulRegex = /^[A-Z]{3}\d[A-Z]\d{2}$/;

  if (isEmpty(plate)) {
    return "Placa é obrigatória.";
  }

  const normalizedPlate = plate.trim().toUpperCase();

  if (!oldPlateRegex.test(normalizedPlate) && !mercosulRegex.test(normalizedPlate)) {
    return "Placa deve estar no formato ABC-1234 ou ABC1D23.";
  }

  return null;
}

function validateCoordinate(value, fieldName) {
  const numberValue = Number(value);

  if (value === undefined || value === null || value === "") {
    return `${fieldName} é obrigatório.`;
  }

  if (Number.isNaN(numberValue)) {
    return `${fieldName} deve ser um número válido.`;
  }

  return null;
}

function validateLineCode(code) {
  const codeRegex = /^\d{3}$/;

  if (isEmpty(code)) {
    return "Código da linha é obrigatório.";
  }

  if (!codeRegex.test(code)) {
    return "Código da linha deve ter exatamente 3 números. Exemplo: 070.";
  }

  return null;
}

function validateDescription(description) {
  if (isEmpty(description)) {
    return "Descrição é obrigatória.";
  }

  if (description.trim().length < 5) {
    return "Descrição precisa ter pelo menos 5 caracteres.";
  }

  return null;
}

module.exports = {
  isEmpty,
  validateName,
  validatePhone,
  validateLicense,
  validateStatus,
  validatePlate,
  validateCoordinate,
  validateLineCode,
  validateDescription
};