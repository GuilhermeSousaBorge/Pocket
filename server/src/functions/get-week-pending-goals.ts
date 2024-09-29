import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { dataBase } from '../db'
import { goalCompletions, goals } from '../db/schema'
import { and, count, eq, gte, lte, sql } from 'drizzle-orm'

dayjs.extend(weekOfYear)

export const getWeekPendingGoals = async () => {
    const firstDayOfWeek = dayjs().startOf('week').toDate()
    const lastDayOfWeek = dayjs().endOf('week').toDate()

    const goalsCreatedUpToWeek = dataBase.$with('goals_created_up_to_week').as(
        dataBase
            .select({
                id: goals.id,
                title: goals.title,
                desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
                createdAt: goals.createdAt,
            })
            .from(goals)
            .where(lte(goals.createdAt, lastDayOfWeek))
    )
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
                    lte(goalCompletions.createdAt, lastDayOfWeek)
                )
            )
            .groupBy(goalCompletions.goalId)
    )

    const pendingGoals = await dataBase
        .with(goalsCreatedUpToWeek, goalCompletionCount)
        .select({
            id: goalsCreatedUpToWeek.id,
            title: goalsCreatedUpToWeek.title,
            desiredWeeklyFrequency: goalsCreatedUpToWeek.desiredWeeklyFrequency,
            completionCount: sql`
            COALESCE(${goalCompletionCount.completionCount}, 0)`.mapWith(
                Number
            ),
        })
        .from(goalsCreatedUpToWeek)
        .leftJoin(
            goalCompletionCount,
            eq(goalCompletionCount.goalId, goalsCreatedUpToWeek.id)
        )

    return { pendingGoals }
}
