"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Trophy, BarChart3, RefreshCw, Users, DollarSign, Sparkles, TrendingUp, Clock, Star, ExternalLink } from 'lucide-react'

// Mapeamento correto dos nomes das loterias
const NOMES_LOTERIAS: { [key: string]: string } = {
  megasena: "Mega-Sena",
  quina: "Quina",
  lotofacil: "Lotofácil",
  lotomania: "Lotomania",
  duplasena: "Dupla Sena",
  timemania: "Timemania",
  diadesorte: "Dia de Sorte",
}

// Cores e gradientes para cada loteria
const CORES_LOTERIAS: { [key: string]: { bg: string; gradient: string; accent: string } } = {
  megasena: {
    bg: "bg-emerald-500",
    gradient: "from-emerald-400 to-teal-600",
    accent: "border-emerald-400/50 bg-emerald-500/10",
  },
  quina: {
    bg: "bg-violet-500",
    gradient: "from-violet-400 to-purple-600",
    accent: "border-violet-400/50 bg-violet-500/10",
  },
  lotofacil: {
    bg: "bg-rose-500",
    gradient: "from-rose-400 to-pink-600",
    accent: "border-rose-400/50 bg-rose-500/10",
  },
  lotomania: {
    bg: "bg-amber-500",
    gradient: "from-amber-400 to-orange-600",
    accent: "border-amber-400/50 bg-amber-500/10",
  },
  duplasena: {
    bg: "bg-sky-500",
    gradient: "from-sky-400 to-blue-600",
    accent: "border-sky-400/50 bg-sky-500/10",
  },
  timemania: {
    bg: "bg-red-500",
    gradient: "from-red-400 to-rose-600",
    accent: "border-red-400/50 bg-red-500/10",
  },
  diadesorte: {
    bg: "bg-yellow-500",
    gradient: "from-yellow-400 to-amber-600",
    accent: "border-yellow-400/50 bg-yellow-500/10",
  },
}

interface Premiacao {
  descricao: string
  faixa: number
  ganhadores: number
  valorPremio: number
}

interface LoteriaData {
  nome: string
  concurso: string
  data: string
  numeros: string[]
  premio: string
  ganhadores: number
  cor: { bg: string; gradient: string; accent: string }
  dataProximoConcurso: string
  valorArrecadado: string
  acumulou: boolean
  valorAcumulado?: string
  premiacoes: Premiacao[] // Adicionado campo de premiações
}

