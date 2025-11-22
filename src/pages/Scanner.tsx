import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { X, Flashlight, FlashlightOff, Camera, Keyboard, ScanLine } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Scanner = () => {
  const navigate = useNavigate();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFlashlight, setHasFlashlight] = useState(false);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [showManualDialog, setShowManualDialog] = useState(false);
  const [scanMode, setScanMode] = useState<"barcode" | "image">("barcode");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scanMode === "barcode") {
      startScanner();
    } else {
      stopScanner();
    }
    
    return () => {
      stopScanner();
    };
  }, [scanMode]);

  const startScanner = async () => {
    try {
      setError(null);
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      // Request camera permissions
      const cameras = await Html5Qrcode.getCameras();
      if (cameras.length === 0) {
        setError("No cameras found on this device");
        return;
      }

      // Use back camera if available
      const backCamera = cameras.find(cam => 
        cam.label.toLowerCase().includes('back') || 
        cam.label.toLowerCase().includes('rear')
      ) || cameras[0];

      // Check for flashlight support
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { deviceId: backCamera.id } 
      });
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as any;
      setHasFlashlight(!!capabilities.torch);
      stream.getTracks().forEach(track => track.stop());

      // Start scanning
      await html5QrCode.start(
        backCamera.id,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Ignore continuous scanning errors
          console.debug("Scan error:", errorMessage);
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.error("Scanner error:", err);
      setError("Failed to access camera. Please grant camera permissions and try again.");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        setIsScanning(false);
        setFlashlightOn(false);
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  const handleScanSuccess = async (barcode: string) => {
    try {
      await stopScanner();
      setIsScanning(false);
      
      toast({
        title: "Processing Scan...",
        description: "Searching database and analyzing sustainability impact.",
      });

      // CALL THE NEW PIPELINE FUNCTION
      const { data, error } = await supabase.functions.invoke('process-scan', {
        body: { barcode }
      });

      if (error) {
        console.error('Scan pipeline error:', error);
        toast({
          title: "Product Not Found",
          description: "We couldn't identify this product in any database.",
          variant: "destructive",
        });
        setTimeout(() => startScanner(), 2000); // Restart scanner
        return;
      }

      const product = data;
      
      // Add to user history logic
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('scan_history').insert({
          user_id: user.id,
          product_id: product.id
        });
      }

      toast({
        title: "Success!",
        description: `Found: ${product.name}`,
      });
      
      // Navigate to details
      navigate(ROUTES.PRODUCT_BY_ID(product.id));

    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setTimeout(() => startScanner(), 2000);
    }
  };

  const toggleFlashlight = async () => {
    if (!scannerRef.current || !hasFlashlight) return;
    
    try {
      const stream = await (scannerRef.current as any).getRunningTrackCameraCapabilities();
      const track = stream.getVideoTracks()[0];
      await track.applyConstraints({
        advanced: [{ torch: !flashlightOn }]
      });
      setFlashlightOn(!flashlightOn);
    } catch (err) {
      console.error("Flashlight error:", err);
      toast({
        title: "Flashlight unavailable",
        description: "Could not toggle flashlight.",
        variant: "destructive",
      });
    }
  };

  const handleManualEntry = () => {
    if (!manualCode.trim()) {
      toast({
        title: "Invalid code",
        description: "Please enter a valid barcode.",
        variant: "destructive",
      });
      return;
    }
    
    setShowManualDialog(false);
    handleScanSuccess(manualCode);
  };

  const handleImageCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    toast({
      title: "Recognizing product...",
      description: "Analyzing image with AI",
    });

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;

        // Call product recognition edge function
        const { data, error } = await supabase.functions.invoke('product-recognition', {
          body: { imageBase64: base64Image }
        });

        setIsProcessing(false);

        if (error) {
          console.error('Error recognizing product:', error);
          toast({
            title: "Recognition Failed",
            description: "Could not identify the product. Please try again.",
            variant: "destructive",
          });
          return;
        }

        const { product, recognition } = data;

        toast({
          title: "Product Recognized!",
          description: `${recognition.product_name} (${Math.round(recognition.confidence * 100)}% confidence)`,
        });

        // Generate eco score for the product
        const { error: ecoError } = await supabase.functions.invoke('generate-eco-score', {
          body: {
            productId: product.id,
            productData: {
              name: product.name,
              brand: product.brand,
              category: product.category,
              description: product.description,
              certifications: product.certifications
            }
          }
        });

        if (ecoError) {
          console.error('Error generating eco score:', ecoError);
        }

        // Add to scan history
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('scan_history').insert({
            user_id: user.id,
            product_id: product.id
          });
        }

        // Navigate to product detail page
        navigate(ROUTES.PRODUCT_BY_ID(product.id));
      };

      reader.readAsDataURL(file);
    } catch (error) {
      setIsProcessing(false);
      console.error('Error processing image:', error);
      toast({
        title: "Error",
        description: "Failed to process image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    stopScanner();
    navigate(ROUTES.HOME);
  };

  return (
    <Layout showBottomNav={false}>
      <div className="relative h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-success/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        {/* Mode Selector */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto animate-slide-up">
          <Tabs value={scanMode} onValueChange={(v) => setScanMode(v as "barcode" | "image")} className="w-72">
            <TabsList className="grid w-full grid-cols-2 bg-black/30 backdrop-blur-xl border border-white/10">
              <TabsTrigger value="barcode" className="data-[state=active]:bg-primary/20 data-[state=active]:text-white">
                <ScanLine className="h-4 w-4 mr-2" />
                Barcode
              </TabsTrigger>
              <TabsTrigger value="image" className="data-[state=active]:bg-primary/20 data-[state=active]:text-white">
                <Camera className="h-4 w-4 mr-2" />
                Image
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {scanMode === "barcode" ? (
          <>
            {/* Scanner viewfinder */}
            <div id="qr-reader" className="w-full h-full" />

            {/* Enhanced Scanning overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative animate-scale-in">
                  <div className="w-72 h-72 border-4 border-primary/50 rounded-3xl shadow-2xl backdrop-blur-sm bg-black/10">
                    {/* Corner decorations */}
                    <div className="absolute -top-1 -left-1 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-3xl" />
                    <div className="absolute -top-1 -right-1 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-3xl" />
                    <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-3xl" />
                    <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-3xl" />
                  </div>
                  {isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse shadow-glow" />
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div className="absolute top-32 left-0 right-0 flex justify-center pointer-events-auto animate-fade-in">
                <Card className="glass max-w-sm mx-4">
                  <CardContent className="p-4">
                    <p className="text-sm text-center font-medium text-white">
                      {isScanning 
                        ? "Position barcode within the frame" 
                        : "Initializing camera..."}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Image Scan Mode */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-4">
              <Card className="glass max-w-md w-full animate-scale-in">
                <CardContent className="p-8 text-center space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
                    <Camera className="relative h-20 w-20 mx-auto text-primary drop-shadow-glow" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">AI Image Recognition</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      Take a photo or upload an image of the product to identify it using advanced AI technology
                    </p>
                  </div>
                  
                  <Button 
                    onClick={() => fileInputRef.current?.click()} 
                    size="lg" 
                    className="w-full h-14 text-lg gap-3 shadow-glow hover:shadow-xl transition-all hover:-translate-y-0.5"
                    disabled={isProcessing}
                  >
                    <Camera className="h-6 w-6" />
                    {isProcessing ? (
                      <>
                        <span>Processing</span>
                        <div className="ml-2 h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      </>
                    ) : "Capture / Upload Image"}
                  </Button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleImageCapture}
                  />
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Controls */}
        <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-4 px-4 z-10">
          <Button
            variant="secondary"
            size="lg"
            onClick={handleBack}
            className="rounded-full h-16 w-16 p-0 bg-black/30 backdrop-blur-xl border border-white/10 hover:bg-black/50 hover:border-white/20 transition-all hover:scale-110"
          >
            <X className="h-7 w-7 text-white" />
          </Button>

          {scanMode === "barcode" && (
            <>
              {hasFlashlight && (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={toggleFlashlight}
                  className="rounded-full h-16 w-16 p-0 bg-black/30 backdrop-blur-xl border border-white/10 hover:bg-black/50 hover:border-white/20 transition-all hover:scale-110"
                >
                  {flashlightOn ? (
                    <FlashlightOff className="h-7 w-7 text-warning" />
                  ) : (
                    <Flashlight className="h-7 w-7 text-white" />
                  )}
                </Button>
              )}

              <Dialog open={showManualDialog} onOpenChange={setShowManualDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="rounded-full h-16 w-16 p-0 bg-black/30 backdrop-blur-xl border border-white/10 hover:bg-black/50 hover:border-white/20 transition-all hover:scale-110"
                  >
                    <Keyboard className="h-7 w-7 text-white" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass">
                  <DialogHeader>
                    <DialogTitle>Enter Barcode Manually</DialogTitle>
                    <DialogDescription>
                      Type the barcode number if scanning isn&apos;t working.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="barcode">Barcode Number</Label>
                      <Input
                        id="barcode"
                        placeholder="e.g., 012345678901"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleManualEntry()}
                        className="h-12"
                      />
                    </div>
                    <Button onClick={handleManualEntry} className="w-full h-12">
                      Look Up Product
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="absolute bottom-32 left-4 right-4 animate-slide-up z-10">
            <Alert variant="destructive" className="glass border-destructive/50">
              <AlertDescription className="text-white font-medium">{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Loading state */}
        {((!isScanning && !error && scanMode === "barcode") || isProcessing) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20">
            <div className="text-center space-y-4 animate-scale-in">
              <LoadingSpinner size="lg" className="text-primary mx-auto" />
              <p className="text-white font-medium">
                {isProcessing ? "Analyzing image..." : "Initializing camera..."}
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Scanner;
