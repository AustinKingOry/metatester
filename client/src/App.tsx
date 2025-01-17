import React, { useState, useEffect, useCallback } from 'react'
import { debounce } from 'lodash'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2 } from 'lucide-react'

interface Metadata {
  title: string
  description: string
  image: string
  favicon: string
  usedWww?: boolean
}

const API_URL = import.meta.env.VITE_API_URL;

const App: React.FC = () => {
  const [url, setUrl] = useState('https://example.com')
  const [metadata, setMetadata] = useState<Metadata | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clearingCache, setClearingCache] = useState(false)

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
      setMetadata(data)
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
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <Card className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Website Metadata Fetcher</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="rounded-md shadow-sm -space-y-px">
                <Input
                  id="url"
                  name="url"
                  type="url"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Enter website URL"
                  value={url}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={loading}
                >
                  {loading ? 'Fetching...' : 'Fetch Metadata'}
                </Button>
                <Button
                  type="button"
                  onClick={handleClear}
                  className="ml-3 group relative w-1/3 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Clear
                </Button>
                <Button
                  type="button"
                  onClick={clearCache}
                  variant="outline"
                  disabled={clearingCache}
                  title="Clear server cache"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </form>
            {error && (
              <div className="mt-4 text-red-600">{error}</div>
            )}
            {metadata && (
              <Card className="mt-8 border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                <CardContent>
                  <div className="flex items-center">
                    {metadata.favicon && (
                      <img src={metadata.favicon || "/placeholder.svg"} alt="Favicon" className="w-6 h-6 mr-2" />
                    )}
                    <h2 className="text-xl font-semibold">{metadata.title}</h2>
                  </div>
                  <p className="mt-2 text-gray-600">{metadata.description}</p>
                  {metadata.image && (
                    <img src={metadata.image || "/placeholder.svg"} alt="Preview" className="mt-4 rounded-md max-w-full h-auto" />
                  )}
                  <p className="mt-2 text-sm text-yellow-600">Note: If you are testing a site, try using the <code className="text-blue-600">www</code> prefix.</p>
                  {metadata.usedWww && (
                    <p className="mt-2 text-sm text-yellow-600">Note: Used 'www' to fetch metadata.</p>
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

