import { AppHeader } from "@/widgets/app-header";
import { CabinetLayout } from "@/widgets/cabinet-layout";

export default function Layout({ children }: LayoutProps<"/">) {
  return <CabinetLayout header={<AppHeader />}>{children}</CabinetLayout>;
}
