import { getDataRequestById } from "@/lib/actions/student.actions";
import FormRendererClient from "./FormRendererClient";
import { notFound } from "next/navigation";

export default async function DynamicFormPage({ params }: { params: Promise<{ requestId: string }> }) {
  const { requestId } = await params;
  const request = await getDataRequestById(requestId);

  if (!request) {
    notFound();
  }

  return <FormRendererClient requestId={requestId} initialSchema={request.formSchema} title={request.title} deadline={request.deadline} />;
}
