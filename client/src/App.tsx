import React, { useState, useEffect, useCallback } from 'react'
import { debounce } from 'lodash'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Trash2, Search, Loader2 } from 'lucide-react'
import SEOAnalysisDialog from "./components/SEOAnalysisDialog"

interface Metadata {
  title: string
  description: string
  image: string
  favicon: string
  usedWww?: boolean
}

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

const API_URL = import.meta.env.VITE_API_URL;

const App: React.FC = () => {
    const [url, setUrl] = useState('https://example.com')
    const [metadata, setMetadata] = useState<Metadata | null>(null);
    const [insights, setInsights] = useState<Insights | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [clearingCache, setClearingCache] = useState(false);

    function calculatePerformance(insights: Insights): number {
        let score = 0;
        const maxScore = 4; // title, description, image

        // Title
        if (insights.title.isOptimal) score++;

        // Description
        if (insights.description.isOptimal) score++;

        // Image
        if (insights.image.isAvailable) score++;

        // Favicon 
        if (insights.favicon.isAvailable) score++;

        return Math.round((score / maxScore) * 100);
    }
      
    const fetchMetadata = useCallback(async (urlToFetch: string) => {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch(`${API_URL}/fetch-metadata`, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: urlToFetch }),
            })
            if (!response.ok) {
                throw new Error('Failed to fetch metadata')
            }
            const data = await response.json();
            const performanceScore = calculatePerformance(data.insights);
            data.insights.percentagePerformance = performanceScore;
            setMetadata(data.metadata);
            setInsights(data.insights);
        } catch (err) {
            console.error(`Failed to fetch metadata: ${err}`)
            setError('Failed to fetch metadata. Please try again.')
        } finally {
        setLoading(false)
        }
    }, [])

    const clearCache = async () => {
        setClearingCache(true)
        try {
        const response = await fetch(`${API_URL}/clear-cache`, {
            method: 'DELETE',
        })
        if (!response.ok) {
            throw new Error('Failed to clear cache')
        }
        // Refetch current URL after clearing cache
        await fetchMetadata(url)
        } catch (err) {
            console.error(`Failed to clear cache: ${err}`)
        setError('Failed to clear cache. Please try again.')
        } finally {
        setClearingCache(false)
        }
    }

    const debouncedFetchMetadata = useCallback(
        debounce((url: string) => fetchMetadata(url), 300),
        [fetchMetadata]
    )

    useEffect(() => {
        fetchMetadata(url)
    }, [url])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        fetchMetadata(url)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUrl(e.target.value)
        debouncedFetchMetadata(e.target.value)
    }

    const handleClear = () => {
        setUrl('')
        setMetadata(null)
        setError(null)
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <Card className="bg-white shadow-xl rounded-lg overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                        <div className="flex flex-col sm:flex-row items-start gap-2 justify-between">
                            <div className="flex flex-col">
                                <CardTitle className="text-2xl font-bold">Website Metadata Fetcher</CardTitle>
                                <CardDescription className="text-blue-100">Analyze your website's SEO performance</CardDescription>
                            </div>
                            {metadata && 
                            <div>
                                <SEOAnalysisDialog insights={insights} />
                            </div>}
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Input
                                    id="url"
                                    name="url"
                                    type="url"
                                    required
                                    className="flex-grow"
                                    placeholder="Enter website URL"
                                    value={url}
                                    onChange={handleInputChange}
                                />
                                <Button type="submit" disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                                    {loading ? 'Fetching...' : 'Fetch'}
                                </Button>
                            </div>
                            <div className="flex justify-between">
                                <Button type="button" onClick={handleClear} variant="outline">
                                    Clear
                                </Button>
                                <Button
                                    type="button"
                                    onClick={clearCache}
                                    variant="outline"
                                    disabled={clearingCache}
                                    title="Clear server cache"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Clear Cache
                                </Button>
                            </div>
                        </form>
                        
                        {error && (
                            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                                {error}
                            </div>
                        )}
                        
                        {metadata && (
                            <Card className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
                                <CardContent className="p-4">
                                    <div className="flex items-center mb-4">
                                        {metadata.favicon && (
                                            <img src={metadata.favicon || "/placeholder.svg"} alt="Favicon" className="w-6 h-6 mr-2" />
                                        )}
                                        <h2 className="text-xl font-semibold truncate">{metadata.title}</h2>
                                    </div>
                                    <p className="text-gray-600 mb-4">{metadata.description}</p>
                                    {metadata.image && (
                                        <img src={metadata.image || "/placeholder.svg"} alt="Preview" className="w-full h-auto rounded-md mb-4" />
                                    )}
                                    {metadata.usedWww && (
                                        <p className="text-sm text-yellow-600 mb-2">Note: Used 'www' prefix to fetch metadata.</p>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default App

