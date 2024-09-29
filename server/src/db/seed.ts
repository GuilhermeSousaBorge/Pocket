import dayjs from 'dayjs'
import { client, dataBase } from '.'
import { goalCompletions, goals } from './schema'

const seed = async () => {
    await dataBase.delete(goalCompletions)
    await dataBase.delete(goals)

    const startWeek = dayjs().startOf('week')

    const result = await dataBase
        .insert(goals)
        .values([
            { title: 'test', desiredWeeklyFrequency: 1 },
            { title: 'test2', desiredWeeklyFrequency: 1 },
            { title: 'test3', desiredWeeklyFrequency: 2 },
        ])
        .returning()
    console.log(result)
    await dataBase
        .insert(goalCompletions)
        .values([
            { goalId: result[0].id, createdAt: startWeek.toDate() },
            {
                goalId: result[1].id,
                createdAt: startWeek.add(1, 'day').toDate(),
            },
            {
                goalId: result[2].id,
                createdAt: startWeek.add(3, 'day').toDate(),
            },
        ])
        .execute()
}

seed().finally(() => {
    client.end()
})
