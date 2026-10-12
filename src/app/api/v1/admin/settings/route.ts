import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const settings = await prisma.systemSetting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s: any) => {
      settingsMap[s.key] = s.value;
    });

    // Provide default fallback values if empty
    const defaults = {
      site_name: "NEED ELECTRO SHOP",
      tagline: "Trusted Electrical and Technological Solutions",
      parent_company: "AMDADS GROUP",
      currency: "BDT (৳)",
      hotline: "01733 983752",
      address: "Moulvibazar, Bangladesh",
      commission_rate: "15",
      delivery_charge_inside: "60",
      delivery_charge_outside: "120",
      emergency_service_surcharge: "200",
      maintenance_mode: "false",
      ...settingsMap,
    };

    return NextResponse.json({ success: true, settings: defaults });
  } catch (error: any) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const updates = Object.entries(body).map(async ([key, value]) => {
      return prisma.systemSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    });

    await Promise.all(updates);

    return NextResponse.json({ success: true, message: "Settings saved successfully" });
  } catch (error: any) {
    console.error("Failed to save settings:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
