type SummaryResponse = {
	completed: number;
	total: number;
	goalsPerDay: Record<
		string,
		{
			id: string;
			title: string;
			completedAt: string;
		}[]
	>;
};

export const getSummary = async (): Promise<SummaryResponse> => {
	const summaryResponse = await fetch("http://localhost:3333/summary");
	const summaryData = await summaryResponse.json();
	return summaryData.summary;
};
