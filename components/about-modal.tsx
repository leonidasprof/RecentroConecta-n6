"use client"

import { Button } from "@/components/ui/button"
import { X, Facebook, Instagram, Youtube } from "lucide-react"
import Image from "next/image"

interface AboutModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-7xl max-h-[95vh] bg-white rounded-2xl shadow-2xl animate-fade-in overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - same as main page */}
        <header className="header-navy shadow-lg flex-shrink-0">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image src="/images/recentro-logo.png" alt="Recentro" width={45} height={45} className="rounded-lg" />
                <Image
                  src="/images/recentro-conecta-logo.png"
                  alt="Recentro Conecta"
                  width={45}
                  height={45}
                  className="rounded-lg"
                />
                <div>
                  <h1 className="text-xl font-bold text-white">RecentroConecta</h1>
                  <p className="text-white/80 text-xs">Parque de Esculturas Francisco Brennand</p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/10 rounded-full w-10 h-10 p-0 transition-all hover:scale-110"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col md:flex-row">
            {/* Left side: Image */}
            <div className="relative w-full md:w-1/2 h-64 md:h-auto flex-shrink-0">
              <Image
                src="/images/sobre-parque.jpeg"
                alt="Vista aérea do Parque de Esculturas"
                fill
                className="object-cover"
              />
            </div>

            {/* Right side: Content */}
            <div className="w-full md:w-1/2 p-6 md:p-8">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
                Parque de Esculturas Francisco Brennand
              </h2>

              <div className="space-y-4 text-slate-700 leading-relaxed">
                <p>
                  Localizado no Bairro do Recife, diante do Marco Zero, o Parque de Esculturas Francisco Brennand está
                  aberto à visitação de terça a sexta, das 10h às 17h. Nos sábados e domingos, o horário vai das 9h às
                  18h.
                </p>

                <p>
                  Além da Coluna de Cristal com 32 metros de altura, há um conjunto de 87 obras escultóricas de cerâmica
                  e bronze. Cada peça tem significados próprios e todas são bastante recorrentes entre as temáticas
                  trabalhadas pelo artista Francisco Brennand.
                </p>

                <p>
                  O Parque de Esculturas foi inaugurado no ano 2000, por ocasião da virada do milênio, no contexto do
                  projeto Eu Vi o Mundo… Ele Começava no Recife, que inclui também a rosa dos ventos criada pelo artista
                  Cícero Dias para o piso do Marco Zero.
                </p>

                <p>
                  Obras de restauração foram iniciadas em 2021 e concluídas em março de 2024 pela Prefeitura do Recife,
                  com participação da Oficina Francisco Brennand e do escultor Jobson Figueiredo. A disposição original
                  das peças de bronze e cerâmica foi preservada, com o acréscimo de novos elementos de sinalização e
                  informações na entrada junto ao novo píer.
                </p>

                <h3 className="text-xl font-bold text-slate-800 mt-6 mb-3">Simbolismo das Obras</h3>

                <p>
                  Dentro da base da Coluna de Cristal, há uma sala cercada por quatro portões de metal com grades
                  quadriculadas. No teto do espaço interior, há uma cavidade superior, onde é possível ver, pendurado, a
                  escultura do Ovo Primordial, feita por Francisco Brennand em cerâmica.
                </p>

                <p>
                  Para o artista, o ovo é como uma pedra que gera a vida quando é aquecida. Para Brennand, é o símbolo
                  maior da reprodução e da criação. Essa reprodutibilidade representaria a eternidade.
                </p>

                <p>
                  Entre as esculturas de pássaros, diferentes espécies estão no parque, recriadas por Brennand com
                  elementos fantásticos e fabulares. A Fênix, que simboliza o renascimento e a ressurreição, aparece 15
                  vezes no conjunto, retratada com pés humanos.
                </p>

                <h3 className="text-xl font-bold text-slate-800 mt-6 mb-3">Como Chegar</h3>

                <p>
                  Para chegar de barco, é possível utilizar o serviço dos barqueiros do Marco Zero, no Bairro do Recife,
                  ou o catamarã (saída do Cais das Cinco Pontas, consultar horários no instagram @catamarantours).
                </p>

                <p>
                  De carro e bicicleta, o acesso é feito pelo dique de Brasília Teimosa, no final da Avenida Brasília
                  Formosa (Pina).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - same as main page */}
        <footer className="bg-slate-900 text-white flex-shrink-0">
          <div className="px-6 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Image src="/images/recentro-logo.png" alt="Recentro" width={40} height={40} className="rounded-lg" />
                <Image
                  src="/images/prefeitura-recife-logo.png"
                  alt="Prefeitura do Recife"
                  width={40}
                  height={40}
                  className="rounded-lg bg-white p-1"
                />
              </div>

              <div className="text-center">
                <p className="text-sm text-slate-400">© 2025 Recentro - Prefeitura do Recife</p>
              </div>

              <div className="flex gap-3">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-slate-400 hover:text-pink-400 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
