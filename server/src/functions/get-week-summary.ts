import dayjs from "dayjs";
import { dataBase } from "../db";
import { goalCompletions, goals } from "../db/schema";
import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";

type GoalsPerDay = Record<
	string,
	{
		id: string;
		title: string;
		completedAt: string;
	}[]
>;

export const getWeekSummary = async () => {
	const firstDayOfWeek = dayjs().startOf("week").toDate();
	const lastDayOfWeek = dayjs().endOf("week").toDate();

	console.log(firstDayOfWeek);
	console.log(lastDayOfWeek);

	const goalsCreatedUpToWeek = dataBase.$with("goals_created_up_to_week").as(
		dataBase
			.select({
				id: goals.id,
				title: goals.title,
				desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
				createdAt: goals.createdAt,
			})
			.from(goals)
			.where(lte(goals.createdAt, lastDayOfWeek)),
	);

	const goalsCompletedInWeek = dataBase.$with("goals_completed_in_week").as(
		dataBase
			.select({
				id: goals.id,
				title: goals.title,
				createdAt: goalCompletions.createdAt,
				completedAt: sql`
					DATE(${goalCompletions.createdAt})
				`.as("completedAt"),
			})
			.from(goalCompletions)
			.innerJoin(goals, eq(goals.id, goalCompletions.goalId))
			.orderBy(desc(goalCompletions.createdAt))
			.where(
				and(
					gte(goalCompletions.createdAt, firstDayOfWeek),
					lte(goalCompletions.createdAt, lastDayOfWeek),
				),
			),
	);

	const goalsCompletedByWeek = dataBase.$with("goals_completed_by_week").as(
		dataBase
			.select({
				completedAt: goalsCompletedInWeek.completedAt,
				goalsCompleteds: sql`
						JSON_AGG(
							JSON_BUILD_OBJECT(
								'id', ${goalsCompletedInWeek.id},
								'title', ${goalsCompletedInWeek.title},
								'completedAt', ${goalsCompletedInWeek.createdAt}
							)
						)
					`.as("goalsCompleteds"),
			})
			.from(goalsCompletedInWeek)
			.groupBy(goalsCompletedInWeek.completedAt)
			.orderBy(desc(goalsCompletedInWeek.completedAt)),
	);

	const result = await dataBase
		.with(goalsCreatedUpToWeek, goalsCompletedInWeek, goalsCompletedByWeek)
		.select({
			completed: sql`(SELECT COUNT(*) FROM ${goalsCompletedInWeek})`.mapWith(
				Number,
			),
			total:
				sql`(SELECT SUM(${goalsCreatedUpToWeek.desiredWeeklyFrequency}) FROM ${goalsCreatedUpToWeek})`.mapWith(
					Number,
				),
			goalsPerDay: sql<GoalsPerDay>`
				JSON_OBJECT_AGG(
					${goalsCompletedByWeek.completedAt},
					${goalsCompletedByWeek.goalsCompleteds}
				)
			`,
		})
		.from(goalsCompletedByWeek);

	const summary = result[0];

	return {
		summary,
	};
};
