import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from "./ui/button";

interface SEOInsight {
    value: string;
    length: number;
    idealLength: string;
    isOptimal: boolean;
    feedback: string;
    percentagePerformance: number;
}
  
interface SEOImage {
    value?: string;
    isAvailable: boolean;
    feedback: string;
}

interface SEOFavicon {
    value?: string;
    isAvailable: boolean;
    feedback: string;
}
  
interface Insights {
    title: SEOInsight;
    description: SEOInsight;
    image: SEOImage;
    favicon: SEOFavicon;
    percentagePerformance: number;
}
  
interface SEOAnalysisDialogProps {
    insights: Insights | null;
}

const SEOAnalysisDialog: React.FC<SEOAnalysisDialogProps> = ({ insights }) => {
    if (!insights) {
      return null;
    }

    const getStatusIcon = (isOptimal: boolean) => {
        return isOptimal ? (
            <CheckCircle className="w-6 h-6 absolute -top-8 right-1 text-green-500" />
        ) : (
            <XCircle className="w-6 h-6 absolute -top-8 right-1 text-red-500" />
        );
    };

    const getStatusColor = (isOptimal: boolean) => {
        return isOptimal ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
    };
    const getProgressColor = (score: number) => {
        if (score >= 80) return "*:bg-green-500";
        if (score >= 60) return "*:bg-yellow-500";
        if (score >= 40) return "*:bg-orange-500";
        return "bg-red-500";
    };
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={"secondary"}>
                    View SEO Insights
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px] max-h-[80vh] flex flex-col pr-2">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">SEO Analysis</DialogTitle>
                    <DialogDescription>
                        Review your website's SEO performance and get insights to improve.
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-3 space-y-6 pb-6 overflow-y-scroll flex flex-col max-h-[90%] flex-1 pr-2">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-medium">Overall Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-3xl font-bold">{insights.percentagePerformance}%</span>
                                <Badge variant={insights.percentagePerformance >= 70 ? "default" : "destructive"}>
                                    {insights.percentagePerformance >= 70 ? "Good" : "Needs Improvement"}
                                </Badge>
                            </div>
                            <Progress value={insights.percentagePerformance} className={`h-2 ${getProgressColor(insights.percentagePerformance)}`} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-medium">Title</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start justify-between relative">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">
                                        Length: {insights.title.length} (Ideal: {insights.title.idealLength})
                                    </p>
                                    <p className="text-sm mb-2">{insights.title.value}</p>
                                    <Badge variant="outline" className={getStatusColor(insights.title.isOptimal)}>
                                        {insights.title.feedback}
                                    </Badge>
                                </div>
                                {getStatusIcon(insights.title.isOptimal)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-medium">Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start justify-between relative">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">
                                        Length: {insights.description.length} (Ideal: {insights.description.idealLength})
                                    </p>
                                    <p className="text-sm mb-2">{insights.description.value}</p>
                                    <Badge variant="outline" className={getStatusColor(insights.description.isOptimal)}>
                                        {insights.description.feedback}
                                    </Badge>
                                </div>
                                {getStatusIcon(insights.description.isOptimal)}
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-medium">Favicon</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start justify-between relative">
                                <div>
                                    <p className="text-sm mb-2">{insights.favicon.value || 'No favicon available'}</p>
                                    <Badge variant="outline" className={getStatusColor(insights.favicon.isAvailable)}>
                                        {insights.favicon.feedback}
                                    </Badge>
                                </div>
                                {insights.favicon.isAvailable ? (
                                    <CheckCircle className="w-6 h-6 absolute -top-8 right-1 text-green-500" />
                                ) : (
                                    <AlertCircle className="w-6 h-6 absolute -top-8 right-1 text-yellow-500" />
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-medium">Image</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start justify-between relative">
                                <div>
                                    <p className="text-sm mb-2">{insights.image.value || 'No image available'}</p>
                                    <Badge variant="outline" className={getStatusColor(insights.image.isAvailable)}>
                                        {insights.image.feedback}
                                    </Badge>
                                </div>
                                {insights.image.isAvailable ? (
                                    <CheckCircle className="w-6 h-6 absolute -top-8 right-1 text-green-500" />
                                ) : (
                                    <AlertCircle className="w-6 h-6 absolute -top-8 right-1 text-yellow-500" />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SEOAnalysisDialog;

