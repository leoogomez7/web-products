import { useCategories } from "@/lib/catalog";

export function CategoryChips({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const { data: categories = [] } = useCategories();
  const all = [
    { id: null as string | null, name: "Todos" },
    ...categories.map((c) => ({ id: c.id, name: c.name })),
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {all.map((c) => {
        const active = value === c.id;
        return (
          <button
            key={c.id ?? "all"}
            onClick={() => onChange(c.id)}
            className={[
              "relative h-9 px-4 rounded-full text-xs font-medium transition-all duration-300",
              active
                ? "bg-white text-black shadow-glow"
                : "glass text-muted-foreground hover:text-foreground hover:border-white/20",
            ].join(" ")}
          >
            {c.name}
          </button>
        );
      })}
    </div>
  );
}
