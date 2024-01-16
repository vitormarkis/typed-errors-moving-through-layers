export type Writeable<T> = { -readonly [P in keyof T]: T[P] }
export type TDataOrError<TData = any, TError = any> = [error: TError] | [error: null, data: TData]

export function nice<T>(data: T) {
  const result = [null, data] as const
  return result as Writeable<typeof result>
}

export function fail<T>(error: T extends null | undefined ? "Only truthy values for error." : T) {
  const result = [error] as const
  return result as Writeable<typeof result>
}

class OperatorSession {
  constructor(
    readonly id: string,
    readonly name: string,
  ) {}
}

/**
 * Deep module // OperatorRepository
 */
abstract class IOperatorRepository {
  abstract findOperatorById(id: string): Promise<TDataOrError>
}

class OperatorRepository implements IOperatorRepository {
  async findOperatorById(id: string) {
    // return "random-string" // comment and uncomment this line
    if (Math.random() < 0.1) {
      return fail({ message: "Couldn't find operator." })
    }
    return nice(new OperatorSession("string", "name"))
  }
}

/**
 * Middle module // ApplicationService
 */
abstract class IApplicationService {
  abstract makeOperation(): Promise<TDataOrError>
}

class ApplicationService implements IApplicationService {
  async makeOperation() {
    const operatorRepository = new OperatorRepository()
    const [error, result] = await operatorRepository.findOperatorById("123")
    if (error) return fail(error)

    if (Math.random() < 0.1) return nice(result)
    if (Math.random() < 0.1) return nice(20)

    return nice("Operation completed.")
  }
}

type Union = "SERVICE:NOT_FOUND" | "SERVICE:DOWN"

/**
 * High module // Call other modules
 */
const usecase = (async () => {
  const applicationService = new ApplicationService()
  const [error, result] = await applicationService.makeOperation()
  if (error) return fail(error)
  if (Math.random() < 0.1) return fail("SERVICE:DOWN")
  return [null, result]
}) satisfies () => Promise<TDataOrError>

/**
 * The entry point, where I wanna handle all the failed operations and present/return something to the driver
 */
const main = async () => {
  const [error, result] = await usecase()
  if (error) {
    console.log("MAIN::ERROR")
    if (error === "SERVICE:DOWN") throw new Error("Service is down.")
    if (error === "SERVICE:NOT_FOUND") throw new Error("Service wasn't found.")
    throw error
  }
  console.log("MAIN::RESULT")
  if (result instanceof OperatorSession) return console.log("OperatorSession: ", result)
  if (typeof result === "number") return console.log("The number is: ", result)
  return console.log("The message is: ", result)
}

const mainResult = main()
