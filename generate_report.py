#!/usr/bin/env python3
"""Generate a technical report PDF for the CORE project."""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.lib.colors import HexColor
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.lib import colors
import os
import datetime

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "CORE_Technical_Report.pdf")

PRIMARY = HexColor("#1E3A5F")
ACCENT = HexColor("#2563EB")
LIGHT_BG = HexColor("#F0F4FA")
DARK_TEXT = HexColor("#1A1A2E")
MUTED = HexColor("#6B7280")


def build_styles():
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        name="CoverTitle",
        fontName="Helvetica-Bold",
        fontSize=32,
        leading=40,
        alignment=TA_CENTER,
        textColor=PRIMARY,
        spaceAfter=12,
    ))
    styles.add(ParagraphStyle(
        name="CoverSubtitle",
        fontName="Helvetica",
        fontSize=16,
        leading=22,
        alignment=TA_CENTER,
        textColor=ACCENT,
        spaceAfter=8,
    ))
    styles.add(ParagraphStyle(
        name="CoverMeta",
        fontName="Helvetica",
        fontSize=11,
        leading=16,
        alignment=TA_CENTER,
        textColor=MUTED,
        spaceAfter=4,
    ))
    styles.add(ParagraphStyle(
        name="SectionTitle",
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=24,
        textColor=PRIMARY,
        spaceBefore=24,
        spaceAfter=10,
    ))
    styles.add(ParagraphStyle(
        name="SubsectionTitle",
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=18,
        textColor=ACCENT,
        spaceBefore=14,
        spaceAfter=6,
    ))
    styles.add(ParagraphStyle(
        name="BodyText2",
        fontName="Helvetica",
        fontSize=10.5,
        leading=15,
        textColor=DARK_TEXT,
        alignment=TA_JUSTIFY,
        spaceAfter=8,
    ))
    styles.add(ParagraphStyle(
        name="BulletItem",
        fontName="Helvetica",
        fontSize=10.5,
        leading=15,
        textColor=DARK_TEXT,
        leftIndent=20,
        spaceAfter=4,
        bulletIndent=8,
    ))
    styles.add(ParagraphStyle(
        name="FooterStyle",
        fontName="Helvetica",
        fontSize=8,
        textColor=MUTED,
        alignment=TA_CENTER,
    ))
    return styles


def add_header_footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(ACCENT)
    canvas.setLineWidth(0.5)
    canvas.line(40, A4[1] - 40, A4[0] - 40, A4[1] - 40)
    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(MUTED)
    canvas.drawString(40, A4[1] - 35, "CORE — Brand Mention Tracking Platform")
    canvas.drawRightString(A4[0] - 40, A4[1] - 35, "Technical Report")

    canvas.line(40, 35, A4[0] - 40, 35)
    canvas.drawCentredString(A4[0] / 2, 22, f"Page {doc.page}")
    canvas.restoreState()


def build_cover(styles):
    elements = []
    elements.append(Spacer(1, 2.5 * inch))
    elements.append(Paragraph("CORE", styles["CoverTitle"]))
    elements.append(Paragraph("Brand Mention Tracking Platform", styles["CoverSubtitle"]))
    elements.append(Spacer(1, 0.3 * inch))
    elements.append(HRFlowable(width="40%", thickness=2, color=ACCENT, spaceAfter=20, spaceBefore=10))
    elements.append(Paragraph("Technical Report", styles["CoverMeta"]))
    elements.append(Paragraph(f"February 2026", styles["CoverMeta"]))
    elements.append(Spacer(1, 1.0 * inch))
    elements.append(Paragraph("Google Hackathon Project", styles["CoverMeta"]))
    elements.append(Spacer(1, 0.2 * inch))
    elements.append(Paragraph("Built with React · Vite · Tailwind CSS · Multi-LLM APIs · Python", styles["CoverMeta"]))
    elements.append(PageBreak())
    return elements


def build_toc(styles):
    elements = []
    elements.append(Paragraph("Table of Contents", styles["SectionTitle"]))
    elements.append(Spacer(1, 0.15 * inch))
    sections = [
        "1. Executive Summary",
        "2. Project Objective",
        "3. System Architecture",
        "4. Technology Stack",
        "5. AI / LLM Integrations",
        "6. Key Features",
        "7. Data Layer & Storage",
        "8. Python Backend Services",
        "9. Demo Blog SaaS Module",
        "10. Future Vision",
    ]
    for s in sections:
        elements.append(Paragraph(s, styles["BodyText2"]))
    elements.append(PageBreak())
    return elements


