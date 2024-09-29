import { and, count, eq, gte, lte, sql } from 'drizzle-orm'
import { dataBase } from '../db'
import { goalCompletions, goals } from '../db/schema'
import dayjs from 'dayjs'

interface IInsertGoalCompletion {
    goalId: string
}

export const insertGoalCompletion = async ({
    goalId,
}: IInsertGoalCompletion) => {
    const firstDayOfWeek = dayjs().startOf('week').toDate()
    const lastDayOfWeek = dayjs().endOf('week').toDate()

    const goalCompletionCount = dataBase.$with('goal_completion_count').as(
        dataBase
            .select({
                goalId: goalCompletions.goalId,
                completionCount: count(goalCompletions.id).as(
                    'completionCount'
                ),
            })
            .from(goalCompletions)
            .where(
                and(
                    gte(goalCompletions.createdAt, firstDayOfWeek),
                    lte(goalCompletions.createdAt, lastDayOfWeek),
                    eq(goalCompletions.goalId, goalId)
                )
            )
            .groupBy(goalCompletions.goalId)
    )

    const goalCompletionToVerifyIfWasAlreadyCompleted = await dataBase
        .with(goalCompletionCount)
        .select({
            desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
            completionCount: sql`
            COALESCE(${goalCompletionCount.completionCount}, 0)`.mapWith(
                Number
            ),
        })
        .from(goals)
        .leftJoin(goalCompletionCount, eq(goalCompletionCount.goalId, goals.id))
        .where(eq(goals.id, goalId))

    const { completionCount, desiredWeeklyFrequency } =
        goalCompletionToVerifyIfWasAlreadyCompleted[0]
    if (completionCount >= desiredWeeklyFrequency) {
        throw new Error('Goal has reached its desired weekly frequency')
    }
    const result = await dataBase
        .insert(goalCompletions)
        .values({ goalId })
        .returning()

    const goalCompletion = result[0]

    return { goalCompletion }
}
