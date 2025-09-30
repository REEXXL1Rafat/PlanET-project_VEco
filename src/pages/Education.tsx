import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Bookmark,
  Search,
  Leaf,
  Droplet,
  Recycle,
  Zap,
  TrendingUp,
  Clock,
} from "lucide-react";
import { EducationalContent } from "@/types";

// Mock educational content
const mockArticles: EducationalContent[] = [
  {
    id: "1",
    title: "Understanding Carbon Footprints",
    content: "Learn how products impact the environment through carbon emissions...",
    category: "Carbon Impact",
    image_url: "/placeholder.svg",
    reading_time: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "The Importance of Recycling",
    content: "Discover how recycling reduces waste and conserves resources...",
    category: "Recycling",
    image_url: "/placeholder.svg",
    reading_time: 7,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Ethical Sourcing Explained",
    content: "What does ethical sourcing mean and why does it matter?...",
    category: "Ethics",
    image_url: "/placeholder.svg",
    reading_time: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    title: "Energy Efficiency at Home",
    content: "Simple ways to reduce energy consumption in your daily life...",
    category: "Energy",
    image_url: "/placeholder.svg",
    reading_time: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const categories = [
  { name: "All", icon: BookOpen },
  { name: "Carbon Impact", icon: Leaf },
  { name: "Recycling", icon: Recycle },
  { name: "Water Conservation", icon: Droplet },
  { name: "Energy", icon: Zap },
];

const tipOfTheDay = {
  title: "Choose Reusable Over Disposable",
  description:
    "Opt for reusable products like water bottles, shopping bags, and food containers. This simple switch can significantly reduce your plastic waste and environmental impact.",
  category: "Waste Reduction",
};

export default function Education() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [bookmarkedArticles, setBookmarkedArticles] = useState<string[]>(["1"]);
  const [readProgress] = useState(42); // User's reading progress percentage

  const toggleBookmark = (articleId: string) => {
    setBookmarkedArticles((prev) =>
      prev.includes(articleId)
        ? prev.filter((id) => id !== articleId)
        : [...prev, articleId]
    );
  };

  const filteredArticles = mockArticles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout>
      <div className="container px-4 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Learn</h1>
          <p className="text-muted-foreground mt-1">
            Expand your sustainability knowledge
          </p>
        </div>

        {/* Tip of the Day */}
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Tip of the Day</CardTitle>
                <CardDescription>{tipOfTheDay.category}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold mb-2">{tipOfTheDay.title}</h3>
            <p className="text-sm text-muted-foreground">
              {tipOfTheDay.description}
            </p>
          </CardContent>
        </Card>

        {/* Reading Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="font-semibold">Your Reading Progress</span>
              </div>
              <span className="text-sm text-muted-foreground">{readProgress}%</span>
            </div>
            <Progress value={readProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Keep learning! You've read {Math.round((readProgress / 100) * mockArticles.length)} of{" "}
              {mockArticles.length} articles
            </p>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-5">
            {categories.map(({ name, icon: Icon }) => (
              <TabsTrigger key={name} value={name} className="gap-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="space-y-4 mt-6">
            {/* Featured Article */}
            {filteredArticles.length > 0 && (
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="md:flex">
                  <div className="md:w-1/3 bg-muted h-48 md:h-auto flex items-center justify-center">
                    <Leaf className="h-16 w-16 text-primary/30" />
                  </div>
                  <div className="md:w-2/3">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <Badge variant="secondary" className="mb-2">
                            Featured
                          </Badge>
                          <CardTitle className="text-2xl mb-2">
                            {filteredArticles[0].title}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">
                            {filteredArticles[0].content}
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleBookmark(filteredArticles[0].id)}
                        >
                          <Bookmark
                            className={`h-5 w-5 ${
                              bookmarkedArticles.includes(filteredArticles[0].id)
                                ? "fill-primary text-primary"
                                : ""
                            }`}
                          />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {filteredArticles[0].reading_time} min read
                        </div>
                        <Badge variant="outline">
                          {filteredArticles[0].category}
                        </Badge>
                      </div>
                      <Button className="mt-4">Read Article</Button>
                    </CardContent>
                  </div>
                </div>
              </Card>
            )}

            {/* Article Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredArticles.slice(1).map((article) => (
                <Card
                  key={article.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                >
                  <div className="bg-muted h-40 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                    <BookOpen className="h-12 w-12 text-primary/30" />
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <Badge variant="outline" className="mb-2">
                          {article.category}
                        </Badge>
                        <CardTitle className="text-lg line-clamp-2">
                          {article.title}
                        </CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(article.id);
                        }}
                      >
                        <Bookmark
                          className={`h-4 w-4 ${
                            bookmarkedArticles.includes(article.id)
                              ? "fill-primary text-primary"
                              : ""
                          }`}
                        />
                      </Button>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {article.content}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {article.reading_time} min read
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredArticles.length === 0 && (
              <Card className="p-12">
                <div className="text-center space-y-4">
                  <BookOpen className="h-16 w-16 text-muted-foreground mx-auto" />
                  <h3 className="text-xl font-semibold">No articles found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or category filter
                  </p>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Bookmarked Articles */}
        {bookmarkedArticles.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Bookmarks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockArticles
                .filter((article) => bookmarkedArticles.includes(article.id))
                .map((article) => (
                  <Card key={article.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg line-clamp-2">
                          {article.title}
                        </CardTitle>
                        <Bookmark className="h-4 w-4 fill-primary text-primary flex-shrink-0" />
                      </div>
                    </CardHeader>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