def make_table(data, col_widths=None):
    t = Table(data, colWidths=col_widths, hAlign="LEFT")
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9.5),
        ("LEADING", (0, 0), (-1, -1), 13),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
        ("TOPPADDING", (0, 0), (-1, 0), 8),
        ("BACKGROUND", (0, 1), (-1, -1), LIGHT_BG),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [LIGHT_BG, colors.white]),
        ("GRID", (0, 0), (-1, -1), 0.4, HexColor("#CBD5E1")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 1), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 1), (-1, -1), 5),
    ]))
    return t


def bullet(text, styles):
    return Paragraph(f"• {text}", styles["BulletItem"])


def build_report(styles):
    e = []

    # 1. Executive Summary
    e.append(Paragraph("1. Executive Summary", styles["SectionTitle"]))
    e.append(Paragraph(
        "CORE (Content Optimization & Ranking Engine) is a web-based platform designed to help businesses "
        "monitor, analyze, and improve how their brand is mentioned across major AI language models. "
        "As AI-powered search engines and conversational assistants (ChatGPT, Gemini, Claude, etc.) "
        "increasingly influence consumer decisions, brand visibility in these systems has become a critical "
        "marketing frontier. CORE provides a unified dashboard to track brand mentions, perform sentiment "
        "analysis, benchmark against competitors, and generate optimized content — all driven by multi-LLM "
        "intelligence.",
        styles["BodyText2"]
    ))
    e.append(Paragraph(
        "This report details the system architecture, technology stack, AI integrations, key features, "
        "and future roadmap of the CORE platform, developed as part of the Google Hackathon 2026.",
        styles["BodyText2"]
    ))

    # 2. Project Objective
    e.append(Paragraph("2. Project Objective", styles["SectionTitle"]))
    e.append(Paragraph(
        "The primary objective of CORE is to provide businesses with actionable intelligence on how their "
        "brand is represented by AI language models. Specifically, the platform aims to:",
        styles["BodyText2"]
    ))
    objectives = [
        "<b>Monitor brand mentions</b> across multiple LLMs (ChatGPT, Gemini, Claude, Mistral, DeepSeek) in real time.",
        "<b>Analyze sentiment</b> and ranking position of the brand within AI-generated responses.",
        "<b>Benchmark against competitors</b> to identify visibility gaps and opportunities.",
        "<b>Support geographic intelligence (GEO)</b> — tracking brand perception across countries and languages.",
        "<b>Automate monitoring</b> via scheduled scans (daily, weekly, custom intervals).",
        "<b>Generate optimized content</b> through an AI Article Engine that mass-produces SEO/GEO-optimized blog posts.",
        "<b>Publish content</b> to external endpoints to improve brand presence in AI-powered web search.",
    ]
    for o in objectives:
        e.append(bullet(o, styles))

    # 3. System Architecture
    e.append(Paragraph("3. System Architecture", styles["SectionTitle"]))
    e.append(Paragraph(
        "CORE follows a client-side single-page application (SPA) architecture with Python microservices "
        "for advanced backend tasks. The system is composed of three main layers:",
        styles["BodyText2"]
    ))
    e.append(Paragraph("3.1 Frontend (React SPA)", styles["SubsectionTitle"]))
    e.append(Paragraph(
        "The entire user interface is built as a React SPA powered by Vite. The application uses React Router "
        "for client-side routing and Tailwind CSS for styling. Key pages include the landing page, onboarding "
        "wizard, user dashboard (brand management, query management, analysis execution, AI Article Engine, and "
        "results visualization), and a demo mode for quick evaluation.",
        styles["BodyText2"]
    ))
    e.append(Paragraph("3.2 Service Layer", styles["SubsectionTitle"]))
    e.append(Paragraph(
        "Two primary service modules handle the business logic: <b>llmService.js</b> manages all API interactions "
        "with LLM providers (handling both OpenAI-compatible and Google Gemini API formats, parallel query execution, "
        "and rate limiting), while <b>analysisService.js</b> orchestrates brand analysis workflows including mention "
        "detection, sentiment scoring, rank extraction, and URL discovery.",
        styles["BodyText2"]
    ))
    e.append(Paragraph("3.3 Python Backend Services", styles["SubsectionTitle"]))
    e.append(Paragraph(
        "Python scripts provide supplementary capabilities: <b>get_context.py</b> uses Selenium and GPT-4o-mini to "
        "scrape and summarize company websites, while <b>get_trendy_keywords.py</b> leverages the Google Trends API "
        "(pytrends) to discover trending keywords relevant to the brand's industry.",
        styles["BodyText2"]
    ))

    # 4. Technology Stack
    e.append(Paragraph("4. Technology Stack", styles["SectionTitle"]))

    stack_data = [
        ["Layer", "Technology", "Version / Details"],
        ["Frontend Framework", "React", "18.3.1"],
        ["Build Tool", "Vite", "5.4.0"],
        ["Styling", "Tailwind CSS", "3.4.10"],
        ["Routing", "React Router DOM", "6.26.1"],
        ["PDF Export", "jsPDF + html2canvas", "3.0.3 / 1.4.1"],
        ["CSS Processing", "PostCSS + Autoprefixer", "8.4.45 / 10.4.19"],
        ["Language", "JavaScript (ES2022+)", "—"],
        ["Python Runtime", "Python", "3.11+"],
        ["Web Scraping", "Selenium", "4.41.0"],
        ["AI Client", "OpenAI Python SDK", "2.21.0+"],
        ["Trends Analysis", "pytrends", "4.9.2+"],
        ["Demo Server", "Node.js HTTP (native)", "—"],
    ]
    e.append(make_table(stack_data, col_widths=[2.0 * inch, 2.2 * inch, 2.0 * inch]))
    e.append(Spacer(1, 0.15 * inch))

    e.append(Paragraph("4.1 Environment & Configuration", styles["SubsectionTitle"]))
    e.append(Paragraph(
        "Configuration is managed through environment variables (dotenv). The <b>.env</b> file stores API keys for "
        "each LLM provider (DeepSeek, OpenAI GPT, Google Gemini, Mistral) as well as endpoints for the Python "
        "microservices and the demo blog upload API. Vite exposes these to the frontend via the <b>VITE_</b> prefix.",
        styles["BodyText2"]
    ))

    # 5. AI / LLM Integrations
    e.append(Paragraph("5. AI / LLM Integrations", styles["SectionTitle"]))
    e.append(Paragraph(
        "CORE's core differentiator is its multi-LLM querying engine. The platform integrates with five major "
        "AI providers to deliver comprehensive brand visibility analysis:",
        styles["BodyText2"]
    ))

    llm_data = [
        ["Provider", "Model(s)", "API Format", "Use Cases"],
        ["DeepSeek", "deepseek-chat", "OpenAI-compatible", "Question generation, competitor\nanalysis, article generation"],
        ["OpenAI", "GPT-4o, GPT-4o-mini", "OpenAI native", "Brand analysis, article generation,\ncompany context extraction"],
        ["Google Gemini", "2.5 Flash Lite, 2.5 Pro", "Google REST API", "Brand mention tracking,\nsentiment analysis"],
        ["Anthropic", "Claude 3.5 Sonnet", "Anthropic Messages", "Brand analysis (configurable)"],
        ["Mistral", "Mistral Large", "OpenAI-compatible", "Brand analysis (configurable)"],
    ]
    e.append(make_table(llm_data, col_widths=[1.2 * inch, 1.5 * inch, 1.4 * inch, 2.1 * inch]))
    e.append(Spacer(1, 0.1 * inch))

    e.append(Paragraph("5.1 Query Execution Pipeline", styles["SubsectionTitle"]))
    e.append(Paragraph(
        "When an analysis is triggered, CORE sends each user-defined query to all selected LLM models in parallel. "
        "A rate-limiting mechanism introduces 2-second delays between batches to respect provider limits (especially "
        "Google Gemini). Responses are parsed for brand and competitor mentions, sentiment keywords, ranking positions "
        "within numbered lists, and cited URLs. Results are aggregated per model and per query for comparative analysis.",
        styles["BodyText2"]
    ))

    e.append(Paragraph("5.2 AI-Powered Features", styles["SubsectionTitle"]))
    features = [
        "<b>Automatic Question Generation:</b> DeepSeek generates industry-relevant questions that potential customers would ask AI assistants.",
        "<b>Competitor Suggestion:</b> DeepSeek analyzes the brand context and suggests relevant competitors to track.",
        "<b>Company Context Extraction:</b> GPT-4o-mini combined with Selenium scraping summarizes a company's business from its website.",
        "<b>Trendy Keyword Discovery:</b> Google Trends API identifies trending keywords relevant to the brand's industry.",
        "<b>Mass Article Generation:</b> GPT-4o generates bulk blog articles optimized for AI search visibility.",
    ]
    for f in features:
        e.append(bullet(f, styles))

    # 6. Key Features
    e.append(Paragraph("6. Key Features", styles["SectionTitle"]))

    e.append(Paragraph("6.1 Brand Dashboard", styles["SubsectionTitle"]))
    e.append(Paragraph(
        "The central dashboard provides a unified view of all brand metrics. Users can manage multiple brands "
        "and projects within workspaces, define custom queries, select target LLM models, and execute analyses. "
        "Results are displayed with mention counts, sentiment indicators, rank positions, and trend comparisons "
        "across models.",
        styles["BodyText2"]
    ))

    e.append(Paragraph("6.2 Geographic Intelligence (GEO)", styles["SubsectionTitle"]))
    e.append(Paragraph(
        "CORE supports country and language targeting for analyses, enabling businesses to understand how their "
        "brand is perceived in different markets. Users can configure geographic parameters during project setup "
        "and compare regional differences in AI brand visibility.",
        styles["BodyText2"]
    ))

    e.append(Paragraph("6.3 Competitive Analysis", styles["SubsectionTitle"]))
    e.append(Paragraph(
        "Beyond tracking the user's own brand, CORE monitors competitor mentions in the same AI responses. "
        "This provides comparative metrics showing who else is being recommended by AI assistants, how frequently "
        "they appear, and where opportunities exist to improve the user's brand visibility.",
        styles["BodyText2"]
    ))

    e.append(Paragraph("6.4 AI Article Engine", styles["SubsectionTitle"]))
    e.append(Paragraph(
        "The Article Engine is a content generation module within the dashboard that automates the creation of "
        "blog articles. It fetches company context, discovers trending keywords, and uses GPT-4o to produce "
        "multiple articles in bulk. Articles can be published directly to external blog endpoints via HTTP POST, "
        "enabling a closed-loop workflow from insight to content to improved AI visibility.",
        styles["BodyText2"]
    ))

    e.append(Paragraph("6.5 Automated Monitoring", styles["SubsectionTitle"]))
    e.append(Paragraph(
        "Users can schedule recurring analysis scans (daily, weekly, or custom intervals) to continuously track "
        "brand performance. The system maintains a history of analysis runs with timestamps, statuses, and result "
        "counts, allowing users to observe trends over time.",
        styles["BodyText2"]
    ))

    # 7. Data Layer & Storage
    e.append(Paragraph("7. Data Layer & Storage", styles["SectionTitle"]))
    e.append(Paragraph(
        "In its current MVP implementation, CORE uses a <b>localStorage-based database</b> (defined in "
        "<b>src/utils/db.js</b>) for all data persistence. This approach was chosen to enable a fully "
        "client-side deployment without requiring backend infrastructure for the hackathon prototype. "
        "The data layer manages the following entities:",
        styles["BodyText2"]
    ))
    entities = [
        "<b>Users</b> — Account information and authentication state.",
        "<b>Workspaces</b> — Organizational containers for brands and projects.",
        "<b>Brands</b> — Brand profiles with name, industry, and description.",
        "<b>Competitors</b> — Tracked competitor entries linked to brands.",
        "<b>Projects</b> — Analysis projects with model selection and geographic targeting.",
        "<b>Queries</b> — User-defined or AI-generated questions for LLM analysis.",
        "<b>Results</b> — Parsed analysis outputs including mentions, sentiment, rank, and URLs.",
        "<b>Analysis Runs</b> — Execution metadata with timestamps, status, and result counts.",
    ]
    for ent in entities:
        e.append(bullet(ent, styles))
    e.append(Paragraph(
        "For production deployment, this layer would be replaced with a proper backend API and database "
        "(e.g., Firebase Firestore, PostgreSQL, or Supabase).",
        styles["BodyText2"]
    ))

    # 8. Python Backend Services
    e.append(Paragraph("8. Python Backend Services", styles["SectionTitle"]))
    e.append(Paragraph(
        "Two Python scripts provide backend capabilities that supplement the frontend application:",
        styles["BodyText2"]
    ))

    e.append(Paragraph("8.1 Company Context Extraction (get_context.py)", styles["SubsectionTitle"]))
    e.append(Paragraph(
        "This service accepts a company URL, uses <b>Selenium WebDriver</b> to scrape the website content, "
        "and then sends the extracted text to <b>GPT-4o-mini</b> for summarization. The result is a structured "
        "summary of the company's business activity, products, and market positioning — which is then used by "
        "the AI Article Engine and question generation features.",
        styles["BodyText2"]
    ))

    e.append(Paragraph("8.2 Trendy Keywords Discovery (get_trendy_keywords.py)", styles["SubsectionTitle"]))
    e.append(Paragraph(
        "This service uses the <b>pytrends</b> library to query the Google Trends API for trending search terms "
        "related to the brand's industry. The discovered keywords inform both the question generation process and "
        "the article generation engine, ensuring content aligns with current search trends.",
        styles["BodyText2"]
    ))

    # 9. Demo Blog SaaS Module
    e.append(Paragraph("9. Demo Blog SaaS Module", styles["SectionTitle"]))
    e.append(Paragraph(
        "CORE includes a standalone <b>demo-blog-saas</b> module — a lightweight Node.js HTTP server that simulates "
        "an external blog platform. It exposes REST endpoints for article upload (POST), retrieval (GET), and "
        "deletion (DELETE). Articles are stored as JSON files on disk. This module serves as a proof-of-concept for "
        "the end-to-end workflow: generate articles in CORE → publish to an external blog → verify content appears "
        "on the live blog page (http://localhost:8787/blog).",
        styles["BodyText2"]
    ))

    # 10. Future Vision
    e.append(Paragraph("10. Future Vision", styles["SectionTitle"]))
    e.append(Paragraph(
        "CORE's long-term vision is to evolve into a full <b>GEO Blog Engine Optimization</b> platform. "
        "The roadmap includes:",
        styles["BodyText2"]
    ))
    future = [
        "<b>Mass Content Creation at Scale:</b> Automated generation of hundreds of optimized blog posts per campaign, tailored for specific industries and geographies.",
        "<b>LLM Search Optimization:</b> Strategies and tooling to improve how brands appear in AI models that can search the internet (Perplexity, ChatGPT with browsing, Gemini with Search).",
        "<b>Strategic Content Distribution:</b> Integration with CMS platforms, social media schedulers, and publishing networks for one-click content deployment.",
        "<b>Advanced Analytics:</b> Longitudinal tracking with trend visualization, ROI measurement for content campaigns, and predictive modeling of AI visibility.",
        "<b>Backend Migration:</b> Moving from localStorage to a production-ready backend with Firebase/Supabase, user authentication, and multi-tenant support.",
        "<b>Real-Time Monitoring:</b> Webhook-based alerting when brand visibility changes significantly across any monitored AI platform.",
    ]
    for f in future:
        e.append(bullet(f, styles))

    e.append(Spacer(1, 0.4 * inch))
    e.append(HRFlowable(width="100%", thickness=1, color=ACCENT))
    e.append(Spacer(1, 0.15 * inch))
    e.append(Paragraph(
        "<i>This report was generated for the CORE project, developed for the Google Hackathon 2026. "
        "For questions or collaboration inquiries, please refer to the project repository.</i>",
        styles["BodyText2"]
    ))

    return e


def main():
    doc = SimpleDocTemplate(
        OUTPUT_PATH,
        pagesize=A4,
        topMargin=0.75 * inch,
        bottomMargin=0.65 * inch,
        leftMargin=0.8 * inch,
        rightMargin=0.8 * inch,
        title="CORE — Technical Report",
        author="CORE Team",
    )

    styles = build_styles()
    elements = []
    elements.extend(build_cover(styles))
    elements.extend(build_toc(styles))
    elements.extend(build_report(styles))

    doc.build(elements, onFirstPage=add_header_footer, onLaterPages=add_header_footer)
    print(f"Report generated: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
