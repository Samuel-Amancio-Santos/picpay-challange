export class UnexpectedError extends Error {
  constructor() {
    super('Unexpected error your transaction was not sended')
  }
}
