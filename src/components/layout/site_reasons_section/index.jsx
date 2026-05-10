import './style.css'
import dome_icon from '../../../assets/images/home/dome_icon.svg'
import target_icon from '../../../assets/images/home/target_icon.svg'
import Image from 'next/image'

export const SiteReasonsSection = () => {
    return (
        <section className='container-site-reasons-section'>
            <div className='primary-content-site-reasons-section'>
                <div className='primary-box-site-reasons-section'>
                    <h2>Por que ter um <span className='highlighted-word'>site</span>?</h2>
                    <h3>"Seu site funciona quando você dorme, viaja ou atende outro cliente. Ele é sua presença digital ativa 24 horas, todos os dias, sem pausas.</h3>
                    <p>Sem um site, sua empresa depende de indicações e sorte. Com ele, você aparece no Google, transmite credibilidade antes do primeiro contato e transforma curiosos em clientes. É a diferença entre esperar o telefone tocar e ter uma estrutura que atrai, informa e converte por você o tempo todo.</p>
                </div>
                <Image src={dome_icon} alt="" />
            </div>
            <div className='secondary-content-site-reasons-section'>
                <Image src={target_icon} alt="" />
                <div className='secondary-box-site-reasons-section'>
                    <h2>Por que um site <span className='highlighted-word'>STARTMEDIA</span>?</h2>
                    <h3>Não entregamos apenas páginas bonitas. Criamos estruturas digitais completas que atraem, convencem e convertem clientes reais para o seu negócio.</h3>
                    <p>A STARTMEDIA une design profissional, estratégia de conteúdo e automação em um único projeto. Seu site nasce integrado ao WhatsApp, redes sociais e funil de vendas. Isso significa que cada visitante entra em uma estrutura pensada para converter — não apenas para impressionar visualmente.</p>
                </div>
            </div>
        </section>
    )
}