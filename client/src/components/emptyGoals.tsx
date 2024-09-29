import lets_start from "../assets/lets-start.svg";
import { DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import icon from "../assets/icon.svg";

export const EmptyGoals = () => {
  return (
    <section className="h-screen flex flex-col justify-center items-center gap-8">
      <img src={icon} alt="logo" />
      <img src={lets_start} alt="imagem de um pessoa" />
      <p className="text-slate-400 leading-relaxed max-w-80 text-center">
        Voçe ainda não cadastrou nenhuma meta, que tal cadastrar uma agora
        mesmo?
      </p>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" /> Cadastrar Meta
        </Button>
      </DialogTrigger>
    </section>
  );
};
