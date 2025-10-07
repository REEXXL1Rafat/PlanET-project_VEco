import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scan, Leaf, Users, BookOpen, Sparkles, TrendingUp, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import heroBackground from "@/assets/hero-bg.jpg";
import ecoBadge from "@/assets/eco-badge.png";

const Index = () => {
  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section 
          className="relative overflow-hidden py-20 px-4"
          style={{
            background: `linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1))`,
          }}
        >
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url(${heroBackground})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          
          <div className="container relative max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-8 animate-slide-up">
                <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Powered by AI
                </Badge>
                
                <h1 className="text-5xl lg:text-7xl font-heading font-bold leading-tight">
                  Make <span className="gradient-text">Sustainable</span> Choices Simple
                </h1>
                
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Scan any product and get instant sustainability ratings powered by AI. 
                  Join thousands making environmentally conscious purchasing decisions.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to={ROUTES.SCAN}>
                    <Button 
                      size="lg" 
                      className="h-14 px-8 text-lg gap-3 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                    >
                      <Scan className="h-6 w-6" />
                      Start Scanning
                    </Button>
                  </Link>
                  
                  <Link to={ROUTES.EDUCATION}>
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="h-14 px-8 text-lg gap-3 hover-lift"
                    >
                      <BookOpen className="h-5 w-5" />
                      Learn More
                    </Button>
                  </Link>
                </div>
                
                {/* Stats */}
                <div className="flex gap-8 pt-8">
                  <div>
                    <p className="text-3xl font-bold text-primary">10K+</p>
                    <p className="text-sm text-muted-foreground">Products Scanned</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-primary">95%</p>
                    <p className="text-sm text-muted-foreground">Accuracy Rate</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-primary">5K+</p>
                    <p className="text-sm text-muted-foreground">Active Users</p>
                  </div>
                </div>
              </div>
              
              {/* Right Content - Floating Badge */}
              <div className="relative hidden lg:block">
                <div className="relative z-10 animate-float">
                  <img 
                    src={ecoBadge} 
                    alt="Eco Badge" 
                    className="w-full max-w-md mx-auto drop-shadow-2xl"
                  />
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute top-10 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-10 left-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container max-w-6xl mx-auto">
            <div className="text-center mb-16 animate-fade-in">
              <Badge className="mb-4">Features</Badge>
              <h2 className="text-4xl font-bold mb-4">Everything You Need to Go Green</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Comprehensive tools to help you make informed, sustainable choices
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Scan,
                  title: "Instant Scanning",
                  description: "Scan barcodes or upload images to get instant eco-ratings powered by AI",
                  color: "primary"
                },
                {
                  icon: TrendingUp,
                  title: "Track Progress",
                  description: "Monitor your sustainability journey and see your environmental impact over time",
                  color: "success"
                },
                {
                  icon: Users,
                  title: "Community Driven",
                  description: "Join a community fighting greenwashing and sharing authentic sustainability data",
                  color: "accent"
                },
                {
                  icon: Award,
                  title: "Verified Ratings",
                  description: "AI-powered eco scores validated against multiple trusted sustainability databases",
                  color: "warning"
                },
                {
                  icon: BookOpen,
                  title: "Learn & Grow",
                  description: "Access educational content, tips, and guides for sustainable living",
                  color: "secondary"
                },
                {
                  icon: Sparkles,
                  title: "Smart Alternatives",
                  description: "Discover better eco-friendly alternatives for the products you scan",
                  color: "primary"
                },
              ].map((feature, index) => (
                <Card 
                  key={index}
                  className="group hover-lift animate-scale-in border-2 hover:border-primary/20"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-${feature.color}/10 group-hover:bg-${feature.color}/20 transition-colors`}>
                      <feature.icon className={`h-7 w-7 text-${feature.color}`} />
                    </div>
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container max-w-4xl mx-auto">
            <Card className="border-2 border-primary/20 shadow-glow overflow-hidden">
              <CardContent className="p-12 text-center space-y-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
                
                <div className="relative z-10 space-y-6">
                  <Leaf className="h-16 w-16 mx-auto text-primary animate-float" />
                  
                  <h2 className="text-4xl font-bold">
                    Ready to Make a Difference?
                  </h2>
                  
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Start your sustainability journey today. Every scan brings us closer to a greener planet.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Link to={ROUTES.SCAN}>
                      <Button 
                        size="lg" 
                        className="h-14 px-8 text-lg gap-3 shadow-lg"
                      >
                        <Scan className="h-6 w-6" />
                        Scan Your First Product
                      </Button>
                    </Link>
                    
                    <Link to={ROUTES.LOGIN}>
                      <Button 
                        variant="outline" 
                        size="lg"
                        className="h-14 px-8 text-lg"
                      >
                        Create Free Account
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
