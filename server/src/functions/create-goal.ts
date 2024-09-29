import { dataBase } from "../db"
import { goals } from "../db/schema"

interface ICreateGoal {
    title: string,
    desiredWeeklyFrequency: number
}

export const createGoal = async ({title, desiredWeeklyFrequency} : ICreateGoal) => {

    const result =  await dataBase.insert(goals).values({title, desiredWeeklyFrequency}).returning()

    const goal = result[0]

    return {
        goal
    }
}