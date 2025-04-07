export class CpfOrCnpjAlreadyExistsError extends Error {
  constructor() {
    super('Cpf or Cnpj is already exists')
  }
}
