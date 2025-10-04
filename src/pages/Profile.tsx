import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ROUTES } from "@/constants/routes";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import {
  Settings,
  Award,
  TrendingUp,
  Leaf,
  Droplet,
  Recycle,
  Users,
  BookOpen,
  LogOut,
  User,
  Flag,
  History,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Profile() {
  const { user, signOut } = useAuth();
  const { canModerate } = useUserRole();

  const handleLogout = async () => {
    await signOut();
  };

  const sustainabilityStats = {
    totalScans: 47,
    avgEcoScore: 78,
    carbonSaved: 12.5, // kg
    productsWithAlternatives: 23,
  };

  const achievements = [
    { icon: Leaf, title: "Eco Warrior", description: "50+ product scans", progress: 94 },
    { icon: Recycle, title: "Recycling Champion", description: "Choose 20 recyclable products", progress: 65 },
    { icon: Droplet, title: "Water Saver", description: "Select water-efficient products", progress: 40 },
  ];

  // Get display name from user email or metadata
  const displayName = user?.user_metadata?.display_name || 
    user?.email?.split("@")[0] || 
    "EcoVerify User";
  
  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Layout>
      <div className="container px-4 py-6 space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage src="" alt="User" />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left space-y-2">
                <h1 className="text-2xl font-bold">{displayName}</h1>
                <p className="text-muted-foreground">
                  {user?.email}
                </p>
                <div className="flex gap-2 justify-center sm:justify-start">
                  <Badge variant="secondary">
                    <Award className="h-3 w-3 mr-1" />
                    Eco Enthusiast
                  </Badge>
                  <Badge variant="secondary">Level 3</Badge>
                </div>
              </div>
              <Link to={ROUTES.SETTINGS}>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Sustainability Impact Summary */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Sustainability Impact</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sustainabilityStats.totalScans}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Products analyzed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Eco Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sustainabilityStats.avgEcoScore}</div>
                <p className="text-xs text-success mt-1">
                  +5% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Carbon Saved</CardTitle>
                <Leaf className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sustainabilityStats.carbonSaved} kg</div>
                <p className="text-xs text-muted-foreground mt-1">
                  CO₂ equivalent
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Better Choices</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {sustainabilityStats.productsWithAlternatives}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Sustainable alternatives chosen
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Achievements */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="font-semibold">{achievement.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {achievement.description}
                        </p>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span>{achievement.progress}%</span>
                          </div>
                          <Progress value={achievement.progress} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to={ROUTES.HISTORY}>
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 p-6">
                  <History className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">View Scan History</h3>
                    <p className="text-sm text-muted-foreground">
                      Review your scanned products
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to={ROUTES.EDUCATION}>
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 p-6">
                  <BookOpen className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Learn More</h3>
                    <p className="text-sm text-muted-foreground">
                      Explore sustainability tips
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {canModerate && (
              <Link to={ROUTES.REPORTS}>
                <Card className="hover:bg-accent transition-colors cursor-pointer">
                  <CardContent className="flex items-center gap-4 p-6">
                    <Flag className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold">Moderate Reports</h3>
                      <p className="text-sm text-muted-foreground">
                        Review community reports
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )}
          </div>
        </div>

        {/* Logout */}
        <Card>
          <CardContent className="pt-6">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Logout</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to logout from EcoVerify?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout}>
                    Logout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
