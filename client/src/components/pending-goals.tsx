import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPendingGoals } from "../http/get-pending-goals";
import { OutlineButton } from "./ui/outline-button";
import { Plus } from "lucide-react";
import { markAsCompletionGoal } from "../http/mark-as-completion-goal";

export const PendingGoals = () => {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["pendingGoals"],
    queryFn: getPendingGoals,
  });

  if (!data) {
    return;
  }

  const handleMarkAsCompleted = async (goalId: string) => {
    await markAsCompletionGoal(goalId);

    queryClient.invalidateQueries({ queryKey: ["summary"] });
    queryClient.invalidateQueries({ queryKey: ["pendingGoals"] });
  };

  return (
    <div className="flex gap-3 flex-wrap">
      {data.map((goals) => {
        return (
          <OutlineButton
            key={goals.id}
            onClick={() => handleMarkAsCompleted(goals.id)}
            disabled={goals.completionCount >= goals.desiredWeeklyFrequency}
          >
            <Plus />
            {goals.title}
          </OutlineButton>
        );
      })}
    </div>
  );
};
