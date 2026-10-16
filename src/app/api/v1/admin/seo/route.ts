import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BANGLADESH_DISTRICTS } from "@/lib/data/districts";

export async function GET(req: NextRequest) {
  try {
    const settings = await prisma.systemSetting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s: any) => {
      settingsMap[s.key] = s.value;
    });

    const defaults = {
      seo_business_name: "NEED ELECTRO",
      seo_founder_ceo: "Amdadur Rahman",
      seo_parent_organization: "AMDADS Group",
      seo_site_url: "https://www.needelectro.store",
      seo_homepage_title: "NEED ELECTRO | Laptops, Computers, CCTV & Electrical Services in Bangladesh",
      seo_homepage_desc: "Shop laptops, computers, CCTV cameras, networking devices and electrical products at NEED ELECTRO. Explore electrical installation, electrician booking, repairs and technology services across Bangladesh.",
      seo_homepage_h1: "NEED ELECTRO — Laptops, Computers, CCTV & Electrical Services in Bangladesh",
      seo_default_keywords: "laptop price in bangladesh, computer shop bangladesh, cctv camera price in bangladesh, electrician service bangladesh, need electro",
      seo_google_search_console_tag: "",
      seo_google_analytics_id: "",
      seo_robots_index: "true",
      seo_sitemap_url: "https://www.needelectro.store/sitemap.xml",
      ...settingsMap,
    };

    // Calculate real stats for admin
    const productCount = await prisma.product.count({ where: { isActive: true } });
    const serviceCount = await prisma.service.count({ where: { isActive: true } });
    const totalDistricts = BANGLADESH_DISTRICTS.length;

    return NextResponse.json({
      success: true,
      settings: defaults,
      stats: {
        productCount,
        serviceCount,
        districtCount: totalDistricts,
        totalSitemapUrls: 18 + productCount + serviceCount + totalDistricts,
      },
    });
  } catch (error: any) {
    console.error("Failed to fetch SEO settings:", error);
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

    return NextResponse.json({ success: true, message: "SEO configuration updated successfully." });
  } catch (error: any) {
    console.error("Failed to save SEO settings:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
