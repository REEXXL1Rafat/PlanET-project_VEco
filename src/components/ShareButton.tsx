import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
}

export const ShareButton = ({ title, text, url }: ShareButtonProps) => {
  const handleShare = async () => {
    const shareData = {
      title,
      text,
      url: url || window.location.href,
    };

    // Check if Web Share API is available
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Shared successfully!",
          description: "Thanks for spreading awareness about sustainability.",
        });
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
          fallbackShare(shareData);
        }
      }
    } else {
      fallbackShare(shareData);
    }
  };

  const fallbackShare = (data: { title: string; text: string; url: string }) => {
    // Fallback: Copy to clipboard
    const shareText = `${data.title}\n${data.text}\n${data.url}`;
    navigator.clipboard.writeText(shareText).then(() => {
      toast({
        title: "Link copied!",
        description: "Share link has been copied to your clipboard.",
      });
    }).catch(() => {
      toast({
        title: "Share unavailable",
        description: "Sharing is not supported on this device.",
        variant: "destructive",
      });
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className="gap-2"
    >
      <Share2 className="h-4 w-4" />
      Share
    </Button>
  );
};
