import { Suspense } from "react";
import { getStudentsDirectory } from "@/lib/actions/admin.actions";
import StudentDirectoryClient from "./StudentDirectoryClient";
import { Loader2 } from "lucide-react";

async function DirectoryContent() {
  const students = await getStudentsDirectory();
  return <StudentDirectoryClient initialStudents={students} />;
}

function DirectoryFallback() {
  return (
    <div className="admin-shell flex items-center justify-center min-h-[50vh]">
      <div className="flex items-center gap-3 text-purple-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin text-purple-primary" />
        <span className="text-sm font-bold uppercase tracking-widest">Loading directory...</span>
      </div>
    </div>
  );
}

export default function StudentDirectoryPage() {
  return (
    <Suspense fallback={<DirectoryFallback />}>
      <DirectoryContent />
    </Suspense>
  );
}
