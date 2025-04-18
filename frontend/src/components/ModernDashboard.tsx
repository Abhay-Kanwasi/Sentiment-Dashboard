import axios from 'axios';
import { useState } from 'react';
import styled from "styled-components";
import { useDropzone } from 'react-dropzone';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, 
         BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { PuffLoader } from "react-spinners";
import { Download, FileText, Search, Filter, ChevronDown, AlertCircle } from 'lucide-react';

// Type definitions
interface Review {
  review: string;
  sentiment: 'POSITIVE' | 'NEGATIVE';
  confidence: number;
}

interface AnalysisResults {
  summary: {
    positive_count: number;
    negative_count: number;
    positive_avg_confidence: number;
    negative_avg_confidence: number;
    total_reviews: number;
  };
  reviews: Review[];
}

const COLORS = {
  positive: '#10B981', // Emerald green
  negative: '#EF4444', // Red
  neutral: '#6B7280', // Gray
  lightBg: '#F9FAFB',
  border: '#E5E7EB',
  text: '#1F2937',
  lightText: '#6B7280',
  primary: '#3B82F6', // Blue
  hover: '#2563EB',
  accent: '#8B5CF6', // Purple
};

const App = () => {
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');
  const [showStatsCards, setShowStatsCards] = useState(true);

  const ResponsiveGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 1.5rem;
    border-bottom: 1px solid ${COLORS.border};

    @media (min-width: 768px) {
      grid-template-columns: 1fr 1fr;
    }
  `;

  const ContainerA = styled.div`
    padding: 1.5rem;
  `;

  const ResponsiveFlex = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;

    @media (min-width: 768px) {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  `;

  const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;

    @media (min-width: 768px) {
      flex-direction: row;
      width: auto;
    }
  `;

  const SearchContainer = styled.div`
    position: relative;
    flex-grow: 1;

    @media (min-width: 768px) {
      width: 240px;
    }
  `;

  const FilterContainer = styled.div`
    position: relative;

    @media (min-width: 768px) {
      width: 180px;
    }
  `;

  const StyledInput = styled.input`
    width: 100%;
    padding: 0.625rem 0.75rem 0.625rem 2.25rem;
    border: 1px solid ${COLORS.border};
    border-radius: 0.375rem;
    font-size: 0.875rem;
  `;

  const StyledSelect = styled.select`
    width: 100%;
    padding: 0.625rem 0.75rem 0.625rem 2.25rem;
    border: 1px solid ${COLORS.border};
    border-radius: 0.375rem;
    font-size: 0.875rem;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1rem;
  `;

  const DownloadButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    background-color: ${COLORS.primary};
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  `;
  const onDrop = async (acceptedFiles: File[]) => {
    setError(null);
    
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsLoading(true);
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

    try {
      const response = await axios.post(`${backendUrl}/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResults(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(`Error: ${err.response.data.detail || 'Failed to analyze file'}`);
      } else {
        setError('An unexpected error occurred');
      }
      console.error('Upload error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
  });

  const handleDownloadCSV = () => {
    if (!results) return;

    const headers = ['review', 'sentiment', 'confidence'];
    const csvRows = [
      headers.join(','),
      ...results.reviews.map(review => [
        `"${review.review.replace(/"/g, '""')}"`,
        review.sentiment,
        review.confidence
      ].join(','))
    ];
    const csvString = csvRows.join('\n');

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sentiment_analysis_results.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter reviews based on search term and sentiment filter
  const filteredReviews = results?.reviews.filter(review => {
    const matchesSearch = review.review.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSentiment = sentimentFilter === 'all' || 
                           review.sentiment === sentimentFilter.toUpperCase();
    return matchesSearch && matchesSentiment;
  }) || [];

  return (
    <div style={{ 
      fontFamily: "'Inter', sans-serif",
      backgroundColor: '#F3F4F6', 
      minHeight: '100vh',
      color: COLORS.text,
    }}>
      <header style={{ 
        background: 'linear-gradient(to right, #3B82F6, #8B5CF6)',
        padding: '1.5rem',
        color: 'white',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 600 }}>
            Sentiment Analysis Dashboard
          </h1>
          <p style={{ margin: '0.5rem 0 0', opacity: 0.9 }}>
            Upload a CSV file with product reviews to analyze sentiment
          </p>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>
        {/* File Upload Area */}
        <section style={{ 
          background: 'white', 
          borderRadius: '0.75rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}>
          <div
            {...getRootProps()}
            style={{
              border: `2px dashed ${isDragActive ? COLORS.primary : COLORS.border}`,
              borderRadius: '0.5rem',
              padding: '3rem 2rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: isDragActive ? 'rgba(59, 130, 246, 0.05)' : COLORS.lightBg,
            }}
          >
            <input {...getInputProps()} />

            {isLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <PuffLoader
                  color={COLORS.primary} 
                  size={48}
                />
                <p style={{ marginTop: '1rem', color: COLORS.primary, fontWeight: 500 }}>
                  Analyzing your reviews...
                </p>
              </div>
            ) : (
              <div>
                <FileText size={48} color={COLORS.primary} style={{ margin: '0 auto 1rem' }} />
                <p style={{ fontWeight: 500, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  {isDragActive ? "Drop your CSV file here..." : "Drag & drop your CSV file here, or click to select"}
                </p>
                <p style={{ color: COLORS.lightText, fontSize: '0.875rem' }}>
                  The file must contain a 'review' column with your product reviews
                </p>
              </div>
            )}
          </div>

          {error && (
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '1rem', 
              padding: '0.75rem 1rem', 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              color: '#B91C1C',
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}>
              <AlertCircle size={18} />
              {error}
            </div>
          )}
        </section>

        {/* Results Section */}
        {results && (
          <section style={{ 
            background: 'white', 
            borderRadius: '0.75rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
          }}>
            {/* Stats Summary Cards */}
            <div style={{ borderBottom: `1px solid ${COLORS.border}`, padding: '1.5rem' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1rem' 
              }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Analysis Results</h2>
                <button 
                  onClick={() => setShowStatsCards(!showStatsCards)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    background: 'none',
                    border: 'none',
                    fontSize: '0.875rem',
                    color: COLORS.primary,
                    cursor: 'pointer',
                  }}
                >
                  {showStatsCards ? 'Hide' : 'Show'} Statistics
                  <ChevronDown size={16} style={{ 
                    transform: showStatsCards ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.2s'
                  }} />
                </button>
              </div>

              {showStatsCards && (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ 
                    backgroundColor: COLORS.lightBg, 
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    borderLeft: `4px solid ${COLORS.primary}` 
                  }}>
                    <p style={{ margin: '0 0 0.5rem', color: COLORS.lightText, fontSize: '0.875rem' }}>Total Reviews</p>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '1.5rem' }}>{results.summary.total_reviews}</p>
                  </div>

                  <div style={{ 
                    backgroundColor: COLORS.lightBg, 
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    borderLeft: `4px solid ${COLORS.positive}` 
                  }}>
                    <p style={{ margin: '0 0 0.5rem', color: COLORS.lightText, fontSize: '0.875rem' }}>Positive Reviews</p>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '1.5rem' }}>{results.summary.positive_count}</p>
                  </div>

                  <div style={{ 
                    backgroundColor: COLORS.lightBg, 
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    borderLeft: `4px solid ${COLORS.negative}` 
                  }}>
                    <p style={{ margin: '0 0 0.5rem', color: COLORS.lightText, fontSize: '0.875rem' }}>Negative Reviews</p>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '1.5rem' }}>{results.summary.negative_count}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Charts Section */}
            <ResponsiveGrid>
              {/* Sentiment Distribution Pie Chart */}
              <div style={{ height: '300px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 500, marginTop: 0, marginBottom: '1rem' }}>Sentiment Distribution</h3>
                <ResponsiveContainer width="100%" height="85%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Positive', value: results.summary.positive_count, color: COLORS.positive },
                        { name: 'Negative', value: results.summary.negative_count, color: COLORS.negative }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {[
                        { name: 'Positive', value: results.summary.positive_count, color: COLORS.positive },
                        { name: 'Negative', value: results.summary.negative_count, color: COLORS.negative }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value} reviews`, 'Count']}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        borderRadius: '0.375rem', 
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
                        border: 'none',
                        padding: '0.5rem 0.75rem'
                      }}
                    />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Confidence Scores Bar Chart */}
              <div style={{ height: '300px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 500, marginTop: 0, marginBottom: '1rem' }}>Average Confidence Score</h3>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart
                    data={[
                      { name: 'Positive', confidence: results.summary.positive_avg_confidence, color: COLORS.positive },
                      { name: 'Negative', confidence: results.summary.negative_avg_confidence, color: COLORS.negative }
                    ].filter(item => !isNaN(item.confidence) && item.confidence > 0)}
                    margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      domain={[0, 1]} 
                      tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Confidence']}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        borderRadius: '0.375rem', 
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
                        border: 'none',
                        padding: '0.5rem 0.75rem'
                      }}
                    />
                    <Bar dataKey="confidence" radius={[4, 4, 0, 0]}>
                      {[
                        { name: 'Positive', confidence: results.summary.positive_avg_confidence, color: COLORS.positive },
                        { name: 'Negative', confidence: results.summary.negative_avg_confidence, color: COLORS.negative }
                      ].filter(item => !isNaN(item.confidence) && item.confidence > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ResponsiveGrid>

            {/* Reviews Table Section */}
            <Container>
              <ResponsiveFlex>
                <h3 style={{ paddingLeft: '30px', fontSize: '1rem', fontWeight: 500, margin: 0 }}>Review Details ({filteredReviews.length} reviews)</h3>
                  <ContainerA style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <SearchContainer style={{ position: 'relative', flex: '0 1 200px' }}>
                      <Search
                        size={16}
                        style={{
                          position: "absolute",
                          left: "0.75rem",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: COLORS.lightText,
                        }}
                      />
                      <StyledInput
                        type="text"
                        placeholder="Search reviews..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '2rem', width: '100%' }}
                      />
                    </SearchContainer>

                    <FilterContainer style={{ position: 'relative', flex: '0 1 160px' }}>
                      <Filter
                        size={16}
                        style={{
                          position: "absolute",
                          left: "0.75rem",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: COLORS.lightText,
                        }}
                      />
                      <StyledSelect
                        value={sentimentFilter}
                        onChange={(e) => setSentimentFilter(e.target.value)}
                        style={{ paddingLeft: '2rem', width: '100%' }}
                      >
                        <option value="all">All Sentiments</option>
                        <option value="positive">Positive</option>
                        <option value="negative">Negative</option>
                      </StyledSelect>
                    </FilterContainer>

                    <DownloadButton 
                      onClick={handleDownloadCSV}
                      style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <Download size={16} />
                      Download CSV
                    </DownloadButton>
                  </ContainerA>
                </ResponsiveFlex>
            </Container>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse', 
                  fontSize: '0.875rem',
                  tableLayout: 'fixed',
                }}>
                  <thead>
                    <tr style={{ backgroundColor: COLORS.lightBg, borderBottom: `2px solid ${COLORS.border}` }}>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', width: '60%' }}>Review</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', width: '20%' }}>Sentiment</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', width: '20%' }}>Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReviews.length > 0 ? (
                      filteredReviews.map((review, index) => (
                        <tr 
                          key={index} 
                          style={{ 
                            borderBottom: `1px solid ${COLORS.border}`,
                            backgroundColor: index % 2 === 0 ? 'white' : COLORS.lightBg,
                          }}
                        >
                          <td style={{ 
                            padding: '0.75rem 1rem', 
                            wordBreak: 'break-word',
                            lineHeight: '1.5'
                          }}>
                            {review.review}
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{ 
                              display: 'inline-block',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '9999px',
                              fontWeight: 500,
                              fontSize: '0.75rem',
                              backgroundColor: review.sentiment === 'POSITIVE' 
                                ? 'rgba(16, 185, 129, 0.1)' 
                                : 'rgba(239, 68, 68, 0.1)',
                              color: review.sentiment === 'POSITIVE' 
                                ? 'rgb(6, 95, 70)' 
                                : 'rgb(153, 27, 27)',
                            }}>
                              {review.sentiment === 'POSITIVE' ? 'Positive' : 'Negative'}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ 
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              <div style={{
                                width: '60px',
                                height: '6px',
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                borderRadius: '3px',
                              }}>
                                <div style={{
                                  width: `${review.confidence * 100}%`,
                                  height: '100%',
                                  backgroundColor: review.sentiment === 'POSITIVE' ? COLORS.positive : COLORS.negative,
                                  borderRadius: '3px',
                                }} />
                              </div>
                              <span>{(review.confidence * 100).toFixed(1)}%</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} style={{ padding: '2rem 1rem', textAlign: 'center', color: COLORS.lightText }}>
                          {results.reviews.length === 0 
                            ? 'No reviews to display' 
                            : 'No reviews match your search criteria'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {filteredReviews.length > 0 && filteredReviews.length < results.reviews.length && (
                <div style={{ 
                  marginTop: '1rem', 
                  padding: '0.5rem',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  color: COLORS.lightText,
                }}>
                  Showing {filteredReviews.length} of {results.reviews.length} reviews
                </div>
              )}
          </section>
        )}
      </main>
    </div>
  );
};

export default App;