"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Download, Calendar, User, BookOpen, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface Note {
  _id: string
  title: string
  subject: string
  number: string
  uploadedBy: string
  uploadDate: string
  description: string
  fileName: string
  fileSize: string
  downloadCount: number
}

export default function NoteDetailPage() {
  const params = useParams()
  const noteId = params.id
  const [isLoading, setIsLoading] = useState(true)
  const [note, setNote] = useState<Note | null>(null)

  useEffect(() => {
    const fetchNote = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`http://localhost:5000/api/notes/${noteId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch note")
        }
        const data = await response.json()
        setNote(data)
      } catch (error) {
        console.error("Error fetching note:", error)
        // Fallback to mock data if API fails
        setNote({
          _id: noteId as string,
          title: "Introduction to Calculus",
          subject: "Mathematics",
          number: "MATH101",
          uploadedBy: "John Doe",
          uploadDate: "2023-04-15",
          description:
            "Comprehensive notes covering limits, derivatives, and integrals. Includes practice problems and solutions.",
          fileName: "calculus_notes.pdf",
          fileSize: "2.4 MB",
          downloadCount: 42,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchNote()
  }, [noteId])

  const handleDownload = async () => {
    try {
      window.open(`http://localhost:5000/api/notes/download/${noteId}`, "_blank")
    } catch (error) {
      console.error("Error downloading file:", error)
    }
  }

  // Format date from ISO string to readable format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString()
    } catch (e) {
      return dateString
    }
  }

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <Link href="/notes" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Notes
        </Link>

        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>

          <Skeleton className="h-64 mb-6" />
          <Skeleton className="h-12 w-40" />
        </div>
      </main>
    )
  }

  if (!note) {
    return (
      <main className="container mx-auto px-4 py-8 text-center">
        <Link href="/notes" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Notes
        </Link>

        <h1 className="text-2xl font-bold mb-4">Note not found</h1>
        <p className="mb-6">The note you're looking for doesn't exist or has been removed.</p>
        <Link href="/notes">
          <Button>Browse All Notes</Button>
        </Link>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Link href="/notes" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Notes
      </Link>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">{note.title}</h1>
        <div className="flex items-center text-gray-500 mb-8">
          <BookOpen className="mr-1 h-4 w-4" />
          <span className="mr-4">
            {note.subject} - {note.number}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Uploaded by</p>
                  <p className="font-medium">{note.uploadedBy}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Upload date</p>
                  <p className="font-medium">{formatDate(note.uploadDate)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Download className="h-5 w-5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Downloads</p>
                  <p className="font-medium">{note.downloadCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {note.description && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{note.description}</p>
          </div>
        )}

        <div className="bg-gray-50 border rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <FileText className="h-10 w-10 mr-4 text-gray-500" />
            <div className="flex-grow">
              <h3 className="font-medium">{note.fileName}</h3>
              <p className="text-sm text-gray-500 mb-4">{note.fileSize}</p>
              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" /> Download Notes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
