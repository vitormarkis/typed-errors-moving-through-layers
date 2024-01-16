import { TDataOrError, Writeable } from "./v1"

function createDataOrError1<T extends TDataOrError>(result: T) {
  return result as Writeable<T>
}

interface UserSession {
  id: string
  name: string
  // other properties
}

// Function with explicit return type
function getUser(): TDataOrError<UserSession> {
  // Implementation
  if (Math.random() < 0.2) {
    return [new Error("An error occurred")]
  } else {
    return [null, { id: "1", name: "John Doe" /*, ...other properties */ }]
  }
}

const [error, user] = getUser()

class AppError<TCode extends string> {
  constructor(readonly code: TCode) {}
}

type UserRepository = Wrapper<{
  getById(id: string): Promise<UserSession>
  getByEmail(id: string): Promise<UserSession | null>
}>

type UserRepositoryErrors = {
  [K in keyof UserRepository]: string
}
const errorsUnion: UserRepositoryErrors = {
  getById: "NOT_FOUND",
  getByEmail: "NOT_FOUND",
}

type Wrapper<T> = {
  [K in keyof T]: T[K] extends (...args: infer TArgs) => Promise<infer R>
    ? (...args: TArgs) => Promise<TDataOrError<R>>
    : never
} & {
  [K in keyof T]: T[K] extends (...args: infer TArgs) => Promise<infer R>
    ? (...args: TArgs) => Promise<TDataOrError<R>>
    : never
}

class UserRepositoryInMemory implements UserRepository {
  async getByEmail(id: string): Promise<TDataOrError<UserSession | null, Error>> {
    return [
      null,
      {
        id: "",
        name: "",
      },
    ]
  }

  async getById(id: string): Promise<TDataOrError<UserSession, Error>> {
    return [
      null,
      {
        id: "id123",
        name: "name",
      },
    ]
  }
}
