import { CardIaSecondary } from '../../cards/card-ia-secondary'
import './style.css'
import check_icon from '../../../assets/images/home/check_icon.svg'

export const IaWHySection = () => {
    return (
        <section>
            <div className='content-ia-secondary-cards'>
                <h1 className='title-ia-secondary-cards'>Por que a STARTMEDIA?</h1>
                <div className='container-ia-secondary-cards'>
                    <CardIaSecondary
                        imagem={check_icon}
                        titulo="Personalização"
                        texto="Cada agente é criado do zero para o seu negócio. Nada de respostas genéricas ou robô de prateleira." />
                    <CardIaSecondary
                        imagem={check_icon}
                        titulo="Velocidade"
                        texto="Resposta em segundos, qualquer hora do dia. Enquanto o concorrente dorme, você fecha venda." />
                    <CardIaSecondary
                        imagem={check_icon }
                        titulo="Integração"
                        texto="WhatsApp, Instagram, site e CRM funcionando juntos. Um ecossistema, não peças soltas." />
                    <CardIaSecondary
                        imagem={check_icon }
                        titulo="Escalabilidade"
                        texto="Atende 1 ou 1.000 clientes ao mesmo tempo — sem contratar, sem treinamento, sem limite." />
                </div>
            </div>
        </section>
    )
}