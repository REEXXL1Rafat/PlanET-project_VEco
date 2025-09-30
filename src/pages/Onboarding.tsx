import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";
import {
  Leaf,
  Scan,
  BookOpen,
  TrendingUp,
  Camera,
  Bell,
  Check,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const onboardingSteps = [
  {
    title: "Welcome to EcoVerify",
    description:
      "Make informed, sustainable purchasing decisions by scanning products and viewing their environmental impact.",
    icon: Leaf,
    features: [
      "Real-time product scanning",
      "Comprehensive eco scores",
      "Sustainable alternatives",
    ],
  },
  {
    title: "Scan Any Product",
    description:
      "Use your camera to scan product barcodes and instantly discover their environmental impact scores.",
    icon: Scan,
    features: [
      "Barcode scanning",
      "QR code support",
      "Manual product search",
    ],
  },
  {
    title: "Learn & Improve",
    description:
      "Access educational content and track your sustainability journey with personalized insights.",
    icon: BookOpen,
    features: [
      "Daily sustainability tips",
      "Educational articles",
      "Track your progress",
    ],
  },
  {
    title: "Set Your Preferences",
    description: "Customize your experience to match your sustainability goals.",
    icon: TrendingUp,
    preferences: true,
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState({
    notifications: true,
    cameraAccess: false,
    shareData: false,
  });

  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;
  const isLastStep = currentStep === onboardingSteps.length - 1;
  const step = onboardingSteps[currentStep];
  const StepIcon = step.icon;

  const handleNext = () => {
    if (isLastStep) {
      // Request camera permission if enabled
      if (preferences.cameraAccess) {
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then(() => {
            navigate(ROUTES.HOME);
          })
          .catch(() => {
            navigate(ROUTES.HOME);
          });
      } else {
        navigate(ROUTES.HOME);
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    navigate(ROUTES.HOME);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Step {currentStep + 1} of {onboardingSteps.length}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              Skip
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Card */}
        <Card className="border-2">
          <CardContent className="pt-12 pb-8 px-8">
            <div className="text-center space-y-6">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="bg-primary/10 p-6 rounded-full">
                  <StepIcon className="h-16 w-16 text-primary" />
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-3">
                <h1 className="text-3xl font-bold">{step.title}</h1>
                <p className="text-muted-foreground text-lg max-w-md mx-auto">
                  {step.description}
                </p>
              </div>

              {/* Features or Preferences */}
              {step.preferences ? (
                <div className="space-y-6 max-w-md mx-auto">
                  <div className="text-left space-y-4 pt-4">
                    <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50">
                      <Checkbox
                        id="notifications"
                        checked={preferences.notifications}
                        onCheckedChange={(checked) =>
                          setPreferences({ ...preferences, notifications: !!checked })
                        }
                      />
                      <div className="flex-1 space-y-1">
                        <Label
                          htmlFor="notifications"
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Bell className="h-4 w-4" />
                          Enable Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Get sustainability tips and product updates
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50">
                      <Checkbox
                        id="camera"
                        checked={preferences.cameraAccess}
                        onCheckedChange={(checked) =>
                          setPreferences({ ...preferences, cameraAccess: !!checked })
                        }
                      />
                      <div className="flex-1 space-y-1">
                        <Label
                          htmlFor="camera"
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Camera className="h-4 w-4" />
                          Allow Camera Access
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Required for scanning product barcodes
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50">
                      <Checkbox
                        id="share"
                        checked={preferences.shareData}
                        onCheckedChange={(checked) =>
                          setPreferences({ ...preferences, shareData: !!checked })
                        }
                      />
                      <div className="flex-1 space-y-1">
                        <Label
                          htmlFor="share"
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <TrendingUp className="h-4 w-4" />
                          Share Anonymous Data
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Help improve recommendations for everyone
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  {step.features?.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-4 rounded-lg bg-primary/5"
                    >
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Badge hint */}
              {currentStep === 0 && (
                <div className="flex justify-center gap-2 pt-4">
                  <Badge variant="secondary">Free</Badge>
                  <Badge variant="secondary">No Account Required</Badge>
                  <Badge variant="secondary">Privacy First</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          <Button onClick={handleNext} size="lg">
            {isLastStep ? "Get Started" : "Next"}
          </Button>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center gap-2">
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-all ${
                index === currentStep
                  ? "bg-primary w-8"
                  : index < currentStep
                  ? "bg-primary/50"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
