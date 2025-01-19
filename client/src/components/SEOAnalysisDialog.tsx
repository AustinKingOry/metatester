import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";

interface SEOInsight {
    value: string;
    length: number;
    idealLength: string;
    isOptimal: boolean;
    feedback: string;
}
  
interface SEOImage {
    value?: string;
    isAvailable: boolean;
    feedback: string;
}
  
interface Insights {
    title: SEOInsight;
    description: SEOInsight;
    image: SEOImage;
}
  
interface SEOAnalysisDialogProps {
    insights: Insights | null;
}
const SEOAnalysisDialog: React.FC<SEOAnalysisDialogProps> = ({ insights }) => {
    if (!insights) {
      return null; // Or provide a fallback UI if needed
    }
    return (
        <Dialog>
        {/* Trigger Button */}
        <DialogTrigger className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            View SEO Insights
        </DialogTrigger>

            {/* Dialog Content */}
            <DialogContent className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-lg w-full p-6 bg-white rounded-lg shadow-lg">
                <DialogHeader>
                <DialogTitle className="text-xl font-bold mb-4">SEO Analysis</DialogTitle>
                <DialogDescription>
                    Make changes to your profile here. Click save when you're done.
                </DialogDescription>
                </DialogHeader>

            {/* SEO Insights */}
            <div className="space-y-4">
                {/* Title Insight */}
                <div>
                <h4 className="font-semibold text-lg">Title:</h4>
                <p className="text-gray-800">{insights.title.value}</p>
                <p className="text-sm text-gray-500">
                    Length: {insights.title.length} (Ideal: {insights.title.idealLength})
                </p>
                <p className={`text-sm ${insights.title.isOptimal ? 'text-green-600' : 'text-red-600'}`}>
                    {insights.title.feedback}
                </p>
                </div>

                {/* Description Insight */}
                <div>
                <h4 className="font-semibold text-lg">Description:</h4>
                <p className="text-gray-800">{insights.description.value}</p>
                <p className="text-sm text-gray-500">
                    Length: {insights.description.length} (Ideal: {insights.description.idealLength})
                </p>
                <p
                    className={`text-sm ${
                    insights.description.isOptimal ? 'text-green-600' : 'text-red-600'
                    }`}
                >
                    {insights.description.feedback}
                </p>
                </div>

                {/* Image Insight */}
                <div>
                <h4 className="font-semibold text-lg">Image:</h4>
                <p className="text-gray-800">{insights.image.value || 'No image available'}</p>
                <p
                    className={`text-sm ${
                    insights.image.isAvailable ? 'text-green-600' : 'text-red-600'
                    }`}
                >
                    {insights.image.feedback}
                </p>
                </div>
            </div>

            </DialogContent>
        </Dialog>
    );
};

export default SEOAnalysisDialog;