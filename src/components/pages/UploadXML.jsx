import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  X
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { getOperationLabel, getOperationColor } from '@/lib/utils'

export default function UploadXML() {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState([])
  const fileInputRef = useRef(null)

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files)
    const xmlFiles = selectedFiles.filter(file => 
      file.name.toLowerCase().endsWith('.xml')
    )
    
    if (xmlFiles.length !== selectedFiles.length) {
      alert('Apenas arquivos XML são aceitos')
    }
    
    setFiles(prev => [...prev, ...xmlFiles])
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    if (files.length === 0) return

    setUploading(true)
    setResults([])

    const uploadResults = []

    for (const file of files) {
      try {
        const result = await apiClient.uploadXML(file)
        uploadResults.push({
          fileName: file.name,
          success: true,
          data: result.data,
          message: result.message
        })
      } catch (error) {
        uploadResults.push({
          fileName: file.name,
          success: false,
          error: error.message
        })
      }
    }

    setResults(uploadResults)
    setUploading(false)
    setFiles([])
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload de XML</h1>
        <p className="text-gray-600">Faça upload de arquivos XML de notas fiscais para processamento</p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Selecionar Arquivos XML</span>
          </CardTitle>
          <CardDescription>
            Selecione um ou mais arquivos XML de notas fiscais para processamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Drag and Drop Area */}
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault()
                e.currentTarget.classList.add('border-blue-400', 'bg-blue-50')
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50')
              }}
              onDrop={(e) => {
                e.preventDefault()
                e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50')
                const droppedFiles = Array.from(e.dataTransfer.files)
                const xmlFiles = droppedFiles.filter(file => 
                  file.name.toLowerCase().endsWith('.xml')
                )
                if (xmlFiles.length > 0) {
                  setFiles(prev => [...prev, ...xmlFiles])
                }
              }}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Clique para selecionar ou arraste arquivos aqui
              </p>
              <p className="text-sm text-gray-500">
                Apenas arquivos XML são aceitos
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".xml"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Selected Files */}
            {files.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">Arquivos Selecionados:</h3>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="font-medium text-gray-900">{file.name}</div>
                          <div className="text-sm text-gray-500">{formatFileSize(file.size)}</div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={uploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            <div className="flex justify-end">
              <Button
                onClick={uploadFiles}
                disabled={files.length === 0 || uploading}
                className="min-w-32"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Processar Arquivos
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Resultados do Processamento</span>
            </CardTitle>
            <CardDescription>
              Resultados do processamento dos arquivos XML
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {result.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{result.fileName}</div>
                        {result.success ? (
                          <div className="text-sm text-green-600">{result.message}</div>
                        ) : (
                          <div className="text-sm text-red-600">{result.error}</div>
                        )}
                      </div>
                    </div>
                    {result.success && (
                      <Badge className={getOperationColor(result.data.tipo_operacao)}>
                        {getOperationLabel(result.data.tipo_operacao)}
                      </Badge>
                    )}
                  </div>

                  {result.success && result.data && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 p-3 bg-gray-50 rounded">
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase">Nota Fiscal</div>
                        <div className="text-sm text-gray-900">ID: {result.data.nota_fiscal_id}</div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase">Tipo</div>
                        <div className="text-sm text-gray-900">{getOperationLabel(result.data.tipo_operacao)}</div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase">Itens Processados</div>
                        <div className="text-sm text-gray-900">{result.data.itens_processados}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Resumo do Processamento</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Total de arquivos:</span>
                  <span className="ml-2 font-medium">{results.length}</span>
                </div>
                <div>
                  <span className="text-green-700">Sucessos:</span>
                  <span className="ml-2 font-medium">{results.filter(r => r.success).length}</span>
                </div>
                <div>
                  <span className="text-red-700">Erros:</span>
                  <span className="ml-2 font-medium">{results.filter(r => !r.success).length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instruções</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Selecione arquivos XML de notas fiscais válidas</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>O sistema processa automaticamente os CFOPs: 5917/6917 (saída), 1918/2918 (retorno), 1919/2919 (simbólico), 5114/6114 (faturamento)</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Os saldos são atualizados automaticamente após o processamento</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Arquivos duplicados (mesma chave de acesso) são rejeitados</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

