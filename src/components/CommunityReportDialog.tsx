import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { communityApi } from "@/api";
import { useAuth } from "@/contexts/AuthContext";

interface CommunityReportDialogProps {
  productId?: string;
  companyId?: string;
  trigger?: React.ReactNode;
}

export const CommunityReportDialog = ({
  productId,
  companyId,
  trigger,
}: CommunityReportDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reportType, setReportType] = useState<string>("incorrect_data");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to report issues.",
        variant: "destructive",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: "Description Required",
        description: "Please provide a description of the issue.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await communityApi.createReport({
        user_id: user.id,
        product_id: productId,
        company_id: companyId,
        report_type: reportType as 'incorrect_data' | 'greenwashing' | 'missing_data',
        description: description.trim(),
      });

      toast({
        title: "Report Submitted",
        description: "Thank you for helping improve our data quality.",
      });

      setOpen(false);
      setDescription("");
      setReportType("incorrect_data");
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Submission Failed",
        description: "Unable to submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Flag className="h-4 w-4 mr-2" />
            Report Issue
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Report an Issue</DialogTitle>
          <DialogDescription>
            Help us improve data accuracy by reporting issues you've found.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Issue Type</Label>
            <RadioGroup value={reportType} onValueChange={setReportType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="incorrect_data" id="incorrect" />
                <Label htmlFor="incorrect" className="font-normal cursor-pointer">
                  Incorrect Data
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="greenwashing" id="greenwashing" />
                <Label htmlFor="greenwashing" className="font-normal cursor-pointer">
                  Suspected Greenwashing
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="missing_data" id="missing" />
                <Label htmlFor="missing" className="font-normal cursor-pointer">
                  Missing Information
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Please provide details about the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Your report will be reviewed by our community moderation team. Thank you
              for helping maintain data accuracy.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!description.trim() || isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
