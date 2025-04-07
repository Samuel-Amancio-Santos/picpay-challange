export class CpfAlreadyExistsError extends Error {
  constructor() {
    super('Cpf is already exists')
  }
}
