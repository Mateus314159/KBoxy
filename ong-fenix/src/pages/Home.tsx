import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Title, Subtitle, Paragraph } from '@/components/ui/typography'

const teachers = [
  'Wanda Maria de Carvalho (diretora)',
  'Cezar Carvalho de Arruda (diretor e professor de Física Moderna)',
  'Cleber Hilário dos Santos (professor de Química Orgânica e Bioquímica)',
  'Caio César Rossi Cotrim (professor de Biologia 2)',
  'João Vitor da Silva Tavares (professor de Biologia)',
  'Emerson Jean Roberto dos Santos (coordenador e Professor de matemática)',
  'Fernando Sônego de Toledo (professor de Matemática)',
  'Lucas Mariano Maciel-Baqueiro (professor de Literatura)',
  'Luca Bertoli Santos Pinto (professor de História Geral)',
  'João Marcos Agapito Moreira Fróes (professor de Física 3)',
  'Gregorio Duarte (professor de Sociologia)',
  'Lucas Romano Lopez (professor de Filosofia, Sociologia e Geopolítica)',
  'Mariana de Castro (colaboradora)',
  'Paula Salles Goria (coordenadora de Biologia e professora de Biologia 1)',
  'Rafael Sardeli de Oliveira (professor de Físico-Química)',
  'Roberto da Silva Meira Júnior (professor de Física 1 e Redação)',
  'Stéfanie Fares Sabbag (professora de Gramática e Interpretação de Texto)',
  'Thiago Fernandes de Abreu (professor de História do Brasil, América, Ásia e África)',
  'Ariadne Fares Sabbag (colaboradora)',
  'Tatyane Maria Albano (colaboradora)'
]

export default function Home() {
  return (
    <main className="space-y-16">
      <section className="relative h-96 flex items-center justify-center text-center bg-cover bg-center" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1500&q=80)'}}>
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 px-4 text-white space-y-2">
          <Subtitle className="text-primary">A universidade pode ser uma realidade para todos!</Subtitle>
          <Title className="text-3xl md:text-4xl">Na ONG Fênix podemos te ajudar a ingressar na universidade e no curso dos seus sonhos</Title>
        </div>
      </section>

      <section className="container mx-auto px-4 space-y-8" id="quem-somos">
        <Title>Quem Somos</Title>
        <div className="space-y-4">
          <Paragraph>Somos uma organização sem fins lucrativos, com o intuito de ajudar qualquer pessoa a ingressar na universidade ou concurso dos seus sonhos.</Paragraph>
          <Paragraph>Nós assistimos nossa(o) beneficiada(o) desde o início das aulas até o momento da matrícula na universidade onde foi aprovado.</Paragraph>
          <Paragraph>Auxiliamos a(o) aluna(o) no preenchimento de cadastros e entrevistas com assistentes sociais de universidades públicas e particulares.</Paragraph>
        </div>
        <Subtitle>Equipe</Subtitle>
        <ul className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {teachers.map((t) => (
            <li key={t}>
              <Button asChild className="w-full justify-start" >
                <a href="#">{t}</a>
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <section className="container mx-auto px-4 space-y-8" id="historia">
        <Title>História</Title>
        <div className="space-y-4">
          <Paragraph>A ONG Fênix teve início em 2001, quando um grupo de professores decidiu preparar pessoas de baixa renda para os vestibulares e concursos públicos.</Paragraph>
          <Paragraph>Ao longo dos mais de 20 anos de existência, ajudamos jovens a ingressar em diversas e renomadas universidades em todo o Brasil.</Paragraph>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent>
              <Paragraph className="text-lg font-semibold">Média de aprovação: <strong>76,66 %</strong></Paragraph>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Paragraph className="text-lg font-semibold"><strong>323</strong> ingressos de 2001 a 2019, incluindo USP, UNICAMP, UNESP, UFSCar, UEM, institutos federais e particulares (com bolsa parcial ou total).</Paragraph>
            </CardContent>
          </Card>
        </div>
        <Paragraph>Executamos projetos de novos métodos pedagógicos, colaboramos com empresas no treinamento de seus trabalhadores e garantimos o direito à educação, informação e expressão cultural. Nunca tivemos vínculo político, religioso ou com grandes universidades.</Paragraph>
      </section>

      <section className="container mx-auto px-4" id="contato">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <Title>Fale conosco</Title>
            <div className="space-y-2 mt-4">
              <Paragraph>Rua 13 de Maio, 2233<br/>Jardim Brasil<br/>São Carlos, SP 13560-647<br/>Brasil</Paragraph>
              <Paragraph>ongfenixscarlos@gmail.com<br/>(16) 99212-3067</Paragraph>
            </div>
          </div>
          <Card>
            <CardContent>
              <form className="space-y-4">
                <Input placeholder="Nome" required />
                <Input placeholder="Email" type="email" required />
                <Input placeholder="Site" type="url" />
                <Textarea placeholder="Mensagem" rows={5} required />
                <Button type="submit" className="bg-primary hover:bg-yellow-500">Enviar</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
