import './style.css'
import design_guga_section_picture from '../../../assets/images/home/design_guga_section_picture.svg'
import design_icon from '../../../assets/images/home/design_icon.svg'
import Image from 'next/image'


export const DesignGugaSection = () => {
    return (
        <section className='design_guga_section'>
            <Image src={design_guga_section_picture} alt="Guga Bacan" />
            <div className='design_guga_section_content'>
                <div className="design-guga-badge">Guga Bacan</div>
                <h1>Design que une arte, <br />técnica e propósito</h1>
                <div className='design_guga_section_item'>
                    <Image src={design_icon} alt="" />
                    <h2>Arte que vende e representa</h2>
                </div>
                <div className='design_guga_section_item'>
                    <Image src={design_icon} alt="" />
                    <h2>Visual único para sua marca</h2>
                </div>
                <p>Criamos identidades visuais que representam a essência do seu negócio com clareza e impacto. Cada arte, post, banner ou catálogo é desenvolvido com atenção aos detalhes e foco no resultado. Nosso processo une estratégia e estética para comunicar sua marca de forma profissional e atrativa. Do tratamento de imagens à edição de vídeos, entregamos conteúdo visual que engaja, converte e fortalece sua presença digital com consistência.</p>
            </div>
        </section>
    )
}