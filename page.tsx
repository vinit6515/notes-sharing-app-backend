"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Upload, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [recentNotes, setRecentNotes] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Set API base URL - update this to match your Flask server
  const API_BASE_URL = 'http://localhost:5000'  // Change if your Flask runs on a different port

  useEffect(() => {
    // Fetch recent notes
    async function fetchData() {
      try {
        setLoading(true)
        
        // Fetch recent notes
        const notesResponse = await fetch(`${API_BASE_URL}/api/notes`)
        if (!notesResponse.ok) {
          throw new Error('Failed to fetch notes')
        }
        const notesData = await notesResponse.json()
        setRecentNotes(notesData.slice(0, 3)) // Get the first 3 notes
        
        // Fetch subjects
        const subjectsResponse = await fetch(`${API_BASE_URL}/api/subjects`)
        if (!subjectsResponse.ok) {
          throw new Error('Failed to fetch subjects')
        }
        const subjectsData = await subjectsResponse.json()
        setSubjects(subjectsData)
        
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault()
    // Redirect to search results page
    window.location.href = `/notes?search=${encodeURIComponent(searchQuery)}`
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <section className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-4">DJ Notes Library</h1>
        <p className="text-xl text-gray-600 mb-6">Share your notes only pleaseeeeeeeeee. No Bakchodiii okay!!!!</p>

        {/* Centered button container */}
        <div className="flex justify-center mb-6">
          <Link href="/upload">
            <Button className="px-6 py-2" type="button">
              <Upload className="mr-2 h-4 w-4" /> Upload Notes
            </Button>
          </Link>
        </div>
      </section>

      <section className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Recently Uploaded Notes</h2>
          <Link href="/notes">
            <Button variant="outline">View All</Button>
          </Link>
        </div>

        {error ? (
          <div className="text-center py-10 text-red-500">Error: {error}</div>
        ) : loading ? (
          <div className="text-center py-10">Loading recent notes...</div>
        ) : recentNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentNotes.map((note) => (
              <Card key={note._id}>
                <CardHeader>
                  <CardTitle>{note.title}</CardTitle>
                  <CardDescription>
                    {note.subject} - {note.number}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-gray-500">
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span>Uploaded by {note.uploadedBy}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <span className="text-sm text-gray-500">{formatDate(note.uploadDate)}</span>
                  <Link href={`/notes/${note._id}`}>
                    <Button variant="outline" size="sm">
                      View Notes
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">No notes available. Be the first to upload!</div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Browse by Subject</h2>
        {subjects.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {subjects.map((subject) => (
              <Link href={`/notes?subject=${encodeURIComponent(subject)}`} key={subject}>
                <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center">{subject}</div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">No subjects available.</div>
        )}
      </section>
    </main>
  )
}