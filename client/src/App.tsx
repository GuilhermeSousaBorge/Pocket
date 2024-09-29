import { Dialog } from "./components/ui/dialog";
import { ModalCreateGoal } from "./components/modalCreateGoal";
import { EmptyGoals } from "./components/emptyGoals";
import { Summary } from "./components/summary";
import { useQuery } from "@tanstack/react-query";
import { getSummary } from "./http/get-summary";

export function App() {
  const { data } = useQuery({
    queryKey: ["summary"],
    queryFn: getSummary,
    staleTime: 1000 * 60, // 60 segundos
  });
  console.log(data);

  return (
    <Dialog>
      {/* <EmptyGoals /> */}
      {data?.total && data?.total > 0 ? <Summary /> : <EmptyGoals />}

      <ModalCreateGoal />
    </Dialog>
  );
}
