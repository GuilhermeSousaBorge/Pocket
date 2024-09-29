type PendingGoalsResponse = {
	id: string;
	title: string;
	desiredWeeklyFrequency: number;
	completionCount: number;
}[];

export const getPendingGoals = async (): Promise<PendingGoalsResponse> => {
	const pendingGoalsResponse = await fetch(
		"http://localhost:3333/pending-goals",
	);
	const pendingGoalsData = await pendingGoalsResponse.json();
	return pendingGoalsData.pendingGoals;
};
