import { CheckCircle2, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { DialogTrigger } from "./ui/dialog";
import icon from "../assets/icon.svg";
import { Progress, ProgressIndicator } from "./ui/progress-bar";
import { Separator } from "./ui/separator";
import { useQuery } from "@tanstack/react-query";
import { getSummary } from "../http/get-summary";
import dayjs from "dayjs";
import ptBR from "dayjs/locale/pt-br";
import { PendingGoals } from "./pending-goals";

dayjs.locale(ptBR);

export const Summary = () => {
  const { data } = useQuery({
    queryKey: ["summary"],
    queryFn: getSummary,
    staleTime: 1000 * 60, // 60 segundos
  });
  if (!data) {
    return;
  }

  const firstDayOfWeek = dayjs().startOf("week").format("D MMM");
  const lastDayOfWeek = dayjs().endOf("week").format("D MMM");

  const goalsCompletedPercentage = Math.round(
    (data?.completed * 100) / data?.total
  );

  return (
    <div className="py-10 max-w-[30rem] px-5 flex flex-col mx-auto gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={icon} alt="" />
          <span className="text-lg font-semibold capitalize">
            {firstDayOfWeek} a {lastDayOfWeek}
          </span>
        </div>
        <DialogTrigger asChild>
          <Button size="sm">
            <Plus className="size-4" /> Cadastrar Meta
          </Button>
        </DialogTrigger>
      </div>
      <div className="flex flex-col gap-3">
        <Progress max={15} value={10}>
          <ProgressIndicator
            style={{ width: `${goalsCompletedPercentage}%` }}
          />
        </Progress>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            Voçe completou{" "}
            <span className="text-slate-100">{data?.completed}</span> de{" "}
            <span className="text-slate-100">{data?.total}</span> metas nessa
            semana.
          </span>
          <span>{goalsCompletedPercentage}%</span>
        </div>
      </div>
      <Separator />
      <PendingGoals />
      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-medium">Sua semana</h2>
        {Object.entries(data.goalsPerDay).map(([date, goals]) => {
          const weekDay = dayjs(date).format("dddd");
          const formatedDate = dayjs(date).format("DD[ de ]MMMM");
          return (
            <div key={date} className="flex flex-col gap-4">
              <h3 className="font-medium">
                <span className="capitalize">{weekDay}</span>{" "}
                <span className="text-xs font-slate-400">({formatedDate})</span>
              </h3>
              <ul className="flex flex-col gap-3">
                {goals.map((goal) => {
                  const completedDFormatedDate = dayjs(goal.completedAt).format(
                    "HH:mm"
                  );

                  return (
                    <li key={goal.id} className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-pink-500" />
                      <span className="text-sm text-slate-400">
                        Voçe completou "
                        <span className="text-slate-100">{goal.title}</span>" às{" "}
                        <span className="text-slate-100">
                          {completedDFormatedDate}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};
