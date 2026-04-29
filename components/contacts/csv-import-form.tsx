"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Papa from "papaparse"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Step = "upload" | "mapping" | "preview" | "importing" | "complete"

const CONTACT_FIELDS = [
  { value: "first_name", label: "First Name", required: true },
  { value: "last_name", label: "Last Name" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "company", label: "Company" },
  { value: "address", label: "Address" },
  { value: "city", label: "City" },
  { value: "state", label: "State" },
  { value: "zip_code", label: "ZIP Code" },
  { value: "segment", label: "Segment" },
  { value: "notes", label: "Notes" },
  { value: "skip", label: "Skip this column" },
]

export function CsvImportForm() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("upload")
  const [csvData, setCsvData] = useState<string[][]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [skipDuplicates, setSkipDuplicates] = useState(true)
  const [importProgress, setImportProgress] = useState(0)
  const [importResult, setImportResult] = useState<{
    imported: number
    skipped: number
    errors: number
  }>({ imported: 0, skipped: 0, errors: 0 })
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0]
    if (!uploadedFile) return

    setError(null)

    Papa.parse(uploadedFile, {
      complete: (results) => {
        const data = results.data as string[][]
        if (data.length < 2) {
          setError("CSV file must have at least a header row and one data row")
          return
        }

        const headerRow = data[0]
        setHeaders(headerRow)
        setCsvData(data.slice(1).filter((row) => row.some((cell) => cell.trim())))

        const autoMapping: Record<string, string> = {}
        headerRow.forEach((header, index) => {
          const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, "_")
          const matchedField = CONTACT_FIELDS.find(
            (f) =>
              f.value === normalizedHeader ||
              normalizedHeader.includes(f.value.replace("_", "")) ||
              f.label.toLowerCase().replace(/[^a-z0-9]/g, "_") === normalizedHeader,
          )
          if (matchedField && matchedField.value !== "skip") {
            autoMapping[index.toString()] = matchedField.value
          }
        })
        setMapping(autoMapping)
        setStep("mapping")
      },
      error: () => {
        setError("Failed to parse CSV file")
      },
    })
  }, [])

  const handleMappingChange = (columnIndex: string, fieldValue: string) => {
    setMapping((prev) => ({ ...prev, [columnIndex]: fieldValue }))
  }

  const getMappedData = () => {
    return csvData
      .map((row) => {
        const contact: Record<string, string> = {}
        Object.entries(mapping).forEach(([colIndex, field]) => {
          if (field !== "skip" && row[parseInt(colIndex)]) {
            contact[field] = row[parseInt(colIndex)].trim()
          }
        })
        return contact
      })
      .filter((contact) => contact.first_name)
  }

  const handleImport = async () => {
    setStep("importing")
    setImportProgress(0)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError("You must be logged in to import contacts")
      setStep("preview")
      return
    }

    const contactsToImport = getMappedData()
    let imported = 0
    let skipped = 0
    let errors = 0

    let existingEmails: Set<string> = new Set()
    if (skipDuplicates) {
      const { data: existingContacts } = await supabase
        .from("contacts")
        .select("email")
        .eq("user_id", user.id)
        .not("email", "is", null)

      existingEmails = new Set(
        existingContacts?.map((c) => c.email?.toLowerCase()).filter(Boolean) as string[],
      )
    }

    const batchSize = 50
    for (let i = 0; i < contactsToImport.length; i += batchSize) {
      const batch = contactsToImport.slice(i, i + batchSize)

      const contactsToInsert = batch
        .filter((contact) => {
          if (skipDuplicates && contact.email && existingEmails.has(contact.email.toLowerCase())) {
            skipped++
            return false
          }
          return true
        })
        .map((contact) => ({
          ...contact,
          user_id: user.id,
          source: "csv_import",
        }))

      if (contactsToInsert.length > 0) {
        const { error: insertError, data } = await supabase
          .from("contacts")
          .insert(contactsToInsert)
          .select()

        if (insertError) {
          errors += contactsToInsert.length
        } else {
          imported += data?.length || 0
        }
      }

      setImportProgress(Math.round(((i + batch.length) / contactsToImport.length) * 100))
    }

    setImportResult({ imported, skipped, errors })
    setStep("complete")
  }

  const finish = () => {
    router.push("/dashboard/contacts")
    router.refresh()
  }

  const mappedData = step === "preview" || step === "importing" ? getMappedData() : []

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/contacts">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6" />
            Import Contacts from CSV
          </h1>
          <p className="text-muted-foreground">
            {step === "upload" && "Upload a CSV file containing your contacts"}
            {step === "mapping" && "Map your CSV columns to contact fields"}
            {step === "preview" && "Review your import before proceeding"}
            {step === "importing" && "Importing your contacts..."}
            {step === "complete" && "Import complete!"}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-2 pb-6">
            {["upload", "mapping", "preview", "complete"].map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step === s || (step === "importing" && s === "preview")
                      ? "bg-primary text-primary-foreground"
                      : ["upload", "mapping", "preview", "importing", "complete"].indexOf(step) > i
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </div>
                {i < 3 && <div className="w-12 h-0.5 bg-muted mx-1" />}
              </div>
            ))}
          </div>

          {step === "upload" && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-1">Click to upload or drag and drop</p>
                  <p className="text-sm text-muted-foreground">CSV files only</p>
                </label>
              </div>
              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
            </div>
          )}

          {step === "mapping" && (
            <div className="space-y-4">
              <div className="grid gap-4 max-h-[400px] overflow-y-auto pr-2">
                {headers.map((header, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-1/3">
                      <Label className="text-sm font-medium">
                        {header || `Column ${index + 1}`}
                      </Label>
                      <p className="text-xs text-muted-foreground truncate">
                        {csvData[0]?.[index] || "No preview"}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1">
                      <Select
                        value={mapping[index.toString()] || "skip"}
                        onValueChange={(value) => handleMappingChange(index.toString(), value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          {CONTACT_FIELDS.map((field) => (
                            <SelectItem key={field.value} value={field.value}>
                              {field.label} {field.required && "*"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-4 border-t">
                <Checkbox
                  id="skip-duplicates"
                  checked={skipDuplicates}
                  onCheckedChange={(checked) => setSkipDuplicates(checked === true)}
                />
                <Label htmlFor="skip-duplicates" className="text-sm">
                  Skip contacts with duplicate email addresses
                </Label>
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep("upload")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={() => setStep("preview")}
                  disabled={!Object.values(mapping).includes("first_name")}
                >
                  Preview Import
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="font-medium">{mappedData.length} contacts ready to import</p>
                <p className="text-sm text-muted-foreground">
                  From {csvData.length} rows in the CSV file
                </p>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[300px] overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr>
                        <th className="text-left p-2 font-medium">Name</th>
                        <th className="text-left p-2 font-medium">Email</th>
                        <th className="text-left p-2 font-medium">Phone</th>
                        <th className="text-left p-2 font-medium">Company</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mappedData.slice(0, 10).map((contact, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">
                            {contact.first_name} {contact.last_name}
                          </td>
                          <td className="p-2 text-muted-foreground">{contact.email || "-"}</td>
                          <td className="p-2 text-muted-foreground">{contact.phone || "-"}</td>
                          <td className="p-2 text-muted-foreground">{contact.company || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {mappedData.length > 10 && (
                  <div className="p-2 text-center text-sm text-muted-foreground bg-muted/30 border-t">
                    And {mappedData.length - 10} more contacts...
                  </div>
                )}
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep("mapping")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleImport}>Import {mappedData.length} Contacts</Button>
              </div>
            </div>
          )}

          {step === "importing" && (
            <div className="space-y-4 py-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
                <p className="font-medium">Importing contacts...</p>
                <p className="text-sm text-muted-foreground">{importProgress}% complete</p>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
            </div>
          )}

          {step === "complete" && (
            <div className="space-y-4 py-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <p className="font-medium text-lg">Import Complete!</p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-green-500">{importResult.imported}</p>
                  <p className="text-sm text-muted-foreground">Imported</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-yellow-500">{importResult.skipped}</p>
                  <p className="text-sm text-muted-foreground">Skipped</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-red-500">{importResult.errors}</p>
                  <p className="text-sm text-muted-foreground">Errors</p>
                </div>
              </div>
              <div className="flex justify-center pt-4">
                <Button onClick={finish}>View Contacts</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
