import { CardSiteSecondary } from '../../cards/card-site-secondary'
import './style.css'
import forbes_logo from '../../../assets/images/home/forbes_logo.svg'
import icone_botao_seta from '../../../assets/images/home/icone_botao_seta.svg'
import icon_ball from '../../../assets/images/home/icon_ball.svg'
import sebrae from '../../../assets/images/home/sebrae.svg'
import hostinger from '../../../assets/images/home/hostinger.svg'
import frd_logo from '../../../assets/images/home/frd_logo.svg'


export const SiteCasesSection = () => {
    return (
        <section className='site_secondary_cards_section'>
            <h1>Estudos de caso</h1>
            <h2>Gigantes globais são unânimes: empresários de qualquer nicho que investem em site vendem mais, crescem mais rápido e perdem menos clientes</h2>
            <div className='container_secondary_cards_site'>
                <CardSiteSecondary
                    imagem={forbes_logo}
                    titulo="MachineLearningProject"
                    icone_seta={icone_botao_seta}
                    texto="Só 5% dos empreendedores têm presença digital coesa. Os outros 95% mantêm perfis fragmentados que prejudicam, em vez de ajudar, o negócio."
                    />

                <CardSiteSecondary
                    imagem={sebrae}
                    titulo="MachineLearningProject"
                    icone_seta={icone_botao_seta}
                    texto="76% dos pequenos negócios têm computador, 98% têm internet, mas só 52% têm site. 2/3 ainda operam em baixa maturidade digital."
                    />
            </div>

            <div className='container_secondary_cards_site'>
                <CardSiteSecondary
                    imagem={hostinger}
                    titulo="MachineLearningProject"
                    icone_seta={icone_botao_seta}
                    texto="79% das empresas melhoraram vendas com chat em tempo real. Mais de 90% dos empresários consideram o site a ferramenta de marketing digital mais eficaz."
                    />

                <CardSiteSecondary
                    imagem={frd_logo}
                    titulo="MachineLearningProject"
                    icone_seta={icone_botao_seta}
                    texto="80% dos consumidores pesquisam online antes de comprar. Mas apenas 30% dos pequenos empresários se consideram maduros digitalmente."
                    />
            </div>

        </section>
    )
}