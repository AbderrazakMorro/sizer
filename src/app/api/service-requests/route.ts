import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/roles";

export async function GET() {
  try {
    const supabase = await createClient();
    const userId = await requireRole(supabase, "client");

    const { data, error } = await supabase
      .from("service_requests")
      .select("*")
      .eq("client_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[service-requests] fetch error", error);
      return NextResponse.json(
        { error: "Impossible de récupérer les demandes de service." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur interne du serveur.";
    const status = message.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const userId = await requireRole(supabase, "client");

    const body = await request.json().catch(() => ({}));
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const dimensions =
      typeof body.dimensions === "string" && body.dimensions.trim().length > 0
        ? body.dimensions.trim()
        : null;
    const constraints =
      typeof body.constraints === "string" && body.constraints.trim().length > 0
        ? body.constraints.trim()
        : null;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Le titre et la description sont obligatoires." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("service_requests")
      .insert([
        {
          client_id: userId,
          title,
          description,
          dimensions,
          constraints,
          status: "submitted",
          attached_files: [],
        },
      ])
      .select("*")
      .single();

    if (error) {
      console.error("[service-requests] insert error", error);
      return NextResponse.json(
        { error: "Impossible de créer la demande de service." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur interne du serveur.";
    const status = message.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
