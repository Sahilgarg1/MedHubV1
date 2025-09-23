import React, { useState, useEffect, useRef } from 'react';
import { useUploadInventory, useClearInventory } from '../../hooks/useProducts';
import { useGetSubmittedBids } from '../../hooks/useBids';
import { useAuthStore } from '../../stores/authStore';
import { useAccordion, AccordionProvider } from '../../contexts/AccordionContext';
import { useQueryClient } from '@tanstack/react-query';
import { Upload, FileText, CheckCircle, AlertCircle, X, ChevronDown, ChevronRight, Package, AlertTriangle, Trash } from 'lucide-react';
// Frontend only handles basic file validation and upload
// All parsing is done securely on the backend

// ClearInventoryModal component (moved from separate file)
interface ClearInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deleteActiveBids: boolean) => void;
  hasActiveBids: boolean;
  isClearing: boolean;
}

const ClearInventoryModal: React.FC<ClearInventoryModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  hasActiveBids,
  isClearing
}) => {
  const [deleteActiveBids, setDeleteActiveBids] = useState(false);
  const [clearTimer, setClearTimer] = useState(5);
  const [canClear, setCanClear] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setDeleteActiveBids(false);
      setClearTimer(5);
      setCanClear(false);
      return;
    }

    // Start 5-second timer for clear button
    const clearButtonTimer = setInterval(() => {
      setClearTimer((prev) => {
        if (prev <= 1) {
          setCanClear(true);
          clearInterval(clearButtonTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(clearButtonTimer);
    };
  }, [isOpen, hasActiveBids]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(deleteActiveBids);
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Clear Inventory
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isClearing}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to clear all your inventory? This action will:
          </p>
          
          <ul className="text-sm text-gray-600 mb-6 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              Remove your distributor ID from all products
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              Clear all unidentified product entries
            </li>
            {hasActiveBids && (
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                Optionally delete all your active bids (if selected below)
              </li>
            )}
          </ul>

          <p className="text-sm text-red-600 font-medium">
            ⚠️ This action cannot be undone.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isClearing}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isClearing || !canClear}
            className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md transition-colors flex items-center gap-2 ${
              canClear && !isClearing
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {isClearing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Clearing...
              </>
            ) : !canClear ? (
              `Clear Inventory (${clearTimer}s)`
            ) : (
              'Clear Inventory'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

interface UploadHistoryEntry {
  id: string;
  fileName: string;
  timestamp: Date;
  rowCount: number;
  status: 'success' | 'error';
  processingResults?: {
    totalProcessed: number;
    matchedCount: number;
    notFoundCount: number;
  };
}

export const InventoryView = () => {
  return (
    <AccordionProvider>
      <InventoryViewContent />
    </AccordionProvider>
  );
};

const InventoryViewContent = () => {
  // State for the raw file, parsed headers, and preview rows
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadHistory, setUploadHistory] = useState<UploadHistoryEntry[]>([]);
  const [showSampleDropdown, setShowSampleDropdown] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuthStore();
  const { expandedItem, toggleExpanded } = useAccordion();
  const queryClient = useQueryClient();
  const uploadMutation = useUploadInventory();
  const clearInventoryMutation = useClearInventory();
  const { data: submittedBids } = useGetSubmittedBids();

  // Load upload history from localStorage on component mount
  useEffect(() => {
    if (!user?.id) return;
    
    const userSpecificKey = `inventory-upload-history-${user.id}`;
    const savedHistory = localStorage.getItem(userSpecificKey);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        // Convert timestamp strings back to Date objects
        const historyWithDates = parsed.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
        setUploadHistory(historyWithDates);
      } catch (error) {
        console.error('Failed to load upload history:', error);
      }
    }
  }, [user?.id]);

  // Save upload history to localStorage whenever it changes
  useEffect(() => {
    if (!user?.id) return;
    
    const userSpecificKey = `inventory-upload-history-${user.id}`;
    if (uploadHistory.length > 0) {
      localStorage.setItem(userSpecificKey, JSON.stringify(uploadHistory));
    }
  }, [uploadHistory, user?.id]);

  // Clear upload history when user changes (logout/login as different user)
  useEffect(() => {
    if (!user?.id) {
      setUploadHistory([]);
    }
  }, [user?.id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSampleDropdown) {
        const target = event.target as HTMLElement;
        if (!target.closest('.sample-dropdown-container')) {
          setShowSampleDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSampleDropdown]);

  // Enhanced column validation with mapping logic
  const validateCSVColumns = (headers: string[]): { 
    isValid: boolean; 
    missingColumns: string[]; 
    columnMapping: { [key: string]: string };
    warnings: string[];
  } => {
    // Normalize column names for comparison
    const normalizeColumnName = (name: string): string => {
      return name.toLowerCase()
        .replace(/[_\s-]+/g, '_')
        .replace(/^_+|_+$/g, '');
    };

    // Find mapped column for a given field
    const findMappedColumn = (_fieldName: string, variations: string[]): string | null => {
      for (const header of headers) {
        const normalized = normalizeColumnName(header);
        for (const variation of variations) {
          if (normalized.includes(variation) || normalized === variation) {
            return header;
          }
        }
      }
      return null;
    };

    // Define field mappings with variations
    const fieldMappings = {
      product_name: [
        'product_name', 'productname', 'product', 'name', 'medicine_name', 
        'medicine_name', 'medicine', 'brand_name', 'brand', 'drug_name', 
        'drug', 'item_name', 'item', 'medicine_name', 'product_title'
      ],
      manufacturer: [
        'manufacturer', 'manuf', 'company', 'company_name', 'brand_company',
        'producer', 'maker', 'supplier', 'vendor', 'pharma_company'
      ],
      mrp: [
        'mrp', 'max_retail_price', 'retail_price', 'price', 'selling_price',
        'cost', 'unit_price', 'rate', 'amount'
      ],
      batch: [
        'batch', 'batch_number', 'batch_no', 'lot', 'lot_number',
        'batch_id', 'batch_code', 'serial'
      ],
      expiry: [
        'expiry', 'expiry_date', 'expire', 'expiration', 'exp_date',
        'valid_until', 'valid_till', 'use_by', 'best_before'
      ]
    };

    // Find mapped columns
    const columnMapping: { [key: string]: string } = {};
    const warnings: string[] = [];
    const missingColumns: string[] = [];

    // Check each field
    Object.entries(fieldMappings).forEach(([field, variations]) => {
      const mappedColumn = findMappedColumn(field, variations);
      if (mappedColumn) {
        columnMapping[field] = mappedColumn;
      } else {
        if (field === 'product_name') {
          missingColumns.push('Product Name (required)');
        } else {
          warnings.push(`${field.replace('_', ' ')} column not found`);
        }
      }
    });

    // Check for duplicate mappings
    const mappedColumns = Object.values(columnMapping);
    const duplicates = mappedColumns.filter((col, index) => mappedColumns.indexOf(col) !== index);
    if (duplicates.length > 0) {
      warnings.push(`Duplicate column mappings detected: ${duplicates.join(', ')}`);
    }

    return {
      isValid: columnMapping.product_name !== undefined,
      missingColumns,
      columnMapping,
      warnings
    };
  };

  // File parsing function - CSV only with column validation
  const parseFile = (file: File) => {
    try {
      if (file.type === 'text/csv' || 
          file.type === 'application/csv' ||
          file.name.toLowerCase().endsWith('.csv')) {
        // Basic file validation - parsing done on backend
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          alert('File too large. Please use files smaller than 10MB.');
          setUploadStatus('error');
          return;
        }
        
        // Parse CSV to get headers for validation
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const csvText = e.target?.result as string;
            const lines = csvText.split('\n').filter(line => line.trim());
            if (lines.length > 0) {
              const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
              const validation = validateCSVColumns(headers);
              
              setHeaders(headers);
              setColumnValidation(validation);
              
              // Parse the actual CSV data for preview
              const dataRows = lines.slice(1).map(line => {
                const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
                const row: any = {};
                headers.forEach((header, index) => {
                  row[header] = values[index] || '';
                });
                return row;
              }).slice(0, 5); // Show first 5 rows for preview
              
              if (validation.isValid) {
                setPreviewRows(dataRows);
              } else {
                // Show validation error but still display the data
                // Add a validation message as the first row
                setPreviewRows([{
                  message: `⚠ Missing required columns: ${validation.missingColumns.join(', ')}`
                }, ...dataRows]);
              }
            } else {
              setHeaders(['Invalid CSV file']);
              setPreviewRows([{ message: 'No data found in CSV file' }]);
            }
          } catch (error) {
            console.error('CSV parsing error:', error);
            setHeaders(['Error parsing CSV']);
            setPreviewRows([{ message: 'Failed to parse CSV file' }]);
          }
        };
        reader.readAsText(file);
      } else {
        // Unsupported file type
        alert('Unsupported file type. Please upload a CSV file.');
        setUploadStatus('error');
      }
    } catch (error) {
      console.error('File parsing error:', error);
      alert('Failed to process file. Please check the file format.');
      setUploadStatus('error');
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      clearFileData();
      return;
    }
    
    // Validate file type - CSV only
    const validTypes = ['text/csv', 'application/csv'];
    const validExtensions = ['.csv'];
    const hasValidType = validTypes.includes(file.type) || validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!hasValidType) {
      alert('Please select a valid CSV file (.csv)');
      e.target.value = ''; // Clear the input
      return;
    }
    
    setSelectedFile(file);
    setUploadStatus('idle');
    parseFile(file);
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      
      // Use same validation as file input
      const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      const validExtensions = ['.csv', '.xlsx', '.xls'];
      const hasValidType = validTypes.includes(file.type) || validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
      
      if (hasValidType) {
        setSelectedFile(file);
        setUploadStatus('idle');
        parseFile(file);
      } else {
        alert('Please drop a valid CSV or Excel file (.csv, .xlsx)');
      }
    }
  };

  // Clear file data
  const clearFileData = () => {
    setSelectedFile(null);
    setHeaders([]);
    setPreviewRows([]);
    setUploadStatus('idle');
    setColumnValidation({ 
      isValid: false, 
      missingColumns: [],
      columnMapping: {},
      warnings: []
    });
    // Clear the file input value to allow re-selecting the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Template data for download (from InventoryUpload)
  const templateData = [
    {
      product_name: 'Azee 500mg Tablet',
      manufacturer: 'Cipla Ltd',
      mrp: '25.50',
      batch: 'BATCH001',
      expiry: '2025-12-31'
    },
    {
      product_name: 'Paracetamol 650mg',
      manufacturer: 'Generic Pharma',
      mrp: '',
      batch: 'BATCH002',
      expiry: ''
    },
    {
      product_name: 'Crocin 500mg Tablet',
      manufacturer: 'Glaxo SmithKline',
      mrp: '45.00',
      batch: 'BATCH003',
      expiry: '2026-01-15'
    },
    {
      product_name: 'Augmentin 625 Duo Tablet',
      manufacturer: 'Glaxo SmithKline',
      mrp: '',
      batch: 'BATCH004',
      expiry: ''
    },
    {
      product_name: 'Allegra 120mg Tablet',
      manufacturer: 'Sanofi India Ltd',
      mrp: '120.00',
      batch: 'BATCH005',
      expiry: '2025-11-30'
    }
  ];

  const handleSampleFile = () => {
    // Create CSV content with sample data
    const headers = ['product_name', 'manufacturer', 'mrp', 'batch', 'expiry'];
    const csvContent = [
      headers.join(','),
      ...templateData.map(row => 
        headers.map(header => `"${row[header as keyof typeof row] || ''}"`).join(',')
      )
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'inventory-template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearInventory = () => {
    if (!user?.id) return;
    setShowClearModal(true);
  };

  const handleConfirmClear = (_deleteActiveBids: boolean) => {
    if (!user?.id) return;
    
    // COMMENTED OUT: Always pass false since delete active bids checkbox is disabled
    const shouldDeleteActiveBids = false; // deleteActiveBids;
    
    clearInventoryMutation.mutate(
      { userId: user.id, deleteActiveBids: shouldDeleteActiveBids },
      {
        onSuccess: (data) => {
          setShowClearModal(false);
          const message = shouldDeleteActiveBids && data.deletedBids > 0
            ? `Inventory cleared successfully! Removed ${data.deletedProducts} products and deleted ${data.deletedBids} active bids.`
            : `Inventory cleared successfully! Removed ${data.deletedProducts} products.`;
          alert(message);
          
          // Invalidate stats to refresh inventory count
          queryClient.invalidateQueries({ queryKey: ['stats'] });
          // Invalidate submitted bids to refresh the history
          queryClient.invalidateQueries({ queryKey: ['submitted-bids'] });
        },
        onError: (error: any) => {
          console.error('Failed to clear inventory:', error);
          alert('Failed to clear inventory. Please try again.');
        },
      }
    );
  };

  // Check if user has any active bids
  const hasActiveBids = Array.isArray(submittedBids) && submittedBids.some((bid: any) => bid.status === 'PENDING') || false;

  const handleClearUploadHistory = () => {
    if (!user?.id) return;
    if (!uploadHistory.length) return;
    const confirm = window.confirm('Delete past uploads history? This only clears local history on this device.');
    if (!confirm) return;
    const userSpecificKey = `inventory-upload-history-${user.id}`;
    localStorage.removeItem(userSpecificKey);
    setUploadHistory([]);
  };


  // Handle upload
  const handleUpload = () => {
    if (selectedFile && user) {
      uploadMutation.mutate(
        { file: selectedFile, userId: user.id },
        {
          onSuccess: (data) => {
            // Add to upload history with processing results
            const newEntry: UploadHistoryEntry = {
              id: Date.now().toString(),
              fileName: selectedFile.name,
              timestamp: new Date(),
              rowCount: data?.totalProcessed || 0,
              status: 'success',
              processingResults: {
                totalProcessed: data?.totalProcessed || 0,
                matchedCount: data?.matchedCount || 0,
                notFoundCount: data?.notFoundCount || 0,
              }
            };
            
            setUploadHistory(prev => [newEntry, ...prev]);
            
            // Clear the form and return to upload state
            clearFileData();
            
            // Show brief success message then clear
            setUploadStatus('success');
            
            // Invalidate stats to refresh inventory count
            queryClient.invalidateQueries({ queryKey: ['stats'] });
            
            setTimeout(() => {
              setUploadStatus('idle');
            }, 2000);
          },
          onError: (error) => {
            console.error('Upload failed:', error);
            setUploadStatus('error');
            
            // Add failed upload to history
            if (selectedFile) {
              const failedEntry: UploadHistoryEntry = {
                id: Date.now().toString(),
                fileName: selectedFile.name,
                timestamp: new Date(),
                rowCount: previewRows.length,
                status: 'error'
              };
              setUploadHistory(prev => [failedEntry, ...prev]);
            }
          },
        },
      );
    }
  };


  // Column validation state
  const [columnValidation, setColumnValidation] = useState<{ 
    isValid: boolean; 
    missingColumns: string[];
    columnMapping: { [key: string]: string };
    warnings: string[];
  }>({ 
    isValid: false, 
    missingColumns: [],
    columnMapping: {},
    warnings: []
  });

  // Simplified validation - server handles column mapping
  const isCSVFile = selectedFile && (
    selectedFile.type === 'text/csv' || 
    selectedFile.type === 'application/csv' ||
    selectedFile.name.toLowerCase().endsWith('.csv')
  );

  // Check if upload should be enabled
  const canUpload = isCSVFile && columnValidation.isValid && !uploadMutation.isPending;

  return (
    <div className="inventory-view h-full overflow-y-auto max-w-full">
      {/* File Upload Section */}
      <div className="upload-section">
        <div className="upload-card">
          <div className="upload-header">
            <div className="flex items-center justify-between mb-2">
              <h3>Upload Inventory File</h3>
              <div className="flex items-center gap-2">
                {/* Sample File Dropdown */}
                <div className="relative sample-dropdown-container">
                  <button 
                    onClick={() => setShowSampleDropdown(!showSampleDropdown)}
                    className="btn-outline flex items-center gap-2 text-sm py-2 px-3"
                  >
                    <FileText size={14} />
                    <span className="hidden sm:inline">Download Sample</span>
                    <span className="sm:hidden">Sample</span>
                  </button>
                  {showSampleDropdown && (
                    <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <button 
                        onClick={() => {
                          handleSampleFile();
                          setShowSampleDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        📄 Download CSV Template
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Clear Inventory Button */}
                <button 
                  onClick={handleClearInventory}
                  disabled={clearInventoryMutation.isPending}
                  className="btn-danger flex items-center gap-2 text-sm py-2 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {clearInventoryMutation.isPending ? (
                    <div className="loading-spinner small"></div>
                  ) : (
                    <X size={14} />
                  )}
                  <span className="hidden sm:inline">
                    {clearInventoryMutation.isPending ? 'Clearing...' : 'Clear Inventory'}
                  </span>
                  <span className="sm:hidden">
                    {clearInventoryMutation.isPending ? 'Clearing...' : 'Clear'}
                  </span>
                </button>
              </div>
            </div>
            <p>Drag and drop your file or click to browse</p>
          </div>

          <div 
            className={`upload-dropzone ${isDragOver ? 'drag-over' : ''} ${selectedFile ? 'has-file' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              id="inventory-file"
              name="inventory-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="file-input"
            />
            
            {!selectedFile ? (
              <label htmlFor="inventory-file" className="upload-content">
                <Upload size={48} className="upload-icon" />
                <div className="upload-text">
                  <strong>Choose a file or drag it here</strong>
                  <span>Support for CSV (.csv) files only</span>
                </div>
              </label>
            ) : (
              <div className="file-selected">
                <FileText size={48} className="file-icon" />
                <div className="file-info">
                  <strong>{selectedFile.name}</strong>
                  <span>{(selectedFile.size / 1024).toFixed(1)} KB</span>
                </div>
                <button onClick={clearFileData} className="remove-file">
                  <X size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* File Preview */}
      {headers.length > 0 && (
        <div className="preview-section">
          <div className="preview-header">
            <h3>File Preview</h3>
            <div className="preview-info">
              <span className="preview-count">First {Math.min(previewRows.filter(row => !row.message).length, 5)} rows</span>
              {canUpload ? (
                <span className="status-badge success">
                  <CheckCircle size={16} />
                  Valid Structure
                </span>
              ) : !isCSVFile ? (
                <span className="status-badge error">
                  <AlertCircle size={16} />
                  Invalid File Type
                </span>
              ) : !columnValidation.isValid ? (
                <span className="status-badge error">
                  <AlertCircle size={16} />
                  Missing Required Columns
                </span>
              ) : (
                <span className="status-badge warning">
                  <AlertCircle size={16} />
                  Processing...
                </span>
              )}
            </div>
          </div>

          {/* Column Mapping Information */}
          {Object.keys(columnValidation.columnMapping).length > 0 && (
            <div className="column-mapping-section">
              <h4>Column Mapping</h4>
              <div className="mapping-grid">
                {Object.entries(columnValidation.columnMapping).map(([field, column]) => (
                  <div key={field} className="mapping-item">
                    <span className="field-name">{field.replace('_', ' ')}</span>
                    <span className="mapping-arrow">→</span>
                    <span className="column-name">{column}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Validation Warnings */}
          {columnValidation.warnings.length > 0 && (
            <div className="validation-warnings">
              <h4>Warnings</h4>
              <ul>
                {columnValidation.warnings.map((warning, index) => (
                  <li key={index} className="warning-item">
                    <span className="warning-icon">⚠</span>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="preview-table-container">
              <table className="preview-table">
                <thead>
                  <tr>
                    {headers.map((header) => {
                      const mappedField = Object.entries(columnValidation.columnMapping).find(([_, col]) => col === header);
                      return (
                        <th key={header} className={mappedField ? 'mapped-column' : 'unmapped-column'}>
                          <span className="header-text">{header}</span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, rowIndex) => {
                    // Handle message rows (validation errors)
                    if (row.message) {
                      return (
                        <tr key={`message-${rowIndex}`} className="validation-message-row">
                          <td colSpan={headers.length} className="validation-message">
                            <div className="cell-content">
                              <span className="validation-text">{row.message}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                    
                    // Handle data rows
                    return (
                      <tr key={`row-${rowIndex}-${JSON.stringify(row).slice(0, 50)}`}>
                        {headers.map((header) => (
                          <td key={`${header}-${rowIndex}`}>
                            <div className="cell-content">
                              {row[header] || <span className="empty-cell">—</span>}
                            </div>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
        </div>
      )}

      {/* Upload Actions */}
      {selectedFile && (
        <div className="upload-actions">
          <div className="actions-content">
            {/* Warning message about replacement behavior */}
            <div className="upload-warning">
              <div className="warning-icon">
                <AlertTriangle size={16} />
              </div>
              <div className="warning-content">
                <span className="warning-title">Important:</span>
                <span className="warning-text">This upload will replace your existing inventory. Previous inventory data will be removed.</span>
              </div>
            </div>
            
            <button 
              onClick={handleUpload} 
              disabled={!canUpload}
              className="btn-primary upload-btn"
            >
              {uploadMutation.isPending ? (
                <>
                  <div className="loading-spinner small"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Upload Inventory
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {uploadStatus === 'success' && (
        <div className="status-message success">
          <CheckCircle size={20} />
          <span>Upload completed successfully!</span>
        </div>
      )}
      
      {uploadStatus === 'error' && (
        <div className="status-message error">
          <AlertCircle size={20} />
          <span>Upload failed. Please check your file and try again.</span>
        </div>
      )}

      {/* Upload History */}
      {uploadHistory.length > 0 && (
        <div className="upload-history bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Past Uploads</h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{uploadHistory.length} upload{uploadHistory.length !== 1 ? 's' : ''}</span>
              <button
                onClick={handleClearUploadHistory}
                className="btn-danger flex items-center gap-1 px-3 py-1 text-sm"
                disabled={!uploadHistory.length}
                title="Clear local upload history"
              >
                <Trash size={14} />
                Clear History
              </button>
            </div>
          </div>
          <div className="history-list space-y-3">
            {uploadHistory.map((entry) => {
              const itemId = `history-${entry.id}`;
              const isExpanded = expandedItem === itemId;
              
              return (
                <div key={entry.id} className={`history-item bg-gray-50 rounded-lg border transition-all duration-200 hover:shadow-md ${entry.status === 'success' ? 'border-green-200' : 'border-red-200'}`}>
                  <div 
                    className="history-header p-4 cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                    onClick={() => toggleExpanded(itemId)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="file-name font-medium text-gray-900">{entry.fileName}</span>
                          <span className="row-count text-sm text-gray-600 bg-gray-200 px-2 py-1 rounded-full">{entry.rowCount} rows</span>
                        </div>
                        <div className="history-meta">
                          <span className="timestamp text-sm text-gray-500">
                            {entry.timestamp.toLocaleDateString()} at {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <div className="history-actions flex items-center gap-2">
                        {entry.status === 'success' ? (
                          <CheckCircle size={20} className="text-green-500" />
                        ) : (
                          <AlertCircle size={20} className="text-red-500" />
                        )}
                        <button className="expand-btn p-1 hover:bg-gray-200 rounded transition-colors duration-150">
                          {isExpanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="history-preview px-4 pb-4 border-t border-gray-200">
                      {entry.processingResults ? (
                        <div className="processing-results pt-4">
                          <div className="results-header mb-4">
                            <h4 className="text-lg font-medium text-gray-900 mb-1">Processing Results</h4>
                            <span className="results-subtitle text-sm text-gray-600">What happened to your data</span>
                          </div>
                          
                          <div className="results-grid grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="result-item bg-white p-4 rounded-lg border border-gray-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Package size={16} className="text-blue-500" />
                                <span className="text-sm font-medium text-gray-700">Total Processed</span>
                              </div>
                              <span className="text-2xl font-bold text-gray-900">{entry.processingResults.totalProcessed}</span>
                            </div>
                            
                            <div className="result-item bg-white p-4 rounded-lg border border-gray-200">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle size={16} className="text-green-500" />
                                <span className="text-sm font-medium text-gray-700">Successfully Matched</span>
                              </div>
                              <span className="text-2xl font-bold text-green-600">{entry.processingResults.matchedCount}</span>
                            </div>
                            
                            <div className="result-item bg-white p-4 rounded-lg border border-gray-200">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle size={16} className="text-orange-500" />
                                <span className="text-sm font-medium text-gray-700">Unidentified Products</span>
                              </div>
                              <span className="text-2xl font-bold text-orange-600">{entry.processingResults.notFoundCount}</span>
                            </div>
                          </div>
                          
                          <div className="results-summary mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              {entry.processingResults.matchedCount > 0 ? (
                                <>
                                  <strong>{entry.processingResults.matchedCount}</strong> products were successfully added to your inventory.
                                  {entry.processingResults.notFoundCount > 0 && (
                                    <> <strong>{entry.processingResults.notFoundCount}</strong> products couldn't be matched and were logged for review.</>
                                  )}
                                </>
                              ) : (
                                <>
                                  No products were matched. This might be because the product names don't match existing products in our database.
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-4">
                          <p className="text-gray-600 text-sm">
                            {entry.status === 'success' 
                              ? 'Upload completed successfully' 
                              : 'Upload failed - please check your file format and try again'
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Clear Inventory Modal */}
      <ClearInventoryModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleConfirmClear}
        hasActiveBids={hasActiveBids}
        isClearing={clearInventoryMutation.isPending}
      />
      
      {/* Styles for mapped column indicators and compact table */}
      <style>{`
        .inventory-view {
          height: 100%;
          padding: 1rem;
          box-sizing: border-box;
          overflow-x: hidden;
        }
        
        .mapped-as {
          color: #10b981;
          font-size: 0.875rem;
          font-weight: 500;
          margin-left: 0.5rem;
        }
        
        .mapped-from {
          color: #6b7280;
          font-size: 0.75rem;
          font-weight: 400;
          margin-left: 0.25rem;
        }
        
        .preview-section {
          margin-top: 1rem;
          overflow: hidden;
        }
        
        .preview-table-container {
          overflow-x: auto;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          background: white;
          margin-top: 1rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        }
        
        .preview-header {
          flex-shrink: 0;
          margin-bottom: 1rem;
        }
        
        .preview-table {
          min-width: 500px;
          border-collapse: collapse;
          font-size: 0.75rem;
          line-height: 1.2;
          table-layout: fixed;
        }
        
        .preview-table th {
          background-color: #f9fafb;
          border-right: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
          padding: 0.375rem 0.5rem;
          text-align: left;
          font-weight: 600;
          color: #374151;
          white-space: nowrap;
          width: 120px;
          max-width: 120px;
        }
        
        .preview-table th.required {
          background-color: #fef2f2;
          color: #dc2626;
        }
        
        .preview-table th.optional {
          background-color: #f0f9ff;
          color: #0369a1;
        }
        
        .preview-table td {
          border-right: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
          padding: 0.25rem 0.5rem;
          white-space: nowrap;
          width: 120px;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .preview-table tr:hover {
          background-color: #f9fafb;
        }
        
        .preview-table tr:hover td {
          background-color: #f9fafb;
        }
        
        .header-content {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          flex-wrap: nowrap;
        }
        
        .header-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .cell-content {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }
        
        .empty-cell {
          color: #9ca3af;
          font-style: italic;
        }
        
        .required-indicator {
          color: #dc2626;
          font-weight: bold;
          margin-left: 0.125rem;
        }
        
        /* Enhanced scrollbar styling */
        .preview-table-container::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }
        
        .preview-table-container::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 6px;
        }
        
        .preview-table-container::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 6px;
          border: 2px solid #f1f5f9;
        }
        
        .preview-table-container::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        .preview-table-container::-webkit-scrollbar-corner {
          background: #f1f5f9;
        }
        
        /* Firefox scrollbar styling */
        .preview-table-container {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }
        
        /* Column mapping styles */
        .column-mapping-section {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 1rem;
          margin-bottom: 1rem;
        }
        
        .column-mapping-section h4 {
          color: #1e293b;
          font-size: 0.875rem;
          font-weight: 600;
          margin: 0 0 0.75rem 0;
        }
        
        .mapping-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.5rem;
        }
        
        .mapping-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          font-size: 0.75rem;
        }
        
        .field-name {
          color: #059669;
          font-weight: 600;
          text-transform: capitalize;
        }
        
        .mapping-arrow {
          color: #64748b;
          font-weight: bold;
        }
        
        .column-name {
          color: #1e293b;
          font-weight: 500;
          background: #f1f5f9;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
        }
        
        /* Validation warnings styles */
        .validation-warnings {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 0.5rem;
          padding: 1rem;
          margin-bottom: 1rem;
        }
        
        .validation-warnings h4 {
          color: #92400e;
          font-size: 0.875rem;
          font-weight: 600;
          margin: 0 0 0.75rem 0;
        }
        
        .validation-warnings ul {
          margin: 0;
          padding: 0;
          list-style: none;
        }
        
        .warning-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.375rem 0;
          font-size: 0.75rem;
          color: #92400e;
        }
        
        .warning-icon {
          color: #f59e0b;
          font-weight: bold;
        }
        
        /* Enhanced table header styles */
        .mapped-column {
          background-color: #f0fdf4 !important;
          border-left: 3px solid #22c55e !important;
        }
        
        .unmapped-column {
          background-color: #fef2f2 !important;
          border-left: 3px solid #ef4444 !important;
        }
        
        .mapping-badge {
          display: inline-block;
          background: #22c55e;
          color: white;
          font-size: 0.625rem;
          font-weight: 600;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          margin-left: 0.5rem;
          text-transform: capitalize;
        }
        
        .validation-message-row {
          background-color: #fef2f2;
        }
        
        .validation-message {
          text-align: center;
          padding: 0.75rem !important;
        }
        
        .validation-text {
          color: #dc2626;
          font-weight: 600;
          font-size: 0.875rem;
        }
        
        /* Upload warning styles */
        .upload-warning {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 0.5rem;
          padding: 0.75rem;
          margin-bottom: 1rem;
        }
        
        .warning-icon {
          color: #f59e0b;
          flex-shrink: 0;
          margin-top: 0.125rem;
        }
        
        .warning-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .warning-title {
          font-weight: 600;
          color: #92400e;
          font-size: 0.875rem;
        }
        
        .warning-text {
          color: #92400e;
          font-size: 0.875rem;
          line-height: 1.4;
        }
        
        /* Replacement warning styles */
        .replacement-warning {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 0.375rem;
          padding: 0.5rem 0.75rem;
          margin-top: 0.75rem;
          font-size: 0.75rem;
          color: #92400e;
          font-weight: 500;
        }
        
        .replacement-warning svg {
          color: #f59e0b;
          flex-shrink: 0;
        }
        
        /* Ensure no horizontal expansion beyond viewport */
        @media (max-width: 768px) {
          .preview-table {
            min-width: 400px;
          }
          
          .preview-table th,
          .preview-table td {
            width: 100px;
            max-width: 100px;
          }
          
          .mapping-grid {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 480px) {
          .preview-table {
            min-width: 300px;
          }
          
          .preview-table th,
          .preview-table td {
            width: 80px;
            max-width: 80px;
          }
        }
      `}</style>
    </div>
  );
};