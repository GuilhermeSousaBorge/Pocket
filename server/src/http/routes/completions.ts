import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { getWeekPendingGoals } from '../../functions/get-week-pending-goals'
import { insertGoalCompletion } from '../../functions/insert-goal-completion'

export const insertCompletionsRoute: FastifyPluginAsyncZod = async app => {
    app.post(
        '/completions',
        {
            schema: {
                body: z.object({
                    goalId: z.string(),
                }),
            },
        },
        async (request, reply) => {
            const { goalId } = request.body

            await insertGoalCompletion({
                goalId,
            })
        }
    )
}
