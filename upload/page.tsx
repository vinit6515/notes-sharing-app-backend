"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Upload, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function UploadPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    courseNumber: "",
    description: "",
    file: null as File | null,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, file: e.target.files![0] }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.file) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    // In a real app, this would be a fetch request to the Flask backend
    try {
      const data = new FormData()
      data.append("title", formData.title)
      data.append("subject", formData.subject)
      data.append("courseNumber", formData.courseNumber)
      data.append("description", formData.description)
      data.append("file", formData.file)
      data.append("fileSize", `${(formData.file.size / (1024 * 1024)).toFixed(1)} MB`)

      // Replace with your actual API endpoint
      const response = await fetch("http://localhost:5000/api/notes", {
        method: "POST",
        body: data,
      })

      if (!response.ok) {
        throw new Error("Failed to upload notes")
      }

      const result = await response.json()

      toast({
        title: "Success!",
        description: "Your notes have been uploaded successfully",
      })

      router.push("/notes")
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your notes. Please try again.",
        variant: "destructive",
      })
      console.error("Upload error:", error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
      </Link>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Upload Study Notes</CardTitle>
          <CardDescription>Share your notes with other students</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., Midterm Study Guide"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="e.g., Mathematics"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="courseNumber">Course Number</Label>
                  <Input
                    id="courseNumber"
                    name="courseNumber"
                    placeholder="e.g., MATH101"
                    required
                    value={formData.courseNumber}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Briefly describe what these notes cover..."
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="file">Upload File</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 mb-2">PDF, DOCX, or image files (max 10MB)</p>
                  <Input
                    id="file"
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                  />
                  <Button type="button" variant="outline" onClick={() => document.getElementById("file")?.click()}>
                    Select File
                  </Button>
                  {formData.file && <p className="mt-2 text-sm text-green-600">Selected: {formData.file.name}</p>}
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full mt-6" disabled={isUploading}>
              {isUploading ? "Uploading..." : "Upload Notes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
