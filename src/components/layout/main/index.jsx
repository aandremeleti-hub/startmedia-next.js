'use client'
import { CardMain } from '../../cards/card-main'
import './style.css'
import iconeBotaoSeta from '../../../assets/images/home/icone_botao_seta.svg'
import primaryImageMain from '../../../assets/images/home/primary_image_main.svg'
import button_card_main from '../../../assets/images/home/button_card_main.svg'
import design_icon from '../../../assets/images/home/design_icon.svg'
import site_icon from '../../../assets/images/home/site_icon.svg'
import ia_icon from '../../../assets/images/home/ia_icon.svg'
import { useModals } from '../../../context/ModalContext'
import Image from 'next/image'

export const Main = () => {
    const { openModal } = useModals();

    return (
        <main>
            <div className='content-main'>
                <div className='box-text-main'>
                    <h1>Transformando gente em <span className='highlighted-word'>cliente</span></h1>
                    <p>Estrutura digital simplificada que traz o cliente até você pronto para comprar</p>
                    <div className='box-button-main'>
                        <Image src={iconeBotaoSeta} alt="" />
                        <button>Contato</button>
                    </div>
                </div>
                <Image src={primaryImageMain} alt="" priority />
            </div>

            <div className='box-cards-main'>
                <CardMain
                    image={design_icon}
                    titulo={<>Design <br /> Estratégico</>}
                    paragrafo="Construa uma marca com autoridade visual imediata. Transmita confiança e destaque-se dos seus concorrentes."
                    image_button={button_card_main}
                    abrirModal={() => openModal('design')} />

                <CardMain
                    image={site_icon}
                    titulo="Sites & Landing Pages"
                    paragrafo="Muito mais que uma vitrine. Criamos o seu vendedor mais eficiente, focado em transformar visitantes em clientes reais."
                    image_button={button_card_main}
                    abrirModal={() => openModal('site')}/>

                <CardMain
                    image={ia_icon}
                    titulo="Atendimento com IA"
                    paragrafo="Não perca vendas por demora. Tenha um assistente inteligente que atende e qualifica seus leads 24 horas por dia."
                    image_button={button_card_main}
                    abrirModal={() => openModal('ia')} />

            </div>
        </main>
    )
}