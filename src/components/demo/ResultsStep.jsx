import { useState } from 'react';
import { getAllModels } from '../../services/llmService';
import jsPDF from 'jspdf';

export default function ResultsStep({ data }) {
  const { analysisResults, brandName, competitors } = data;
  const allModels = getAllModels();
  
  // Filters state
  const [selectedCompany, setSelectedCompany] = useState('brand'); // 'brand' or competitor name
  const [selectedCitation, setSelectedCitation] = useState('all'); // 'all', 'yes', 'no'
  const [selectedModel, setSelectedModel] = useState('all'); // 'all' or model id
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  if (!analysisResults) {
    return <div>No results available</div>;
  }

  const { byModel, summary } = analysisResults;
  const selectedModels = allModels.filter(m => Object.keys(byModel).includes(m.id));

  // Sort models by brand mentions (descending)
  const sortedModels = selectedModels.sort((a, b) => {
    const aMentions = byModel[a.id]?.totalBrandMentions || 0;
    const bMentions = byModel[b.id]?.totalBrandMentions || 0;
    return bMentions - aMentions;
  });

  const maxBrandMentions = Math.max(
    ...selectedModels.map(m => byModel[m.id]?.totalBrandMentions || 0),
    1
  );

  const maxCompetitorMentions = Math.max(
    ...selectedModels.map(m => {
      const competitorMentions = byModel[m.id]?.totalCompetitorMentions || {};
      return Object.values(competitorMentions).reduce((sum, count) => sum + count, 0);
    }),
    1
  );

  // Generate PDF Report
  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPos = 20;
      
      // Header with Logo
      pdf.setFillColor(99, 102, 241); // Purple
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      // Logo (if you have it in base64, otherwise use text)
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CORE', 20, 25);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('AI Attribution Analysis Report', 20, 32);
      
      yPos = 50;
      
      // Brand Name
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Brand Analysis: ${brandName}`, 20, yPos);
      yPos += 10;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 20, yPos);
      yPos += 15;
      
      // Executive Summary
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Executive Summary', 20, yPos);
      yPos += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      // Summary boxes
      const summaryData = [
        { label: 'Total Brand Mentions', value: summary.totalBrandMentions || 0, color: [99, 102, 241] },
        { label: 'Competitor Mentions', value: summary.totalCompetitorMentions || 0, color: [107, 114, 128] },
        { label: 'Brand Visibility Rate', value: summary.brandAppearanceRate ? `${Math.round(summary.brandAppearanceRate * 100)}%` : '0%', color: [34, 197, 94] }
      ];
      
      const boxWidth = 55;
      const boxHeight = 20;
      let xPos = 20;
      
      summaryData.forEach((item, index) => {
        pdf.setFillColor(...item.color);
        pdf.roundedRect(xPos, yPos, boxWidth, boxHeight, 3, 3, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.text(item.label, xPos + 3, yPos + 6);
        
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(String(item.value), xPos + 3, yPos + 15);
        
        xPos += boxWidth + 5;
      });
      
      yPos += boxHeight + 15;
      
      // Model Comparison
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Model Comparison', 20, yPos);
      yPos += 10;
      
      // Table header
      pdf.setFillColor(240, 240, 240);
      pdf.rect(20, yPos, pageWidth - 40, 8, 'F');
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Model', 25, yPos + 5);
      pdf.text('Brand', 80, yPos + 5);
      pdf.text('Competitors', 120, yPos + 5);
      pdf.text('Visibility', 160, yPos + 5);
      
      yPos += 10;
      
      // Table rows
      pdf.setFont('helvetica', 'normal');
      sortedModels.forEach((model, index) => {
        if (yPos > pageHeight - 30) {
          pdf.addPage();
          yPos = 20;
        }
        
        const modelData = byModel[model.id];
        const brandMentions = modelData?.totalBrandMentions || 0;
        const competitorMentionsObj = modelData?.totalCompetitorMentions || {};
        const competitorMentions = Object.values(competitorMentionsObj).reduce((sum, count) => sum + count, 0);
        const appearances = modelData?.brandAppearances || 0;
        const totalQuestions = data.questions?.length || 0;
        const visibilityRate = totalQuestions > 0 ? `${Math.round((appearances / totalQuestions) * 100)}%` : '0%';
        
        if (index % 2 === 0) {
          pdf.setFillColor(250, 250, 250);
          pdf.rect(20, yPos - 5, pageWidth - 40, 8, 'F');
        }
        
        pdf.text(model.name, 25, yPos);
        pdf.text(String(brandMentions), 85, yPos);
        pdf.text(String(competitorMentions), 130, yPos);
        pdf.text(visibilityRate, 165, yPos);
        
        yPos += 8;
      });
      
      yPos += 10;
      
      // Competitor Breakdown
      if (yPos > pageHeight - 60) {
        pdf.addPage();
        yPos = 20;
      }
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Competitor Breakdown', 20, yPos);
      yPos += 10;
      
      competitors.forEach(competitor => {
        const totalMentions = selectedModels.reduce((sum, model) => 
          sum + (byModel[model.id]?.totalCompetitorMentions?.[competitor] || 0), 0
        );
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`• ${competitor}: ${totalMentions} mentions`, 25, yPos);
        yPos += 6;
      });
      
      yPos += 10;
      
      // Key Insights
      if (yPos > pageHeight - 60) {
        pdf.addPage();
        yPos = 20;
      }
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Key Insights', 20, yPos);
      yPos += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      const insights = [];
      
      if (summary.totalBrandMentions === 0) {
        insights.push('• Your brand is not appearing in AI responses. Consider improving your digital presence and SEO.');
      } else {
        insights.push(`• Your brand appeared in ${summary.brandAppearanceRate ? `${Math.round(summary.brandAppearanceRate * 100)}%` : '0%'} of responses, showing ${summary.brandAppearanceRate > 0.3 ? 'strong' : summary.brandAppearanceRate > 0.15 ? 'moderate' : 'weak'} AI visibility.`);
        insights.push(`• ${sortedModels[0]?.name || 'No model'} performs best for your brand with ${byModel[sortedModels[0]?.id]?.totalBrandMentions || 0} mentions.`);
        
        if (summary.totalCompetitorMentions > summary.totalBrandMentions) {
          insights.push(`• Competitors have better visibility (${summary.totalCompetitorMentions} vs ${summary.totalBrandMentions} mentions). Focus on SEO optimization and thought leadership content.`);
        }
      }
      
      insights.forEach(insight => {
        if (yPos > pageHeight - 20) {
          pdf.addPage();
          yPos = 20;
        }
        const lines = pdf.splitTextToSize(insight, pageWidth - 50);
        pdf.text(lines, 25, yPos);
        yPos += lines.length * 6;
      });
      
      // Footer
      const footerY = pageHeight - 15;
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text('Powered by CORE - AI Attribution Analysis Platform', pageWidth / 2, footerY, { align: 'center' });
      pdf.text(`www.core-platform.com`, pageWidth / 2, footerY + 4, { align: 'center' });
      
      // Save PDF
      pdf.save(`${brandName.replace(/\s+/g, '_')}_AI_Attribution_Report.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-300 bg-purple-50 px-4 py-1 text-xs font-medium tracking-wide text-purple-700 mb-4">
          Results
        </div>
        <h2 className="text-3xl font-light text-gray-900 tracking-tight leading-tight mb-3">
          AI Attribution <span className="text-purple-600 font-medium">Analysis</span>
        </h2>
        <p className="text-gray-600 font-light leading-relaxed">
          Compare how different LLMs reference your brand vs. competitors
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="rounded-3xl border border-purple-200 bg-gradient-to-br from-purple-50 to-white p-6 shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-light">Brand Mentions</p>
              <p className="text-2xl font-semibold text-purple-600">{summary.totalBrandMentions || 0}</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 font-light">
            Your brand was mentioned in <span className="font-medium text-purple-600">{summary.brandAppearances || 0}</span> responses
          </p>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-500">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-light">Competitor Mentions</p>
              <p className="text-2xl font-semibold text-gray-700">{summary.totalCompetitorMentions || 0}</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 font-light">
            Competitors appeared in <span className="font-medium text-gray-700">{summary.competitorAppearances || 0}</span> responses
          </p>
        </div>

        <div className="rounded-3xl border border-green-200 bg-gradient-to-br from-green-50 to-white p-6 shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-light">Visibility Rate</p>
              <p className="text-2xl font-semibold text-green-600">
                {summary.brandAppearanceRate 
                  ? `${Math.round(summary.brandAppearanceRate * 100)}%`
                  : '0%'}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-600 font-light">
            Percentage of questions where your brand appeared
          </p>
        </div>
      </div>

      {/* Model Comparison */}
      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-md mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Model Comparison</h3>
        
        <div className="space-y-6">
          {sortedModels.map((model, index) => {
            const modelData = byModel[model.id];
            const brandMentions = modelData?.totalBrandMentions || 0;
            const competitorMentionsObj = modelData?.totalCompetitorMentions || {};
            const competitorMentions = Object.values(competitorMentionsObj).reduce((sum, count) => sum + count, 0);
            const brandPercentage = (brandMentions / maxBrandMentions) * 100;
            const competitorPercentage = (competitorMentions / maxCompetitorMentions) * 100;
            
            return (
              <div key={model.id} className="pb-6 border-b border-gray-100 last:border-0">
                {/* Model Header */}
                <div className="flex items-center gap-4 mb-4">
                  {index === 0 && brandMentions > 0 && (
                    <div className="flex items-center gap-1 rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-700">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                      </svg>
                      Best for your brand
                    </div>
                  )}
                  <img 
                    src={model.logo} 
                    alt={model.name} 
                    className="h-8 w-auto object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.marginLeft = '0';
                    }}
                  />
                  <h4 className="text-base font-medium text-gray-900">{model.name}</h4>
                </div>

                {/* Brand Mentions Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700 font-medium">{brandName}</span>
                    <span className="text-sm font-semibold text-purple-600">{brandMentions} mentions</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
                      style={{ width: `${brandPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Competitor Mentions Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">Competitors</span>
                    <span className="text-sm font-semibold text-gray-600">{competitorMentions} mentions</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-gray-400 to-gray-500 transition-all duration-500"
                      style={{ width: `${competitorPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Detailed Stats */}
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-600 font-light">Appearance Rate</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {modelData?.brandAppearances || 0}/{data.questions?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-light">Avg. per Response</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {modelData?.brandAppearances > 0 
                        ? (brandMentions / modelData.brandAppearances).toFixed(1)
                        : '0'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-light">vs. Competitors</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {competitorMentions > 0 
                        ? `${(brandMentions / competitorMentions).toFixed(1)}x`
                        : '∞'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-8 shadow-md">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 flex-shrink-0">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Key Insights</h3>
            <ul className="space-y-2 text-sm text-gray-700 font-light">
              {summary.totalBrandMentions === 0 ? (
                <li className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <span><strong>No brand mentions detected.</strong> Your brand is not appearing in AI responses. Consider improving your digital presence and SEO.</span>
                </li>
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      Your brand appeared in <strong>{summary.brandAppearanceRate ? `${Math.round(summary.brandAppearanceRate * 100)}%` : '0%'}</strong> of responses, 
                      showing {summary.brandAppearanceRate > 0.3 ? 'strong' : summary.brandAppearanceRate > 0.15 ? 'moderate' : 'weak'} AI visibility.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      {sortedModels[0] ? `${sortedModels[0].name}` : 'No model'} performs best for your brand with <strong>{byModel[sortedModels[0]?.id]?.totalBrandMentions || 0} mentions</strong>.
                    </span>
                  </li>
                  {summary.totalCompetitorMentions > summary.totalBrandMentions && (
                    <li className="flex items-start gap-2">
                      <svg className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                      <span>
                        <strong>Competitors have better visibility</strong> ({summary.totalCompetitorMentions} vs {summary.totalBrandMentions} mentions). 
                        Focus on SEO optimization and thought leadership content.
                      </span>
                    </li>
                  )}
                </>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Detailed Analysis Section */}
      <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-8 shadow-md">
        <h3 className="text-xl font-medium text-gray-900 mb-6">Detailed Citation Analysis</h3>
        
        {/* Competitor Comparison Table */}
        <div className="mb-8">
          <h4 className="text-base font-medium text-gray-900 mb-4">Citations by Company & Model</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Company</th>
                  {selectedModels.map(model => (
                    <th key={model.id} className="text-center py-3 px-4 font-medium text-gray-700">
                      <div className="flex flex-col items-center gap-1">
                        <img 
                          src={model.logo} 
                          alt={model.name} 
                          className="h-6 w-auto object-contain"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <span className="text-xs">{model.name}</span>
                      </div>
                    </th>
                  ))}
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {/* Brand Row */}
                <tr className="border-b border-gray-100 bg-purple-50">
                  <td className="py-3 px-4 font-medium text-purple-700">
                    {brandName} <span className="text-xs font-normal">(You)</span>
                  </td>
                  {selectedModels.map(model => {
                    const mentions = byModel[model.id]?.totalBrandMentions || 0;
                    return (
                      <td key={model.id} className="text-center py-3 px-4 font-semibold text-purple-600">
                        {mentions}
                      </td>
                    );
                  })}
                  <td className="text-center py-3 px-4 font-bold text-purple-700">
                    {summary.totalBrandMentions || 0}
                  </td>
                </tr>
                
                {/* Competitor Rows */}
                {competitors.map(competitor => {
                  let totalForCompetitor = 0;
                  return (
                    <tr key={competitor} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-700">{competitor}</td>
                      {selectedModels.map(model => {
                        const mentions = byModel[model.id]?.totalCompetitorMentions?.[competitor] || 0;
                        totalForCompetitor += mentions;
                        return (
                          <td key={model.id} className="text-center py-3 px-4 text-gray-600">
                            {mentions}
                          </td>
                        );
                      })}
                      <td className="text-center py-3 px-4 font-semibold text-gray-700">
                        {selectedModels.reduce((sum, model) => 
                          sum + (byModel[model.id]?.totalCompetitorMentions?.[competitor] || 0), 0
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 p-4 rounded-2xl border border-purple-200 bg-purple-50">
          <p className="text-sm font-medium text-gray-900 mb-3">Filter Questions:</p>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Company Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Company</label>
              <select 
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              >
                <option value="brand">{brandName} (You)</option>
                {competitors.map(comp => (
                  <option key={comp} value={comp}>{comp}</option>
                ))}
              </select>
            </div>

            {/* Citation Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Citation Status</label>
              <select 
                value={selectedCitation}
                onChange={(e) => setSelectedCitation(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              >
                <option value="all">All Questions</option>
                <option value="yes">Cited</option>
                <option value="no">Not Cited</option>
              </select>
            </div>

            {/* Model Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Model</label>
              <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              >
                <option value="all">All Models</option>
                {selectedModels.map(model => (
                  <option key={model.id} value={model.id}>{model.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Filtered Questions List */}
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-4">
            Questions 
            {selectedCompany !== 'brand' && ` mentioning ${selectedCompany}`}
            {selectedCompany === 'brand' && ` mentioning ${brandName}`}
            {selectedCitation === 'yes' && ' (Cited)'}
            {selectedCitation === 'no' && ' (Not Cited)'}
            {selectedModel !== 'all' && ` - ${selectedModels.find(m => m.id === selectedModel)?.name}`}
          </h4>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {(() => {
              // Get models to check based on filter
              const modelsToCheck = selectedModel === 'all' ? selectedModels : selectedModels.filter(m => m.id === selectedModel);
              
              // Get all questions with citation data
              const questionsWithData = data.questions.map((question, idx) => {
                const citationData = modelsToCheck.map(model => {
                  const questionResult = byModel[model.id]?.questionResults?.find(q => q.questionIndex === idx);
                  if (!questionResult) return { model: model.name, cited: false, mentions: 0 };
                  
                  const isBrand = selectedCompany === 'brand';
                  const mentions = isBrand 
                    ? questionResult.mentions?.brand || 0
                    : questionResult.mentions?.competitors?.[selectedCompany] || 0;
                  
                  return {
                    model: model.name,
                    cited: mentions > 0,
                    mentions,
                    answer: questionResult.answer
                  };
                });
                
                const anyCited = citationData.some(d => d.cited);
                const allCited = citationData.every(d => d.cited);
                
                return {
                  question,
                  index: idx,
                  citationData,
                  anyCited,
                  allCited
                };
              });
              
              // Filter questions based on citation filter
              const filteredQuestions = questionsWithData.filter(q => {
                if (selectedCitation === 'yes') return q.anyCited;
                if (selectedCitation === 'no') return !q.anyCited;
                return true;
              });
              
              if (filteredQuestions.length === 0) {
                return (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="h-12 w-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                    </svg>
                    <p className="text-sm">No questions match the selected filters</p>
                  </div>
                );
              }
              
              return filteredQuestions.map(({ question, index, citationData }) => (
                <details key={index} className="group rounded-2xl border border-gray-200 bg-white hover:border-purple-300 transition">
                  <summary className="cursor-pointer p-4 flex items-start gap-3">
                    <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs font-semibold text-purple-600">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 font-light">{question}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {citationData.map((data, i) => (
                          <span 
                            key={i}
                            className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                              data.cited 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {data.model}: {data.cited ? `✓ ${data.mentions}` : '✗'}
                          </span>
                        ))}
                      </div>
                    </div>
                    <svg className="h-5 w-5 text-gray-400 group-open:rotate-180 transition flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-3">
                    {citationData.map((data, i) => (
                      <div key={i} className="text-xs">
                        <p className="font-medium text-gray-700 mb-1">{data.model}:</p>
                        <p className="text-gray-600 pl-3 italic">
                          {data.answer ? `"${data.answer.substring(0, 200)}${data.answer.length > 200 ? '...' : ''}"` : 'No response'}
                        </p>
                      </div>
                    ))}
                  </div>
                </details>
              ));
            })()}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-8 text-center space-y-4">
        {/* Download PDF Button */}
        <button
          onClick={generatePDF}
          disabled={isGeneratingPDF}
          className="inline-flex items-center gap-2 rounded-full border-2 border-purple-600 px-8 py-4 text-sm font-semibold text-purple-600 transition hover:bg-purple-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGeneratingPDF ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating PDF...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF Report
            </>
          )}
        </button>
        
        <button
          onClick={() => window.location.href = '/'}
          className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-8 py-4 text-sm font-semibold text-white transition hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2"
        >
          Start New Analysis
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
      </div>
    </div>
  );
}
