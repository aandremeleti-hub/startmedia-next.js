import "./style.css"
import design_icon from '../../../assets/images/home/design_icon.svg'
import Image from 'next/image'

export const DesignMainSection = () => {
  return (
    <section className="container-design-main-section">
      <div className="content_design_main_section">
        <div className="container_title_main_section_design">
          <h1>DESIGN</h1>
          <p>O impacto visual <br />que posiciona a sua marca como a escolha certa no mercado.</p>
        </div>
        <Image src={design_icon} alt="Ícone de Design Estratégico" priority />
        <h2>A primeira impressão do seu negócio define o valor que <br/>o cliente enxerga. Esqueça apresentações amadoras que afastam vendas. Criamos um design estratégico que eleva sua comunicação, transmite autoridade instantânea e prova a qualidade do seu serviço antes mesmo do primeiro contato.</h2>
      </div>
    </section>
  )
}
