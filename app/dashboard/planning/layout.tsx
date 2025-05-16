import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Planning',
  description: 'Planning'
};

export default async function PlanningLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
        {children}
    </div>
  );
}