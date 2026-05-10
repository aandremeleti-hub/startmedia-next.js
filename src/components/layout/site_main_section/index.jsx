import './style.css'
import site_icon from '../../../assets/images/home/site_icon.svg'
import Image from 'next/image'


export const SiteMainSection = () => {
    return (
        <section className='container-site-section'>
            <div className="content_site_main_section">
                <div className="container_title_main_section_site">
                    <h1>Site e Landing page</h1>
                    <p>O site que transforma visitantes em clientes reais para o seu negócio.</p>
                </div>
                <Image src={site_icon} alt="Site e Landing page" priority />
                <h2>Seu site é o vendedor que trabalha por você 24 horas por dia. Sem uma estrutura digital profissional, oportunidades escapam em silêncio. Criamos sites e landing pages que atraem, convencem e convertem — com design moderno, linguagem clara e integração completa com seus canais de venda.</h2>
            </div>
        </section>

    )
}