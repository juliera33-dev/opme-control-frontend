import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Package, 
  Users, 
  FileText, 
  AlertTriangle,
  TrendingUp,
  Activity
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { formatNumber, getSaldoStatus } from '@/lib/utils'

export default function Dashboard() {
  const [resumo, setResumo] = useState(null)
  const [estatisticas, setEstatisticas] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setLoading(true)
      setError(null)

      const [resumoData, estatisticasData] = await Promise.all([
        apiClient.getResumoSaldos(),
        apiClient.getEstatisticas()
      ])

      setResumo(resumoData.data)
      setEstatisticas(estatisticasData.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral do controle de materiais OPME</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral do controle de materiais OPME</p>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span>Erro ao carregar dados: {error}</span>
            </div>
            <Button 
              onClick={carregarDados} 
              variant="outline" 
              className="mt-4"
            >
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const cards = [
    {
      title: 'Total de Clientes',
      value: resumo?.total_clientes || 0,
      description: 'Clientes com materiais em consignação',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Produtos em Consignação',
      value: resumo?.total_produtos || 0,
      description: 'Diferentes produtos controlados',
      icon: Package,
      color: 'text-green-600'
    },
    {
      title: 'Saldos Pendentes',
      value: resumo?.saldos_pendentes || 0,
      description: 'Materiais ainda não retornados',
      icon: Activity,
      color: 'text-yellow-600'
    },
    {
      title: 'Notas Fiscais',
      value: resumo?.total_nfs_processadas || 0,
      description: 'Total de NFs processadas',
      icon: FileText,
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral do controle de materiais OPME</p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber(card.value, 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Saldos críticos */}
      {resumo?.saldos_criticos && resumo.saldos_criticos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Saldos Críticos</span>
            </CardTitle>
            <CardDescription>
              Materiais com estoque baixo (≤ 5 unidades)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {resumo.saldos_criticos.map((saldo, index) => {
                const status = getSaldoStatus(saldo.saldo_disponivel)
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {saldo.codigo_produto} - {saldo.descricao_produto}
                      </div>
                      <div className="text-sm text-gray-500">
                        Cliente: {saldo.cliente_nome} | Lote: {saldo.numero_lote}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={status.color}>
                        {formatNumber(saldo.saldo_disponivel, 0)} unidades
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas por operação */}
      {estatisticas?.por_operacao && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <span>Operações por Tipo</span>
              </CardTitle>
              <CardDescription>
                Distribuição das notas fiscais por tipo de operação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {estatisticas.por_operacao.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {item.tipo === 'saida' && 'Saída para Consignação'}
                      {item.tipo === 'retorno' && 'Retorno de Consignação'}
                      {item.tipo === 'simbolico' && 'Retorno Simbólico'}
                      {item.tipo === 'faturamento' && 'Faturamento'}
                      {item.tipo === 'outros' && 'Outros'}
                    </span>
                    <Badge variant="secondary">
                      {formatNumber(item.total, 0)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-500" />
                <span>Top Clientes</span>
              </CardTitle>
              <CardDescription>
                Clientes com maior movimentação de NFs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {estatisticas.top_clientes?.slice(0, 5).map((cliente, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {cliente.nome}
                      </div>
                      <div className="text-xs text-gray-500">
                        CNPJ: {cliente.cnpj}
                      </div>
                    </div>
                    <Badge variant="outline">
                      {formatNumber(cliente.total_nfs, 0)} NFs
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ações rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesse rapidamente as principais funcionalidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col space-y-2"
              onClick={() => window.location.href = '/saldos'}
            >
              <Package className="h-6 w-6" />
              <span>Consultar Saldos</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col space-y-2"
              onClick={() => window.location.href = '/upload-xml'}
            >
              <FileText className="h-6 w-6" />
              <span>Upload XML</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col space-y-2"
              onClick={() => window.location.href = '/sincronizar'}
            >
              <Activity className="h-6 w-6" />
              <span>Sincronizar Mainô</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

