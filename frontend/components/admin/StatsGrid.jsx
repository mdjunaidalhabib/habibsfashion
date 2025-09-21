"use client";

import { Card, CardContent } from "../ui/card";

export default function StatsGrid() {
  const stats = [
    { title: "Total Orders", value: "1,245" },
    { title: "Products", value: "320" },
    { title: "Users", value: "5,640" },
    { title: "Revenue", value: "$45,230" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {stats.map(({ title, value }) => (
        <Card key={title}>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-2xl font-bold">{value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
