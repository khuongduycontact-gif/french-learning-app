import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "./layout";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const courses = await prisma.course.findMany({
    where: { published: true },
    select: { id: true, createdAt: true },
  });

  const courseEntries: MetadataRoute.Sitemap = courses.map((c) => ({
    url: `${SITE_URL}/courses/${c.id}`,
    lastModified: c.createdAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/courses`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/achievements`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...courseEntries,
  ];
}
