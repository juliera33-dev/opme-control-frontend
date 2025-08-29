import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Calendar,
  Wifi,
  WifiOff
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { formatDateForAPI, getOperationLabel, getOperationColor } from '@/lib/utils'

export default function SincronizarMaino() {
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [sincronizando, setSincronizando] = useState(false)
  const [testando, setTestando] = useState(false)
  const [conexaoOk, setConexaoOk] = useState(null)
  const [resultado, setResultado] = useState(null)

  const testarConexao = async () => {
    try {
      setTestando(true)
      const response = await apiClient.testMainoConnection()
      setConexaoOk(response.success)
    } catch (error) {
      setConexaoOk(false)
    } finally {
      setTestando(false)
    }
  }

  const sincronizar = async () => {
    if (!dataInicio || !dataFim) {
      alert('Por favor, informe o período para sincronização')
      return
    }

    try {
      setSincronizando(true)
      setResultado(null)

      const response = await apiClient.syncMaino(
        formatDateForAPI(dataInicio),
        formatDateForAPI(dataFim)
      )

      setResultado(response)
    } catch (error) {
      setResultado({
        success: false,
        error: error.message
      })
    } finally {
      setSincronizando(false)
    }
  }

  const definirPeriodoPadrao = (dias) => {
    const hoje = new Date()
    const inicio = new Date(hoje)
    inicio.setDate(hoje.getDate() - dias)

    setDataInicio(inicio.toISOString().split('T')[0])
    setDataFim(hoje.toISOString().split('T')[0])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sincronizar com Mainô</h1>
        <p className="text-gray-600">Sincronize notas fiscais diretamente da API do Mainô</p>
      </div>

      {/* Teste de Conexão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {conexaoOk === null ? (
              <Wifi className="h-5 w-5 text-gray-500" />
            ) : conexaoOk ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            <span>Conexão com API do Mainô</span>
          </CardTitle>
          <CardDescription>
            Teste a conexão com a API antes de sincronizar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              {conexaoOk === null && (
                <p className="text-gray-600">Clique em "Testar Conexão" para verificar</p>
              )}
              {conexaoOk === true && (
                <p className="text-green-600 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Conexão estabelecida com sucesso
                </p>
              )}
              {conexaoOk === false && (
                <p className="text-red-600 flex items-center">
                  <XCircle className="h-4 w-4 mr-2" />
                  Falha na conexão. Verifique as credenciais
                </p>
              )}
            </div>
            <Button
              variant="outline"
              onClick={testarConexao}
              disabled={testando}
            >
              {testando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  Testando...
                </>
              ) : (
                <>
                  <Wifi className="h-4 w-4 mr-2" />
                  Testar Conexão
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuração da Sincronização */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Período para Sincronização</span>
          </CardTitle>
          <CardDescription>
            Defina o período das notas fiscais que deseja sincronizar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Botões de período rápido */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => definirPeriodoPadrao(7)}
              >
                Últimos 7 dias
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => definirPeriodoPadrao(30)}
              >
                Últimos 30 dias
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => definirPeriodoPadrao(90)}
              >
                Últimos 90 dias
              </Button>
            </div>

            {/* Seleção manual de datas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Data Início
                </label>
                <Input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Data Fim
                </label>
                <Input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                />
              </div>
            </div>

            {/* Botão de sincronização */}
            <div className="flex justify-end">
              <Button
                onClick={sincronizar}
                disabled={sincronizando || !dataInicio || !dataFim || conexaoOk === false}
                className="min-w-40"
              >
                {sincronizando ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sincronizar
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultado da Sincronização */}
      {resultado && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {resultado.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>Resultado da Sincronização</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {resultado.success ? (
              <div className="space-y-4">
                {/* Resumo */}
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    {resultado.message}
                  </AlertDescription>
                </Alert>

                {/* Estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {resultado.resumo?.total_notas || 0}
                    </div>
                    <div className="text-sm text-blue-700">Total de Notas</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {resultado.resumo?.sucessos || 0}
                    </div>
                    <div className="text-sm text-green-700">Sucessos</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {resultado.resumo?.erros || 0}
                    </div>
                    <div className="text-sm text-red-700">Erros</div>
                  </div>
                </div>

                {/* Detalhes */}
                {resultado.detalhes && resultado.detalhes.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900">Detalhes por Nota:</h3>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {resultado.detalhes.map((detalhe, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex items-center space-x-3">
                            {detalhe.resultado.success ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <div>
                              <div className="font-medium text-sm">
                                NF {detalhe.numero}
                              </div>
                              <div className="text-xs text-gray-500">
                                {detalhe.chave_acesso?.substring(0, 16)}...
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {detalhe.resultado.success ? (
                              <Badge className={getOperationColor(detalhe.resultado.tipo_operacao)}>
                                {getOperationLabel(detalhe.resultado.tipo_operacao)}
                              </Badge>
                            ) : (
                              <div className="text-xs text-red-600">
                                {detalhe.resultado.error}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  Erro na sincronização: {resultado.error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle>Instruções</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Teste a conexão antes de iniciar a sincronização</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Defina um período específico para evitar sobrecarga na API</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>A sincronização pode demorar alguns minutos dependendo da quantidade de notas</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Notas já processadas (mesma chave de acesso) são ignoradas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

