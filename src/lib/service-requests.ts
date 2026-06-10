import type { ServiceRequest, ServiceRequestStatus } from "@/types";

export interface CreateServiceRequestInput {
  title: string;
  description: string;
  dimensions?: string | null;
  constraints?: string | null;
}

export async function createServiceRequest(
  supabase: any,
  input: CreateServiceRequestInput
): Promise<ServiceRequest> {
  const { data, error } = await supabase
    .from("service_requests")
    .insert([
      {
        title: input.title,
        description: input.description,
        dimensions: input.dimensions,
        constraints: input.constraints,
        status: "submitted" as ServiceRequestStatus,
        attached_files: [],
      },
    ])
    .select("*")
    .single();

  if (error || !data) {
    throw error ?? new Error("Unable to create service request.");
  }

  return data as ServiceRequest;
}

export async function getServiceRequestsForClient(
  supabase: any
): Promise<ServiceRequest[]> {
  const { data, error } = await supabase
    .from("service_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []) as ServiceRequest[];
}
