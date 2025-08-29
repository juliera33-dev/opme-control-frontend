import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  FileText, 
  Search, 
  Download,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { 
  formatCNPJ, 
  formatDate, 
  getOperationLabel, 
  getOperationColor,
  truncateText 
} from '@/lib/utils'

export default function NotasFiscais() {
  const [notas, setNotas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filtros, setFiltros] = useState({
    tipo_operacao: '',
    cliente_cnpj: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    pages: 0,
    has_next: false,
    has_prev: false
  })

  useEffect(() => {
    buscarNotas()
  }, [])

  const buscarNotas = async (filtrosCustom = filtros, page = pagination.page) => {
    try {
      setLoading(true)
      setError(null)

      const params = {
        page,
        per_page: pagination.per_page,
        ...filtrosCustom
      }

      // Remove parâmetros vazios
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key]
      })

      const response = await apiClient.getNotasFiscais(params)
      
      setNotas(response.data)
      setPagination(response.pagination)
    } catch (err) {
      setError(err.message)
      setNotas([])
    } finally {
      setLoading(false)
    }
  }

  const handleFiltroChange = (campo, valor) => {
    const novosFiltros = {
      ...filtros,
      [campo]: valor
    }
    setFiltros(novosFiltros)
    buscarNotas(novosFiltros, 1)
  }

  const limparFiltros = () => {
    const filtrosLimpos = {
      tipo_operacao: '',
      cliente_cnpj: ''
    }
    setFiltros(filtrosLimpos)
    buscarNotas(filtrosLimpos, 1)
  }

  const irParaPagina = (page) => {
    buscarNotas(filtros, page)
  }

  const downloadXML = async (notaId, numeroNota) => {
    try {
      const response = await apiClient.getXMLNotaFiscal(notaId)
      
      // Cria um blob com o conteúdo XML
      const blob = new Blob([response.data.xml_content], { type: 'application/xml' })
      const url = window.URL.createObjectURL(blob)
      
      // Cria um link temporário para download
      const link = document.createElement('a')
      link.href = url
      link.download = `NF_${numeroNota}_${response.data.serie}.xml`
      document.body.appendChild(link)
      link.click()
      
      // Limpa o link temporário
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Erro ao baixar XML: ' + err.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Notas Fiscais</h1>
        <p className="text-gray-600">Visualize e gerencie as notas fiscais processadas</p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Tipo de Operação
              </label>
              <Select 
                value={filtros.tipo_operacao} 
                onValueChange={(value) => handleFiltroChange('tipo_operacao', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os tipos</SelectItem>
                  <SelectItem value="saida">Saída para Consignação</SelectItem>
                  <SelectItem value="retorno">Retorno de Consignação</SelectItem>
                  <SelectItem value="simbolico">Retorno Simbólico</SelectItem>
                  <SelectItem value="faturamento">Faturamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                CNPJ/CPF do Cliente
              </label>
              <Input
                placeholder="Digite o CNPJ ou CPF..."
                value={filtros.cliente_cnpj}
                onChange={(e) => handleFiltroChange('cliente_cnpj', e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={limparFiltros}>
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Notas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Notas Fiscais</span>
            </div>
            {pagination.total > 0 && (
              <Badge variant="secondary">
                {pagination.total} nota{pagination.total !== 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Carregando...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span>Erro: {error}</span>
            </div>
          ) : notas.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <FileText className="h-8 w-8 mr-2" />
              <span>Nenhuma nota fiscal encontrada</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número/Série</TableHead>
                      <TableHead>Data Emissão</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>CFOP</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Itens</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notas.map((nota) => (
                      <TableRow key={nota.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">
                              {nota.numero}/{nota.serie}
                            </div>
                            <div className="text-xs text-gray-500 font-mono">
                              {nota.chave_acesso.substring(0, 8)}...
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDate(nota.data_emissao)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">
                              {truncateText(nota.destinatario_nome, 25)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatCNPJ(nota.destinatario_cnpj)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">
                            {nota.cfop}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={getOperationColor(nota.tipo_operacao)}>
                            {getOperationLabel(nota.tipo_operacao)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {nota.itens?.length || 0} item{(nota.itens?.length || 0) !== 1 ? 's' : ''}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadXML(nota.id, nota.numero)}
                              title="Baixar XML"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Paginação */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Página {pagination.page} de {pagination.pages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => irParaPagina(pagination.page - 1)}
                      disabled={!pagination.has_prev}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => irParaPagina(pagination.page + 1)}
                      disabled={!pagination.has_next}
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

