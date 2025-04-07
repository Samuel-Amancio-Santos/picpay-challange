export class NoCreditsError extends Error {
  constructor() {
    super('You dont have credits')
  }
}
