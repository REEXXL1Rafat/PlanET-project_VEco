import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants/routes";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Shield,
  Camera,
  Globe,
  User,
  Info,
  Download,
  Trash2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function Settings() {
  const [notifications, setNotifications] = useState({
    productUpdates: true,
    sustainabilityTips: true,
    communityReports: false,
  });

  const [scanPreferences, setScanPreferences] = useState({
    autoScan: true,
    soundEnabled: true,
    vibrationEnabled: true,
  });

  const [privacy, setPrivacy] = useState({
    shareHistory: false,
    publicProfile: false,
  });

  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState("system");

  const handleExportData = () => {
    // Export data logic will be implemented later
    console.log("Exporting user data...");
  };

  const handleDeleteAccount = () => {
    // Delete account logic will be implemented in Phase 5
    console.log("Deleting account...");
  };

  return (
    <Layout>
      <div className="container px-4 py-6 space-y-6">
        {/* Back Button */}
        <Link to={ROUTES.PROFILE}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your app preferences and account
          </p>
        </div>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Notification Preferences</CardTitle>
            </div>
            <CardDescription>
              Choose what notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="product-updates" className="flex flex-col space-y-1">
                <span>Product Updates</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Get notified when scanned products have updated eco scores
                </span>
              </Label>
              <Switch
                id="product-updates"
                checked={notifications.productUpdates}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, productUpdates: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="sustainability-tips" className="flex flex-col space-y-1">
                <span>Sustainability Tips</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Receive daily tips for sustainable living
                </span>
              </Label>
              <Switch
                id="sustainability-tips"
                checked={notifications.sustainabilityTips}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, sustainabilityTips: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="community-reports" className="flex flex-col space-y-1">
                <span>Community Reports</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Updates on community-flagged products
                </span>
              </Label>
              <Switch
                id="community-reports"
                checked={notifications.communityReports}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, communityReports: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Privacy Controls</CardTitle>
            </div>
            <CardDescription>
              Manage your data privacy and sharing preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="share-history" className="flex flex-col space-y-1">
                <span>Share Scan History</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Contribute anonymized data to improve recommendations
                </span>
              </Label>
              <Switch
                id="share-history"
                checked={privacy.shareHistory}
                onCheckedChange={(checked) =>
                  setPrivacy({ ...privacy, shareHistory: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="public-profile" className="flex flex-col space-y-1">
                <span>Public Profile</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Make your sustainability stats visible to others
                </span>
              </Label>
              <Switch
                id="public-profile"
                checked={privacy.publicProfile}
                onCheckedChange={(checked) =>
                  setPrivacy({ ...privacy, publicProfile: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Scanning Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              <CardTitle>Scanning Preferences</CardTitle>
            </div>
            <CardDescription>
              Customize your barcode scanning experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-scan" className="flex flex-col space-y-1">
                <span>Auto Scan</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Automatically scan when barcode is detected
                </span>
              </Label>
              <Switch
                id="auto-scan"
                checked={scanPreferences.autoScan}
                onCheckedChange={(checked) =>
                  setScanPreferences({ ...scanPreferences, autoScan: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="sound" className="flex flex-col space-y-1">
                <span>Scan Sound</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Play sound when scan is successful
                </span>
              </Label>
              <Switch
                id="sound"
                checked={scanPreferences.soundEnabled}
                onCheckedChange={(checked) =>
                  setScanPreferences({ ...scanPreferences, soundEnabled: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="vibration" className="flex flex-col space-y-1">
                <span>Vibration Feedback</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Vibrate on successful scan
                </span>
              </Label>
              <Switch
                id="vibration"
                checked={scanPreferences.vibrationEnabled}
                onCheckedChange={(checked) =>
                  setScanPreferences({ ...scanPreferences, vibrationEnabled: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* App Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle>App Preferences</CardTitle>
            </div>
            <CardDescription>
              Language, theme, and display options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Account Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Account Management</CardTitle>
            </div>
            <CardDescription>
              Manage your account data and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Export My Data
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full justify-start">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Account</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove all your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive">
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              <CardTitle>About EcoVerify</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Version</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Terms of Service</span>
              <Button variant="link" size="sm" className="h-auto p-0">
                View
              </Button>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Privacy Policy</span>
              <Button variant="link" size="sm" className="h-auto p-0">
                View
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
