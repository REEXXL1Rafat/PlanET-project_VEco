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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

      const cameras = await Html5Qrcode.getCameras();
      if (cameras.length === 0) {
        setError("No cameras found");
        return;
      }

      const backCamera = cameras.find(cam => 
        cam.label.toLowerCase().includes('back') || 
        cam.label.toLowerCase().includes('rear')
      ) || cameras[0];

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { deviceId: backCamera.id } 
      });
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as any;
      setHasFlashlight(!!capabilities.torch);
      stream.getTracks().forEach(track => track.stop());

      await html5QrCode.start(
        backCamera.id,
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        (decodedText) => handleScanSuccess(decodedText),
        () => {}
      );

      setIsScanning(true);
    } catch (err) {
      console.error("Scanner error:", err);
      setError("Failed to access camera.");
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
        setTimeout(() => startScanner(), 2000);
        return;
      }

      const product = data;
      
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
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;

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

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('scan_history').insert({
            user_id: user.id,
            product_id: product.id
          });
        }

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

  return (
    <Layout showBottomNav={false}>
      <div className="relative h-screen w-full bg-black overflow-hidden">
        
        {scanMode === "barcode" ? (
          <>
            <div id="qr-reader" className="w-full h-full object-cover opacity-80" />
            
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
              <div className="relative w-72 h-72">
                <div className="absolute top-0 left-0 w-12 h-12 border-l-4 border-t-4 border-primary rounded-tl-3xl shadow-[0_0_15px_rgba(57,168,102,0.8)]" />
                <div className="absolute top-0 right-0 w-12 h-12 border-r-4 border-t-4 border-primary rounded-tr-3xl shadow-[0_0_15px_rgba(57,168,102,0.8)]" />
                <div className="absolute bottom-0 left-0 w-12 h-12 border-l-4 border-b-4 border-primary rounded-bl-3xl shadow-[0_0_15px_rgba(57,168,102,0.8)]" />
                <div className="absolute bottom-0 right-0 w-12 h-12 border-r-4 border-b-4 border-primary rounded-br-3xl shadow-[0_0_15px_rgba(57,168,102,0.8)]" />
                
                {isScanning && (
                  <div className="absolute left-4 right-4 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_20px_#39a866] animate-scan-line opacity-80 z-20" />
                )}
                
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 opacity-30">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-full bg-white" />
                  <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-0.5 bg-white" />
                </div>
              </div>

              <div className="mt-12 text-center space-y-2 animate-fade-in">
                <div className="inline-block px-4 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                  <p className="text-white/90 font-medium text-sm">Align barcode within frame</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-6 z-10">
            <Card className="glass-dark w-full max-w-sm animate-scale-in border-white/10">
              <CardContent className="p-8 text-center space-y-8">
                <div className="relative h-24 w-24 mx-auto">
                  <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse" />
                  <Camera className="relative h-full w-full text-primary drop-shadow-[0_0_10px_rgba(57,168,102,0.5)]" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Visual Recognition</h3>
                  <p className="text-gray-400 text-sm">Upload a photo to identify products using AI</p>
                </div>
                <Button 
                  onClick={() => fileInputRef.current?.click()} 
                  size="lg" 
                  className="w-full h-14 text-lg gap-3 bg-primary hover:bg-primary/90 shadow-glow transition-all hover:-translate-y-1"
                  disabled={isProcessing}
                >
                  {isProcessing ? <LoadingSpinner className="text-white" /> : <><Camera className="h-5 w-5" /> Take Photo</>}
                </Button>
                <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageCapture} />
              </CardContent>
            </Card>
          </div>
        )}

        <div className="absolute top-8 left-0 right-0 z-50 flex justify-center safe-area-top">
          <Tabs value={scanMode} onValueChange={(v) => setScanMode(v as "barcode" | "image")} className="w-64">
            <TabsList className="grid w-full grid-cols-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full p-1">
              <TabsTrigger value="barcode" className="rounded-full data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60 text-xs h-8">
                <ScanLine className="h-3 w-3 mr-1.5" /> Barcode
              </TabsTrigger>
              <TabsTrigger value="image" className="rounded-full data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60 text-xs h-8">
                <Camera className="h-3 w-3 mr-1.5" /> Image
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="absolute bottom-12 left-0 right-0 flex justify-center items-center gap-8 z-50 px-6">
          <Dialog open={showManualDialog} onOpenChange={setShowManualDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-12 w-12 rounded-full bg-black/20 backdrop-blur-md">
                <Keyboard className="h-6 w-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-panel">
              <DialogHeader>
                <DialogTitle>Manual Entry</DialogTitle>
                <DialogDescription>Type the barcode if scanning isn&apos;t working</DialogDescription>
              </DialogHeader>
              <Input 
                placeholder="Enter barcode..." 
                value={manualCode} 
                onChange={(e) => setManualCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManualEntry()}
                className="bg-white/50"
              />
              <Button onClick={handleManualEntry} className="w-full bg-primary">Search</Button>
            </DialogContent>
          </Dialog>

          <Button 
            onClick={() => navigate(ROUTES.HOME)}
            variant="outline" 
            size="icon" 
            className="h-16 w-16 rounded-full border-2 border-white/20 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 hover:scale-105 transition-all"
          >
            <X className="h-8 w-8" />
          </Button>

          {scanMode === "barcode" && hasFlashlight && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleFlashlight}
              className={`h-12 w-12 rounded-full bg-black/20 backdrop-blur-md ${flashlightOn ? 'text-yellow-400 bg-yellow-400/20' : 'text-white hover:bg-white/10'}`}
            >
              {flashlightOn ? <FlashlightOff className="h-6 w-6" /> : <Flashlight className="h-6 w-6" />}
            </Button>
          )}
        </div>

        {error && (
          <div className="absolute top-24 left-4 right-4 z-50">
            <Alert variant="destructive" className="glass-dark border-red-500/50 text-white">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Scanner;
