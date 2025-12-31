import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Download, Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { format } from "date-fns";

interface PatientImportExportProps {
  createdBy: string;
  onImportComplete: () => void;
}

interface ImportedPatient {
  full_name: string;
  father_name?: string;
  email?: string;
  phone: string;
  cnic?: string;
  date_of_birth: string;
  gender: "male" | "female" | "other";
  blood_group?: string;
  address?: string;
  city?: string;
  allergies?: string;
  major_diseases?: string;
  marital_status?: string;
}

const PatientImportExport = ({ createdBy, onImportComplete }: PatientImportExportProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importData, setImportData] = useState<ImportedPatient[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);

  const sampleData = [
    {
      full_name: "John Doe",
      father_name: "Richard Doe",
      email: "john.doe@example.com",
      phone: "03001234567",
      cnic: "35201-1234567-1",
      date_of_birth: "1990-05-15",
      gender: "male",
      blood_group: "O+",
      address: "123 Main Street",
      city: "Lahore",
      allergies: "Penicillin",
      major_diseases: "Diabetes",
      marital_status: "Married",
    },
    {
      full_name: "Jane Smith",
      father_name: "William Smith",
      email: "jane.smith@example.com",
      phone: "03009876543",
      cnic: "35202-7654321-2",
      date_of_birth: "1985-08-22",
      gender: "female",
      blood_group: "A+",
      address: "456 Oak Avenue",
      city: "Karachi",
      allergies: "",
      major_diseases: "",
      marital_status: "Single",
    },
  ];

  const downloadSampleExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Patients");

    // Set column widths
    worksheet["!cols"] = [
      { wch: 20 }, // full_name
      { wch: 20 }, // father_name
      { wch: 25 }, // email
      { wch: 15 }, // phone
      { wch: 18 }, // cnic
      { wch: 15 }, // date_of_birth
      { wch: 10 }, // gender
      { wch: 12 }, // blood_group
      { wch: 30 }, // address
      { wch: 15 }, // city
      { wch: 20 }, // allergies
      { wch: 20 }, // major_diseases
      { wch: 15 }, // marital_status
    ];

    XLSX.writeFile(workbook, "patient_import_sample.xlsx");
    
    toast({
      title: "Sample Downloaded",
      description: "Fill in the Excel file with your patient data and upload it back.",
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        const errors: string[] = [];
        const validPatients: ImportedPatient[] = [];

        jsonData.forEach((row, index) => {
          const rowNum = index + 2; // Excel row (1-indexed + header)
          
          // Validate required fields
          if (!row.full_name || String(row.full_name).trim() === "") {
            errors.push(`Row ${rowNum}: Full name is required`);
            return;
          }
          if (!row.phone || String(row.phone).trim() === "") {
            errors.push(`Row ${rowNum}: Phone is required`);
            return;
          }
          if (!row.date_of_birth) {
            errors.push(`Row ${rowNum}: Date of birth is required`);
            return;
          }
          if (!row.gender || !["male", "female", "other"].includes(String(row.gender).toLowerCase())) {
            errors.push(`Row ${rowNum}: Gender must be male, female, or other`);
            return;
          }

          // Parse date
          let dob = row.date_of_birth;
          if (typeof dob === "number") {
            // Excel date number
            const excelDate = XLSX.SSF.parse_date_code(dob);
            dob = `${excelDate.y}-${String(excelDate.m).padStart(2, "0")}-${String(excelDate.d).padStart(2, "0")}`;
          } else if (typeof dob === "string") {
            // Try to parse various date formats
            const dateMatch = dob.match(/(\d{4})-(\d{2})-(\d{2})/);
            if (!dateMatch) {
              const altMatch = dob.match(/(\d{2})\/(\d{2})\/(\d{4})/);
              if (altMatch) {
                dob = `${altMatch[3]}-${altMatch[1]}-${altMatch[2]}`;
              } else {
                errors.push(`Row ${rowNum}: Invalid date format. Use YYYY-MM-DD`);
                return;
              }
            }
          }

          validPatients.push({
            full_name: String(row.full_name).trim(),
            father_name: row.father_name ? String(row.father_name).trim() : undefined,
            email: row.email ? String(row.email).trim() : undefined,
            phone: String(row.phone).replace(/\D/g, ""),
            cnic: row.cnic ? String(row.cnic).trim() : undefined,
            date_of_birth: dob,
            gender: String(row.gender).toLowerCase() as "male" | "female" | "other",
            blood_group: row.blood_group ? String(row.blood_group).trim() : undefined,
            address: row.address ? String(row.address).trim() : undefined,
            city: row.city ? String(row.city).trim() : undefined,
            allergies: row.allergies ? String(row.allergies).trim() : undefined,
            major_diseases: row.major_diseases ? String(row.major_diseases).trim() : undefined,
            marital_status: row.marital_status ? String(row.marital_status).trim() : undefined,
          });
        });

        setImportData(validPatients);
        setImportErrors(errors);
        setImportDialogOpen(true);
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        toast({
          title: "Error",
          description: "Failed to parse Excel file. Please check the format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsArrayBuffer(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const generatePatientId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6);
    return `P-${timestamp}${random}`.toUpperCase();
  };

  const handleImport = async () => {
    if (importData.length === 0) {
      toast({
        title: "No Data",
        description: "No valid patients to import.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);

    try {
      const patientsToInsert = importData.map((patient) => ({
        patient_id: generatePatientId(),
        full_name: patient.full_name,
        father_name: patient.father_name || null,
        email: patient.email || null,
        phone: patient.phone,
        cnic: patient.cnic || null,
        date_of_birth: patient.date_of_birth,
        gender: patient.gender,
        blood_group: patient.blood_group || null,
        address: patient.address || null,
        city: patient.city || null,
        allergies: patient.allergies || null,
        major_diseases: patient.major_diseases || null,
        marital_status: patient.marital_status || null,
        created_by: createdBy,
      }));

      const { error } = await supabase
        .from("patients")
        .insert(patientsToInsert);

      if (error) {
        throw error;
      }

      toast({
        title: "Import Successful",
        description: `Successfully imported ${importData.length} patients.`,
      });

      setImportDialogOpen(false);
      setImportData([]);
      setImportErrors([]);
      onImportComplete();
    } catch (error: any) {
      console.error("Error importing patients:", error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import patients.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".xlsx,.xls"
        className="hidden"
      />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Import/Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={downloadSampleExcel}>
            <Download className="h-4 w-4 mr-2" />
            Download Sample Excel
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Import from Excel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Patients</DialogTitle>
            <DialogDescription>
              Review the data before importing
            </DialogDescription>
          </DialogHeader>

          {importErrors.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-destructive mb-2">
                Validation Errors ({importErrors.length})
              </h4>
              <ul className="text-sm text-destructive space-y-1 max-h-32 overflow-y-auto">
                {importErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {importData.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">
                Valid Patients to Import ({importData.length})
              </h4>
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-muted">
                    <tr>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Phone</th>
                      <th className="text-left p-2">Gender</th>
                      <th className="text-left p-2">DOB</th>
                      <th className="text-left p-2">City</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importData.map((patient, index) => (
                      <tr key={index} className="border-t border-border">
                        <td className="p-2">{patient.full_name}</td>
                        <td className="p-2">{patient.phone}</td>
                        <td className="p-2 capitalize">{patient.gender}</td>
                        <td className="p-2">{patient.date_of_birth}</td>
                        <td className="p-2">{patient.city || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={isImporting || importData.length === 0}
            >
              {isImporting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Import {importData.length} Patients
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PatientImportExport;
