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
        title: "Looking up product...",
        description: `Barcode: ${barcode}`,
      });

      // Call barcode lookup edge function
      const { data, error } = await supabase.functions.invoke('barcode-lookup', {
        body: { barcode }
      });

      if (error) {
        console.error('Error looking up product:', error);
        toast({
          title: "Product Not Found",
          description: "This product is not in our database yet.",
          variant: "destructive",
        });
        // Restart scanner
        setTimeout(() => startScanner(), 2000);
        return;
      }

      const product = data.product;
      
      toast({
        title: "Product Found!",
        description: product.name,
      });

      // Generate eco score if not exists
      if (!product.eco_score) {
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
    } catch (error) {
      console.error('Error handling scan:', error);
      toast({
        title: "Error",
        description: "Failed to process barcode. Please try again.",
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
      <div className="relative h-[calc(100vh-4rem)] bg-black">
        {/* Mode Selector */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
          <Tabs value={scanMode} onValueChange={(v) => setScanMode(v as "barcode" | "image")} className="w-64">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="barcode">
                <ScanLine className="h-4 w-4 mr-2" />
                Barcode
              </TabsTrigger>
              <TabsTrigger value="image">
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

            {/* Scanning overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="w-64 h-64 border-4 border-primary rounded-lg shadow-lg">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary" />
                  </div>
                  {isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-1 bg-primary/50 animate-pulse" />
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div className="absolute top-24 left-0 right-0 flex justify-center pointer-events-auto">
                <Card className="bg-background/90 backdrop-blur">
                  <CardContent className="p-4">
                    <p className="text-sm text-center">
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
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
              <Card className="bg-background/90 backdrop-blur max-w-md mx-4">
                <CardContent className="p-6 text-center space-y-4">
                  <Camera className="h-16 w-16 mx-auto text-primary" />
                  <h3 className="text-xl font-semibold">Image Recognition</h3>
                  <p className="text-sm text-muted-foreground">
                    Take a photo or upload an image of the product to identify it using AI
                  </p>
                  <Button 
                    onClick={() => fileInputRef.current?.click()} 
                    size="lg" 
                    className="w-full"
                    disabled={isProcessing}
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    {isProcessing ? "Processing..." : "Capture / Upload Image"}
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
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 px-4">
          <Button
            variant="secondary"
            size="lg"
            onClick={handleBack}
            className="rounded-full h-14 w-14 p-0"
          >
            <X className="h-6 w-6" />
          </Button>

          {scanMode === "barcode" && (
            <>
              {hasFlashlight && (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={toggleFlashlight}
                  className="rounded-full h-14 w-14 p-0"
                >
                  {flashlightOn ? (
                    <FlashlightOff className="h-6 w-6" />
                  ) : (
                    <Flashlight className="h-6 w-6" />
                  )}
                </Button>
              )}

              <Dialog open={showManualDialog} onOpenChange={setShowManualDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="rounded-full h-14 w-14 p-0"
                  >
                    <Keyboard className="h-6 w-6" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
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
                      />
                    </div>
                    <Button onClick={handleManualEntry} className="w-full">
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
          <div className="absolute bottom-24 left-4 right-4">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Loading state */}
        {((!isScanning && !error && scanMode === "barcode") || isProcessing) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <LoadingSpinner size="lg" className="text-primary" />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Scanner;
