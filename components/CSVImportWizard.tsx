'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertTriangle, X, Download, ArrowRight, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

interface CSVImportWizardProps {
  entityType: 'students' | 'courses';
  onComplete: (results: any) => void;
  onClose: () => void;
}

interface ImportStep {
  id: string;
  title: string;
  description: string;
}

interface ValidationError {
  row: number;
  field: string;
  value: string;
  error: string;
}

export default function CSVImportWizard({ entityType, onComplete, onClose }: CSVImportWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const steps: ImportStep[] = [
    {
      id: 'upload',
      title: 'Upload CSV File',
      description: 'Select your CSV file to import'
    },
    {
      id: 'validate',
      title: 'Validate Data',
      description: 'Check for errors and preview import'
    },
    {
      id: 'import',
      title: 'Import Data',
      description: 'Execute the import process'
    },
    {
      id: 'complete',
      title: 'Import Complete',
      description: 'Review import results'
    }
  ];

  const getTemplateHeaders = () => {
    switch (entityType) {
      case 'students':
        return ['name', 'email', 'password'];
      case 'courses':
        return ['title', 'description', 'category', 'price'];
      default:
        return [];
    }
  };

  const downloadTemplate = () => {
    const headers = getTemplateHeaders();
    const sampleData = headers.map(header => {
      switch (header) {
        case 'name': return 'John Doe';
        case 'email': return 'john@example.com';
        case 'password': return 'password123';
        case 'title': return 'Introduction to Programming';
        case 'description': return 'Learn the basics of programming';
        case 'category': return 'Technology';
        case 'price': return '4999';
        default: return '';
      }
    });

    const csv = [headers, sampleData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entityType}_import_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      addToast({
        type: 'error',
        title: 'Invalid File',
        message: 'Please select a CSV file',
        duration: 4000
      });
      return;
    }

    setFile(selectedFile);

    // Parse CSV
    const text = await selectedFile.text();
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    const data = lines.slice(1).map((line, index) => {
      const values = line.split(',');
      const row: any = { _rowNumber: index + 2 }; // 1-indexed + header
      headers.forEach((header, i) => {
        row[header] = values[i]?.trim() || '';
      });
      return row;
    });

    setParsedData(data);
    setCurrentStep(1);
  };

  const validateData = async () => {
    setIsValidating(true);
    setValidationErrors([]);

    try {
      const response = await fetch('/api/admin/import/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          data: parsedData
        })
      });

      const result = await response.json();

      if (response.ok) {
        setValidationErrors(result.errors || []);
        if (result.errors && result.errors.length === 0) {
          setCurrentStep(2);
        }
      } else {
        addToast({
          type: 'error',
          title: 'Validation Failed',
          message: result.error || 'Could not validate data',
          duration: 4000
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Network error during validation',
        duration: 4000
      });
    } finally {
      setIsValidating(false);
    }
  };

  const executeImport = async () => {
    setIsImporting(true);

    try {
      const response = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          data: parsedData
        })
      });

      const result = await response.json();

      if (response.ok) {
        setImportResults(result);
        setCurrentStep(3);
        onComplete(result);
      } else {
        addToast({
          type: 'error',
          title: 'Import Failed',
          message: result.error || 'Import failed',
          duration: 4000
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Import Error',
        message: 'Network error during import',
        duration: 4000
      });
    } finally {
      setIsImporting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Upload
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Upload {entityType} Data
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Select a CSV file containing {entityType} data to import
              </p>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {file ? file.name : 'Drop your CSV file here or click to browse'}
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Choose File
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={downloadTemplate}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                >
                  <Download className="w-4 h-4 inline mr-1" />
                  Download Template
                </button>
              </div>
            </div>
          </div>
        );

      case 1: // Validate
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Validate Data
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Review and validate your import data
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium text-gray-900 dark:text-white">
                  {parsedData.length} rows found
                </span>
                <button
                  onClick={validateData}
                  disabled={isValidating}
                  className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {isValidating ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Validate
                </button>
              </div>

              {validationErrors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="font-medium text-red-800 dark:text-red-400">
                      {validationErrors.length} validation errors found
                    </span>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {validationErrors.slice(0, 5).map((error, index) => (
                      <div key={index} className="text-sm text-red-700 dark:text-red-300">
                        Row {error.row}: {error.field} - {error.error}
                      </div>
                    ))}
                    {validationErrors.length > 5 && (
                      <div className="text-sm text-red-600 dark:text-red-400">
                        ... and {validationErrors.length - 5} more errors
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Required fields:</strong> {getTemplateHeaders().join(', ')}
              </div>
            </div>
          </div>
        );

      case 2: // Import
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Ready to Import
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Execute the import process
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-400">
                  Validation Complete
                </span>
              </div>
              <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
                <div>• {parsedData.length} rows ready for import</div>
                <div>• {validationErrors.length} validation errors resolved</div>
                <div>• All required fields present</div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">Import Summary</h4>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <div>• Entity Type: {entityType}</div>
                <div>• Records to Import: {parsedData.length}</div>
                <div>• This action cannot be undone</div>
              </div>
            </div>
          </div>
        );

      case 3: // Complete
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Import Complete
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your data has been successfully imported
              </p>
            </div>

            {importResults && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                <h4 className="font-medium text-green-800 dark:text-green-400 mb-4">Import Results</h4>
                <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
                  <div>• Successfully imported: {importResults.successful || 0}</div>
                  <div>• Failed: {importResults.failed || 0}</div>
                  <div>• Skipped: {importResults.skipped || 0}</div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return !!file;
      case 1: return validationErrors.length === 0;
      case 2: return true;
      case 3: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      validateData();
    } else if (currentStep === 2) {
      executeImport();
    } else {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Import {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStep
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                  }`}>
                    {index < currentStep ? <CheckCircle className="w-4 h-4" /> : index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-1 mx-2 ${
                      index < currentStep ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <h3 className="font-medium text-gray-900 dark:text-white">
                {steps[currentStep].title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {steps[currentStep].description}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-96">
            {renderStepContent()}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              Step {currentStep + 1} of {steps.length}
            </div>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed() || isValidating || isImporting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg disabled:cursor-not-allowed transition-colors"
              >
                {currentStep === 1 ? 'Validate' : currentStep === 2 ? 'Import' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                Done
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

