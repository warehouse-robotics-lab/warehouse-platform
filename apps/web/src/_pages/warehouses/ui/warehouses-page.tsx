import Link from "next/link";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/shared/ui/empty";
import { buttonVariants } from "@/shared/ui/button";

export function WarehousesPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <h1 className="text-title font-semibold">Мои склады</h1>
      <Link
        href="/warehouses/demo/edit"
        className={buttonVariants({ className: "w-fit" })}
      >
        Открыть редактор
      </Link>
      <Empty className="p-0 text-wrap">
        <EmptyHeader className="max-w-none">
          {/* `cn` не знает токен `text-section` как размер шрифта и оставил бы `text-sm`
              компонента, поэтому размер задан явно через `text-(length:…)`. */}
          <EmptyTitle className="text-(length:--text-section) leading-(--text-section--line-height) font-semibold tracking-normal">
            Здесь пока нет складов
          </EmptyTitle>
          <EmptyDescription className="text-sm/5">
            Когда у вас появятся склады, они будут показаны на этой странице.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
