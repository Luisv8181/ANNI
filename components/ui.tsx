export function PanelTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-8 w-8 place-items-center rounded-md bg-lilac text-accent">{icon}</div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
    </div>
  );
}
