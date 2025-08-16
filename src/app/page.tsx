"use client"
import { useLiveQuery } from "@tanstack/react-db"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { projectCollection } from "@/lib/collection"

export default function ProjectsPage() {
  const router = useRouter()
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDescription, setNewProjectDescription] = useState("")
  const { data: projects } = useLiveQuery((q) => q.from({ projectCollection }))

  const createProject = () => {
    if (newProjectName.trim()) {
      projectCollection.insert({
        id: Math.floor(Math.random() * 100000),
        name: newProjectName.trim(),
        description: newProjectDescription.trim() || null,
        shared_user_ids: null,
        created_at: new Date()
      })
      setNewProjectName("")
      setNewProjectDescription("")
    }
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="mb-2 font-bold text-3xl">Projects</h1>
          <p className="text-muted-foreground">Manage your todo projects</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New Project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createProject()}
            />
            <Input
              placeholder="Project description (optional)"
              value={newProjectDescription}
              onChange={(e) => setNewProjectDescription(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createProject()}
            />
            <Button onClick={createProject} disabled={!newProjectName.trim()}>
              Create Project
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {projects?.map((project) => (
            <Card
              key={project.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
            >
              <CardContent
                className="p-6"
                onClick={() => router.push(`/project/${project.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="mb-2 font-semibold text-xl">
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="text-muted-foreground">
                        {project.description}
                      </p>
                    )}
                    <p className="mt-2 text-muted-foreground text-sm">
                      Created {project.created_at.toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Open
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {(!projects || projects.length === 0) && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              No projects yet. Create your first project above!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
