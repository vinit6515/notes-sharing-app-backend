"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, BookOpen, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Note {
  _id: string
  title: string
  subject: string
  number: string
  uploadedBy: string
  uploadDate: string
  fileName: string
  fileSize: string
  downloadCount: number
}

export default function NotesListingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("")
  const [notes, setNotes] = useState<Note[]>([])
  const [subjects, setSubjects] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchNotes = async () => {
      setIsLoading(true)
      try {
        // Fetch notes from the Flask backend
        const response = await fetch(
          `http://localhost:5000/api/notes?search=${searchQuery}${subjectFilter ? `&subject=${subjectFilter}` : ""}`,
        )
        if (!response.ok) {
          throw new Error("Failed to fetch notes")
        }
        const data = await response.json()
        setNotes(data)
      } catch (error) {
        console.error("Error fetching notes:", error)
        // Fallback to mock data if API fails
    
      } finally {
        setIsLoading(false)
      }
    }

    const fetchSubjects = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/subjects")
        if (response.ok) {
          const data = await response.json()
          setSubjects(data)
        }
      } catch (error) {
        console.error("Error fetching subjects:", error)
        // Fallback subjects
       
      }
    }

    fetchNotes()
    fetchSubjects()
  }, [searchQuery, subjectFilter])

  // Format date from ISO string to readable format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString()
    } catch (e) {
      return dateString
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">All Notes</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search notes..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p>Loading notes...</p>
        </div>
      ) : notes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
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
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No notes found</h3>
          <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
          <Link href="/upload">
            <Button>Upload New Notes</Button>
          </Link>
        </div>
      )}
    </main>
  )
}
