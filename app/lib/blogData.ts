// app/lib/blogData.ts
export type BlogPost = {
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    publishedAt: string;
    updatedAt?: string;
    author: string;
    readingTimeMinutes: number;
    category: string;
    tags: string[];
    heroImageUrl?: string;
    seoTitle?: string;
    seoDescription?: string;
  };
  
  const posts: BlogPost[] = [
    {
      slug: "calmer-court-days-in-white-plains",
      title: "A Calmer Court Day in White Plains: Simple Ideas That Help",
      excerpt:
        "Most people don’t visit White Plains for fun. If you’re here for court, here are small, practical ways to make the day feel a little easier.",
      content: `
  ## Why this guide exists
  
  Many visitors find White Plains only because of a court date, legal meeting, or appointment. This article walks through a simple flow for the day...
  
  (Replace this with real content later.)
      `,
      publishedAt: "2025-11-15T09:00:00.000Z",
      updatedAt: "2025-11-20T10:00:00.000Z",
      author: "CityOfWhitePlains.org",
      readingTimeMinutes: 5,
      category: "Visit Guides",
      tags: ["court day", "visit", "downtown", "guides"],
      heroImageUrl: "/images/blog/court-day-guide.jpg",
      seoTitle: "A Calmer Court Day in White Plains | WP Insider Blog",
      seoDescription:
        "Practical, down-to-earth tips to make your court day in White Plains a little less stressful.",
    },
    {
      slug: "no-car-visit-white-plains",
      title: "Visiting White Plains Without a Car: A Simple Downtown Loop",
      excerpt:
        "Here’s how to enjoy White Plains using just the train, your feet, and a short rideshare if needed.",
      content: `
  ## White Plains works well on foot
  
  If you’re arriving by train, you can do a lot within a compact downtown triangle: the station, Main Street, and Mamaroneck Avenue...
  
  (Replace with real article content.)
      `,
      publishedAt: "2025-11-18T09:00:00.000Z",
      author: "CityOfWhitePlains.org",
      readingTimeMinutes: 6,
      category: "Visit Guides",
      tags: ["no car", "train", "walkable", "downtown"],
      heroImageUrl: "/images/blog/no-car-loop.jpg",
      seoTitle: "No-Car Visit to White Plains: Walkable Downtown Loop",
      seoDescription:
        "A calm, no-car-friendly way to spend time in White Plains using the train, short walks, and a simple loop.",
    },
  ];
  
  export function getAllPosts(): BlogPost[] {
    return posts
      .slice()
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }
  
  export function getPostBySlug(slug: string): BlogPost | undefined {
    return posts.find((p) => p.slug === slug);
  }