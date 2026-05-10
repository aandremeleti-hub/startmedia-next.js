import './style.css'
import ia_icon from '../../../assets/images/home/ia_icon.svg'
import Image from 'next/image'

export const IaMainSection = () => {
    return (
        <section>
            <section className='container-ia-main-section'>
                <div className="content_ia_main_section">
                    <div className="container_title_main_section_ia">
                        <h1>ATENDIMENTO COM IA</h1>
                        <p>Seu negócio atendendo clientes 24h. Sem contratar mais ninguém.</p>
                    </div>
                    <Image src={ia_icon} alt="Atendimento com IA" priority />
                    <h2>Imagine um atendente que nunca tira férias, responde na hora certa, sabe tudo sobre o seu negócio e ainda qualifica o cliente antes de você entrar na conversa. É exatamente isso que a IA da STARTMEDIA faz — no WhatsApp e Instagram, todos os dias, o tempo todo.

</h2>
                </div>
            </section>
        </section>
    )
}