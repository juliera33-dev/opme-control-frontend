import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Search, 
  Package, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { 
  formatCNPJ, 
  formatNumber, 
  getSaldoStatus, 
  debounce,
  truncateText 
} from '@/lib/utils'

export default function ConsultaSaldos() {
  // CORREÇÃO: Inicialize 'saldos' como null para diferenciar do estado "lista vazia"
  const [saldos, setSaldos] = useState(null)
  const [loading, setLoading] = useState(true) // Inicia como true para o carregamento inicial
  const [error, setError] = useState(null)
  const [filtros, setFiltros] = useState({
    cliente_cnpj: '',
    cliente_nome: '',
    codigo_produto: ''
  })
  
  // CORREÇÃO: Inicialize 'pagination' com uma estrutura segura
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    pages: 0,
    has_next: false,
    has_prev: false
  })

  const buscarSaldos = useCallback(async (filtrosCustom = filtros, page = 1) => {
    try {
      setLoading(true)
      setError(null)

      const params = {
        page,
        per_page: pagination.per_page,
        ...filtrosCustom
      }

      Object.keys(params).forEach(key => {
        if (!params[key] || params[key] === '') delete params[key]
      })

      const response = await apiClient.consultarSaldos(params)
      
      // A API pode não retornar a chave 'data' ou 'pagination' se não houver resultados
      setSaldos(response.data || [])
      if (response.pagination) {
        setPagination(response.pagination)
      } else {
        // Reseta a paginação se não vier na resposta
        setPagination({ page: 1, per_page: 20, total: 0, pages: 1, has_next: false, has_prev: false })
      }
    } catch (err) {
      setError(err.message || 'Erro desconhecido')
      setSaldos([])
    } finally {
      setLoading(false)
    }
  }, [pagination.per_page])

  const debouncedSearch = useCallback(
    debounce((filtros) => {
      buscarSaldos(filtros, 1)
    }, 500),
    [buscarSaldos]
  )

  useEffect(() => {
    buscarSaldos({}, 1)
  }, [])

  useEffect(() => {
    debouncedSearch(filtros)
  }, [filtros, debouncedSearch])

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }))
  }

  const limparFiltros = () => {
    setFiltros({
      cliente_cnpj: '',
      cliente_nome: '',
      codigo_produto: ''
    })
  }

  const irParaPagina = (page) => {
    buscarSaldos(filtros, page)
  }

  // O resto do seu JSX (a parte visual) pode permanecer o mesmo,
  // pois as verificações de `loading`, `error` e `saldos.length === 0`
  // já lidam com os diferentes estados.
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Consulta de Saldos</h1>
        <p className="text-gray-600">Consulte os saldos de materiais em consignação</p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Filtros de Busca</span>
          </CardTitle>
          <CardDescription>
            Use os filtros abaixo para encontrar saldos específicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Nome do Cliente
              </label>
              <Input
                placeholder="Digite o nome do cliente..."
                value={filtros.cliente_nome}
                onChange={(e) => handleFiltroChange('cliente_nome', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Código/Descrição do Produto
              </label>
              <Input
                placeholder="Digite o código ou descrição..."
                value={filtros.codigo_produto}
                onChange={(e) => handleFiltroChange('codigo_produto', e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={limparFiltros}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Saldos Encontrados</span>
            </div>
            {pagination && pagination.total > 0 && (
              <Badge variant="secondary">
                {pagination.total} resultado{pagination.total !== 1 ? 's' : ''}
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
          ) : !saldos || saldos.length === 0 ? ( // Verificação mais segura
            <div className="flex items-center justify-center py-8 text-gray-500">
              <Package className="h-8 w-8 mr-2" />
              <span>Nenhum saldo encontrado</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Lote</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {saldos.map((saldo) => {
                      const status = getSaldoStatus(saldo.saldo)
                      return (
                        <TableRow key={`${saldo.cliente_cnpj}-${saldo.codigo_produto}-${saldo.lote}`}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">
                                {truncateText(saldo.nome_cliente, 30)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatCNPJ(saldo.cnpj_cliente)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">
                                {saldo.codigo_produto}
                              </div>
                              <div className="text-sm text-gray-500">
                                {truncateText(saldo.descricao_produto, 40)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm">
                              {saldo.lote}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatNumber(saldo.saldo)}
                          </TableCell>
                          <TableCell>
                            <Badge className={status.color}>
                              {status.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Paginação */}
              {pagination && pagination.pages > 1 && (
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