export default function Component() {
  const [loading, setLoading] = useState(false)
  const [loteriasData, setLoteriasData] = useState<{ [key: string]: LoteriaData }>({})
  const [error, setError] = useState<string | null>(null)

  // Função para formatar data brasileira
  const formatarData = (dataString: string): string => {
    if (!dataString) return "Data não disponível"

    try {
      let data: Date

      if (dataString.includes("/")) {
        const [dia, mes, ano] = dataString.split("/")
        data = new Date(Number.parseInt(ano), Number.parseInt(mes) - 1, Number.parseInt(dia))
      } else if (dataString.includes("-")) {
        data = new Date(dataString)
      } else {
        data = new Date(dataString)
      }

      if (isNaN(data.getTime())) {
        return "Data inválida"
      }

      return data.toLocaleDateString("pt-BR")
    } catch (error) {
      console.error("Erro ao formatar data:", error)
      return "Data inválida"
    }
  }

  // Função para formatar valores monetários
  const formatarValor = (valor: any): string => {
    if (valor === null || valor === undefined || valor === 0) return "Não informado"

    const numero = typeof valor === "string" ? Number.parseFloat(valor) : valor
    if (isNaN(numero)) return "Não informado"

    return `R$ ${numero.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  // Função para buscar ganhadores corretamente (agora prioriza premiacoes[0])
  const buscarGanhadores = (ganhadoresApi: any[], premiacoesApi: Premiacao[]): number => {
    if (premiacoesApi && premiacoesApi.length > 0) {
      return premiacoesApi[0].ganhadores || 0
    }
    if (ganhadoresApi && Array.isArray(ganhadoresApi)) {
      const primeiraFaixa = ganhadoresApi.find(
        (g) =>
          g.faixa === 1 ||
          g.descricao?.toLowerCase().includes("sena") ||
          g.descricao?.toLowerCase().includes("quina") ||
          g.descricao?.toLowerCase().includes("15 acertos") ||
          g.descricao?.toLowerCase().includes("20 acertos"),
      )
      return primeiraFaixa?.quantidade || 0
    }
    return 0
  }

  // Função para buscar dados de uma loteria específica
  const fetchLoteria = async (nome: string): Promise<LoteriaData | null> => {
    try {
      const response = await fetch(`https://loteriascaixa-api.herokuapp.com/api/${nome}/latest`)
      if (!response.ok) {
        throw new Error(`Erro ao buscar ${nome}: ${response.status}`)
      }

      const data = await response.json()

      const corData = CORES_LOTERIAS[nome] || {
        bg: "bg-blue-500",
        gradient: "from-blue-400 to-blue-600",
        accent: "border-blue-400/50 bg-blue-500/10",
      }

      return {
        nome: NOMES_LOTERIAS[nome] || nome.charAt(0).toUpperCase() + nome.slice(1),
        concurso: data.concurso?.toString() || "N/A",
        data: formatarData(data.data),
        numeros: data.dezenas || [],
        premio: formatarValor(data.valorEstimadoProximoConcurso),
        ganhadores: buscarGanhadores(data.ganhadores, data.premiacoes),
        cor: corData,
        dataProximoConcurso: formatarData(data.dataProximoConcurso),
        valorArrecadado: formatarValor(data.valorArrecadado),
        acumulou: data.acumulou || false,
        valorAcumulado: formatarValor(data.valorAcumulado),
        premiacoes: data.premiacoes || [], // Atribuindo as premiações
      }
    } catch (error) {
      console.error(`Erro ao buscar ${nome}:`, error)
      return null
    }
  }

  // Função para buscar todas as loterias
  const fetchAllLoterias = async () => {
    setLoading(true)
    setError(null)

    try {
      const loterias = ["megasena", "quina", "lotofacil", "lotomania", "duplasena", "timemania", "diadesorte"] // Adicionadas mais loterias
      const results = await Promise.allSettled(loterias.map((loteria) => fetchLoteria(loteria)))

      const newData: { [key: string]: LoteriaData } = {}

      results.forEach((result, index) => {
        const loteria = loterias[index]
        if (result.status === "fulfilled" && result.value) {
          newData[loteria] = result.value
        }
      })

      if (Object.keys(newData).length === 0) {
        setError("Não foi possível carregar nenhuma loteria. Tente novamente.")
      } else {
        setLoteriasData(newData)
        if (Object.keys(newData).length < loterias.length) {
          setError("Algumas loterias não puderam ser carregadas.")
        }
      }
    } catch (error) {
      setError("Erro geral ao carregar os resultados das loterias")
      console.error("Erro geral:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllLoterias()
  }, [])

  const atualizarResultados = () => {
    fetchAllLoterias()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%239C92AC' fillOpacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        ></div>
      </div>

      {/* Header */}
      <header className="relative border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <Star className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                  Dezena Prime
                </h1>
                <p className="text-white/70 font-medium">Resultados oficiais • Tempo real</p>
              </div>
            </div>
            <Button
              onClick={atualizarResultados}
              disabled={loading}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-0"
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Atualizando..." : "Atualizar"}
            </Button>
          </div>
        </div>
      </header>

      <main className="relative container mx-auto px-6 py-12">
        {/* Hero Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-r from-emerald-500/20 to-teal-600/20 backdrop-blur-sm border border-emerald-400/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-6 h-6 text-emerald-400" />
              <span className="text-emerald-400 font-bold">LOTERIAS ATIVAS</span>
            </div>
            <p className="text-3xl font-black text-white">{Object.keys(loteriasData).length}</p>
          </div>
          <div className="bg-gradient-to-r from-violet-500/20 to-purple-600/20 backdrop-blur-sm border border-violet-400/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-violet-400" />
              <span className="text-violet-400 font-bold">ACUMULADAS</span>
            </div>
            <p className="text-3xl font-black text-white">
              {Object.values(loteriasData).filter((l) => l.acumulou).length}
            </p>
          </div>
          <div className="bg-gradient-to-r from-amber-500/20 to-orange-600/20 backdrop-blur-sm border border-amber-400/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-6 h-6 text-amber-400" />
              <span className="text-amber-400 font-bold">ÚLTIMA ATUALIZAÇÃO</span>
            </div>
            <p className="text-lg font-bold text-white">
              {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-400/50 rounded-2xl backdrop-blur-sm">
            <p className="text-red-300 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
              {error}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && Object.keys(loteriasData).length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-ping opacity-20"></div>
              </div>
              <p className="text-white text-xl font-bold mb-2">Carregando resultados...</p>
              <p className="text-white/60">Conectando com a API oficial da Caixa</p>
            </div>
          </div>
        )}

        {/* Results Grid */}
        {Object.keys(loteriasData).length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-3xl font-black text-white">ÚLTIMOS RESULTADOS</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {Object.entries(loteriasData).map(([key, loteria]) => (
                <Card
                  key={key}
                  className="bg-black/40 backdrop-blur-xl border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl rounded-3xl overflow-hidden group"
                >
                  <div className={`h-2 bg-gradient-to-r ${loteria.cor.gradient}`}></div>

                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl font-black text-white flex items-center gap-3">
                          {loteria.nome}
                          {loteria.acumulou && (
                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold animate-bounce">
                              ACUMULOU!
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="text-white/60 font-medium text-base">
                          Concurso {loteria.concurso} • {loteria.data}
                        </CardDescription>
                      </div>
                      <div className={`w-4 h-4 ${loteria.cor.bg} rounded-full animate-pulse shadow-lg`}></div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Números */}
                    <div>
                      <p className="text-white/70 font-bold mb-3 uppercase tracking-wide">Números Sorteados</p>
                      <div className="flex flex-wrap gap-3">
                        {loteria.numeros.map((numero, index) => (
                          <div
                            key={index}
                            className={`w-12 h-12 bg-gradient-to-r ${loteria.cor.gradient} rounded-xl flex items-center justify-center font-black text-white text-lg shadow-lg transform hover:scale-110 transition-transform duration-300 animate-fade-in`}
                            style={{ animationDelay: `${index * 150}ms` }}
                          >
                            {numero.padStart(2, "0")}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Premiações Detalhadas */}
                    {loteria.premiacoes && loteria.premiacoes.length > 0 && (
                      <div>
                        <p className="text-white/70 font-bold mb-3 uppercase tracking-wide flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-yellow-400" />
                          Premiações
                        </p>
                        <div className="space-y-2">
                          {loteria.premiacoes.map((premio, index) => (
                            <div key={index} className="flex justify-between items-center text-sm text-white/80">
                              <span className="font-medium">{premio.descricao}</span>
                              <span className="text-white/60">
                                {premio.ganhadores} ganhador(es) •{" "}
                                <span className="font-bold text-emerald-400">
                                  {formatarValor(premio.valorPremio)}
                                </span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-4 rounded-2xl border ${loteria.cor.accent} backdrop-blur-sm`}>
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-5 h-5 text-emerald-400" />
                          <span className="text-white/70 font-bold text-sm uppercase">
                            {loteria.acumulou ? "Próximo Prêmio" : "Prêmio Estimado"}
                          </span>
                        </div>
                        <p className="text-emerald-400 font-black text-lg">{loteria.premio}</p>
                      </div>

                      <div className={`p-4 rounded-2xl border ${loteria.cor.accent} backdrop-blur-sm`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-5 h-5 text-blue-400" />
                          <span className="text-white/70 font-bold text-sm uppercase">Ganhadores (Faixa Principal)</span>
                        </div>
                        <p className="text-blue-400 font-black text-lg">
                          {loteria.ganhadores === 0 ? "Nenhum" : loteria.ganhadores}
                        </p>
                      </div>
                    </div>

                    {/* Next Draw */}
                    {loteria.dataProximoConcurso && loteria.dataProximoConcurso !== "Data inválida" && (
                      <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-white/60 text-sm">
                          <Clock className="w-4 h-4 inline mr-2" />
                          Próximo sorteio: <span className="font-bold text-white">{loteria.dataProximoConcurso}</span>
                        </p>
                      </div>
                    )}

                    {/* CTA Button */}
                    <Button
                      asChild
                      className={`w-full bg-gradient-to-r ${loteria.cor.gradient} hover:from-white hover:to-white hover:text-black text-white font-bold py-3 rounded-xl shadow-lg transition-all duration-300`}
                    >
                      <a href="https://www.investloto.com.br" target="_blank" rel="noopener noreferrer">
                        Apostar Agora <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Statistics Section */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-violet-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-3xl font-black text-white">ESTATÍSTICAS DETALHADAS</h2>
          </div>

          <Tabs defaultValue="megasena" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-2">
              {Object.entries(loteriasData).map(([key, loteria]) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className={`data-[state=active]:bg-gradient-to-r data-[state=active]:${loteria.cor.gradient} data-[state=active]:text-white font-bold rounded-xl transition-all duration-300`}
                >
                  {loteria.nome}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(loteriasData).map(([key, loteria]) => (
              <TabsContent key={key} value={key} className="mt-8">
                <Card className="bg-black/40 backdrop-blur-xl border-white/10 rounded-3xl overflow-hidden">
                  <div className={`h-1 bg-gradient-to-r ${loteria.cor.gradient}`}></div>

                  <CardHeader>
                    <CardTitle className="text-2xl font-black text-white flex items-center gap-3">
                      <div
                        className={`w-10 h-10 bg-gradient-to-r ${loteria.cor.gradient} rounded-xl flex items-center justify-center`}
                      >
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                      Análise da {loteria.nome}
                    </CardTitle>
                    <CardDescription className="text-white/60 text-lg">
                      Dados completos do último sorteio oficial
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-8">
                    {/* Current Result */}
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                      <h4 className="font-black text-white mb-4 flex items-center gap-2 text-lg">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        RESULTADO ATUAL
                      </h4>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <p className="text-white/70 font-bold mb-3 uppercase tracking-wide">Números Sorteados</p>
                          <div className="flex flex-wrap gap-2">
                            {loteria.numeros.map((numero, index) => (
                              <div
                                key={index}
                                className={`w-10 h-10 bg-gradient-to-r ${loteria.cor.gradient} rounded-lg flex items-center justify-center font-bold text-white`}
                              >
                                {numero.padStart(2, "0")}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                            <span className="text-white/70 font-bold">Concurso</span>
                            <span className="text-white font-black">{loteria.concurso}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                            <span className="text-white/70 font-bold">Data</span>
                            <span className="text-white font-black">{loteria.data}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                            <span className="text-white/70 font-bold">Ganhadores (Faixa Principal)</span>
                            <span className="text-blue-400 font-black">
                              {loteria.ganhadores === 0 ? "Nenhum" : loteria.ganhadores}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                            <span className="text-white/70 font-bold">Prêmio Estimado</span>
                            <span className="text-emerald-400 font-black">{loteria.premio}</span>
                          </div>
                          {loteria.acumulou && (
                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                              <span className="text-white/70 font-bold">Status</span>
                              <Badge className="bg-yellow-600 text-xs">ACUMULOU</Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Detailed Prizes */}
                    {loteria.premiacoes && loteria.premiacoes.length > 0 && (
                      <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                        <h4 className="font-black text-white mb-4 flex items-center gap-2 text-lg">
                          <DollarSign className="w-5 h-5 text-emerald-400" />
                          DETALHES DAS PREMIAÇÕES
                        </h4>
                        <div className="space-y-3">
                          {loteria.premiacoes.map((premio, index) => (
                            <div key={index} className="p-3 bg-white/10 rounded-lg flex justify-between items-center">
                              <div className="flex flex-col">
                                <span className="font-semibold text-white">{premio.descricao}</span>
                                <span className="text-sm text-white/70">
                                  {premio.ganhadores} ganhador(es)
                                </span>
                              </div>
                              <span className="font-bold text-emerald-400 text-lg">
                                {formatarValor(premio.valorPremio)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Next Draw Info */}
                    {loteria.dataProximoConcurso && loteria.dataProximoConcurso !== "Data inválida" && (
                      <div className={`p-6 rounded-2xl border ${loteria.cor.accent} backdrop-blur-sm`}>
                        <h4 className="font-black text-white mb-3 flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          PRÓXIMO SORTEIO
                        </h4>
                        <p className="text-white/80 text-lg">
                          <span className="font-bold">{loteria.dataProximoConcurso}</span>
                        </p>
                      </div>
                    )}

                    {/* CTA Button for detailed view */}
                    <Button
                      asChild
                      className={`w-full bg-gradient-to-r ${loteria.cor.gradient} hover:from-white hover:to-white hover:text-black text-white font-bold py-3 rounded-xl shadow-lg transition-all duration-300`}
                    >
                      <a href="https://www.investloto.com.br" target="_blank" rel="noopener noreferrer">
                        Apostar na {loteria.nome} <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-white/10 bg-black/20 backdrop-blur-xl mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              <p className="text-white font-bold text-lg">© 2025 DEZENA MÁGICA</p>
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </div>
            <p className="text-white/60 mb-2">Resultados oficiais da Caixa Econômica Federal</p>
            <p className="text-white/40 text-sm">Última atualização: {new Date().toLocaleString("pt-BR")}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
