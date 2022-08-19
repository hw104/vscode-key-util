interface ErrorActions {
  [K: string]: () => Promise<void>;
}

export class ErrorWithAction extends Error {
  constructor(public message: string, public actions: ErrorActions) {
    super(message);
  }
}
